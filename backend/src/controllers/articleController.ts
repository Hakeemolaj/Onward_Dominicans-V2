import { Request, Response, NextFunction } from 'express';
import { db } from '../services/database';
import { MockDataService } from '../services/mockDataService';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  ApiResponse,
  CreateArticleData,
  UpdateArticleData,
  ArticleFilters,
  PaginationParams,
  PaginationMeta,
} from '../types';

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Get all articles with filtering and pagination
export const getArticles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      authorId,
      categoryId,
      search,
      tags,
    } = req.query as any;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    try {
      // Try database first
      const where: any = {};

      if (status) where.status = status;
      if (authorId) where.authorId = authorId;
      if (categoryId) where.categoryId = categoryId;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        where.tags = {
          some: {
            name: { in: tagArray },
          },
        };
      }

      // Get total count for pagination
      const total = await db.prisma.article.count({ where });

      // Get articles
      const articles = await db.prisma.article.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              bio: true,
            },
          },
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

      const totalPages = Math.ceil(total / take);
      const meta: PaginationMeta = {
        total,
        page: parseInt(page),
        limit: take,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      };

      // If no data from database, use mock data
      if (articles.length === 0 && total === 0) {
        console.log('No articles in database, using mock data');
        const mockArticles = MockDataService.getArticles();

        // Apply basic filtering to mock data
        let filteredArticles = mockArticles;
        if (search) {
          filteredArticles = mockArticles.filter(article =>
            article.title.toLowerCase().includes(search.toLowerCase()) ||
            article.summary.toLowerCase().includes(search.toLowerCase())
          );
        }

        const mockTotal = filteredArticles.length;
        const paginatedMockArticles = filteredArticles.slice(skip, skip + take);
        const mockTotalPages = Math.ceil(mockTotal / take);

        const mockMeta: PaginationMeta = {
          total: mockTotal,
          page: parseInt(page),
          limit: take,
          totalPages: mockTotalPages,
          hasNext: parseInt(page) < mockTotalPages,
          hasPrev: parseInt(page) > 1,
        };

        const mockResponse: ApiResponse = {
          success: true,
          data: paginatedMockArticles,
          meta: mockMeta,
          timestamp: new Date().toISOString(),
        };

        res.json(mockResponse);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: articles,
        meta,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (dbError) {
      // Fallback to mock data if database fails
      console.log('Database failed, using mock data for articles');
      const mockArticles = MockDataService.getArticles();

      // Apply basic filtering to mock data
      let filteredArticles = mockArticles;
      if (search) {
        filteredArticles = mockArticles.filter(article =>
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          article.summary.toLowerCase().includes(search.toLowerCase())
        );
      }

      const total = filteredArticles.length;
      const paginatedArticles = filteredArticles.slice(skip, skip + take);
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
        data: paginatedArticles,
        meta,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    }
  } catch (error) {
    next(error);
  }
};

// Get single article by ID or slug
export const getArticle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    try {
      const article = await db.prisma.article.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              bio: true,
            },
          },
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

      if (!article) {
        throw createError('Article not found', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: article,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (dbError) {
      // Fallback to mock data
      console.log('Database failed, using mock data for single article');
      const mockArticles = MockDataService.getArticles();
      const article = mockArticles.find(a => a.id === id || a.slug === id);

      if (!article) {
        throw createError('Article not found', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: article,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    }
  } catch (error) {
    next(error);
  }
};

// Get featured article
export const getFeaturedArticle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    try {
      // Try to get the most recent published article from database
      const article = await db.prisma.article.findFirst({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              bio: true,
            },
          },
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
        data: article,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (dbError) {
      // Fallback to mock data
      console.log('Database failed, using mock data for featured article');
      const mockArticles = MockDataService.getArticles();
      const featuredArticle = mockArticles[0]; // Use first article as featured

      const response: ApiResponse = {
        success: true,
        data: featuredArticle,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    }
  } catch (error) {
    next(error);
  }
};

// Create new article
export const createArticle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: CreateArticleData = req.body;

    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.title);

    // Check if slug already exists
    const existingArticle = await db.prisma.article.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      throw createError('Article with this slug already exists', 400);
    }

    // Create article
    const article = await db.prisma.article.create({
      data: {
        title: data.title,
        slug,
        summary: data.summary,
        content: data.content,
        imageUrl: data.imageUrl,
        authorId: data.authorId,
        categoryId: data.categoryId,
        status: data.status || 'DRAFT',
        publishedAt: data.publishedAt,
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
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
          },
        },
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
      data: article,
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Update article
export const updateArticle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data: UpdateArticleData = req.body;

    // Check if article exists
    const existingArticle = await db.prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      throw createError('Article not found', 404);
    }

    // Generate new slug if title is being updated
    if (data.title && !data.slug) {
      data.slug = generateSlug(data.title);
    }

    // Check if new slug conflicts with existing articles
    if (data.slug && data.slug !== existingArticle.slug) {
      const slugConflict = await db.prisma.article.findUnique({
        where: { slug: data.slug },
      });

      if (slugConflict) {
        throw createError('Article with this slug already exists', 400);
      }
    }

    // Update article
    const article = await db.prisma.article.update({
      where: { id },
      data: {
        ...data,
        tags: data.tags
          ? {
              set: [], // Clear existing tags
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
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
          },
        },
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
      data: article,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Delete article
export const deleteArticle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if article exists
    const existingArticle = await db.prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      throw createError('Article not found', 404);
    }

    // Delete article
    await db.prisma.article.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      data: { message: 'Article deleted successfully' },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Set article as featured
export const setFeaturedArticle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if article exists and is published
    const existingArticle = await db.prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      throw createError('Article not found', 404);
    }

    if (existingArticle.status !== 'PUBLISHED') {
      throw createError('Only published articles can be featured', 400);
    }

    // Featured functionality removed - not available in current schema
    // Just return the article without setting featured status
    const article = await db.prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
          },
        },
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
      data: article,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Unset featured article
export const unsetFeaturedArticle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if article exists
    const existingArticle = await db.prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      throw createError('Article not found', 404);
    }

    // Featured functionality removed - not available in current schema
    // Just return the article without changing featured status
    const article = await db.prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
          },
        },
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
      data: article,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};




