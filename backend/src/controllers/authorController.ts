import { Request, Response, NextFunction } from 'express';
import { db } from '../services/database';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { safePrismaOperation, rawSqlFallbacks } from '../utils/prismaHelper';
import {
  ApiResponse,
  CreateAuthorData,
  UpdateAuthorData,
  PaginationParams,
  PaginationMeta,
} from '../types';

// Get all authors with pagination
export const getAuthors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
    } = req.query as any;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause - allow admin to see all authors
    const includeInactive = req.query.includeInactive === 'true';
    const where: any = includeInactive ? {} : { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Use raw SQL directly to avoid prepared statement conflicts
    console.log('🔄 Using raw SQL for authors to avoid prepared statement conflicts');
    const total = await rawSqlFallbacks.countAuthors(includeInactive);
    const authors = await rawSqlFallbacks.getAuthors(skip, take, sortBy, sortOrder, includeInactive);

    const totalPages = Math.ceil(total / take);
    const meta: PaginationMeta = {
      total,
      page: parseInt(page),
      limit: take,
      totalPages,
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1,
    };

    const response: ApiResponse = {
      success: true,
      data: authors,
      meta,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Get single author by ID
export const getAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Use safePrismaOperation to handle potential prepared statement conflicts
    const author = await safePrismaOperation(
      async () => {
        return await db.prisma.author.findUnique({
          where: { id },
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
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
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
      },
      async (client) => {
        return await client.author.findUnique({
          where: { id },
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
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
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
      }
    );

    if (!author) {
      throw createError('Author not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: author,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Create new author
export const createAuthor = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: CreateAuthorData = req.body;

    // Check if email already exists (if provided)
    if (data.email) {
      const existingAuthor = await db.prisma.author.findUnique({
        where: { email: data.email },
      });

      if (existingAuthor) {
        throw createError('Author with this email already exists', 400);
      }
    }

    // Create author
    const author = await db.prisma.author.create({
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
      data: author,
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Update author
export const updateAuthor = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data: UpdateAuthorData = req.body;

    // Check if author exists
    const existingAuthor = await db.prisma.author.findUnique({
      where: { id },
    });

    if (!existingAuthor) {
      throw createError('Author not found', 404);
    }

    // Check if new email conflicts with existing authors
    if (data.email && data.email !== existingAuthor.email) {
      const emailConflict = await db.prisma.author.findUnique({
        where: { email: data.email },
      });

      if (emailConflict) {
        throw createError('Author with this email already exists', 400);
      }
    }

    // Update author
    const author = await db.prisma.author.update({
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
      data: author,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Delete author (soft delete by setting isActive to false)
export const deleteAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if author exists
    const existingAuthor = await db.prisma.author.findUnique({
      where: { id },
    });

    if (!existingAuthor) {
      throw createError('Author not found', 404);
    }

    // Check if author has published articles
    const articleCount = await db.prisma.article.count({
      where: { authorId: id, status: 'PUBLISHED' },
    });

    if (articleCount > 0) {
      // Soft delete - set isActive to false
      await db.prisma.author.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      // Hard delete if no published articles
      await db.prisma.author.delete({
        where: { id },
      });
    }

    const response: ApiResponse = {
      success: true,
      data: { message: 'Author deleted successfully' },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
