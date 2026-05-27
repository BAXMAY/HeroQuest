import { describe, expect, it } from "vitest";
import { ACHIEVEMENT_CATALOG, computeNewlyUnlocked } from "./achievements";

describe("ACHIEVEMENT_CATALOG", () => {
  it("contains exactly the 12 legacy IDs", () => {
    const ids = ACHIEVEMENT_CATALOG.map((a) => a.id).sort();
    expect(ids).toEqual(
      [
        "animal-friend",
        "book-worm",
        "community-pillar",
        "earth-guardian",
        "first-quest",
        "health-hero",
        "jack-of-all-deeds",
        "legendary-hero",
        "quest-enthusiast",
        "xp-grandmaster",
        "xp-master",
        "xp-novice",
      ].sort(),
    );
  });

  it("every entry has both Thai and English copy", () => {
    for (const a of ACHIEVEMENT_CATALOG) {
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.nameEn.length).toBeGreaterThan(0);
      expect(a.description.length).toBeGreaterThan(0);
      expect(a.descriptionEn.length).toBeGreaterThan(0);
      expect(a.icon.length).toBeGreaterThan(0);
    }
  });
});

describe("computeNewlyUnlocked", () => {
  const noneUnlocked = new Set<string>();

  it("unlocks first-quest at 1 completed quest", () => {
    expect(
      computeNewlyUnlocked({
        totalXp: 0,
        questsCompleted: 1,
        approvedCategoryCounts: {},
        alreadyUnlockedIds: noneUnlocked,
      }),
    ).toContain("first-quest");
  });

  it("unlocks quest-enthusiast at 5 and legendary-hero at 20", () => {
    expect(
      computeNewlyUnlocked({
        totalXp: 0,
        questsCompleted: 5,
        approvedCategoryCounts: {},
        alreadyUnlockedIds: noneUnlocked,
      }),
    ).toEqual(expect.arrayContaining(["first-quest", "quest-enthusiast"]));

    expect(
      computeNewlyUnlocked({
        totalXp: 0,
        questsCompleted: 20,
        approvedCategoryCounts: {},
        alreadyUnlockedIds: noneUnlocked,
      }),
    ).toEqual(expect.arrayContaining(["first-quest", "quest-enthusiast", "legendary-hero"]));
  });

  it("unlocks xp tiers at 100 / 1000 / 5000 XP", () => {
    expect(
      computeNewlyUnlocked({
        totalXp: 99,
        questsCompleted: 0,
        approvedCategoryCounts: {},
        alreadyUnlockedIds: noneUnlocked,
      }),
    ).not.toContain("xp-novice");
    expect(
      computeNewlyUnlocked({
        totalXp: 100,
        questsCompleted: 0,
        approvedCategoryCounts: {},
        alreadyUnlockedIds: noneUnlocked,
      }),
    ).toContain("xp-novice");
    expect(
      computeNewlyUnlocked({
        totalXp: 5000,
        questsCompleted: 0,
        approvedCategoryCounts: {},
        alreadyUnlockedIds: noneUnlocked,
      }),
    ).toEqual(expect.arrayContaining(["xp-novice", "xp-master", "xp-grandmaster"]));
  });

  it("unlocks category achievements at correct thresholds", () => {
    expect(
      computeNewlyUnlocked({
        totalXp: 0,
        questsCompleted: 0,
        approvedCategoryCounts: { environment: 3 },
        alreadyUnlockedIds: noneUnlocked,
      }),
    ).toContain("earth-guardian");
    expect(
      computeNewlyUnlocked({
        totalXp: 0,
        questsCompleted: 0,
        approvedCategoryCounts: { community: 5 },
        alreadyUnlockedIds: noneUnlocked,
      }),
    ).toContain("community-pillar");
  });

  it("unlocks jack-of-all-deeds only when all 5 categories are touched", () => {
    expect(
      computeNewlyUnlocked({
        totalXp: 0,
        questsCompleted: 0,
        approvedCategoryCounts: {
          environment: 1,
          animals: 1,
          community: 1,
          education: 1,
          health: 1,
        },
        alreadyUnlockedIds: noneUnlocked,
      }),
    ).toContain("jack-of-all-deeds");

    expect(
      computeNewlyUnlocked({
        totalXp: 0,
        questsCompleted: 0,
        approvedCategoryCounts: {
          environment: 1,
          animals: 1,
          community: 1,
          education: 1,
          // health missing
        },
        alreadyUnlockedIds: noneUnlocked,
      }),
    ).not.toContain("jack-of-all-deeds");
  });

  it("does not re-unlock achievements already in alreadyUnlockedIds", () => {
    const already = new Set(["first-quest", "xp-novice"]);
    const out = computeNewlyUnlocked({
      totalXp: 100,
      questsCompleted: 1,
      approvedCategoryCounts: {},
      alreadyUnlockedIds: already,
    });
    expect(out).not.toContain("first-quest");
    expect(out).not.toContain("xp-novice");
  });
});
