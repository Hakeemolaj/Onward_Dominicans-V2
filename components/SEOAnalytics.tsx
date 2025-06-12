import React, { useEffect } from 'react';

interface SEOAnalyticsProps {
  pageTitle?: string;
  pageUrl?: string;
  contentType?: 'homepage' | 'article' | 'gallery' | 'about' | 'contact';
  articleId?: string;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const SEOAnalytics: React.FC<SEOAnalyticsProps> = ({
  pageTitle = 'Onward Dominicans',
  pageUrl = window.location.href,
  contentType = 'homepage',
  articleId
}) => {
  useEffect(() => {
    // Google Analytics 4 tracking
    if (typeof window.gtag === 'function') {
      // Track page view
      window.gtag('config', 'G-XXXXXXXXXX', {
        page_title: pageTitle,
        page_location: pageUrl,
        content_group1: contentType
      });

      // Track custom events based on content type
      switch (contentType) {
        case 'article':
          window.gtag('event', 'article_view', {
            article_id: articleId,
            article_title: pageTitle,
            content_type: 'article'
          });
          break;
        case 'gallery':
          window.gtag('event', 'gallery_view', {
            content_type: 'gallery'
          });
          break;
        case 'about':
          window.gtag('event', 'about_view', {
            content_type: 'about'
          });
          break;
        case 'contact':
          window.gtag('event', 'contact_view', {
            content_type: 'contact'
          });
          break;
      }
    }

    // Track scroll depth for engagement metrics
    let maxScroll = 0;
    const trackScrollDepth = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
        maxScroll = scrollPercent;
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'scroll_depth', {
            scroll_depth: scrollPercent,
            page_title: pageTitle
          });
        }
      }
    };

    // Track time on page
    const startTime = Date.now();
    const trackTimeOnPage = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent > 30 && typeof window.gtag === 'function') { // Only track if user spent more than 30 seconds
        window.gtag('event', 'time_on_page', {
          time_spent: timeSpent,
          page_title: pageTitle,
          content_type: contentType
        });
      }
    };

    // Add event listeners
    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    window.addEventListener('beforeunload', trackTimeOnPage);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', trackScrollDepth);
      window.removeEventListener('beforeunload', trackTimeOnPage);
    };
  }, [pageTitle, pageUrl, contentType, articleId]);

  // Track social sharing
  const trackSocialShare = (platform: string, url: string, title: string) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'social_share', {
        platform: platform,
        url: url,
        title: title,
        content_type: contentType
      });
    }
  };

  // Track search interactions
  const trackSearch = (searchTerm: string, resultsCount: number) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'search', {
        search_term: searchTerm,
        results_count: resultsCount
      });
    }
  };

  // Track newsletter signup
  const trackNewsletterSignup = (email: string) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'newsletter_signup', {
        email_domain: email.split('@')[1],
        content_type: contentType
      });
    }
  };

  // Track article engagement
  const trackArticleEngagement = (action: 'like' | 'share' | 'comment', articleId: string) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'article_engagement', {
        action: action,
        article_id: articleId,
        content_type: 'article'
      });
    }
  };

  // Expose tracking functions globally for use in other components
  useEffect(() => {
    (window as any).seoAnalytics = {
      trackSocialShare,
      trackSearch,
      trackNewsletterSignup,
      trackArticleEngagement
    };
  }, []);

  return null; // This component doesn't render anything
};

export default SEOAnalytics;
