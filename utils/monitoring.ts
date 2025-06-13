/**
 * Comprehensive monitoring and observability system
 * Provides error tracking, performance monitoring, and health checks
 */

import { analytics } from './analytics';
import { performanceTracker } from './performanceMonitoring';

interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

interface PerformanceMetrics {
  navigation: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
  };
  resources: Array<{
    name: string;
    type: string;
    duration: number;
    size: number;
  }>;
  memory?: {
    used: number;
    total: number;
    limit: number;
  };
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastCheck: number;
  details?: Record<string, any>;
}

interface MonitoringConfig {
  enableErrorTracking: boolean;
  enablePerformanceMonitoring: boolean;
  enableHealthChecks: boolean;
  errorSampleRate: number;
  performanceSampleRate: number;
  healthCheckInterval: number;
  maxErrorsPerSession: number;
}

class MonitoringManager {
  private static instance: MonitoringManager;
  private config: MonitoringConfig;
  private errorCount: number = 0;
  private sessionId: string;
  private healthChecks: Map<string, HealthCheck> = new Map();
  private healthCheckTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      enableErrorTracking: true,
      enablePerformanceMonitoring: true,
      enableHealthChecks: true,
      errorSampleRate: 1.0, // 100% in development, reduce in production
      performanceSampleRate: 0.1, // 10% sampling
      healthCheckInterval: 60000, // 1 minute
      maxErrorsPerSession: 50,
    };

    this.sessionId = this.generateSessionId();
    this.setupErrorTracking();
    this.setupPerformanceMonitoring();
    this.setupHealthChecks();
  }

  static getInstance(): MonitoringManager {
    if (!MonitoringManager.instance) {
      MonitoringManager.instance = new MonitoringManager();
    }
    return MonitoringManager.instance;
  }

  /**
   * Setup global error tracking
   */
  private setupErrorTracking(): void {
    if (!this.config.enableErrorTracking) return;

    // Catch unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        line: event.lineno,
        column: event.colno,
        severity: 'high',
        tags: ['javascript', 'unhandled'],
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        severity: 'medium',
        tags: ['promise', 'unhandled'],
      });
    });

    // Catch React errors (if using error boundary)
    this.setupReactErrorBoundary();
  }

  /**
   * Setup React error boundary integration
   */
  private setupReactErrorBoundary(): void {
    // This would be integrated with your React error boundary
    (window as any).__MONITORING_REPORT_ERROR__ = (error: Error, errorInfo: any) => {
      this.reportError({
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        severity: 'high',
        tags: ['react', 'component'],
        context: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
        },
      });
    };
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (!this.config.enablePerformanceMonitoring) return;

    // Monitor Core Web Vitals
    this.observeWebVitals();

    // Monitor resource loading
    this.observeResourceTiming();

    // Monitor memory usage
    this.observeMemoryUsage();
  }

  /**
   * Observe Core Web Vitals
   */
  private observeWebVitals(): void {
    // First Contentful Paint
    this.observePerformanceEntry('paint', (entries) => {
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.reportMetric('first_contentful_paint', entry.startTime);
        }
      });
    });

    // Largest Contentful Paint
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        this.reportMetric('largest_contentful_paint', lastEntry.startTime);
      }
    });

    // First Input Delay
    this.observePerformanceEntry('first-input', (entries) => {
      entries.forEach((entry) => {
        this.reportMetric('first_input_delay', (entry as any).processingStart - entry.startTime);
      });
    });

    // Cumulative Layout Shift
    this.observePerformanceEntry('layout-shift', (entries) => {
      let cumulativeScore = 0;
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          cumulativeScore += (entry as any).value;
        }
      });
      this.reportMetric('cumulative_layout_shift', cumulativeScore);
    });
  }

  /**
   * Observe performance entries
   */
  private observePerformanceEntry(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          callback(list.getEntries());
        });
        observer.observe({ type, buffered: true });
      } catch (error) {
        console.warn(`Failed to observe ${type}:`, error);
      }
    }
  }

  /**
   * Observe resource timing
   */
  private observeResourceTiming(): void {
    this.observePerformanceEntry('resource', (entries) => {
      entries.forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        
        // Report slow resources
        if (resource.duration > 1000) { // > 1 second
          this.reportMetric('slow_resource', resource.duration, {
            name: resource.name,
            type: this.getResourceType(resource.name),
            size: resource.transferSize || 0,
          });
        }
      });
    });
  }

  /**
   * Observe memory usage
   */
  private observeMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.reportMetric('memory_usage', memory.usedJSHeapSize, {
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        });
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Setup health checks
   */
  private setupHealthChecks(): void {
    if (!this.config.enableHealthChecks) return;

    this.healthCheckTimer = setInterval(() => {
      this.runHealthChecks();
    }, this.config.healthCheckInterval);

    // Initial health check
    setTimeout(() => this.runHealthChecks(), 5000);
  }

  /**
   * Run all health checks
   */
  private async runHealthChecks(): Promise<void> {
    const checks = [
      this.checkAPIHealth(),
      this.checkDatabaseHealth(),
      this.checkCacheHealth(),
      this.checkRealtimeHealth(),
    ];

    await Promise.allSettled(checks);
  }

  /**
   * Check API health
   */
  private async checkAPIHealth(): Promise<void> {
    const startTime = performance.now();
    
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        timeout: 5000,
      } as any);

      const responseTime = performance.now() - startTime;
      const status = response.ok ? 'healthy' : 'degraded';

      this.updateHealthCheck('api', {
        service: 'api',
        status,
        responseTime,
        lastCheck: Date.now(),
        details: {
          statusCode: response.status,
          url: '/api/health',
        },
      });
    } catch (error) {
      this.updateHealthCheck('api', {
        service: 'api',
        status: 'unhealthy',
        responseTime: performance.now() - startTime,
        lastCheck: Date.now(),
        details: {
          error: error.message,
        },
      });
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<void> {
    // This would check your database connection
    // For now, we'll simulate it
    const startTime = performance.now();
    
    try {
      // Simulate database check
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.updateHealthCheck('database', {
        service: 'database',
        status: 'healthy',
        responseTime: performance.now() - startTime,
        lastCheck: Date.now(),
      });
    } catch (error) {
      this.updateHealthCheck('database', {
        service: 'database',
        status: 'unhealthy',
        responseTime: performance.now() - startTime,
        lastCheck: Date.now(),
        details: { error: error.message },
      });
    }
  }

  /**
   * Check cache health
   */
  private async checkCacheHealth(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Check if IndexedDB is accessible
      if ('indexedDB' in window) {
        const testKey = 'health-check';
        localStorage.setItem(testKey, 'ok');
        localStorage.removeItem(testKey);
      }

      this.updateHealthCheck('cache', {
        service: 'cache',
        status: 'healthy',
        responseTime: performance.now() - startTime,
        lastCheck: Date.now(),
      });
    } catch (error) {
      this.updateHealthCheck('cache', {
        service: 'cache',
        status: 'unhealthy',
        responseTime: performance.now() - startTime,
        lastCheck: Date.now(),
        details: { error: error.message },
      });
    }
  }

  /**
   * Check realtime connection health
   */
  private async checkRealtimeHealth(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Check WebSocket connection status
      const isConnected = (window as any).__REALTIME_CONNECTED__ || false;
      
      this.updateHealthCheck('realtime', {
        service: 'realtime',
        status: isConnected ? 'healthy' : 'degraded',
        responseTime: performance.now() - startTime,
        lastCheck: Date.now(),
        details: { connected: isConnected },
      });
    } catch (error) {
      this.updateHealthCheck('realtime', {
        service: 'realtime',
        status: 'unhealthy',
        responseTime: performance.now() - startTime,
        lastCheck: Date.now(),
        details: { error: error.message },
      });
    }
  }

  /**
   * Update health check status
   */
  private updateHealthCheck(service: string, check: HealthCheck): void {
    this.healthChecks.set(service, check);
    
    // Report unhealthy services
    if (check.status === 'unhealthy') {
      this.reportError({
        message: `Service ${service} is unhealthy`,
        url: window.location.href,
        severity: 'high',
        tags: ['health-check', service],
        context: check.details,
      });
    }
  }

  /**
   * Report error
   */
  reportError(error: Partial<ErrorReport>): void {
    if (!this.config.enableErrorTracking) return;
    if (this.errorCount >= this.config.maxErrorsPerSession) return;
    if (Math.random() > this.config.errorSampleRate) return;

    this.errorCount++;

    const errorReport: ErrorReport = {
      id: this.generateId(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      severity: error.severity || 'medium',
      tags: error.tags || [],
      context: error.context,
    };

    // Send to analytics
    analytics.track('error_reported', 'monitoring', {
      errorId: errorReport.id,
      severity: errorReport.severity,
      tags: errorReport.tags,
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Monitoring Error:', errorReport);
    }

    // In production, you would send this to your error tracking service
    this.sendErrorReport(errorReport);
  }

  /**
   * Report performance metric
   */
  reportMetric(name: string, value: number, context?: Record<string, any>): void {
    if (!this.config.enablePerformanceMonitoring) return;
    if (Math.random() > this.config.performanceSampleRate) return;

    analytics.track('performance_metric', 'monitoring', {
      metric: name,
      value,
      context,
    });

    performanceTracker.trackComponentRender(`metric_${name}`, value);
  }

  /**
   * Get health status
   */
  getHealthStatus(): { overall: string; services: HealthCheck[] } {
    const services = Array.from(this.healthChecks.values());
    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;

    let overall = 'healthy';
    if (unhealthyCount > 0) {
      overall = 'unhealthy';
    } else if (degradedCount > 0) {
      overall = 'degraded';
    }

    return { overall, services };
  }

  /**
   * Send error report to external service
   */
  private async sendErrorReport(error: ErrorReport): Promise<void> {
    try {
      // In a real implementation, send to your error tracking service
      // e.g., Sentry, Bugsnag, LogRocket, etc.
      console.log('Error report would be sent:', error);
    } catch (sendError) {
      console.error('Failed to send error report:', sendError);
    }
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Cleanup monitoring
   */
  cleanup(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }
}

// Export singleton
export const monitoring = MonitoringManager.getInstance();

/**
 * React hook for monitoring
 */
export const useMonitoring = () => {
  const reportError = (error: Error, context?: Record<string, any>) => {
    monitoring.reportError({
      message: error.message,
      stack: error.stack,
      severity: 'medium',
      tags: ['react', 'component'],
      context,
    });
  };

  const reportMetric = (name: string, value: number, context?: Record<string, any>) => {
    monitoring.reportMetric(name, value, context);
  };

  const getHealthStatus = () => monitoring.getHealthStatus();

  return {
    reportError,
    reportMetric,
    getHealthStatus,
  };
};
