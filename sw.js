const CACHE_NAME = 's21-pro-v1';
const ASSETS = [
  'index.html',
  'manifest.json',
  'icona-192.png',
  'icona-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});