import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { schema, applyDailyCheckIn } from "@heroquest/db";
import { db } from "@/server/db";
import { getSessionContext } from "@/server/middleware";
import { getRequest } from "@tanstack/react-start/server";
import { localDateString } from "@/lib/dates";

/**
 * Called once per local-calendar-day from the app shell's beforeLoad.
 * Idempotent (same-day call is a no-op). On streak extension, awards
 * milestone bonus XP if hitting 3/7/14/30/60/100 day mark.
 */
export const checkInDaily = createServerFn({ method: "POST" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user || !ctx.profile) throw new Error("UNAUTHORIZED");

  const today = localDateString(new Date(), ctx.profile.locale);

  const result = applyDailyCheckIn(
    {
      current: ctx.profile.streakCurrent,
      longest: ctx.profile.streakLongest,
      lastVisit: ctx.profile.streakLastVisit,
    },
    today,
  );

  // Same-day → no writes.
  if (!result.extended && result.next.lastVisit === ctx.profile.streakLastVisit) {
    return { streak: result.next, milestone: false, bonusXp: 0 };
  }

  const database = db();
  const now = new Date();
  const writes: any[] = [
    database
      .update(schema.userProfile)
      .set({
        streakCurrent: result.next.current,
        streakLongest: result.next.longest,
        streakLastVisit: result.next.lastVisit,
        totalXp: ctx.profile.totalXp + result.bonusXp,
        updatedAt: now,
      })
      .where(eq(schema.userProfile.userId, ctx.user.id)),
    database
      .insert(schema.dailyStreakLog)
      .values({
        userId: ctx.user.id,
        date: today,
        xpAwarded: result.bonusXp,
        source: result.milestone ? "streak_bonus" : "login",
      })
      .onConflictDoNothing(),
  ];
  if (result.milestone) {
    writes.push(
      database.insert(schema.notification).values({
        id: nanoid(),
        userId: ctx.user.id,
        title: `${result.next.current}-day streak!`,
        body: `+${result.bonusXp} XP bonus. Keep it up!`,
        type: "streak_milestone",
        link: "/dashboard",
        isRead: false,
        createdAt: now,
      }),
    );
  }
  await database.batch(writes as any);

  return { streak: result.next, milestone: result.milestone, bonusXp: result.bonusXp };
});
