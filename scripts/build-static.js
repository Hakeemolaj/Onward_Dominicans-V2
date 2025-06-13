#!/usr/bin/env node

/**
 * Static Site Generation Script
 * 
 * This script handles static site generation for SEO purposes.
 * It can run react-snap locally but skips it in CI/CD environments
 * where Chrome dependencies might not be available.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
  
  // Generate additional static files if needed
  if (fs.existsSync('scripts/generate-static-pages.js')) {
    console.log('📄 Generating additional static pages...');
    try {
      execSync('node scripts/generate-static-pages.js', { stdio: 'inherit' });
    } catch (error) {
      console.warn('⚠️  Static page generation failed:', error.message);
    }
  }
  
  console.log('🎉 Build process completed!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
