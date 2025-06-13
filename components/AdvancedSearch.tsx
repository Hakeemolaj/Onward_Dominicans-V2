import React, { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '../utils/componentHelpers';
import { MemoCache } from '../utils/performance';

interface SearchFilters {
  searchTerm: string;
  category: string | null;
  author: string | null;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  tags: string[];
  sortBy: 'date' | 'title' | 'author' | 'relevance';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  availableCategories: string[];
  availableAuthors: string[];
  availableTags: string[];
  initialFilters?: Partial<SearchFilters>;
  className?: string;
}

const defaultFilters: SearchFilters = {
  searchTerm: '',
  category: null,
  author: null,
  dateRange: { start: null, end: null },
  tags: [],
  sortBy: 'date',
  sortOrder: 'desc'
};

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onFiltersChange,
  availableCategories,
  availableAuthors,
  availableTags,
  initialFilters = {},
  className = ''
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    ...defaultFilters,
    ...initialFilters
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounced filter change handler
  const debouncedOnFiltersChange = useDebounce(onFiltersChange, 300);

  // Update filters and notify parent
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    debouncedOnFiltersChange(updatedFilters);
  }, [filters, debouncedOnFiltersChange]);

  // Memoized filter suggestions
  const filterSuggestions = useMemo(() => {
    return MemoCache.memoize(
      (searchTerm: string, categories: string[], authors: string[], tags: string[]) => {
        if (!searchTerm || searchTerm.length < 2) return [];

        const suggestions: Array<{ type: string; value: string; label: string }> = [];
        const lowerSearchTerm = searchTerm.toLowerCase();

        // Category suggestions
        categories
          .filter(cat => cat.toLowerCase().includes(lowerSearchTerm))
          .forEach(cat => suggestions.push({ type: 'category', value: cat, label: `Category: ${cat}` }));

        // Author suggestions
        authors
          .filter(author => author.toLowerCase().includes(lowerSearchTerm))
          .forEach(author => suggestions.push({ type: 'author', value: author, label: `Author: ${author}` }));

        // Tag suggestions
        tags
          .filter(tag => tag.toLowerCase().includes(lowerSearchTerm))
          .forEach(tag => suggestions.push({ type: 'tag', value: tag, label: `Tag: ${tag}` }));

        return suggestions.slice(0, 10); // Limit to 10 suggestions
      },
      (searchTerm, categories, authors, tags) => 
        `suggestions-${searchTerm}-${categories.length}-${authors.length}-${tags.length}`
    )(filters.searchTerm, availableCategories, availableAuthors, availableTags);
  }, [filters.searchTerm, availableCategories, availableAuthors, availableTags]);

  const handleTagToggle = useCallback((tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  }, [filters.tags, updateFilters]);

  const clearAllFilters = useCallback(() => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  }, [onFiltersChange]);

  const hasActiveFilters = useMemo(() => {
    return filters.searchTerm !== '' ||
           filters.category !== null ||
           filters.author !== null ||
           filters.dateRange.start !== null ||
           filters.dateRange.end !== null ||
           filters.tags.length > 0 ||
           filters.sortBy !== 'date' ||
           filters.sortOrder !== 'desc';
  }, [filters]);

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 ${className}`}>
      {/* Basic Search */}
      <div className="relative mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles, authors, or topics..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Search Suggestions */}
        {filterSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filterSuggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                onClick={() => {
                  if (suggestion.type === 'category') {
                    updateFilters({ category: suggestion.value, searchTerm: '' });
                  } else if (suggestion.type === 'author') {
                    updateFilters({ author: suggestion.value, searchTerm: '' });
                  } else if (suggestion.type === 'tag') {
                    handleTagToggle(suggestion.value);
                    updateFilters({ searchTerm: '' });
                  }
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 text-sm"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 mb-4"
      >
        <span>Advanced Filters</span>
        <svg 
          className={`ml-2 h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-600 pt-4">
          {/* Category and Author Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => updateFilters({ category: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Author
              </label>
              <select
                value={filters.author || ''}
                onChange={(e) => updateFilters({ author: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="">All Authors</option>
                {availableAuthors.map(author => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={filters.dateRange.start || ''}
                onChange={(e) => updateFilters({ 
                  dateRange: { ...filters.dateRange, start: e.target.value || null }
                })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="Start date"
              />
              <input
                type="date"
                value={filters.dateRange.end || ''}
                onChange={(e) => updateFilters({ 
                  dateRange: { ...filters.dateRange, end: e.target.value || null }
                })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="End date"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.tags.includes(tag)
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="relevance">Relevance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => updateFilters({ sortOrder: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
