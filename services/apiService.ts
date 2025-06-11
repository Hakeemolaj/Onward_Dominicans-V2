// API Service for backend integration
// This service provides methods to interact with the backend API or Supabase

import { supabaseService } from './supabaseService';
import { config } from '../config';

// Auto-detect API base URL based on current hostname
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const currentHost = window.location.hostname;
  const apiHost = currentHost === 'localhost' || currentHost === '127.0.0.1' ? 'localhost' : currentHost;
  return `http://${apiHost}:3001/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Check if we should use Supabase directly (for both development and production)
const useSupabase = () => {
  return config.supabaseUrl && config.supabaseAnonKey;
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

class ApiService {
  private baseUrl: string;
  private token: string | null = null;
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken(): void {
    this.token = localStorage.getItem('auth_token');
  }

  private saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private removeToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || 'GET';

    // Only cache GET requests
    if (method === 'GET') {
      const cacheKey = url;
      const cached = this.requestCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('🎯 Using cached response for:', endpoint);
        return cached.data;
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      // Cache successful GET requests
      if (method === 'GET' && data.success) {
        this.requestCache.set(url, {
          data,
          timestamp: Date.now()
        });
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
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
    return this.request('/health');
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

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
    return this.request('/auth/profile');
  }

  logout(): void {
    this.removeToken();
  }

  // Articles
  async getArticles(filters: ArticleFilters = {}): Promise<ApiResponse> {
    if (useSupabase()) {
      const result = await supabaseService.getArticles({
        limit: filters.limit,
        offset: ((filters.page || 1) - 1) * (filters.limit || 10),
        status: filters.status
      });

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to fetch articles' },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    }

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

    return this.request(endpoint);
  }

  async getArticle(id: string): Promise<ApiResponse> {
    return this.request(`/articles/${id}`);
  }

  async createArticle(articleData: any): Promise<ApiResponse> {
    return this.request('/articles', {
      method: 'POST',
      body: JSON.stringify(articleData),
    });
  }

  async updateArticle(id: string, articleData: any): Promise<ApiResponse> {
    return this.request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(articleData),
    });
  }

  async deleteArticle(id: string): Promise<ApiResponse> {
    return this.request(`/articles/${id}`, {
      method: 'DELETE',
    });
  }

  async getFeaturedArticle(): Promise<ApiResponse> {
    if (useSupabase()) {
      // For Supabase, get the most recent published article as featured
      const result = await supabaseService.getArticles({
        limit: 1,
        offset: 0,
        status: 'PUBLISHED'
      });

      if (result.error) {
        return {
          success: false,
          error: { message: 'Failed to fetch featured article' },
          timestamp: new Date().toISOString()
        };
      }

      const article = result.data && result.data.length > 0 ? result.data[0] : null;
      return {
        success: true,
        data: article,
        timestamp: new Date().toISOString()
      };
    }
    return this.request('/articles/featured/current');
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
    return this.request('/authors');
  }

  async getAuthor(id: string): Promise<ApiResponse> {
    return this.request(`/authors/${id}`);
  }

  async createAuthor(authorData: any): Promise<ApiResponse> {
    return this.request('/authors', {
      method: 'POST',
      body: JSON.stringify(authorData),
    });
  }

  async updateAuthor(id: string, authorData: any): Promise<ApiResponse> {
    return this.request(`/authors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(authorData),
    });
  }

  async deleteAuthor(id: string): Promise<ApiResponse> {
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
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: any): Promise<ApiResponse> {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse> {
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
