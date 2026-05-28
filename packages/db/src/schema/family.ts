import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const family = sqliteTable("family", {
  id: text("id").primaryKey(), // nanoid
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(), // nanoid(8) — readable
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export type Family = typeof family.$inferSelect;
export type NewFamily = typeof family.$inferInsert;
