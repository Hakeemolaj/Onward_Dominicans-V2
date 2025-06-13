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
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyc2ZtZ2hramh4a2pqemtpZ2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjQwMDcsImV4cCI6MjA2NTE0MDAwN30.HGkX4r3NCfsyzk0pMsLS0N40K904zWA2CZyZ3Pr-bxM';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

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

// Enhanced fetch function with better error handling
async function fetchArticles() {
  // Try to fetch from Supabase (admin dashboard source)
  try {
    console.log('🔄 Attempting to fetch articles from admin dashboard...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=*,author:authors(*),category:categories(*),tags(*)&status=eq.PUBLISHED&order=createdAt.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const articles = await response.json();
      if (articles && articles.length > 0) {
        console.log(`✅ Fetched ${articles.length} articles from admin dashboard`);
        return articles;
      }
    }

    console.log('⚠️  No articles found in admin dashboard, using fallback');
    return FALLBACK_ARTICLES;

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('⚠️  Supabase request timed out, using fallback articles');
    } else {
      console.log('⚠️  Supabase connection failed, using fallback articles');
    }
    return FALLBACK_ARTICLES;
  }
}

// Generate enhanced HTML template for article pages
function generateArticleHTML(article) {
  const publishDate = article.publishedAt || article.createdAt || new Date().toISOString();
  const authorName = article.author?.name || 'Onward Dominicans';
  const categoryName = article.category?.name || 'News';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - Onward Dominicans</title>
    <meta name="description" content="${(article.summary || article.title).replace(/"/g, '&quot;')}">
    <meta name="author" content="${authorName}">
    <meta name="keywords" content="${(article.tags || []).join(', ')}, Dominican community, news">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${(article.summary || article.title).replace(/"/g, '&quot;')}">
    <meta property="og:image" content="${article.imageUrl || config.baseUrl + '/favicon.ico'}">
    <meta property="og:url" content="${config.baseUrl}/article/${article.slug}">
    <meta property="og:site_name" content="Onward Dominicans">
    <meta property="article:published_time" content="${publishDate}">
    <meta property="article:author" content="${authorName}">
    <meta property="article:section" content="${categoryName}">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${article.title}">
    <meta name="twitter:description" content="${(article.summary || article.title).replace(/"/g, '&quot;')}">
    <meta name="twitter:image" content="${article.imageUrl || config.baseUrl + '/favicon.ico'}">

    <!-- SEO -->
    <link rel="canonical" href="${config.baseUrl}/article/${article.slug}">
    <meta name="robots" content="index, follow">

    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "${article.title}",
      "description": "${(article.summary || article.title).replace(/"/g, '\\"')}",
      "image": "${article.imageUrl || ''}",
      "author": {
        "@type": "Person",
        "name": "${authorName}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Onward Dominicans",
        "url": "${config.baseUrl}"
      },
      "datePublished": "${publishDate}",
      "dateModified": "${article.updatedAt || publishDate}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${config.baseUrl}/article/${article.slug}"
      }
    }
    </script>

    <link rel="stylesheet" href="/assets/index-Cc5yL0pL.css">
</head>
<body class="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
    <div id="root">
        <!-- Static content for SEO -->
        <article class="max-w-4xl mx-auto px-4 py-8">
            <header class="mb-8">
                <h1 class="text-4xl font-bold mb-4">${article.title}</h1>
                <div class="flex items-center text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <span>By ${authorName}</span>
                    <span class="mx-2">•</span>
                    <time datetime="${publishDate}">${new Date(publishDate).toLocaleDateString()}</time>
                    <span class="mx-2">•</span>
                    <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">${categoryName}</span>
                </div>
                ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}" class="w-full h-64 object-cover rounded-lg mb-6">` : ''}
            </header>

            <div class="prose prose-lg dark:prose-invert max-w-none">
                <p class="text-xl text-slate-600 dark:text-slate-400 mb-6">${article.summary}</p>
                <div class="article-content">
                    ${article.content || ''}
                </div>
            </div>

            <!-- Navigation back to main site -->
            <footer class="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                <a href="/" class="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                    ← Back to Onward Dominicans
                </a>
            </footer>
        </article>
    </div>

    <!-- Load React app for interactivity -->
    <script type="module" src="/assets/main-DynZKHKR.js"></script>
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

  // Generate category pages
  await generateCategoryPages(articles.filter(a => a.status === 'PUBLISHED'));

  // Generate search index
  await generateSearchIndex(articles.filter(a => a.status === 'PUBLISHED'));

  // Generate sitemap with article URLs
  generateSitemap(articles.filter(a => a.status === 'PUBLISHED'));

  // Trigger deployment webhook if in production
  if (isProduction) {
    await triggerDeploymentWebhook();
  }

  console.log(`🎉 Generated ${articles.filter(a => a.status === 'PUBLISHED').length} static pages`);
}

// Generate sitemap.xml with article URLs
function generateSitemap(articles) {
  const urls = [
    {
      loc: config.baseUrl,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      loc: `${config.baseUrl}/news`,
      changefreq: 'daily',
      priority: '0.8'
    },
    {
      loc: `${config.baseUrl}/culture`,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      loc: `${config.baseUrl}/gallery`,
      changefreq: 'weekly',
      priority: '0.7'
    },
    {
      loc: `${config.baseUrl}/about`,
      changefreq: 'monthly',
      priority: '0.6'
    }
  ];

  // Add article URLs
  articles.forEach(article => {
    urls.push({
      loc: `${config.baseUrl}/article/${article.slug}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: article.updatedAt || article.publishedAt || article.createdAt
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
    ${url.lastmod ? `<lastmod>${new Date(url.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  const sitemapPath = path.join(config.outputDir, 'sitemap-articles.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log('✅ Generated sitemap-articles.xml');
}

// Generate category listing pages
async function generateCategoryPages(articles) {
  console.log('📂 Generating category pages...');

  // Group articles by category
  const categoriesMap = new Map();

  articles.forEach(article => {
    const categoryName = article.category?.name || 'Uncategorized';
    const categorySlug = article.category?.slug || 'uncategorized';

    if (!categoriesMap.has(categorySlug)) {
      categoriesMap.set(categorySlug, {
        name: categoryName,
        slug: categorySlug,
        articles: []
      });
    }

    categoriesMap.get(categorySlug).articles.push(article);
  });

  // Create category directory
  const categoryDir = path.join(config.outputDir, 'category');
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  // Generate individual category pages
  for (const [slug, category] of categoriesMap) {
    const html = generateCategoryHTML(category);
    const filePath = path.join(categoryDir, `${slug}.html`);
    fs.writeFileSync(filePath, html);
    console.log(`✅ Generated: /category/${slug}.html (${category.articles.length} articles)`);
  }

  console.log(`📂 Generated ${categoriesMap.size} category pages`);
}

// Generate HTML template for category pages
function generateCategoryHTML(category) {
  const articlesHtml = category.articles.map(article => `
    <article class="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}" class="w-full h-48 object-cover">` : ''}
      <div class="p-6">
        <h3 class="text-xl font-semibold mb-2">
          <a href="/article/${article.slug}" class="text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400">
            ${article.title}
          </a>
        </h3>
        <p class="text-slate-600 dark:text-slate-400 mb-4">${article.summary || ''}</p>
        <div class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-500">
          <span>By ${article.author?.name || 'Onward Dominicans'}</span>
          <time datetime="${article.publishedAt || article.createdAt}">
            ${new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
          </time>
        </div>
      </div>
    </article>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${category.name} - Onward Dominicans</title>
    <meta name="description" content="Browse ${category.name} articles from Onward Dominicans - Dominican community news and culture">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${category.name} - Onward Dominicans">
    <meta property="og:description" content="Browse ${category.name} articles from Onward Dominicans">
    <meta property="og:url" content="${config.baseUrl}/category/${category.slug}">
    <meta property="og:site_name" content="Onward Dominicans">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${category.name} - Onward Dominicans">
    <meta name="twitter:description" content="Browse ${category.name} articles from Onward Dominicans">

    <!-- SEO -->
    <link rel="canonical" href="${config.baseUrl}/category/${category.slug}">
    <meta name="robots" content="index, follow">

    <link rel="stylesheet" href="/assets/index-Cc5yL0pL.css">
</head>
<body class="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
    <div id="root">
        <div class="max-w-6xl mx-auto px-4 py-8">
            <header class="mb-8">
                <nav class="mb-4">
                    <a href="/" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                        ← Back to Home
                    </a>
                </nav>
                <h1 class="text-4xl font-bold mb-4">${category.name}</h1>
                <p class="text-xl text-slate-600 dark:text-slate-400">
                    ${category.articles.length} article${category.articles.length !== 1 ? 's' : ''} in this category
                </p>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${articlesHtml}
            </div>
        </div>
    </div>

    <!-- Load React app for interactivity -->
    <script type="module" src="/assets/main-DynZKHKR.js"></script>
</body>
</html>`;
}

// Trigger deployment webhook for automated regeneration
async function triggerDeploymentWebhook() {
  try {
    const webhookUrl = process.env.VERCEL_DEPLOY_HOOK || process.env.DEPLOY_WEBHOOK_URL;

    if (!webhookUrl) {
      console.log('ℹ️  No deployment webhook configured');
      return;
    }

    console.log('🚀 Triggering deployment webhook...');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        trigger: 'ssg-regeneration',
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      console.log('✅ Deployment webhook triggered successfully');
    } else {
      console.log('⚠️  Deployment webhook failed');
    }
  } catch (error) {
    console.log('⚠️  Deployment webhook error:', error.message);
  }
}

// Generate search index for client-side search
async function generateSearchIndex(articles) {
  console.log('🔍 Generating search index...');

  const searchIndex = articles.map(article => ({
    id: article.id,
    title: article.title,
    summary: article.summary || '',
    content: stripHtml(article.content || ''),
    slug: article.slug,
    url: `/article/${article.slug}`,
    author: article.author?.name || 'Onward Dominicans',
    category: article.category?.name || 'Uncategorized',
    categorySlug: article.category?.slug || 'uncategorized',
    tags: (article.tags || []).map(tag => tag.name || tag).join(' '),
    publishedAt: article.publishedAt || article.createdAt,
    imageUrl: article.imageUrl || ''
  }));

  // Create search index JSON
  const indexPath = path.join(config.outputDir, 'search-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(searchIndex, null, 2));

  // Create lightweight search index for faster loading
  const lightIndex = searchIndex.map(item => ({
    id: item.id,
    title: item.title,
    summary: item.summary.substring(0, 150),
    url: item.url,
    author: item.author,
    category: item.category,
    publishedAt: item.publishedAt,
    imageUrl: item.imageUrl
  }));

  const lightIndexPath = path.join(config.outputDir, 'search-index-light.json');
  fs.writeFileSync(lightIndexPath, JSON.stringify(lightIndex, null, 2));

  console.log(`✅ Generated search index with ${searchIndex.length} articles`);
}

// Strip HTML tags from content
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Run the generation
generateStaticPages().catch(console.error);