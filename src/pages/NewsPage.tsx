import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ARTICLES } from '../router';
import SEOHead from '../../components/SEOHead';
import SEOAnalytics from '../../components/SEOAnalytics';
import TopHeader from '../../components/TopHeader';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import BackToTopButton from '../../components/BackToTopButton';
import { NAV_LINKS } from '../../constants';

const NewsPage: React.FC = () => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  useEffect(() => {
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <SEOHead
        title="Dominican Community News - Latest Updates & Stories"
        description="Stay informed with the latest Dominican community news, events, and stories. From local celebrations to cultural milestones, never miss what matters to our community."
        url="https://onward-dominicans.vercel.app/news"
        keywords={['Dominican news', 'community updates', 'Dominican events', 'cultural news', 'Latino news', 'Caribbean news']}
      />
      
      <SEOAnalytics
        pageTitle="Dominican Community News - Latest Updates & Stories"
        contentType="news-listing"
      />

      <TopHeader theme={theme} toggleTheme={toggleTheme} />
      <NavBar
        navLinks={NAV_LINKS}
        onNavLinkClick={() => {}}
        activeSection="news-feed"
        searchTerm=""
        onSearchChange={() => {}}
      />

      <main className="flex-grow">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Dominican Community News
            </h1>
            <p className="text-xl opacity-90 max-w-2xl">
              Stay connected with the latest news, events, and stories from the Dominican community worldwide.
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <Link to="/" className="hover:text-yellow-500 transition-colors">
                Home
              </Link>
              <span>›</span>
              <span className="text-slate-800 dark:text-slate-200">News</span>
            </nav>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ARTICLES.map((article) => (
              <article
                key={article.slug}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <Link to={`/article/${article.slug}`}>
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </Link>
                
                <div className="p-6">
                  <div className="mb-3">
                    <span className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-sm font-medium">
                      {article.category}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 line-clamp-2">
                    <Link 
                      to={`/article/${article.slug}`}
                      className="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </h2>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {article.author.name}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        {formatDate(article.date)}
                      </p>
                    </div>
                    
                    <Link
                      to={`/article/${article.slug}`}
                      className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium transition-colors"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More Section (for future expansion) */}
          <div className="text-center mt-12">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              More articles coming soon! Stay tuned for the latest Dominican community news.
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <span>Back to Homepage</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default NewsPage;
