// API Service for backend integration
// This service provides methods to interact with the backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
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

  // Authors
  async getAuthors(): Promise<ApiResponse> {
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
