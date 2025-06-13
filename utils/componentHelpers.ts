import { useCallback, useEffect, useRef } from 'react';

/**
 * Utility functions for common component operations
 */

// Debounce function for search inputs and other frequent operations
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Throttle function for scroll events and other high-frequency operations
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};

// Modal management utilities
export const useModalManager = () => {
  const openModal = useCallback((modalElement?: HTMLElement) => {
    document.body.style.overflow = 'hidden';
    if (modalElement) {
      modalElement.focus();
    }
  }, []);

  const closeModal = useCallback(() => {
    document.body.style.overflow = '';
  }, []);

  const handleEscapeKey = useCallback((onClose: () => void) => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { openModal, closeModal, handleEscapeKey };
};

// Image loading utilities
export const useImageLoader = () => {
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(async (sources: string[]): Promise<void> => {
    try {
      await Promise.all(sources.map(preloadImage));
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }, [preloadImage]);

  return { preloadImage, preloadImages };
};

// Intersection Observer hook for lazy loading and animations
export const useIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<Element>>(new Set());

  const observe = useCallback((element: Element) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(callback, {
        root: null,
        rootMargin: '0px 0px -40% 0px',
        threshold: 0.01,
        ...options
      });
    }

    observerRef.current.observe(element);
    elementsRef.current.add(element);
  }, [callback, options]);

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
      elementsRef.current.delete(element);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      elementsRef.current.clear();
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { observe, unobserve, disconnect };
};

// Local storage utilities with error handling
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const getValue = useCallback((): T => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [key, defaultValue]);

  const setValue = useCallback((value: T) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key]);

  return { getValue, setValue, removeValue };
};

// Form validation utilities
export const createValidator = <T extends Record<string, any>>(
  rules: Partial<Record<keyof T, (value: any) => string | null>>
) => {
  return (data: T): Record<keyof T, string | null> => {
    const errors = {} as Record<keyof T, string | null>;
    
    Object.keys(rules).forEach((key) => {
      const rule = rules[key as keyof T];
      if (rule) {
        errors[key as keyof T] = rule(data[key as keyof T]);
      }
    });

    return errors;
  };
};

// Common validation rules
export const validationRules = {
  required: (value: any) => (!value || value.toString().trim() === '' ? 'This field is required' : null),
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? 'Please enter a valid email address' : null;
  },
  minLength: (min: number) => (value: string) => 
    value && value.length < min ? `Must be at least ${min} characters long` : null,
  maxLength: (max: number) => (value: string) => 
    value && value.length > max ? `Must be no more than ${max} characters long` : null,
  url: (value: string) => {
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  }
};

// Error boundary utility
export const createErrorHandler = (componentName: string) => {
  return (error: Error, errorInfo: any) => {
    console.error(`Error in ${componentName}:`, error, errorInfo);
    
    // You could send this to an error reporting service
    // reportError(error, { component: componentName, ...errorInfo });
  };
};
