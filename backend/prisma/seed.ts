import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.article.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();
  await prisma.galleryCategory.deleteMany();
  await prisma.user.deleteMany();

  // Create a system user for createdBy fields
  console.log('👤 Creating system user...');
  const systemUser = await prisma.user.create({
    data: {
      email: 'system@onwarddominicans.com',
      username: 'system',
      password: 'system_password_hash', // In production, this should be properly hashed
      firstName: 'System',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Create Authors
  console.log('👥 Creating authors...');
  const authors = await Promise.all([
    prisma.author.create({
      data: {
        name: 'Maria Rodriguez',
        email: 'maria@onwarddominicans.com',
        bio: 'Cultural historian and community leader with over 15 years of experience in preserving Dominican heritage and traditions.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        isActive: true,
      },
    }),
    prisma.author.create({
      data: {
        name: 'Carlos Mendez',
        email: 'carlos@onwarddominicans.com',
        bio: 'Event coordinator and cultural ambassador passionate about bringing the Dominican community together through meaningful celebrations.',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isActive: true,
      },
    }),
    prisma.author.create({
      data: {
        name: 'Ana Jimenez',
        email: 'ana@onwarddominicans.com',
        bio: 'Culinary expert and cookbook author specializing in traditional Dominican cuisine and family recipes passed down through generations.',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        isActive: true,
      },
    }),
    prisma.author.create({
      data: {
        name: 'Roberto Santos',
        email: 'roberto@onwarddominicans.com',
        bio: 'Youth program director and educator focused on empowering the next generation of Dominican leaders.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        isActive: true,
      },
    }),
  ]);

  // Create Categories
  console.log('📂 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Culture & Heritage',
        slug: 'culture-heritage',
        description: 'Stories about Dominican culture, traditions, and historical heritage',
        color: '#3B82F6',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Community Events',
        slug: 'community-events',
        description: 'Updates on local events, celebrations, and community gatherings',
        color: '#10B981',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Food & Cuisine',
        slug: 'food-cuisine',
        description: 'Traditional recipes, cooking tips, and culinary traditions',
        color: '#F59E0B',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Youth & Education',
        slug: 'youth-education',
        description: 'Educational programs, youth initiatives, and academic achievements',
        color: '#8B5CF6',
        isActive: true,
      },
    }),
  ]);

  // Create Gallery Categories
  console.log('🖼️ Creating gallery categories...');
  const galleryCategories = await Promise.all([
    prisma.galleryCategory.create({
      data: {
        name: 'Cultural Events',
        slug: 'cultural-events',
        description: 'Photos from cultural celebrations and traditional events',
        color: '#3B82F6',
        isActive: true,
      },
    }),
    prisma.galleryCategory.create({
      data: {
        name: 'Community Life',
        slug: 'community-life',
        description: 'Daily life and community activities',
        color: '#10B981',
        isActive: true,
      },
    }),
    prisma.galleryCategory.create({
      data: {
        name: 'Food & Cooking',
        slug: 'food-cooking',
        description: 'Traditional cooking and food preparation',
        color: '#F59E0B',
        isActive: true,
      },
    }),
  ]);

  // Create Tags
  console.log('🏷️ Creating tags...');
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Heritage', slug: 'heritage' } }),
    prisma.tag.create({ data: { name: 'Community', slug: 'community' } }),
    prisma.tag.create({ data: { name: 'Independence', slug: 'independence' } }),
    prisma.tag.create({ data: { name: 'Celebration', slug: 'celebration' } }),
    prisma.tag.create({ data: { name: 'Cooking', slug: 'cooking' } }),
    prisma.tag.create({ data: { name: 'Traditional', slug: 'traditional' } }),
    prisma.tag.create({ data: { name: 'Youth', slug: 'youth' } }),
    prisma.tag.create({ data: { name: 'Education', slug: 'education' } }),
    prisma.tag.create({ data: { name: 'Music', slug: 'music' } }),
    prisma.tag.create({ data: { name: 'Dance', slug: 'dance' } }),
  ]);

  // Create Articles
  console.log('📰 Creating articles...');
  const articles = await Promise.all([
    prisma.article.create({
      data: {
        title: 'Celebrating Dominican Independence Day: A Community United',
        slug: 'celebrating-dominican-independence-day-2024',
        summary: 'Our community came together for a spectacular celebration of Dominican Independence Day, featuring traditional music, authentic cuisine, and cultural performances that honored our rich heritage.',
        content: `# Celebrating Dominican Independence Day: A Community United

This year's Dominican Independence Day celebration was truly special, bringing together families from across our community to honor the rich history and vibrant culture of the Dominican Republic.

## A Day of Tradition and Unity
The celebration began early in the morning with the traditional flag-raising ceremony, led by community elders and attended by over 300 families. Children dressed in traditional Dominican attire sang the national anthem, their voices carrying the pride of generations.

## Cultural Performances
The highlight of the day was the series of cultural performances:
- **Merengue and Bachata Dancing**: Local dance groups performed traditional dances
- **Live Music**: The Dominican Cultural Orchestra played beloved classics
- **Poetry Recitations**: Young poets shared original works celebrating Dominican heritage

*¡Viva la República Dominicana!*`,
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-02-27'),
        authorId: authors[0].id,
        categoryId: categories[1].id, // Community Events
        createdBy: systemUser.id,
      },
    }),
    prisma.article.create({
      data: {
        title: 'The Art of Making Traditional Mangu: A Family Recipe',
        slug: 'traditional-mangu-family-recipe',
        summary: 'Learn the secrets behind making perfect mangu, the beloved Dominican breakfast dish, with tips and techniques passed down through generations of Dominican families.',
        content: `# The Art of Making Traditional Mangu: A Family Recipe

Mangu is more than just a dish – it's a connection to our roots, a comfort food that brings families together around the breakfast table.

## Ingredients (Serves 4-6)
- 6-8 green plantains, peeled and chopped
- 1 large onion, thinly sliced
- 3 cloves garlic, minced
- 3 tablespoons olive oil
- Salt to taste
- 1 cup warm milk or water

## The Traditional Method
1. Boil plantains until tender (15-20 minutes)
2. Sauté onions until golden, add garlic
3. Mash plantains, add milk gradually
4. Fold in sautéed onions

*¡Buen provecho!*`,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-02-20'),
        authorId: authors[2].id,
        categoryId: categories[2].id, // Food & Cuisine
        createdBy: systemUser.id,
      },
    }),
    prisma.article.create({
      data: {
        title: 'Youth Leadership Program Graduates First Class',
        slug: 'youth-leadership-program-graduates-2024',
        summary: 'Twenty young Dominican-Americans completed our inaugural Youth Leadership Program, developing skills in community organizing, cultural preservation, and civic engagement.',
        content: `# Youth Leadership Program Graduates First Class

We are proud to announce the graduation of our first Youth Leadership Program cohort, marking a significant milestone in our community's commitment to developing the next generation of leaders.

## Program Highlights
Over six months, participants engaged in:
- Community organizing workshops
- Cultural preservation projects
- Public speaking and leadership training
- Mentorship with community leaders

## Graduate Achievements
Our graduates have already begun making an impact:
- Organized a community clean-up day
- Started a Dominican culture club at their high school
- Launched a tutoring program for younger students

The future of our community is bright with these emerging leaders!`,
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-02-15'),
        authorId: authors[3].id,
        categoryId: categories[3].id, // Youth & Education
        createdBy: systemUser.id,
      },
    }),
    prisma.article.create({
      data: {
        title: 'Preserving Our Musical Heritage: The Sounds of Merengue',
        slug: 'preserving-musical-heritage-merengue',
        summary: 'Explore the rich history of merengue music and how our community is working to preserve this important cultural tradition for future generations.',
        content: `# Preserving Our Musical Heritage: The Sounds of Merengue

Merengue is more than music – it's the heartbeat of Dominican culture, a rhythm that connects us to our homeland and to each other.

## The History of Merengue
Born in the Dominican Republic in the 19th century, merengue has evolved from rural folk music to an internationally recognized genre that represents the soul of our people.

## Community Preservation Efforts
Our cultural center has launched several initiatives:
- Weekly merengue dance classes for all ages
- Oral history project with elder musicians
- Youth orchestra learning traditional arrangements
- Annual merengue festival celebrating the genre

## Learning the Tradition
Whether you're a beginner or experienced dancer, our community welcomes everyone to learn and celebrate this beautiful art form that defines who we are as Dominicans.`,
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
        status: 'PUBLISHED',
        publishedAt: new Date('2024-02-10'),
        authorId: authors[0].id,
        categoryId: categories[0].id, // Culture & Heritage
        createdBy: systemUser.id,
      },
    }),
  ]);

  // Create Gallery Items
  console.log('🖼️ Creating gallery items...');
  const galleryItems = await Promise.all([
    prisma.galleryItem.create({
      data: {
        title: 'Independence Day Flag Ceremony',
        description: 'Community members gather for the traditional flag raising ceremony',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
        photographer: 'Maria Rodriguez',
        location: 'Community Center Plaza',
        dateTaken: new Date('2024-02-27'),
        isActive: true,
        categoryId: galleryCategories[0].id, // Cultural Events
        stackGroup: 'independence-day-2024',
        stackOrder: 1,
        isStackCover: true,
        createdBy: systemUser.id,
      },
    }),
    prisma.galleryItem.create({
      data: {
        title: 'Traditional Dance Performance',
        description: 'Local dancers performing merengue at the Independence Day celebration',
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&h=200&fit=crop',
        photographer: 'Carlos Mendez',
        location: 'Community Center Plaza',
        dateTaken: new Date('2024-02-27'),
        isActive: true,
        categoryId: galleryCategories[0].id, // Cultural Events
        stackGroup: 'independence-day-2024',
        stackOrder: 2,
        isStackCover: false,
        createdBy: systemUser.id,
      },
    }),
    prisma.galleryItem.create({
      data: {
        title: 'Community Feast Preparation',
        description: 'Volunteers preparing traditional Dominican dishes for the celebration',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
        photographer: 'Ana Jimenez',
        location: 'Community Kitchen',
        dateTaken: new Date('2024-02-27'),
        isActive: true,
        categoryId: galleryCategories[2].id, // Food & Cooking
        createdBy: systemUser.id,
      },
    }),
    prisma.galleryItem.create({
      data: {
        title: 'Youth Leadership Graduation',
        description: 'First graduating class of the Youth Leadership Program',
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=200&fit=crop',
        photographer: 'Roberto Santos',
        location: 'Cultural Center Auditorium',
        dateTaken: new Date('2024-02-15'),
        isActive: true,
        categoryId: galleryCategories[1].id, // Community Life
        createdBy: systemUser.id,
      },
    }),
  ]);

  // Create Article-Tag relationships
  console.log('🔗 Creating article-tag relationships...');
  await Promise.all([
    // Independence Day article tags
    prisma.article.update({
      where: { id: articles[0].id },
      data: {
        tags: {
          connect: [
            { id: tags[2].id }, // Independence
            { id: tags[3].id }, // Celebration
            { id: tags[1].id }, // Community
          ]
        }
      }
    }),
    // Mangu recipe article tags
    prisma.article.update({
      where: { id: articles[1].id },
      data: {
        tags: {
          connect: [
            { id: tags[4].id }, // Cooking
            { id: tags[5].id }, // Traditional
          ]
        }
      }
    }),
    // Youth program article tags
    prisma.article.update({
      where: { id: articles[2].id },
      data: {
        tags: {
          connect: [
            { id: tags[6].id }, // Youth
            { id: tags[7].id }, // Education
          ]
        }
      }
    }),
    // Merengue article tags
    prisma.article.update({
      where: { id: articles[3].id },
      data: {
        tags: {
          connect: [
            { id: tags[8].id }, // Music
            { id: tags[0].id }, // Heritage
          ]
        }
      }
    }),
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log(`Created:
  - ${authors.length} authors
  - ${categories.length} categories
  - ${galleryCategories.length} gallery categories
  - ${tags.length} tags
  - ${articles.length} articles
  - ${galleryItems.length} gallery items
  - Article-tag relationships established`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
