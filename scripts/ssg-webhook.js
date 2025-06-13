#!/usr/bin/env node

/**
 * SSG Webhook Handler
 * Can be called from admin dashboard to regenerate static pages
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Simple webhook server for SSG generation
export function createSSGWebhook() {
  return async function(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
      console.log('🚀 SSG generation triggered from admin dashboard');
      
      // Run SSG generation
      execSync('node scripts/generate-ssg-pages.js', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log('✅ SSG generation completed');
      
      res.status(200).json({ 
        success: true, 
        message: 'Static pages generated successfully',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ SSG generation failed:', error);
      
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate static pages',
        details: error.message
      });
    }
  };
}

// For direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔄 Running SSG generation directly...');
  
  try {
    execSync('node scripts/generate-ssg-pages.js', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ Direct SSG generation completed');
  } catch (error) {
    console.error('❌ Direct SSG generation failed:', error);
    process.exit(1);
  }
}
