import { Request } from 'express';

// Re-export Prisma types
export * from '@prisma/client';

// Express types
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  timestamp: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Article types
export interface CreateArticleData {
  title: string;
  slug?: string;
  summary: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  categoryId?: string;
  tags?: string[];
  status?: 'DRAFT' | 'PUBLISHED';
  publishedAt?: Date;
}

export interface UpdateArticleData {
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  authorId?: string;
  categoryId?: string;
  tags?: string[];
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: Date;
}

export interface ArticleFilters {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  authorId?: string;
  categoryId?: string;
  tags?: string[];
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Author types
export interface CreateAuthorData {
  name: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateAuthorData {
  name?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

// Category types
export interface CreateCategoryData {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

// User types
export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'VIEWER';
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'VIEWER';
  isActive?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role: string;
  };
  token: string;
  expiresIn: string;
}
