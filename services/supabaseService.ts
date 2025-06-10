// Supabase service for direct API access
import { config } from '../config';

interface SupabaseResponse<T> {
  data?: T;
  error?: any;
}

class SupabaseService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = config.supabaseUrl + '/rest/v1';
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': config.supabaseAnonKey,
      'Authorization': `Bearer ${config.supabaseAnonKey}`,
      'Prefer': 'return=representation'
    };
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<SupabaseResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Supabase request error:', error);
      return { error };
    }
  }

  // Articles
  async getArticles(params: { 
    limit?: number; 
    offset?: number; 
    status?: string; 
  } = {}) {
    const { limit = 10, offset = 0, status = 'PUBLISHED' } = params;
    const query = `?status=eq.${status}&limit=${limit}&offset=${offset}&order=publishedAt.desc`;
    return this.request(`/articles${query}&select=*,author:authors(*),category:categories(*)`);
  }

  async getArticleBySlug(slug: string) {
    return this.request(`/articles?slug=eq.${slug}&select=*,author:authors(*),category:categories(*),tags:_ArticleToTag(tag:tags(*))`);
  }

  // Categories
  async getCategories() {
    return this.request('/categories?isActive=eq.true&order=name.asc');
  }

  // Authors
  async getAuthors() {
    return this.request('/authors?isActive=eq.true&order=name.asc');
  }

  // Gallery
  async getGalleryItems(categoryId?: string) {
    const query = categoryId 
      ? `?categoryId=eq.${categoryId}&isActive=eq.true&order=createdAt.desc`
      : '?isActive=eq.true&order=createdAt.desc';
    return this.request(`/gallery_items${query}&select=*,category:gallery_categories(*)`);
  }

  async getGalleryCategories() {
    return this.request('/gallery_categories?isActive=eq.true&order=name.asc');
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${config.supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': config.supabaseAnonKey,
        },
      });
      return { 
        success: response.ok,
        status: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const supabaseService = new SupabaseService();
