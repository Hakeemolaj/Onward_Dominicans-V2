
import React, { useRef, useEffect, useState, useCallback } from 'react';
import TopHeader from './components/TopHeader';
import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import NewsSection from './components/NewsSection';
import MeetTheTeamSection from './components/MeetTheTeamSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import NewsArticleModal from './components/NewsArticleModal';
import LoadingSpinner from './components/LoadingSpinner';

import { NewsArticle as NewsArticleType } from './types';
import { SectionId, NAV_LINKS, SAMPLE_NEWS_ARTICLES, APP_NAME_PART1, APP_NAME_PART2 } from './constants';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const sectionRefs = {
    [SectionId.HOME]: useRef<HTMLDivElement>(null),
    [SectionId.NEWS_FEED]: useRef<HTMLDivElement>(null),
    [SectionId.ABOUT_PUBLICATION]: useRef<HTMLDivElement>(null),
    [SectionId.MEET_THE_TEAM]: useRef<HTMLDivElement>(null),
    [SectionId.CONTACT_US]: useRef<HTMLDivElement>(null),
  };

  const [activeSection, setActiveSection] = useState<SectionId>(SectionId.HOME);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<NewsArticleType | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingApp(false);
    }, 1000); 
    return () => clearTimeout(timer);
  }, []);
  
  const openNewsArticleModal = useCallback((article: NewsArticleType) => {
    setSelectedNewsArticle(article);
    setIsNewsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }, []);

  const closeNewsArticleModal = useCallback(() => {
    setIsNewsModalOpen(false);
    document.body.style.overflow = ''; // Restore background scroll
  }, []);

  const scrollToSection = (sectionId: SectionId) => {
    if (sectionId === SectionId.HOME) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      sectionRefs[sectionId]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
  };


  useEffect(() => {
    if (isLoadingApp) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40% 0px', 
      threshold: 0.01, 
    };

    let ticking = false;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
       if (!ticking) {
        window.requestAnimationFrame(() => {
          let bestCandidate: IntersectionObserverEntry | null = null;
          
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              if (!entry.target.classList.contains('is-visible')) {
                entry.target.classList.add('is-visible');
              }
              // Prioritize entries that are more fully in view or closer to the top
              const entryTop = entry.boundingClientRect.top;
              if (!bestCandidate || (entryTop >= 0 && entryTop < (bestCandidate.boundingClientRect.top < 0 ? Infinity : bestCandidate.boundingClientRect.top))) {
                 bestCandidate = entry;
              }
            }
          });

          if (bestCandidate) {
             setActiveSection(bestCandidate.target.id as SectionId);
          } else if (window.scrollY < window.innerHeight * 0.3) { 
            setActiveSection(SectionId.HOME);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    const currentRefs = Object.values(sectionRefs).map(ref => ref.current).filter(Boolean);
    currentRefs.forEach(ref => observer.observe(ref!));

    // Initial check
    if (window.scrollY < window.innerHeight * 0.3) {
        setActiveSection(SectionId.HOME);
    } else { // Check other sections if not at the very top
        const visibleSections = currentRefs.filter(ref => {
            const rect = ref!.getBoundingClientRect();
            return rect.top < window.innerHeight * 0.6 && rect.bottom >= window.innerHeight * 0.4;
        });
        if (visibleSections.length > 0) {
             // Simple heuristic: pick the first one that's significantly visible
            setActiveSection(visibleSections[0]!.id as SectionId);
        }
    }
    
    return () => {
      currentRefs.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [isLoadingApp, sectionRefs]); // sectionRefs is stable but included for correctness

  if (isLoadingApp) {
    return (
      <div className="fixed inset-0 flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-900 z-[100]">
        <div className="text-3xl font-extrabold text-yellow-500 dark:text-yellow-400 tracking-tight">
          {APP_NAME_PART1}
        </div>
        <div className="text-3xl font-extrabold text-slate-700 dark:text-slate-200 tracking-tight ml-1">
          {APP_NAME_PART2}
        </div>
        <div className="mt-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const featuredArticle = SAMPLE_NEWS_ARTICLES[0];

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

      {selectedNewsArticle && (
        <NewsArticleModal
          isOpen={isNewsModalOpen}
          onClose={closeNewsArticleModal}
          article={selectedNewsArticle}
          onSelectArticleToOpen={openNewsArticleModal} // Pass the function here
        />
      )}
    </div>
  );
};

export default App;
