/**
 * Helper for retrieving the typed Cloudflare env inside route handlers and
 * server functions.
 *
 * The active env is stashed in an AsyncLocalStorage by the custom worker
 * entry (apps/v2/src/entry-server.ts) before delegating to TanStack Start's
 * request pipeline. AsyncLocalStorage is request-scoped on the async chain,
 * so concurrent requests stay isolated.
 *
 * Wrapped in `createServerOnlyFn` so the TanStack Start import-protection
 * plugin trusts the import chain. The wrapper throws at runtime if it's
 * accidentally called from the client.
 */
import { createServerOnlyFn } from "@tanstack/react-start";
import { envStore } from "@/entry-server";

export const getEnv = createServerOnlyFn((): CloudflareEnv => {
  const env = envStore.getStore();
  if (!env) {
    throw new Error(
      "getEnv() called outside a request context — entry-server.ts not active?",
    );
  }
  return env;
});
