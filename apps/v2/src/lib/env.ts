/**
 * Helper for retrieving the typed Cloudflare env inside route handlers and
 * server functions.
 *
 * The @cloudflare/vite-plugin attaches the active worker `env` to each
 * incoming Request. We probe a couple of well-known property shapes so
 * this keeps working as the plugin's internal API evolves; fall back to
 * scanning symbol keys for anything that has our bindings.
 *
 * Wrapped in `createServerOnlyFn` so the TanStack Start import-protection
 * plugin trusts the import chain even though `getRequest` is server-only.
 * The wrapper throws at runtime if accidentally called from the client.
 */
import { createServerOnlyFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const getEnv = createServerOnlyFn((): CloudflareEnv => {
  const req = getRequest() as unknown as Record<string | symbol, unknown> | undefined;
  if (!req) throw new Error("getEnv() called outside a request context");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const direct = ((req as any).cf?.env ?? (req as any).cloudflare?.env) as
    | CloudflareEnv
    | undefined;
  if (direct?.DB) return direct;

  for (const key of Reflect.ownKeys(req)) {
    const v = (req as Record<string | symbol, unknown>)[key];
    if (v && typeof v === "object") {
      const maybe = v as Record<string, unknown>;
      if (maybe.DB || maybe.env) {
        const env = (maybe.env ?? maybe) as CloudflareEnv;
        if (env.DB) return env;
      }
    }
  }

  throw new Error(
    "Cloudflare env not found on request — @cloudflare/vite-plugin not active or shape changed.",
  );
});
