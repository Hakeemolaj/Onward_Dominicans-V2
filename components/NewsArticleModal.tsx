
import React, { useState, useEffect, useMemo } from 'react';
import { NewsArticle } from '../types';
import SocialShareButtons from './SocialShareButtons';
import { getAISummary } from '../services/aiService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { SAMPLE_NEWS_ARTICLES } from '../constants';

interface NewsArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
  onSelectArticleToOpen: (article: NewsArticle) => void;
}

const MAX_RELATED_ARTICLES = 3;

const NewsArticleModal: React.FC<NewsArticleModalProps> = ({ isOpen, onClose, article, onSelectArticleToOpen }) => {
  const [showContent, setShowContent] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && article) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => setShowContent(true), 50);
      setCurrentUrl(article.slug ? `${window.location.origin}/news/${article.slug}` : window.location.href);
      
      // Reset states for the new article
      setAiSummary(null);
      setIsSummaryLoading(false);
      setSummaryError(null);
      
      // Scroll modal to top when article changes
      const modalContent = document.querySelector('.news-article-modal-scrollable-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }

      return () => {
        clearTimeout(timer);
        // document.body.style.overflow = ''; // This is handled by the isOpen === false case
      };
    } else {
      setShowContent(false);
      document.body.style.overflow = '';
    }
  }, [isOpen, article]);


  const relatedArticles = useMemo(() => {
    if (!article) return [];

    const findRelated = (): NewsArticle[] => {
      const currentId = article.id;
      let related: NewsArticle[] = [];
      const seenIds = new Set<string>([currentId]);

      // 1. By Category
      if (article.category) {
        SAMPLE_NEWS_ARTICLES.forEach(a => {
          if (related.length < MAX_RELATED_ARTICLES && a.id !== currentId && a.category === article.category && !seenIds.has(a.id)) {
            related.push(a);
            seenIds.add(a.id);
          }
        });
      }

      // 2. By Tags (if needed)
      if (related.length < MAX_RELATED_ARTICLES && article.tags && article.tags.length > 0) {
        const currentTagsSet = new Set(article.tags);
        SAMPLE_NEWS_ARTICLES.forEach(a => {
          if (related.length < MAX_RELATED_ARTICLES && a.id !== currentId && !seenIds.has(a.id) && a.tags) {
            for (const tag of a.tags) {
              if (currentTagsSet.has(tag)) {
                related.push(a);
                seenIds.add(a.id);
                break; 
              }
            }
          }
        });
      }
      return related.slice(0, MAX_RELATED_ARTICLES);
    };
    return findRelated();
  }, [article]);


  if (!isOpen || !article) return null;

  const handleGetAISummary = async () => {
    if (!article?.fullContent) {
      setSummaryError("Article content is missing.");
      return;
    }
    setIsSummaryLoading(true);
    setAiSummary(null);
    setSummaryError(null);
    try {
      const summary = await getAISummary(article.fullContent);
      setAiSummary(summary);
    } catch (error) {
      if (error instanceof Error) {
        setSummaryError(error.message);
      } else {
        setSummaryError("An unexpected error occurred while generating the summary.");
      }
    } finally {
      setIsSummaryLoading(false);
    }
  };
  
  const handleRelatedArticleClick = (relatedArticle: NewsArticle) => {
    onSelectArticleToOpen(relatedArticle);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 dark:bg-opacity-80 flex justify-center items-start p-0 md:p-4 z-[60] overflow-y-auto news-article-modal-scrollable-content"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-article-title"
    >
      <div
        className={`
          bg-white dark:bg-slate-800 rounded-none md:rounded-lg shadow-xl p-6 md:p-8 w-full max-w-3xl my-0 md:my-8 relative
          transform transition-all duration-300 ease-out text-slate-700 dark:text-slate-200 min-h-screen md:min-h-0
          ${showContent ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-[20px]'}
        `}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-3xl z-10"
          aria-label="Close article"
        >
          &times;
        </button>

        <article>
          <header className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
            {article.category && (
              <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-1">{article.category}</p>
            )}
            <h1 id="news-article-title" className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              {article.title}
            </h1>
            <div className="mt-3 flex items-center text-sm text-slate-500 dark:text-slate-400">
              {article.author.avatarUrl && (
                <img src={article.author.avatarUrl} alt={article.author.name} className="w-8 h-8 rounded-full mr-2 object-cover" />
              )}
              <span>By <strong className="text-slate-700 dark:text-slate-200">{article.author.name}</strong></span>
              <span className="mx-2">|</span>
              <span>{article.date}</span>
            </div>
          </header>

          {article.imageUrl && (
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-auto max-h-[50vh] object-cover rounded-lg mb-6 shadow-md"
            />
          )}
          
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            {article.fullContent.split('\n').map((paragraph, index) => (
              paragraph.trim() ? <p key={index} className="mb-4 last:mb-0">{paragraph}</p> : null
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-100 mb-3">Need a Quick Overview?</h3>
            <button
              onClick={handleGetAISummary}
              disabled={isSummaryLoading || !!aiSummary}
              className="px-6 py-2 bg-yellow-500 text-slate-900 font-semibold rounded-md shadow-sm hover:bg-yellow-400 dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:text-slate-900 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSummaryLoading ? 'Generating Summary...' : (aiSummary ? 'Summary Generated' : 'Get AI Summary (TL;DR)')}
            </button>
            <div id="ai-summary-response-area" aria-live="polite" className="mt-4">
              {isSummaryLoading && <LoadingSpinner />}
              {summaryError && <ErrorMessage message={summaryError} />}
              {aiSummary && !isSummaryLoading && !summaryError && (
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-md shadow border border-slate-200 dark:border-slate-600">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-2">AI Generated Summary:</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{aiSummary}</p>
                </div>
              )}
            </div>
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 px-2 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <SocialShareButtons articleTitle={article.title} articleUrl={currentUrl} />
          </div>

          {relatedArticles.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">You Might Also Like</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedArticles.map(related => (
                  <div 
                    key={related.id}
                    className="bg-slate-50 dark:bg-slate-700 rounded-lg shadow-md dark:shadow-slate-900/50 overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 group"
                    onClick={() => handleRelatedArticleClick(related)}
                    role="link"
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRelatedArticleClick(related);}}
                    aria-label={`Read more about ${related.title}`}
                  >
                    <img 
                      src={related.imageUrl || `https://picsum.photos/seed/${related.id}/300/180`} 
                      alt={related.title} 
                      className="w-full h-32 object-cover"
                      loading="lazy"
                    />
                    <div className="p-4">
                      {related.category && (
                         <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-1">{related.category}</p>
                      )}
                      <h4 className="text-md font-semibold text-slate-700 dark:text-slate-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 line-clamp-2">
                        {related.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </article>
         <button
            onClick={onClose}
            className="mt-10 w-full px-6 py-3 bg-yellow-500 text-slate-900 font-semibold rounded-lg shadow-md hover:bg-yellow-400 dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:text-slate-900 transition-colors duration-300"
          >
            Close Article
          </button>
      </div>
    </div>
  );
};

export default NewsArticleModal;
