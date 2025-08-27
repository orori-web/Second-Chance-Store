const CACHE_NAME = 'second-chance-store-v1';
const ASSETS_TO_CACHE = [
  '/', // root
  '/index1.html',
  '/styles/styles1.css',
  '/styles/styles2.css',
  '/styles/productswrapper.css',
  '/styles/modal.css',
  '/scripts/products2.js',
  '/scripts/search.js',
  '/icon-192.png',
  '/icon-512.png',
  // Remove external image URLs like placeholder.com — causes fetch errors
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching all files');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(err => {
        console.error('[Service Worker] Failed to cache:', err);
      })
  );
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
      .catch(err => {
        console.error('[Service Worker] Fetch failed:', err);
      })
  );
});
