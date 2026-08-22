// Service worker for PWA & Push Notifications
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Passthrough fetch handler required for PWA install eligibility
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
      title: 'Blue Buff Notification',
      body: event.data.text(),
    };
  }

  const title = payload.title || 'Blue Buff';
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
