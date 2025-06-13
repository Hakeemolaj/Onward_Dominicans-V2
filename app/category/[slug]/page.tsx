import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryPageClient from './CategoryPageClient';

// Static articles data (will be replaced with Supabase data fetching)
const ARTICLES = [
  {
    id: 'celebrating-dominican-independence-day-2024',
    slug: 'celebrating-dominican-independence-day-2024',
    title: 'Celebrating Dominican Independence Day: A Community United',
    summary: 'Community members come together to celebrate Dominican Independence Day with traditional performances, food, and cultural activities.',
    content: 'Every February 27th, Dominicans around the world come together to celebrate their independence from Haiti in 1844...',
    author: 'Maria Rodriguez',
    category: 'Community Events',
    publishedAt: '2024-02-27T00:00:00',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
    tags: ['independence', 'community', 'culture', 'celebration']
  },
  {
    id: 'traditional-mangu-family-recipe',
    slug: 'traditional-mangu-family-recipe',
    title: 'The Art of Making Traditional Mangu: A Family Recipe',
    summary: 'Learn to make authentic Dominican mangu with this traditional family recipe passed down through generations.',
    content: 'Mangu is more than just a dish—it\'s a cornerstone of Dominican cuisine...',
    author: 'Carlos Santana',
    category: 'Food & Cuisine',
    publishedAt: '2024-01-15T00:00:00',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    tags: ['food', 'recipe', 'tradition', 'mangu']
  }
];

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Get unique categories from articles
function getCategories() {
  const categories = new Set(ARTICLES.map(article => article.category));
  return Array.from(categories).map(category => ({
    name: category,
    slug: category.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, ''),
  }));
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

// Generate metadata for each category
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = getCategories();
  const category = categories.find(c => c.slug === slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  const categoryArticles = ARTICLES.filter(article =>
    article.category.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, '') === slug
  );

  return {
    title: `${category.name} Articles`,
    description: `Browse ${category.name} articles from Onward Dominicans - Dominican community news and culture`,
    openGraph: {
      title: `${category.name} - Onward Dominicans`,
      description: `Browse ${category.name} articles from Onward Dominicans`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${category.name} - Onward Dominicans`,
      description: `Browse ${category.name} articles from Onward Dominicans`,
    },
    alternates: {
      canonical: `/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = getCategories();
  const category = categories.find(c => c.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryArticles = ARTICLES.filter(article =>
    article.category.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, '') === slug
  );

  return <CategoryPageClient category={category} articles={categoryArticles} />;
}
