import { Request, Response, NextFunction } from 'express';
import { db } from '../services/database';
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

interface CreateGalleryCategoryData {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
}

interface UpdateGalleryCategoryData extends Partial<CreateGalleryCategoryData> {
  isActive?: boolean;
}

// Get all gallery categories with pagination
export const getGalleryCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const sortBy = (req.query.sortBy as string) || 'name';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

    const skip = (page - 1) * limit;

    // Get total count
    const total = await db.prisma.galleryCategory.count({
      where: { isActive: true },
    });

    // Get gallery categories
    const categories = await db.prisma.galleryCategory.findMany({
      where: { isActive: true },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            galleryItems: {
              where: { isActive: true },
            },
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

    const response: ApiResponse = {
      success: true,
      data: categories,
      meta,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Get single gallery category by ID
export const getGalleryCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await db.prisma.galleryCategory.findUnique({
      where: { id },
      include: {
        galleryItems: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            imageUrl: true,
            thumbnailUrl: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            galleryItems: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!category) {
      throw createError('Gallery category not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: category,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Create new gallery category
export const createGalleryCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: CreateGalleryCategoryData = req.body;

    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.name);

    // Check if slug already exists
    const existingCategory = await db.prisma.galleryCategory.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw createError('Gallery category with this slug already exists', 400);
    }

    // Create gallery category
    const category = await db.prisma.galleryCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        color: data.color,
      },
      include: {
        _count: {
          select: {
            galleryItems: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: category,
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Update gallery category
export const updateGalleryCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data: UpdateGalleryCategoryData = req.body;

    // Check if category exists
    const existingCategory = await db.prisma.galleryCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw createError('Gallery category not found', 404);
    }

    // Generate slug if name is being updated
    let slug = data.slug;
    if (data.name && !data.slug) {
      slug = generateSlug(data.name);
    }

    // Check if new slug conflicts with existing categories
    if (slug && slug !== existingCategory.slug) {
      const slugConflict = await db.prisma.galleryCategory.findUnique({
        where: { slug },
      });

      if (slugConflict) {
        throw createError('Gallery category with this slug already exists', 400);
      }
    }

    // Update gallery category
    const category = await db.prisma.galleryCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        color: data.color,
        isActive: data.isActive,
      },
      include: {
        _count: {
          select: {
            galleryItems: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: category,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Delete gallery category
export const deleteGalleryCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await db.prisma.galleryCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            galleryItems: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!existingCategory) {
      throw createError('Gallery category not found', 404);
    }

    // Check if category has active gallery items
    if (existingCategory._count.galleryItems > 0) {
      throw createError('Cannot delete category with active gallery items', 400);
    }

    // Soft delete by setting isActive to false
    await db.prisma.galleryCategory.update({
      where: { id },
      data: { isActive: false },
    });

    const response: ApiResponse = {
      success: true,
      data: { message: 'Gallery category deleted successfully' },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
