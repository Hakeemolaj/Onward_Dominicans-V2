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

interface ArticlePageClientProps {
  article: Article;
}

export default function ArticlePageClient({ article }: ArticlePageClientProps) {
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
    // For article pages, navigate to home page with section
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
        <article className="max-w-4xl mx-auto px-4 py-8 mt-20">
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
                  News
                </Link>
              </li>
              <li>/</li>
              <li className="text-slate-800 dark:text-slate-200 truncate">
                {article.title}
              </li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <div className="mb-4">
              <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                {article.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center text-slate-600 dark:text-slate-400 mb-6">
              <span>By {article.author}</span>
              <span className="mx-2">•</span>
              <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <span className="mx-2">•</span>
              <span>{article.readTime || '5 min read'}</span>
            </div>

            {article.imageUrl && (
              <div className="mb-8">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            {article.summary && (
              <div className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                {article.summary}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Tags:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Link
                href="/news"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                ← Back to News
              </Link>
              
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Home →
              </Link>
            </div>
          </footer>
        </article>
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
}
