/**
 * Content Management System integration
 * Provides tools for content creation, editing, and management
 */

import { useCallback, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { advancedCache } from './advancedCache';
import { analytics } from './analytics';

interface ContentItem {
  id: string;
  type: 'article' | 'gallery' | 'page' | 'announcement';
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  status: 'draft' | 'published' | 'archived';
  author: {
    id: string;
    name: string;
    email: string;
  };
  category?: string;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

interface ContentFilter {
  type?: ContentItem['type'];
  status?: ContentItem['status'];
  author?: string;
  category?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

interface ContentStats {
  total: number;
  published: number;
  drafts: number;
  archived: number;
  byType: Record<string, number>;
  byAuthor: Record<string, number>;
  recentActivity: Array<{
    action: string;
    contentId: string;
    contentTitle: string;
    author: string;
    timestamp: string;
  }>;
}

interface EditorState {
  content: string;
  isDirty: boolean;
  lastSaved: string | null;
  autoSaveEnabled: boolean;
  wordCount: number;
  readingTime: number;
}

class ContentManager {
  private static instance: ContentManager;
  private autoSaveTimers: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): ContentManager {
    if (!ContentManager.instance) {
      ContentManager.instance = new ContentManager();
    }
    return ContentManager.instance;
  }

  /**
   * Create new content item
   */
  async createContent(data: Partial<ContentItem>): Promise<ContentItem> {
    try {
      const response = await apiService.createArticle(data);
      
      if (response.success) {
        // Invalidate relevant caches
        await this.invalidateContentCaches(data.type);
        
        analytics.track('content_created', 'cms', {
          type: data.type,
          hasImage: !!data.imageUrl,
          tagCount: data.tags?.length || 0,
        });

        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to create content');
      }
    } catch (error) {
      console.error('❌ Failed to create content:', error);
      throw error;
    }
  }

  /**
   * Update existing content
   */
  async updateContent(id: string, data: Partial<ContentItem>): Promise<ContentItem> {
    try {
      const response = await apiService.updateArticle(id, data);
      
      if (response.success) {
        // Update cache
        await advancedCache.set('articles', id, response.data, 24 * 60 * 60 * 1000);
        await this.invalidateContentCaches(data.type);
        
        analytics.track('content_updated', 'cms', {
          contentId: id,
          type: data.type,
          statusChanged: !!data.status,
        });

        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to update content');
      }
    } catch (error) {
      console.error('❌ Failed to update content:', error);
      throw error;
    }
  }

  /**
   * Delete content
   */
  async deleteContent(id: string): Promise<void> {
    try {
      const response = await apiService.deleteArticle(id);
      
      if (response.success) {
        // Remove from cache
        await advancedCache.delete('articles', id);
        await this.invalidateContentCaches();
        
        analytics.track('content_deleted', 'cms', { contentId: id });
      } else {
        throw new Error(response.error?.message || 'Failed to delete content');
      }
    } catch (error) {
      console.error('❌ Failed to delete content:', error);
      throw error;
    }
  }

  /**
   * Get content with caching
   */
  async getContent(id: string): Promise<ContentItem | null> {
    try {
      return await advancedCache.cacheWithFallback(
        'articles',
        id,
        async () => {
          const response = await apiService.getArticle(id);
          if (response.success) {
            return response.data;
          }
          throw new Error(response.error?.message || 'Content not found');
        },
        24 * 60 * 60 * 1000 // 24 hours
      );
    } catch (error) {
      console.error('❌ Failed to get content:', error);
      return null;
    }
  }

  /**
   * Search and filter content
   */
  async searchContent(filters: ContentFilter, page: number = 1, limit: number = 20): Promise<{
    items: ContentItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const cacheKey = `search_${JSON.stringify(filters)}_${page}_${limit}`;
      
      return await advancedCache.cacheWithFallback(
        'search',
        cacheKey,
        async () => {
          const response = await apiService.getArticles({
            ...filters,
            page,
            limit,
          });
          
          if (response.success) {
            return {
              items: response.data,
              total: response.meta?.total || response.data.length,
              page: response.meta?.page || page,
              totalPages: response.meta?.totalPages || Math.ceil((response.meta?.total || response.data.length) / limit),
            };
          }
          
          throw new Error(response.error?.message || 'Search failed');
        },
        5 * 60 * 1000 // 5 minutes for search results
      );
    } catch (error) {
      console.error('❌ Failed to search content:', error);
      return { items: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  /**
   * Get content statistics
   */
  async getContentStats(): Promise<ContentStats> {
    try {
      return await advancedCache.cacheWithFallback(
        'metadata',
        'content_stats',
        async () => {
          // This would typically be a dedicated API endpoint
          const response = await apiService.getArticles({ limit: 1000 });
          
          if (response.success) {
            const items = response.data;
            
            const stats: ContentStats = {
              total: items.length,
              published: items.filter(item => item.status === 'published').length,
              drafts: items.filter(item => item.status === 'draft').length,
              archived: items.filter(item => item.status === 'archived').length,
              byType: {},
              byAuthor: {},
              recentActivity: [],
            };

            // Calculate by type
            items.forEach(item => {
              const type = item.type || 'article';
              stats.byType[type] = (stats.byType[type] || 0) + 1;
            });

            // Calculate by author
            items.forEach(item => {
              const author = item.author?.name || 'Unknown';
              stats.byAuthor[author] = (stats.byAuthor[author] || 0) + 1;
            });

            // Recent activity (last 10 items by update date)
            const recentItems = items
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 10);

            stats.recentActivity = recentItems.map(item => ({
              action: item.createdAt === item.updatedAt ? 'created' : 'updated',
              contentId: item.id,
              contentTitle: item.title,
              author: item.author?.name || 'Unknown',
              timestamp: item.updatedAt,
            }));

            return stats;
          }
          
          throw new Error('Failed to get content stats');
        },
        10 * 60 * 1000 // 10 minutes
      );
    } catch (error) {
      console.error('❌ Failed to get content stats:', error);
      return {
        total: 0,
        published: 0,
        drafts: 0,
        archived: 0,
        byType: {},
        byAuthor: {},
        recentActivity: [],
      };
    }
  }

  /**
   * Auto-save content
   */
  async autoSave(id: string, content: Partial<ContentItem>): Promise<void> {
    // Clear existing timer
    const existingTimer = this.autoSaveTimers.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        await this.updateContent(id, { ...content, status: 'draft' });
        console.log('💾 Auto-saved content:', id);
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      } finally {
        this.autoSaveTimers.delete(id);
      }
    }, 5000); // Auto-save after 5 seconds of inactivity

    this.autoSaveTimers.set(id, timer);
  }

  /**
   * Invalidate content caches
   */
  private async invalidateContentCaches(type?: string): Promise<void> {
    try {
      // Clear search cache
      await advancedCache.clear('search');
      
      // Clear metadata cache
      await advancedCache.delete('metadata', 'content_stats');
      
      // Clear type-specific caches if specified
      if (type) {
        const keys = await advancedCache.keys('articles');
        const typeKeys = keys.filter(key => key.includes(type));
        for (const key of typeKeys) {
          await advancedCache.delete('articles', key);
        }
      }
    } catch (error) {
      console.error('❌ Failed to invalidate caches:', error);
    }
  }

  /**
   * Calculate reading time
   */
  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Extract summary from content
   */
  extractSummary(content: string, maxLength: number = 160): string {
    // Remove HTML tags
    const textContent = content.replace(/<[^>]*>/g, '');
    
    // Get first paragraph or truncate
    const firstParagraph = textContent.split('\n')[0];
    
    if (firstParagraph.length <= maxLength) {
      return firstParagraph;
    }
    
    return textContent.substring(0, maxLength).trim() + '...';
  }
}

// Export singleton
export const contentManager = ContentManager.getInstance();

/**
 * Content management hook
 */
export const useContentManagement = () => {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshStats = useCallback(async () => {
    setLoading(true);
    try {
      const newStats = await contentManager.getContentStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    loading,
    refreshStats,
    createContent: contentManager.createContent.bind(contentManager),
    updateContent: contentManager.updateContent.bind(contentManager),
    deleteContent: contentManager.deleteContent.bind(contentManager),
    getContent: contentManager.getContent.bind(contentManager),
    searchContent: contentManager.searchContent.bind(contentManager),
  };
};

/**
 * Content editor hook
 */
export const useContentEditor = (initialContent: string = '', contentId?: string) => {
  const [editorState, setEditorState] = useState<EditorState>({
    content: initialContent,
    isDirty: false,
    lastSaved: null,
    autoSaveEnabled: true,
    wordCount: 0,
    readingTime: 0,
  });

  const updateContent = useCallback((newContent: string) => {
    const wordCount = newContent.trim().split(/\s+/).length;
    const readingTime = contentManager.calculateReadingTime(newContent);

    setEditorState(prev => ({
      ...prev,
      content: newContent,
      isDirty: newContent !== initialContent,
      wordCount,
      readingTime,
    }));

    // Auto-save if enabled and content ID exists
    if (editorState.autoSaveEnabled && contentId && newContent !== initialContent) {
      contentManager.autoSave(contentId, { content: newContent });
    }
  }, [initialContent, contentId, editorState.autoSaveEnabled]);

  const toggleAutoSave = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      autoSaveEnabled: !prev.autoSaveEnabled,
    }));
  }, []);

  const markAsSaved = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      isDirty: false,
      lastSaved: new Date().toISOString(),
    }));
  }, []);

  return {
    ...editorState,
    updateContent,
    toggleAutoSave,
    markAsSaved,
  };
};
