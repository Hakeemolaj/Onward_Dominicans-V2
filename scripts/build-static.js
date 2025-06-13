#!/usr/bin/env node

/**
 * Static Site Generation Script
 * 
 * This script handles static site generation for SEO purposes.
 * It can run react-snap locally but skips it in CI/CD environments
 * where Chrome dependencies might not be available.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Check if we're in a CI environment
const isCI = process.env.CI || process.env.VERCEL || process.env.NETLIFY;

console.log('🏗️  Building static site...');
console.log(`Environment: ${isCI ? 'CI/CD' : 'Local'}`);

try {
  // Always run the regular build first
  console.log('📦 Running Vite build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  if (!isCI) {
    // Only run react-snap locally where Chrome is available
    console.log('🕷️  Running react-snap for static generation...');
    try {
      execSync('npx react-snap', { stdio: 'inherit' });
      console.log('✅ Static site generation completed successfully!');
    } catch (snapError) {
      console.warn('⚠️  react-snap failed, but build will continue...');
      console.warn('This is normal in environments without Chrome/Puppeteer support.');
    }
  } else {
    console.log('⏭️  Skipping react-snap in CI environment');
    console.log('💡 For SEO benefits, consider using a different SSG approach');
  }
  
  // Generate enhanced SSG pages from admin dashboard content
  console.log('📄 Generating enhanced SSG pages from admin dashboard...');
  try {
    execSync('node scripts/generate-ssg-pages.js', { stdio: 'inherit' });
    console.log('✅ SSG pages generated successfully');
  } catch (error) {
    console.warn('⚠️  SSG page generation failed:', error.message);
  }

  // Run prerendering for better SEO
  console.log('🔄 Running prerendering...');
  try {
    execSync('node scripts/prerender-pages.js', { stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️  Prerendering failed:', error.message);
  }

  // Optimize images and add lazy loading
  console.log('🖼️  Optimizing images...');
  try {
    execSync('node scripts/optimize-images.js', { stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️  Image optimization failed:', error.message);
  }
  
  console.log('🎉 Build process completed!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
