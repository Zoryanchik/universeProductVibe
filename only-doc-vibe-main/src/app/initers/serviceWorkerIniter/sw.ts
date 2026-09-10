const SW_BASE = process.env.SW_BASE || "";

// Імпортуємо конфігурацію
importScripts(`${SW_BASE}/sw-config.js?${self.location.search}`);

const CACHE_NAME = SW_CONFIG.CACHE_NAME;
const CACHE_URLS = SW_CONFIG.CACHE_URLS;
const NETWORK_FIRST_PATTERNS = SW_CONFIG.NETWORK_FIRST_PATTERNS;
const CACHE_FIRST_PATTERNS = SW_CONFIG.CACHE_FIRST_PATTERNS;
const MAX_CACHE_SIZE = SW_CONFIG.MAX_CACHE_SIZE;
const CACHE_LIFETIME = SW_CONFIG.CACHE_LIFETIME;

// Встановлення service worker
self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching app shell");

        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log("Service Worker: Installation complete");

        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Installation failed", error);
      })
  );
});

// Активація service worker
self.addEventListener("activate", (event: ExtendableEvent) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache", cacheName);

              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activation complete");

        return self.clients.claim();
      })
  );
});

// Обробка запитів
self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Перевіряємо, чи це запит до основного додатку
  if (!url.href.includes(SW_CONFIG.MAIN_APP_BASE)) {
    return;
  }

  // Перевіряємо, чи це запит до API або інші критичні ресурси
  const isNetworkFirst = NETWORK_FIRST_PATTERNS.some((pattern) =>
    pattern.test(url.pathname)
  );

  if (isNetworkFirst) {
    // Network First стратегія для API та критичних ресурсів
    event.respondWith(
      fetch(request, { redirect: "follow" })
        .then((response) => {
          // Кешуємо успішні відповіді
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          // Якщо мережа недоступна, повертаємо з кешу
          return caches.match(request) as Promise<Response>;
        })
    );

    return;
  }

  // Перевіряємо, чи це статичні ресурси
  const isCacheFirst = CACHE_FIRST_PATTERNS.some((pattern) =>
    pattern.test(url.pathname)
  );

  if (isCacheFirst) {
    // Cache First стратегія для статичних ресурсів
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request, { redirect: "follow" }).then((response) => {
          // Кешуємо тільки успішні відповіді
          if (response.status === 200) {
            const responseClone = response.clone();
            // Додаємо timestamp до заголовків
            const headers = new Headers(responseClone.headers);
            headers.set("sw-cache-time", Date.now().toString());
            const modifiedResponse = new Response(responseClone.body, {
              status: responseClone.status,
              statusText: responseClone.statusText,
              headers: headers,
            });

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, modifiedResponse);
            });
          }

          return response;
        });
      })
    );

    return;
  }

  // Stale While Revalidate стратегія для інших ресурсів
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request, { redirect: "follow" })
        .then((response) => {
          // Оновлюємо кеш у фоновому режимі
          if (response.status === 200) {
            const responseClone = response.clone();
            // Додаємо timestamp до заголовків
            const headers = new Headers(responseClone.headers);
            headers.set("sw-cache-time", Date.now().toString());
            const modifiedResponse = new Response(responseClone.body, {
              status: responseClone.status,
              statusText: responseClone.statusText,
              headers: headers,
            });

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, modifiedResponse);
            });
          }

          return response;
        })
        .catch(() => {
          // Якщо мережа недоступна, повертаємо кешовану версію
          return cachedResponse as Response;
        });

      // Повертаємо кешовану версію одразу, якщо вона є
      return cachedResponse || fetchPromise;
    })
  );
});

// Обробка повідомлень від основного потоку
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Функція для очищення старого кешу
async function cleanupOldCache() {
  const cacheNames = await caches.keys();
  const currentTime = Date.now();

  for (const cacheName of cacheNames) {
    if (cacheName !== CACHE_NAME) {
      await caches.delete(cacheName);
      console.log("Service Worker: Deleted old cache", cacheName);
    }
  }

  // Очищуємо застарілі записи з поточного кешу
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();

  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const cacheTime = response.headers.get("sw-cache-time");
      if (cacheTime && currentTime - parseInt(cacheTime) > CACHE_LIFETIME) {
        await cache.delete(request);
        console.log("Service Worker: Deleted expired cache entry", request.url);
      }
    }
  }
}

// Функція для перевірки розміру кешу
async function checkCacheSize() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  let totalSize = 0;

  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;
    }
  }

  if (totalSize > MAX_CACHE_SIZE) {
    console.log("Service Worker: Cache size exceeded, cleaning up...");
    // Видаляємо найстаріші записи
    const sortedRequests = (requests as Request[]).sort((a, b) => {
      const aTime = a.headers.get("sw-cache-time") || "0";
      const bTime = b.headers.get("sw-cache-time") || "0";

      return parseInt(aTime) - parseInt(bTime);
    });

    for (let i = 0; i < Math.floor(requests.length * 0.2); i++) {
      await cache.delete(sortedRequests[i]);
    }
  }
}

// Периодичне оновлення кешу
self.addEventListener("sync", (event) => {
  const typedEvent = event as ExtendableEvent & { tag: string };

  if (typedEvent.tag === "background-sync") {
    typedEvent.waitUntil(
      Promise.all([
        caches.open(CACHE_NAME).then((cache) => {
          // Оновлюємо критичні ресурси
          return cache.addAll(CACHE_URLS);
        }),
        cleanupOldCache(),
        checkCacheSize(),
      ]).catch((error) => {
        console.error("Service Worker: Background sync failed", error);
      })
    );
  }
});

// Обробка повідомлень для очищення кешу
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches
        .delete(CACHE_NAME)
        .then(() => {
          console.log("Service Worker: Cache cleared");
          event.ports[0].postMessage({ success: true });
        })
        .catch((error) => {
          console.error("Service Worker: Failed to clear cache", error);
          event.ports[0].postMessage({ success: false, error: error.message });
        })
    );
  }
});
