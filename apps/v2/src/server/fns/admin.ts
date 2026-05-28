import { createServerFn } from "@tanstack/react-start";
import { count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { schema, USER_ROLES } from "@heroquest/db";
import { db } from "@/server/db";
import { getSessionContext } from "@/server/middleware";
import { getRequest } from "@tanstack/react-start/server";

function assertAdmin(ctx: { profile?: { role?: string } | null }) {
  if (ctx.profile?.role !== "admin") throw new Error("FORBIDDEN");
}

export const listAllUsers = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user) throw new Error("UNAUTHORIZED");
  assertAdmin(ctx);
  return db()
    .select({
      user: schema.user,
      profile: schema.userProfile,
    })
    .from(schema.user)
    .leftJoin(schema.userProfile, eq(schema.userProfile.userId, schema.user.id))
    .orderBy(desc(schema.userProfile.totalXp));
});

export const setUserRole = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().min(1),
        role: z.enum(USER_ROLES),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user) throw new Error("UNAUTHORIZED");
    assertAdmin(ctx);
    if (data.userId === ctx.user.id && data.role !== "admin") {
      throw new Error("CANNOT_DEMOTE_SELF");
    }
    await db()
      .update(schema.userProfile)
      .set({ role: data.role, updatedAt: new Date() })
      .where(eq(schema.userProfile.userId, data.userId));
    return { ok: true };
  });

// ---------- Executive summary ----------

export const getExecutiveSummary = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user) throw new Error("UNAUTHORIZED");
  assertAdmin(ctx);

  const database = db();
  const [userCountRows, questAgg, topHeroes, recentApprovals] = await Promise.all([
    database.select({ n: count() }).from(schema.user),
    database
      .select({
        n: count(),
        xp: sql<number>`coalesce(sum(${schema.quest.xpAwarded}), 0)`,
        coins: sql<number>`coalesce(sum(${schema.quest.coinsAwarded}), 0)`,
      })
      .from(schema.quest)
      .where(eq(schema.quest.status, "approved")),
    database
      .select({
        userId: schema.userProfile.userId,
        username: schema.userProfile.username,
        totalXp: schema.userProfile.totalXp,
        braveCoins: schema.userProfile.braveCoins,
      })
      .from(schema.userProfile)
      .orderBy(desc(schema.userProfile.totalXp))
      .limit(10),
    database
      .select({
        quest: schema.quest,
        username: schema.userProfile.username,
      })
      .from(schema.quest)
      .innerJoin(schema.userProfile, eq(schema.userProfile.userId, schema.quest.userId))
      .where(eq(schema.quest.status, "approved"))
      .orderBy(desc(schema.quest.approvedAt))
      .limit(10),
  ]);

  return {
    totalUsers: Number(userCountRows[0]?.n ?? 0),
    approvedQuests: Number(questAgg[0]?.n ?? 0),
    totalXpAwarded: Number(questAgg[0]?.xp ?? 0),
    totalCoinsAwarded: Number(questAgg[0]?.coins ?? 0),
    topHeroes,
    recentApprovals,
  };
});
