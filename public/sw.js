// Service worker for PWA, Push Notifications, 0ms Asset Caching & Offline Fallback
const CACHE_NAME = 'mlbbtopup-assets-v2';

// Static core assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/offline.html',
  '/logoBB.png',
  '/logo.png',
  '/favicon.ico',
  '/manifest.json',
];

// ==========================================
// INSTALL: Pre-cache core assets & activate immediately
// ==========================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Listen for SKIP_WAITING message from client to instantly activate update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ==========================================
// ACTIVATE: Prune stale cache versions
// ==========================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ==========================================
// FETCH: Caching & Offline Navigation Fallback
// ==========================================
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // CRITICAL: NEVER cache API routes, admin, or payment endpoints
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/owner')
  ) {
    return;
  }

  // 1. NAVIGATION REQUESTS (HTML Pages) -> Network First with Offline Fallback
  const isNavigation =
    request.mode === 'navigate' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedOffline = await cache.match('/offline.html');
        return cachedOffline || new Response('Offline', { status: 503, statusText: 'Offline' });
      })
    );
    return;
  }

  // 2. STATIC ASSETS (Images, Fonts, CSS/JS Chunks) -> Stale-While-Revalidate
  const isCacheableAsset =
    url.pathname.startsWith('/game-assets/') ||
    url.pathname.startsWith('/blog/') ||
    url.pathname.startsWith('/ott/') ||
    url.pathname.startsWith('/membership/') ||
    url.pathname.startsWith('/skins/') ||
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ico');

  if (isCacheableAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        // Fetch latest version from network in background & update cache
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        // Return 0ms cached response immediately if available, else await network
        return cachedResponse || fetchPromise;
      })
    );
  }
});

// ==========================================
// PUSH NOTIFICATION EVENT LISTENER
// ==========================================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: 'mlbbtopup.in Notification',
      body: event.data.text(),
    };
  }

  const title = payload.title || 'mlbbtopup.in';
  const options = {
    body: payload.body || 'You have a new update!',
    icon: payload.icon || '/logoBB.png',
    badge: payload.badge || '/logoBB.png',
    image: payload.image || undefined, // Rich media preview image
    tag: payload.tag || undefined,     // Notification group tag (e.g. order-12345)
    renotify: Boolean(payload.tag),    // Alert user again when replacing notification
    data: {
      url: payload.url || '/',
      dateOfArrival: Date.now(),
      primaryKey: payload.id || '1',
    },
    vibrate: payload.vibrate || [100, 50, 100],
    requireInteraction: payload.requireInteraction || false,
    actions: payload.actions || [
      { action: 'open', title: 'Open App' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ==========================================
// NOTIFICATION CLICK EVENT LISTENER
// ==========================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url === targetUrl) {
            return client.focus();
          } else if (client.navigate) {
            client.focus();
            return client.navigate(targetUrl);
          }
        }
      }
      // If no tab is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
