import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { schema } from "@heroquest/db";
import { db } from "@/server/db";
import { getSessionContext } from "@/server/middleware";
import { getRequest } from "@tanstack/react-start/server";

export const listAllAchievements = createServerFn({ method: "GET" }).handler(async () => {
  return db().select().from(schema.achievement);
});

export const listMyAchievements = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user) throw new Error("UNAUTHORIZED");
  // Join through user_achievement to surface unlocked-at timestamp.
  return db()
    .select({
      achievement: schema.achievement,
      unlockedAt: schema.userAchievement.unlockedAt,
    })
    .from(schema.userAchievement)
    .innerJoin(
      schema.achievement,
      eq(schema.achievement.id, schema.userAchievement.achievementId),
    )
    .where(eq(schema.userAchievement.userId, ctx.user.id))
    .orderBy(desc(schema.userAchievement.unlockedAt));
});
