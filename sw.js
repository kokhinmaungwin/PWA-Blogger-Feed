const CACHE_NAME = 'blogger-feed-pwa-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/icon-192.png', 
  './icons/icon-512.png',
  './offline.html' 
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/feeds/posts/summary')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./offline.html'))
    );
    return;  
  }

  self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResp => {
      return cachedResp || fetch(event.request).then(networkResp => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResp.clone());
          return networkResp;
        });
      }).catch(() => caches.match('./offline.html'));
    })
  );
});
