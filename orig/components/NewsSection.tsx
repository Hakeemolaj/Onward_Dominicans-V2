
import React, { forwardRef, useMemo, useRef, useState, ChangeEvent } from 'react';
import { SectionProps, NewsArticle } from '../types';
import { SAMPLE_NEWS_ARTICLES } from '../constants';

interface NewsSectionProps extends SectionProps {
  onReadMoreClick: (article: NewsArticle) => void;
  searchTerm: string;
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onSearchChange: (term: string) => void;
}

enum SortOption {
  DATE_DESC = 'date-desc',
  DATE_ASC = 'date-asc',
  TITLE_ASC = 'title-asc',
  TITLE_DESC = 'title-desc',
}

const SORT_OPTIONS_LABELS: Record<SortOption, string> = {
  [SortOption.DATE_DESC]: 'Sort by Date (Newest First)',
  [SortOption.DATE_ASC]: 'Sort by Date (Oldest First)',
  [SortOption.TITLE_ASC]: 'Sort by Title (A-Z)',
  [SortOption.TITLE_DESC]: 'Sort by Title (Z-A)',
};

const NewsSection = forwardRef<HTMLDivElement, NewsSectionProps>((props, ref) => {
  const { searchTerm, activeCategory, onCategoryChange, onSearchChange } = props;
  const newsSectionRef = ref || useRef<HTMLDivElement>(null);

  const [sortOrder, setSortOrder] = useState<SortOption>(SortOption.DATE_DESC);

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    SAMPLE_NEWS_ARTICLES.forEach(article => {
      if (article.category) {
        categories.add(article.category);
      }
    });
    return Array.from(categories).sort();
  }, []);

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as SortOption);
  };

  const filteredArticles = useMemo(() => {
    let articles = SAMPLE_NEWS_ARTICLES;

    if (activeCategory) {
      articles = articles.filter(article => article.category === activeCategory);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      articles = articles.filter(article =>
        article.title.toLowerCase().includes(lowerSearchTerm) ||
        article.summary.toLowerCase().includes(lowerSearchTerm) ||
        (article.author && article.author.name.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    let sortedArticles = [...articles];
    switch (sortOrder) {
      case SortOption.DATE_ASC:
        sortedArticles.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case SortOption.TITLE_ASC:
        sortedArticles.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case SortOption.TITLE_DESC:
        sortedArticles.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case SortOption.DATE_DESC:
      default:
        sortedArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }

    return sortedArticles;
  }, [activeCategory, searchTerm, sortOrder]);

  let sectionTitle = "Latest News & Stories";
  if (activeCategory && searchTerm) {
    sectionTitle = `Search results for "${searchTerm}" in ${activeCategory}`;
  } else if (activeCategory) {
    sectionTitle = `${activeCategory} News`;
  } else if (searchTerm) {
    sectionTitle = `Search results for "${searchTerm}"`;
  }

  const handleClearFilters = () => {
    onCategoryChange(null);
    onSearchChange('');
    setSortOrder(SortOption.DATE_DESC); 
    if (newsSectionRef && 'current' in newsSectionRef && newsSectionRef.current) {
      newsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section 
      ref={newsSectionRef}
      id={props.id} 
      className={`py-16 md:py-24 bg-slate-100 dark:bg-slate-800 ${props.className || ''}`}
      aria-labelledby="news-feed-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="news-feed-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 text-center mb-8">
          {sectionTitle}
        </h2>

        <div className="mb-10 space-y-6">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => onCategoryChange(null)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150
                ${activeCategory === null 
                  ? 'bg-yellow-500 text-slate-900 dark:bg-yellow-400 dark:text-slate-900' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'}
              `}
              aria-pressed={activeCategory === null}
            >
              All Categories
            </button>
            {uniqueCategories.map(category => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150
                  ${activeCategory === category 
                    ? 'bg-yellow-500 text-slate-900 dark:bg-yellow-400 dark:text-slate-900' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'}
                `}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <div className="w-full sm:w-auto sm:max-w-xs">
              <label htmlFor="sort-order" className="sr-only">Sort Articles By</label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={handleSortChange}
                className="block w-full px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:focus:ring-yellow-400 dark:focus:border-yellow-400 transition-colors duration-150"
              >
                {Object.entries(SORT_OPTIONS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map(article => (
              <div 
                key={article.id} 
                className="bg-white dark:bg-slate-700 rounded-lg shadow-xl dark:shadow-slate-900/50 overflow-hidden flex flex-col transform transition-all duration-300 hover:shadow-2xl dark:hover:shadow-slate-900/70 hover:scale-[1.02]"
              >
                <img 
                  src={article.imageUrl || `https://picsum.photos/seed/${article.id}/400/250`} 
                  alt={article.title} 
                  className="w-full h-52 object-cover cursor-pointer"
                  onClick={() => props.onReadMoreClick(article)}
                  loading="lazy"
                />
                <div className="p-6 flex flex-col flex-grow">
                  {article.category && (
                    <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-1">{article.category}</p>
                  )}
                  <h3 
                    className="text-xl font-semibold text-slate-700 dark:text-slate-100 mb-2 cursor-pointer hover:text-yellow-700 dark:hover:text-yellow-400"
                    onClick={() => props.onReadMoreClick(article)}
                  >
                    {article.title}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    By <span className="font-medium text-slate-600 dark:text-slate-300">{article.author.name}</span> | {article.date}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-grow line-clamp-3">{article.summary}</p>
                  <button 
                    onClick={() => props.onReadMoreClick(article)}
                    className="mt-auto text-sm text-yellow-700 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 font-semibold self-start hover:underline focus:outline-none"
                    aria-label={`Read more about ${article.title}`}
                  >
                    Read More &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-600 dark:text-slate-300 text-lg py-10 bg-white dark:bg-slate-700 rounded-md shadow">
            No articles found matching your criteria.
          </p>
        )}
        
        {(activeCategory || searchTerm || sortOrder !== SortOption.DATE_DESC) && ( 
            <div className="text-center mt-16">
                <button 
                  onClick={handleClearFilters}
                  className="inline-block px-8 py-3 bg-slate-700 text-white dark:bg-slate-600 dark:text-slate-100 font-semibold rounded-lg shadow-md hover:bg-slate-600 dark:hover:bg-slate-500 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800"
                >
                    Clear Filters & Reset Sort
                </button>
            </div>
        )}
      </div>
    </section>
  );
});

export default NewsSection;