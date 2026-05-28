import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { schema, applyRedemption } from "@heroquest/db";
import { db } from "@/server/db";
import { getSessionContext } from "@/server/middleware";
import { getRequest } from "@tanstack/react-start/server";

export const listRewards = createServerFn({ method: "GET" }).handler(async () => {
  return db()
    .select()
    .from(schema.reward)
    .where(eq(schema.reward.active, true))
    .orderBy(schema.reward.cost);
});

export const listMyRedemptions = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user) throw new Error("UNAUTHORIZED");
  return db()
    .select({
      redemption: schema.redeemedReward,
      reward: schema.reward,
    })
    .from(schema.redeemedReward)
    .innerJoin(schema.reward, eq(schema.reward.id, schema.redeemedReward.rewardId))
    .where(eq(schema.redeemedReward.userId, ctx.user.id))
    .orderBy(desc(schema.redeemedReward.redeemedAt));
});

export const redeemReward = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ rewardId: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user || !ctx.profile) throw new Error("UNAUTHORIZED");

    const database = db();
    const reward = await database
      .select()
      .from(schema.reward)
      .where(eq(schema.reward.id, data.rewardId))
      .limit(1)
      .then((r) => r[0]);
    if (!reward) throw new Error("REWARD_NOT_FOUND");
    if (!reward.active) throw new Error("REWARD_INACTIVE");

    // applyRedemption throws if unaffordable — surfaces a clean error.
    const result = applyRedemption({
      currentCoins: ctx.profile.braveCoins,
      cost: reward.cost,
    });

    const redemptionId = nanoid();
    const now = new Date();
    await database.batch([
      database
        .update(schema.userProfile)
        .set({ braveCoins: result.newCoins, updatedAt: now })
        .where(eq(schema.userProfile.userId, ctx.user.id)),
      database.insert(schema.redeemedReward).values({
        id: redemptionId,
        userId: ctx.user.id,
        rewardId: reward.id,
        costAtTime: reward.cost,
        status: "processing",
        redeemedAt: now,
      }),
      database.insert(schema.notification).values({
        id: nanoid(),
        userId: ctx.user.id,
        title: "Reward claimed!",
        body: `${reward.name} is on its way.`,
        type: "reward_redeemed",
        link: "/rewards",
        isRead: false,
        createdAt: now,
      }),
    ] as any);
    return { id: redemptionId, newCoins: result.newCoins };
  });

export const updateRedemptionStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().min(1),
        status: z.enum(["processing", "shipped", "delivered"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user || !ctx.profile) throw new Error("UNAUTHORIZED");
    if (ctx.profile.role !== "admin" && ctx.profile.role !== "parent") {
      throw new Error("FORBIDDEN");
    }
    const now = new Date();
    const update: Record<string, unknown> = { status: data.status };
    if (data.status === "shipped") update.shippedAt = now;
    if (data.status === "delivered") update.deliveredAt = now;
    await db()
      .update(schema.redeemedReward)
      .set(update)
      .where(eq(schema.redeemedReward.id, data.id));
    return { ok: true };
  });

// ---------- Catalog CRUD (admin only) ----------

const rewardInput = z.object({
  name: z.string().min(1).max(80),
  nameEn: z.string().max(80).optional(),
  description: z.string().min(1).max(500),
  descriptionEn: z.string().max(500).optional(),
  cost: z.number().int().min(1).max(100_000),
  imageUrl: z.string().min(1).max(500),
  active: z.boolean().default(true),
});

function assertAdmin(ctx: { profile?: { role?: string } | null }) {
  if (ctx.profile?.role !== "admin") throw new Error("FORBIDDEN");
}

/** List all rewards (including inactive) — admin CRUD page. */
export const listAllRewards = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user) throw new Error("UNAUTHORIZED");
  assertAdmin(ctx);
  return db().select().from(schema.reward).orderBy(schema.reward.cost);
});

export const createReward = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => rewardInput.parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user) throw new Error("UNAUTHORIZED");
    assertAdmin(ctx);
    const id = nanoid();
    await db().insert(schema.reward).values({
      id,
      name: data.name,
      nameEn: data.nameEn,
      description: data.description,
      descriptionEn: data.descriptionEn,
      cost: data.cost,
      imageUrl: data.imageUrl,
      active: data.active,
      createdAt: new Date(),
    });
    return { id };
  });

export const updateReward = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    rewardInput.partial().extend({ id: z.string().min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user) throw new Error("UNAUTHORIZED");
    assertAdmin(ctx);
    const { id, ...rest } = data;
    if (Object.keys(rest).length === 0) return { ok: true };
    await db().update(schema.reward).set(rest).where(eq(schema.reward.id, id));
    return { ok: true };
  });

export const deleteReward = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user) throw new Error("UNAUTHORIZED");
    assertAdmin(ctx);
    // Soft-delete via active=false to preserve the FK from redeemed_reward.
    await db()
      .update(schema.reward)
      .set({ active: false })
      .where(eq(schema.reward.id, data.id));
    return { ok: true };
  });
