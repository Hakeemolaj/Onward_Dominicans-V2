/**
 * Performance optimization utilities
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Memoization utility for expensive computations
 */
export class MemoCache {
  private static cache = new Map<string, { value: any; timestamp: number; ttl: number }>();

  static memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string,
    ttl: number = 300000 // 5 minutes default
  ): T {
    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      const cached = this.cache.get(key);

      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.value;
      }

      const result = fn(...args);
      this.cache.set(key, { value: result, timestamp: Date.now(), ttl });

      return result;
    }) as T;
  }

  static clear(): void {
    this.cache.clear();
  }

  static clearExpired(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= value.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Virtual scrolling hook for large lists
 */
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
};

/**
 * Image optimization utilities
 */
export const ImageOptimizer = {
  /**
   * Generate responsive image URLs
   */
  getResponsiveUrl: (baseUrl: string, width: number, quality: number = 80): string => {
    if (baseUrl.includes('picsum.photos')) {
      return `${baseUrl}?w=${width}&q=${quality}`;
    }
    
    // Add your CDN logic here
    return baseUrl;
  },

  /**
   * Generate srcSet for responsive images
   */
  generateSrcSet: (baseUrl: string, sizes: number[] = [320, 640, 1024, 1280]): string => {
    return sizes
      .map(size => `${ImageOptimizer.getResponsiveUrl(baseUrl, size)} ${size}w`)
      .join(', ');
  },

  /**
   * Lazy load images with intersection observer
   */
  useLazyImage: (src: string, placeholder?: string) => {
    const [imageSrc, setImageSrc] = useState(placeholder || '');
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, [src]);

    const handleLoad = useCallback(() => {
      setIsLoaded(true);
    }, []);

    return { imageSrc, isLoaded, imgRef, handleLoad };
  }
};

/**
 * Bundle splitting utilities
 */
export const LazyLoader = {
  /**
   * Lazy load components
   */
  loadComponent: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
  ) => {
    return React.lazy(importFn);
  },

  /**
   * Preload components
   */
  preloadComponent: (importFn: () => Promise<any>) => {
    const componentImport = importFn();
    return componentImport;
  }
};

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number>();

  static startMeasurement(name: string): void {
    this.measurements.set(name, performance.now());
  }

  static endMeasurement(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`No measurement started for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(name);

    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    return duration;
  }

  static measureAsync = async <T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    this.startMeasurement(name);
    try {
      const result = await operation();
      this.endMeasurement(name);
      return result;
    } catch (error) {
      this.endMeasurement(name);
      throw error;
    }
  };

  static measureSync = <T>(name: string, operation: () => T): T => {
    this.startMeasurement(name);
    try {
      const result = operation();
      this.endMeasurement(name);
      return result;
    } catch (error) {
      this.endMeasurement(name);
      throw error;
    }
  };
}

/**
 * Memory management utilities
 */
export const MemoryManager = {
  /**
   * Clean up event listeners
   */
  useCleanup: (cleanup: () => void, deps: any[] = []) => {
    useEffect(() => {
      return cleanup;
    }, deps);
  },

  /**
   * Prevent memory leaks in async operations
   */
  useMountedRef: () => {
    const mountedRef = useRef(true);

    useEffect(() => {
      return () => {
        mountedRef.current = false;
      };
    }, []);

    return mountedRef;
  },

  /**
   * Debounced state updates
   */
  useDebouncedState: <T>(initialValue: T, delay: number = 300) => {
    const [value, setValue] = useState(initialValue);
    const [debouncedValue, setDebouncedValue] = useState(initialValue);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => clearTimeout(timer);
    }, [value, delay]);

    return [debouncedValue, setValue] as const;
  }
};

/**
 * Network optimization
 */
export const NetworkOptimizer = {
  /**
   * Batch API requests
   */
  batchRequests: <T>(
    requests: (() => Promise<T>)[],
    batchSize: number = 5
  ): Promise<T[]> => {
    const batches: (() => Promise<T>)[][] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }

    return batches.reduce(async (acc, batch) => {
      const results = await acc;
      const batchResults = await Promise.all(batch.map(request => request()));
      return [...results, ...batchResults];
    }, Promise.resolve([] as T[]));
  },

  /**
   * Request deduplication
   */
  deduplicateRequests: (() => {
    const pendingRequests = new Map<string, Promise<any>>();

    return <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
      if (pendingRequests.has(key)) {
        return pendingRequests.get(key)!;
      }

      const promise = requestFn().finally(() => {
        pendingRequests.delete(key);
      });

      pendingRequests.set(key, promise);
      return promise;
    };
  })()
};
