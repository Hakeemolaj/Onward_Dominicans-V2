import bcrypt from 'bcryptjs';
import { db } from '../services/database';

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to database
    await db.connect();

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await db.prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        email: 'admin@onwarddominicans.news',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created');

    // Create categories
    const categories = [
      {
        name: 'Community',
        slug: 'community',
        description: 'Local community news and events',
        color: '#10B981',
      },
      {
        name: 'Education',
        slug: 'education',
        description: 'Educational developments and programs',
        color: '#3B82F6',
      },
      {
        name: 'Youth & STEM',
        slug: 'youth-stem',
        description: 'Youth achievements and STEM innovations',
        color: '#8B5CF6',
      },
      {
        name: 'Local Government',
        slug: 'local-government',
        description: 'City council and government news',
        color: '#EF4444',
      },
      {
        name: 'Arts & Culture',
        slug: 'arts-culture',
        description: 'Cultural events and artistic achievements',
        color: '#F59E0B',
      },
    ];

    const createdCategories = await Promise.all(
      categories.map((category) =>
        db.prisma.category.upsert({
          where: { slug: category.slug },
          update: {},
          create: category
        })
      )
    );

    console.log('✅ Categories created');

    // Create authors
    const authors = [
      {
        name: 'Maria Santos',
        email: 'maria@onwarddominicans.news',
        bio: 'Maria Santos is a seasoned local reporter with a passion for community stories and environmental journalism. She has been with Onward Dominicans for 5 years.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=60',
      },
      {
        name: 'John B. Good',
        email: 'john@onwarddominicans.news',
        bio: 'John B. Good focuses on educational developments and social programs. He believes in empowering the community through knowledge and access to resources.',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=60',
      },
      {
        name: 'Alex Chen',
        email: 'alex@onwarddominicans.news',
        bio: 'Alex Chen covers youth achievements, technology, and STEM innovations. A tech enthusiast, Alex brings a fresh perspective to stories of young innovators.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=60',
      },
    ];

    const createdAuthors = await Promise.all(
      authors.map((author) =>
        db.prisma.author.upsert({
          where: { email: author.email },
          update: {},
          create: author
        })
      )
    );

    console.log('✅ Authors created');

    // Create tags
    const tagNames = [
      'environment', 'community', 'volunteering', 'digital literacy',
      'seniors', 'education', 'library', 'robotics', 'STEM',
      'high school', 'competition', 'local government', 'urban planning',
      'business', 'community development', 'arts', 'culture',
      'festival', 'local talent'
    ];

    const createdTags = await Promise.all(
      tagNames.map((name) =>
        db.prisma.tag.upsert({
          where: { name },
          update: {},
          create: {
            name,
            slug: generateSlug(name),
          },
        })
      )
    );

    console.log('✅ Tags created');

    // Create sample articles
    const sampleArticles = [
      {
        title: 'Community Unites for Annual River Cleanup Drive',
        summary: 'Hundreds of volunteers gathered last Saturday for the annual river cleanup, showcasing strong community spirit and environmental concern.',
        content: `The annual City River Cleanup drive saw an unprecedented turnout last Saturday, with over 300 volunteers from all walks of life dedicating their morning to restore the waterway's natural beauty. Organized by the 'Friends of the River' local non-profit, the event aimed to remove accumulated trash and raise awareness about river pollution.\n\nParticipants, equipped with gloves and biodegradable bags, worked tirelessly along a two-mile stretch of the riverbank. Notable attendees included Mayor Johnson, several city council members, and student groups from local schools. Over 2 tons of garbage, predominantly plastics and non-biodegradable waste, were collected.\n\n"It's heartwarming to see so many people care about our environment," said Jane Doe, lead organizer. "This collective effort not only cleans our river but also strengthens our community bonds." The event also featured educational booths on recycling and sustainable living. Organizers hope this momentum will lead to more consistent conservation efforts throughout the year.`,
        imageUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
        authorId: createdAuthors[0]!.id,
        categoryId: createdCategories[0]!.id,
        status: 'PUBLISHED' as const,
        publishedAt: new Date('2024-10-26'),
        tags: ['environment', 'community', 'volunteering'],
      },
      {
        title: 'Local Library Launches Digital Literacy Program for Seniors',
        summary: 'The City Library has introduced a new program to help senior citizens enhance their digital skills, bridging the technology gap.',
        content: `In an effort to empower senior citizens in the digital age, the City Public Library today launched its "Tech Savvy Seniors" program. This initiative offers free workshops on essential digital skills, including using smartphones, navigating the internet safely, social media basics, and online communication tools.\n\n The program, funded by a grant from the Community Foundation, will run for six months with multiple sessions per week. "Our goal is to ensure our seniors are not left behind in this rapidly evolving digital world," stated Head Librarian, Ms. Emily Carter. "We want to help them connect with loved ones, access information, and utilize online services confidently."\n\nThe first workshop on "Smartphone Basics" was fully booked, indicating a strong interest from the community. Participants expressed enthusiasm and gratitude for the initiative. The library plans to expand the program based on initial feedback and demand, possibly including more advanced topics in the future.`,
        imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
        authorId: createdAuthors[1]!.id,
        categoryId: createdCategories[1]!.id,
        status: 'PUBLISHED' as const,
        publishedAt: new Date('2024-10-24'),
        tags: ['digital literacy', 'seniors', 'education', 'library'],
      },
    ];

    for (const articleData of sampleArticles) {
      const { tags, ...articleWithoutTags } = articleData;
      
      await db.prisma.article.create({
        data: {
          ...articleWithoutTags,
          slug: generateSlug(articleData.title),
          createdBy: adminUser.id,
          tags: {
            connect: tags.map(tagName => ({
              name: tagName,
            })),
          },
        },
      });
    }

    console.log('✅ Sample articles created');

    // Create gallery categories
    const galleryCategories = [
      {
        name: 'Campus Life',
        slug: 'campus-life',
        description: 'Daily life and activities on campus',
        color: '#3B82F6',
      },
      {
        name: 'Academics',
        slug: 'academics',
        description: 'Academic activities and achievements',
        color: '#10B981',
      },
      {
        name: 'Sports',
        slug: 'sports',
        description: 'Athletic events and competitions',
        color: '#F59E0B',
      },
      {
        name: 'Events',
        slug: 'events',
        description: 'Special events and celebrations',
        color: '#8B5CF6',
      },
    ];

    const createdGalleryCategories = await Promise.all(
      galleryCategories.map((category) =>
        db.prisma.galleryCategory.upsert({
          where: { slug: category.slug },
          update: {},
          create: category
        })
      )
    );

    console.log('✅ Gallery categories created');

    // Create gallery items
    const galleryItems = [
      {
        title: 'Campus Life - Student Activities',
        description: 'Students participating in various campus activities and social events',
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: createdGalleryCategories[0]!.id,
        photographer: 'John Doe',
        location: 'Main Campus',
        dateTaken: new Date('2024-01-15'),
        createdBy: adminUser.id,
      },
      {
        title: 'Academic Excellence',
        description: 'Students engaged in collaborative learning in the library',
        imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: createdGalleryCategories[1]!.id,
        photographer: 'Jane Smith',
        location: 'Library',
        dateTaken: new Date('2024-01-10'),
        createdBy: adminUser.id,
      },
      {
        title: 'Basketball Championship Victory',
        description: 'Our basketball team celebrating their championship victory',
        imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: createdGalleryCategories[2]!.id,
        photographer: 'Mike Johnson',
        location: 'Gymnasium',
        dateTaken: new Date('2024-01-20'),
        createdBy: adminUser.id,
      },
      {
        title: 'Graduation Ceremony 2024',
        description: 'Class of 2024 graduation celebration and commencement',
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: createdGalleryCategories[3]!.id,
        photographer: 'Sarah Wilson',
        location: 'Auditorium',
        dateTaken: new Date('2024-01-25'),
        createdBy: adminUser.id,
      },
      {
        title: 'Science Laboratory Research',
        description: 'Students conducting advanced chemistry experiments',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: createdGalleryCategories[1]!.id,
        photographer: 'Dr. Brown',
        location: 'Science Building',
        dateTaken: new Date('2024-01-12'),
        createdBy: adminUser.id,
      },
      {
        title: 'Student Art Exhibition',
        description: 'Annual student artwork display showcasing creative talents',
        imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        categoryId: createdGalleryCategories[3]!.id,
        photographer: 'Art Department',
        location: 'Art Gallery',
        dateTaken: new Date('2024-01-18'),
        createdBy: adminUser.id,
      },
    ];

    const createdGalleryItems = await Promise.all(
      galleryItems.map(async (item) => {
        // Check if gallery item already exists by title
        const existing = await db.prisma.galleryItem.findFirst({
          where: { title: item.title }
        });

        if (existing) {
          return existing;
        }

        return db.prisma.galleryItem.create({
          data: item
        });
      })
    );

    console.log('✅ Gallery items created');
    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Seed Summary:');
    console.log(`- Admin user: admin@onwarddominicans.news (password: admin123)`);
    console.log(`- Categories: ${createdCategories.length}`);
    console.log(`- Authors: ${createdAuthors.length}`);
    console.log(`- Tags: ${createdTags.length}`);
    console.log(`- Articles: ${sampleArticles.length}`);
    console.log(`- Gallery Categories: ${createdGalleryCategories.length}`);
    console.log(`- Gallery Items: ${createdGalleryItems.length}`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await db.disconnect();
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('✅ Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}

export default seed;
