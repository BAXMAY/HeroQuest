import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { QuestCategory, QuestSource, QuestStatus } from "../types";
import { user } from "./auth";

/**
 * Submitted good deeds (legacy "deeds" / "volunteer_work" collection).
 *
 * `source = 'chore_instance'` links back to a parent-defined recurring chore
 * — those quests auto-approve with the chore's default XP/coins but still
 * require a photo. `chore_instance_id` FK declared lazily via SQL to avoid a
 * circular import with the chores schema module.
 */
export const quest = sqliteTable(
  "quest",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    description: text("description").notNull(),
    category: text("category").$type<QuestCategory>().notNull(),
    photoR2Key: text("photo_r2_key").notNull(),

    status: text("status").$type<QuestStatus>().notNull().default("pending"),
    xpAwarded: integer("xp_awarded").notNull().default(0),
    coinsAwarded: integer("coins_awarded").notNull().default(0),
    aiJustification: text("ai_justification"),

    source: text("source").$type<QuestSource>().notNull().default("submission"),
    choreInstanceId: text("chore_instance_id"), // FK enforced in migration SQL

    submittedAt: integer("submitted_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    approvedAt: integer("approved_at", { mode: "timestamp_ms" }),
    approvedBy: text("approved_by").references(() => user.id),
  },
  (t) => ({
    userStatusIdx: index("idx_quest_user_status").on(t.userId, t.status),
    statusSubmittedIdx: index("idx_quest_status_submitted").on(t.status, t.submittedAt),
  }),
);

export type Quest = typeof quest.$inferSelect;
export type NewQuest = typeof quest.$inferInsert;
