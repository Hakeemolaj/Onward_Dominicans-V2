import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GalleryItem } from '../types';

interface SlideshowModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GalleryItem[];
  startIndex?: number;
  autoPlay?: boolean;
  interval?: number;
}

const SlideshowModal: React.FC<SlideshowModalProps> = ({
  isOpen,
  onClose,
  items,
  startIndex = 0,
  autoPlay = true,
  interval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showControls, setShowControls] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-advance slideshow
  const startSlideshow = useCallback(() => {
    if (items.length <= 1) return;
    
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, interval);
  }, [items.length, interval]);

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

  // Navigation
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : items.length - 1);
    if (isPlaying) stopSlideshow();
  }, [items.length, isPlaying, stopSlideshow]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % items.length);
    if (isPlaying) stopSlideshow();
  }, [items.length, isPlaying, stopSlideshow]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    if (isPlaying) stopSlideshow();
  }, [isPlaying, stopSlideshow]);

  // Fullscreen management
  const enterFullscreen = useCallback(() => {
    containerRef.current?.requestFullscreen();
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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case ' ':
          event.preventDefault();
          toggleSlideshow();
          break;
        case 'f':
        case 'F':
          enterFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToPrevious, goToNext, toggleSlideshow, enterFullscreen]);

  // Cleanup and initialization
  useEffect(() => {
    if (isOpen && autoPlay && items.length > 1) {
      startSlideshow();
    }
    return () => stopSlideshow();
  }, [isOpen, autoPlay, items.length, startSlideshow, stopSlideshow]);

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Top Controls */}
      <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-6 transition-all duration-300 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-white text-xl font-semibold">{currentItem.title}</h2>
            {currentItem.category && (
              <span 
                className="px-3 py-1 text-sm font-medium text-white rounded-full"
                style={{ backgroundColor: currentItem.category.color }}
              >
                {currentItem.category.name}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-white text-sm">
              {currentIndex + 1} / {items.length}
            </span>
            
            <button
              onClick={toggleSlideshow}
              className="p-2 text-white hover:text-gray-300 transition-colors rounded-lg bg-black/30 hover:bg-black/50"
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
              onClick={enterFullscreen}
              className="p-2 text-white hover:text-gray-300 transition-colors rounded-lg bg-black/30 hover:bg-black/50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-gray-300 transition-colors rounded-lg bg-black/30 hover:bg-black/50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-8">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
        
        <img
          src={currentItem.imageUrl}
          alt={currentItem.title}
          className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Navigation Buttons */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute left-6 top-1/2 transform -translate-y-1/2 z-20 p-4 text-white hover:text-gray-300 transition-all duration-300 rounded-full bg-black/30 hover:bg-black/50 ${
              showControls ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
            }`}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className={`absolute right-6 top-1/2 transform -translate-y-1/2 z-20 p-4 text-white hover:text-gray-300 transition-all duration-300 rounded-full bg-black/30 hover:bg-black/50 ${
              showControls ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent p-6 transition-all duration-300 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
      }`}>
        {/* Image Info */}
        <div className="mb-4">
          {currentItem.description && (
            <p className="text-white text-sm mb-2">{currentItem.description}</p>
          )}
          <div className="flex items-center gap-4 text-white text-xs">
            {currentItem.photographer && (
              <span>📸 {currentItem.photographer}</span>
            )}
            {currentItem.location && (
              <span>📍 {currentItem.location}</span>
            )}
            {currentItem.dateTaken && (
              <span>📅 {new Date(currentItem.dateTaken).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {items.length > 1 && (
          <div className="flex justify-center gap-2 overflow-x-auto pb-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden transition-all duration-300 ${
                  index === currentIndex 
                    ? 'ring-2 ring-white scale-110' 
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={item.thumbnailUrl || item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 z-30 h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{
              width: `${((Date.now() % interval) / interval) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SlideshowModal;
