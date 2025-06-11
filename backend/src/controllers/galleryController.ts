import { Request, Response, NextFunction } from 'express';
import { db } from '../services/database';
import { MockDataService } from '../services/mockDataService';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse, PaginationMeta } from '../types';

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

interface CreateGalleryItemData {
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  categoryId?: string;
  photographer?: string;
  dateTaken?: string;
  location?: string;
  tags?: string[];
  stackGroup?: string;
  stackOrder?: number;
  isStackCover?: boolean;
}

interface UpdateGalleryItemData extends Partial<CreateGalleryItemData> {
  isActive?: boolean;
}

// Get all gallery items with pagination and filtering
export const getGalleryItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
    const categoryId = req.query.categoryId as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    try {
      // Try database first
      const where: any = {
        isActive: true,
      };

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { photographer: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get total count
      const total = await db.prisma.galleryItem.count({ where });

      // Get gallery items
      const galleryItems = await db.prisma.galleryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      const totalPages = Math.ceil(total / limit);
      const meta: PaginationMeta = {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };

      // If no data from database, use mock data
      if (galleryItems.length === 0 && total === 0) {
        console.log('No gallery items in database, using mock data');
        const mockGalleryItems = MockDataService.getGalleryItems();

        const mockTotal = mockGalleryItems.length;
        const paginatedMockItems = mockGalleryItems.slice(skip, skip + limit);
        const mockTotalPages = Math.ceil(mockTotal / limit);

        const mockMeta: PaginationMeta = {
          total: mockTotal,
          page,
          limit,
          totalPages: mockTotalPages,
          hasNext: page < mockTotalPages,
          hasPrev: page > 1,
        };

        const mockResponse: ApiResponse = {
          success: true,
          data: paginatedMockItems,
          meta: mockMeta,
          timestamp: new Date().toISOString(),
        };

        res.json(mockResponse);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: galleryItems,
        meta,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (dbError) {
      // Fallback to mock data
      console.log('Database failed, using mock data for gallery items');
      const mockGalleryItems = MockDataService.getGalleryItems();

      // Apply basic filtering
      let filteredItems = mockGalleryItems;
      if (search) {
        filteredItems = mockGalleryItems.filter(item =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
        );
      }

      const total = filteredItems.length;
      const paginatedItems = filteredItems.slice(skip, skip + limit);
      const totalPages = Math.ceil(total / limit);

      const meta: PaginationMeta = {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };

      const response: ApiResponse = {
        success: true,
        data: paginatedItems,
        meta,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    }
  } catch (error) {
    next(error);
  }
};

// Get single gallery item by ID
export const getGalleryItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const galleryItem = await db.prisma.galleryItem.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!galleryItem) {
      throw createError('Gallery item not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: galleryItem,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Create new gallery item
export const createGalleryItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: CreateGalleryItemData = req.body;

    // Create gallery item
    const galleryItem = await db.prisma.galleryItem.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl,
        categoryId: data.categoryId,
        photographer: data.photographer,
        dateTaken: data.dateTaken ? new Date(data.dateTaken) : undefined,
        location: data.location,
        stackGroup: data.stackGroup,
        stackOrder: data.stackOrder || 0,
        isStackCover: data.isStackCover || false,
        createdBy: req.user!.id,
        tags: data.tags
          ? {
              connectOrCreate: data.tags.map((tagName) => ({
                where: { name: tagName },
                create: {
                  name: tagName,
                  slug: generateSlug(tagName),
                },
              })),
            }
          : undefined,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: galleryItem,
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Update gallery item
export const updateGalleryItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data: UpdateGalleryItemData = req.body;

    // Check if gallery item exists
    const existingItem = await db.prisma.galleryItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw createError('Gallery item not found', 404);
    }

    // Update gallery item
    const galleryItem = await db.prisma.galleryItem.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl,
        categoryId: data.categoryId,
        photographer: data.photographer,
        dateTaken: data.dateTaken ? new Date(data.dateTaken) : undefined,
        location: data.location,
        stackGroup: data.stackGroup,
        stackOrder: data.stackOrder,
        isStackCover: data.isStackCover,
        isActive: data.isActive,
        tags: data.tags
          ? {
              set: [],
              connectOrCreate: data.tags.map((tagName) => ({
                where: { name: tagName },
                create: {
                  name: tagName,
                  slug: generateSlug(tagName),
                },
              })),
            }
          : undefined,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: galleryItem,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Delete gallery item
export const deleteGalleryItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if gallery item exists
    const existingItem = await db.prisma.galleryItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw createError('Gallery item not found', 404);
    }

    // Soft delete by setting isActive to false
    await db.prisma.galleryItem.update({
      where: { id },
      data: { isActive: false },
    });

    const response: ApiResponse = {
      success: true,
      data: { message: 'Gallery item deleted successfully' },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
