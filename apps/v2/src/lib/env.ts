/**
 * Helper for retrieving the typed Cloudflare env inside route handlers
 * and server functions.
 *
 * The env is captured per-request by the outer Worker entry at
 * apps/v2/worker.ts via an AsyncLocalStorage stashed on globalThis. The
 * outer wrapper and this module are bundled separately (wrangler bundles
 * worker.ts; vite bundles src/* into dist/server/server.js), so direct
 * module imports wouldn't share state — globalThis is the shared anchor.
 *
 * Wrapped in `createServerOnlyFn` so the TanStack Start import-protection
 * plugin trusts the import chain.
 */
import { createServerOnlyFn } from "@tanstack/react-start";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AlsLike = { getStore(): any };

export const getEnv = createServerOnlyFn((): CloudflareEnv => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store = (globalThis as any).__heroquestEnvStore as AlsLike | undefined;
  if (!store) {
    throw new Error(
      "envStore not initialized — apps/v2/worker.ts must be the wrangler.jsonc main.",
    );
  }
  const env = store.getStore() as CloudflareEnv | undefined;
  if (!env) {
    throw new Error("getEnv() called outside a request context");
  }
  return env;
});
