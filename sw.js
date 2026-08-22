/* Cache-first service worker — this app must work with zero signal. */

const CACHE_VERSION = "mud-motor-doc-v18";

// Core app shell — small, must always succeed or the app itself is broken.
const CORE_URLS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./content.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

// Bulk reference assets (manuals, diagrams) — cached best-effort. One slow
// or failed fetch here must NOT block the app shell from updating, or the
// whole update silently gets stuck on the old version forever.
const BULK_URLS = [
  "./manuals/40-efi-diagnostics-and-repair-manual.pdf",
  "./manuals/vanguard-37-efi-repair-manual.pdf",
  "./manuals/hdr-owners-manual-2024.pdf",
  "./manuals/hdr-efi-2019-harness.pdf",
  "./images/component-locations-marine-610000.png",
  "./images/control-harness-diagram.png",
  "./images/multimeter-basics-diagram.png",
  "./images/mil-flash-diagram.png",
  "./images/dlc-connector-photo.png",
  "./images/efi-wire-harness-diagram.png",
  "./images/ignition-coil-photo.png",
  "./images/fuel-pump-module-diagram.png",
  "./images/fuel-rail-diagram.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      await cache.addAll(CORE_URLS);
      await Promise.all(
        BULK_URLS.map((url) =>
          cache.add(url).catch((err) => console.warn("[sw] bulk asset failed to precache:", url, err))
        )
      );
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first: if it's cached, serve instantly (no signal needed). If not
// cached, try the network, and stash a copy for next time.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") return caches.match("./index.html");
        });
    })
  );
});
