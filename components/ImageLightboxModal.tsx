import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GalleryItem } from '../types';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryItem: GalleryItem | null;
  allItems?: GalleryItem[];
  onNavigate?: (direction: 'prev' | 'next') => void;
  enableSlideshow?: boolean;
  slideshowInterval?: number;
  autoStartSlideshow?: boolean;
}

const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  galleryItem,
  allItems = [],
  onNavigate,
  enableSlideshow = true,
  slideshowInterval = 5000,
  autoStartSlideshow = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoStartSlideshow);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (galleryItem && allItems.length > 0) {
      const index = allItems.findIndex(item => item.id === galleryItem.id);
      setCurrentIndex(index >= 0 ? index : 0);
    }
  }, [galleryItem, allItems]);

  // Slideshow timer management
  const startSlideshow = useCallback(() => {
    if (!enableSlideshow || allItems.length <= 1) return;

    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % allItems.length);
    }, slideshowInterval);
  }, [enableSlideshow, allItems.length, slideshowInterval]);

  const stopSlideshow = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const toggleSlideshow = useCallback(() => {
    if (isPlaying) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  }, [isPlaying, startSlideshow, stopSlideshow]);

  // Fullscreen management
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetControlsTimer = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    if (isOpen) {
      resetControlsTimer();
      const handleMouseMove = () => resetControlsTimer();
      document.addEventListener('mousemove', handleMouseMove);

      return () => {
        clearTimeout(timeout);
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [isOpen, isPlaying]);

  useEffect(() => {
    setImageLoaded(false);
  }, [galleryItem, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
          event.preventDefault();
          toggleSlideshow();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, allItems.length, toggleSlideshow, toggleFullscreen]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopSlideshow();
    }
    return () => stopSlideshow();
  }, [isOpen, stopSlideshow]);

  // Auto-start slideshow if enabled
  useEffect(() => {
    if (isOpen && autoStartSlideshow && allItems.length > 1) {
      startSlideshow();
    }
  }, [isOpen, autoStartSlideshow, allItems.length, startSlideshow]);

  const handlePrevious = useCallback(() => {
    if (allItems.length > 1) {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : allItems.length - 1;
      setCurrentIndex(newIndex);
      if (onNavigate) {
        onNavigate('prev');
      }
      // Pause slideshow when manually navigating
      if (isPlaying) {
        stopSlideshow();
      }
    }
  }, [allItems.length, currentIndex, onNavigate, isPlaying, stopSlideshow]);

  const handleNext = useCallback(() => {
    if (allItems.length > 1) {
      const newIndex = currentIndex < allItems.length - 1 ? currentIndex + 1 : 0;
      setCurrentIndex(newIndex);
      if (onNavigate) {
        onNavigate('next');
      }
      // Pause slideshow when manually navigating
      if (isPlaying) {
        stopSlideshow();
      }
    }
  }, [allItems.length, currentIndex, onNavigate, isPlaying, stopSlideshow]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !galleryItem) {
    return null;
  }

  const currentItem = allItems.length > 0 ? allItems[currentIndex] : galleryItem;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-300 ${
        isFullscreen ? 'bg-opacity-100' : 'bg-opacity-90 backdrop-blur-sm'
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
    >
      {/* Top Controls Bar */}
      <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-4 transition-all duration-300 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}>
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            {enableSlideshow && allItems.length > 1 && (
              <>
                <button
                  onClick={toggleSlideshow}
                  className="p-2 text-white hover:text-gray-300 transition-colors rounded-lg bg-black/30 hover:bg-black/50"
                  aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V4a2 2 0 00-2-2H5a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2V4z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-white hover:text-gray-300 transition-colors rounded-lg bg-black/30 hover:bg-black/50"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15H4.5M9 15v4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Center - Image Counter */}
          {allItems.length > 1 && (
            <div className="text-white text-sm bg-black/30 px-3 py-1 rounded-full">
              {currentIndex + 1} of {allItems.length}
            </div>
          )}

          {/* Right Controls */}
          <button
            onClick={onClose}
            className="p-2 text-white hover:text-gray-300 transition-colors rounded-lg bg-black/30 hover:bg-black/50"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      {allItems.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 text-white hover:text-gray-300 transition-all duration-300 rounded-full bg-black/30 hover:bg-black/50 ${
              showControls ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
            }`}
            aria-label="Previous image"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 text-white hover:text-gray-300 transition-all duration-300 rounded-full bg-black/30 hover:bg-black/50 ${
              showControls ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
            aria-label="Next image"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Progress Indicators */}
      {allItems.length > 1 && (
        <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }`}>
          {allItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slideshow Progress Bar */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{
              width: `${((Date.now() % slideshowInterval) / slideshowInterval) * 100}%`
            }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl max-h-full mx-4 flex flex-col lg:flex-row items-center gap-6">
        {/* Image Container */}
        <div className="relative flex-1 max-w-4xl">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          <img
            src={currentItem.imageUrl}
            alt={currentItem.title}
            className={`max-w-full max-h-[80vh] object-contain transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Image Info Panel */}
        <div className="lg:w-80 bg-white dark:bg-slate-800 rounded-lg p-6 max-h-[80vh] overflow-y-auto">
          <h2 id="lightbox-title" className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            {currentItem.title}
          </h2>

          {currentItem.category && (
            <div className="mb-4">
              <span
                className="inline-block px-3 py-1 text-sm font-medium text-white rounded-full"
                style={{ backgroundColor: currentItem.category.color }}
              >
                {currentItem.category.name}
              </span>
            </div>
          )}

          {currentItem.description && (
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              {currentItem.description}
            </p>
          )}

          <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            {currentItem.photographer && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Photographer: {currentItem.photographer}</span>
              </div>
            )}

            {currentItem.location && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Location: {currentItem.location}</span>
              </div>
            )}

            {currentItem.dateTaken && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Date: {new Date(currentItem.dateTaken).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {currentItem.tags && currentItem.tags.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {currentItem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {allItems.length > 1 && (
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                {currentIndex + 1} of {allItems.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageLightboxModal;