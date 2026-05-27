import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { schema } from "@heroquest/db";
import type { UserRole } from "@heroquest/db/types";
import { db } from "./db";
import { createAuth } from "./auth";
import { getEnv } from "@/lib/env";

/**
 * Resolves the current Better Auth session from cookies and loads the
 * corresponding `user_profile` row. Returns `null` for both when there's no
 * session — callers must decide whether to redirect.
 */
export async function getSessionContext(request: Request) {
  const env = getEnv();
  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { user: null, profile: null, auth };

  const profile = await db()
    .select()
    .from(schema.userProfile)
    .where(eq(schema.userProfile.userId, session.user.id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  return { user: session.user, profile, auth };
}

export const requireUser = createMiddleware().server(async ({ next, request }) => {
  const ctx = await getSessionContext(request);
  if (!ctx.user) {
    throw redirect({ to: "/login" });
  }
  return next({ context: ctx });
});

export const requireAdmin = createMiddleware()
  .middleware([requireUser])
  .server(async ({ next, context }) => {
    if (context.profile?.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
    return next();
  });

export function isRole(role: UserRole, target: UserRole | UserRole[]): boolean {
  return Array.isArray(target) ? target.includes(role) : role === target;
}
