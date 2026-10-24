const CACHE_PREFIX = 'datacenter-omnia-';
const SHELL_CACHE = `${CACHE_PREFIX}shell-20261024-workforce-filters-v5`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-20261024-workforce-filters-v5`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/styles.css?v=20261024_workforce_filters_v3',
  '/offline-sync.js?v=20261021_1',
  '/inventory.js?v=20261017_4',
  '/cautelas.js?v=20261021_offline_sync_v1',
  '/radios.js?v=20261023_workforce_source_v1',
  '/spools.js?v=20261022_spool_bulk_edit_v1',
  '/qr-scanner.js?v=20261017_1',
  '/app.js?v=20261024_workforce_filters_v5',
  '/exceljs.min.js',
  '/assets/workforce-seed.json',
  '/assets/heating-cooling-logo.png',
  '/assets/heating-cooling-logo.jpg',
  '/assets/afonso-franca-logo.png',
  '/assets/formularios/FOR-ALM-5.1-check-list-de-equipamentos-rev01.xlsx',
  '/assets/icons/datacenter-omnia-192.png',
  '/assets/icons/datacenter-omnia-512.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/vendor/html5-qrcode.min.js',
  '/Modelo_Importacao_Spools_Lista_Suspensa.xlsx',
  '/Planilha_Spools_SUPERCORE_DH04.xlsx'
];

const OPTIONAL_LIBRARIES = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(APP_SHELL);
    await Promise.allSettled(OPTIONAL_LIBRARIES.map(url => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith(CACHE_PREFIX) && ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request, fallbackUrl = '') {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl, { ignoreSearch: true });
      if (fallback) return fallback;
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && (response.ok || response.type === 'opaque')) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.hostname.endsWith('.supabase.co')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, '/index.html'));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (['script', 'style', 'font'].includes(request.destination)) {
    event.respondWith(networkFirst(request));
  }
});
