import { createAuthClient } from "better-auth/react";

/**
 * Better Auth browser client. Talks to the catch-all at /api/auth/$
 * which is mounted in apps/v2/src/routes/api/auth/$.ts.
 *
 * Hooks: useSession, signIn, signUp, signOut, etc.
 */
export const authClient = createAuthClient({
  baseURL: typeof window === "undefined" ? undefined : window.location.origin,
});

export const { useSession, signIn, signUp, signOut } = authClient;
