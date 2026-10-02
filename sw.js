const C = 'tc-v3';
const PRE = ['./', 'index.html', 'manifest.json',
  'lib/tesseract.min.js', 'lib/worker.min.js', 'lib/qrcode.min.js',
  'lib/tesseract-core-simd-lstm.wasm.js', 'lib/tesseract-core-lstm.wasm.js',
  'lib/eng.traineddata.gz'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => Promise.all(PRE.map(u => c.add(u).catch(() => {})))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).then(res => {
      if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(C).then(c => c.put(e.request, cp)); }
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
