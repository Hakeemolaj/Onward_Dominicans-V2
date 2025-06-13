/**
 * Mobile optimization utilities
 * Provides touch gestures, responsive design helpers, and mobile-specific features
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'longpress' | 'pan';
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  velocity?: number;
  scale?: number;
  duration?: number;
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
}

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  orientation: 'portrait' | 'landscape';
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  pixelRatio: number;
  connectionType: string;
  isLowEndDevice: boolean;
}

interface TouchOptions {
  threshold: number;
  velocityThreshold: number;
  timeThreshold: number;
  preventScroll: boolean;
  enablePinch: boolean;
}

/**
 * Device detection and information
 */
class DeviceManager {
  private static instance: DeviceManager;
  private deviceInfo: DeviceInfo;
  private listeners: Function[] = [];

  private constructor() {
    this.deviceInfo = this.detectDevice();
    this.setupListeners();
  }

  static getInstance(): DeviceManager {
    if (!DeviceManager.instance) {
      DeviceManager.instance = new DeviceManager();
    }
    return DeviceManager.instance;
  }

  /**
   * Detect device capabilities and characteristics
   */
  private detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Screen size detection
    const width = window.innerWidth;
    let screenSize: DeviceInfo['screenSize'] = 'md';
    
    if (width < 640) screenSize = 'xs';
    else if (width < 768) screenSize = 'sm';
    else if (width < 1024) screenSize = 'md';
    else if (width < 1280) screenSize = 'lg';
    else screenSize = 'xl';

    // Device type detection
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || 
                     (hasTouch && width < 768);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || 
                     (hasTouch && width >= 768 && width < 1024);
    const isDesktop = !isMobile && !isTablet;

    // Performance detection
    const isLowEndDevice = this.detectLowEndDevice();

    // Connection detection
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection ? connection.effectiveType || 'unknown' : 'unknown';

    return {
      isMobile,
      isTablet,
      isDesktop,
      hasTouch,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      screenSize,
      pixelRatio: window.devicePixelRatio || 1,
      connectionType,
      isLowEndDevice,
    };
  }

  /**
   * Detect low-end devices for performance optimization
   */
  private detectLowEndDevice(): boolean {
    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 1;
    if (cores <= 2) return true;

    // Check memory (if available)
    const memory = (navigator as any).deviceMemory;
    if (memory && memory <= 2) return true;

    // Check connection speed
    const connection = (navigator as any).connection;
    if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
      return true;
    }

    return false;
  }

  /**
   * Setup event listeners for device changes
   */
  private setupListeners(): void {
    window.addEventListener('resize', () => {
      this.deviceInfo = this.detectDevice();
      this.notifyListeners();
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.deviceInfo = this.detectDevice();
        this.notifyListeners();
      }, 100);
    });
  }

  /**
   * Add listener for device changes
   */
  addListener(callback: Function): void {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   */
  removeListener(callback: Function): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of device changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.deviceInfo));
  }

  /**
   * Get current device information
   */
  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }
}

// Export singleton
export const deviceManager = DeviceManager.getInstance();

/**
 * Touch gesture detection hook
 */
export const useTouchGestures = (
  onGesture: (gesture: TouchGesture) => void,
  options: Partial<TouchOptions> = {}
) => {
  const elementRef = useRef<HTMLElement>(null);
  const touchStartRef = useRef<Touch | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const config: TouchOptions = {
    threshold: 50,
    velocityThreshold: 0.3,
    timeThreshold: 500,
    preventScroll: false,
    enablePinch: false,
    ...options,
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (config.preventScroll) {
      e.preventDefault();
    }

    touchStartRef.current = e.touches[0];
    touchStartTimeRef.current = Date.now();

    // Setup long press detection
    longPressTimerRef.current = setTimeout(() => {
      if (touchStartRef.current) {
        onGesture({
          type: 'longpress',
          startPoint: {
            x: touchStartRef.current.clientX,
            y: touchStartRef.current.clientY,
          },
          duration: Date.now() - touchStartTimeRef.current,
        });
      }
    }, config.timeThreshold);
  }, [config, onGesture]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    if (config.preventScroll) {
      e.preventDefault();
    }

    const currentTouch = e.touches[0];
    const deltaX = currentTouch.clientX - touchStartRef.current.clientX;
    const deltaY = currentTouch.clientY - touchStartRef.current.clientY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Cancel long press if moved too much
    if (distance > config.threshold && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle pinch gesture
    if (config.enablePinch && e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      // You would need to store initial distance to calculate scale
      // This is a simplified version
      onGesture({
        type: 'pinch',
        scale: distance / 100, // Simplified scale calculation
      });
    }

    // Handle pan gesture
    if (distance > 10) {
      onGesture({
        type: 'pan',
        startPoint: {
          x: touchStartRef.current.clientX,
          y: touchStartRef.current.clientY,
        },
        endPoint: {
          x: currentTouch.clientX,
          y: currentTouch.clientY,
        },
        distance,
      });
    }
  }, [config, onGesture]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - touchStartRef.current.clientX;
    const deltaY = touchEnd.clientY - touchStartRef.current.clientY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - touchStartTimeRef.current;
    const velocity = distance / duration;

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Determine gesture type
    if (distance < config.threshold && duration < config.timeThreshold) {
      // Tap gesture
      onGesture({
        type: 'tap',
        startPoint: {
          x: touchStartRef.current.clientX,
          y: touchStartRef.current.clientY,
        },
        duration,
      });
    } else if (distance > config.threshold && velocity > config.velocityThreshold) {
      // Swipe gesture
      let direction: TouchGesture['direction'];
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      onGesture({
        type: 'swipe',
        direction,
        distance,
        velocity,
        startPoint: {
          x: touchStartRef.current.clientX,
          y: touchStartRef.current.clientY,
        },
        endPoint: {
          x: touchEnd.clientX,
          y: touchEnd.clientY,
        },
        duration,
      });
    }

    touchStartRef.current = null;
  }, [config, onGesture]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !config.preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !config.preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, config.preventScroll]);

  return elementRef;
};

/**
 * Device information hook
 */
export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(deviceManager.getDeviceInfo());

  useEffect(() => {
    const updateDeviceInfo = (info: DeviceInfo) => {
      setDeviceInfo(info);
    };

    deviceManager.addListener(updateDeviceInfo);

    return () => {
      deviceManager.removeListener(updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};

/**
 * Responsive design utilities
 */
export const useResponsive = () => {
  const deviceInfo = useDeviceInfo();

  const breakpoints = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  };

  const isBreakpoint = useCallback((size: keyof typeof breakpoints) => {
    return window.innerWidth >= breakpoints[size];
  }, []);

  const getColumns = useCallback((config: Record<string, number>) => {
    const { xs = 1, sm = xs, md = sm, lg = md, xl = lg } = config;
    
    if (deviceInfo.screenSize === 'xs') return xs;
    if (deviceInfo.screenSize === 'sm') return sm;
    if (deviceInfo.screenSize === 'md') return md;
    if (deviceInfo.screenSize === 'lg') return lg;
    return xl;
  }, [deviceInfo.screenSize]);

  return {
    ...deviceInfo,
    isBreakpoint,
    getColumns,
    breakpoints,
  };
};

/**
 * Performance optimization for mobile
 */
export const useMobileOptimization = () => {
  const deviceInfo = useDeviceInfo();

  const shouldReduceAnimations = deviceInfo.isLowEndDevice || 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const shouldLazyLoad = deviceInfo.isMobile || deviceInfo.connectionType === 'slow-2g' || deviceInfo.connectionType === '2g';

  const getImageQuality = useCallback(() => {
    if (deviceInfo.isLowEndDevice || deviceInfo.connectionType === 'slow-2g') return 60;
    if (deviceInfo.connectionType === '2g' || deviceInfo.connectionType === '3g') return 70;
    return 80;
  }, [deviceInfo]);

  const getImageSize = useCallback((baseSize: number) => {
    const ratio = deviceInfo.pixelRatio;
    if (deviceInfo.isLowEndDevice) return Math.floor(baseSize * Math.min(ratio, 2));
    return Math.floor(baseSize * ratio);
  }, [deviceInfo]);

  return {
    shouldReduceAnimations,
    shouldLazyLoad,
    getImageQuality,
    getImageSize,
    isLowEndDevice: deviceInfo.isLowEndDevice,
    connectionType: deviceInfo.connectionType,
  };
};

/**
 * Safe area utilities for mobile devices
 */
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--sat') || '0'),
        right: parseInt(style.getPropertyValue('--sar') || '0'),
        bottom: parseInt(style.getPropertyValue('--sab') || '0'),
        left: parseInt(style.getPropertyValue('--sal') || '0'),
      });
    };

    // Set CSS custom properties for safe area
    if ('CSS' in window && 'supports' in window.CSS) {
      if (window.CSS.supports('padding: env(safe-area-inset-top)')) {
        document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)');
        document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
        document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)');
      }
    }

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
};

/**
 * Haptic feedback utilities
 */
export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const lightImpact = useCallback(() => {
    vibrate(10);
  }, [vibrate]);

  const mediumImpact = useCallback(() => {
    vibrate(20);
  }, [vibrate]);

  const heavyImpact = useCallback(() => {
    vibrate(30);
  }, [vibrate]);

  const selectionChanged = useCallback(() => {
    vibrate([5, 5]);
  }, [vibrate]);

  return {
    vibrate,
    lightImpact,
    mediumImpact,
    heavyImpact,
    selectionChanged,
  };
};
