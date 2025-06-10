import bcrypt from 'bcryptjs';
import { db } from '../services/database';

export async function seedDatabase() {
  console.log('🌱 Starting production database seeding...');

  try {
    // Create a default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await db.prisma.user.upsert({
      where: { email: 'admin@onwarddominicans.com' },
      update: {},
      create: {
        email: 'admin@onwarddominicans.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Created admin user:', adminUser.email);

    // Create a default author
    const defaultAuthor = await db.prisma.author.upsert({
      where: { email: 'editor@onwarddominicans.com' },
      update: {},
      create: {
        name: 'Editorial Team',
        email: 'editor@onwarddominicans.com',
        bio: 'The editorial team of Onward Dominicans, dedicated to bringing you the latest news and updates.',
        isActive: true,
      },
    });

    console.log('✅ Created default author:', defaultAuthor.name);

    // Create a default category
    const defaultCategory = await db.prisma.category.upsert({
      where: { slug: 'general' },
      update: {},
      create: {
        name: 'General',
        slug: 'general',
        description: 'General news and updates',
        color: '#3B82F6',
        isActive: true,
      },
    });

    console.log('✅ Created default category:', defaultCategory.name);

    // Create a welcome article
    const welcomeArticle = await db.prisma.article.upsert({
      where: { slug: 'welcome-to-onward-dominicans' },
      update: {},
      create: {
        title: 'Welcome to Onward Dominicans',
        slug: 'welcome-to-onward-dominicans',
        summary: 'Welcome to our news platform! Stay updated with the latest news and stories.',
        content: `
# Welcome to Onward Dominicans

We're excited to launch our new news platform! Here you'll find:

- **Latest News**: Stay updated with current events
- **Community Stories**: Read about local happenings
- **Editorial Content**: Thoughtful analysis and commentary
- **Gallery**: Visual stories and photo collections

## Getting Started

Our platform is designed to keep you informed and engaged with the community. Browse through our articles, explore the gallery, and stay connected with what matters most.

## Admin Panel

Administrators can access the admin panel to manage content, authors, and site settings. The admin panel provides full control over:

- Article management (create, edit, publish, delete)
- Author management
- Category organization
- Gallery management
- Featured article selection

## Contact Us

Have a story to share or feedback to give? We'd love to hear from you!

Thank you for being part of our community.

*The Onward Dominicans Team*
        `,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        authorId: defaultAuthor.id,
        categoryId: defaultCategory.id,
        createdBy: adminUser.id,
      },
    });

    console.log('✅ Created welcome article:', welcomeArticle.title);

    // Create a sample gallery category
    const galleryCategory = await db.prisma.galleryCategory.upsert({
      where: { slug: 'community-events' },
      update: {},
      create: {
        name: 'Community Events',
        slug: 'community-events',
        description: 'Photos from community gatherings and events',
        color: '#10B981',
        isActive: true,
      },
    });

    console.log('✅ Created gallery category:', galleryCategory.name);

    // Create additional sample categories
    const newsCategory = await db.prisma.category.upsert({
      where: { slug: 'news' },
      update: {},
      create: {
        name: 'News',
        slug: 'news',
        description: 'Latest news and current events',
        color: '#EF4444',
        isActive: true,
      },
    });

    const sportsCategory = await db.prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: {
        name: 'Sports',
        slug: 'sports',
        description: 'Sports news and updates',
        color: '#F59E0B',
        isActive: true,
      },
    });

    const communityCategory = await db.prisma.category.upsert({
      where: { slug: 'community' },
      update: {},
      create: {
        name: 'Community',
        slug: 'community',
        description: 'Community events and local stories',
        color: '#8B5CF6',
        isActive: true,
      },
    });

    console.log('✅ Created additional categories:', [newsCategory.name, sportsCategory.name, communityCategory.name]);

    console.log('🎉 Production database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}
