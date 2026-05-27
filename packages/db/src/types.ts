/**
 * Shared TypeScript types for JSON columns and enums in the D1 schema.
 *
 * Pure types only — no runtime imports — so this module can be imported from
 * Workers, the browser, or build scripts without bundler grief.
 */

// ---- Avatar (react-nice-avatar config, ported verbatim from legacy types) ----

export type AvatarConfig = {
  faceColor: string;
  hairColor: string;
  hatColor: string;
  shirtColor: string;
  bgColor: string;
  earSize: "small" | "big";
  eyeType: "circle" | "oval" | "smile" | "shadow" | "round";
  eyeStyle: "circle" | "shadow" | "round";
  eyebrowStyle: "raised" | "leftLowered" | "serious" | "angry" | "concerned";
  hairStyle: "normal" | "thick" | "mohawk" | "womanLong" | "womanShort" | "womanBig" | "none";
  hatStyle: "none" | "beanie" | "turban" | "party" | "hijab";
  mouthStyle: "laugh" | "smile" | "peace" | "sad" | "tongue";
  noseStyle: "short" | "long" | "round";
  shirtStyle: "hoody" | "polo" | "shirt";
  glassesStyle: "none" | "round" | "square";
};

// ---- Enums ----

export const USER_ROLES = ["student", "admin", "parent"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const FAMILY_ROLES = ["child", "parent", "guardian"] as const;
export type FamilyRole = (typeof FAMILY_ROLES)[number];

export const QUEST_STATUSES = ["draft", "pending", "approved", "rejected"] as const;
export type QuestStatus = (typeof QUEST_STATUSES)[number];

export const QUEST_SOURCES = ["submission", "chore_instance"] as const;
export type QuestSource = (typeof QUEST_SOURCES)[number];

export const QUEST_CATEGORIES = [
  "family",
  "environment",
  "animals",
  "community",
  "education",
  "health",
] as const;
export type QuestCategory = (typeof QUEST_CATEGORIES)[number];

export const REDEMPTION_STATUSES = ["processing", "shipped", "delivered"] as const;
export type RedemptionStatus = (typeof REDEMPTION_STATUSES)[number];

export const CHORE_FREQUENCIES = ["daily", "weekdays", "weekly", "custom"] as const;
export type ChoreFrequency = (typeof CHORE_FREQUENCIES)[number];

export const CHORE_INSTANCE_STATUSES = ["open", "completed", "skipped"] as const;
export type ChoreInstanceStatus = (typeof CHORE_INSTANCE_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  "quest_approved",
  "quest_rejected",
  "achievement_unlocked",
  "level_up",
  "reward_redeemed",
  "reward_shipped",
  "reward_delivered",
  "streak_milestone",
  "family_join",
  "chore_assigned",
  "chore_spot_review",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const MINI_GAMES = ["spin", "memory", "trivia"] as const;
export type MiniGame = (typeof MINI_GAMES)[number];

export const LOCALES = ["en", "th"] as const;
export type Locale = (typeof LOCALES)[number];

// ---- Mini-game payloads (JSON column shapes) ----

export type SpinPayload = {
  prize: "coins-5" | "coins-10" | "coins-20" | "coins-50" | "xp-25" | "xp-50" | "xp-100" | "none";
  segmentIndex: number;
};

export type MemoryPayload = {
  moves: number;
  timeMs: number;
  score: number;
};

export type TriviaPayload = {
  questionId: string;
  chosenIndex: number;
  correct: boolean;
};

export type MiniGameAttemptPayload = SpinPayload | MemoryPayload | TriviaPayload;

// ---- Trivia options column shape ----

export type TriviaOptions = [string, string, string, string];
