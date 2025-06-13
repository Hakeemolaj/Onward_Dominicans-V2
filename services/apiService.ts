// API Service for backend integration
// This service provides methods to interact with the backend API or Supabase

import { supabaseService } from './supabaseService';
import { config } from '../config';

// Configuration constants
const CONFIG = {
  CACHE_DURATION: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  REQUEST_TIMEOUT: 10000, // 10 seconds
} as const;

// Auto-detect API base URL based on current hostname
const getApiBaseUrl = (): string => {
  // Check for environment variable (compatible with both Vite and Next.js)
  const envApiUrl = (typeof process !== 'undefined' && process.env?.VITE_API_URL) ||
                   (typeof window !== 'undefined' && (window as any).__ENV__?.VITE_API_URL);

  if (envApiUrl) {
    return envApiUrl;
  }

  if (typeof window === 'undefined') {
    return 'https://onward-dominicans-backend-v2.onrender.com/api';
  }

  const currentHost = window.location.hostname;

  // Check if we're in development (localhost)
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }

  // Check if we're on Vercel or production
  if (currentHost.includes('vercel.app') || currentHost.includes('odmailsu') || window.location.protocol === 'https:') {
    return 'https://onward-dominicans-backend-v2.onrender.com/api';
  }

  // Fallback to production backend
  return 'https://onward-dominicans-backend-v2.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

// Use Supabase as fallback when backend is not available
// This ensures the frontend always works even if backend is down
const useSupabase = (): boolean => {
  // For now, use Supabase directly since backend is having issues
  return true; // Use Supabase fallback
};

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
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  timestamp: string;
}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  search?: string;
  authorId?: string;
  categoryId?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Utility functions for better error handling and retry logic
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const isRetryableError = (error: any): boolean => {
  if (!error) return false;

  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) return true;

  // HTTP status codes that should be retried
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  if (error.status && retryableStatusCodes.includes(error.status)) return true;

  return false;
};

const createStandardResponse = <T>(
  success: boolean,
  data?: T,
  error?: string | { message: string; details?: any }
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success,
    timestamp: new Date().toISOString()
  };

  if (success && data !== undefined) {
    response.data = data;
  }

  if (!success && error) {
    response.error = typeof error === 'string'
      ? { message: error }
      : error;
  }

  return response;
};

// Helper function to handle Supabase fallback pattern
const handleSupabaseFallback = async <T>(
  supabaseMethod: () => Promise<any>,
  fallbackMethod: () => Promise<ApiResponse<T>>,
  errorMessage: string = 'Operation failed'
): Promise<ApiResponse<T>> => {
  if (useSupabase()) {
    const result = await supabaseMethod();

    if (result.error) {
      return createStandardResponse<T>(false, undefined, errorMessage);
    }

    return createStandardResponse<T>(true, result.data);
  }

  return fallbackMethod();
};

class ApiService {
  private baseUrl: string;
  private token: string | null = null;
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadToken();
    // Clear any invalid tokens on initialization
    this.validateAndClearToken();
  }

  private loadToken(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private saveToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('auth_token', token);
    }
  }

  private removeToken(): void {
    this.token = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('auth_token');
    }
  }

  private validateAndClearToken(): void {
    // Force clear any existing tokens to prevent 401 errors (only in browser)
    if (typeof window !== 'undefined') {
      console.log('🧹 Force clearing all stored tokens to prevent authentication issues');
      this.removeToken();
      // Also clear any other possible token storage locations
      if (window.localStorage) {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('admin-token');
      }
      if (window.sessionStorage) {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, options, requireAuth);
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = false,
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || 'GET';

    // Only cache GET requests
    if (method === 'GET') {
      const cacheKey = url;
      const cached = this.requestCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
        console.log('🎯 Using cached response for:', endpoint);
        return cached.data;
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Only add Authorization header if explicitly required or for protected endpoints
    if (requireAuth && this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        const error = new Error(data.error?.message || `HTTP ${response.status}`) as any;
        error.status = response.status;
        throw error;
      }

      // Cache successful GET requests
      if (method === 'GET' && data.success) {
        this.requestCache.set(url, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error: any) {
      console.error(`API request failed (attempt ${retryCount + 1}):`, error);

      // Check if we should retry
      if (retryCount < CONFIG.MAX_RETRIES && isRetryableError(error)) {
        const delay = CONFIG.RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await sleep(delay);
        return this.requestWithRetry<T>(endpoint, options, requireAuth, retryCount + 1);
      }

      // If all retries failed or error is not retryable, return standardized error response
      return createStandardResponse<T>(false, undefined, {
        message: error.message || 'Request failed',
        details: error
      });
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    if (useSupabase()) {
      const result = await supabaseService.healthCheck();
      return {
        success: result.success,
        data: result,
        timestamp: result.timestamp
      };
    }
    return this.request('/health', {}, false); // Public endpoint
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false); // Login doesn't require existing auth

    if (response.success && response.data?.token) {
      this.saveToken(response.data.token);
    }

    return response;
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<ApiResponse> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      this.saveToken(response.data.token);
    }

    return response;
  }

  async getProfile(): Promise<ApiResponse> {
    return this.request('/auth/profile', {}, true); // Requires authentication
  }

  logout(): void {
    this.removeToken();
  }

  // Articles
  async getArticles(filters: ArticleFilters = {}): Promise<ApiResponse> {
    return handleSupabaseFallback(
      () => supabaseService.getArticles({
        limit: filters.limit,
        offset: ((filters.page || 1) - 1) * (filters.limit || 10),
        status: filters.status
      }),
      () => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });

        const queryString = params.toString();
        const endpoint = `/articles${queryString ? `?${queryString}` : ''}`;

        return this.request(endpoint, {}, false);
      },
      'Failed to fetch articles'
    );
  }

  async getArticle(id: string): Promise<ApiResponse> {
    return this.request(`/articles/${id}`, {}, false); // Public endpoint
  }

  async createArticle(articleData: any): Promise<ApiResponse> {
    if (useSupabase()) {
      const result = await supabaseService.createArticle(articleData);

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to create article' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }
    return this.request('/articles', {
      method: 'POST',
      body: JSON.stringify(articleData),
    }, true); // Requires authentication
  }

  async updateArticle(id: string, articleData: any): Promise<ApiResponse> {
    if (useSupabase()) {
      const result = await supabaseService.updateArticle(id, articleData);

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to update article' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }
    return this.request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(articleData),
    });
  }

  async deleteArticle(id: string): Promise<ApiResponse> {
    if (useSupabase()) {
      const result = await supabaseService.deleteArticle(id);

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to delete article' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }
    return this.request(`/articles/${id}`, {
      method: 'DELETE',
    });
  }

  async getFeaturedArticle(): Promise<ApiResponse> {
    if (useSupabase()) {
      // Use the dedicated getFeaturedArticle method
      const result = await supabaseService.getFeaturedArticle();

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to fetch featured article' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }
    return this.request('/articles/featured/current', {}, false); // Public endpoint
  }

  async setFeaturedArticle(id: string): Promise<ApiResponse> {
    return this.request(`/articles/${id}/feature`, {
      method: 'POST',
    });
  }

  async unsetFeaturedArticle(id: string): Promise<ApiResponse> {
    return this.request(`/articles/${id}/feature`, {
      method: 'DELETE',
    });
  }

  // Get related articles for a specific article
  async getRelatedArticles(articleId: string, options: {
    limit?: number;
    excludeIds?: string[];
  } = {}): Promise<ApiResponse> {
    const { limit = 6, excludeIds = [] } = options;

    // First get the current article to understand its category and tags
    const currentArticleResponse = await this.getArticle(articleId);

    if (!currentArticleResponse.success || !currentArticleResponse.data) {
      throw new Error('Could not fetch current article for related articles');
    }

    const currentArticle = currentArticleResponse.data;
    const allExcludeIds = [articleId, ...excludeIds];

    // Strategy 1: Find articles in the same category
    let relatedArticles: any[] = [];

    if (currentArticle.category?.id && relatedArticles.length < limit) {
      const categoryResponse = await this.getArticles({
        categoryId: currentArticle.category.id,
        status: 'PUBLISHED',
        limit: limit * 2, // Get more to filter out excluded ones
        sortBy: 'publishedAt',
        sortOrder: 'desc'
      });

      if (categoryResponse.success && categoryResponse.data) {
        const categoryArticles = categoryResponse.data.filter(
          (article: any) => !allExcludeIds.includes(article.id)
        );
        relatedArticles.push(...categoryArticles.slice(0, limit));
      }
    }

    // Strategy 2: If we need more articles, find by tags
    if (relatedArticles.length < limit && currentArticle.tags && currentArticle.tags.length > 0) {
      const tagNames = currentArticle.tags.map((tag: any) => tag.name);
      const tagResponse = await this.getArticles({
        tags: tagNames,
        status: 'PUBLISHED',
        limit: limit * 2,
        sortBy: 'publishedAt',
        sortOrder: 'desc'
      });

      if (tagResponse.success && tagResponse.data) {
        const existingIds = new Set([...allExcludeIds, ...relatedArticles.map(a => a.id)]);
        const tagArticles = tagResponse.data.filter(
          (article: any) => !existingIds.has(article.id)
        );

        const remainingSlots = limit - relatedArticles.length;
        relatedArticles.push(...tagArticles.slice(0, remainingSlots));
      }
    }

    // Strategy 3: If still need more, get recent articles from same author
    if (relatedArticles.length < limit && currentArticle.author?.id) {
      const authorResponse = await this.getArticles({
        authorId: currentArticle.author.id,
        status: 'PUBLISHED',
        limit: limit,
        sortBy: 'publishedAt',
        sortOrder: 'desc'
      });

      if (authorResponse.success && authorResponse.data) {
        const existingIds = new Set([...allExcludeIds, ...relatedArticles.map(a => a.id)]);
        const authorArticles = authorResponse.data.filter(
          (article: any) => !existingIds.has(article.id)
        );

        const remainingSlots = limit - relatedArticles.length;
        relatedArticles.push(...authorArticles.slice(0, remainingSlots));
      }
    }

    return {
      success: true,
      data: relatedArticles.slice(0, limit),
      timestamp: new Date().toISOString()
    };
  }

  // Authors
  async getAuthors(): Promise<ApiResponse> {
    if (useSupabase()) {
      const result = await supabaseService.getAuthors();

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to fetch authors' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }
    return this.request('/authors', {}, false); // Public endpoint
  }

  // Gallery
  async getGalleryItems(categoryId?: string): Promise<ApiResponse> {
    if (useSupabase()) {
      const result = await supabaseService.getGalleryItems(categoryId);

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to fetch gallery items' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }
    const endpoint = categoryId ? `/gallery?categoryId=${categoryId}` : '/gallery';
    return this.request(endpoint, {}, false); // Public endpoint
  }

  async getGalleryCategories(): Promise<ApiResponse> {
    if (useSupabase()) {
      const result = await supabaseService.getGalleryCategories();

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to fetch gallery categories' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }
    return this.request('/gallery-categories', {}, false); // Public endpoint
  }

  async getAuthor(id: string): Promise<ApiResponse> {
    return this.request(`/authors/${id}`, {}, false); // Public endpoint
  }

  async createAuthor(authorData: any): Promise<ApiResponse> {
    if (useSupabase()) {
      const result = await supabaseService.createAuthor(authorData);

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to create author' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }
    return this.request('/authors', {
      method: 'POST',
      body: JSON.stringify(authorData),
    });
  }

  async updateAuthor(id: string, authorData: any): Promise<ApiResponse> {
    if (useSupabase()) {
      console.log('Updating author via Supabase:', id, authorData);
      const result = await supabaseService.updateAuthor(id, authorData);
      console.log('Supabase update result:', result);

      if (result.error) {
        console.error('Supabase update error:', result.error);
        return {
          success: false,
          error: { message: result.error.message || 'Failed to update author' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }
    return this.request(`/authors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(authorData),
    });
  }

  async deleteAuthor(id: string): Promise<ApiResponse> {
    if (useSupabase()) {
      const result = await supabaseService.deleteAuthor(id);

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to delete author' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }
    return this.request(`/authors/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories(): Promise<ApiResponse> {
    if (useSupabase()) {
      const result = await supabaseService.getCategories();

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to fetch categories' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }
    return this.request('/categories');
  }

  async getCategory(id: string): Promise<ApiResponse> {
    return this.request(`/categories/${id}`);
  }

  async createCategory(categoryData: any): Promise<ApiResponse> {
    if (useSupabase()) {
      const result = await supabaseService.createCategory(categoryData);

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to create category' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: any): Promise<ApiResponse> {
    if (useSupabase()) {
      const result = await supabaseService.updateCategory(id, categoryData);

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to update category' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse> {
    if (useSupabase()) {
      const result = await supabaseService.deleteCategory(id);

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to delete category' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Tags
  async getTags(): Promise<ApiResponse> {
    return this.request('/tags');
  }

  // AI Services
  async askAI(question: string): Promise<ApiResponse> {
    return this.request('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  async generateSummary(content: string): Promise<ApiResponse> {
    return this.request('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getAIStatus(): Promise<ApiResponse> {
    return this.request('/ai/status');
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
