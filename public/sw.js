// Service Worker for Moja Dieta PWA
// Handles push notifications and basic caching

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Moja Dieta";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icons/icon-192.svg",
    badge: "/icons/icon-192.svg",
    vibrate: [200, 100, 200],
    data: data.url || "/",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Click on notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("moja-dieta") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data || "/");
      }
    })
  );
});

// Basic cache strategy
const CACHE_NAME = "moja-dieta-v1";
const STATIC_ASSETS = ["/", "/manifest.json", "/icons/icon-192.svg", "/icons/icon-512.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Network first, cache fallback
self.addEventListener("fetch", (event) => {
  // Skip API calls and POST requests
  if (event.request.url.includes("/api/") || event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
