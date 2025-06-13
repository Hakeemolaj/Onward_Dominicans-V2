// PWA utilities for service worker registration and management

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
}

class PWAManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline = true;
  private updateAvailable = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.setupEventListeners();
    }
  }

  /**
   * Register service worker
   */
  async registerServiceWorker(config: ServiceWorkerConfig = {}) {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('🚫 Service Worker not supported');
      return;
    }

    try {
      console.log('🔧 Registering Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.registration = registration;

      // Handle different service worker states
      if (registration.installing) {
        console.log('📦 Service Worker installing...');
        this.trackInstalling(registration.installing, config);
      } else if (registration.waiting) {
        console.log('⏳ Service Worker waiting...');
        this.updateAvailable = true;
        config.onUpdate?.(registration);
      } else if (registration.active) {
        console.log('✅ Service Worker active');
        config.onSuccess?.(registration);
      }

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found');
        const newWorker = registration.installing;
        if (newWorker) {
          this.trackInstalling(newWorker, config);
        }
      });

      // Check for updates periodically
      this.setupUpdateCheck(registration);

      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Track installing service worker
   */
  private trackInstalling(worker: ServiceWorker, config: ServiceWorkerConfig) {
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New update available
          console.log('🆕 New content available');
          this.updateAvailable = true;
          config.onUpdate?.(this.registration!);
        } else {
          // Content cached for offline use
          console.log('📱 Content cached for offline use');
          config.onOfflineReady?.();
        }
      }
    });
  }

  /**
   * Setup periodic update checks
   */
  private setupUpdateCheck(registration: ServiceWorkerRegistration) {
    // Check for updates every hour
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    // Check for updates when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        registration.update();
      }
    });
  }

  /**
   * Setup event listeners for online/offline status
   */
  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online');
      this.notifyOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 Gone offline');
      this.notifyOnlineStatus(false);
    });
  }

  /**
   * Notify about online status changes
   */
  private notifyOnlineStatus(online: boolean) {
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('pwa:connection-change', {
      detail: { online }
    }));
  }

  /**
   * Skip waiting and activate new service worker
   */
  skipWaiting() {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      this.registration.waiting.addEventListener('statechange', () => {
        if (this.registration?.waiting?.state === 'activated') {
          window.location.reload();
        }
      });
    }
  }

  /**
   * Unregister service worker
   */
  async unregister() {
    if (this.registration) {
      const result = await this.registration.unregister();
      console.log('🗑️ Service Worker unregistered:', result);
      return result;
    }
    return false;
  }

  /**
   * Get service worker status
   */
  getStatus() {
    return {
      isSupported: 'serviceWorker' in navigator,
      isRegistered: !!this.registration,
      isOnline: this.isOnline,
      updateAvailable: this.updateAvailable,
      registration: this.registration
    };
  }

  /**
   * Cache specific URLs
   */
  async cacheUrls(urls: string[]) {
    if (this.registration?.active) {
      this.registration.active.postMessage({
        type: 'CACHE_URLS',
        urls
      });
    }
  }

  /**
   * Request persistent storage
   */
  async requestPersistentStorage() {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const granted = await navigator.storage.persist();
        console.log(granted ? '✅ Persistent storage granted' : '❌ Persistent storage denied');
        return granted;
      } catch (error) {
        console.error('❌ Error requesting persistent storage:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Get storage usage
   */
  async getStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0,
          percentage: estimate.quota ? Math.round((estimate.usage || 0) / estimate.quota * 100) : 0
        };
      } catch (error) {
        console.error('❌ Error getting storage usage:', error);
        return null;
      }
    }
    return null;
  }
}

// Singleton instance
export const pwaManager = new PWAManager();

// Helper functions
export const pwaHelpers = {
  // Check if app is installed
  isInstalled: () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  },

  // Check if PWA features are supported
  isSupported: () => {
    return 'serviceWorker' in navigator && 
           'PushManager' in window &&
           'Notification' in window;
  },

  // Request notification permission
  requestNotificationPermission: async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', permission);
      return permission === 'granted';
    }
    return false;
  },

  // Show notification
  showNotification: (title: string, options: NotificationOptions = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
    return null;
  },

  // Share content (Web Share API)
  share: async (data: ShareData) => {
    if ('share' in navigator) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.log('❌ Share failed or cancelled:', error);
        return false;
      }
    }
    return false;
  },

  // Copy to clipboard
  copyToClipboard: async (text: string) => {
    if ('clipboard' in navigator) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.error('❌ Copy to clipboard failed:', error);
        return false;
      }
    }
    return false;
  }
};

// Auto-register service worker in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  pwaManager.registerServiceWorker({
    onSuccess: (registration) => {
      console.log('🎉 PWA ready for offline use');
    },
    onUpdate: (registration) => {
      console.log('🆕 New content available, please refresh');
      // You can show a toast notification here
    },
    onOfflineReady: () => {
      console.log('📱 App ready for offline use');
    }
  });

  // Request persistent storage
  pwaManager.requestPersistentStorage();
}
