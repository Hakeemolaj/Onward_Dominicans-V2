#!/usr/bin/env node

/**
 * Post Google Search Console Verification Checklist
 * Run this script to validate your SEO setup after verification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎉 Google Search Console Post-Verification Checklist\n');

// Check if running from project root
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const distDir = path.join(projectRoot, 'dist');

let score = 0;
let totalChecks = 0;

function checkItem(description, condition, recommendation = '') {
  totalChecks++;
  if (condition) {
    console.log(`✅ ${description}`);
    score++;
  } else {
    console.log(`❌ ${description}`);
    if (recommendation) {
      console.log(`   💡 ${recommendation}`);
    }
  }
}

console.log('📋 Checking SEO Files and Configuration...\n');

// Check sitemap files
checkItem(
  'Main sitemap exists',
  fs.existsSync(path.join(publicDir, 'sitemap.xml')),
  'Run: npm run seo:sitemap to generate sitemap'
);

checkItem(
  'News sitemap exists',
  fs.existsSync(path.join(publicDir, 'news-sitemap.xml')),
  'News sitemap should be automatically generated'
);

checkItem(
  'Robots.txt exists',
  fs.existsSync(path.join(publicDir, 'robots.txt')),
  'Create robots.txt in public directory'
);

// Check Google verification file
const googleVerificationExists = fs.readdirSync(publicDir)
  .some(file => file.startsWith('google') && file.endsWith('.html'));

checkItem(
  'Google Search Console verification file exists',
  googleVerificationExists,
  'Download verification file from Google Search Console'
);

// Check index.html for analytics
let indexContent = '';
try {
  indexContent = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
} catch (error) {
  console.log('❌ Could not read index.html');
}

checkItem(
  'Google Analytics tracking code present',
  indexContent.includes('gtag') && indexContent.includes('G-'),
  'Add Google Analytics 4 tracking code to index.html'
);

checkItem(
  'Meta description present',
  indexContent.includes('meta name="description"'),
  'Add meta description to index.html'
);

checkItem(
  'Open Graph tags present',
  indexContent.includes('og:title') && indexContent.includes('og:description'),
  'Add Open Graph meta tags for social sharing'
);

checkItem(
  'Canonical URL present',
  indexContent.includes('rel="canonical"'),
  'Add canonical URL to prevent duplicate content issues'
);

// Check if build directory exists and has files
checkItem(
  'Build directory exists',
  fs.existsSync(distDir),
  'Run: npm run build to create production build'
);

if (fs.existsSync(distDir)) {
  const distFiles = fs.readdirSync(distDir);
  checkItem(
    'Built sitemap exists in dist',
    distFiles.includes('sitemap.xml'),
    'Ensure sitemap is copied to dist during build'
  );
}

console.log('\n📊 SEO Setup Score: ' + score + '/' + totalChecks);

if (score === totalChecks) {
  console.log('🎉 Perfect! Your SEO setup is complete.');
} else if (score >= totalChecks * 0.8) {
  console.log('✨ Great job! Just a few items to complete.');
} else if (score >= totalChecks * 0.6) {
  console.log('👍 Good progress! Address the remaining items.');
} else {
  console.log('⚠️  Several items need attention for optimal SEO.');
}

console.log('\n🚀 Next Steps After Verification:');
console.log('1. Submit sitemaps to Google Search Console');
console.log('2. Request indexing for key pages');
console.log('3. Set up Google Analytics properly');
console.log('4. Monitor search performance weekly');

console.log('\n📖 For detailed instructions, see: GOOGLE_SEARCH_CONSOLE_NEXT_STEPS.md');

// Generate quick action items
console.log('\n📝 Quick Action Items:');

if (!googleVerificationExists) {
  console.log('• Download and add Google verification file to public/ directory');
}

if (!indexContent.includes('G-') || indexContent.includes('G-XXXXXXXXXX')) {
  console.log('• Update Google Analytics tracking ID in index.html');
}

if (!fs.existsSync(path.join(publicDir, 'sitemap.xml'))) {
  console.log('• Generate sitemap: npm run seo:sitemap');
}

console.log('• Submit sitemaps in Google Search Console dashboard');
console.log('• Use URL Inspection tool to request indexing for homepage');

console.log('\n🌟 Your Dominican community website is ready to shine in search results!');
