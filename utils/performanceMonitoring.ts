/**
 * Performance monitoring and optimization utilities
 */

import { PerformanceMonitor, MemoCache } from './performance';

interface PerformanceMetrics {
  componentRenders: Map<string, number[]>;
  apiCalls: Map<string, number[]>;
  userInteractions: Map<string, number[]>;
  memoryUsage: number[];
  cacheHitRates: Map<string, { hits: number; misses: number }>;
}

class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: PerformanceMetrics;
  private isEnabled: boolean = false;

  private constructor() {
    this.metrics = {
      componentRenders: new Map(),
      apiCalls: new Map(),
      userInteractions: new Map(),
      memoryUsage: [],
      cacheHitRates: new Map(),
    };
  }

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  enable(): void {
    this.isEnabled = true;
    this.startMemoryMonitoring();
    console.log('🚀 Performance monitoring enabled');
  }

  disable(): void {
    this.isEnabled = false;
    console.log('⏹️ Performance monitoring disabled');
  }

  /**
   * Track component render performance
   */
  trackComponentRender(componentName: string, renderTime: number): void {
    if (!this.isEnabled) return;

    if (!this.metrics.componentRenders.has(componentName)) {
      this.metrics.componentRenders.set(componentName, []);
    }

    this.metrics.componentRenders.get(componentName)!.push(renderTime);

    // Keep only last 100 measurements
    const times = this.metrics.componentRenders.get(componentName)!;
    if (times.length > 100) {
      times.shift();
    }

    // Log slow renders
    if (renderTime > 16) { // 16ms = 60fps threshold
      console.warn(`🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint: string, duration: number, success: boolean): void {
    if (!this.isEnabled) return;

    const key = `${endpoint}-${success ? 'success' : 'error'}`;
    
    if (!this.metrics.apiCalls.has(key)) {
      this.metrics.apiCalls.set(key, []);
    }

    this.metrics.apiCalls.get(key)!.push(duration);

    // Log slow API calls
    if (duration > 2000) { // 2 seconds
      console.warn(`🐌 Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Track user interaction performance
   */
  trackUserInteraction(interaction: string, duration: number): void {
    if (!this.isEnabled) return;

    if (!this.metrics.userInteractions.has(interaction)) {
      this.metrics.userInteractions.set(interaction, []);
    }

    this.metrics.userInteractions.get(interaction)!.push(duration);

    // Log slow interactions
    if (duration > 100) { // 100ms threshold for interactions
      console.warn(`🐌 Slow interaction: ${interaction} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Track cache performance
   */
  trackCacheHit(cacheKey: string, isHit: boolean): void {
    if (!this.isEnabled) return;

    if (!this.metrics.cacheHitRates.has(cacheKey)) {
      this.metrics.cacheHitRates.set(cacheKey, { hits: 0, misses: 0 });
    }

    const stats = this.metrics.cacheHitRates.get(cacheKey)!;
    if (isHit) {
      stats.hits++;
    } else {
      stats.misses++;
    }
  }

  /**
   * Start monitoring memory usage
   */
  private startMemoryMonitoring(): void {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return;
    }

    const checkMemory = () => {
      if (!this.isEnabled) return;

      const memory = (performance as any).memory;
      this.metrics.memoryUsage.push(memory.usedJSHeapSize);

      // Keep only last 100 measurements
      if (this.metrics.memoryUsage.length > 100) {
        this.metrics.memoryUsage.shift();
      }

      // Check for memory leaks (increasing trend)
      if (this.metrics.memoryUsage.length >= 10) {
        const recent = this.metrics.memoryUsage.slice(-10);
        const trend = this.calculateTrend(recent);
        
        if (trend > 1000000) { // 1MB increase trend
          console.warn('🚨 Potential memory leak detected');
        }
      }

      setTimeout(checkMemory, 5000); // Check every 5 seconds
    };

    checkMemory();
  }

  /**
   * Calculate trend in array of numbers
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  /**
   * Get performance report
   */
  getReport(): any {
    const report: any = {
      timestamp: new Date().toISOString(),
      components: {},
      apiCalls: {},
      userInteractions: {},
      memory: {},
      cache: {},
    };

    // Component render stats
    for (const [component, times] of this.metrics.componentRenders) {
      report.components[component] = this.calculateStats(times);
    }

    // API call stats
    for (const [endpoint, times] of this.metrics.apiCalls) {
      report.apiCalls[endpoint] = this.calculateStats(times);
    }

    // User interaction stats
    for (const [interaction, times] of this.metrics.userInteractions) {
      report.userInteractions[interaction] = this.calculateStats(times);
    }

    // Memory stats
    if (this.metrics.memoryUsage.length > 0) {
      report.memory = {
        current: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1],
        average: this.metrics.memoryUsage.reduce((a, b) => a + b, 0) / this.metrics.memoryUsage.length,
        trend: this.calculateTrend(this.metrics.memoryUsage),
      };
    }

    // Cache stats
    for (const [key, stats] of this.metrics.cacheHitRates) {
      const total = stats.hits + stats.misses;
      report.cache[key] = {
        hitRate: total > 0 ? (stats.hits / total) * 100 : 0,
        totalRequests: total,
      };
    }

    return report;
  }

  /**
   * Calculate statistics for array of numbers
   */
  private calculateStats(values: number[]): any {
    if (values.length === 0) return {};

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      average: sum / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[Math.floor(sorted.length * 0.95)],
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = {
      componentRenders: new Map(),
      apiCalls: new Map(),
      userInteractions: new Map(),
      memoryUsage: [],
      cacheHitRates: new Map(),
    };
  }
}

// Export singleton instance
export const performanceTracker = PerformanceTracker.getInstance();

/**
 * React hook for tracking component performance
 */
export const usePerformanceTracking = (componentName: string) => {
  const trackRender = (renderTime: number) => {
    performanceTracker.trackComponentRender(componentName, renderTime);
  };

  const trackInteraction = (interactionName: string, duration: number) => {
    performanceTracker.trackUserInteraction(`${componentName}-${interactionName}`, duration);
  };

  return { trackRender, trackInteraction };
};

/**
 * Higher-order component for automatic performance tracking
 */
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;

  return React.forwardRef<any, P>((props, ref) => {
    const renderStart = performance.now();

    React.useEffect(() => {
      const renderTime = performance.now() - renderStart;
      performanceTracker.trackComponentRender(displayName, renderTime);
    });

    return React.createElement(WrappedComponent, { ...props, ref });
  });
};

/**
 * Performance monitoring setup for development
 */
export const setupPerformanceMonitoring = () => {
  if (process.env.NODE_ENV === 'development') {
    performanceTracker.enable();

    // Log performance report every 30 seconds
    setInterval(() => {
      const report = performanceTracker.getReport();
      console.group('📊 Performance Report');
      console.table(report.components);
      console.table(report.apiCalls);
      console.table(report.cache);
      console.groupEnd();
    }, 30000);

    // Clear cache periodically to prevent memory leaks
    setInterval(() => {
      MemoCache.clearExpired();
    }, 60000);
  }
};
