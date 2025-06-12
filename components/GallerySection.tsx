import React, { useState, useEffect, forwardRef } from 'react';
import { SectionProps, GalleryItem, GalleryCategory, GalleryStack } from '../types';
import { apiService } from '../services/apiService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface GallerySectionProps extends SectionProps {
  onImageClick?: (item: GalleryItem, allItems?: GalleryItem[]) => void;
  onStackClick?: (stack: GalleryStack) => void;
  onSlideshowStart?: (items: GalleryItem[]) => void;
}

const GallerySection = forwardRef<HTMLDivElement, GallerySectionProps>((props, ref) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [galleryStacks, setGalleryStacks] = useState<GalleryStack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'stacks'>('stacks');

  // Utility function to create stacks from gallery items
  const createGalleryStacks = (items: GalleryItem[]): GalleryStack[] => {
    const stackGroups = new Map<string, GalleryItem[]>();
    const individualItems: GalleryItem[] = [];

    // Group items by stackGroup
    items.forEach(item => {
      if (item.stackGroup) {
        if (!stackGroups.has(item.stackGroup)) {
          stackGroups.set(item.stackGroup, []);
        }
        stackGroups.get(item.stackGroup)!.push(item);
      } else {
        individualItems.push(item);
      }
    });

    const stacks: GalleryStack[] = [];

    // Create stacks from grouped items
    stackGroups.forEach((groupItems, stackGroup) => {
      // Sort by stackOrder
      groupItems.sort((a, b) => (a.stackOrder || 0) - (b.stackOrder || 0));

      // Find cover image or use first image
      const coverImage = groupItems.find(item => item.isStackCover) || groupItems[0];

      stacks.push({
        id: stackGroup,
        coverImage,
        images: groupItems,
        count: groupItems.length,
        category: coverImage.category
      });
    });

    // Add individual items as single-item stacks
    individualItems.forEach(item => {
      stacks.push({
        id: item.id,
        coverImage: item,
        images: [item],
        count: 1,
        category: item.category
      });
    });

    return stacks;
  };

  // Sample data for development with stacking examples
  const sampleGalleryItems: GalleryItem[] = [
    {
      id: '1',
      title: 'Campus Life - Student Activities',
      description: 'Students participating in various campus activities',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      categoryId: '1',
      category: {
        id: '1',
        name: 'Campus Life',
        slug: 'campus-life',
        color: '#3B82F6',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      photographer: 'John Doe',
      location: 'Main Campus',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      stackGroup: 'campus-life-event-1',
      stackOrder: 1,
      isStackCover: true
    },
    {
      id: '1b',
      title: 'Campus Life - More Activities',
      description: 'Additional photos from the same event',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      categoryId: '1',
      category: {
        id: '1',
        name: 'Campus Life',
        slug: 'campus-life',
        color: '#3B82F6',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      photographer: 'John Doe',
      location: 'Main Campus',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      stackGroup: 'campus-life-event-1',
      stackOrder: 2,
      isStackCover: false
    },
    {
      id: '1c',
      title: 'Campus Life - Group Photo',
      description: 'Group photo from the campus event',
      imageUrl: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      categoryId: '1',
      category: {
        id: '1',
        name: 'Campus Life',
        slug: 'campus-life',
        color: '#3B82F6',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      photographer: 'John Doe',
      location: 'Main Campus',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      stackGroup: 'campus-life-event-1',
      stackOrder: 3,
      isStackCover: false
    },
    {
      id: '2',
      title: 'Academic Excellence',
      description: 'Students in the library studying',
      imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      categoryId: '2',
      category: {
        id: '2',
        name: 'Academics',
        slug: 'academics',
        color: '#10B981',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      photographer: 'Jane Smith',
      location: 'Library',
      isActive: true,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10'
    },
    {
      id: '3',
      title: 'Sports Championship',
      description: 'Basketball team celebrating victory',
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      categoryId: '3',
      category: {
        id: '3',
        name: 'Sports',
        slug: 'sports',
        color: '#F59E0B',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      photographer: 'Mike Johnson',
      location: 'Gymnasium',
      isActive: true,
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20'
    },
    {
      id: '4',
      title: 'Graduation Ceremony',
      description: 'Class of 2024 graduation celebration',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      categoryId: '4',
      category: {
        id: '4',
        name: 'Events',
        slug: 'events',
        color: '#8B5CF6',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      photographer: 'Sarah Wilson',
      location: 'Auditorium',
      isActive: true,
      createdAt: '2024-01-25',
      updatedAt: '2024-01-25'
    },
    {
      id: '5',
      title: 'Science Laboratory',
      description: 'Students conducting chemistry experiments',
      imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      categoryId: '2',
      category: {
        id: '2',
        name: 'Academics',
        slug: 'academics',
        color: '#10B981',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      photographer: 'Dr. Brown',
      location: 'Science Building',
      isActive: true,
      createdAt: '2024-01-12',
      updatedAt: '2024-01-12'
    },
    {
      id: '6',
      title: 'Art Exhibition',
      description: 'Student artwork display in the gallery',
      imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      categoryId: '4',
      category: {
        id: '4',
        name: 'Events',
        slug: 'events',
        color: '#8B5CF6',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      photographer: 'Art Department',
      location: 'Art Gallery',
      isActive: true,
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18'
    }
  ];

  const sampleCategories: GalleryCategory[] = [
    { id: '1', name: 'Campus Life', slug: 'campus-life', color: '#3B82F6', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: '2', name: 'Academics', slug: 'academics', color: '#10B981', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: '3', name: 'Sports', slug: 'sports', color: '#F59E0B', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: '4', name: 'Events', slug: 'events', color: '#8B5CF6', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
  ];

  useEffect(() => {
    const loadGalleryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load from API first, fallback to sample data
        try {
          const [itemsData, categoriesData] = await Promise.all([
            apiService.getGalleryItems(),
            apiService.getGalleryCategories()
          ]);

          if (itemsData.success && categoriesData.success) {

            if (itemsData.success && categoriesData.success) {
              // Transform API data to match our interface
              const transformedItems: GalleryItem[] = itemsData.data.map((item: any) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                imageUrl: item.imageUrl,
                thumbnailUrl: item.thumbnailUrl,
                category: item.category ? {
                  id: item.category.id,
                  name: item.category.name,
                  slug: item.category.slug,
                  color: item.category.color,
                  isActive: true,
                  createdAt: item.category.createdAt || item.createdAt,
                  updatedAt: item.category.updatedAt || item.updatedAt
                } : undefined,
                categoryId: item.categoryId,
                photographer: item.photographer,
                location: item.location,
                dateTaken: item.dateTaken,
                isActive: item.isActive,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                // Stack-related properties
                stackGroup: item.stackGroup,
                stackOrder: item.stackOrder || 0,
                isStackCover: item.isStackCover || false
              }));

              const transformedCategories: GalleryCategory[] = categoriesData.data.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                color: cat.color,
                isActive: cat.isActive,
                createdAt: cat.createdAt,
                updatedAt: cat.updatedAt
              }));

              setGalleryItems(transformedItems);
              setCategories(transformedCategories);
              setGalleryStacks(createGalleryStacks(transformedItems));
              console.log('✅ Loaded gallery data from API');
              return;
            }
          }
        } catch (apiError) {
          console.log('⚠️ API not available, using sample data');
        }

        // Fallback to sample data
        await new Promise(resolve => setTimeout(resolve, 500));
        setGalleryItems(sampleGalleryItems);
        setCategories(sampleCategories);
        setGalleryStacks(createGalleryStacks(sampleGalleryItems));
        console.log('📝 Using sample gallery data');

      } catch (err) {
        setError('Failed to load gallery data');
        console.error('Gallery loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGalleryData();
  }, []);

  const filteredItems = galleryItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch = searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.photographer?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const filteredStacks = galleryStacks.filter(stack => {
    const matchesCategory = activeCategory === 'all' || stack.coverImage.categoryId === activeCategory;
    const matchesSearch = searchTerm === '' ||
      stack.images.some(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.photographer?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesCategory && matchesSearch;
  });

  const handleImageClick = (item: GalleryItem, allItems?: GalleryItem[]) => {
    if (props.onImageClick) {
      props.onImageClick(item, allItems || filteredItems);
    }
  };

  const handleStackClick = (stack: GalleryStack) => {
    if (props.onStackClick) {
      props.onStackClick(stack);
    } else {
      // Default behavior: open lightbox with first image and all stack images
      handleImageClick(stack.coverImage, stack.images);
    }
  };

  const handleSlideshowStart = () => {
    if (props.onSlideshowStart) {
      props.onSlideshowStart(filteredItems);
    }
  };

  if (loading) {
    return (
      <section
        ref={ref}
        id={props.id}
        className={`py-16 md:py-24 bg-slate-50 dark:bg-slate-800 ${props.className || ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        ref={ref}
        id={props.id}
        className={`py-16 md:py-24 bg-slate-50 dark:bg-slate-800 ${props.className || ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorMessage message={error} />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      id={props.id}
      className={`py-16 md:py-24 bg-slate-50 dark:bg-slate-800 ${props.className || ''}`}
      aria-labelledby="gallery-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 id="gallery-heading" className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-4">
            Photo Gallery
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Explore moments and memories from our vibrant campus community
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          {/* Top Row: Search and Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('stacks')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'stacks'
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                  </svg>
                  Stacks
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Grid
                </button>
              </div>

              {/* Slideshow Button */}
              <button
                onClick={handleSlideshowStart}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                disabled={filteredItems.length === 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V4a2 2 0 00-2-2H5a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2V4z" />
                </svg>
                <span className="hidden sm:inline">Slideshow</span>
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
            >
              All Photos
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
                style={{
                  backgroundColor: activeCategory === category.id ? category.color : undefined
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {(viewMode === 'stacks' ? filteredStacks : filteredItems).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {viewMode === 'stacks' ? (
              // Stack View
              filteredStacks.map(stack => (
                <div
                  key={stack.id}
                  className="group relative bg-white dark:bg-slate-700 rounded-lg shadow-lg dark:shadow-slate-900/50 overflow-hidden transform transition-all duration-300 hover:shadow-xl dark:hover:shadow-slate-900/70 hover:scale-[1.02] cursor-pointer"
                  onClick={() => handleStackClick(stack)}
                >
                  <div className="aspect-w-4 aspect-h-3 relative">
                    {/* Stack Effect - Multiple Images */}
                    {stack.count > 1 && (
                      <>
                        <div className="absolute inset-0 bg-white dark:bg-slate-600 rounded-lg transform rotate-2 translate-x-1 translate-y-1 z-0"></div>
                        <div className="absolute inset-0 bg-white dark:bg-slate-650 rounded-lg transform rotate-1 translate-x-0.5 translate-y-0.5 z-10"></div>
                      </>
                    )}

                    {/* Main Image */}
                    <img
                      src={stack.coverImage.thumbnailUrl || stack.coverImage.imageUrl}
                      alt={stack.coverImage.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 relative z-20 rounded-lg"
                      loading="lazy"
                    />

                    {/* Stack Count Badge */}
                    {stack.count > 1 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full z-30">
                        {stack.count} photos
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center z-30">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {stack.count > 1 && (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 relative z-20">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1 line-clamp-2">
                      {stack.coverImage.title}
                      {stack.count > 1 && <span className="text-slate-500 dark:text-slate-400 font-normal"> & {stack.count - 1} more</span>}
                    </h3>
                    {stack.coverImage.category && (
                      <span
                        className="inline-block px-2 py-1 text-xs font-medium text-white rounded-full mb-2"
                        style={{ backgroundColor: stack.coverImage.category.color }}
                      >
                        {stack.coverImage.category.name}
                      </span>
                    )}
                    {stack.coverImage.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                        {stack.coverImage.description}
                      </p>
                    )}
                    <div className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
                      {stack.coverImage.photographer && (
                        <p>📸 {stack.coverImage.photographer}</p>
                      )}
                      {stack.coverImage.location && (
                        <p>📍 {stack.coverImage.location}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Grid View
              filteredItems.map(item => (
                <div
                  key={item.id}
                  className="group relative bg-white dark:bg-slate-700 rounded-lg shadow-lg dark:shadow-slate-900/50 overflow-hidden transform transition-all duration-300 hover:shadow-xl dark:hover:shadow-slate-900/70 hover:scale-[1.02] cursor-pointer"
                  onClick={() => handleImageClick(item)}
                >
                  <div className="aspect-w-4 aspect-h-3 relative">
                    <img
                      src={item.thumbnailUrl || item.imageUrl}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    {item.category && (
                      <span
                        className="inline-block px-2 py-1 text-xs font-medium text-white rounded-full mb-2"
                        style={{ backgroundColor: item.category.color }}
                      >
                        {item.category.name}
                      </span>
                    )}
                    {item.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}
                    <div className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
                      {item.photographer && (
                        <p>📸 {item.photographer}</p>
                      )}
                      {item.location && (
                        <p>📍 {item.location}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No photos found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {searchTerm || activeCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Photos will appear here once they are added.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
});

GallerySection.displayName = 'GallerySection';

export default GallerySection;