import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { schema, rankLeaderboard } from "@heroquest/db";
import { db } from "@/server/db";
import { getSessionContext } from "@/server/middleware";
import { getRequest } from "@tanstack/react-start/server";
import { getEnv } from "@/lib/env.server";

const KV_LEADERBOARD_TTL_SECONDS = 60;
const TOP_LIMIT = 100;

const inputSchema = z.object({
  scope: z.enum(["global", "family"]).default("global"),
});

export const getLeaderboard = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => inputSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user) throw new Error("UNAUTHORIZED");

    if (data.scope === "family") {
      if (!ctx.profile?.familyId) return [];
      const rows = await db()
        .select({
          userId: schema.userProfile.userId,
          username: schema.userProfile.username,
          totalXp: schema.userProfile.totalXp,
          showOnLeaderboard: schema.userProfile.showOnLeaderboard,
        })
        .from(schema.userProfile)
        .where(eq(schema.userProfile.familyId, ctx.profile.familyId))
        .orderBy(desc(schema.userProfile.totalXp))
        .limit(TOP_LIMIT);
      return rankLeaderboard(rows);
    }

    // Global — KV cached.
    const env = getEnv();
    const cacheKey = `leaderboard:global:v1`;
    try {
      const cached = await env.TRIVIA_KV.get(cacheKey, "json");
      if (cached) return cached as ReturnType<typeof rankLeaderboard>;
    } catch {
      // KV miss / not configured during early dev — fall through to DB.
    }

    const rows = await db()
      .select({
        userId: schema.userProfile.userId,
        username: schema.userProfile.username,
        totalXp: schema.userProfile.totalXp,
        showOnLeaderboard: schema.userProfile.showOnLeaderboard,
      })
      .from(schema.userProfile)
      .where(eq(schema.userProfile.showOnLeaderboard, true))
      .orderBy(desc(schema.userProfile.totalXp))
      .limit(TOP_LIMIT);
    const ranked = rankLeaderboard(rows);

    try {
      await env.TRIVIA_KV.put(cacheKey, JSON.stringify(ranked), {
        expirationTtl: KV_LEADERBOARD_TTL_SECONDS,
      });
    } catch {
      // ignore in dev
    }
    return ranked;
  });

void and;
