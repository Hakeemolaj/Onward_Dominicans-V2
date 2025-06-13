import React, { useEffect } from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import SEOHead from '../../components/SEOHead';
import SEOAnalytics from '../../components/SEOAnalytics';
import TopHeader from '../../components/TopHeader';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import BackToTopButton from '../../components/BackToTopButton';
import SocialShareButtons from '../components/SocialShareButtons';
import { NAV_LINKS } from '../../constants';

interface Article {
  slug: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  author: {
    name: string;
    bio: string;
  };
  date: string;
  category: string;
  tags: string[];
}

const ArticlePage: React.FC = () => {
  const article = useLoaderData() as Article;
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Apply theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4">
              {paragraph.replace('## ', '')}
            </h2>
          );
        }
        if (paragraph.startsWith('### ')) {
          return (
            <h3 key={index} className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3">
              {paragraph.replace('### ', '')}
            </h3>
          );
        }
        if (paragraph.startsWith('- ')) {
          const items = paragraph.split('\n').filter(line => line.startsWith('- '));
          return (
            <ul key={index} className="list-disc list-inside space-y-2 mb-6 text-slate-700 dark:text-slate-300">
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{item.replace('- ', '')}</li>
              ))}
            </ul>
          );
        }
        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
          return (
            <p key={index} className="font-bold text-slate-800 dark:text-slate-200 mb-4">
              {paragraph.replace(/\*\*/g, '')}
            </p>
          );
        }
        return (
          <p key={index} className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
            {paragraph}
          </p>
        );
      });
  };

  const articleUrl = `https://onward-dominicans.vercel.app/article/${article.slug}`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <SEOHead
        title={`${article.title} - Onward Dominicans`}
        description={article.summary}
        image={article.imageUrl}
        url={articleUrl}
        type="article"
        keywords={['Dominican community', 'Dominican culture', ...article.tags]}
        article={{
          title: article.title,
          summary: article.summary,
          imageUrl: article.imageUrl,
          date: article.date,
          author: article.author,
          category: article.category,
          tags: article.tags,
          fullContent: article.content,
          id: article.slug
        }}
        publishedTime={article.date}
        modifiedTime={article.date}
        section={article.category}
        tags={article.tags}
      />
      
      <SEOAnalytics
        pageTitle={`${article.title} - Onward Dominicans`}
        contentType="article"
        articleId={article.slug}
      />

      <TopHeader theme={theme} toggleTheme={toggleTheme} />
      <NavBar
        navLinks={NAV_LINKS}
        onNavLinkClick={() => {}} // Not needed for static pages
        activeSection=""
        searchTerm=""
        onSearchChange={() => {}}
      />

      <main className="flex-grow">
        {/* Breadcrumb Navigation */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <Link to="/" className="hover:text-yellow-500 transition-colors">
                Home
              </Link>
              <span>›</span>
              <Link to="/news" className="hover:text-yellow-500 transition-colors">
                News
              </Link>
              <span>›</span>
              <span className="text-slate-800 dark:text-slate-200">{article.title}</span>
            </nav>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 py-8">
          {/* Article Header */}
          <header className="mb-8">
            <div className="mb-4">
              <span className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium">
                {article.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-4 leading-tight">
              {article.title}
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              {article.summary}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {article.author.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {article.author.bio}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Published on
                </p>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {formatDate(article.date)}
                </p>
              </div>
            </div>

            {/* Social Share Buttons */}
            <SocialShareButtons
              url={articleUrl}
              title={article.title}
              description={article.summary}
            />
          </header>

          {/* Featured Image */}
          <div className="mb-8">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Article Body */}
          <div className="prose prose-lg max-w-none">
            {renderContent(article.content)}
          </div>

          {/* Article Tags */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Back to News */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Link
              to="/news"
              className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to News</span>
            </Link>
          </div>
        </article>
      </main>

      <Footer />
      <BackToTopButton />
      <Analytics />
    </div>
  );
};

export default ArticlePage;
