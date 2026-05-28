/// <reference lib="webworker" />
/* global self */

/**
 * Custom service worker injected via vite-plugin-pwa (injectManifest mode).
 * Workbox provides the precache list at build time via `self.__WB_MANIFEST`.
 *
 * Caching strategies:
 *   - App shell (HTML/JS/CSS): precached
 *   - /r2/* (private quest photos): CacheFirst, 7 days
 *   - /api/* (RPC + server fns): NetworkFirst, 5s timeout
 *   - Fonts + Lucide SVG: StaleWhileRevalidate
 *   - /api/auth/*: NEVER cached
 */
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

precacheAndRoute(self.__WB_MANIFEST ?? []);

// Quest photos via the auth-gated R2 proxy.
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/r2/"),
  new CacheFirst({
    cacheName: "hq-r2-v1",
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 })],
  }),
);

// Server fns / api except auth — NetworkFirst for fresh data with a fallback.
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/auth/"),
  new NetworkFirst({
    cacheName: "hq-api-v1",
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 })],
  }),
);

// Fonts.
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
  new StaleWhileRevalidate({ cacheName: "hq-fonts-v1" }),
);

// Activate immediately so updates roll out on the next load.
self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Background Sync — drain the pending-quests queue when connectivity returns.
self.addEventListener("sync" as any, (event: any) => {
  if (event?.tag === "hq-pending-quests") {
    event.waitUntil(drainPending());
  }
});

async function drainPending(): Promise<void> {
  // We can't import idb here without bundling, and we want this worker tiny.
  // So instead we postMessage all open clients to drain — the foreground
  // helper handles the IDB read + uploads.
  const all = await self.clients.matchAll();
  all.forEach((c) => c.postMessage({ type: "drain-pending-quests" }));
}
