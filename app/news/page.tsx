import { Metadata } from 'next';
import NewsPageClient from './NewsPageClient';

export const metadata: Metadata = {
  title: 'News',
  description: 'Latest news and updates from the Dominican community - stay informed about events, culture, and stories that matter.',
  openGraph: {
    title: 'News - Onward Dominicans',
    description: 'Latest news and updates from the Dominican community',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'News - Onward Dominicans',
    description: 'Latest news and updates from the Dominican community',
  },
  alternates: {
    canonical: '/news',
  },
};

export default function NewsPage() {
  return <NewsPageClient />;
}
