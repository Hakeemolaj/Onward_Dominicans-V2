/**
 * Production configuration
 * Optimized settings for production deployment
 */

export const productionConfig = {
  // Environment
  environment: 'production',
  debug: false,
  
  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'https://onward-dominicans-backend-v2.onrender.com',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Supabase Configuration
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL!,
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY!,
    enableRealtime: true,
    enableAuth: true,
  },

  // Analytics Configuration
  analytics: {
    googleAnalyticsId: process.env.REACT_APP_GOOGLE_ANALYTICS_ID,
    enableTracking: true,
    enablePerformanceTracking: true,
    enableErrorTracking: true,
    sampleRate: 0.1, // 10% sampling for performance
    errorSampleRate: 1.0, // 100% error tracking
  },

  // Error Tracking
  sentry: {
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1,
    enableTracing: true,
  },

  // Performance Configuration
  performance: {
    enableServiceWorker: true,
    enableCodeSplitting: true,
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableCaching: true,
    cacheStrategy: 'stale-while-revalidate',
    maxCacheSize: 100 * 1024 * 1024, // 100MB
    cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Security Configuration
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableFrameOptions: true,
    enableContentTypeOptions: true,
    trustedDomains: [
      'odmailsu.vercel.app',
      'onward-dominicans-backend-v2.onrender.com',
      'supabase.co',
      'google-analytics.com',
      'googletagmanager.com',
    ],
  },

  // CDN Configuration
  cdn: {
    enabled: true,
    baseUrl: 'https://cdn.odmailsu.com',
    imageOptimization: {
      formats: ['webp', 'avif', 'jpg'],
      qualities: [60, 80, 90],
      sizes: [320, 640, 960, 1280, 1920],
    },
  },

  // Cache Configuration
  cache: {
    redis: {
      enabled: false, // Enable if using Redis
      url: process.env.REDIS_URL,
      ttl: 3600, // 1 hour
    },
    memory: {
      enabled: true,
      maxSize: 50 * 1024 * 1024, // 50MB
      ttl: 1800, // 30 minutes
    },
    indexedDB: {
      enabled: true,
      dbName: 'OnwardDominicansCache',
      version: 1,
      maxSize: 100 * 1024 * 1024, // 100MB
    },
  },

  // Real-time Configuration
  realtime: {
    websocket: {
      url: process.env.REACT_APP_WS_URL || 'wss://onward-dominicans-backend-v2.onrender.com/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
    },
    features: {
      liveComments: true,
      liveNotifications: true,
      liveUpdates: true,
      presenceIndicators: false, // Disable for performance
    },
  },

  // SEO Configuration
  seo: {
    siteName: 'Onward Dominicans',
    siteUrl: 'https://odmailsu.vercel.app',
    defaultTitle: 'Onward Dominicans - Dominican Culture & Community',
    defaultDescription: 'Celebrating Dominican culture, heritage, and community worldwide. Stay connected with news, events, and stories from the Dominican Republic and diaspora.',
    defaultImage: '/images/og-default.jpg',
    twitterHandle: '@OnwardDominicans',
    facebookAppId: process.env.REACT_APP_FACEBOOK_APP_ID,
    enableStructuredData: true,
    enableSitemap: true,
    enableRobotsTxt: true,
  },

  // Internationalization
  i18n: {
    defaultLocale: 'en',
    supportedLocales: ['en', 'es'],
    fallbackLocale: 'en',
    enableAutoDetection: true,
    enableLocalStorage: true,
  },

  // Feature Flags
  features: {
    enableComments: true,
    enableSharing: true,
    enableNotifications: true,
    enableDarkMode: true,
    enableOfflineMode: true,
    enablePWA: true,
    enableVirtualScrolling: true,
    enableAdvancedSearch: true,
    enableContentManagement: false, // Disable for public users
    enableAnalyticsDashboard: false, // Admin only
  },

  // Rate Limiting
  rateLimiting: {
    enabled: true,
    requests: {
      perMinute: 60,
      perHour: 1000,
      perDay: 10000,
    },
    api: {
      perMinute: 30,
      perHour: 500,
      perDay: 5000,
    },
  },

  // Monitoring Configuration
  monitoring: {
    enableHealthChecks: true,
    enablePerformanceMonitoring: true,
    enableErrorTracking: true,
    enableUptime: true,
    healthCheckInterval: 60000, // 1 minute
    performanceSampleRate: 0.1, // 10%
    errorSampleRate: 1.0, // 100%
    endpoints: {
      health: '/api/health',
      metrics: '/api/metrics',
      status: '/api/status',
    },
  },

  // Logging Configuration
  logging: {
    level: 'warn', // Only warnings and errors in production
    enableConsole: false,
    enableRemote: true,
    remoteEndpoint: process.env.REACT_APP_LOG_ENDPOINT,
    enableStructuredLogging: true,
    enableSourceMaps: false, // Disable for security
  },

  // Build Configuration
  build: {
    enableSourceMaps: false,
    enableMinification: true,
    enableCompression: true,
    enableTreeShaking: true,
    enableCodeSplitting: true,
    chunkSizeWarningLimit: 500 * 1024, // 500KB
    bundleAnalyzer: false,
  },

  // Social Features
  social: {
    enableSharing: true,
    enableComments: true,
    enableLikes: true,
    enableFollowing: false, // Future feature
    platforms: {
      facebook: true,
      twitter: true,
      linkedin: true,
      whatsapp: true,
      email: true,
    },
  },

  // Content Configuration
  content: {
    maxArticleLength: 50000, // 50k characters
    maxImageSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    enableAutoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    enableVersioning: false, // Future feature
  },

  // Mobile Configuration
  mobile: {
    enableTouchGestures: true,
    enableHapticFeedback: true,
    enablePullToRefresh: true,
    enableSwipeNavigation: true,
    optimizeForLowEnd: true,
    enableAdaptiveLoading: true,
  },

  // Accessibility Configuration
  accessibility: {
    enableScreenReader: true,
    enableKeyboardNavigation: true,
    enableHighContrast: true,
    enableReducedMotion: true,
    enableFocusManagement: true,
    enableAriaLabels: true,
    wcagLevel: 'AA',
  },

  // Third-party Services
  thirdParty: {
    googleMaps: {
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      enabled: false, // Enable if needed
    },
    cloudinary: {
      cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
      enabled: false, // Enable for image optimization
    },
    stripe: {
      publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
      enabled: false, // Enable for payments
    },
  },

  // Deployment Configuration
  deployment: {
    platform: 'vercel',
    region: 'iad1', // US East
    enablePreview: true,
    enableAnalytics: true,
    enableSpeedInsights: true,
    enableWebVitals: true,
  },
};

// Environment-specific overrides
export const getConfig = () => {
  const config = { ...productionConfig };

  // Override for staging
  if (process.env.REACT_APP_ENV === 'staging') {
    config.analytics.enableTracking = false;
    config.logging.level = 'debug';
    config.logging.enableConsole = true;
    config.features.enableContentManagement = true;
    config.features.enableAnalyticsDashboard = true;
  }

  // Override for development
  if (process.env.NODE_ENV === 'development') {
    config.debug = true;
    config.analytics.enableTracking = false;
    config.logging.level = 'debug';
    config.logging.enableConsole = true;
    config.build.enableSourceMaps = true;
    config.build.bundleAnalyzer = true;
    config.features.enableContentManagement = true;
    config.features.enableAnalyticsDashboard = true;
    config.monitoring.performanceSampleRate = 1.0;
  }

  return config;
};

export default getConfig();
