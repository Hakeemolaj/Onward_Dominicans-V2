import { Request, Response, NextFunction } from 'express';
import { ApiResponse, PaginationMeta } from '../types';
import { createError } from '../middleware/errorHandler';

/**
 * Base controller class with common functionality
 * Reduces repetitive code across controllers
 */
export abstract class BaseController {
  /**
   * Standard success response helper
   */
  protected sendSuccess<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    meta?: PaginationMeta
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      ...(meta && { meta })
    };

    res.status(statusCode).json(response);
  }

  /**
   * Standard error response helper
   */
  protected sendError(
    res: Response,
    message: string,
    statusCode: number = 500,
    details?: any
  ): void {
    const response: ApiResponse = {
      success: false,
      error: {
        message,
        ...(details && { details })
      },
      timestamp: new Date().toISOString()
    };

    res.status(statusCode).json(response);
  }

  /**
   * Async handler wrapper to catch errors automatically
   */
  protected asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
  ) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  /**
   * Database operation with fallback pattern
   */
  protected async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    operationName: string = 'operation'
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error) {
      console.warn(`Primary ${operationName} failed, using fallback:`, error);
      return await fallbackOperation();
    }
  }

  /**
   * Pagination helper
   */
  protected getPaginationParams(query: any): {
    skip: number;
    take: number;
    page: number;
    limit: number;
  } {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    return { skip, take: limit, page, limit };
  }

  /**
   * Create pagination metadata
   */
  protected createPaginationMeta(
    total: number,
    page: number,
    limit: number
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: any, fields: string[]): void {
    const missing = fields.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw createError(
        `Missing required fields: ${missing.join(', ')}`,
        400
      );
    }
  }

  /**
   * Generate slug from string
   */
  protected generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Parse sort parameters
   */
  protected parseSortParams(query: any): {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  } {
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    return { sortBy, sortOrder };
  }

  /**
   * Build where clause for search
   */
  protected buildSearchWhere(searchTerm: string, searchFields: string[]): any {
    if (!searchTerm) return {};

    return {
      OR: searchFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }))
    };
  }

  /**
   * Standard include for related data
   */
  protected getStandardInclude(): any {
    return {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          bio: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true
        }
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    };
  }

  /**
   * Validate UUID format
   */
  protected isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Safe JSON parse
   */
  protected safeJsonParse<T>(jsonString: string, defaultValue: T): T {
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Rate limiting check (basic implementation)
   */
  protected checkRateLimit(req: Request, maxRequests: number = 100): boolean {
    // This is a basic implementation - in production you'd use Redis or similar
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    // In a real implementation, you'd store this in Redis or a cache
    // For now, this is just a placeholder
    return true;
  }

  /**
   * Log operation for debugging
   */
  protected logOperation(operation: string, data?: any): void {
    console.log(`[${new Date().toISOString()}] ${operation}`, data ? JSON.stringify(data, null, 2) : '');
  }
}
