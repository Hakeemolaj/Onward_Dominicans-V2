// Advanced caching strategies for Next.js with Supabase

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleWhileRevalidate?: number; // Additional time to serve stale content
  tags?: string[];
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private revalidationPromises = new Map<string, Promise<any>>();

  // Default cache configurations
  private static readonly CACHE_CONFIGS = {
    articles: { ttl: 5 * 60 * 1000, staleWhileRevalidate: 10 * 60 * 1000, tags: ['articles'] }, // 5 min + 10 min stale
    categories: { ttl: 60 * 60 * 1000, staleWhileRevalidate: 2 * 60 * 60 * 1000, tags: ['categories'] }, // 1 hour + 2 hours stale
    authors: { ttl: 60 * 60 * 1000, staleWhileRevalidate: 2 * 60 * 60 * 1000, tags: ['authors'] }, // 1 hour + 2 hours stale
    health: { ttl: 30 * 1000, staleWhileRevalidate: 60 * 1000, tags: ['health'] }, // 30 sec + 1 min stale
  } as const;

  /**
   * Get data from cache or fetch if not available/expired
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    config?: CacheConfig
  ): Promise<T> {
    const cacheKey = this.generateKey(key);
    const entry = this.cache.get(cacheKey);
    const now = Date.now();

    // Determine cache configuration
    const cacheConfig = config || this.getDefaultConfig(key);
    
    // Cache hit - return fresh data
    if (entry && (now - entry.timestamp) < entry.ttl) {
      console.log(`🎯 Cache HIT (fresh): ${key}`);
      return entry.data;
    }

    // Stale data available - return stale and revalidate in background
    if (entry && cacheConfig.staleWhileRevalidate && 
        (now - entry.timestamp) < (entry.ttl + cacheConfig.staleWhileRevalidate)) {
      console.log(`🔄 Cache HIT (stale): ${key} - revalidating in background`);
      
      // Start background revalidation if not already in progress
      if (!this.revalidationPromises.has(cacheKey)) {
        this.revalidationPromises.set(cacheKey, this.revalidate(cacheKey, fetcher, cacheConfig));
      }
      
      return entry.data;
    }

    // Cache miss or expired - fetch fresh data
    console.log(`❌ Cache MISS: ${key} - fetching fresh data`);
    return this.fetchAndCache(cacheKey, fetcher, cacheConfig);
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, config?: CacheConfig): void {
    const cacheKey = this.generateKey(key);
    const cacheConfig = config || this.getDefaultConfig(key);
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: cacheConfig.ttl
    });
    
    console.log(`💾 Cache SET: ${key} (TTL: ${cacheConfig.ttl}ms)`);
  }

  /**
   * Invalidate cache entries by key or tags
   */
  invalidate(keyOrTag: string): void {
    if (keyOrTag.startsWith('tag:')) {
      const tag = keyOrTag.substring(4);
      let invalidatedCount = 0;
      
      for (const [key] of this.cache) {
        const config = this.getDefaultConfig(key);
        if (config.tags?.includes(tag)) {
          this.cache.delete(key);
          this.revalidationPromises.delete(key);
          invalidatedCount++;
        }
      }
      
      console.log(`🗑️ Cache INVALIDATED by tag "${tag}": ${invalidatedCount} entries`);
    } else {
      const cacheKey = this.generateKey(keyOrTag);
      this.cache.delete(cacheKey);
      this.revalidationPromises.delete(cacheKey);
      console.log(`🗑️ Cache INVALIDATED: ${keyOrTag}`);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const count = this.cache.size;
    this.cache.clear();
    this.revalidationPromises.clear();
    console.log(`🧹 Cache CLEARED: ${count} entries removed`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let fresh = 0;
    let stale = 0;
    let expired = 0;

    for (const [key, entry] of this.cache) {
      const age = now - entry.timestamp;
      const config = this.getDefaultConfig(key);
      
      if (age < entry.ttl) {
        fresh++;
      } else if (config.staleWhileRevalidate && age < (entry.ttl + config.staleWhileRevalidate)) {
        stale++;
      } else {
        expired++;
      }
    }

    return {
      total: this.cache.size,
      fresh,
      stale,
      expired,
      revalidating: this.revalidationPromises.size
    };
  }

  /**
   * Private methods
   */
  private generateKey(key: string): string {
    return `cache:${key}`;
  }

  private getDefaultConfig(key: string): CacheConfig {
    // Try to match key with predefined configs
    for (const [configKey, config] of Object.entries(CacheManager.CACHE_CONFIGS)) {
      if (key.includes(configKey)) {
        return config;
      }
    }
    
    // Default fallback
    return { ttl: 5 * 60 * 1000, staleWhileRevalidate: 10 * 60 * 1000, tags: ['default'] };
  }

  private async fetchAndCache<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    try {
      const data = await fetcher();
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: config.ttl
      });
      return data;
    } catch (error) {
      console.error(`❌ Cache fetch error for ${cacheKey}:`, error);
      throw error;
    }
  }

  private async revalidate<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<void> {
    try {
      const data = await fetcher();
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: config.ttl
      });
      console.log(`✅ Cache REVALIDATED: ${cacheKey}`);
    } catch (error) {
      console.error(`❌ Cache revalidation error for ${cacheKey}:`, error);
    } finally {
      this.revalidationPromises.delete(cacheKey);
    }
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// Helper functions for common cache operations
export const cacheHelpers = {
  // Cache articles with automatic key generation
  articles: {
    getAll: (fetcher: () => Promise<any>) => 
      cacheManager.get('articles:all', fetcher),
    getFeatured: (fetcher: () => Promise<any>) => 
      cacheManager.get('articles:featured', fetcher),
    getByCategory: (categoryId: string, fetcher: () => Promise<any>) => 
      cacheManager.get(`articles:category:${categoryId}`, fetcher),
    getBySlug: (slug: string, fetcher: () => Promise<any>) => 
      cacheManager.get(`articles:slug:${slug}`, fetcher),
    invalidate: () => cacheManager.invalidate('tag:articles')
  },
  
  // Cache categories
  categories: {
    getAll: (fetcher: () => Promise<any>) => 
      cacheManager.get('categories:all', fetcher),
    invalidate: () => cacheManager.invalidate('tag:categories')
  },
  
  // Cache authors
  authors: {
    getAll: (fetcher: () => Promise<any>) => 
      cacheManager.get('authors:all', fetcher),
    invalidate: () => cacheManager.invalidate('tag:authors')
  },
  
  // Health check cache
  health: {
    get: (fetcher: () => Promise<any>) => 
      cacheManager.get('health:status', fetcher),
    invalidate: () => cacheManager.invalidate('health:status')
  }
};

// Cache warming function
export async function warmCache() {
  console.log('🔥 Warming cache...');
  
  try {
    // Warm up critical data
    await Promise.allSettled([
      cacheHelpers.articles.getAll(() => fetch('/api/articles').then(r => r.json())),
      cacheHelpers.categories.getAll(() => fetch('/api/categories').then(r => r.json())),
      cacheHelpers.health.get(() => fetch('/api/health').then(r => r.json()))
    ]);
    
    console.log('✅ Cache warmed successfully');
  } catch (error) {
    console.error('❌ Cache warming failed:', error);
  }
}
