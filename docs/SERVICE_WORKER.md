# Service Worker & Offline Cache

PermitFlow ships a hand-written service worker that caches the app shell and runtime
assets so the SPA keeps working without a network connection.

No build plugin or extra dependency is used.

## Files

| File | Purpose |
|------|---------|
| `public/sw.js` | Service worker: precache, fetch strategies, cache versioning. |
| `services/serviceWorker.ts` | Registration + full unregister helper. |
| `index.tsx` | Calls `registerServiceWorker()` after the app mounts. |
| `public/manifest.webmanifest` | Web app manifest (`start_url`, `scope`, icons, theme). |
| `public/icon.svg` | Brand mark used by the manifest and as the favicon. |
| `vite.config.ts` | `permitflow-sw-precache` plugin emits `dist/sw-precache.json` and stamps a build version onto `dist/sw.js`. |

`public/` is copied verbatim into `dist/` by Vite, so `sw.js`, `manifest.webmanifest`
and `icon.svg` are served from the site root in production.

## Build-time precache manifest

Every route is lazy-loaded, so runtime caching alone would leave unvisited routes broken
offline. The `permitflow-sw-precache` plugin closes that gap without any extra dependency:

1. On `closeBundle` it lists the emitted `dist/assets` JS, CSS, SVG and font files.
2. It writes `dist/sw-precache.json` with `{ version, urls }`.
3. It appends `self.__PRECACHE_VERSION = '<hash>'` to `dist/sw.js`. The worker source
   therefore changes whenever the asset list changes, which makes the browser install the
   new worker and re-run `install`.

During `install` the worker fetches `/sw-precache.json` and warms the cache with every URL.
In development that file does not exist, so the worker falls back to shell precache plus
runtime caching. Raster images (hero/background photography) are intentionally not
precached; they are cached on demand so the install burst stays small.

## Fetch strategies

| Request | Strategy | Fallback |
|---------|----------|----------|
| Navigations (`request.mode === 'navigate'`) | Network first, shell cached under `/index.html` | Cached `/index.html`, then `/` |
| Same-origin `/assets/*` (Vite content-hashed) | Cache first | Network |
| Everything else (modules, images, fonts, CDN) | Network first | Cache Storage |

Network-first is deliberate: in development it guarantees the browser always receives
the latest Vite-transformed module, so HMR and full reloads behave exactly as before,
while the response is still written to Cache Storage for offline use. Production hashed
assets are immutable, so they are served cache-first.

Requests that are skipped entirely: non-`GET`, non-`http(s)`, `Range` requests, and
`sw.js` itself. Opaque cross-origin responses (Tailwind CDN, Google Fonts) are cached
and replayed as-is.

## Caches

| Cache | Contents |
|-------|----------|
| `permitflow-precache-v1` | `/`, `/index.html`, `/manifest.webmanifest`, plus the latest navigation response stored under `/index.html`. |
| `permitflow-runtime-v1` | Runtime assets and cross-origin resources, trimmed to the 200 most recent entries. |

The version suffix lives in `CACHE_VERSION` at the top of `public/sw.js`. Bump it when
the caching contract changes; `activate` deletes every cache that is not managed by the
current version, then calls `clients.claim()`.

The service worker calls `skipWaiting()` on install, so a new version takes control on
the next page load without a separate prompt.

## Testing offline

1. `npm run dev` (or `npm run build && npm run preview` for the production bundle).
2. Open the app and let it load once.
3. Reload once so the activated worker controls the page and populates the runtime cache.
4. DevTools → Network → set throttling to **Offline**, then reload.
5. DevTools → Application → Service Workers shows the worker as **activated** and
   **running**; Application → Cache Storage lists the two `permitflow-*` caches.

Offline support requires a secure context: `https://` or `http://localhost`.
If the page is opened through a LAN IP such as `http://192.168.x.x:8080`, browsers treat
it as insecure and `navigator.serviceWorker` is unavailable, so nothing is registered.

## Disabling

Set the environment variable `VITE_DISABLE_SW=true` before starting the server, or call
the exported helper from the console/entry point:

```ts
import { unregisterServiceWorkers } from './services/serviceWorker';

await unregisterServiceWorkers();
```

Unregistering removes the worker registrations and deletes every Cache Storage bucket for
the origin. To clear only the worker, use DevTools → Application → Service Workers →
**Unregister**.

## Deployment

`vercel.json` rewrites unknown paths to `index.html` for SPA routing. Static files in
`dist/` take precedence over rewrites, so `/sw.js`, `/manifest.webmanifest` and `/icon.svg`
are served directly. The manifest and icon paths are declared in `index.html`.
