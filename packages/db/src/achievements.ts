/**
 * The 12 canonical achievement definitions (ported from
 * `apps/legacy/src/app/lib/achievements.ts`) plus the rule engine that
 * decides which ones a user has just unlocked.
 *
 * Pure functions — no DB access. The server passes in the user's profile
 * stats and the per-category counts; the function returns the IDs of any
 * newly-unlocked achievements so the caller can persist them.
 */
import type { QuestCategory } from "./types";

export type AchievementDef = {
  id: string;
  name: string; // Thai (default locale)
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string; // lucide-react icon name
};

export const ACHIEVEMENT_CATALOG: readonly AchievementDef[] = [
  {
    id: "first-quest",
    name: "ภารกิจแรก",
    nameEn: "First Quest",
    description: "ทำภารกิจดี ๆ ครั้งแรกสำเร็จ",
    descriptionEn: "Complete your very first good deed.",
    icon: "Sparkles",
  },
  {
    id: "quest-enthusiast",
    name: "นักผจญภัยตัวจริง",
    nameEn: "Quest Enthusiast",
    description: "ทำภารกิจสำเร็จ 5 ครั้ง",
    descriptionEn: "Complete 5 approved quests.",
    icon: "Compass",
  },
  {
    id: "legendary-hero",
    name: "วีรบุรุษในตำนาน",
    nameEn: "Legendary Hero",
    description: "ทำภารกิจสำเร็จ 20 ครั้ง",
    descriptionEn: "Complete 20 approved quests.",
    icon: "Crown",
  },
  {
    id: "xp-novice",
    name: "ผู้กล้าน้อย",
    nameEn: "XP Novice",
    description: "เก็บ XP ได้ 100 คะแนน",
    descriptionEn: "Earn 100 XP.",
    icon: "Star",
  },
  {
    id: "xp-master",
    name: "ปรมาจารย์ XP",
    nameEn: "XP Master",
    description: "เก็บ XP ได้ 1,000 คะแนน",
    descriptionEn: "Earn 1,000 XP.",
    icon: "Award",
  },
  {
    id: "xp-grandmaster",
    name: "มหาเซียน XP",
    nameEn: "XP Grandmaster",
    description: "เก็บ XP ได้ 5,000 คะแนน",
    descriptionEn: "Earn 5,000 XP.",
    icon: "Trophy",
  },
  {
    id: "earth-guardian",
    name: "ผู้พิทักษ์โลก",
    nameEn: "Earth Guardian",
    description: "ทำภารกิจหมวดสิ่งแวดล้อมสำเร็จ 3 ครั้ง",
    descriptionEn: "Complete 3 environment quests.",
    icon: "Leaf",
  },
  {
    id: "animal-friend",
    name: "มิตรของสัตว์",
    nameEn: "Animal Friend",
    description: "ทำภารกิจหมวดสัตว์สำเร็จ 3 ครั้ง",
    descriptionEn: "Complete 3 animal quests.",
    icon: "PawPrint",
  },
  {
    id: "community-pillar",
    name: "เสาหลักของชุมชน",
    nameEn: "Community Pillar",
    description: "ทำภารกิจหมวดชุมชนสำเร็จ 5 ครั้ง",
    descriptionEn: "Complete 5 community quests.",
    icon: "Users",
  },
  {
    id: "book-worm",
    name: "หนอนหนังสือ",
    nameEn: "Book Worm",
    description: "ทำภารกิจหมวดการศึกษาสำเร็จ 3 ครั้ง",
    descriptionEn: "Complete 3 education quests.",
    icon: "BookOpen",
  },
  {
    id: "health-hero",
    name: "ฮีโร่สุขภาพ",
    nameEn: "Health Hero",
    description: "ทำภารกิจหมวดสุขภาพสำเร็จ 3 ครั้ง",
    descriptionEn: "Complete 3 health quests.",
    icon: "Heart",
  },
  {
    id: "jack-of-all-deeds",
    name: "ผู้เชี่ยวชาญรอบด้าน",
    nameEn: "Jack of All Deeds",
    description: "ทำภารกิจครบทุกหมวด",
    descriptionEn: "Complete at least one quest in every category.",
    icon: "Medal",
  },
];

export type AchievementCheckInput = {
  totalXp: number;
  questsCompleted: number;
  approvedCategoryCounts: Partial<Record<QuestCategory, number>>;
  alreadyUnlockedIds: Set<string>;
};

/**
 * Returns the IDs of achievements that should be newly unlocked given the
 * user's current stats. Caller is responsible for persisting them.
 */
export function computeNewlyUnlocked(input: AchievementCheckInput): string[] {
  const newlyUnlocked: string[] = [];
  const { totalXp, questsCompleted, approvedCategoryCounts, alreadyUnlockedIds } = input;
  const cat = (name: QuestCategory) => approvedCategoryCounts[name] ?? 0;

  const tryUnlock = (id: string, condition: boolean) => {
    if (condition && !alreadyUnlockedIds.has(id)) newlyUnlocked.push(id);
  };

  tryUnlock("first-quest", questsCompleted >= 1);
  tryUnlock("quest-enthusiast", questsCompleted >= 5);
  tryUnlock("legendary-hero", questsCompleted >= 20);
  tryUnlock("xp-novice", totalXp >= 100);
  tryUnlock("xp-master", totalXp >= 1000);
  tryUnlock("xp-grandmaster", totalXp >= 5000);
  tryUnlock("earth-guardian", cat("environment") >= 3);
  tryUnlock("animal-friend", cat("animals") >= 3);
  tryUnlock("community-pillar", cat("community") >= 5);
  tryUnlock("book-worm", cat("education") >= 3);
  tryUnlock("health-hero", cat("health") >= 3);
  tryUnlock(
    "jack-of-all-deeds",
    cat("environment") >= 1 &&
      cat("animals") >= 1 &&
      cat("community") >= 1 &&
      cat("education") >= 1 &&
      cat("health") >= 1,
  );

  return newlyUnlocked;
}
