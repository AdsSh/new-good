const CACHE_VERSION = 'v1';
const PRECACHE = `permitflow-precache-${CACHE_VERSION}`;
const RUNTIME = `permitflow-runtime-${CACHE_VERSION}`;
const MANAGED_CACHES = [PRECACHE, RUNTIME];

const APP_SHELL_URLS = ['/', '/index.html', '/manifest.webmanifest'];
const NAVIGATION_FALLBACK = '/index.html';
const RUNTIME_MAX_ENTRIES = 200;

function isCacheable(response) {
  if (!response) return false;
  if (response.status === 206) return false;
  return response.ok || response.type === 'opaque';
}

function shouldBypass(request, url) {
  if (request.method !== 'GET') return true;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return true;
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return true;
  if (request.headers.has('range')) return true;
  if (url.pathname === '/sw.js') return true;

  return false;
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;

  const overflow = keys.slice(0, keys.length - maxEntries);
  await Promise.all(overflow.map((key) => cache.delete(key)));
}

async function storeInCache(cacheName, request, response) {
  if (!isCacheable(response)) return;

  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
    if (cacheName === RUNTIME) {
      await trimCache(RUNTIME, RUNTIME_MAX_ENTRIES);
    }
  } catch {
    return;
  }
}

async function fetchAndCache(cacheName, request) {
  const response = await fetch(request);
  if (isCacheable(response)) {
    await storeInCache(cacheName, request, response.clone());
  }
  return response;
}

async function precacheBuildAssets() {
  try {
    const response = await fetch('/sw-precache.json', { cache: 'reload' });
    if (!response.ok) return;

    const manifest = await response.json();
    if (!manifest || !Array.isArray(manifest.urls)) return;

    const cache = await caches.open(PRECACHE);
    await Promise.all(
      manifest.urls.map((url) => cache.add(url).catch(() => undefined)),
    );
  } catch {
    return;
  }
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      const cache = await caches.open(PRECACHE);
      await cache.put(NAVIGATION_FALLBACK, response.clone());
    }
    return response;
  } catch {
    const cachedShell =
      (await caches.match(NAVIGATION_FALLBACK)) || (await caches.match('/'));
    return cachedShell || Response.error();
  }
}

async function handleCacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    return await fetchAndCache(RUNTIME, request);
  } catch {
    return Response.error();
  }
}

async function handleNetworkFirst(request) {
  try {
    return await fetchAndCache(RUNTIME, request);
  } catch {
    const cached = await caches.match(request);
    return cached || Response.error();
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      await Promise.all(
        APP_SHELL_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined),
        ),
      );
      await precacheBuildAssets();
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => !MANAGED_CACHES.includes(cacheName))
          .map((cacheName) => caches.delete(cacheName)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (shouldBypass(request, url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  const isHashedAsset =
    url.origin === self.location.origin && url.pathname.startsWith('/assets/');

  if (isHashedAsset) {
    event.respondWith(handleCacheFirst(request));
    return;
  }

  event.respondWith(handleNetworkFirst(request));
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (data === 'SKIP_WAITING' || (data && data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});
