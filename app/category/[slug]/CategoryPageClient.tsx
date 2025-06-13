'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopHeader from '../../../components/TopHeader';
import NavBar from '../../../components/NavBar';
import Footer from '../../../components/Footer';
import BackToTopButton from '../../../components/BackToTopButton';
import LoadingSpinner from '../../../components/LoadingSpinner';

import { SectionId, NAV_LINKS } from '../../../constants';
import type { Article } from '../../../types';

interface CategoryPageClientProps {
  category: {
    name: string;
    slug: string;
  };
  articles: Article[];
}

export default function CategoryPageClient({ category, articles }: CategoryPageClientProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <TopHeader theme={theme} toggleTheme={toggleTheme} />
      <NavBar
        navLinks={NAV_LINKS}
        onNavLinkClick={scrollToSection}
        activeSection={SectionId.HOME}
        searchTerm=""
        onSearchChange={() => {}}
      />
      
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-8 mt-20">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/news" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Categories
                </Link>
              </li>
              <li>/</li>
              <li className="text-slate-800 dark:text-slate-200">
                {category.name}
              </li>
            </ol>
          </nav>

          {/* Category Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              {articles.length} article{articles.length !== 1 ? 's' : ''} in this category
            </p>
          </header>
          
          {/* Articles Grid */}
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
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
                No articles found in this category yet.
              </p>
              <Link 
                href="/news"
                className="inline-block mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Browse all articles →
              </Link>
            </div>
          )}

          {/* Back Navigation */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <Link
              href="/news"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              ← Back to All News
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
}
