import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import SEOAnalytics from '../../components/SEOAnalytics';
import TopHeader from '../../components/TopHeader';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import BackToTopButton from '../../components/BackToTopButton';
import { NAV_LINKS } from '../../constants';

const CulturePage: React.FC = () => {
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <SEOHead
        title="Dominican Culture & Traditions - Heritage & Customs"
        description="Explore rich Dominican culture, traditions, and customs. Learn about merengue, bachata, traditional foods, festivals, and the heritage that defines our community."
        url="https://onward-dominicans.vercel.app/culture"
        keywords={['Dominican culture', 'Dominican traditions', 'merengue', 'bachata', 'Dominican heritage', 'Caribbean culture', 'Dominican customs']}
      />
      
      <SEOAnalytics
        pageTitle="Dominican Culture & Traditions - Heritage & Customs"
        contentType="culture-hub"
      />

      <TopHeader theme={theme} toggleTheme={toggleTheme} />
      <NavBar
        navLinks={NAV_LINKS}
        onNavLinkClick={() => {}}
        activeSection="about-publication"
        searchTerm=""
        onSearchChange={() => {}}
      />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Dominican Culture & Heritage
            </h1>
            <p className="text-xl opacity-90 max-w-2xl">
              Discover the rich traditions, vibrant music, delicious cuisine, and cultural heritage that make the Dominican Republic unique.
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
              <span className="text-slate-800 dark:text-slate-200">Culture</span>
            </nav>
          </div>
        </div>

        {/* Culture Sections */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Music & Dance */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8">
              Music & Dance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  Merengue
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  The national dance and music of the Dominican Republic, merengue is characterized by its fast-paced rhythm and infectious energy that brings people together.
                </p>
                <Link
                  to="/article/preserving-musical-heritage-merengue"
                  className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium transition-colors"
                >
                  Learn More About Merengue →
                </Link>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  Bachata
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Born in the countryside of the Dominican Republic, bachata is a romantic music and dance style that has gained international recognition.
                </p>
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                  Coming Soon: Detailed Bachata Guide
                </span>
              </div>
            </div>
          </section>

          {/* Food & Cuisine */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8">
              Traditional Cuisine
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  Mangu
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  The beloved breakfast dish made from mashed plantains, often served with eggs, cheese, and salami.
                </p>
                <Link
                  to="/article/traditional-mangu-family-recipe"
                  className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium transition-colors"
                >
                  Get the Recipe →
                </Link>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  Sancocho
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  A hearty stew that brings families together, featuring various meats and vegetables in a flavorful broth.
                </p>
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                  Recipe Coming Soon
                </span>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  Tres Golpes
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  The classic Dominican breakfast combination of mangu, fried eggs, cheese, and salami.
                </p>
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                  Guide Coming Soon
                </span>
              </div>
            </div>
          </section>

          {/* Festivals & Celebrations */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8">
              Festivals & Celebrations
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    Independence Day (February 27)
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    The most important national holiday, celebrating Dominican independence from Haiti in 1844.
                  </p>
                  <Link
                    to="/article/celebrating-dominican-independence-day-2024"
                    className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium transition-colors"
                  >
                    Read About Independence Day →
                  </Link>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    Carnival
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    A vibrant celebration featuring colorful costumes, traditional masks, and street performances throughout February.
                  </p>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">
                    Carnival Guide Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Cultural Values */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8">
              Cultural Values
            </h2>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    Family (Familia)
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Family is the cornerstone of Dominican society, with strong bonds across generations.
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    Community (Comunidad)
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    A strong sense of community and mutual support defines Dominican neighborhoods.
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    Celebration (Celebración)
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Life's moments, big and small, are celebrated with music, food, and togetherness.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Explore More Dominican Culture
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Dive deeper into our rich cultural heritage through our articles, recipes, and community stories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/news"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Read Cultural Articles
              </Link>
              <Link
                to="/"
                className="border border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-slate-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Back to Homepage
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default CulturePage;
