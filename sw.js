const C = 'tc-v4';
const PRE = ['./', 'index.html', 'manifest.json',
  'lib/tesseract.min.js', 'lib/worker.min.js', 'lib/qrcode.min.js',
  'lib/tesseract-core-simd-lstm.wasm.js', 'lib/tesseract-core-lstm.wasm.js',
  'lib/eng.traineddata.gz'];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => Promise.all(PRE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url), own = u.origin === location.origin && !u.pathname.includes('/lib/');
  const net = () => fetch(e.request).then(res => { if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return res; });
  const cached = () => caches.match(e.request, { ignoreSearch: true });
  // Uygulama dosyaları: önce ağ (2.5 sn), zayıf çekimde önbellek. Kütüphaneler: önce önbellek.
  e.respondWith(own
    ? Promise.race([net(), new Promise((_, no) => setTimeout(no, 2500))]).catch(() => cached().then(r => r || caches.match('index.html')))
    : cached().then(r => r || net()));
});
