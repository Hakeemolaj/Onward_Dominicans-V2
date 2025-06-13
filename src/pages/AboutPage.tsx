import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import SEOAnalytics from '../../components/SEOAnalytics';
import TopHeader from '../../components/TopHeader';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import BackToTopButton from '../../components/BackToTopButton';
import { NAV_LINKS } from '../../constants';

const AboutPage: React.FC = () => {
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
        title="About Onward Dominicans - Our Mission & Story"
        description="Learn about Onward Dominicans, our mission to connect the Dominican community worldwide through news, culture, and shared stories. Discover our team and values."
        url="https://onward-dominicans.vercel.app/about"
        keywords={['About Onward Dominicans', 'Dominican community platform', 'Dominican news mission', 'Dominican cultural preservation', 'community connection']}
      />
      
      <SEOAnalytics
        pageTitle="About Onward Dominicans - Our Mission & Story"
        contentType="about"
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
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About Onward Dominicans
            </h1>
            <p className="text-xl opacity-90 max-w-2xl">
              Connecting the Dominican community worldwide through stories, culture, and shared experiences.
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
              <span className="text-slate-800 dark:text-slate-200">About</span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Mission Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6">
              Our Mission
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8">
              <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                Onward Dominicans is dedicated to strengthening and celebrating the Dominican community worldwide. We serve as a digital bridge connecting Dominicans across the globe, sharing our rich culture, traditions, and contemporary stories that define who we are as a people.
              </p>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                Through authentic storytelling, cultural preservation, and community engagement, we aim to ensure that Dominican heritage continues to thrive for future generations while fostering unity among our diaspora.
              </p>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  Cultural Preservation
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We are committed to preserving and sharing Dominican traditions, from our music and dance to our culinary heritage and historical narratives.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  Community Unity
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We believe in the power of community and work to create connections that transcend geographical boundaries and generational differences.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  Authentic Storytelling
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We prioritize genuine, respectful representation of Dominican experiences, ensuring our content reflects the true diversity of our community.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  Educational Impact
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We strive to educate both Dominicans and the broader community about our history, culture, and contributions to society.
                </p>
              </div>
            </div>
          </section>

          {/* What We Do Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6">
              What We Do
            </h2>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    Community News & Stories
                  </h3>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                    <li>• Local community event coverage</li>
                    <li>• Cultural celebration highlights</li>
                    <li>• Success stories from our community</li>
                    <li>• Educational program features</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                    Cultural Content
                  </h3>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                    <li>• Traditional recipe sharing</li>
                    <li>• Music and dance heritage</li>
                    <li>• Historical documentaries</li>
                    <li>• Language preservation efforts</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6">
              Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
                <div className="w-20 h-20 bg-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">MR</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Maria Rodriguez
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                  Cultural Affairs Correspondent
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Specializes in cultural events and community celebrations
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
                <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">CJ</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Carmen Jimenez
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                  Culinary Heritage Specialist
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Preserves and shares traditional Dominican recipes
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">LM</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Luis Morales
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                  Music Historian
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Documents and preserves Dominican musical heritage
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6">
              Get Involved
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              We're always looking for community members who want to share their stories, preserve our culture, and strengthen our connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/#contact-us"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/news"
                className="border border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-slate-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Read Our Stories
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

export default AboutPage;
