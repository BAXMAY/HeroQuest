/**
 * Rarity bucketing for quests, keyed off the XP reward.
 * Drives QuestCard borders, badges, and the legendary shimmer animation.
 */
export type Rarity = "common" | "rare" | "epic" | "legendary";

export function rarityFromXp(xp: number): Rarity {
  if (xp >= 150) return "legendary";
  if (xp >= 100) return "epic";
  if (xp >= 50) return "rare";
  return "common";
}

export const RARITY_LABELS: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};
