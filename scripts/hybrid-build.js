#!/usr/bin/env node

/**
 * Hybrid Build Script
 * Builds both Next.js app and preserves admin dashboard
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🏗️  Starting hybrid build (Next.js + Admin Dashboard)...');

try {
  // Build Next.js app
  console.log('📦 Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  
  // Preserve admin dashboard
  console.log('🔧 Preserving admin dashboard...');
  execSync('node scripts/preserve-admin-dashboard.js', { stdio: 'inherit' });
  
  // Generate SSG pages
  console.log('📄 Generating SSG pages...');
  execSync('node scripts/generate-ssg-pages.js', { stdio: 'inherit' });
  
  // Copy admin dashboard to Next.js output
  const outDir = 'out';
  const adminSource = 'public/nyegaman.html';
  const adminDest = path.join(outDir, 'nyegaman.html');
  
  if (fs.existsSync(adminSource) && fs.existsSync(outDir)) {
    fs.copyFileSync(adminSource, adminDest);
    console.log('✅ Copied admin dashboard to Next.js output');
  }
  
  console.log('🎉 Hybrid build completed successfully!');
  
} catch (error) {
  console.error('❌ Hybrid build failed:', error.message);
  process.exit(1);
}