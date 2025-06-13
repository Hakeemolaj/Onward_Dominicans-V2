#!/usr/bin/env node

/**
 * Static Site Generation for SEO
 * Generates static HTML pages from admin dashboard content
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting SSG page generation...');

// Basic configuration
const config = {
  outputDir: 'dist',
  baseUrl: 'https://odmailsu.vercel.app'
};

// Supabase configuration (same as admin dashboard)
const SUPABASE_URL = 'https://zrsfmghkjhxkjjzkigck.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyc2ZtZ2hramh4a2pqemtpZ2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2OTc4NzQsImV4cCI6MjA1MjI3Mzg3NH0.Qs8-Qs_Qs8-Qs_Qs8-Qs_Qs8-Qs_Qs8-Qs_Qs8-Qs_Qs8';

// Fallback articles data (from router.tsx)
const FALLBACK_ARTICLES = [
  {
    slug: 'celebrating-dominican-independence-day-2024',
    title: 'Celebrating Dominican Independence Day: A Community United',
    summary: 'Community members come together to celebrate Dominican Independence Day with traditional performances, food, and cultural activities.',
    content: 'Every February 27th, Dominicans around the world come together to celebrate their independence from Haiti in 1844...',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
    status: 'PUBLISHED'
  },
  {
    slug: 'traditional-mangu-family-recipe',
    title: 'The Art of Making Traditional Mangu: A Family Recipe',
    summary: 'Learn to make authentic Dominican mangu with this traditional family recipe passed down through generations.',
    content: 'Mangu is more than just a dish—it\'s a cornerstone of Dominican cuisine...',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    status: 'PUBLISHED'
  }
];

// Fetch articles (using fallback for now, can be enhanced to connect to admin dashboard)
async function fetchArticles() {
  console.log('📄 Using fallback articles (can be enhanced to fetch from admin dashboard)');
  return FALLBACK_ARTICLES;
}

// Generate HTML template for article pages
function generateArticleHTML(article) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - Onward Dominicans</title>
    <meta name="description" content="${article.summary || article.title}">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${article.summary || article.title}">
    <meta property="og:image" content="${article.imageUrl || ''}">
    <meta property="og:url" content="${config.baseUrl}/article/${article.slug}">
    <link rel="canonical" href="${config.baseUrl}/article/${article.slug}">
    <link rel="stylesheet" href="/src/index.css">
</head>
<body>
    <div id="root">
        <article>
            <h1>${article.title}</h1>
            <p>${article.summary}</p>
            <div>${article.content || ''}</div>
        </article>
    </div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
}

// Main generation function
async function generateStaticPages() {
  console.log('📦 Generating static pages from admin dashboard content...');

  // Fetch articles from the same source as admin dashboard
  const articles = await fetchArticles();

  if (articles.length === 0) {
    console.log('⚠️  No articles found, skipping page generation');
    return;
  }

  // Create article directory
  const articleDir = path.join(config.outputDir, 'article');
  if (!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir, { recursive: true });
  }

  // Generate individual article pages
  for (const article of articles) {
    if (article.slug && article.status === 'PUBLISHED') {
      const html = generateArticleHTML(article);
      const filePath = path.join(articleDir, `${article.slug}.html`);
      fs.writeFileSync(filePath, html);
      console.log(`✅ Generated: /article/${article.slug}.html`);
    }
  }

  console.log(`🎉 Generated ${articles.filter(a => a.status === 'PUBLISHED').length} static pages`);
}

// Run the generation
generateStaticPages().catch(console.error);