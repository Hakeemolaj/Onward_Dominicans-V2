// Enhanced data fetching for Next.js with caching and error handling
import { cacheHelpers } from './cache-manager';
import { performanceHelpers } from './performance-monitor';

interface FetchOptions {
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
}

// Base API URL - works in both server and client environments
const getApiBaseUrl = () => {
  // Server-side: use internal API
  if (typeof window === 'undefined') {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }
  // Client-side: use relative URLs
  return '';
};

// Enhanced fetch with error handling and caching
async function enhancedFetch<T>(
  endpoint: string, 
  options: FetchOptions = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api${endpoint}`;
  
  const fetchOptions: RequestInit = {
    cache: options.cache || 'force-cache',
    next: {
      revalidate: options.revalidate || 300, // 5 minutes default
      tags: options.tags || []
    }
  };

  console.log(`🔍 Fetching: ${url}`);
  
  try {
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }
    
    console.log(`✅ Successfully fetched: ${endpoint}`);
    return data.data;
    
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// Article data fetching with caching
export async function fetchArticles(options: {
  category?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
} = {}) {
  const cacheKey = `articles:${JSON.stringify(options)}`;

  return cacheHelpers.articles.getAll(async () => {
    const params = new URLSearchParams();

    if (options.category) params.set('category', options.category);
    if (options.featured) params.set('featured', 'true');
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.search) params.set('search', options.search);

    const endpoint = `/articles${params.toString() ? `?${params}` : ''}`;

    return performanceHelpers.measureApiCall('fetchArticles', async () => {
      return enhancedFetch<{
        articles: any[];
        total: number;
        filters: any;
      }>(endpoint, {
        revalidate: 300, // 5 minutes
        tags: ['articles']
      });
    });
  });
}

// Single article fetching
export async function fetchArticleBySlug(slug: string) {
  try {
    const { articles } = await fetchArticles({ limit: 100 });
    const article = articles.find(a => a.slug === slug);
    
    if (!article) {
      throw new Error(`Article not found: ${slug}`);
    }
    
    return article;
  } catch (error) {
    console.error(`❌ Error fetching article ${slug}:`, error);
    throw error;
  }
}

// Categories data fetching
export async function fetchCategories(includeCount = false) {
  const params = new URLSearchParams();
  if (includeCount) params.set('include_count', 'true');
  
  const endpoint = `/categories${params.toString() ? `?${params}` : ''}`;
  
  return enhancedFetch<{
    categories: any[];
    total: number;
  }>(endpoint, {
    revalidate: 3600, // 1 hour
    tags: ['categories']
  });
}

// Authors data fetching
export async function fetchAuthors(includeCount = false) {
  const params = new URLSearchParams();
  if (includeCount) params.set('include_count', 'true');
  
  const endpoint = `/authors${params.toString() ? `?${params}` : ''}`;
  
  return enhancedFetch<{
    authors: any[];
    total: number;
  }>(endpoint, {
    revalidate: 3600, // 1 hour
    tags: ['authors']
  });
}

// Featured article fetching
export async function fetchFeaturedArticle() {
  try {
    const { articles } = await fetchArticles({ featured: true, limit: 1 });
    return articles[0] || null;
  } catch (error) {
    console.error('❌ Error fetching featured article:', error);
    // Fallback to first article
    try {
      const { articles } = await fetchArticles({ limit: 1 });
      return articles[0] || null;
    } catch (fallbackError) {
      console.error('❌ Error fetching fallback article:', fallbackError);
      return null;
    }
  }
}

// Articles by category
export async function fetchArticlesByCategory(categorySlug: string) {
  try {
    // First get the category to find its ID
    const { categories } = await fetchCategories();
    const category = categories.find(c => c.slug === categorySlug);
    
    if (!category) {
      throw new Error(`Category not found: ${categorySlug}`);
    }
    
    // Then fetch articles for that category
    const { articles } = await fetchArticles({ category: category.id });
    
    return {
      category,
      articles
    };
  } catch (error) {
    console.error(`❌ Error fetching articles for category ${categorySlug}:`, error);
    throw error;
  }
}

// Health check
export async function checkApiHealth() {
  return enhancedFetch<any>('/health', {
    cache: 'no-cache'
  });
}

// Regenerate SSG
export async function regenerateSSG(options: any = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/regenerate-ssg`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options),
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('❌ Error regenerating SSG:', error);
    throw error;
  }
}

// Fallback data for when API is unavailable
export const FALLBACK_DATA = {
  articles: [
    {
      id: 'celebrating-dominican-independence-day-2024',
      slug: 'celebrating-dominican-independence-day-2024',
      title: 'Celebrating Dominican Independence Day: A Community United',
      summary: 'Community members come together to celebrate Dominican Independence Day with traditional performances, food, and cultural activities.',
      content: 'Every February 27th, Dominicans around the world come together to celebrate their independence from Haiti in 1844...',
      author: 'Maria Rodriguez',
      category: 'Community Events',
      publishedAt: '2024-02-27T00:00:00',
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
      tags: ['independence', 'community', 'culture', 'celebration'],
      featured: true
    },
    {
      id: 'traditional-mangu-family-recipe',
      slug: 'traditional-mangu-family-recipe',
      title: 'The Art of Making Traditional Mangu: A Family Recipe',
      summary: 'Learn to make authentic Dominican mangu with this traditional family recipe passed down through generations.',
      content: 'Mangu is more than just a dish—it\'s a cornerstone of Dominican cuisine...',
      author: 'Carlos Santana',
      category: 'Food & Cuisine',
      publishedAt: '2024-01-15T00:00:00',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
      tags: ['food', 'recipe', 'tradition', 'mangu']
    }
  ],
  categories: [
    { id: '1', name: 'Community Events', slug: 'community-events', color: '#3B82F6' },
    { id: '2', name: 'Food & Cuisine', slug: 'food-cuisine', color: '#10B981' },
    { id: '3', name: 'Culture & Heritage', slug: 'culture-heritage', color: '#F59E0B' },
    { id: '4', name: 'Youth & Education', slug: 'youth-education', color: '#EF4444' }
  ]
};
