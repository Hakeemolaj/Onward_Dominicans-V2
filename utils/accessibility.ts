/**
 * Accessibility utilities and helpers
 * Provides tools for better accessibility compliance and user experience
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

interface FocusManagementOptions {
  restoreFocus?: boolean;
  preventScroll?: boolean;
  selectText?: boolean;
}

/**
 * Accessibility manager for global a11y features
 */
class AccessibilityManager {
  private static instance: AccessibilityManager;
  private preferences: AccessibilityPreferences;
  private focusHistory: HTMLElement[] = [];
  private announcements: HTMLElement | null = null;

  private constructor() {
    this.preferences = this.detectPreferences();
    this.setupAnnouncements();
    this.setupKeyboardNavigation();
  }

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  /**
   * Detect user accessibility preferences
   */
  private detectPreferences(): AccessibilityPreferences {
    return {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      largeText: window.matchMedia('(prefers-font-size: large)').matches,
      screenReader: this.detectScreenReader(),
      keyboardNavigation: false, // Will be detected on first tab key
    };
  }

  /**
   * Detect screen reader usage
   */
  private detectScreenReader(): boolean {
    // Check for common screen reader indicators
    return !!(
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver') ||
      (window as any).speechSynthesis ||
      document.querySelector('[aria-live]')
    );
  }

  /**
   * Setup live region for announcements
   */
  private setupAnnouncements(): void {
    this.announcements = document.createElement('div');
    this.announcements.setAttribute('aria-live', 'polite');
    this.announcements.setAttribute('aria-atomic', 'true');
    this.announcements.className = 'sr-only';
    this.announcements.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    document.body.appendChild(this.announcements);
  }

  /**
   * Setup keyboard navigation detection
   */
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.preferences.keyboardNavigation = true;
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      this.preferences.keyboardNavigation = false;
      document.body.classList.remove('keyboard-navigation');
    });
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcements) return;

    this.announcements.setAttribute('aria-live', priority);
    this.announcements.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.announcements) {
        this.announcements.textContent = '';
      }
    }, 1000);
  }

  /**
   * Manage focus with history
   */
  manageFocus(element: HTMLElement, options: FocusManagementOptions = {}): void {
    const { restoreFocus = false, preventScroll = false, selectText = false } = options;

    if (restoreFocus && document.activeElement instanceof HTMLElement) {
      this.focusHistory.push(document.activeElement);
    }

    element.focus({ preventScroll });

    if (selectText && element instanceof HTMLInputElement) {
      element.select();
    }
  }

  /**
   * Restore previous focus
   */
  restoreFocus(): void {
    const previousElement = this.focusHistory.pop();
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus();
    }
  }

  /**
   * Get accessibility preferences
   */
  getPreferences(): AccessibilityPreferences {
    return { ...this.preferences };
  }

  /**
   * Update preferences
   */
  updatePreferences(updates: Partial<AccessibilityPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
  }
}

// Export singleton
export const accessibilityManager = AccessibilityManager.getInstance();

/**
 * Hook for managing focus
 */
export const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement>(null);

  const focusElement = useCallback((options?: FocusManagementOptions) => {
    if (focusRef.current) {
      accessibilityManager.manageFocus(focusRef.current, options);
    }
  }, []);

  const restoreFocus = useCallback(() => {
    accessibilityManager.restoreFocus();
  }, []);

  return { focusRef, focusElement, restoreFocus };
};

/**
 * Hook for announcements
 */
export const useAnnouncements = () => {
  const announce = useCallback((message: string, priority?: 'polite' | 'assertive') => {
    accessibilityManager.announce(message, priority);
  }, []);

  return { announce };
};

/**
 * Hook for keyboard navigation
 */
export const useKeyboardNavigation = (onEscape?: () => void, onEnter?: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onEscape?.();
          break;
        case 'Enter':
          if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement) {
            onEnter?.();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onEnter]);
};

/**
 * Hook for accessibility preferences
 */
export const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(
    accessibilityManager.getPreferences()
  );

  useEffect(() => {
    // Listen for media query changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    const updatePreferences = () => {
      const newPreferences = {
        ...preferences,
        reducedMotion: reducedMotionQuery.matches,
        highContrast: highContrastQuery.matches,
      };
      setPreferences(newPreferences);
      accessibilityManager.updatePreferences(newPreferences);
    };

    reducedMotionQuery.addEventListener('change', updatePreferences);
    highContrastQuery.addEventListener('change', updatePreferences);

    return () => {
      reducedMotionQuery.removeEventListener('change', updatePreferences);
      highContrastQuery.removeEventListener('change', updatePreferences);
    };
  }, [preferences]);

  return preferences;
};

/**
 * Hook for skip links
 */
export const useSkipLinks = (links: Array<{ id: string; label: string }>) => {
  const skipToContent = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      accessibilityManager.announce(`Skipped to ${target.getAttribute('aria-label') || targetId}`);
    }
  }, []);

  const SkipLinks = () => (
    <div className="skip-links">
      {links.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-yellow-500 focus:text-black focus:rounded"
          onClick={(e) => {
            e.preventDefault();
            skipToContent(id);
          }}
        >
          Skip to {label}
        </a>
      ))}
    </div>
  );

  return { SkipLinks, skipToContent };
};

/**
 * Accessible modal hook
 */
export const useAccessibleModal = (isOpen: boolean) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocus.current = document.activeElement as HTMLElement;
      
      // Focus modal
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // Trap focus within modal
      const trapFocus = (e: KeyboardEvent) => {
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', trapFocus);
      return () => document.removeEventListener('keydown', trapFocus);
    } else {
      // Restore focus when modal closes
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    }
  }, [isOpen]);

  return { modalRef };
};

/**
 * Accessible form validation
 */
export const useAccessibleForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { announce } = useAnnouncements();

  const validateField = useCallback((name: string, value: any, rules: any) => {
    // Implement validation logic
    const fieldErrors: string[] = [];

    if (rules.required && (!value || value.toString().trim() === '')) {
      fieldErrors.push(`${name} is required`);
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      fieldErrors.push(`${name} must be at least ${rules.minLength} characters`);
    }

    if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
      fieldErrors.push(`${name} must be a valid email address`);
    }

    return fieldErrors;
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
    announce(`Error in ${field}: ${error}`, 'assertive');
  }, [announce]);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const getFieldProps = useCallback((name: string) => ({
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  }), [errors]);

  const getErrorProps = useCallback((name: string) => ({
    id: `${name}-error`,
    role: 'alert',
    'aria-live': 'polite' as const,
  }), []);

  return {
    errors,
    validateField,
    setFieldError,
    clearFieldError,
    getFieldProps,
    getErrorProps,
  };
};

/**
 * Color contrast utilities
 */
export const colorContrastUtils = {
  /**
   * Calculate relative luminance
   */
  getLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },

  /**
   * Calculate contrast ratio
   */
  getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if contrast meets WCAG standards
   */
  meetsWCAG(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  },

  /**
   * Convert hex to RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
};
