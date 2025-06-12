#!/usr/bin/env node

/**
 * SEO Setup Script for Onward Dominicans
 * Automates SEO configuration and generates necessary files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createGoogleSearchConsoleVerification() {
  log('📝 Creating Google Search Console verification file...', 'blue');
  
  const verificationContent = `google-site-verification: google[YOUR_VERIFICATION_CODE].html`;
  const verificationPath = path.join(__dirname, '../public/google[YOUR_VERIFICATION_CODE].html');
  
  // Create placeholder file
  fs.writeFileSync(verificationPath, verificationContent, 'utf8');
  log('✅ Google Search Console verification file created', 'green');
  log('⚠️  Remember to replace [YOUR_VERIFICATION_CODE] with actual code from Google Search Console', 'yellow');
}

function createBingWebmasterVerification() {
  log('📝 Creating Bing Webmaster Tools verification file...', 'blue');
  
  const bingVerificationContent = `<?xml version="1.0"?>
<users>
  <user>YOUR_BING_VERIFICATION_CODE</user>
</users>`;
  
  const bingVerificationPath = path.join(__dirname, '../public/BingSiteAuth.xml');
  fs.writeFileSync(bingVerificationPath, bingVerificationContent, 'utf8');
  log('✅ Bing Webmaster Tools verification file created', 'green');
  log('⚠️  Remember to replace YOUR_BING_VERIFICATION_CODE with actual code from Bing', 'yellow');
}

function createSecurityTxt() {
  log('📝 Creating security.txt file...', 'blue');
  
  const securityContent = `Contact: mailto:security@onwarddominicans.com
Expires: 2025-12-31T23:59:59.000Z
Encryption: https://onward-dominicans.vercel.app/pgp-key.txt
Preferred-Languages: en, es
Canonical: https://onward-dominicans.vercel.app/.well-known/security.txt
Policy: https://onward-dominicans.vercel.app/security-policy`;

  const wellKnownDir = path.join(__dirname, '../public/.well-known');
  if (!fs.existsSync(wellKnownDir)) {
    fs.mkdirSync(wellKnownDir, { recursive: true });
  }
  
  const securityPath = path.join(wellKnownDir, 'security.txt');
  fs.writeFileSync(securityPath, securityContent, 'utf8');
  log('✅ Security.txt file created', 'green');
}

function createHumansTxt() {
  log('📝 Creating humans.txt file...', 'blue');
  
  const humansContent = `/* TEAM */
Developer: Your Name
Contact: contact@onwarddominicans.com
Twitter: @onwarddominicans
From: United States

/* THANKS */
Dominican Community for inspiration and support
Open source contributors

/* SITE */
Last update: ${new Date().toISOString().split('T')[0]}
Language: English / Spanish
Doctype: HTML5
IDE: Visual Studio Code
Standards: HTML5, CSS3, JavaScript ES6+
Components: React, TypeScript, Tailwind CSS
Software: Vite, Node.js`;

  const humansPath = path.join(__dirname, '../public/humans.txt');
  fs.writeFileSync(humansPath, humansContent, 'utf8');
  log('✅ Humans.txt file created', 'green');
}

function updatePackageJsonWithSEOScripts() {
  log('📝 Adding SEO scripts to package.json...', 'blue');
  
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add SEO-related scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'seo:sitemap': 'node scripts/generate-sitemap.js',
    'seo:validate': 'node scripts/validate-seo.js',
    'seo:audit': 'lighthouse https://onward-dominicans.vercel.app --output=html --output-path=./seo-audit.html',
    'seo:setup': 'node scripts/seo-setup.js'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  log('✅ SEO scripts added to package.json', 'green');
}

function createSEOValidationScript() {
  log('📝 Creating SEO validation script...', 'blue');
  
  const validationScript = `#!/usr/bin/env node

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
  console.log('\\n📊 SEO Validation Summary:');
  console.log('✅ Passed: ' + (3 - issues.length) + ' checks');
  console.log('❌ Failed: ' + issues.length + ' checks');
  
  if (issues.length > 0) {
    console.log('\\n🔧 Issues to fix:');
    issues.forEach(issue => console.log(issue));
  }
  
  if (recommendations.length > 0) {
    console.log('\\n💡 Recommendations:');
    recommendations.forEach(rec => console.log(rec));
  }
  
  console.log('\\n🚀 Next steps:');
  console.log('1. Set up Google Search Console');
  console.log('2. Set up Google Analytics');
  console.log('3. Submit sitemap to search engines');
  console.log('4. Monitor search performance');
}

validateSEO();`;

  const validationPath = path.join(__dirname, 'validate-seo.js');
  fs.writeFileSync(validationPath, validationScript, 'utf8');
  log('✅ SEO validation script created', 'green');
}

function main() {
  log('🚀 Starting SEO setup for Onward Dominicans...', 'blue');
  log('================================================', 'blue');
  
  try {
    createGoogleSearchConsoleVerification();
    createBingWebmasterVerification();
    createSecurityTxt();
    createHumansTxt();
    updatePackageJsonWithSEOScripts();
    createSEOValidationScript();
    
    log('\\n🎉 SEO setup completed successfully!', 'green');
    log('================================================', 'green');
    
    log('\\n📋 Next steps:', 'blue');
    log('1. Replace placeholder verification codes with real ones', 'yellow');
    log('2. Set up Google Analytics (replace G-XXXXXXXXXX in index.html)', 'yellow');
    log('3. Submit your site to Google Search Console', 'yellow');
    log('4. Submit your site to Bing Webmaster Tools', 'yellow');
    log('5. Run: npm run seo:validate to check your setup', 'yellow');
    log('6. Run: npm run seo:sitemap to generate updated sitemap', 'yellow');
    
  } catch (error) {
    log('❌ Error during SEO setup: ' + error.message, 'red');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
