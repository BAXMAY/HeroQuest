import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Vite config for the TanStack Start app on Cloudflare Workers.
 *
 * - `tanstackStart()` wires file-based routing, server functions, SSR
 *   handler, and React. The plugin uses its built-in default client/server
 *   entries unless we override; `src/router.tsx` is the convention for the
 *   router definition.
 * - `@cloudflare/vite-plugin` runs the SSR build inside workerd during dev
 *   so D1/R2/KV bindings work locally, and outputs a `_worker.js` for
 *   `wrangler deploy`.
 * - `vite-plugin-pwa` (injectManifest mode) wires the custom service worker
 *   from `src/sw.ts` for offline shell + IndexedDB draft-quest queue.
 */
export default defineConfig({
  plugins: [
    tanstackStart({
      srcDirectory: "./src",
      router: {
        generatedRouteTree: "./src/routeTree.gen.ts",
      },
    }),
    react(),
    cloudflare(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectRegister: false,
      manifest: false,
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webp,woff2}"],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});
