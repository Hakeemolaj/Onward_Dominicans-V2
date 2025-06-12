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

  async createArticle(articleData: any) {
    return this.request('/articles', {
      method: 'POST',
      body: JSON.stringify(articleData)
    });
  }

  async updateArticle(id: string, articleData: any) {
    return this.request(`/articles?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(articleData)
    });
  }

  async deleteArticle(id: string) {
    return this.request(`/articles?id=eq.${id}`, {
      method: 'DELETE'
    });
  }

  // Authors
  async getAuthors() {
    try {
      // First get authors
      const authorsResult = await this.request('/authors?isActive=eq.true&order=name.asc');

      if (authorsResult.error || !authorsResult.data) {
        return authorsResult;
      }

      // Get article counts for each author
      const authorsWithCounts = await Promise.all(
        authorsResult.data.map(async (author: any) => {
          try {
            const articlesResult = await this.request(
              `/articles?authorId=eq.${author.id}&select=id&status=eq.PUBLISHED`
            );

            const articleCount = articlesResult.data ? articlesResult.data.length : 0;

            return {
              ...author,
              articleCount
            };
          } catch (error) {
            console.warn(`Failed to get article count for author ${author.name}:`, error);
            return {
              ...author,
              articleCount: 0
            };
          }
        })
      );

      return {
        ...authorsResult,
        data: authorsWithCounts
      };
    } catch (error) {
      console.error('Error fetching authors with article counts:', error);
      return {
        error: { message: 'Failed to fetch authors' },
        data: null
      };
    }
  }

  async createAuthor(authorData: any) {
    return this.request('/authors', {
      method: 'POST',
      body: JSON.stringify(authorData)
    });
  }

  async updateAuthor(id: string, authorData: any) {
    console.log('SupabaseService.updateAuthor called with:', id, authorData);
    const result = await this.request(`/authors?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(authorData)
    });
    console.log('SupabaseService.updateAuthor result:', result);
    return result;
  }

  async deleteAuthor(id: string) {
    return this.request(`/authors?id=eq.${id}`, {
      method: 'DELETE'
    });
  }

  // Categories
  async getCategories() {
    return this.request('/categories?isActive=eq.true&order=name.asc');
  }

  async createCategory(categoryData: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(id: string, categoryData: any) {
    return this.request(`/categories?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories?id=eq.${id}`, {
      method: 'DELETE'
    });
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
