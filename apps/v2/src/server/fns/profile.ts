import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { schema } from "@heroquest/db";
import type { AvatarConfig, Locale } from "@heroquest/db/types";
import { db } from "@/server/db";
import { getSessionContext } from "@/server/middleware";
import { getRequest } from "@tanstack/react-start/server";

const onboardingInput = z.object({
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_-]+$/, "Username: letters, numbers, _ or - only"),
  firstName: z.string().min(1).max(40),
  lastName: z.string().max(40).optional(),
  gender: z.enum(["male", "female"]).optional(),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Birthday must be YYYY-MM-DD")
    .optional(),
  locale: z.enum(["en", "th"]).default("th"),
});

const DEFAULT_AVATAR: AvatarConfig = {
  faceColor: "#F9C9B6",
  hairColor: "#000",
  hatColor: "#000",
  shirtColor: "#9287FF",
  bgColor: "#E0DDFF",
  earSize: "small",
  eyeType: "oval",
  eyeStyle: "circle",
  eyebrowStyle: "raised",
  hairStyle: "normal",
  hatStyle: "none",
  mouthStyle: "smile",
  noseStyle: "short",
  shirtStyle: "hoody",
  glassesStyle: "none",
};

export const getMe = createServerFn({ method: "GET" }).handler(async () => {
  const ctx = await getSessionContext(getRequest());
  if (!ctx.user) return { user: null, profile: null };
  return { user: ctx.user, profile: ctx.profile };
});

export const completeOnboarding = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => onboardingInput.parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user) throw new Error("UNAUTHORIZED");

    const database = db();
    const now = new Date();

    // Insert or update — onboarding may be re-run if profile is incomplete.
    const existing = await database
      .select()
      .from(schema.userProfile)
      .where(eq(schema.userProfile.userId, ctx.user.id))
      .limit(1)
      .then((r) => r[0]);

    if (existing) {
      await database
        .update(schema.userProfile)
        .set({
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          birthday: data.birthday,
          locale: data.locale as Locale,
          updatedAt: now,
        })
        .where(eq(schema.userProfile.userId, ctx.user.id));
    } else {
      await database.insert(schema.userProfile).values({
        userId: ctx.user.id,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        birthday: data.birthday,
        locale: data.locale as Locale,
        role: "student",
        avatarConfig: DEFAULT_AVATAR,
        createdAt: now,
        updatedAt: now,
      });
    }
    return { ok: true };
  });

export const updateAvatar = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ avatarConfig: z.any() }).parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user) throw new Error("UNAUTHORIZED");
    await db()
      .update(schema.userProfile)
      .set({ avatarConfig: data.avatarConfig as AvatarConfig, updatedAt: new Date() })
      .where(eq(schema.userProfile.userId, ctx.user.id));
    return { ok: true };
  });

export const setLeaderboardOptIn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ visible: z.boolean() }).parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user) throw new Error("UNAUTHORIZED");
    await db()
      .update(schema.userProfile)
      .set({ showOnLeaderboard: data.visible, updatedAt: new Date() })
      .where(eq(schema.userProfile.userId, ctx.user.id));
    return { ok: true };
  });

export const setLocale = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ locale: z.enum(["en", "th"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user) throw new Error("UNAUTHORIZED");
    await db()
      .update(schema.userProfile)
      .set({ locale: data.locale as Locale, updatedAt: new Date() })
      .where(eq(schema.userProfile.userId, ctx.user.id));
    return { ok: true };
  });

void nanoid;
