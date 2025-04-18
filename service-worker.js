const CACHE_NAME = "darlingx-cache-v1";
const OFFLINE_URL = "/offline.html";

// 📦 Ресурсы для кэширования при установке
const urlsToCache = [
  "/",
  "/index.html",
  "/offline.html",
  "/css/style.css",
  "/css/constellation.css",
  "/js/main.js",
  "/js/constellation.js",
  "/icon32.png",
  "/icon180.png",
  "/darling.webp"
];

// 🔧 Установка Service Worker
self.addEventListener("install", event => {
  console.log("📥 Installing Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Caching essential files...");
      return cache.addAll(urlsToCache);
    }).then(() => self.skipWaiting())
  );
});

// 🧹 Очистка старых кэшей при активации
self.addEventListener("activate", event => {
  console.log("⚙️ Activating Service Worker...");
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (!cacheWhitelist.includes(name)) {
            console.log("🗑 Deleting old cache:", name);
            return caches.delete(name);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// 🌐 Обработка запросов: сначала ищем в кэше, потом в сети
self.addEventListener("fetch", event => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        console.log("📂 Serving from cache:", event.request.url);
        return cached;
      }

      return fetch(event.request)
        .then(networkResponse => {
          // Не кэшируем сторонние или ошибочные ответы
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          // Клонируем и добавляем в кэш
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        })
        .catch(error => {
          console.warn("⚠️ Network failed, showing offline page for:", event.request.url);
          return caches.match(OFFLINE_URL);
        });
    })
  );
});
