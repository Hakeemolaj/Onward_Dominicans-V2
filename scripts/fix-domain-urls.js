#!/usr/bin/env node

/**
 * Fix Domain URLs Script
 * Updates all URLs from onward-dominicans.vercel.app to odmailsu.vercel.app
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing Domain URLs...\n');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');

const OLD_DOMAIN = 'onward-dominicans.vercel.app';
const NEW_DOMAIN = 'odmailsu.vercel.app';

function updateFileUrls(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Replace all occurrences of the old domain
  content = content.replace(new RegExp(OLD_DOMAIN, 'g'), NEW_DOMAIN);
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${path.relative(projectRoot, filePath)}`);
    return true;
  } else {
    console.log(`ℹ️  No changes needed: ${path.relative(projectRoot, filePath)}`);
    return false;
  }
}

function updateAllFiles() {
  let updatedCount = 0;

  // Update article files
  const articleDir = path.join(distDir, 'article');
  if (fs.existsSync(articleDir)) {
    const articleFiles = fs.readdirSync(articleDir);
    articleFiles.forEach(file => {
      if (file.endsWith('.html')) {
        const filePath = path.join(articleDir, file);
        if (updateFileUrls(filePath)) {
          updatedCount++;
        }
      }
    });
  }

  // Update sitemap files
  const sitemapFiles = [
    path.join(distDir, 'sitemap.xml'),
    path.join(publicDir, 'sitemap.xml'),
    path.join(distDir, 'news-sitemap.xml'),
    path.join(publicDir, 'news-sitemap.xml')
  ];

  sitemapFiles.forEach(filePath => {
    if (updateFileUrls(filePath)) {
      updatedCount++;
    }
  });

  // Update any other HTML files that might contain the old domain
  const htmlFiles = [
    path.join(distDir, 'index.html'),
    path.join(distDir, 'nyegaman.html')
  ];

  htmlFiles.forEach(filePath => {
    if (updateFileUrls(filePath)) {
      updatedCount++;
    }
  });

  console.log(`\n🎉 Domain fix complete!`);
  console.log(`📊 Updated ${updatedCount} files`);
  console.log(`🔄 Changed all URLs from: ${OLD_DOMAIN}`);
  console.log(`✅ To: ${NEW_DOMAIN}`);
  
  return updatedCount;
}

// Run the fix
try {
  const updatedCount = updateAllFiles();
  
  if (updatedCount > 0) {
    console.log('\n📋 Next Steps:');
    console.log('1. Commit and push the changes');
    console.log('2. Test the corrected URLs');
    console.log('3. Submit updated sitemap to Google Search Console');
  }
} catch (error) {
  console.error('❌ Error fixing domain URLs:', error);
}
