/**
 * Outer Worker entry — wraps TanStack Start's bundled SSR handler
 * (dist/server/server.js) with an AsyncLocalStorage that captures
 * the per-request Cloudflare `env`.
 *
 * Why this file exists: tanstackStart()'s `server.entry` option doesn't
 * actually swap the Worker entry (it's for the SSR entry only). The
 * bundled server.js exports its own `default = createServerEntry({fetch})`
 * which receives Workers' `(request, env, ctx)` but drops env. So we
 * point wrangler.jsonc `main` at THIS file instead, and have it wrap
 * the inner fetch.
 *
 * The AsyncLocalStorage instance is published on globalThis so
 * apps/v2/src/lib/env.ts (bundled inside dist/server/server.js) can read
 * from the same instance — modules bundled separately are different
 * realms, but globalThis is shared.
 */
import { AsyncLocalStorage } from "node:async_hooks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const envStore = new AsyncLocalStorage<any>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__heroquestEnvStore = envStore;

// Import AFTER publishing the store so the inner bundle's top-level
// initialization can see it if it ever needs to.
// @ts-expect-error — dist/server/server.js is the build output, no .d.ts
import startApp from "./dist/server/server.js";

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
    return envStore.run(env, () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (startApp as any).fetch(request, env, ctx),
    );
  },
};
