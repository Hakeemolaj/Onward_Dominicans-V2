/**
 * Advanced caching system using IndexedDB
 * Provides persistent storage for offline functionality and performance
 */

interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
  metadata?: Record<string, any>;
}

interface CacheConfig {
  dbName: string;
  version: number;
  stores: string[];
  defaultTTL: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries per store
}

class AdvancedCacheManager {
  private static instance: AdvancedCacheManager;
  private db: IDBDatabase | null = null;
  private config: CacheConfig;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    this.config = {
      dbName: 'OnwardDominicansCache',
      version: 1,
      stores: ['articles', 'gallery', 'users', 'metadata', 'search'],
      defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
      maxSize: 1000,
    };
  }

  static getInstance(): AdvancedCacheManager {
    if (!AdvancedCacheManager.instance) {
      AdvancedCacheManager.instance = new AdvancedCacheManager();
    }
    return AdvancedCacheManager.instance;
  }

  /**
   * Initialize the cache database
   */
  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('⚠️ IndexedDB not supported, falling back to memory cache');
        resolve();
        return;
      }

      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => {
        console.error('❌ Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB cache initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        this.config.stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('expiresAt', 'expiresAt', { unique: false });
            console.log(`📦 Created object store: ${storeName}`);
          }
        });
      };
    });

    return this.initPromise;
  }

  /**
   * Set cache entry
   */
  async set<T>(
    store: string,
    key: string,
    data: T,
    ttl?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.init();

    if (!this.db) {
      console.warn('⚠️ IndexedDB not available, skipping cache set');
      return;
    }

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttl || this.config.defaultTTL),
      version: '1.0.0',
      metadata,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.put(entry);

      request.onsuccess = () => {
        console.log(`💾 Cached: ${store}/${key}`);
        resolve();
      };

      request.onerror = () => {
        console.error(`❌ Failed to cache: ${store}/${key}`, request.error);
        reject(request.error);
      };

      // Clean up old entries after successful write
      transaction.oncomplete = () => {
        this.cleanup(store);
      };
    });
  }

  /**
   * Get cache entry
   */
  async get<T>(store: string, key: string): Promise<T | null> {
    await this.init();

    if (!this.db) {
      console.warn('⚠️ IndexedDB not available, cache miss');
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(key);

      request.onsuccess = () => {
        const entry: CacheEntry<T> | undefined = request.result;

        if (!entry) {
          console.log(`💨 Cache miss: ${store}/${key}`);
          resolve(null);
          return;
        }

        // Check if entry has expired
        if (Date.now() > entry.expiresAt) {
          console.log(`⏰ Cache expired: ${store}/${key}`);
          this.delete(store, key); // Clean up expired entry
          resolve(null);
          return;
        }

        console.log(`🎯 Cache hit: ${store}/${key}`);
        resolve(entry.data);
      };

      request.onerror = () => {
        console.error(`❌ Failed to get cache: ${store}/${key}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete cache entry
   */
  async delete(store: string, key: string): Promise<void> {
    await this.init();

    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.delete(key);

      request.onsuccess = () => {
        console.log(`🗑️ Deleted cache: ${store}/${key}`);
        resolve();
      };

      request.onerror = () => {
        console.error(`❌ Failed to delete cache: ${store}/${key}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clear entire store
   */
  async clear(store: string): Promise<void> {
    await this.init();

    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.clear();

      request.onsuccess = () => {
        console.log(`🧹 Cleared cache store: ${store}`);
        resolve();
      };

      request.onerror = () => {
        console.error(`❌ Failed to clear cache store: ${store}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all keys in a store
   */
  async keys(store: string): Promise<string[]> {
    await this.init();

    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => {
        console.error(`❌ Failed to get keys: ${store}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<Record<string, any>> {
    await this.init();

    if (!this.db) {
      return {};
    }

    const stats: Record<string, any> = {};

    for (const store of this.config.stores) {
      try {
        const keys = await this.keys(store);
        const entries = await this.getAllEntries(store);
        const expired = entries.filter(entry => Date.now() > entry.expiresAt).length;
        const totalSize = entries.reduce((size, entry) => {
          return size + JSON.stringify(entry.data).length;
        }, 0);

        stats[store] = {
          count: keys.length,
          expired,
          totalSize,
          averageAge: entries.length > 0 
            ? (Date.now() - entries.reduce((sum, entry) => sum + entry.timestamp, 0) / entries.length) / 1000 / 60
            : 0,
        };
      } catch (error) {
        console.error(`❌ Failed to get stats for ${store}:`, error);
        stats[store] = { error: error.message };
      }
    }

    return stats;
  }

  /**
   * Cleanup expired entries and enforce size limits
   */
  private async cleanup(store: string): Promise<void> {
    if (!this.db) return;

    try {
      const entries = await this.getAllEntries(store);
      const now = Date.now();
      
      // Remove expired entries
      const expiredEntries = entries.filter(entry => now > entry.expiresAt);
      for (const entry of expiredEntries) {
        await this.delete(store, entry.key);
      }

      // Enforce size limit
      const remainingEntries = entries.filter(entry => now <= entry.expiresAt);
      if (remainingEntries.length > this.config.maxSize) {
        // Sort by timestamp (oldest first) and remove excess
        remainingEntries.sort((a, b) => a.timestamp - b.timestamp);
        const toRemove = remainingEntries.slice(0, remainingEntries.length - this.config.maxSize);
        
        for (const entry of toRemove) {
          await this.delete(store, entry.key);
        }
      }

      if (expiredEntries.length > 0) {
        console.log(`🧹 Cleaned up ${expiredEntries.length} expired entries from ${store}`);
      }
    } catch (error) {
      console.error(`❌ Cleanup failed for ${store}:`, error);
    }
  }

  /**
   * Get all entries from a store
   */
  private async getAllEntries(store: string): Promise<CacheEntry[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Cache with fallback strategy
   */
  async cacheWithFallback<T>(
    store: string,
    key: string,
    fetchFunction: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(store, key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    try {
      const data = await fetchFunction();
      await this.set(store, key, data, ttl);
      return data;
    } catch (error) {
      console.error(`❌ Failed to fetch and cache: ${store}/${key}`, error);
      throw error;
    }
  }

  /**
   * Batch operations
   */
  async setBatch<T>(
    store: string,
    entries: Array<{ key: string; data: T; ttl?: number; metadata?: Record<string, any> }>
  ): Promise<void> {
    await this.init();

    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([store], 'readwrite');
      const objectStore = transaction.objectStore(store);
      let completed = 0;
      let hasError = false;

      entries.forEach(({ key, data, ttl, metadata }) => {
        const entry: CacheEntry<T> = {
          key,
          data,
          timestamp: Date.now(),
          expiresAt: Date.now() + (ttl || this.config.defaultTTL),
          version: '1.0.0',
          metadata,
        };

        const request = objectStore.put(entry);

        request.onsuccess = () => {
          completed++;
          if (completed === entries.length && !hasError) {
            console.log(`💾 Batch cached ${entries.length} entries in ${store}`);
            resolve();
          }
        };

        request.onerror = () => {
          hasError = true;
          console.error(`❌ Failed to batch cache: ${store}/${key}`, request.error);
          reject(request.error);
        };
      });
    });
  }
}

// Export singleton instance
export const advancedCache = AdvancedCacheManager.getInstance();

/**
 * React hook for advanced caching
 */
export const useAdvancedCache = <T>(
  store: string,
  key: string,
  fetchFunction: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
    refetchOnMount?: boolean;
  } = {}
) => {
  const { ttl, enabled = true, refetchOnMount = false } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (useCache: boolean = true) => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      let result: T;

      if (useCache) {
        result = await advancedCache.cacheWithFallback(store, key, fetchFunction, ttl);
      } else {
        result = await fetchFunction();
        await advancedCache.set(store, key, result, ttl);
      }

      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('❌ Cache fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [store, key, fetchFunction, ttl, enabled]);

  useEffect(() => {
    fetchData(!refetchOnMount);
  }, [fetchData, refetchOnMount]);

  const refetch = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);

  const invalidate = useCallback(async () => {
    await advancedCache.delete(store, key);
    return fetchData(false);
  }, [store, key, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
  };
};
