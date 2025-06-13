// Performance monitoring and analytics for Next.js application

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url?: string;
  userAgent?: string;
  connectionType?: string;
}

interface WebVitalsMetric {
  id: string;
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private webVitalsMetrics: WebVitalsMetric[] = [];
  private isClient = typeof window !== 'undefined';

  constructor() {
    if (this.isClient) {
      this.initializeWebVitals();
      this.initializeCustomMetrics();
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private initializeWebVitals() {
    // Dynamic import to avoid SSR issues
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(this.handleWebVital.bind(this));
      onFID(this.handleWebVital.bind(this));
      onFCP(this.handleWebVital.bind(this));
      onLCP(this.handleWebVital.bind(this));
      onTTFB(this.handleWebVital.bind(this));
      onINP(this.handleWebVital.bind(this));
    }).catch(error => {
      console.warn('Web Vitals not available:', error);
    });
  }

  /**
   * Initialize custom performance metrics
   */
  private initializeCustomMetrics() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.recordPageLoadMetrics();
      }, 0);
    });

    // Monitor navigation performance
    this.observeNavigationTiming();
    
    // Monitor resource loading
    this.observeResourceTiming();
    
    // Monitor long tasks
    this.observeLongTasks();
  }

  /**
   * Handle Web Vitals metrics
   */
  private handleWebVital(metric: WebVitalsMetric) {
    this.webVitalsMetrics.push(metric);
    
    console.log(`📊 Web Vital - ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta
    });

    // Send to analytics (implement your preferred analytics service)
    this.sendToAnalytics('web-vital', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating,
      page_url: window.location.pathname
    });
  }

  /**
   * Record page load metrics
   */
  private recordPageLoadMetrics() {
    if (!this.isClient || !window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    const metrics = [
      { name: 'DNS_Lookup', value: navigation.domainLookupEnd - navigation.domainLookupStart },
      { name: 'TCP_Connection', value: navigation.connectEnd - navigation.connectStart },
      { name: 'TLS_Negotiation', value: navigation.secureConnectionStart ? navigation.connectEnd - navigation.secureConnectionStart : 0 },
      { name: 'Request_Time', value: navigation.responseStart - navigation.requestStart },
      { name: 'Response_Time', value: navigation.responseEnd - navigation.responseStart },
      { name: 'DOM_Processing', value: navigation.domContentLoadedEventEnd - navigation.responseEnd },
      { name: 'Resource_Loading', value: navigation.loadEventStart - navigation.domContentLoadedEventEnd },
      { name: 'Total_Load_Time', value: navigation.loadEventEnd - navigation.navigationStart }
    ];

    metrics.forEach(metric => {
      if (metric.value > 0) {
        this.recordMetric(metric.name, metric.value);
      }
    });
  }

  /**
   * Observe navigation timing
   */
  private observeNavigationTiming() {
    if (!this.isClient || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('Page_Load_Time', navEntry.loadEventEnd - navEntry.navigationStart);
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.warn('Navigation timing observer not supported:', error);
    }
  }

  /**
   * Observe resource timing
   */
  private observeResourceTiming() {
    if (!this.isClient || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Track slow resources (> 1 second)
          if (resourceEntry.duration > 1000) {
            this.recordMetric('Slow_Resource', resourceEntry.duration, {
              resource_name: resourceEntry.name,
              resource_type: this.getResourceType(resourceEntry.name)
            });
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource timing observer not supported:', error);
    }
  }

  /**
   * Observe long tasks
   */
  private observeLongTasks() {
    if (!this.isClient || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Long tasks are > 50ms
          this.recordMetric('Long_Task', entry.duration, {
            task_start: entry.startTime
          });
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task observer not supported:', error);
    }
  }

  /**
   * Record a custom metric
   */
  recordMetric(name: string, value: number, additionalData?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: this.isClient ? window.location.pathname : undefined,
      userAgent: this.isClient ? navigator.userAgent : undefined,
      connectionType: this.getConnectionType()
    };

    this.metrics.push(metric);

    console.log(`⚡ Performance Metric - ${name}:`, value, 'ms');

    // Send to analytics
    this.sendToAnalytics('performance-metric', {
      metric_name: name,
      metric_value: value,
      ...additionalData
    });
  }

  /**
   * Get connection type
   */
  private getConnectionType(): string | undefined {
    if (!this.isClient) return undefined;
    
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  /**
   * Send metrics to analytics service
   */
  private sendToAnalytics(eventType: string, data: Record<string, any>) {
    // Implement your preferred analytics service here
    // Examples: Google Analytics, Mixpanel, PostHog, etc.
    
    if (this.isClient && (window as any).gtag) {
      // Google Analytics 4 example
      (window as any).gtag('event', eventType, data);
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📈 Analytics Event - ${eventType}:`, data);
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 60000); // Last minute

    const summary = {
      totalMetrics: this.metrics.length,
      recentMetrics: recentMetrics.length,
      webVitals: this.webVitalsMetrics.reduce((acc, metric) => {
        acc[metric.name] = {
          value: metric.value,
          rating: metric.rating
        };
        return acc;
      }, {} as Record<string, any>),
      averageLoadTime: this.getAverageMetric('Total_Load_Time'),
      slowResources: this.metrics.filter(m => m.name === 'Slow_Resource').length,
      longTasks: this.metrics.filter(m => m.name === 'Long_Task').length,
      connectionType: this.getConnectionType()
    };

    return summary;
  }

  /**
   * Get average value for a metric
   */
  private getAverageMetric(metricName: string): number {
    const metrics = this.metrics.filter(m => m.name === metricName);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return Math.round(sum / metrics.length);
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics() {
    return {
      performance: this.metrics,
      webVitals: this.webVitalsMetrics,
      summary: this.getPerformanceSummary(),
      timestamp: Date.now()
    };
  }

  /**
   * Clear old metrics (keep last 1000)
   */
  cleanupMetrics() {
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    if (this.webVitalsMetrics.length > 100) {
      this.webVitalsMetrics = this.webVitalsMetrics.slice(-100);
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper functions
export const performanceHelpers = {
  // Start timing a custom operation
  startTiming: (name: string) => {
    const startTime = performance.now();
    return {
      end: () => {
        const duration = performance.now() - startTime;
        performanceMonitor.recordMetric(name, duration);
        return duration;
      }
    };
  },

  // Measure API call performance
  measureApiCall: async <T>(name: string, apiCall: () => Promise<T>): Promise<T> => {
    const timer = performanceHelpers.startTiming(`API_${name}`);
    try {
      const result = await apiCall();
      timer.end();
      return result;
    } catch (error) {
      timer.end();
      performanceMonitor.recordMetric(`API_${name}_Error`, 1);
      throw error;
    }
  },

  // Measure component render time
  measureRender: (componentName: string, renderFn: () => void) => {
    const timer = performanceHelpers.startTiming(`Render_${componentName}`);
    renderFn();
    timer.end();
  }
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Clean up metrics periodically
  setInterval(() => {
    performanceMonitor.cleanupMetrics();
  }, 5 * 60 * 1000); // Every 5 minutes
}
