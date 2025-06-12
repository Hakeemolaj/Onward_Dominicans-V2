#!/usr/bin/env node

/**
 * Update Tracking Codes Script
 * Helps you easily update Google Analytics, Search Console, and Bing verification codes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function updateGoogleAnalytics() {
  log('\n📊 Google Analytics Setup', 'blue');
  log('1. Go to https://analytics.google.com/', 'cyan');
  log('2. Create a new GA4 property for your website', 'cyan');
  log('3. Get your Measurement ID (format: G-XXXXXXXXXX)', 'cyan');
  
  const gaId = await askQuestion('\nEnter your Google Analytics Measurement ID (or press Enter to skip): ');
  
  if (gaId && gaId.startsWith('G-')) {
    const indexPath = path.join(__dirname, '../index.html');
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Replace GA tracking ID
    indexContent = indexContent.replace(/G-XXXXXXXXXX/g, gaId);
    
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    log(`✅ Updated Google Analytics ID to: ${gaId}`, 'green');
  } else if (gaId) {
    log('❌ Invalid Google Analytics ID format. Should start with G-', 'red');
  } else {
    log('⏭️  Skipped Google Analytics setup', 'yellow');
  }
}

async function updateGoogleSearchConsole() {
  log('\n🔍 Google Search Console Setup', 'blue');
  log('1. Go to https://search.google.com/search-console', 'cyan');
  log('2. Add your property: https://onward-dominicans.vercel.app', 'cyan');
  log('3. Choose HTML file verification method', 'cyan');
  log('4. Download the verification file', 'cyan');
  
  const hasFile = await askQuestion('\nDo you have the Google verification HTML file? (y/n): ');
  
  if (hasFile.toLowerCase() === 'y') {
    const fileName = await askQuestion('Enter the verification filename (e.g., google1234567890abcdef.html): ');
    
    if (fileName && fileName.startsWith('google') && fileName.endsWith('.html')) {
      log(`\n📝 Instructions to complete setup:`, 'yellow');
      log(`1. Copy your file ${fileName} to the public/ folder`, 'cyan');
      log(`2. Delete the placeholder file: public/google[YOUR_VERIFICATION_CODE].html`, 'cyan');
      log(`3. Deploy your site`, 'cyan');
      log(`4. Go back to Search Console and click "Verify"`, 'cyan');
      log(`5. Submit sitemap: https://onward-dominicans.vercel.app/sitemap.xml`, 'cyan');
    } else {
      log('❌ Invalid filename format', 'red');
    }
  } else {
    log('⏭️  Complete Google Search Console setup first', 'yellow');
  }
}

async function updateBingWebmaster() {
  log('\n🔍 Bing Webmaster Tools Setup', 'blue');
  log('1. Go to https://www.bing.com/webmasters', 'cyan');
  log('2. Add your site: https://onward-dominicans.vercel.app', 'cyan');
  log('3. Choose XML File verification method', 'cyan');
  log('4. Copy the verification code', 'cyan');
  
  const bingCode = await askQuestion('\nEnter your Bing verification code (or press Enter to skip): ');
  
  if (bingCode && bingCode.length > 10) {
    const bingAuthPath = path.join(__dirname, '../public/BingSiteAuth.xml');
    let bingContent = fs.readFileSync(bingAuthPath, 'utf8');
    
    // Replace Bing verification code
    bingContent = bingContent.replace('YOUR_BING_VERIFICATION_CODE', bingCode);
    
    fs.writeFileSync(bingAuthPath, bingContent, 'utf8');
    log(`✅ Updated Bing verification code`, 'green');
  } else if (bingCode) {
    log('❌ Invalid Bing verification code', 'red');
  } else {
    log('⏭️  Skipped Bing Webmaster setup', 'yellow');
  }
}

async function main() {
  log('🚀 SEO Tracking Codes Setup Assistant', 'blue');
  log('=====================================', 'blue');
  
  try {
    await updateGoogleAnalytics();
    await updateGoogleSearchConsole();
    await updateBingWebmaster();
    
    log('\n🎉 Setup Complete!', 'green');
    log('=====================================', 'green');
    
    log('\n📋 Next Steps:', 'blue');
    log('1. Deploy your site with the updated codes', 'cyan');
    log('2. Verify ownership in Google Search Console', 'cyan');
    log('3. Verify ownership in Bing Webmaster Tools', 'cyan');
    log('4. Submit your sitemaps to both platforms', 'cyan');
    log('5. Monitor your analytics and search performance', 'cyan');
    
    log('\n🔗 Quick Links:', 'blue');
    log('• Google Analytics: https://analytics.google.com/', 'cyan');
    log('• Google Search Console: https://search.google.com/search-console', 'cyan');
    log('• Bing Webmaster Tools: https://www.bing.com/webmasters', 'cyan');
    
  } catch (error) {
    log('❌ Error during setup: ' + error.message, 'red');
  } finally {
    rl.close();
  }
}

main();
