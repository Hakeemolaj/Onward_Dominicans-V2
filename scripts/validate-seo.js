#!/usr/bin/env node

/**
 * SEO Validation Script
 * Validates SEO implementation and provides recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateSEO() {
  console.log('🔍 Validating SEO implementation...');
  
  const issues = [];
  const recommendations = [];
  
  // Check if sitemap exists
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    issues.push('❌ sitemap.xml not found');
  } else {
    console.log('✅ sitemap.xml found');
  }
  
  // Check if robots.txt exists
  const robotsPath = path.join(__dirname, '../public/robots.txt');
  if (!fs.existsSync(robotsPath)) {
    issues.push('❌ robots.txt not found');
  } else {
    console.log('✅ robots.txt found');
  }
  
  // Check index.html for meta tags
  const indexPath = path.join(__dirname, '../index.html');
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    if (!indexContent.includes('meta name="description"')) {
      issues.push('❌ Meta description not found in index.html');
    } else {
      console.log('✅ Meta description found');
    }
    
    if (!indexContent.includes('og:title')) {
      issues.push('❌ Open Graph title not found');
    } else {
      console.log('✅ Open Graph tags found');
    }
    
    if (!indexContent.includes('application/ld+json')) {
      issues.push('❌ Structured data not found');
    } else {
      console.log('✅ Structured data found');
    }
  }
  
  // Summary
  console.log('\n📊 SEO Validation Summary:');
  console.log('✅ Passed: ' + (3 - issues.length) + ' checks');
  console.log('❌ Failed: ' + issues.length + ' checks');
  
  if (issues.length > 0) {
    console.log('\n🔧 Issues to fix:');
    issues.forEach(issue => console.log(issue));
  }
  
  if (recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    recommendations.forEach(rec => console.log(rec));
  }
  
  console.log('\n🚀 Next steps:');
  console.log('1. Set up Google Search Console');
  console.log('2. Set up Google Analytics');
  console.log('3. Submit sitemap to search engines');
  console.log('4. Monitor search performance');
}

validateSEO();