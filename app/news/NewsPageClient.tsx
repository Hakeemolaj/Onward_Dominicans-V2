'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopHeader from '../../components/TopHeader';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import BackToTopButton from '../../components/BackToTopButton';
import LoadingSpinner from '../../components/LoadingSpinner';

import { SectionId, NAV_LINKS } from '../../constants';

// Static articles data (will be replaced with Supabase data fetching)
const ARTICLES = [
  {
    id: 'celebrating-dominican-independence-day-2024',
    slug: 'celebrating-dominican-independence-day-2024',
    title: 'Celebrating Dominican Independence Day: A Community United',
    summary: 'Community members come together to celebrate Dominican Independence Day with traditional performances, food, and cultural activities.',
    content: 'Every February 27th, Dominicans around the world come together to celebrate their independence from Haiti in 1844...',
    author: 'Maria Rodriguez',
    category: 'Community Events',
    publishedAt: '2024-02-27T00:00:00',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
    tags: ['independence', 'community', 'culture', 'celebration']
  },
  {
    id: 'traditional-mangu-family-recipe',
    slug: 'traditional-mangu-family-recipe',
    title: 'The Art of Making Traditional Mangu: A Family Recipe',
    summary: 'Learn to make authentic Dominican mangu with this traditional family recipe passed down through generations.',
    content: 'Mangu is more than just a dish—it\'s a cornerstone of Dominican cuisine...',
    author: 'Carlos Santana',
    category: 'Food & Cuisine',
    publishedAt: '2024-01-15T00:00:00',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    tags: ['food', 'recipe', 'tradition', 'mangu']
  }
];

export default function NewsPageClient() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Theme management
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('theme', newTheme);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  // Initialize theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

      setTheme(initialTheme);
      document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    }
    setIsLoading(false);
  }, []);

  // Scroll to section (for nav compatibility)
  const scrollToSection = (sectionId: SectionId) => {
    window.location.href = `/#${sectionId}`;
  };

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(ARTICLES.map(article => article.category)))];

  // Filter articles
  const filteredArticles = ARTICLES.filter(article => {
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <TopHeader theme={theme} toggleTheme={toggleTheme} />
      <NavBar
        navLinks={NAV_LINKS}
        onNavLinkClick={scrollToSection}
        activeSection={SectionId.NEWS_FEED}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-8 mt-20">
          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Latest News</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Stay updated with the latest from our Dominican community
            </p>
          </header>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-slate-600 dark:text-slate-400">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {/* Articles Grid */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <article key={article.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {article.imageUrl && (
                    <Link href={`/article/${article.slug}`}>
                      <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  )}
                  <div className="p-6">
                    <div className="mb-2">
                      <Link 
                        href={`/category/${article.category.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, '')}`}
                        className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        {article.category}
                      </Link>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      <Link 
                        href={`/article/${article.slug}`}
                        className="text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-500">
                      <span>By {article.author}</span>
                      <time dateTime={article.publishedAt}>
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                No articles found matching your criteria.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                }}
                className="inline-block mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Clear filters →
              </button>
            </div>
          )}

          {/* Back Navigation */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
}
