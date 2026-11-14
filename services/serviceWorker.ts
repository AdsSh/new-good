const SERVICE_WORKER_URL = '/sw.js';
const SERVICE_WORKER_SCOPE = '/';

type ServiceWorkerEnv = {
  VITE_DISABLE_SW?: string;
};

function isServiceWorkerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

function isDisabledByEnv(): boolean {
  const env = (import.meta as ImportMeta & { env?: ServiceWorkerEnv }).env;
  return env?.VITE_DISABLE_SW === 'true';
}

export function registerServiceWorker(): void {
  if (!isServiceWorkerSupported() || isDisabledByEnv()) return;

  const register = (): void => {
    navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: SERVICE_WORKER_SCOPE }).catch(
      () => undefined,
    );
  };

  if (document.readyState === 'complete') {
    register();
    return;
  }

  window.addEventListener('load', register, { once: true });
}

export async function unregisterServiceWorkers(): Promise<void> {
  if (!isServiceWorkerSupported()) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if (typeof caches === 'undefined') return;

  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
}
