const CACHE_NAME = "budget-planner-pwa-cache-v1";
const FILES_TO_CACHE = [
  "/webassignment/",
  "/webassignment/index.html",
  "/webassignment/style.css",
  "/webassignment/app.js",
  "/webassignment/login.js",
  "/webassignment/manifest.json",
  "/webassignment/firebaseconfig.js",
  "/webassignment/main.html",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
