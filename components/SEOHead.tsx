import React from 'react';
import { NewsArticle } from '../types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  article?: NewsArticle;
  type?: 'website' | 'article';
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  alternateLocales?: string[];
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Onward Dominicans - Dominican Community News & Culture',
  description = 'Stay connected with the Dominican community through news, cultural events, traditional recipes, and stories that celebrate our rich heritage and vibrant culture.',
  image = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=630&fit=crop',
  url = 'https://onward-dominicans.vercel.app/',
  article,
  type = 'website',
  keywords = ['Dominican community', 'Dominican culture', 'Dominican news', 'Caribbean culture', 'Latino community'],
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  locale = 'en_US',
  alternateLocales = []
}) => {
  React.useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update keywords meta tag
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    const allKeywords = [...keywords, ...tags].join(', ');
    metaKeywords.setAttribute('content', allKeywords);
    
    // Update Open Graph meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description);
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', image);
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', url);
    
    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) ogType.setAttribute('content', type);

    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute('content', locale);

    // Add article-specific Open Graph tags
    if (type === 'article' && article) {
      const ogPublishedTime = document.querySelector('meta[property="article:published_time"]') || document.createElement('meta');
      ogPublishedTime.setAttribute('property', 'article:published_time');
      ogPublishedTime.setAttribute('content', publishedTime || article.date);
      if (!document.head.contains(ogPublishedTime)) document.head.appendChild(ogPublishedTime);

      const ogModifiedTime = document.querySelector('meta[property="article:modified_time"]') || document.createElement('meta');
      ogModifiedTime.setAttribute('property', 'article:modified_time');
      ogModifiedTime.setAttribute('content', modifiedTime || article.date);
      if (!document.head.contains(ogModifiedTime)) document.head.appendChild(ogModifiedTime);

      const ogSection = document.querySelector('meta[property="article:section"]') || document.createElement('meta');
      ogSection.setAttribute('property', 'article:section');
      ogSection.setAttribute('content', section || article.category);
      if (!document.head.contains(ogSection)) document.head.appendChild(ogSection);

      const ogAuthor = document.querySelector('meta[property="article:author"]') || document.createElement('meta');
      ogAuthor.setAttribute('property', 'article:author');
      ogAuthor.setAttribute('content', article.author.name);
      if (!document.head.contains(ogAuthor)) document.head.appendChild(ogAuthor);

      // Add article tags
      const existingTags = document.querySelectorAll('meta[property="article:tag"]');
      existingTags.forEach(tag => tag.remove());

      const articleTags = [...(article.tags || []), ...tags];
      articleTags.forEach(tag => {
        const ogTag = document.createElement('meta');
        ogTag.setAttribute('property', 'article:tag');
        ogTag.setAttribute('content', tag);
        document.head.appendChild(ogTag);
      });
    }
    
    // Update Twitter meta tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', title);
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', description);
    
    const twitterImage = document.querySelector('meta[property="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', image);
    
    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrl) twitterUrl.setAttribute('content', url);
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
    
    // Add structured data for articles
    if (article && type === 'article') {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title,
        "description": article.summary,
        "image": article.imageUrl || image,
        "datePublished": article.date,
        "dateModified": article.date,
        "author": {
          "@type": "Person",
          "name": article.author.name,
          "description": article.author.bio
        },
        "publisher": {
          "@type": "NewsMediaOrganization",
          "name": "Onward Dominicans",
          "url": "https://onward-dominicans.vercel.app/",
          "logo": {
            "@type": "ImageObject",
            "url": "https://onward-dominicans.vercel.app/logo.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url
        },
        "articleSection": article.category,
        "keywords": article.tags?.join(', ') || '',
        "wordCount": article.fullContent?.split(' ').length || 0,
        "inLanguage": "en-US"
      };
      
      // Remove existing structured data
      const existingScript = document.querySelector('script[data-seo="article"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', 'article');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
    
    // Add breadcrumb structured data
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://onward-dominicans.vercel.app/"
        }
      ]
    };
    
    if (article) {
      breadcrumbData.itemListElement.push(
        {
          "@type": "ListItem",
          "position": 2,
          "name": "News",
          "item": "https://onward-dominicans.vercel.app/#news-feed"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": article.title,
          "item": url
        }
      );
    }
    
    // Remove existing breadcrumb data
    const existingBreadcrumb = document.querySelector('script[data-seo="breadcrumb"]');
    if (existingBreadcrumb) {
      existingBreadcrumb.remove();
    }
    
    // Add new breadcrumb data
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-seo', 'breadcrumb');
    breadcrumbScript.textContent = JSON.stringify(breadcrumbData);
    document.head.appendChild(breadcrumbScript);
    
  }, [title, description, image, url, article, type]);
  
  return null; // This component doesn't render anything
};

export default SEOHead;
