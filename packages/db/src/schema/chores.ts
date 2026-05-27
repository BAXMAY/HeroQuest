import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { ChoreFrequency, ChoreInstanceStatus } from "../types";
import { user } from "./auth";
import { family } from "./family";
import { quest } from "./quests";

export const recurringChore = sqliteTable("recurring_chore", {
  id: text("id").primaryKey(),
  familyId: text("family_id")
    .notNull()
    .references(() => family.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  frequency: text("frequency").$type<ChoreFrequency>().notNull(),
  daysOfWeek: text("days_of_week"), // CSV "0,1,2" (Sun=0), only when frequency='custom'
  assignedUserId: text("assigned_user_id").references(() => user.id), // null = anyone in family
  defaultXp: integer("default_xp").notNull().default(25),
  defaultCoins: integer("default_coins").notNull().default(3),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const choreInstance = sqliteTable(
  "chore_instance",
  {
    id: text("id").primaryKey(),
    recurringChoreId: text("recurring_chore_id")
      .notNull()
      .references(() => recurringChore.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    dueDate: text("due_date").notNull(), // YYYY-MM-DD
    status: text("status").$type<ChoreInstanceStatus>().notNull().default("open"),
    completedQuestId: text("completed_quest_id").references(() => quest.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    perDayUnique: uniqueIndex("uq_chore_instance_per_day").on(
      t.recurringChoreId,
      t.userId,
      t.dueDate,
    ),
  }),
);

export type RecurringChore = typeof recurringChore.$inferSelect;
export type ChoreInstance = typeof choreInstance.$inferSelect;
