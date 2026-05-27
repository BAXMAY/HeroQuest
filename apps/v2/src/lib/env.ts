/**
 * Helper for retrieving the typed Cloudflare env inside route handlers and
 * server functions.
 *
 * `@cloudflare/vite-plugin` attaches the bindings to the request context
 * exposed by TanStack Start's `getRequest()` via the workerd runtime.
 * Accessing it through a typed helper keeps every server function honest.
 */
import { getRequest } from "@tanstack/react-start/server";

export function getEnv(): CloudflareEnv {
  const request = getRequest();
  // The Cloudflare Vite plugin attaches env to a request-scoped Symbol
  // accessor. Cast to a shape we control.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (request as any)?.cf?.env ?? (request as any)?.cloudflare?.env;
  if (!env) {
    throw new Error(
      "Cloudflare env not available — are you running outside a Worker context?",
    );
  }
  return env as CloudflareEnv;
}
