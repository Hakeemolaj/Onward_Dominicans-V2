// Mock data service to provide sample data when database is not available
export class MockDataService {
  static getArticles() {
    return [
      {
        id: '1',
        title: 'Welcome to Onward Dominicans',
        slug: 'welcome-to-onward-dominicans',
        summary: 'Discover the rich history and vibrant community of Dominican culture and heritage.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: '1',
          name: 'Maria Rodriguez',
          email: 'maria@onwarddominicans.com',
          bio: 'Cultural historian and community leader',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        },
        category: {
          id: '1',
          name: 'Culture',
          slug: 'culture',
          description: 'Cultural news and events'
        },
        tags: [
          { id: '1', name: 'Heritage', slug: 'heritage' },
          { id: '2', name: 'Community', slug: 'community' }
        ]
      },
      {
        id: '2',
        title: 'Dominican Independence Day Celebration',
        slug: 'dominican-independence-day-celebration',
        summary: 'Join us for a spectacular celebration of Dominican Independence Day with traditional music, food, and cultural performances.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        author: {
          id: '2',
          name: 'Carlos Mendez',
          email: 'carlos@onwarddominicans.com',
          bio: 'Event coordinator and cultural ambassador',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        category: {
          id: '2',
          name: 'Events',
          slug: 'events',
          description: 'Community events and celebrations'
        },
        tags: [
          { id: '3', name: 'Independence', slug: 'independence' },
          { id: '4', name: 'Celebration', slug: 'celebration' }
        ]
      },
      {
        id: '3',
        title: 'Traditional Dominican Cuisine Workshop',
        slug: 'traditional-dominican-cuisine-workshop',
        summary: 'Learn to cook authentic Dominican dishes with our expert chefs in this hands-on workshop.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
        status: 'PUBLISHED',
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        author: {
          id: '3',
          name: 'Ana Jimenez',
          email: 'ana@onwarddominicans.com',
          bio: 'Culinary expert and cookbook author',
          avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        category: {
          id: '3',
          name: 'Food',
          slug: 'food',
          description: 'Traditional cuisine and recipes'
        },
        tags: [
          { id: '5', name: 'Cooking', slug: 'cooking' },
          { id: '6', name: 'Traditional', slug: 'traditional' }
        ]
      }
    ];
  }

  static getGalleryItems() {
    return [
      {
        id: '1',
        title: 'Dominican Flag Ceremony',
        description: 'Annual flag raising ceremony at the community center',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
        photographer: 'Maria Rodriguez',
        dateTaken: new Date().toISOString(),
        location: 'Community Center',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stackGroup: null,
        stackOrder: 0,
        isStackCover: false,
        category: {
          id: '1',
          name: 'Events',
          slug: 'events'
        },
        tags: [
          { id: '1', name: 'Flag', slug: 'flag' },
          { id: '2', name: 'Ceremony', slug: 'ceremony' }
        ]
      },
      {
        id: '2',
        title: 'Traditional Dance Performance',
        description: 'Local dancers performing traditional Dominican folk dances',
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&h=200&fit=crop',
        photographer: 'Carlos Mendez',
        dateTaken: new Date(Date.now() - 86400000).toISOString(),
        location: 'Cultural Center',
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        stackGroup: 'dance-performance',
        stackOrder: 1,
        isStackCover: true,
        category: {
          id: '2',
          name: 'Culture',
          slug: 'culture'
        },
        tags: [
          { id: '3', name: 'Dance', slug: 'dance' },
          { id: '4', name: 'Performance', slug: 'performance' }
        ]
      },
      {
        id: '3',
        title: 'Community Feast',
        description: 'Annual community feast featuring traditional Dominican cuisine',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
        photographer: 'Ana Jimenez',
        dateTaken: new Date(Date.now() - 172800000).toISOString(),
        location: 'Community Park',
        isActive: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        stackGroup: null,
        stackOrder: 0,
        isStackCover: false,
        category: {
          id: '3',
          name: 'Food',
          slug: 'food'
        },
        tags: [
          { id: '5', name: 'Food', slug: 'food' },
          { id: '6', name: 'Community', slug: 'community' }
        ]
      }
    ];
  }

  static getGalleryCategories() {
    return [
      {
        id: '1',
        name: 'Events',
        slug: 'events',
        description: 'Community events and celebrations',
        color: '#3B82F6',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Culture',
        slug: 'culture',
        description: 'Cultural activities and traditions',
        color: '#10B981',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Food',
        slug: 'food',
        description: 'Traditional cuisine and cooking',
        color: '#F59E0B',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  static getCategories() {
    return [
      {
        id: '1',
        name: 'Culture',
        slug: 'culture',
        description: 'Cultural news and events',
        color: '#3B82F6',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Events',
        slug: 'events',
        description: 'Community events and celebrations',
        color: '#10B981',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Food',
        slug: 'food',
        description: 'Traditional cuisine and recipes',
        color: '#F59E0B',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  static getAuthors() {
    return [
      {
        id: '1',
        name: 'Maria Rodriguez',
        email: 'maria@onwarddominicans.com',
        bio: 'Cultural historian and community leader with over 15 years of experience in preserving Dominican heritage.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Carlos Mendez',
        email: 'carlos@onwarddominicans.com',
        bio: 'Event coordinator and cultural ambassador passionate about bringing the community together.',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Ana Jimenez',
        email: 'ana@onwarddominicans.com',
        bio: 'Culinary expert and cookbook author specializing in traditional Dominican cuisine.',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}
