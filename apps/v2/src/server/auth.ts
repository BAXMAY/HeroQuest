import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { schema, getDb } from "@heroquest/db";

/**
 * Construct a Better Auth instance bound to a specific D1.
 *
 * Better Auth wants a singleton-style DB handle, but on Workers we create
 * one per request (the D1 binding is request-scoped). The pattern: build the
 * auth instance inside the request handler, passing the Drizzle DB.
 */
export function createAuth(env: CloudflareEnv) {
  const db = getDb(env.DB);
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.PUBLIC_APP_URL,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
    },
    socialProviders: env.GOOGLE_CLIENT_ID
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined,
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // refresh once per day
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 min in-memory cookie cache
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
