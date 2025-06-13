// Service Worker for Onward Dominicans PWA
// Provides offline functionality, caching, and background sync

const CACHE_NAME = 'onward-dominicans-v2.0.0';
const STATIC_CACHE = 'static-v2.0.0';
const DYNAMIC_CACHE = 'dynamic-v2.0.0';
const API_CACHE = 'api-v2.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/news',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  // Add critical CSS and JS files here
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/health',
  '/api/articles',
  '/api/categories',
  '/api/authors'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with cache fallback
    event.respondWith(handleApiRequest(request));
  } else if (isStaticAsset(url.pathname)) {
    // Static assets - Cache First
    event.respondWith(handleStaticAsset(request));
  } else {
    // Pages - Stale While Revalidate
    event.respondWith(handlePageRequest(request));
  }
});

// Handle API requests - Network First strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
      console.log('🌐 API Network response cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('📱 API Network failed, trying cache:', request.url);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('💾 API Cache hit:', request.url);
      return cachedResponse;
    }
    
    // No cache available, return offline response
    console.log('❌ API No cache available:', request.url);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Offline - no cached data available',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets - Cache First strategy
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('💾 Static cache hit:', request.url);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('🌐 Static asset cached:', request.url);
    }
    return networkResponse;
  } catch (error) {
    console.log('❌ Static asset failed:', request.url);
    throw error;
  }
}

// Handle page requests - Stale While Revalidate strategy
async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Start network request (don't await)
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        console.log('🌐 Page updated in cache:', request.url);
      }
      return response;
    })
    .catch((error) => {
      console.log('❌ Page network failed:', request.url);
      throw error;
    });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    console.log('💾 Page cache hit (stale while revalidate):', request.url);
    return cachedResponse;
  }
  
  // No cache, wait for network
  try {
    return await networkPromise;
  } catch (error) {
    // Network failed and no cache, return offline page
    console.log('📱 Returning offline page for:', request.url);
    return caches.match('/offline.html');
  }
}

// Helper function to check if URL is a static asset
function isStaticAsset(pathname) {
  return pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-form') {
    event.waitUntil(syncFormData());
  }
});

// Sync form data when back online
async function syncFormData() {
  try {
    // Get pending form submissions from IndexedDB
    const pendingForms = await getPendingForms();
    
    for (const form of pendingForms) {
      try {
        const response = await fetch(form.url, {
          method: form.method,
          headers: form.headers,
          body: form.body
        });
        
        if (response.ok) {
          await removePendingForm(form.id);
          console.log('✅ Form synced successfully:', form.id);
        }
      } catch (error) {
        console.log('❌ Form sync failed:', form.id, error);
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// IndexedDB helpers for offline form storage
async function getPendingForms() {
  // Implement IndexedDB logic to retrieve pending forms
  return [];
}

async function removePendingForm(id) {
  // Implement IndexedDB logic to remove synced form
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
  
  const options = {
    body: 'New content available on Onward Dominicans!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Content',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('Onward Dominicans', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});

console.log('🎉 Service Worker loaded successfully');
