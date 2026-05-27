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

// ---------- Admin metadata editing ----------
// The 12 achievement IDs and unlock rules stay in code (computeNewlyUnlocked).
// Communities can rename, retranslate, and re-ic-onify them per brand.
import { z } from "zod";

const updateInput = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80).optional(),
  nameEn: z.string().max(80).optional(),
  description: z.string().min(1).max(280).optional(),
  descriptionEn: z.string().max(280).optional(),
  icon: z.string().min(1).max(40).optional(),
});

function assertAdmin(ctx: { profile?: { role?: string } | null }) {
  if (ctx.profile?.role !== "admin") throw new Error("FORBIDDEN");
}

export const updateAchievement = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateInput.parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user) throw new Error("UNAUTHORIZED");
    assertAdmin(ctx);
    const { id, ...rest } = data;
    if (Object.keys(rest).length === 0) return { ok: true };
    await db().update(schema.achievement).set(rest).where(eq(schema.achievement.id, id));
    return { ok: true };
  });
