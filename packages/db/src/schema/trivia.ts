import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { Locale, TriviaOptions } from "../types";

/**
 * AI-generated trivia question bank. The daily cron generates N questions per
 * locale with `date_pool = today`; the runtime selects one from today's pool
 * and stores its ID in KV for sub-ms lookup.
 */
export const triviaQuestion = sqliteTable(
  "trivia_question",
  {
    id: text("id").primaryKey(),
    locale: text("locale").$type<Locale>().notNull(),
    datePool: text("date_pool"), // YYYY-MM-DD or null = evergreen pool
    question: text("question").notNull(),
    options: text("options", { mode: "json" }).$type<TriviaOptions>().notNull(),
    correctIndex: integer("correct_index").notNull(),
    explanation: text("explanation"),
    difficulty: text("difficulty", { enum: ["easy", "medium"] }),
    topic: text("topic"), // 'kindness' | 'honesty' | etc.
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    poolIdx: index("idx_trivia_pool").on(t.locale, t.datePool),
  }),
);

export type TriviaQuestion = typeof triviaQuestion.$inferSelect;
