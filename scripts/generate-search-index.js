#!/usr/bin/env node

/**
 * Generate Static Search Index
 * Creates a searchable index of all content for client-side search
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 Generating static search index...');

// Configuration
const config = {
  outputDir: 'dist',
  baseUrl: 'https://odmailsu.vercel.app'
};

// Supabase configuration (same as admin dashboard)
const SUPABASE_URL = 'https://zrsfmghkjhxkjjzkigck.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyc2ZtZ2hramh4a2pqemtpZ2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjQwMDcsImV4cCI6MjA2NTE0MDAwN30.HGkX4r3NCfsyzk0pMsLS0N40K904zWA2CZyZ3Pr-bxM';

// Fetch articles for search index
async function fetchArticlesForSearch() {
  try {
    console.log('📄 Fetching articles for search index...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
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
        console.log(`✅ Fetched ${articles.length} articles for search index`);
        return articles;
      }
    }
    
    console.log('⚠️  No articles found, using empty search index');
    return [];
    
  } catch (error) {
    console.log('⚠️  Search index fetch failed, using empty index');
    return [];
  }
}

// Create search index from articles
function createSearchIndex(articles) {
  console.log('🔍 Creating search index...');
  
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
    imageUrl: article.imageUrl || '',
    // Create searchable text combining all fields
    searchText: [
      article.title,
      article.summary || '',
      stripHtml(article.content || ''),
      article.author?.name || '',
      article.category?.name || '',
      (article.tags || []).map(tag => tag.name || tag).join(' ')
    ].join(' ').toLowerCase()
  }));
  
  return searchIndex;
}

// Strip HTML tags from content
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Generate search index file
async function generateSearchIndex() {
  const articles = await fetchArticlesForSearch();
  
  if (articles.length === 0) {
    console.log('⚠️  No articles to index');
    return;
  }
  
  const searchIndex = createSearchIndex(articles);
  
  // Create search index JSON
  const indexPath = path.join(config.outputDir, 'search-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(searchIndex, null, 2));
  console.log(`✅ Generated search index with ${searchIndex.length} articles`);
  
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
  console.log(`✅ Generated lightweight search index`);
  
  // Generate search page
  generateSearchPage();
}

// Generate search page HTML
function generateSearchPage() {
  const searchPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Search - Onward Dominicans</title>
    <meta name="description" content="Search articles and content from Onward Dominicans">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${config.baseUrl}/search">
    <link rel="stylesheet" href="/assets/index-Cc5yL0pL.css">
</head>
<body class="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
    <div id="root">
        <div class="max-w-4xl mx-auto px-4 py-8">
            <header class="mb-8">
                <nav class="mb-4">
                    <a href="/" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
                        ← Back to Home
                    </a>
                </nav>
                <h1 class="text-4xl font-bold mb-4">Search</h1>
            </header>
            
            <div class="mb-8">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Search articles, authors, categories..." 
                    class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
            </div>
            
            <div id="searchResults" class="space-y-6">
                <p class="text-slate-600 dark:text-slate-400">Enter a search term to find articles...</p>
            </div>
        </div>
    </div>
    
    <script>
        // Simple client-side search functionality
        let searchIndex = [];
        
        // Load search index
        fetch('/search-index-light.json')
            .then(response => response.json())
            .then(data => {
                searchIndex = data;
                console.log('Search index loaded:', searchIndex.length, 'articles');
            })
            .catch(error => console.error('Failed to load search index:', error));
        
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        
        searchInput.addEventListener('input', performSearch);
        
        function performSearch() {
            const query = searchInput.value.toLowerCase().trim();
            
            if (query.length < 2) {
                searchResults.innerHTML = '<p class="text-slate-600 dark:text-slate-400">Enter at least 2 characters to search...</p>';
                return;
            }
            
            const results = searchIndex.filter(article => 
                article.title.toLowerCase().includes(query) ||
                article.summary.toLowerCase().includes(query) ||
                article.author.toLowerCase().includes(query) ||
                article.category.toLowerCase().includes(query)
            );
            
            displayResults(results, query);
        }
        
        function displayResults(results, query) {
            if (results.length === 0) {
                searchResults.innerHTML = '<p class="text-slate-600 dark:text-slate-400">No articles found for "' + query + '"</p>';
                return;
            }
            
            const resultsHtml = results.map(article => \`
                <article class="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h3 class="text-xl font-semibold mb-2">
                        <a href="\${article.url}" class="text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400">
                            \${article.title}
                        </a>
                    </h3>
                    <p class="text-slate-600 dark:text-slate-400 mb-4">\${article.summary}</p>
                    <div class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-500">
                        <span>By \${article.author} • \${article.category}</span>
                        <time datetime="\${article.publishedAt}">
                            \${new Date(article.publishedAt).toLocaleDateString()}
                        </time>
                    </div>
                </article>
            \`).join('');
            
            searchResults.innerHTML = \`
                <p class="text-slate-600 dark:text-slate-400 mb-6">Found \${results.length} article\${results.length !== 1 ? 's' : ''} for "\${query}"</p>
                \${resultsHtml}
            \`;
        }
    </script>
    
    <!-- Load React app for interactivity -->
    <script type="module" src="/assets/main-DynZKHKR.js"></script>
</body>
</html>`;
  
  const searchPagePath = path.join(config.outputDir, 'search.html');
  fs.writeFileSync(searchPagePath, searchPageHtml);
  console.log('✅ Generated search page');
}

// Run search index generation
generateSearchIndex().catch(console.error);
