import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  schema,
  isChoreDueOn,
  type ChoreFrequency,
  applyDecision,
} from "@heroquest/db";
import { db } from "@/server/db";
import { getSessionContext } from "@/server/middleware";
import { getRequest } from "@tanstack/react-start/server";
import { localDateString } from "@/lib/dates";

// ---------- Lists ----------

export const listChoresForToday = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user || !ctx.profile?.familyId) return [];
  const today = localDateString(new Date(), ctx.profile.locale);
  return db()
    .select({
      instance: schema.choreInstance,
      chore: schema.recurringChore,
    })
    .from(schema.choreInstance)
    .innerJoin(
      schema.recurringChore,
      eq(schema.recurringChore.id, schema.choreInstance.recurringChoreId),
    )
    .where(
      and(
        eq(schema.choreInstance.userId, ctx.user.id),
        eq(schema.choreInstance.dueDate, today),
      ),
    );
});

export const listFamilyChores = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user || !ctx.profile?.familyId) return [];
  return db()
    .select()
    .from(schema.recurringChore)
    .where(eq(schema.recurringChore.familyId, ctx.profile.familyId));
});

// ---------- CRUD ----------

const choreInput = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(280).optional(),
  frequency: z.enum(["daily", "weekdays", "weekly", "custom"]),
  daysOfWeek: z.string().regex(/^[0-6](,[0-6])*$/).optional(),
  assignedUserId: z.string().optional(),
  defaultXp: z.number().int().min(1).max(500).default(25),
  defaultCoins: z.number().int().min(0).max(50).default(3),
});

function assertParent(ctx: { profile?: { role?: string; familyRole?: string | null } | null }) {
  const role = ctx.profile?.role;
  const fr = ctx.profile?.familyRole;
  if (role !== "admin" && role !== "parent" && fr !== "parent" && fr !== "guardian") {
    throw new Error("FORBIDDEN");
  }
}

export const createRecurringChore = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => choreInput.parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user || !ctx.profile?.familyId) throw new Error("NOT_IN_FAMILY");
    assertParent(ctx);
    const id = nanoid();
    await db().insert(schema.recurringChore).values({
      id,
      familyId: ctx.profile.familyId,
      title: data.title,
      description: data.description,
      frequency: data.frequency as ChoreFrequency,
      daysOfWeek: data.daysOfWeek,
      assignedUserId: data.assignedUserId,
      defaultXp: data.defaultXp,
      defaultCoins: data.defaultCoins,
      active: true,
      createdBy: ctx.user.id,
      createdAt: new Date(),
    });
    return { id };
  });

export const updateRecurringChore = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().min(1),
        active: z.boolean().optional(),
        title: z.string().max(80).optional(),
        defaultXp: z.number().int().min(1).max(500).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user || !ctx.profile?.familyId) throw new Error("NOT_IN_FAMILY");
    assertParent(ctx);
    const { id, ...rest } = data;
    await db()
      .update(schema.recurringChore)
      .set(rest)
      .where(
        and(
          eq(schema.recurringChore.id, id),
          eq(schema.recurringChore.familyId, ctx.profile.familyId),
        ),
      );
    return { ok: true };
  });

export const deleteRecurringChore = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user || !ctx.profile?.familyId) throw new Error("NOT_IN_FAMILY");
    assertParent(ctx);
    await db()
      .delete(schema.recurringChore)
      .where(
        and(
          eq(schema.recurringChore.id, data.id),
          eq(schema.recurringChore.familyId, ctx.profile.familyId),
        ),
      );
    return { ok: true };
  });

// ---------- Completion ----------

const markDoneInput = z.object({
  choreInstanceId: z.string().min(1),
  photoR2Key: z.string().min(1),
});

/**
 * Mark a chore instance done — creates an auto-approved quest with the
 * chore's template XP/coins and increments the kid's stats. A spot-review
 * notification goes to the family's parent so they can override if needed.
 */
export const markChoreDone = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => markDoneInput.parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user || !ctx.profile) throw new Error("UNAUTHORIZED");

    const database = db();
    const inst = await database
      .select({
        instance: schema.choreInstance,
        chore: schema.recurringChore,
      })
      .from(schema.choreInstance)
      .innerJoin(
        schema.recurringChore,
        eq(schema.recurringChore.id, schema.choreInstance.recurringChoreId),
      )
      .where(eq(schema.choreInstance.id, data.choreInstanceId))
      .limit(1)
      .then((r) => r[0]);

    if (!inst) throw new Error("INSTANCE_NOT_FOUND");
    if (inst.instance.userId !== ctx.user.id) throw new Error("FORBIDDEN");
    if (inst.instance.status !== "open") throw new Error("ALREADY_COMPLETED");

    const result = applyDecision(
      {
        totalXp: ctx.profile.totalXp,
        braveCoins: ctx.profile.braveCoins,
        questsCompleted: ctx.profile.questsCompleted,
      },
      {
        decision: "approved",
        xp: inst.chore.defaultXp,
        coins: inst.chore.defaultCoins,
      },
    );

    const questId = nanoid();
    const now = new Date();
    await database.batch([
      database.insert(schema.quest).values({
        id: questId,
        userId: ctx.user.id,
        description: `Chore: ${inst.chore.title}`,
        category: "family",
        photoR2Key: data.photoR2Key,
        status: "approved",
        xpAwarded: inst.chore.defaultXp,
        coinsAwarded: inst.chore.defaultCoins,
        source: "chore_instance",
        choreInstanceId: inst.instance.id,
        submittedAt: now,
        approvedAt: now,
      }),
      database
        .update(schema.choreInstance)
        .set({ status: "completed", completedQuestId: questId })
        .where(eq(schema.choreInstance.id, inst.instance.id)),
      database
        .update(schema.userProfile)
        .set({
          totalXp: result.newStats.totalXp,
          braveCoins: result.newStats.braveCoins,
          questsCompleted: result.newStats.questsCompleted,
          updatedAt: now,
        })
        .where(eq(schema.userProfile.userId, ctx.user.id)),
      database.insert(schema.notification).values({
        id: nanoid(),
        userId: ctx.user.id,
        title: "Chore done!",
        body: `+${inst.chore.defaultXp} XP, +${inst.chore.defaultCoins}c`,
        type: "quest_approved",
        link: "/dashboard",
        isRead: false,
        createdAt: now,
      }),
      // Spot-review notification for whoever created the chore.
      database.insert(schema.notification).values({
        id: nanoid(),
        userId: inst.chore.createdBy,
        title: "Spot-review",
        body: `${ctx.profile.username} completed: ${inst.chore.title}`,
        type: "chore_spot_review",
        link: "/family",
        isRead: false,
        createdAt: now,
      }),
    ] as any);

    return {
      ok: true,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
    };
  });

// Exposed so the cron route can call it.
export { isChoreDueOn };
