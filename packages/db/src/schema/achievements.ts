import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

/**
 * Achievement catalog — the 12 legacy IDs are the canonical set:
 * first-quest, quest-enthusiast, legendary-hero, xp-novice, xp-master,
 * xp-grandmaster, earth-guardian, animal-friend, community-pillar,
 * book-worm, health-hero, jack-of-all-deeds.
 *
 * Stored EN strings live in `name_en`/`description_en`; primary `name`/
 * `description` columns are the user's locale-default (Thai).
 */
export const achievement = sqliteTable("achievement", {
  id: text("id").primaryKey(), // 'first-quest' etc.
  name: text("name").notNull(),
  nameEn: text("name_en"),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  icon: text("icon").notNull(), // lucide-react icon name
});

export const userAchievement = sqliteTable(
  "user_achievement",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    achievementId: text("achievement_id")
      .notNull()
      .references(() => achievement.id),
    unlockedAt: integer("unlocked_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.achievementId] }),
  }),
);

export type Achievement = typeof achievement.$inferSelect;
export type UserAchievement = typeof userAchievement.$inferSelect;
