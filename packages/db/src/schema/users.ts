import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { AvatarConfig, FamilyRole, Locale, UserRole } from "../types";
import { user } from "./auth";
import { family } from "./family";

/**
 * Per-user profile (1:1 with Better Auth `user`). Holds all game stats,
 * preferences, and the avatar config that drives react-nice-avatar.
 *
 * Locale-aware date columns (`streak_last_visit`) store an ISO `YYYY-MM-DD`
 * truncated to the user's local timezone — the streak is a calendar concept,
 * not a wall-clock one.
 */
export const userProfile = sqliteTable(
  "user_profile",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),

    username: text("username").notNull().unique(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    gender: text("gender", { enum: ["male", "female"] }),
    birthday: text("birthday"), // ISO YYYY-MM-DD
    locale: text("locale").$type<Locale>().notNull().default("th"),

    role: text("role").$type<UserRole>().notNull().default("student"),
    familyId: text("family_id").references(() => family.id, { onDelete: "set null" }),
    familyRole: text("family_role").$type<FamilyRole>(),

    avatarConfig: text("avatar_config", { mode: "json" }).$type<AvatarConfig>(),
    profilePicture: text("profile_picture"),

    totalXp: integer("total_xp").notNull().default(0),
    braveCoins: integer("brave_coins").notNull().default(0),
    questsCompleted: integer("quests_completed").notNull().default(0),
    showOnLeaderboard: integer("show_on_leaderboard", { mode: "boolean" })
      .notNull()
      .default(true),

    streakCurrent: integer("streak_current").notNull().default(0),
    streakLongest: integer("streak_longest").notNull().default(0),
    streakLastVisit: text("streak_last_visit"), // YYYY-MM-DD

    soundEnabled: integer("sound_enabled", { mode: "boolean" }).notNull().default(true),
    musicEnabled: integer("music_enabled", { mode: "boolean" }).notNull().default(true),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    xpIdx: index("idx_profile_xp").on(t.totalXp),
    familyIdx: index("idx_profile_family").on(t.familyId),
  }),
);

export type UserProfile = typeof userProfile.$inferSelect;
export type NewUserProfile = typeof userProfile.$inferInsert;
