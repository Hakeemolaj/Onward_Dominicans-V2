/**
 * Advanced SEO optimization utilities
 * Provides comprehensive SEO features for better search engine visibility
 */

import { useEffect, useCallback } from 'react';
import { analytics } from './analytics';

interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  image?: string;
  url?: string;
  type?: 'article' | 'website' | 'profile';
  locale?: string;
  siteName?: string;
}

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultImage: string;
  defaultDescription: string;
  twitterHandle: string;
  facebookAppId?: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
}

class SEOManager {
  private static instance: SEOManager;
  private config: SEOConfig;
  private currentMetadata: SEOMetadata | null = null;

  private constructor() {
    this.config = {
      siteName: 'Onward Dominicans',
      siteUrl: 'https://odmailsu.vercel.app',
      defaultImage: '/images/og-default.jpg',
      defaultDescription: 'Celebrating Dominican culture, heritage, and community worldwide. Stay connected with news, events, and stories from the Dominican Republic and diaspora.',
      twitterHandle: '@OnwardDominicans',
      googleSiteVerification: 'your-google-verification-code',
      bingSiteVerification: 'your-bing-verification-code',
    };
  }

  static getInstance(): SEOManager {
    if (!SEOManager.instance) {
      SEOManager.instance = new SEOManager();
    }
    return SEOManager.instance;
  }

  /**
   * Set SEO metadata for current page
   */
  setMetadata(metadata: SEOMetadata): void {
    this.currentMetadata = {
      ...metadata,
      url: metadata.url || window.location.href,
      siteName: metadata.siteName || this.config.siteName,
    };

    this.updateDocumentHead();
    this.updateStructuredData();
    this.trackSEOEvent();
  }

  /**
   * Update document head with SEO metadata
   */
  private updateDocumentHead(): void {
    if (!this.currentMetadata) return;

    const { title, description, keywords, author, image, url, type, locale } = this.currentMetadata;

    // Update title
    document.title = `${title} | ${this.config.siteName}`;

    // Update or create meta tags
    this.updateMetaTag('description', description);
    this.updateMetaTag('author', author || 'Onward Dominicans');
    
    if (keywords && keywords.length > 0) {
      this.updateMetaTag('keywords', keywords.join(', '));
    }

    // Open Graph tags
    this.updateMetaTag('og:title', title, 'property');
    this.updateMetaTag('og:description', description, 'property');
    this.updateMetaTag('og:image', image || this.config.defaultImage, 'property');
    this.updateMetaTag('og:url', url!, 'property');
    this.updateMetaTag('og:type', type || 'website', 'property');
    this.updateMetaTag('og:site_name', this.config.siteName, 'property');
    this.updateMetaTag('og:locale', locale || 'en_US', 'property');

    // Twitter Card tags
    this.updateMetaTag('twitter:card', 'summary_large_image', 'name');
    this.updateMetaTag('twitter:site', this.config.twitterHandle, 'name');
    this.updateMetaTag('twitter:title', title, 'name');
    this.updateMetaTag('twitter:description', description, 'name');
    this.updateMetaTag('twitter:image', image || this.config.defaultImage, 'name');

    // Article-specific tags
    if (type === 'article') {
      if (this.currentMetadata.publishedTime) {
        this.updateMetaTag('article:published_time', this.currentMetadata.publishedTime, 'property');
      }
      if (this.currentMetadata.modifiedTime) {
        this.updateMetaTag('article:modified_time', this.currentMetadata.modifiedTime, 'property');
      }
      if (this.currentMetadata.section) {
        this.updateMetaTag('article:section', this.currentMetadata.section, 'property');
      }
      if (this.currentMetadata.tags) {
        this.currentMetadata.tags.forEach(tag => {
          this.addMetaTag('article:tag', tag, 'property');
        });
      }
    }

    // Canonical URL
    this.updateLinkTag('canonical', url!);

    // Language and locale
    document.documentElement.lang = locale?.split('_')[0] || 'en';
  }

  /**
   * Update or create meta tag
   */
  private updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
    let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    
    element.content = content;
  }

  /**
   * Add meta tag (for multiple tags with same name)
   */
  private addMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
    const element = document.createElement('meta');
    element.setAttribute(attribute, name);
    element.content = content;
    document.head.appendChild(element);
  }

  /**
   * Update or create link tag
   */
  private updateLinkTag(rel: string, href: string): void {
    let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    
    if (!element) {
      element = document.createElement('link');
      element.rel = rel;
      document.head.appendChild(element);
    }
    
    element.href = href;
  }

  /**
   * Update structured data (JSON-LD)
   */
  private updateStructuredData(): void {
    if (!this.currentMetadata) return;

    const structuredData = this.generateStructuredData();
    
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);
  }

  /**
   * Generate structured data based on content type
   */
  private generateStructuredData(): StructuredData {
    if (!this.currentMetadata) return { '@context': 'https://schema.org', '@type': 'WebSite' };

    const { title, description, author, publishedTime, modifiedTime, image, url, type } = this.currentMetadata;

    const baseData = {
      '@context': 'https://schema.org',
      name: title,
      description,
      url,
      image: image || this.config.defaultImage,
    };

    if (type === 'article') {
      return {
        ...baseData,
        '@type': 'Article',
        headline: title,
        author: {
          '@type': 'Person',
          name: author || 'Onward Dominicans',
        },
        publisher: {
          '@type': 'Organization',
          name: this.config.siteName,
          logo: {
            '@type': 'ImageObject',
            url: `${this.config.siteUrl}/images/logo.png`,
          },
        },
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': url,
        },
      };
    }

    return {
      ...baseData,
      '@type': 'WebSite',
      publisher: {
        '@type': 'Organization',
        name: this.config.siteName,
      },
    };
  }

  /**
   * Generate sitemap data
   */
  generateSitemapEntry(url: string, lastModified?: string, priority?: number, changeFreq?: string): any {
    return {
      url: `${this.config.siteUrl}${url}`,
      lastModified: lastModified || new Date().toISOString(),
      priority: priority || 0.8,
      changeFreq: changeFreq || 'weekly',
    };
  }

  /**
   * Track SEO-related events
   */
  private trackSEOEvent(): void {
    if (!this.currentMetadata) return;

    analytics.track('seo_metadata_updated', 'seo', {
      title: this.currentMetadata.title,
      type: this.currentMetadata.type,
      hasImage: !!this.currentMetadata.image,
      hasKeywords: !!(this.currentMetadata.keywords && this.currentMetadata.keywords.length > 0),
      url: this.currentMetadata.url,
    });
  }

  /**
   * Optimize images for SEO
   */
  optimizeImage(src: string, alt: string, title?: string): {
    src: string;
    alt: string;
    title?: string;
    loading: 'lazy' | 'eager';
  } {
    return {
      src,
      alt: alt || title || 'Image',
      title,
      loading: 'lazy',
    };
  }

  /**
   * Generate breadcrumb structured data
   */
  generateBreadcrumbData(breadcrumbs: Array<{ name: string; url: string }>): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${this.config.siteUrl}${crumb.url}`,
      })),
    };
  }

  /**
   * Get current metadata
   */
  getCurrentMetadata(): SEOMetadata | null {
    return this.currentMetadata;
  }

  /**
   * Clear current metadata
   */
  clearMetadata(): void {
    this.currentMetadata = null;
    
    // Reset to default title
    document.title = this.config.siteName;
    
    // Remove dynamic meta tags
    const dynamicTags = document.querySelectorAll('meta[data-dynamic="true"]');
    dynamicTags.forEach(tag => tag.remove());
  }
}

// Export singleton
export const seoManager = SEOManager.getInstance();

/**
 * SEO hook for React components
 */
export const useSEO = (metadata?: SEOMetadata) => {
  useEffect(() => {
    if (metadata) {
      seoManager.setMetadata(metadata);
    }

    return () => {
      // Don't clear metadata on unmount to avoid flickering
      // Only clear when navigating to a different page
    };
  }, [metadata]);

  const updateMetadata = useCallback((newMetadata: SEOMetadata) => {
    seoManager.setMetadata(newMetadata);
  }, []);

  return {
    updateMetadata,
    currentMetadata: seoManager.getCurrentMetadata(),
  };
};

/**
 * Article SEO hook
 */
export const useArticleSEO = (article: {
  title: string;
  summary: string;
  content: string;
  author?: { name: string };
  publishedAt?: string;
  updatedAt?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  slug: string;
}) => {
  const metadata: SEOMetadata = {
    title: article.title,
    description: article.summary || article.content.substring(0, 160) + '...',
    author: article.author?.name,
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    section: article.category,
    tags: article.tags,
    image: article.imageUrl,
    url: `/articles/${article.slug}`,
    type: 'article',
    keywords: article.tags,
  };

  useSEO(metadata);

  return metadata;
};

/**
 * Page SEO hook
 */
export const usePageSEO = (page: {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
}) => {
  const metadata: SEOMetadata = {
    title: page.title,
    description: page.description,
    url: page.path,
    image: page.image,
    keywords: page.keywords,
    type: 'website',
  };

  useSEO(metadata);

  return metadata;
};

/**
 * SEO utilities
 */
export const seoUtils = {
  /**
   * Generate meta description from content
   */
  generateDescription: (content: string, maxLength: number = 160): string => {
    const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    
    if (cleanContent.length <= maxLength) {
      return cleanContent;
    }
    
    const truncated = cleanContent.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  },

  /**
   * Extract keywords from content
   */
  extractKeywords: (content: string, maxKeywords: number = 10): string[] => {
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word);
  },

  /**
   * Validate SEO metadata
   */
  validateMetadata: (metadata: SEOMetadata): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];

    if (!metadata.title) {
      issues.push('Title is required');
    } else if (metadata.title.length > 60) {
      issues.push('Title should be under 60 characters');
    }

    if (!metadata.description) {
      issues.push('Description is required');
    } else if (metadata.description.length > 160) {
      issues.push('Description should be under 160 characters');
    }

    if (metadata.keywords && metadata.keywords.length > 10) {
      issues.push('Too many keywords (max 10 recommended)');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  },
};
