const CACHE_NAME = "fundedwealth-pwa-v2";
const BASE_URL = self.location.pathname.replace(/service-worker\.js$/, "");
const OFFLINE_URL = `${BASE_URL}offline.html`;
const ASSETS_TO_CACHE = [`${BASE_URL}`, `${BASE_URL}index.html`, `${BASE_URL}manifest.webmanifest`, `${BASE_URL}offline.html`];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          if (self.navigator.onLine === false) {
            return caches.match(OFFLINE_URL);
          }
          throw new Error("Network error");
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) return networkResponse;
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => {
          if (self.navigator.onLine === false) {
            return caches.match(OFFLINE_URL);
          }
          throw new Error("Network error");
        });
    })
  );
});

self.addEventListener("push", (event) => {
  try {
    const payload = event.data ? event.data.json() : { title: "FundedWealth", body: "New update from FundedWealth." };
    const title = payload.title || "FundedWealth";
    const options = Object.assign({
      body: payload.body || "Open the app to view details.",
      icon: "/icons/icon-192.svg",
      badge: "/icons/icon-192.svg",
      data: payload.data || {},
      vibrate: [100, 50, 100],
    }, payload.options || {});

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    const title = "FundedWealth";
    const options = { body: "You have a new notification.", icon: "/icons/icon-192.svg" };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});
