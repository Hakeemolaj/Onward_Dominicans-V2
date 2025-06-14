'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import TopHeader from '../../components/TopHeader';
import NavBar from '../../components/NavBar';
import HeroSection from '../../components/HeroSection';
import AboutSection from '../../components/AboutSection';
import NewsSection from '../../components/NewsSection';
import GallerySection from '../../components/GallerySection';
import MeetTheTeamSection from '../../components/MeetTheTeamSection';
import ContactSection from '../../components/ContactSection';
import Footer from '../../components/Footer';
import BackToTopButton from '../../components/BackToTopButton';
import NewsArticleModal from '../../components/NewsArticleModal';
import ImageLightboxModal from '../../components/ImageLightboxModal';
import SlideshowModal from '../../components/SlideshowModal';
import LoadingSpinner from '../../components/LoadingSpinner';

// Import types and constants
import { SectionId, NAV_LINKS } from '../../constants';
import type { Article, GalleryItem } from '../../types';

interface HomePageClientProps {
  featuredArticle: Article;
}

export default function HomePageClient({ featuredArticle }: HomePageClientProps) {
  // State management
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeSection, setActiveSection] = useState<SectionId>(SectionId.HOME);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refs for sections
  const sectionRefs = {
    [SectionId.HOME]: useRef<HTMLElement>(null),
    [SectionId.NEWS_FEED]: useRef<HTMLElement>(null),
    [SectionId.GALLERY]: useRef<HTMLElement>(null),
    [SectionId.ABOUT_PUBLICATION]: useRef<HTMLElement>(null),
    [SectionId.MEET_THE_TEAM]: useRef<HTMLElement>(null),
    [SectionId.CONTACT_US]: useRef<HTMLElement>(null),
  };

  // Theme management
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('theme', newTheme);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  }, [theme]);

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

  // Section scrolling
  const scrollToSection = useCallback((sectionId: SectionId) => {
    const element = sectionRefs[sectionId]?.current;
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // Active section detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const [sectionId, ref] of Object.entries(sectionRefs)) {
        const element = ref.current;
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId as SectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Event handlers
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  const openNewsArticleModal = useCallback((article: Article) => {
    setSelectedArticle(article);
  }, []);

  const closeNewsArticleModal = useCallback(() => {
    setSelectedArticle(null);
  }, []);

  const openGalleryModal = useCallback((item: GalleryItem) => {
    setSelectedGalleryItem(item);
  }, []);

  const closeGalleryModal = useCallback(() => {
    setSelectedGalleryItem(null);
  }, []);

  const handleStackClick = useCallback((items: GalleryItem[]) => {
    setGalleryItems(items);
  }, []);

  const handleSlideshowStart = useCallback((items: GalleryItem[]) => {
    setGalleryItems(items);
    if (items.length > 0) {
      setSelectedGalleryItem(items[0]);
    }
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <TopHeader theme={theme} toggleTheme={toggleTheme} />
      <NavBar
        navLinks={NAV_LINKS}
        onNavLinkClick={scrollToSection}
        activeSection={activeSection}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />
      
      <main className="flex-grow">
        <HeroSection 
          ref={sectionRefs[SectionId.HOME]} 
          id={SectionId.HOME} 
          article={featuredArticle} 
          onReadMoreClick={openNewsArticleModal}
        />
        <NewsSection
          ref={sectionRefs[SectionId.NEWS_FEED]}
          id={SectionId.NEWS_FEED}
          className="fade-in-section"
          onReadMoreClick={openNewsArticleModal}
          searchTerm={searchTerm}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
        />
        <GallerySection
          ref={sectionRefs[SectionId.GALLERY]}
          id={SectionId.GALLERY}
          className="fade-in-section"
          onImageClick={openGalleryModal}
          onStackClick={handleStackClick}
          onSlideshowStart={handleSlideshowStart}
        />
        <AboutSection
          ref={sectionRefs[SectionId.ABOUT_PUBLICATION]}
          id={SectionId.ABOUT_PUBLICATION}
          className="fade-in-section"
        />
        <MeetTheTeamSection
          ref={sectionRefs[SectionId.MEET_THE_TEAM]}
          id={SectionId.MEET_THE_TEAM}
          className="fade-in-section"
        />
        <ContactSection
          ref={sectionRefs[SectionId.CONTACT_US]}
          id={SectionId.CONTACT_US}
          className="fade-in-section"
        />
      </main>

      <Footer />
      <BackToTopButton />

      {/* Modals */}
      {selectedArticle && (
        <NewsArticleModal
          article={selectedArticle}
          onClose={closeNewsArticleModal}
        />
      )}

      {selectedGalleryItem && (
        <ImageLightboxModal
          item={selectedGalleryItem}
          items={galleryItems}
          onClose={closeGalleryModal}
          onNavigate={setSelectedGalleryItem}
        />
      )}
    </div>
  );
}
