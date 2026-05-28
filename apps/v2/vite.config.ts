import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Vite config for the TanStack Start app on Cloudflare Workers.
 *
 * - `tanstackStart()` wires file-based routing, server functions, SSR
 *   handler, and React. Emits the worker entry at `dist/server/server.js`
 *   and the static assets at `dist/client/`. `wrangler deploy` consumes
 *   those via `main` + `assets.directory` in wrangler.jsonc.
 * - `vite-plugin-pwa` (injectManifest mode) wires the custom service worker
 *   from `src/sw.ts` for offline shell + IndexedDB draft-quest queue.
 *
 * @cloudflare/vite-plugin was considered for local dev binding emulation
 * but it conflicts with the build: it checks `main`'s file existence at
 * config time, before the build emits it. For local dev with real
 * D1/R2/KV emulation, use `wrangler dev` instead of `vite dev` after
 * running `pnpm build` once. For schema-only dev (no DB calls), `vite
 * dev` works with `ANTHROPIC_API_KEY=demo` and the brand-config server
 * fn falling back to defaults.
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
