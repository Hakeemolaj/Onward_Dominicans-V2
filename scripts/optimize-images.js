#!/usr/bin/env node

/**
 * Image Optimization for SSG
 * Optimizes images and adds lazy loading
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🖼️  Starting image optimization...');

// Configuration
const config = {
  outputDir: 'dist',
  baseUrl: 'https://odmailsu.vercel.app'
};

// Generate optimized image HTML with lazy loading
function generateOptimizedImageHTML(src, alt, className = '') {
  // Check if it's an external image
  const isExternal = src.startsWith('http');
  
  // Generate different sizes for responsive images
  const sizes = [400, 800, 1200];
  
  if (isExternal) {
    // For external images, use lazy loading and optimization services
    return `
      <img 
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f1f5f9'/%3E%3C/svg%3E"
        data-src="${src}"
        alt="${alt}"
        class="lazy-load ${className}"
        loading="lazy"
        decoding="async"
        onload="this.classList.add('loaded')"
        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 800 600\\'%3E%3Crect width=\\'800\\' height=\\'600\\' fill=\\'%23e2e8f0\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'%2364748b\\'%3EImage not available%3C/text%3E%3C/svg%3E'"
      >`;
  } else {
    // For local images, generate responsive srcset
    const srcset = sizes.map(size => `${src}?w=${size} ${size}w`).join(', ');
    
    return `
      <img 
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f1f5f9'/%3E%3C/svg%3E"
        data-src="${src}"
        data-srcset="${srcset}"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        alt="${alt}"
        class="lazy-load ${className}"
        loading="lazy"
        decoding="async"
        onload="this.classList.add('loaded')"
      >`;
  }
}

// Add lazy loading CSS and JavaScript
function generateLazyLoadingAssets() {
  const css = `
/* Lazy Loading Styles */
.lazy-load {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  background-color: #f1f5f9;
  background-image: linear-gradient(45deg, #f1f5f9 25%, transparent 25%), 
                    linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #f1f5f9 75%), 
                    linear-gradient(-45deg, transparent 75%, #f1f5f9 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  animation: loading-shimmer 1.5s infinite linear;
}

.lazy-load.loaded {
  opacity: 1;
  background: none;
  animation: none;
}

@keyframes loading-shimmer {
  0% { background-position: 0 0, 0 10px, 10px -10px, -10px 0px; }
  100% { background-position: 20px 20px, 20px 30px, 30px 10px, 10px 20px; }
}

/* Image optimization */
img {
  max-width: 100%;
  height: auto;
}

.image-container {
  position: relative;
  overflow: hidden;
}

.image-container::before {
  content: '';
  display: block;
  padding-top: 56.25%; /* 16:9 aspect ratio */
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
`;

  const js = `
// Lazy Loading JavaScript
(function() {
  'use strict';
  
  // Intersection Observer for lazy loading
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        // Load the actual image
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
        
        // Remove data attributes
        delete img.dataset.src;
        delete img.dataset.srcset;
        
        // Stop observing this image
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });
  
  // Observe all lazy-load images
  function initLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-load');
    lazyImages.forEach(img => imageObserver.observe(img));
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
  } else {
    initLazyLoading();
  }
  
  // Fallback for browsers without Intersection Observer
  if (!('IntersectionObserver' in window)) {
    const lazyImages = document.querySelectorAll('.lazy-load');
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
      img.classList.add('loaded');
    });
  }
})();
`;

  return { css, js };
}

// Optimize HTML files with lazy loading
function optimizeHTMLFiles() {
  console.log('🔧 Optimizing HTML files with lazy loading...');
  
  const { css, js } = generateLazyLoadingAssets();
  
  // Find all HTML files in dist
  const htmlFiles = [];
  
  function findHTMLFiles(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findHTMLFiles(filePath);
      } else if (file.endsWith('.html')) {
        htmlFiles.push(filePath);
      }
    });
  }
  
  findHTMLFiles(config.outputDir);
  
  console.log(`📄 Found ${htmlFiles.length} HTML files to optimize`);
  
  htmlFiles.forEach(filePath => {
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Add lazy loading CSS
    html = html.replace('</head>', `<style>${css}</style></head>`);
    
    // Add lazy loading JavaScript
    html = html.replace('</body>', `<script>${js}</script></body>`);
    
    // Optimize existing img tags
    html = html.replace(/<img([^>]+)>/g, (match, attributes) => {
      // Extract src and alt attributes
      const srcMatch = attributes.match(/src="([^"]+)"/);
      const altMatch = attributes.match(/alt="([^"]+)"/);
      const classMatch = attributes.match(/class="([^"]+)"/);
      
      if (srcMatch) {
        const src = srcMatch[1];
        const alt = altMatch ? altMatch[1] : '';
        const className = classMatch ? classMatch[1] : '';
        
        // Skip if already optimized
        if (attributes.includes('lazy-load')) {
          return match;
        }
        
        return generateOptimizedImageHTML(src, alt, className);
      }
      
      return match;
    });
    
    fs.writeFileSync(filePath, html);
  });
  
  console.log(`✅ Optimized ${htmlFiles.length} HTML files with lazy loading`);
}

// Main optimization function
function optimizeImages() {
  optimizeHTMLFiles();
  console.log('🎉 Image optimization completed');
}

optimizeImages();
