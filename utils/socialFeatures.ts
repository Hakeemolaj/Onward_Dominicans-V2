/**
 * Social features for comments, sharing, and user interactions
 */

import { useState, useCallback, useEffect } from 'react';
import { analytics } from './analytics';
import { realtimeManager } from './realtime';

interface Comment {
  id: string;
  contentId: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  parentId?: string; // For nested comments
  likes: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

interface ShareOptions {
  url: string;
  title: string;
  text?: string;
  image?: string;
}

interface SocialStats {
  likes: number;
  shares: number;
  comments: number;
  views: number;
}

class SocialManager {
  private static instance: SocialManager;
  private commentCache: Map<string, Comment[]> = new Map();

  static getInstance(): SocialManager {
    if (!SocialManager.instance) {
      SocialManager.instance = new SocialManager();
    }
    return SocialManager.instance;
  }

  /**
   * Share content via Web Share API or fallback
   */
  async shareContent(options: ShareOptions): Promise<boolean> {
    const { url, title, text, image } = options;

    // Track share attempt
    analytics.track('share_attempted', 'social', {
      method: 'web_share_api',
      contentUrl: url,
    });

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url,
        });
        
        analytics.track('share_completed', 'social', {
          method: 'web_share_api',
          contentUrl: url,
        });
        
        return true;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('❌ Web Share API failed:', error);
        }
      }
    }

    // Fallback to custom share modal or copy to clipboard
    return this.fallbackShare(options);
  }

  /**
   * Fallback sharing methods
   */
  private async fallbackShare(options: ShareOptions): Promise<boolean> {
    const { url, title } = options;

    // Try to copy to clipboard
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        
        analytics.track('share_completed', 'social', {
          method: 'clipboard',
          contentUrl: url,
        });
        
        // You could show a toast notification here
        console.log('📋 Link copied to clipboard');
        return true;
      } catch (error) {
        console.error('❌ Clipboard copy failed:', error);
      }
    }

    // Open share dialog for specific platforms
    this.openShareDialog('twitter', url, title);
    return true;
  }

  /**
   * Open platform-specific share dialog
   */
  openShareDialog(platform: string, url: string, title: string): void {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
        break;
      default:
        console.warn('❌ Unknown share platform:', platform);
        return;
    }

    // Open in new window
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    analytics.track('share_completed', 'social', {
      method: platform,
      contentUrl: url,
    });
  }

  /**
   * Like/unlike content
   */
  async toggleLike(contentId: string, isLiked: boolean): Promise<boolean> {
    try {
      // This would typically call your API
      const response = await fetch(`/api/content/${contentId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        analytics.track('content_liked', 'social', {
          contentId,
          action: isLiked ? 'unlike' : 'like',
        });

        // Broadcast real-time update
        realtimeManager.send('like_updated', {
          contentId,
          isLiked: !isLiked,
        });

        return !isLiked;
      }
    } catch (error) {
      console.error('❌ Failed to toggle like:', error);
    }
    
    return isLiked;
  }

  /**
   * Add comment
   */
  async addComment(contentId: string, content: string, parentId?: string): Promise<Comment | null> {
    try {
      const response = await fetch(`/api/content/${contentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId }),
      });

      if (response.ok) {
        const comment: Comment = await response.json();
        
        // Update cache
        this.updateCommentCache(contentId, comment);
        
        analytics.track('comment_added', 'social', {
          contentId,
          isReply: !!parentId,
          contentLength: content.length,
        });

        // Broadcast real-time update
        realtimeManager.send('comment_added', {
          contentId,
          comment,
        });

        return comment;
      }
    } catch (error) {
      console.error('❌ Failed to add comment:', error);
    }
    
    return null;
  }

  /**
   * Get comments for content
   */
  async getComments(contentId: string): Promise<Comment[]> {
    // Check cache first
    const cached = this.commentCache.get(contentId);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`/api/content/${contentId}/comments`);
      
      if (response.ok) {
        const comments: Comment[] = await response.json();
        
        // Cache comments
        this.commentCache.set(contentId, comments);
        
        return comments;
      }
    } catch (error) {
      console.error('❌ Failed to get comments:', error);
    }
    
    return [];
  }

  /**
   * Update comment cache
   */
  private updateCommentCache(contentId: string, newComment: Comment): void {
    const existing = this.commentCache.get(contentId) || [];
    
    if (newComment.parentId) {
      // Add as reply to parent comment
      const updated = existing.map(comment => {
        if (comment.id === newComment.parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newComment],
          };
        }
        return comment;
      });
      this.commentCache.set(contentId, updated);
    } else {
      // Add as top-level comment
      this.commentCache.set(contentId, [newComment, ...existing]);
    }
  }

  /**
   * Generate share text for content
   */
  generateShareText(title: string, summary?: string): string {
    const baseText = `Check out this article: "${title}"`;
    
    if (summary && summary.length > 0) {
      const shortSummary = summary.length > 100 
        ? summary.substring(0, 100) + '...' 
        : summary;
      return `${baseText}\n\n${shortSummary}`;
    }
    
    return baseText;
  }

  /**
   * Track content view
   */
  trackView(contentId: string): void {
    analytics.track('content_viewed', 'social', { contentId });
    
    // Send real-time view update
    realtimeManager.send('view_tracked', { contentId });
  }
}

// Export singleton
export const socialManager = SocialManager.getInstance();

/**
 * Hook for social features
 */
export const useSocialFeatures = (contentId: string) => {
  const [stats, setStats] = useState<SocialStats>({
    likes: 0,
    shares: 0,
    comments: 0,
    views: 0,
  });
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load comments
        const commentsData = await socialManager.getComments(contentId);
        setComments(commentsData);

        // Track view
        socialManager.trackView(contentId);
      } catch (error) {
        console.error('❌ Failed to load social data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [contentId]);

  // Listen for real-time updates
  useEffect(() => {
    const unsubscribeLike = realtimeManager.on('like_updated', (data: any) => {
      if (data.contentId === contentId) {
        setStats(prev => ({
          ...prev,
          likes: prev.likes + (data.isLiked ? 1 : -1),
        }));
      }
    });

    const unsubscribeComment = realtimeManager.on('comment_added', (data: any) => {
      if (data.contentId === contentId) {
        setComments(prev => [data.comment, ...prev]);
        setStats(prev => ({
          ...prev,
          comments: prev.comments + 1,
        }));
      }
    });

    return () => {
      unsubscribeLike();
      unsubscribeComment();
    };
  }, [contentId]);

  const handleLike = useCallback(async () => {
    const newLikedState = await socialManager.toggleLike(contentId, isLiked);
    setIsLiked(newLikedState);
  }, [contentId, isLiked]);

  const handleShare = useCallback(async (options: ShareOptions) => {
    const success = await socialManager.shareContent(options);
    if (success) {
      setStats(prev => ({
        ...prev,
        shares: prev.shares + 1,
      }));
    }
    return success;
  }, []);

  const handleComment = useCallback(async (content: string, parentId?: string) => {
    const comment = await socialManager.addComment(contentId, content, parentId);
    if (comment) {
      // Comment will be added via real-time update
      return comment;
    }
    return null;
  }, [contentId]);

  return {
    stats,
    isLiked,
    comments,
    loading,
    handleLike,
    handleShare,
    handleComment,
  };
};

/**
 * Hook for sharing functionality
 */
export const useSharing = () => {
  const [isSharing, setIsSharing] = useState(false);

  const share = useCallback(async (options: ShareOptions) => {
    setIsSharing(true);
    try {
      const success = await socialManager.shareContent(options);
      return success;
    } finally {
      setIsSharing(false);
    }
  }, []);

  const shareToSpecificPlatform = useCallback((platform: string, url: string, title: string) => {
    socialManager.openShareDialog(platform, url, title);
  }, []);

  const generateShareText = useCallback((title: string, summary?: string) => {
    return socialManager.generateShareText(title, summary);
  }, []);

  return {
    isSharing,
    share,
    shareToSpecificPlatform,
    generateShareText,
  };
};

/**
 * Comments component hook
 */
export const useComments = (contentId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const commentsData = await socialManager.getComments(contentId);
        setComments(commentsData);
      } catch (error) {
        console.error('❌ Failed to load comments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [contentId]);

  const submitComment = useCallback(async () => {
    if (!newComment.trim()) return;

    const comment = await socialManager.addComment(contentId, newComment, replyingTo || undefined);
    if (comment) {
      setNewComment('');
      setReplyingTo(null);
      // Comment will be added via real-time update or manual refresh
    }
  }, [contentId, newComment, replyingTo]);

  const startReply = useCallback((commentId: string) => {
    setReplyingTo(commentId);
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
    setNewComment('');
  }, []);

  return {
    comments,
    loading,
    newComment,
    setNewComment,
    replyingTo,
    submitComment,
    startReply,
    cancelReply,
  };
};
