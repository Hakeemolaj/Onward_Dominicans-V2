import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import SEOAnalytics from '../../components/SEOAnalytics';
import TopHeader from '../../components/TopHeader';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import BackToTopButton from '../../components/BackToTopButton';
import { NAV_LINKS } from '../../constants';

const GalleryPage: React.FC = () => {
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

  // Sample gallery data - in production, this would come from your API
  const galleryItems = [
    {
      id: 1,
      title: 'Dominican Independence Day Celebration',
      description: 'Community members celebrating Dominican Independence Day with traditional performances',
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
      category: 'Events'
    },
    {
      id: 2,
      title: 'Traditional Dominican Mangu',
      description: 'Traditional Dominican mangu breakfast dish preparation',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
      category: 'Food'
    },
    {
      id: 3,
      title: 'Youth Leadership Program Graduation',
      description: 'First graduating class of the Dominican Youth Leadership Program',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
      category: 'Education'
    },
    {
      id: 4,
      title: 'Merengue Musical Heritage',
      description: 'Traditional merengue music and dance performance',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      category: 'Music'
    },
    {
      id: 5,
      title: 'Dominican Cultural Festival',
      description: 'Annual Dominican cultural festival showcasing traditions',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
      category: 'Culture'
    },
    {
      id: 6,
      title: 'Community Gathering',
      description: 'Dominican families coming together for community celebration',
      imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
      category: 'Community'
    }
  ];

  const categories = ['All', 'Events', 'Food', 'Education', 'Music', 'Culture', 'Community'];
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredItems = selectedCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <SEOHead
        title="Dominican Community Gallery - Photos & Memories"
        description="Explore our photo gallery showcasing Dominican community events, cultural celebrations, traditional food, and memorable moments from our vibrant community."
        url="https://onward-dominicans.vercel.app/gallery"
        keywords={['Dominican gallery', 'Dominican photos', 'community events', 'cultural celebrations', 'Dominican traditions', 'community photos']}
      />
      
      <SEOAnalytics
        pageTitle="Dominican Community Gallery - Photos & Memories"
        contentType="gallery"
      />

      <TopHeader theme={theme} toggleTheme={toggleTheme} />
      <NavBar
        navLinks={NAV_LINKS}
        onNavLinkClick={() => {}}
        activeSection="gallery"
        searchTerm=""
        onSearchChange={() => {}}
      />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Community Gallery
            </h1>
            <p className="text-xl opacity-90 max-w-2xl">
              Capturing the vibrant moments, celebrations, and everyday life of our Dominican community through photos and memories.
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
              <span className="text-slate-800 dark:text-slate-200">Gallery</span>
            </nav>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Category Filter */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Browse by Category
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-yellow-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-w-16 aspect-h-12">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <div className="mb-2">
                    <span className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-sm font-medium">
                      {item.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No photos found in the "{selectedCategory}" category.
              </p>
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium transition-colors"
              >
                View All Photos
              </button>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 text-center bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Share Your Photos
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Have photos from Dominican community events or cultural celebrations? We'd love to feature them in our gallery!
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
          </div>
        </div>
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default GalleryPage;
