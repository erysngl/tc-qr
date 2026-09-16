self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Service worker aktif tutucu
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
