import { createFileRoute } from "@tanstack/react-router";
import { createAuth } from "@/server/auth";
import { getEnv } from "@/lib/env";

/**
 * Catch-all Better Auth handler at `/api/auth/*`.
 *
 * TanStack Start (v1.168+) unified API routes into regular `createFileRoute`
 * via the `server.handlers.ANY` option — any HTTP method is routed to the
 * single handler so we don't need to enumerate GET/POST/etc.
 */
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const auth = createAuth(getEnv());
        return auth.handler(request);
      },
    },
  },
});
