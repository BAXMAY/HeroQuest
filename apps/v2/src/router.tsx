import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/**
 * Single source of truth for the router. Both the SSR worker and the
 * client browser bundle call this to construct an identical router instance.
 *
 * Context (queryClient, session, profile) is hydrated by the root route's
 * `beforeLoad`. We expose `null` defaults here so the types line up.
 */
export type RouterContext = {
  queryClient: QueryClient;
};

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
    },
  });

  return createTanstackRouter({
    routeTree,
    context: { queryClient } satisfies RouterContext,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
  });
}

/**
 * `getRouter` is the entry point name the TanStack Start plugin looks for
 * when handling SSR (see start-server-core/createStartHandler). Both names
 * are exported because some internal code paths still call `createRouter`.
 */
export function getRouter() {
  return createRouter();
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
