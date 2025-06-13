/**
 * Analytics and user behavior tracking system
 * Privacy-focused analytics with user consent management
 */

interface AnalyticsEvent {
  name: string;
  category: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface UserSession {
  id: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: AnalyticsEvent[];
  userAgent: string;
  referrer: string;
  viewport: { width: number; height: number };
}

interface AnalyticsConfig {
  enableTracking: boolean;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enableUserInteractionTracking: boolean;
  sessionTimeout: number; // in milliseconds
  batchSize: number;
  flushInterval: number; // in milliseconds
}

class AnalyticsManager {
  private static instance: AnalyticsManager;
  private config: AnalyticsConfig;
  private session: UserSession;
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private consentGiven: boolean = false;

  private constructor() {
    this.config = {
      enableTracking: false,
      enablePerformanceTracking: true,
      enableErrorTracking: true,
      enableUserInteractionTracking: true,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
    };

    this.session = this.createNewSession();
    this.setupEventListeners();
  }

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * Initialize analytics with user consent
   */
  init(consent: boolean = false): void {
    this.consentGiven = consent;
    this.config.enableTracking = consent;

    if (consent) {
      console.log('📊 Analytics initialized with user consent');
      this.startFlushTimer();
      this.trackPageView();
    } else {
      console.log('📊 Analytics initialized without tracking (no consent)');
    }
  }

  /**
   * Update user consent
   */
  setConsent(consent: boolean): void {
    this.consentGiven = consent;
    this.config.enableTracking = consent;

    if (consent) {
      console.log('✅ User granted analytics consent');
      this.startFlushTimer();
    } else {
      console.log('❌ User revoked analytics consent');
      this.stopFlushTimer();
      this.clearData();
    }
  }

  /**
   * Track custom event
   */
  track(name: string, category: string, properties?: Record<string, any>): void {
    if (!this.config.enableTracking) return;

    const event: AnalyticsEvent = {
      name,
      category,
      properties: this.sanitizeProperties(properties),
      timestamp: Date.now(),
      sessionId: this.session.id,
    };

    this.addEvent(event);
    this.updateSessionActivity();
  }

  /**
   * Track page view
   */
  trackPageView(path?: string): void {
    if (!this.config.enableTracking) return;

    const currentPath = path || window.location.pathname;
    
    this.track('page_view', 'navigation', {
      path: currentPath,
      title: document.title,
      referrer: document.referrer,
      viewport: this.getViewportSize(),
    });

    this.session.pageViews++;
  }

  /**
   * Track user interaction
   */
  trackInteraction(element: string, action: string, properties?: Record<string, any>): void {
    if (!this.config.enableUserInteractionTracking) return;

    this.track('user_interaction', 'engagement', {
      element,
      action,
      ...properties,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, properties?: Record<string, any>): void {
    if (!this.config.enablePerformanceTracking) return;

    this.track('performance', 'metrics', {
      metric,
      value,
      ...properties,
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    if (!this.config.enableErrorTracking) return;

    this.track('error', 'system', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context: this.sanitizeProperties(context),
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, category?: string, resultsCount?: number): void {
    this.track('search', 'content', {
      query: query.toLowerCase(),
      category,
      resultsCount,
    });
  }

  /**
   * Track content engagement
   */
  trackContentEngagement(contentId: string, contentType: string, action: string, properties?: Record<string, any>): void {
    this.track('content_engagement', 'content', {
      contentId,
      contentType,
      action,
      ...properties,
    });
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): any {
    return {
      session: {
        id: this.session.id,
        duration: Date.now() - this.session.startTime,
        pageViews: this.session.pageViews,
        eventCount: this.session.events.length,
      },
      queueSize: this.eventQueue.length,
      consentGiven: this.consentGiven,
      config: this.config,
    };
  }

  /**
   * Create new session
   */
  private createNewSession(): UserSession {
    return {
      id: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: [],
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewport: this.getViewportSize(),
    };
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden', 'navigation');
      } else {
        this.track('page_visible', 'navigation');
      }
    });

    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      if (!this.config.enableUserInteractionTracking) return;

      const target = event.target as HTMLElement;
      
      // Track button clicks
      if (target.tagName === 'BUTTON') {
        this.trackInteraction('button', 'click', {
          text: target.textContent?.trim(),
          className: target.className,
        });
      }

      // Track link clicks
      if (target.tagName === 'A') {
        const href = (target as HTMLAnchorElement).href;
        this.trackInteraction('link', 'click', {
          href,
          text: target.textContent?.trim(),
          external: !href.includes(window.location.hostname),
        });
      }
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = this.throttle(() => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Track milestone scroll depths
        if (scrollDepth >= 25 && scrollDepth < 50 && maxScrollDepth < 25) {
          this.track('scroll_depth', 'engagement', { depth: 25 });
        } else if (scrollDepth >= 50 && scrollDepth < 75 && maxScrollDepth < 50) {
          this.track('scroll_depth', 'engagement', { depth: 50 });
        } else if (scrollDepth >= 75 && scrollDepth < 90 && maxScrollDepth < 75) {
          this.track('scroll_depth', 'engagement', { depth: 75 });
        } else if (scrollDepth >= 90 && maxScrollDepth < 90) {
          this.track('scroll_depth', 'engagement', { depth: 90 });
        }
      }
    }, 1000);

    window.addEventListener('scroll', trackScrollDepth);

    // Track session end
    window.addEventListener('beforeunload', () => {
      this.track('session_end', 'navigation', {
        duration: Date.now() - this.session.startTime,
        pageViews: this.session.pageViews,
        eventCount: this.session.events.length,
      });
      this.flush();
    });
  }

  /**
   * Add event to queue
   */
  private addEvent(event: AnalyticsEvent): void {
    this.eventQueue.push(event);
    this.session.events.push(event);

    // Auto-flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Update session activity
   */
  private updateSessionActivity(): void {
    const now = Date.now();
    
    // Check if session has expired
    if (now - this.session.lastActivity > this.config.sessionTimeout) {
      this.session = this.createNewSession();
    }
    
    this.session.lastActivity = now;
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) return;
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Stop flush timer
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Flush events to storage/server
   */
  private flush(): void {
    if (this.eventQueue.length === 0) return;

    // In a real implementation, you would send events to your analytics server
    // For now, we'll store them locally
    try {
      const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      const allEvents = [...existingEvents, ...this.eventQueue];
      
      // Keep only last 1000 events to prevent storage overflow
      const recentEvents = allEvents.slice(-1000);
      localStorage.setItem('analytics_events', JSON.stringify(recentEvents));
      
      console.log(`📊 Flushed ${this.eventQueue.length} analytics events`);
      this.eventQueue = [];
    } catch (error) {
      console.error('❌ Failed to flush analytics events:', error);
    }
  }

  /**
   * Clear all analytics data
   */
  private clearData(): void {
    this.eventQueue = [];
    this.session.events = [];
    localStorage.removeItem('analytics_events');
    console.log('🗑️ Analytics data cleared');
  }

  /**
   * Sanitize properties to remove sensitive data
   */
  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> {
    if (!properties) return {};

    const sanitized: Record<string, any> = {};
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'email', 'phone'];

    for (const [key, value] of Object.entries(properties)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > 1000) {
        sanitized[key] = value.substring(0, 1000) + '...';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get viewport size
   */
  private getViewportSize(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  /**
   * Throttle function
   */
  private throttle(func: Function, delay: number): Function {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    
    return function (...args: any[]) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(null, args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(null, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }
}

// Export singleton instance
export const analytics = AnalyticsManager.getInstance();

/**
 * React hook for analytics
 */
export const useAnalytics = () => {
  const trackPageView = (path?: string) => analytics.trackPageView(path);
  const trackEvent = (name: string, category: string, properties?: Record<string, any>) => 
    analytics.track(name, category, properties);
  const trackInteraction = (element: string, action: string, properties?: Record<string, any>) =>
    analytics.trackInteraction(element, action, properties);
  const trackSearch = (query: string, category?: string, resultsCount?: number) =>
    analytics.trackSearch(query, category, resultsCount);
  const trackContentEngagement = (contentId: string, contentType: string, action: string, properties?: Record<string, any>) =>
    analytics.trackContentEngagement(contentId, contentType, action, properties);

  return {
    trackPageView,
    trackEvent,
    trackInteraction,
    trackSearch,
    trackContentEngagement,
    getSummary: () => analytics.getAnalyticsSummary(),
  };
};
