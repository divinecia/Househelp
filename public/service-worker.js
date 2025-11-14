/**
 * HouseHelp Service Worker
 * Provides offline support and caching strategies
 */

const CACHE_NAME = "househelp-v1";
const RUNTIME_CACHE = "househelp-runtime-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/manifest.json",
];

/**
 * Install event - cache static assets
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/**
 * Fetch event - implement caching strategy
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(request).then((response) => {
            return (
              response ||
              new Response(
                JSON.stringify({
                  error: "Offline - cached data may be outdated",
                }),
                {
                  status: 503,
                  statusText: "Service Unavailable",
                  headers: { "Content-Type": "application/json" },
                }
              )
            );
          });
        })
    );
  }

  // Handle static assets with cache-first strategy
  if (
    request.method === "GET" &&
    (request.destination === "style" ||
      request.destination === "script" ||
      request.destination === "image" ||
      request.destination === "font" ||
      url.pathname.endsWith(".woff2") ||
      url.pathname.endsWith(".woff") ||
      url.pathname.endsWith(".ttf"))
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).then((response) => {
            if (!response.ok) {
              return response;
            }
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, response.clone()));
            return response;
          })
        );
      })
    );
  }

  // Handle HTML documents with network-first strategy
  if (
    request.method === "GET" &&
    request.destination === "document"
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return (
            caches.match(request) ||
            caches.match("/") ||
            new Response(
              "<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>",
              {
                status: 503,
                statusText: "Service Unavailable",
                headers: { "Content-Type": "text/html; charset=utf-8" },
              }
            )
          );
        })
    );
  }
});

/**
 * Handle push notifications
 */
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "HouseHelp";
  const options = {
    body: data.body || "",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: data.tag || "notification",
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Handle notification clicks
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if client is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (
          client.url === urlToOpen &&
          "focus" in client
        ) {
          return client.focus();
        }
      }
      // Open new window if not found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

/**
 * Handle background sync
 */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-bookings") {
    event.waitUntil(syncBookings());
  }
  if (event.tag === "sync-payments") {
    event.waitUntil(syncPayments());
  }
});

/**
 * Sync bookings in background
 */
async function syncBookings() {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const requests = await cache.keys();
    const bookingRequests = requests.filter((req) =>
      req.url.includes("/api/bookings")
    );

    for (const request of bookingRequests) {
      try {
        await fetch(request);
      } catch (error) {
        console.error("Sync failed for:", request.url);
      }
    }
  } catch (error) {
    console.error("Background sync error:", error);
  }
}

/**
 * Sync payments in background
 */
async function syncPayments() {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const requests = await cache.keys();
    const paymentRequests = requests.filter((req) =>
      req.url.includes("/api/payments")
    );

    for (const request of paymentRequests) {
      try {
        await fetch(request);
      } catch (error) {
        console.error("Sync failed for:", request.url);
      }
    }
  } catch (error) {
    console.error("Background sync error:", error);
  }
}
