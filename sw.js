const CACHE_NAME = 'tcqr-offline-pro-v1';

// Uygulamanın internetsiz çalışması için gereken temel dosyalar
const OFFLINE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Dinamik Önbellekleme: Tesseract'ın sonradan indirdiği dil paketi ve WASM çekirdeğini yakala ve kaydet
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Çevrimdışıysa hemen cihazın önbelleğinden ver
      }
      return fetch(event.request).then((networkResponse) => {
        // İndirilen her yeni kütüphane dosyasını (dil paketi vb.) offline için sakla
        if (
          event.request.method === 'GET' &&
          (networkResponse.status === 200 || networkResponse.type === 'opaque')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // İnternet tamamen kapalıysa önbellekten dönmeyi dene
        return caches.match(event.request);
      });
    })
  );
});
