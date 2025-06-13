#!/usr/bin/env node

/**
 * Simple prerendering for existing pages
 * Works with admin dashboard content
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔄 Starting prerendering process...');

// Update existing index.html with better SEO
function updateIndexHTML() {
  const indexPath = path.join('dist', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.log('❌ dist/index.html not found');
    return;
  }
  
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Add better meta tags for SEO
  const metaTags = `
    <meta name="description" content="Onward Dominicans - Dominican community news, culture, and events">
    <meta property="og:title" content="Onward Dominicans - Dominican Community News">
    <meta property="og:description" content="Stay connected with Dominican community news, cultural events, and stories">
    <meta property="og:url" content="https://odmailsu.vercel.app">
    <meta property="og:type" content="website">
    <link rel="canonical" href="https://odmailsu.vercel.app">
  `;
  
  // Insert meta tags before closing head tag
  html = html.replace('</head>', `${metaTags}</head>`);
  
  fs.writeFileSync(indexPath, html);
  console.log('✅ Updated index.html with SEO meta tags');
}

// Main function
function prerender() {
  updateIndexHTML();
  console.log('🎉 Prerendering completed');
}

prerender();
