/**
 * Internationalization (i18n) system
 * Provides multi-language support with dynamic loading and formatting
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface Translation {
  [key: string]: string | Translation;
}

interface Locale {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  currency: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
}

interface I18nConfig {
  defaultLocale: string;
  fallbackLocale: string;
  supportedLocales: string[];
  loadPath: string;
  interpolation: {
    prefix: string;
    suffix: string;
  };
}

interface FormatOptions {
  count?: number;
  context?: string;
  [key: string]: any;
}

class I18nManager {
  private static instance: I18nManager;
  private config: I18nConfig;
  private currentLocale: string;
  private translations: Map<string, Translation> = new Map();
  private locales: Map<string, Locale> = new Map();
  private listeners: Function[] = [];
  private loadingPromises: Map<string, Promise<void>> = new Map();

  private constructor() {
    this.config = {
      defaultLocale: 'en',
      fallbackLocale: 'en',
      supportedLocales: ['en', 'es', 'fr'],
      loadPath: '/locales/{{lng}}.json',
      interpolation: {
        prefix: '{{',
        suffix: '}}',
      },
    };

    this.currentLocale = this.detectLocale();
    this.setupLocales();
  }

  static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  /**
   * Setup supported locales
   */
  private setupLocales(): void {
    this.locales.set('en', {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: 'h:mm A',
      currency: 'USD',
      numberFormat: {
        decimal: '.',
        thousands: ',',
      },
    });

    this.locales.set('es', {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currency: 'EUR',
      numberFormat: {
        decimal: ',',
        thousands: '.',
      },
    });

    this.locales.set('fr', {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      direction: 'ltr',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      currency: 'EUR',
      numberFormat: {
        decimal: ',',
        thousands: ' ',
      },
    });
  }

  /**
   * Detect user's preferred locale
   */
  private detectLocale(): string {
    // Check localStorage first
    const stored = localStorage.getItem('preferred-locale');
    if (stored && this.config.supportedLocales.includes(stored)) {
      return stored;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (this.config.supportedLocales.includes(browserLang)) {
      return browserLang;
    }

    // Check browser languages
    for (const lang of navigator.languages) {
      const langCode = lang.split('-')[0];
      if (this.config.supportedLocales.includes(langCode)) {
        return langCode;
      }
    }

    return this.config.defaultLocale;
  }

  /**
   * Load translations for a locale
   */
  async loadTranslations(locale: string): Promise<void> {
    if (this.translations.has(locale)) {
      return;
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(locale);
    if (existingPromise) {
      return existingPromise;
    }

    const loadPromise = this.fetchTranslations(locale);
    this.loadingPromises.set(locale, loadPromise);

    try {
      await loadPromise;
    } finally {
      this.loadingPromises.delete(locale);
    }
  }

  /**
   * Fetch translations from server
   */
  private async fetchTranslations(locale: string): Promise<void> {
    try {
      const url = this.config.loadPath.replace('{{lng}}', locale);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${locale}`);
      }

      const translations: Translation = await response.json();
      this.translations.set(locale, translations);
      
      console.log(`✅ Loaded translations for ${locale}`);
    } catch (error) {
      console.error(`❌ Failed to load translations for ${locale}:`, error);
      
      // Use fallback translations if available
      if (locale !== this.config.fallbackLocale && this.translations.has(this.config.fallbackLocale)) {
        console.log(`📋 Using fallback translations for ${locale}`);
        this.translations.set(locale, this.translations.get(this.config.fallbackLocale)!);
      }
    }
  }

  /**
   * Change current locale
   */
  async changeLocale(locale: string): Promise<void> {
    if (!this.config.supportedLocales.includes(locale)) {
      console.warn(`❌ Unsupported locale: ${locale}`);
      return;
    }

    await this.loadTranslations(locale);
    this.currentLocale = locale;
    
    // Store preference
    localStorage.setItem('preferred-locale', locale);
    
    // Update document attributes
    document.documentElement.lang = locale;
    const localeInfo = this.locales.get(locale);
    if (localeInfo) {
      document.documentElement.dir = localeInfo.direction;
    }

    // Notify listeners
    this.notifyListeners();
    
    console.log(`🌍 Changed locale to ${locale}`);
  }

  /**
   * Get translation for a key
   */
  t(key: string, options: FormatOptions = {}): string {
    const translation = this.getTranslation(key, this.currentLocale);
    return this.interpolate(translation, options);
  }

  /**
   * Get translation with fallback
   */
  private getTranslation(key: string, locale: string): string {
    const translations = this.translations.get(locale);
    if (!translations) {
      return this.getFallbackTranslation(key);
    }

    const value = this.getNestedValue(translations, key);
    if (value !== undefined) {
      return value;
    }

    return this.getFallbackTranslation(key);
  }

  /**
   * Get fallback translation
   */
  private getFallbackTranslation(key: string): string {
    if (this.currentLocale !== this.config.fallbackLocale) {
      const fallbackTranslations = this.translations.get(this.config.fallbackLocale);
      if (fallbackTranslations) {
        const value = this.getNestedValue(fallbackTranslations, key);
        if (value !== undefined) {
          return value;
        }
      }
    }

    // Return key as fallback
    return key;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Interpolate variables in translation
   */
  private interpolate(text: string, options: FormatOptions): string {
    let result = text;

    // Handle pluralization
    if (options.count !== undefined) {
      result = this.handlePluralization(result, options.count);
    }

    // Replace variables
    Object.keys(options).forEach(key => {
      if (key !== 'count' && key !== 'context') {
        const placeholder = `${this.config.interpolation.prefix}${key}${this.config.interpolation.suffix}`;
        result = result.replace(new RegExp(placeholder, 'g'), String(options[key]));
      }
    });

    return result;
  }

  /**
   * Handle pluralization
   */
  private handlePluralization(text: string, count: number): string {
    // Simple English pluralization rules
    // In a real implementation, you'd use proper pluralization rules for each language
    if (count === 0 && text.includes('_zero')) {
      return text.split('_zero')[1] || text;
    } else if (count === 1 && text.includes('_one')) {
      return text.split('_one')[1] || text;
    } else if (text.includes('_other')) {
      return text.split('_other')[1] || text;
    }

    return text;
  }

  /**
   * Format date according to locale
   */
  formatDate(date: Date, format?: string): string {
    const locale = this.locales.get(this.currentLocale);
    const formatString = format || locale?.dateFormat || 'MM/DD/YYYY';

    try {
      return new Intl.DateTimeFormat(this.currentLocale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
    } catch (error) {
      return date.toLocaleDateString();
    }
  }

  /**
   * Format number according to locale
   */
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this.currentLocale, options).format(number);
    } catch (error) {
      return number.toString();
    }
  }

  /**
   * Format currency according to locale
   */
  formatCurrency(amount: number, currency?: string): string {
    const locale = this.locales.get(this.currentLocale);
    const currencyCode = currency || locale?.currency || 'USD';

    try {
      return new Intl.NumberFormat(this.currentLocale, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount);
    } catch (error) {
      return `${currencyCode} ${amount}`;
    }
  }

  /**
   * Get current locale info
   */
  getCurrentLocale(): string {
    return this.currentLocale;
  }

  /**
   * Get locale information
   */
  getLocaleInfo(locale?: string): Locale | undefined {
    return this.locales.get(locale || this.currentLocale);
  }

  /**
   * Get all supported locales
   */
  getSupportedLocales(): Locale[] {
    return Array.from(this.locales.values());
  }

  /**
   * Add listener for locale changes
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
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.currentLocale));
  }

  /**
   * Initialize i18n system
   */
  async init(): Promise<void> {
    await this.loadTranslations(this.currentLocale);
    
    // Load fallback locale if different
    if (this.currentLocale !== this.config.fallbackLocale) {
      await this.loadTranslations(this.config.fallbackLocale);
    }

    // Set document attributes
    document.documentElement.lang = this.currentLocale;
    const localeInfo = this.locales.get(this.currentLocale);
    if (localeInfo) {
      document.documentElement.dir = localeInfo.direction;
    }

    console.log(`🌍 I18n initialized with locale: ${this.currentLocale}`);
  }
}

// Export singleton
export const i18nManager = I18nManager.getInstance();

// Create React context
const I18nContext = createContext<{
  locale: string;
  t: (key: string, options?: FormatOptions) => string;
  changeLocale: (locale: string) => Promise<void>;
  formatDate: (date: Date, format?: string) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  locales: Locale[];
} | null>(null);

/**
 * I18n Provider component
 */
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState(i18nManager.getCurrentLocale());

  useEffect(() => {
    const handleLocaleChange = (newLocale: string) => {
      setLocale(newLocale);
    };

    i18nManager.addListener(handleLocaleChange);
    i18nManager.init();

    return () => {
      i18nManager.removeListener(handleLocaleChange);
    };
  }, []);

  const value = {
    locale,
    t: i18nManager.t.bind(i18nManager),
    changeLocale: i18nManager.changeLocale.bind(i18nManager),
    formatDate: i18nManager.formatDate.bind(i18nManager),
    formatNumber: i18nManager.formatNumber.bind(i18nManager),
    formatCurrency: i18nManager.formatCurrency.bind(i18nManager),
    locales: i18nManager.getSupportedLocales(),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

/**
 * Hook for using i18n features
 */
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

/**
 * Translation hook for specific namespace
 */
export const useTranslation = (namespace?: string) => {
  const { t: baseT, ...rest } = useI18n();

  const t = useCallback((key: string, options?: FormatOptions) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return baseT(fullKey, options);
  }, [baseT, namespace]);

  return { t, ...rest };
};
