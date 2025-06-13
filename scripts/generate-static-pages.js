#!/usr/bin/env node

/**
 * Generate Static Pages for SEO
 * Creates individual HTML pages for articles while preserving admin functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Generating Static Pages for SEO...\n');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');

// Article data - this would come from your API in production
const ARTICLES = [
  {
    slug: 'celebrating-dominican-independence-day-2024',
    title: 'Celebrating Dominican Independence Day: A Community United',
    summary: 'Community members come together to celebrate Dominican Independence Day with traditional performances, food, and cultural activities.',
    content: `Every February 27th, Dominicans around the world come together to celebrate their independence from Haiti in 1844. This year's celebration promises to be particularly special as communities organize traditional events, cultural performances, and educational activities that honor our rich heritage.

The Dominican Republic gained its independence on February 27, 1844, led by Juan Pablo Duarte and the secret society La Trinitaria. This historic moment marked the beginning of the Dominican Republic as a sovereign nation, free from Haitian rule that had lasted for 22 years.

This year's Independence Day celebrations feature traditional music and dance performances, culinary festivals featuring Dominican dishes, cultural exhibitions, and community parades with traditional costumes.

The celebration serves as more than just a historical commemoration—it's a time for the Dominican community to come together, strengthen bonds, and pass on cultural traditions to the next generation.`,
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
    author: { name: 'Maria Rodriguez', bio: 'Cultural Affairs Correspondent' },
    date: '2024-02-27',
    category: 'Culture',
    tags: ['Dominican Independence Day', 'community celebration', 'cultural events']
  },
  {
    slug: 'traditional-mangu-family-recipe',
    title: 'The Art of Making Traditional Mangu: A Family Recipe',
    summary: 'Learn to make authentic Dominican mangu with this traditional family recipe passed down through generations.',
    content: `Mangu is more than just a dish—it's a cornerstone of Dominican cuisine and a symbol of our cultural identity. This traditional breakfast has been nourishing Dominican families for generations.

Mangu is a traditional Dominican dish made primarily from mashed plantains, typically served for breakfast alongside eggs, cheese, and salami—a combination known as "Los Tres Golpes" (The Three Hits).

The recipe includes green plantains, onions, garlic, olive oil, and salt. The preparation involves boiling plantains until tender, then mashing them with caramelized onions and garlic.

This recipe has been passed down through four generations in our family, and we hope it brings the same warmth and satisfaction to your table that it has brought to ours.`,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    author: { name: 'Carmen Jimenez', bio: 'Culinary Heritage Specialist' },
    date: '2024-02-20',
    category: 'Food & Culture',
    tags: ['Dominican food', 'mangu recipe', 'traditional cooking']
  },
  {
    slug: 'youth-leadership-program-graduates-2024',
    title: 'Youth Leadership Program Graduates First Class',
    summary: 'The inaugural Dominican Youth Leadership Program celebrates its first graduating class of 25 young leaders.',
    content: `The Dominican Youth Leadership Program has reached a significant milestone with the graduation of its first class of 25 young leaders. This groundbreaking initiative, launched in early 2023, aims to develop the next generation of Dominican community leaders.

The 12-month program combines leadership training, cultural education, and community service to prepare young Dominicans aged 16-25 for leadership roles in their communities.

The graduating class has already made significant contributions including organizing cultural festivals, launching tutoring programs, creating social media campaigns, and coordinating food drives.

Based on the success of the inaugural class, the program is expanding to accommodate 50 participants in the next cohort.`,
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
    author: { name: 'Roberto Fernandez', bio: 'Community Development Director' },
    date: '2024-02-15',
    category: 'Community',
    tags: ['youth leadership', 'Dominican youth', 'education', 'community development']
  },
  {
    slug: 'preserving-musical-heritage-merengue',
    title: 'Preserving Our Musical Heritage: The Sounds of Merengue',
    summary: 'Exploring the rich history and cultural significance of merengue music in Dominican culture and its evolution over time.',
    content: `Merengue is more than music—it's the heartbeat of Dominican culture. This vibrant genre has evolved from its humble beginnings in the 19th century to become one of the most recognizable sounds of the Caribbean.

Merengue's roots trace back to the mid-19th century, emerging from a blend of African, European, and indigenous Taíno influences. The genre initially faced resistance from the upper classes but gained national prominence during Rafael Trujillo's dictatorship.

The music is characterized by its fast-paced 2/4 time signature and traditional instruments including accordion, tambora, güira, and bass. Throughout its history, merengue has served as a vehicle for social commentary and community bonding.

As we look to the future, merengue continues to evolve while maintaining its essential character, ensuring that this musical heritage remains a living expression of Dominican culture.`,
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    author: { name: 'Luis Morales', bio: 'Music Historian and Cultural Preservationist' },
    date: '2024-02-10',
    category: 'Music & Culture',
    tags: ['merengue music', 'Dominican culture', 'musical heritage', 'traditional music']
  }
];

function generateArticlePage(article) {
  const articleUrl = `https://onward-dominicans.vercel.app/article/${article.slug}`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title>${article.title} - Onward Dominicans</title>
    <meta name="description" content="${article.summary}">
    <meta name="keywords" content="Dominican community, Dominican culture, ${article.tags.join(', ')}">
    <meta name="author" content="${article.author.name}">
    <link rel="canonical" href="${articleUrl}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${article.summary}">
    <meta property="og:image" content="${article.imageUrl}">
    <meta property="og:url" content="${articleUrl}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Onward Dominicans">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${article.title}">
    <meta name="twitter:description" content="${article.summary}">
    <meta name="twitter:image" content="${article.imageUrl}">
    
    <!-- Article Meta Tags -->
    <meta property="article:published_time" content="${article.date}T00:00:00+00:00">
    <meta property="article:modified_time" content="${article.date}T00:00:00+00:00">
    <meta property="article:author" content="${article.author.name}">
    <meta property="article:section" content="${article.category}">
    ${article.tags.map(tag => `<meta property="article:tag" content="${tag}">`).join('\n    ')}
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": "${article.title}",
        "description": "${article.summary}",
        "image": "${article.imageUrl}",
        "datePublished": "${article.date}T00:00:00+00:00",
        "dateModified": "${article.date}T00:00:00+00:00",
        "author": {
            "@type": "Person",
            "name": "${article.author.name}",
            "description": "${article.author.bio}"
        },
        "publisher": {
            "@type": "NewsMediaOrganization",
            "name": "Onward Dominicans",
            "logo": {
                "@type": "ImageObject",
                "url": "https://onward-dominicans.vercel.app/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "${articleUrl}"
        }
    }
    </script>
    
    <!-- Favicon and Icons -->
    <link rel="icon" href="/favicon.ico">
    
    <!-- Redirect to main site for interactive experience -->
    <script>
        // Check if this is a crawler/bot
        const userAgent = navigator.userAgent.toLowerCase();
        const isCrawler = /bot|crawler|spider|crawling/i.test(userAgent);
        
        // If not a crawler, redirect to main site
        if (!isCrawler) {
            window.location.href = '/#article-${article.slug}';
        }
    </script>
    
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { border-bottom: 2px solid #f59e0b; padding-bottom: 20px; margin-bottom: 30px; }
        .category { background: #fef3c7; color: #92400e; padding: 5px 10px; border-radius: 15px; font-size: 14px; }
        .title { color: #1f2937; margin: 20px 0; }
        .meta { color: #6b7280; margin: 20px 0; }
        .content { color: #374151; }
        .image { width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin: 20px 0; }
        .back-link { color: #f59e0b; text-decoration: none; }
        .back-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <span class="category">${article.category}</span>
        <h1 class="title">${article.title}</h1>
        <div class="meta">
            By ${article.author.name} • ${new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
    </div>
    
    <img src="${article.imageUrl}" alt="${article.title}" class="image">
    
    <div class="content">
        <p><strong>${article.summary}</strong></p>
        ${article.content.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('\n        ')}
    </div>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p><strong>Tags:</strong> ${article.tags.join(', ')}</p>
        <p><a href="/" class="back-link">← Back to Onward Dominicans</a></p>
    </div>
</body>
</html>`;
}

function generateStaticPages() {
  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Create article directory
  const articleDir = path.join(distDir, 'article');
  if (!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir, { recursive: true });
  }

  // Generate individual article pages
  ARTICLES.forEach(article => {
    const articlePath = path.join(articleDir, `${article.slug}.html`);
    const articleHtml = generateArticlePage(article);
    
    fs.writeFileSync(articlePath, articleHtml, 'utf8');
    console.log(`✅ Generated: /article/${article.slug}.html`);
  });

  console.log(`\n🎉 Generated ${ARTICLES.length} static article pages!`);
  console.log('\n📋 Next Steps:');
  console.log('1. Deploy the updated dist folder');
  console.log('2. Update sitemap with new URLs');
  console.log('3. Submit to Google Search Console');
  console.log('4. Monitor indexing progress');
}

// Run the generator
try {
  generateStaticPages();
} catch (error) {
  console.error('❌ Error generating static pages:', error);
}
