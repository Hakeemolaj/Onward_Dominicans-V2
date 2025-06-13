#!/usr/bin/env node

/**
 * Preserve Admin Dashboard During Next.js Migration
 * Ensures the admin dashboard remains functional
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 Preserving admin dashboard during Next.js migration...');

// Copy admin dashboard files to Next.js public directory
function preserveAdminDashboard() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Copy nyegaman.html to public directory
  const adminDashboardSource = path.join(__dirname, '..', 'nyegaman.html');
  const adminDashboardDest = path.join(publicDir, 'nyegaman.html');
  
  if (fs.existsSync(adminDashboardSource)) {
    fs.copyFileSync(adminDashboardSource, adminDashboardDest);
    console.log('✅ Copied admin dashboard to public/nyegaman.html');
  } else {
    console.log('⚠️  Admin dashboard not found at nyegaman.html');
  }
  
  // Copy API regeneration function
  const apiDir = path.join(publicDir, 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  const apiSource = path.join(__dirname, '..', 'api', 'regenerate-ssg.js');
  const apiDest = path.join(apiDir, 'regenerate-ssg.js');
  
  if (fs.existsSync(apiSource)) {
    fs.copyFileSync(apiSource, apiDest);
    console.log('✅ Copied API regeneration function');
  }
  
  // Copy other static assets
  const staticAssets = [
    'favicon.ico',
    'robots.txt',
    'sitemap.xml',
    'humans.txt',
    'site.webmanifest',
    'BingSiteAuth.xml',
    'google25e0604217c35b35.html'
  ];
  
  staticAssets.forEach(asset => {
    const sourcePath = path.join(__dirname, '..', asset);
    const destPath = path.join(publicDir, asset);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${asset}`);
    }
  });
}

// Update Next.js configuration to handle admin dashboard
function updateNextConfig() {
  const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
  
  if (!fs.existsSync(nextConfigPath)) {
    console.log('⚠️  Next.js config not found');
    return;
  }
  
  let config = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Check if admin dashboard rewrites are already present
  if (config.includes('nyegaman.html')) {
    console.log('✅ Admin dashboard rewrites already configured');
    return;
  }
  
  // Add admin dashboard rewrites
  const adminRewrites = `
      // Preserve admin dashboard
      {
        source: '/nyegaman',
        destination: '/nyegaman.html',
      },
      {
        source: '/nyegaman.html',
        destination: '/nyegaman.html',
      },
      // API routes for admin dashboard
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },`;
  
  // Insert admin rewrites into the rewrites function
  config = config.replace(
    /async rewrites\(\) \{\s*return \[/,
    `async rewrites() {
    return [${adminRewrites}`
  );
  
  fs.writeFileSync(nextConfigPath, config);
  console.log('✅ Updated Next.js config with admin dashboard rewrites');
}

// Create a hybrid build script
function createHybridBuildScript() {
  const hybridBuildScript = `#!/usr/bin/env node

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
}`;

  const scriptPath = path.join(__dirname, 'hybrid-build.js');
  fs.writeFileSync(scriptPath, hybridBuildScript);
  console.log('✅ Created hybrid build script');
}

// Main function
function preserveAdmin() {
  preserveAdminDashboard();
  updateNextConfig();
  createHybridBuildScript();
  console.log('🎉 Admin dashboard preservation completed');
}

preserveAdmin();
