const CACHE_NAME = 'datacenter-omnia-v3';
const APP_SHELL = [
  '/',
  '/index.html',
  '/styles.css?v=20260918_3',
  '/app.js?v=20260918_29',
  '/manifest.webmanifest',
  '/assets/heating-cooling-logo.png',
  '/assets/heating-cooling-logo.jpg',
  '/assets/afonso-franca-logo.png',
  '/assets/workforce-seed.json',
  '/assets/vendor/html5-qrcode.min.js',
  '/assets/icons/datacenter-omnia-192.png',
  '/assets/icons/datacenter-omnia-512.png',
  '/assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(APP_SHELL.map(url => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') return caches.match('/index.html');
        throw new Error('Conteudo indisponivel sem conexao.');
      })
  );
});
