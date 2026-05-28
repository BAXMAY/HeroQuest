import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

/**
 * One row per user per local-calendar day of activity.
 * `(user_id, date)` is a natural PK and gives us idempotent daily check-ins.
 */
export const dailyStreakLog = sqliteTable(
  "daily_streak_log",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD user-local
    xpAwarded: integer("xp_awarded").notNull().default(0),
    source: text("source", { enum: ["login", "streak_bonus"] })
      .notNull()
      .default("login"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.date] }),
  }),
);

export type DailyStreakLog = typeof dailyStreakLog.$inferSelect;
