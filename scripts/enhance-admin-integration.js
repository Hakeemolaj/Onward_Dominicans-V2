#!/usr/bin/env node

/**
 * Enhance Admin Dashboard Integration
 * Adds SSG generation hooks to the admin dashboard
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 Enhancing admin dashboard integration...');

// Add SSG generation button to admin dashboard
function enhanceAdminDashboard() {
  const adminPath = path.join(__dirname, '..', 'nyegaman.html');
  
  if (!fs.existsSync(adminPath)) {
    console.log('❌ Admin dashboard not found');
    return;
  }
  
  let html = fs.readFileSync(adminPath, 'utf8');
  
  // Check if SSG integration already exists
  if (html.includes('generateSSGPages')) {
    console.log('✅ Admin dashboard already has SSG integration');
    return;
  }
  
  // Add SSG generation button to the dashboard
  const ssgButton = `
    <!-- SSG Generation Button -->
    <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
            <div>
                <h3 class="text-lg font-semibold text-green-800 dark:text-green-200">SEO Static Pages</h3>
                <p class="text-sm text-green-600 dark:text-green-400">Generate static pages for better search engine indexing</p>
            </div>
            <button onclick="generateSSGPages()" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg btn-primary flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
                <span>Generate Static Pages</span>
            </button>
        </div>
    </div>`;
  
  // Insert after the dashboard header
  html = html.replace(
    /<div class="mb-8">\s*<h2[^>]*>Dashboard<\/h2>/,
    `<div class="mb-8">
                            <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-200">Dashboard</h2>${ssgButton}`
  );
  
  // Add SSG generation function
  const ssgFunction = `
        // SSG Generation Function
        window.generateSSGPages = async function() {
            const button = event.target.closest('button');
            const originalText = button.innerHTML;
            
            try {
                button.innerHTML = '<div class="spinner inline-block mr-2"></div>Generating...';
                button.disabled = true;
                
                // Call the SSG generation endpoint or script
                const response = await fetch('/api/generate-ssg', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    adminDashboard.showToast('✅ Static pages generated successfully!', 'success');
                } else {
                    throw new Error('Generation failed');
                }
                
            } catch (error) {
                console.error('SSG Generation error:', error);
                adminDashboard.showToast('❌ Failed to generate static pages', 'error');
            } finally {
                button.innerHTML = originalText;
                button.disabled = false;
            }
        };`;
  
  // Insert the function before the closing script tag
  html = html.replace(
    /(\s*)(\/\/ Initialize the admin dashboard)/,
    `$1${ssgFunction}$1$1$2`
  );
  
  fs.writeFileSync(adminPath, html);
  console.log('✅ Enhanced admin dashboard with SSG integration');
}

// Main function
function enhance() {
  enhanceAdminDashboard();
  console.log('🎉 Admin dashboard enhancement completed');
}

enhance();
