// Nome della cache - incrementa la versione (es. v2) ogni volta che modifichi i file
const CACHE_NAME = 'jw-segreteria-v2';

// Elenco dei file da salvare per l'utilizzo offline
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icona-192.png',
  // Percorsi dei template nella sottocartella GitHub
  './templates/S-21_I.pdf',
  './templates/S-88_1.pdf'
];

// Installazione: crea la cache e salva i file
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta: salvataggio file in corso');
        return cache.addAll(urlsToCache);
      })
  );
  // Forza il Service Worker attivo a prendere il controllo immediatamente
  self.skipWaiting();
});

// Attivazione: pulisce le vecchie versioni della cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Rimozione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch: serve i file dalla cache se disponibili, altrimenti scarica da rete
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se il file è in cache, lo restituisce
        if (response) {
          return response;
        }
        // Altrimenti prova a scaricarlo
        return fetch(event.request);
      }
    )
  );
});
