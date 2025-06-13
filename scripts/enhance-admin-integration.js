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
                <p class="text-sm text-green-600 dark:text-green-400">Regenerate static pages with latest content for better SEO</p>
                <p class="text-xs text-green-500 dark:text-green-500 mt-1">Includes: Article pages, Category pages, Search index, Sitemap</p>
            </div>
            <button onclick="generateSSGPages()" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg btn-primary flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
                <span>Regenerate Site</span>
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
                button.innerHTML = '<div class="spinner inline-block mr-2"></div>Regenerating...';
                button.disabled = true;

                // Call the SSG regeneration API endpoint
                const response = await fetch('/api/regenerate-ssg', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer default-token'
                    },
                    body: JSON.stringify({
                        trigger: 'admin-dashboard',
                        timestamp: new Date().toISOString()
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    adminDashboard.showToast('✅ Static pages regeneration triggered! Site will update in ~2 minutes.', 'success');
                } else {
                    throw new Error(result.error || 'Generation failed');
                }

            } catch (error) {
                console.error('SSG Generation error:', error);
                adminDashboard.showToast('❌ Failed to trigger static page regeneration: ' + error.message, 'error');
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
