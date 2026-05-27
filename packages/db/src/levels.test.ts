import { describe, expect, it } from "vitest";
import { getLevelFromXP, getLevelProgress, LEVELS, getNextLevel } from "./levels";

describe("levels", () => {
  it("has exactly 100 levels", () => {
    expect(LEVELS).toHaveLength(100);
  });

  it("starts at Novice Adventurer with minXP=0", () => {
    expect(LEVELS[0]).toEqual({ level: 1, title: "Novice Adventurer", minXP: 0 });
  });

  it("ends at level 100 'The Unwritten'", () => {
    expect(LEVELS[99]?.level).toBe(100);
    expect(LEVELS[99]?.title).toBe("The Unwritten");
  });

  it("monotonically increases minXP", () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i]!.minXP).toBeGreaterThan(LEVELS[i - 1]!.minXP);
    }
  });

  it("matches the legacy curve floor(100 * (level-1)^1.55)", () => {
    expect(LEVELS[1]!.minXP).toBe(Math.floor(100 * Math.pow(1, 1.55))); // 100
    expect(LEVELS[9]!.minXP).toBe(Math.floor(100 * Math.pow(9, 1.55)));
    expect(LEVELS[49]!.minXP).toBe(Math.floor(100 * Math.pow(49, 1.55)));
  });
});

describe("getLevelFromXP", () => {
  it("returns level 1 for 0 XP or undefined", () => {
    expect(getLevelFromXP(0).level).toBe(1);
    expect(getLevelFromXP(undefined).level).toBe(1);
    expect(getLevelFromXP(null).level).toBe(1);
  });

  it("returns the highest level whose minXP <= xp", () => {
    expect(getLevelFromXP(99).level).toBe(1);
    expect(getLevelFromXP(100).level).toBe(2);
    expect(getLevelFromXP(LEVELS[9]!.minXP).level).toBe(10);
    expect(getLevelFromXP(LEVELS[9]!.minXP - 1).level).toBe(9);
  });

  it("caps at level 100 for absurdly high XP", () => {
    expect(getLevelFromXP(10_000_000).level).toBe(100);
  });
});

describe("getLevelProgress", () => {
  it("returns 0 progress at level boundary", () => {
    const p = getLevelProgress(LEVELS[4]!.minXP);
    expect(p.current.level).toBe(5);
    expect(p.xpIntoLevel).toBe(0);
  });

  it("returns fractionToNext between 0 and 1 for in-between XP", () => {
    const between = (LEVELS[3]!.minXP + LEVELS[4]!.minXP) / 2;
    const p = getLevelProgress(Math.floor(between));
    expect(p.fractionToNext).toBeGreaterThan(0);
    expect(p.fractionToNext).toBeLessThan(1);
  });

  it("returns null next + fractionToNext=1 at max level", () => {
    const p = getLevelProgress(LEVELS[99]!.minXP + 999);
    expect(p.current.level).toBe(100);
    expect(p.next).toBeNull();
    expect(p.fractionToNext).toBe(1);
  });
});

describe("getNextLevel", () => {
  it("returns the next level for non-max levels", () => {
    expect(getNextLevel(LEVELS[0]!)?.level).toBe(2);
  });
  it("returns null at level 100", () => {
    expect(getNextLevel(LEVELS[99]!)).toBeNull();
  });
});
