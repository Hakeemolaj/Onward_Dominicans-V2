const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedStackedGallery() {
  console.log('🌱 Seeding stacked gallery data...');

  try {
    // Get existing categories
    const categories = await prisma.galleryCategory.findMany();
    const campusLifeCategory = categories.find(c => c.name === 'Campus Life');
    const academicsCategory = categories.find(c => c.name === 'Academics');
    const sportsCategory = categories.find(c => c.name === 'Sports');

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.error('❌ No admin user found');
      return;
    }

    // Create stacked gallery items
    const stackedItems = [
      // Campus Life Event Stack
      {
        title: 'Campus Life - Welcome Week Opening',
        description: 'Students gathering for the opening ceremony of Welcome Week',
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: campusLifeCategory?.id,
        photographer: 'John Doe',
        location: 'Main Campus Quad',
        stackGroup: 'welcome-week-2024',
        stackOrder: 1,
        isStackCover: true,
        createdBy: adminUser.id
      },
      {
        title: 'Campus Life - Welcome Week Activities',
        description: 'Students participating in various welcome week activities',
        imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: campusLifeCategory?.id,
        photographer: 'John Doe',
        location: 'Main Campus Quad',
        stackGroup: 'welcome-week-2024',
        stackOrder: 2,
        isStackCover: false,
        createdBy: adminUser.id
      },
      {
        title: 'Campus Life - Welcome Week Group Photo',
        description: 'Large group photo of all welcome week participants',
        imageUrl: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: campusLifeCategory?.id,
        photographer: 'John Doe',
        location: 'Main Campus Quad',
        stackGroup: 'welcome-week-2024',
        stackOrder: 3,
        isStackCover: false,
        createdBy: adminUser.id
      },
      {
        title: 'Campus Life - Welcome Week Evening Event',
        description: 'Evening social event during welcome week',
        imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: campusLifeCategory?.id,
        photographer: 'Jane Smith',
        location: 'Student Center',
        stackGroup: 'welcome-week-2024',
        stackOrder: 4,
        isStackCover: false,
        createdBy: adminUser.id
      },

      // Academic Conference Stack
      {
        title: 'Academic Conference - Opening Keynote',
        description: 'Distinguished speaker delivering the opening keynote',
        imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: academicsCategory?.id,
        photographer: 'Dr. Michael Brown',
        location: 'Main Auditorium',
        stackGroup: 'academic-conference-2024',
        stackOrder: 1,
        isStackCover: true,
        createdBy: adminUser.id
      },
      {
        title: 'Academic Conference - Panel Discussion',
        description: 'Expert panel discussing current academic trends',
        imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: academicsCategory?.id,
        photographer: 'Dr. Michael Brown',
        location: 'Conference Room A',
        stackGroup: 'academic-conference-2024',
        stackOrder: 2,
        isStackCover: false,
        createdBy: adminUser.id
      },
      {
        title: 'Academic Conference - Networking Session',
        description: 'Attendees networking during the conference break',
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: academicsCategory?.id,
        photographer: 'Dr. Michael Brown',
        location: 'Conference Lobby',
        stackGroup: 'academic-conference-2024',
        stackOrder: 3,
        isStackCover: false,
        createdBy: adminUser.id
      },

      // Sports Championship Stack
      {
        title: 'Basketball Championship - Game Action',
        description: 'Intense action from the championship basketball game',
        imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: sportsCategory?.id,
        photographer: 'Sports Photographer',
        location: 'Main Gymnasium',
        stackGroup: 'basketball-championship-2024',
        stackOrder: 1,
        isStackCover: true,
        createdBy: adminUser.id
      },
      {
        title: 'Basketball Championship - Victory Celebration',
        description: 'Team celebrating their championship victory',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: sportsCategory?.id,
        photographer: 'Sports Photographer',
        location: 'Main Gymnasium',
        stackGroup: 'basketball-championship-2024',
        stackOrder: 2,
        isStackCover: false,
        createdBy: adminUser.id
      },
      {
        title: 'Basketball Championship - Trophy Presentation',
        description: 'Official trophy presentation ceremony',
        imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: sportsCategory?.id,
        photographer: 'Sports Photographer',
        location: 'Main Gymnasium',
        stackGroup: 'basketball-championship-2024',
        stackOrder: 3,
        isStackCover: false,
        createdBy: adminUser.id
      },

      // Individual items (not stacked)
      {
        title: 'Library Study Session',
        description: 'Students studying in the main library',
        imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: academicsCategory?.id,
        photographer: 'Library Staff',
        location: 'Main Library',
        stackGroup: null,
        stackOrder: 0,
        isStackCover: false,
        createdBy: adminUser.id
      },
      {
        title: 'Campus Architecture',
        description: 'Beautiful view of the main campus building',
        imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: campusLifeCategory?.id,
        photographer: 'Campus Photographer',
        location: 'Main Campus',
        stackGroup: null,
        stackOrder: 0,
        isStackCover: false,
        createdBy: adminUser.id
      }
    ];

    // Create the gallery items
    for (const item of stackedItems) {
      await prisma.galleryItem.create({
        data: item
      });
    }

    // Create default slideshow settings
    await prisma.slideshowSettings.create({
      data: {
        name: 'default',
        autoAdvance: true,
        intervalSeconds: 5,
        showControls: true,
        showIndicators: true,
        enableFullscreen: true,
        transitionEffect: 'fade',
        isActive: true
      }
    });

    console.log('✅ Stacked gallery data seeded successfully!');
    console.log('📊 Created:');
    console.log('  - 3 image stacks (Welcome Week, Academic Conference, Basketball Championship)');
    console.log('  - 2 individual images');
    console.log('  - 1 default slideshow configuration');

  } catch (error) {
    console.error('❌ Error seeding stacked gallery data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedStackedGallery();
