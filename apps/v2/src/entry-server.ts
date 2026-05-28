/**
 * Worker entry — wraps TanStack Start's default SSR handler with an
 * AsyncLocalStorage that captures the per-request Cloudflare `env`.
 *
 * Why: Workers' fetch signature is `(request, env, ctx)`, but TanStack
 * Start's request-handling pipeline only threads the Request through.
 * To make `getEnv()` work inside server fns / API routes / auth handlers
 * we stash env in an ALS before delegating, and have getEnv read from it.
 * ALS is request-scoped along the async chain, so concurrent requests stay
 * isolated.
 *
 * Wired via vite.config.ts → `tanstackStart({ server: { entry: ... } })`.
 */
import { AsyncLocalStorage } from "node:async_hooks";
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

export const envStore = new AsyncLocalStorage<CloudflareEnv>();

// TanStack Start's inner handler — variadic in practice (Workers passes
// request + env + ctx; the type only declares request + opts).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = createStartHandler(defaultStreamHandler) as any;

export default {
  async fetch(
    request: Request,
    env: CloudflareEnv,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return envStore.run(env, () => handler(request, env, ctx));
  },
};
