import { Request, Response, NextFunction } from 'express';
import { db } from '../services/database';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { safePrismaOperation, rawSqlFallbacks } from '../utils/prismaHelper';
import {
  ApiResponse,
  CreateCategoryData,
  UpdateCategoryData,
} from '../types';

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Get all categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Use raw SQL directly to avoid prepared statement conflicts
    console.log('🔄 Using raw SQL for categories to avoid prepared statement conflicts');
    const categories = await rawSqlFallbacks.getCategories();

    const response: ApiResponse = {
      success: true,
      data: categories,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Get single category by ID or slug
export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await db.prisma.category.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: {
        articles: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            imageUrl: true,
            publishedAt: true,
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { publishedAt: 'desc' },
        },
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    });

    if (!category) {
      throw createError('Category not found', 404);
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

// Create new category
export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: CreateCategoryData = req.body;

    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.name);

    // Check if name or slug already exists
    const existingCategory = await db.prisma.category.findFirst({
      where: {
        OR: [
          { name: data.name },
          { slug },
        ],
      },
    });

    if (existingCategory) {
      throw createError('Category with this name or slug already exists', 400);
    }

    // Create category
    const category = await db.prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        color: data.color,
      },
      include: {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' },
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

// Update category
export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data: UpdateCategoryData = req.body;

    // Check if category exists
    const existingCategory = await db.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw createError('Category not found', 404);
    }

    // Generate new slug if name is being updated
    if (data.name && !data.slug) {
      data.slug = generateSlug(data.name);
    }

    // Check if new name or slug conflicts with existing categories
    if (data.name || data.slug) {
      const conflicts = await db.prisma.category.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(data.name ? [{ name: data.name }] : []),
                ...(data.slug ? [{ slug: data.slug }] : []),
              ],
            },
          ],
        },
      });

      if (conflicts) {
        throw createError('Category with this name or slug already exists', 400);
      }
    }

    // Update category
    const category = await db.prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' },
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

// Delete category (soft delete by setting isActive to false)
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await db.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw createError('Category not found', 404);
    }

    // Check if category has published articles
    const articleCount = await db.prisma.article.count({
      where: { categoryId: id, status: 'PUBLISHED' },
    });

    if (articleCount > 0) {
      // Soft delete - set isActive to false
      await db.prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      // Hard delete if no published articles
      await db.prisma.category.delete({
        where: { id },
      });
    }

    const response: ApiResponse = {
      success: true,
      data: { message: 'Category deleted successfully' },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
