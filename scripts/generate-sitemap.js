#!/usr/bin/env node

/**
 * Dynamic Sitemap Generator for Onward Dominicans
 * Generates sitemap.xml based on actual content from the database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SITE_URL = 'https://onward-dominicans.vercel.app';
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

// Static pages configuration
const STATIC_PAGES = [
  {
    url: '/',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '1.0'
  },
  {
    url: '/#news-feed',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '0.9'
  },
  {
    url: '/#gallery',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '0.8'
  },
  {
    url: '/#about-publication',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.7'
  },
  {
    url: '/#meet-the-team',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.6'
  },
  {
    url: '/#contact-us',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.6'
  }
];

// Sample articles (in production, this would fetch from your database)
const SAMPLE_ARTICLES = [
  {
    slug: 'celebrating-dominican-independence-day-2024',
    title: 'Celebrating Dominican Independence Day: A Community United',
    lastmod: '2024-02-27',
    keywords: 'Dominican Independence Day, community celebration, cultural events',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
    imageTitle: 'Dominican Independence Day Celebration',
    imageCaption: 'Community members celebrating Dominican Independence Day with traditional performances'
  },
  {
    slug: 'traditional-mangu-family-recipe',
    title: 'The Art of Making Traditional Mangu: A Family Recipe',
    lastmod: '2024-02-20',
    keywords: 'Dominican food, mangu recipe, traditional cooking',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    imageTitle: 'Traditional Dominican Mangu',
    imageCaption: 'Traditional Dominican mangu breakfast dish preparation'
  },
  {
    slug: 'youth-leadership-program-graduates-2024',
    title: 'Youth Leadership Program Graduates First Class',
    lastmod: '2024-02-15',
    keywords: 'youth leadership, Dominican youth, education, community development',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
    imageTitle: 'Youth Leadership Program Graduation',
    imageCaption: 'First graduating class of the Dominican Youth Leadership Program'
  },
  {
    slug: 'preserving-musical-heritage-merengue',
    title: 'Preserving Our Musical Heritage: The Sounds of Merengue',
    lastmod: '2024-02-10',
    keywords: 'merengue music, Dominican culture, musical heritage, traditional music',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    imageTitle: 'Merengue Musical Heritage',
    imageCaption: 'Traditional merengue music and dance performance'
  }
];

function generateSitemap() {
  console.log('🗺️  Generating dynamic sitemap...');

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
`;

  // Add static pages
  STATIC_PAGES.forEach(page => {
    sitemap += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
  
`;
  });

  // Add articles
  SAMPLE_ARTICLES.forEach(article => {
    sitemap += `  <url>
    <loc>${SITE_URL}/article/${article.slug}</loc>
    <lastmod>${article.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <news:news>
      <news:publication>
        <news:name>Onward Dominicans</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${article.lastmod}</news:publication_date>
      <news:title>${article.title}</news:title>
      <news:keywords>${article.keywords}</news:keywords>
    </news:news>
    <image:image>
      <image:loc>${article.imageUrl}</image:loc>
      <image:title>${article.imageTitle}</image:title>
      <image:caption>${article.imageCaption}</image:caption>
    </image:image>
  </url>
  
`;
  });

  sitemap += `</urlset>`;

  // Write sitemap to file
  fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf8');
  console.log(`✅ Sitemap generated successfully at ${OUTPUT_PATH}`);
  console.log(`📊 Generated ${STATIC_PAGES.length} static pages and ${SAMPLE_ARTICLES.length} articles`);
}

// Run the generator
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemap();
}

export { generateSitemap };
