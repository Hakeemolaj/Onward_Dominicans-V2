#!/usr/bin/env node

/**
 * Sitemap Validation Script
 * Validates XML sitemap format and checks for common issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Sitemap Validation Tool\n');

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

function validateSitemap(filePath, sitemapType = 'regular') {
  console.log(`📄 Validating ${sitemapType} sitemap: ${path.basename(filePath)}`);
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ Sitemap file not found');
    return false;
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.log('❌ Could not read sitemap file');
    return false;
  }

  let isValid = true;
  let urlCount = 0;

  // Check XML declaration
  if (!content.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
    console.log('⚠️  Missing or incorrect XML declaration');
    isValid = false;
  } else {
    console.log('✅ XML declaration correct');
  }

  // Check namespace
  if (sitemapType === 'regular') {
    if (!content.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
      console.log('⚠️  Missing or incorrect sitemap namespace');
      isValid = false;
    } else {
      console.log('✅ Sitemap namespace correct');
    }
  } else if (sitemapType === 'news') {
    if (!content.includes('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"')) {
      console.log('⚠️  Missing or incorrect news sitemap namespace');
      isValid = false;
    } else {
      console.log('✅ News sitemap namespace correct');
    }
  }

  // Count URLs
  const urlMatches = content.match(/<url>/g);
  if (urlMatches) {
    urlCount = urlMatches.length;
    console.log(`📊 Found ${urlCount} URLs`);
  }

  // Check for common issues
  const issues = [];

  // Check for fragment URLs (not allowed in sitemaps)
  if (content.includes('#')) {
    issues.push('Fragment URLs (#) found - these are not allowed in sitemaps');
  }

  // Check for proper date format
  const dateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}/;
  const lastmodTags = content.match(/<lastmod>([^<]+)<\/lastmod>/g);
  if (lastmodTags) {
    let invalidDates = 0;
    lastmodTags.forEach(tag => {
      const date = tag.replace(/<\/?lastmod>/g, '');
      if (!dateRegex.test(date) && !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        invalidDates++;
      }
    });
    if (invalidDates > 0) {
      issues.push(`${invalidDates} invalid date format(s) found`);
    } else {
      console.log('✅ Date formats are valid');
    }
  }

  // Check for valid URLs
  const locTags = content.match(/<loc>([^<]+)<\/loc>/g);
  if (locTags) {
    let invalidUrls = 0;
    locTags.forEach(tag => {
      const url = tag.replace(/<\/?loc>/g, '');
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        invalidUrls++;
      }
    });
    if (invalidUrls > 0) {
      issues.push(`${invalidUrls} invalid URL(s) found`);
    } else {
      console.log('✅ All URLs are valid');
    }
  }

  // Check for proper XML structure
  if (!content.includes('<urlset') || !content.includes('</urlset>')) {
    issues.push('Missing urlset tags');
  }

  // Report issues
  if (issues.length > 0) {
    console.log('\n⚠️  Issues found:');
    issues.forEach(issue => console.log(`   • ${issue}`));
    isValid = false;
  }

  // Size check
  const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
  console.log(`📏 Sitemap size: ${sizeKB.toFixed(2)} KB`);
  
  if (sizeKB > 50000) { // 50MB limit
    console.log('⚠️  Sitemap is very large (>50MB)');
    isValid = false;
  }

  if (urlCount > 50000) {
    console.log('⚠️  Too many URLs (>50,000)');
    isValid = false;
  }

  return { isValid, urlCount, sizeKB };
}

// Validate main sitemap
const mainSitemap = path.join(publicDir, 'sitemap.xml');
const mainResult = validateSitemap(mainSitemap, 'regular');

console.log('\n' + '='.repeat(50) + '\n');

// Validate news sitemap
const newsSitemap = path.join(publicDir, 'news-sitemap.xml');
const newsResult = validateSitemap(newsSitemap, 'news');

console.log('\n' + '='.repeat(50) + '\n');

// Summary
console.log('📋 VALIDATION SUMMARY');
console.log('='.repeat(20));

if (mainResult.isValid) {
  console.log('✅ Main sitemap is valid');
} else {
  console.log('❌ Main sitemap has issues');
}

if (newsResult.isValid) {
  console.log('✅ News sitemap is valid');
} else {
  console.log('❌ News sitemap has issues');
}

console.log(`📊 Total URLs: ${(mainResult.urlCount || 0) + (newsResult.urlCount || 0)}`);

if (mainResult.isValid && newsResult.isValid) {
  console.log('\n🎉 All sitemaps are ready for Google Search Console!');
  console.log('\n📝 Next steps:');
  console.log('1. Go to Google Search Console');
  console.log('2. Submit sitemap.xml');
  console.log('3. Submit news-sitemap.xml');
  console.log('4. Monitor indexing status');
} else {
  console.log('\n⚠️  Please fix the issues above before submitting to Google Search Console');
}

console.log('\n🔗 Test your sitemaps online:');
console.log('• https://www.xml-sitemaps.com/validate-xml-sitemap.html');
console.log('• https://support.google.com/webmasters/answer/7451001');
