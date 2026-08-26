/**
 * FundedWealth Service Worker
 * 
 * Strategy:
 * - Navigation requests: Network-first with offline fallback
 * - Hashed assets (/assets/*): Network-only (browser HTTP cache handles these via immutable headers)
 * - Other same-origin requests: Network-first (no aggressive caching of app shell)
 * - Push notifications: Handled normally
 * 
 * This SW deliberately does NOT cache index.html or JS chunks to prevent
 * stale-asset mismatches after deployments.
 */

const CACHE_VERSION = "fundedwealth-sw-v3";
const BASE_URL = self.location.pathname.replace(/service-worker\.js$/, "");
const OFFLINE_URL = `${BASE_URL}offline.html`;

// Only cache the offline fallback page
const PRECACHE_ASSETS = [OFFLINE_URL];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

// ── Activate — clean up ALL old caches ────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);

  // Only handle same-origin requests
  if (requestUrl.origin !== self.location.origin) return;

  // Navigation requests (HTML pages): always go to network
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Offline fallback
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Hashed assets under /assets/ — let the network + browser HTTP cache handle it.
  // Do NOT put these in CacheStorage to avoid stale chunk references after deploy.
  if (requestUrl.pathname.startsWith(`${BASE_URL}assets/`)) {
    // Network-only: don't intercept, let the browser handle it normally
    return;
  }

  // All other same-origin requests: network-first, no caching in SW
  // This prevents the SW from caching index.html or other resources that
  // could become stale after deployment.
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// ── Push Notifications ────────────────────────────────────────────────────────
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

// ── Notification Click ────────────────────────────────────────────────────────
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
