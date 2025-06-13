import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticlePageClient from './ArticlePageClient';

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

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all articles
export async function generateStaticParams() {
  // In the future, this will fetch from Supabase
  return ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

// Generate metadata for each article
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find(a => a.slug === slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.summary,
    keywords: article.tags || [],
    authors: [{ name: article.author }],
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author],
      images: article.imageUrl ? [
        {
          url: article.imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
    alternates: {
      canonical: `/article/${article.slug}`,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = ARTICLES.find(a => a.slug === slug);
  
  if (!article) {
    notFound();
  }

  return <ArticlePageClient article={article} />;
}
