import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { schema, generateInviteCode, isInviteCodeShape } from "@heroquest/db";
import { db } from "@/server/db";
import { getSessionContext } from "@/server/middleware";
import { getRequest } from "@tanstack/react-start/server";

export const listFamilyMembers = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user || !ctx.profile?.familyId) return [];
  return db()
    .select({
      userId: schema.userProfile.userId,
      username: schema.userProfile.username,
      firstName: schema.userProfile.firstName,
      familyRole: schema.userProfile.familyRole,
      totalXp: schema.userProfile.totalXp,
      braveCoins: schema.userProfile.braveCoins,
      avatarConfig: schema.userProfile.avatarConfig,
    })
    .from(schema.userProfile)
    .where(eq(schema.userProfile.familyId, ctx.profile.familyId));
});

export const getMyFamily = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user || !ctx.profile?.familyId) return null;
  const row = await db()
    .select()
    .from(schema.family)
    .where(eq(schema.family.id, ctx.profile.familyId))
    .limit(1)
    .then((r) => r[0]);
  return row ?? null;
});

export const createFamily = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ name: z.string().min(1).max(60) }).parse(data),
  )
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user || !ctx.profile) throw new Error("UNAUTHORIZED");
    if (ctx.profile.familyId) throw new Error("ALREADY_IN_FAMILY");

    const database = db();
    // Try a few times to avoid invite-code collisions.
    let inviteCode = "";
    for (let i = 0; i < 5; i++) {
      const candidate = generateInviteCode();
      const exists = await database
        .select({ id: schema.family.id })
        .from(schema.family)
        .where(eq(schema.family.inviteCode, candidate))
        .limit(1)
        .then((r) => r[0]);
      if (!exists) {
        inviteCode = candidate;
        break;
      }
    }
    if (!inviteCode) throw new Error("INVITE_CODE_COLLISION");

    const id = nanoid();
    const now = new Date();
    await database.batch([
      database.insert(schema.family).values({
        id,
        name: data.name,
        inviteCode,
        createdBy: ctx.user.id,
        createdAt: now,
      }),
      database
        .update(schema.userProfile)
        .set({
          familyId: id,
          familyRole: ctx.profile.role === "parent" ? "parent" : "guardian",
          updatedAt: now,
        })
        .where(eq(schema.userProfile.userId, ctx.user.id)),
    ] as any);
    return { id, inviteCode };
  });

export const joinFamilyByCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ code: z.string().toUpperCase() }).parse(data),
  )
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user || !ctx.profile) throw new Error("UNAUTHORIZED");
    if (ctx.profile.familyId) throw new Error("ALREADY_IN_FAMILY");
    if (!isInviteCodeShape(data.code)) throw new Error("BAD_CODE");

    const fam = await db()
      .select()
      .from(schema.family)
      .where(eq(schema.family.inviteCode, data.code))
      .limit(1)
      .then((r) => r[0]);
    if (!fam) throw new Error("FAMILY_NOT_FOUND");

    await db()
      .update(schema.userProfile)
      .set({
        familyId: fam.id,
        familyRole: ctx.profile.role === "parent" ? "parent" : "child",
        updatedAt: new Date(),
      })
      .where(eq(schema.userProfile.userId, ctx.user.id));

    // Notify the parent who created the family.
    await db().insert(schema.notification).values({
      id: nanoid(),
      userId: fam.createdBy,
      title: "New hero in the family!",
      body: `${ctx.profile.username} joined your family.`,
      type: "family_join",
      link: "/family",
      isRead: false,
      createdAt: new Date(),
    });

    return { ok: true, family: fam };
  });

export const leaveFamily = createServerFn({ method: "POST" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user) throw new Error("UNAUTHORIZED");
  await db()
    .update(schema.userProfile)
    .set({ familyId: null, familyRole: null, updatedAt: new Date() })
    .where(eq(schema.userProfile.userId, ctx.user.id));
  return { ok: true };
});

export const regenerateInviteCode = createServerFn({ method: "POST" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user || !ctx.profile?.familyId) throw new Error("NOT_IN_FAMILY");
  if (ctx.profile.familyRole !== "parent" && ctx.profile.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  let code = "";
  for (let i = 0; i < 5; i++) {
    const candidate = generateInviteCode();
    const exists = await db()
      .select({ id: schema.family.id })
      .from(schema.family)
      .where(eq(schema.family.inviteCode, candidate))
      .limit(1)
      .then((r) => r[0]);
    if (!exists) {
      code = candidate;
      break;
    }
  }
  if (!code) throw new Error("INVITE_CODE_COLLISION");
  await db()
    .update(schema.family)
    .set({ inviteCode: code })
    .where(eq(schema.family.id, ctx.profile.familyId));
  return { inviteCode: code };
});

void and;
