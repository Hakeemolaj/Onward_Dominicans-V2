/**
 * Progressive Web App utilities
 * Handles service worker registration, offline detection, and PWA features
 */

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  updateAvailable: boolean;
  cacheSize: number;
}

class PWAManager {
  private static instance: PWAManager;
  private installPrompt: PWAInstallPrompt | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private state: PWAState = {
    isOnline: navigator.onLine,
    isInstallable: false,
    isInstalled: false,
    updateAvailable: false,
    cacheSize: 0
  };
  private listeners: Map<string, Function[]> = new Map();

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  /**
   * Initialize PWA features
   */
  async init(): Promise<void> {
    console.log('🚀 Initializing PWA features...');

    // Register service worker
    await this.registerServiceWorker();

    // Setup event listeners
    this.setupEventListeners();

    // Check if app is installed
    this.checkInstallStatus();

    // Monitor cache size
    this.monitorCacheSize();

    console.log('✅ PWA features initialized');
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered successfully');

        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.state.updateAvailable = true;
                this.emit('updateAvailable');
              }
            });
          }
        });

        // Listen for controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Setup event listeners for PWA features
   */
  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.state.isOnline = true;
      this.emit('onlineStatusChange', true);
      console.log('🌐 App is online');
    });

    window.addEventListener('offline', () => {
      this.state.isOnline = false;
      this.emit('onlineStatusChange', false);
      console.log('📱 App is offline');
    });

    // Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as any;
      this.state.isInstallable = true;
      this.emit('installable');
      console.log('📱 App is installable');
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      this.state.isInstalled = true;
      this.installPrompt = null;
      this.state.isInstallable = false;
      this.emit('installed');
      console.log('✅ App installed successfully');
    });
  }

  /**
   * Check if app is already installed
   */
  private checkInstallStatus(): void {
    // Check if running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true) {
      this.state.isInstalled = true;
    }
  }

  /**
   * Monitor cache size
   */
  private async monitorCacheSize(): Promise<void> {
    if ('serviceWorker' in navigator && this.registration) {
      try {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          if (event.data.cacheSize !== undefined) {
            this.state.cacheSize = event.data.cacheSize;
            this.emit('cacheSizeUpdate', this.state.cacheSize);
          }
        };

        navigator.serviceWorker.controller?.postMessage(
          { type: 'GET_CACHE_SIZE' },
          [messageChannel.port2]
        );
      } catch (error) {
        console.error('❌ Failed to get cache size:', error);
      }
    }
  }

  /**
   * Prompt user to install the app
   */
  async promptInstall(): Promise<boolean> {
    if (!this.installPrompt) {
      console.warn('⚠️ Install prompt not available');
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const { outcome } = await this.installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted install prompt');
        return true;
      } else {
        console.log('❌ User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('❌ Install prompt failed:', error);
      return false;
    }
  }

  /**
   * Update the service worker
   */
  async updateServiceWorker(): Promise<void> {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      this.state.cacheSize = 0;
      this.emit('cacheSizeUpdate', 0);
      console.log('🗑️ All caches cleared');
    }
  }

  /**
   * Preload important URLs
   */
  async preloadUrls(urls: string[]): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_URLS',
        urls
      });
      console.log('📦 URLs queued for caching:', urls);
    }
  }

  /**
   * Get current PWA state
   */
  getState(): PWAState {
    return { ...this.state };
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  /**
   * Format cache size for display
   */
  formatCacheSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const pwaManager = PWAManager.getInstance();

/**
 * React hook for PWA features
 */
export const usePWA = () => {
  const [state, setState] = React.useState<PWAState>(pwaManager.getState());

  React.useEffect(() => {
    const updateState = () => setState(pwaManager.getState());

    pwaManager.on('onlineStatusChange', updateState);
    pwaManager.on('installable', updateState);
    pwaManager.on('installed', updateState);
    pwaManager.on('updateAvailable', updateState);
    pwaManager.on('cacheSizeUpdate', updateState);

    return () => {
      pwaManager.off('onlineStatusChange', updateState);
      pwaManager.off('installable', updateState);
      pwaManager.off('installed', updateState);
      pwaManager.off('updateAvailable', updateState);
      pwaManager.off('cacheSizeUpdate', updateState);
    };
  }, []);

  return {
    ...state,
    promptInstall: () => pwaManager.promptInstall(),
    updateApp: () => pwaManager.updateServiceWorker(),
    clearCaches: () => pwaManager.clearCaches(),
    preloadUrls: (urls: string[]) => pwaManager.preloadUrls(urls),
    formatCacheSize: (bytes: number) => pwaManager.formatCacheSize(bytes)
  };
};

/**
 * PWA status component
 */
export const PWAStatus: React.FC<{ className?: string }> = ({ className = '' }) => {
  const pwa = usePWA();

  if (!pwa.isOnline) {
    return (
      <div className={`bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg ${className}`}>
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          You're offline. Some features may be limited.
        </div>
      </div>
    );
  }

  if (pwa.updateAvailable) {
    return (
      <div className={`bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <span>A new version is available!</span>
          <button
            onClick={pwa.updateApp}
            className="ml-4 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      </div>
    );
  }

  if (pwa.isInstallable) {
    return (
      <div className={`bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <span>Install this app for a better experience!</span>
          <button
            onClick={pwa.promptInstall}
            className="ml-4 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Install
          </button>
        </div>
      </div>
    );
  }

  return null;
};
