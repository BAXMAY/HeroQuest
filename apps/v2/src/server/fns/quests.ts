/**
 * Quest server functions — submit, list, decide.
 *
 * These compose the pure rules in @heroquest/db/rules with D1 writes
 * batched atomically. Auth + role checks live here; the rules layer stays
 * pure so it can be unit-tested without a DB.
 */
import { createServerFn } from "@tanstack/react-start";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { schema } from "@heroquest/db";
import {
  ACHIEVEMENT_CATALOG,
  applyDecision,
  canApprove,
  computeNewlyUnlocked,
  isTransitionAllowed,
  QUEST_CATEGORIES,
  type QuestCategory,
} from "@heroquest/db";
import { db } from "@/server/db";
import { getSessionContext } from "@/server/middleware";
import { getEnv } from "@/lib/env.server";
import { getRequest } from "@tanstack/react-start/server";

// ---------- Submit ----------

const submitQuestInput = z.object({
  description: z.string().min(10).max(1000),
  category: z.enum(QUEST_CATEGORIES),
  photoR2Key: z.string().min(1).max(300),
});

export const submitQuest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submitQuestInput.parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user) throw new Error("UNAUTHORIZED");

    const id = nanoid();
    await db()
      .insert(schema.quest)
      .values({
        id,
        userId: ctx.user.id,
        description: data.description,
        category: data.category,
        photoR2Key: data.photoR2Key,
        status: "pending",
        source: "submission",
        submittedAt: new Date(),
      });
    return { id };
  });

// ---------- List ----------

export const listMyQuests = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user) throw new Error("UNAUTHORIZED");
  const rows = await db()
    .select()
    .from(schema.quest)
    .where(eq(schema.quest.userId, ctx.user.id))
    .orderBy(desc(schema.quest.submittedAt));
  return rows;
});

export const listPendingQuests = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user) throw new Error("UNAUTHORIZED");
  if (ctx.profile?.role !== "admin" && ctx.profile?.role !== "parent") {
    throw new Error("FORBIDDEN");
  }
  // Join in submitter profile so the approvals page can show usernames.
  const rows = await db()
    .select({
      quest: schema.quest,
      profile: schema.userProfile,
    })
    .from(schema.quest)
    .innerJoin(schema.userProfile, eq(schema.userProfile.userId, schema.quest.userId))
    .where(eq(schema.quest.status, "pending"))
    .orderBy(desc(schema.quest.submittedAt));
  return rows;
});

// ---------- Decide (approve/reject) ----------

const decideQuestInput = z.object({
  questId: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
  xp: z.number().int().min(0).max(500),
  coins: z.number().int().min(0).max(50),
});

export const decideQuest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => decideQuestInput.parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user || !ctx.profile) throw new Error("UNAUTHORIZED");

    const database = db();

    // 1. Load the quest + owner profile
    const target = await database
      .select({ quest: schema.quest, profile: schema.userProfile })
      .from(schema.quest)
      .innerJoin(schema.userProfile, eq(schema.userProfile.userId, schema.quest.userId))
      .where(eq(schema.quest.id, data.questId))
      .limit(1)
      .then((r) => r[0]);

    if (!target) throw new Error("QUEST_NOT_FOUND");
    if (!isTransitionAllowed(target.quest.status, data.decision)) {
      throw new Error(`INVALID_TRANSITION:${target.quest.status}->${data.decision}`);
    }
    if (
      !canApprove({
        approverRole: ctx.profile.role,
        approverFamilyId: ctx.profile.familyId ?? null,
        questOwnerFamilyId: target.profile.familyId ?? null,
      })
    ) {
      throw new Error("FORBIDDEN");
    }

    // 2. Apply the pure rule
    const result = applyDecision(
      {
        totalXp: target.profile.totalXp,
        braveCoins: target.profile.braveCoins,
        questsCompleted: target.profile.questsCompleted,
      },
      { decision: data.decision, xp: data.xp, coins: data.coins },
    );

    // 3. Persist atomically — quest + profile + notification
    const now = new Date();
    const writes: any[] = [
      database
        .update(schema.quest)
        .set({
          status: data.decision,
          xpAwarded: data.decision === "approved" ? data.xp : 0,
          coinsAwarded: data.decision === "approved" ? data.coins : 0,
          approvedAt: now,
          approvedBy: ctx.user.id,
        })
        .where(eq(schema.quest.id, data.questId)),
    ];

    if (data.decision === "approved") {
      writes.push(
        database
          .update(schema.userProfile)
          .set({
            totalXp: result.newStats.totalXp,
            braveCoins: result.newStats.braveCoins,
            questsCompleted: result.newStats.questsCompleted,
            updatedAt: now,
          })
          .where(eq(schema.userProfile.userId, target.profile.userId)),
      );

      writes.push(
        database.insert(schema.notification).values({
          id: nanoid(),
          userId: target.profile.userId,
          title: "Quest approved!",
          body: `+${data.xp} XP, +${data.coins} Brave Coins.`,
          type: "quest_approved",
          link: "/dashboard",
          isRead: false,
          createdAt: now,
        }),
      );

      if (result.leveledUp) {
        writes.push(
          database.insert(schema.notification).values({
            id: nanoid(),
            userId: target.profile.userId,
            title: "Level up!",
            body: `You reached Level ${result.newLevel.level}: ${result.newLevel.title}`,
            type: "level_up",
            link: "/profile",
            isRead: false,
            createdAt: now,
          }),
        );
      }
    } else {
      writes.push(
        database.insert(schema.notification).values({
          id: nanoid(),
          userId: target.profile.userId,
          title: "Quest needs another try",
          body: "Your quest wasn't approved — check the photo and try again!",
          type: "quest_rejected",
          link: "/submit",
          isRead: false,
          createdAt: now,
        }),
      );
    }

    await database.batch(writes as any);

    // 4. Achievement check (only on approval)
    let newAchievements: string[] = [];
    if (data.decision === "approved") {
      newAchievements = await checkAndAwardAchievements(target.profile.userId, result.newStats);
    }

    return {
      ok: true,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
      newAchievements,
    };
  });

// ---------- Achievement check helper ----------

async function checkAndAwardAchievements(
  userId: string,
  stats: { totalXp: number; braveCoins: number; questsCompleted: number },
): Promise<string[]> {
  const database = db();

  // Existing achievements
  const existing = await database
    .select({ id: schema.userAchievement.achievementId })
    .from(schema.userAchievement)
    .where(eq(schema.userAchievement.userId, userId));
  const alreadyUnlockedIds = new Set(existing.map((e) => e.id));

  // Approved category counts
  const categoryRows = await database
    .select({ category: schema.quest.category, n: count() })
    .from(schema.quest)
    .where(and(eq(schema.quest.userId, userId), eq(schema.quest.status, "approved")))
    .groupBy(schema.quest.category);
  const approvedCategoryCounts = Object.fromEntries(
    categoryRows.map((r) => [r.category as QuestCategory, Number(r.n)]),
  ) as Partial<Record<QuestCategory, number>>;

  const newly = computeNewlyUnlocked({
    totalXp: stats.totalXp,
    questsCompleted: stats.questsCompleted,
    approvedCategoryCounts,
    alreadyUnlockedIds,
  });
  if (newly.length === 0) return [];

  const now = new Date();
  await database.insert(schema.userAchievement).values(
    newly.map((id) => ({
      userId,
      achievementId: id,
      unlockedAt: now,
    })),
  );

  // Notification for each unlocked achievement (look up display name).
  const catalogById = new Map(ACHIEVEMENT_CATALOG.map((a) => [a.id, a]));
  await database.insert(schema.notification).values(
    newly.map((id) => {
      const def = catalogById.get(id);
      return {
        id: nanoid(),
        userId,
        title: "Achievement unlocked!",
        body: def?.name ?? id,
        type: "achievement_unlocked" as const,
        link: "/achievements",
        isRead: false,
        createdAt: now,
      };
    }),
  );

  return newly;
}

// Suppress "unused" import warning for inArray (kept for future bulk queries).
void inArray;
void sql;
