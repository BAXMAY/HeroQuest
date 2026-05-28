import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { MiniGame, MiniGameAttemptPayload } from "../types";
import { user } from "./auth";

/**
 * One row per user/game/local-day. The unique index enforces the
 * "one play per day" rule directly at the DB layer — no race conditions.
 */
export const miniGameAttempt = sqliteTable(
  "mini_game_attempt",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    game: text("game").$type<MiniGame>().notNull(),
    date: text("date").notNull(), // YYYY-MM-DD
    payload: text("payload", { mode: "json" }).$type<MiniGameAttemptPayload>(),
    xpAwarded: integer("xp_awarded").notNull().default(0),
    coinsAwarded: integer("coins_awarded").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    onePerDay: uniqueIndex("uq_mini_game_per_day").on(t.userId, t.game, t.date),
  }),
);

export type MiniGameAttempt = typeof miniGameAttempt.$inferSelect;
