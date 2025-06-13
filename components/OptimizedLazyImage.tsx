import React, { useState, useRef, useEffect } from 'react';
import { ImageOptimizer } from '../utils/performance';

interface OptimizedLazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
}

const OptimizedLazyImage: React.FC<OptimizedLazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 80,
  onLoad,
  onError,
  onClick,
  loading = 'lazy'
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (loading === 'eager') {
      setImageSrc(src);
      return;
    }

    // Set up intersection observer for lazy loading
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          if (observerRef.current && imgRef.current) {
            observerRef.current.unobserve(imgRef.current);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    onError?.();
  };

  // Generate responsive image URLs
  const srcSet = ImageOptimizer.generateSrcSet(src);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500 text-sm">Failed to load image</div>
        </div>
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={imageSrc}
        srcSet={imageSrc !== placeholder ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${onClick ? 'cursor-pointer' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        loading={loading}
      />

      {/* Click overlay for better UX */}
      {onClick && (
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="bg-white bg-opacity-90 rounded-full p-2">
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedLazyImage;
