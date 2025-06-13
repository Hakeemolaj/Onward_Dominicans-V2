import { fetchFeaturedArticle, FALLBACK_DATA } from './lib/data-fetcher';
import HomePageClient from './components/HomePageClient';

export default async function HomePage() {
  // Fetch featured article with fallback
  let featuredArticle;
  try {
    featuredArticle = await fetchFeaturedArticle();
  } catch (error) {
    console.error('Failed to fetch featured article, using fallback:', error);
    featuredArticle = FALLBACK_DATA.articles.find(a => a.featured) || FALLBACK_DATA.articles[0];
  }

  return <HomePageClient featuredArticle={featuredArticle} />;
}


