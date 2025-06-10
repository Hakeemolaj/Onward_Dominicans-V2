const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production database seeding...');

  try {
    // Create a default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.upsert({
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
    const defaultAuthor = await prisma.author.upsert({
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
    const defaultCategory = await prisma.category.upsert({
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
    const welcomeArticle = await prisma.article.upsert({
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
    const galleryCategory = await prisma.galleryCategory.upsert({
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

    console.log('🎉 Production database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
