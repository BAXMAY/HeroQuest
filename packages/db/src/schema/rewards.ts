import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { RedemptionStatus } from "../types";
import { user } from "./auth";

export const reward = sqliteTable("reward", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  cost: integer("cost").notNull(),
  imageUrl: text("image_url").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const redeemedReward = sqliteTable("redeemed_reward", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  rewardId: text("reward_id")
    .notNull()
    .references(() => reward.id),
  costAtTime: integer("cost_at_time").notNull(),
  status: text("status").$type<RedemptionStatus>().notNull().default("processing"),
  redeemedAt: integer("redeemed_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  shippedAt: integer("shipped_at", { mode: "timestamp_ms" }),
  deliveredAt: integer("delivered_at", { mode: "timestamp_ms" }),
});

export type Reward = typeof reward.$inferSelect;
export type RedeemedReward = typeof redeemedReward.$inferSelect;
