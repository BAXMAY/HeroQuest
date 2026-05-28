import { describe, expect, it } from "vitest";
import {
  applyDailyCheckIn,
  chooseSpinPrize,
  scoreMemory,
  STREAK_MILESTONES,
  triviaReward,
} from "./games";

describe("applyDailyCheckIn", () => {
  it("first-ever visit starts streak at 1", () => {
    const r = applyDailyCheckIn(
      { current: 0, longest: 0, lastVisit: null },
      "2025-06-01",
    );
    expect(r.next).toEqual({ current: 1, longest: 1, lastVisit: "2025-06-01" });
    expect(r.extended).toBe(true);
  });

  it("same-day check-in is idempotent", () => {
    const state = { current: 5, longest: 7, lastVisit: "2025-06-01" };
    const r = applyDailyCheckIn(state, "2025-06-01");
    expect(r.next).toEqual(state);
    expect(r.extended).toBe(false);
    expect(r.bonusXp).toBe(0);
  });

  it("next-day check-in extends by 1", () => {
    const r = applyDailyCheckIn(
      { current: 4, longest: 4, lastVisit: "2025-06-01" },
      "2025-06-02",
    );
    expect(r.next.current).toBe(5);
    expect(r.next.longest).toBe(5);
    expect(r.extended).toBe(true);
  });

  it("gap >1 day resets streak to 1", () => {
    const r = applyDailyCheckIn(
      { current: 14, longest: 14, lastVisit: "2025-06-01" },
      "2025-06-05",
    );
    expect(r.next.current).toBe(1);
    expect(r.next.longest).toBe(14); // longest preserved
    expect(r.extended).toBe(false);
  });

  it("awards milestone bonus XP on 3/7/14/30/60/100 days", () => {
    for (const days of [3, 7, 14, 30, 60, 100]) {
      const r = applyDailyCheckIn(
        { current: days - 1, longest: days - 1, lastVisit: "2025-06-01" },
        "2025-06-02",
      );
      expect(r.milestone).toBe(true);
      expect(r.bonusXp).toBe(STREAK_MILESTONES[days]);
    }
  });

  it("does not award bonus on non-milestone days", () => {
    const r = applyDailyCheckIn(
      { current: 5, longest: 5, lastVisit: "2025-06-01" },
      "2025-06-02",
    );
    expect(r.milestone).toBe(false);
    expect(r.bonusXp).toBe(0);
  });
});

describe("chooseSpinPrize", () => {
  it("returns valid prize for boundary randoms 0 and ~1", () => {
    expect(chooseSpinPrize(0).prize).toBe("coins-5");
    expect(chooseSpinPrize(0.999999).prize).toBe("none");
  });

  it("computes XP/coins consistent with the prize", () => {
    const r = chooseSpinPrize(0.5);
    if (r.prize === "coins-20") expect(r).toMatchObject({ coins: 20, xp: 0 });
    if (r.prize === "xp-50") expect(r).toMatchObject({ xp: 50, coins: 0 });
    if (r.prize === "none") expect(r).toMatchObject({ xp: 0, coins: 0 });
  });

  it("distribution roughly matches weights over many samples", () => {
    const counts: Record<string, number> = {};
    const N = 10_000;
    let seed = 42;
    function nextRandom(): number {
      // LCG for determinism
      seed = (seed * 1664525 + 1013904223) % 2 ** 32;
      return seed / 2 ** 32;
    }
    for (let i = 0; i < N; i++) {
      const r = chooseSpinPrize(nextRandom());
      counts[r.prize] = (counts[r.prize] ?? 0) + 1;
    }
    // The lowest-weight prize ("none", weight=1 of 100) should be rare.
    expect((counts["none"] ?? 0) / N).toBeLessThan(0.03);
    // The highest-weight prize ("coins-5", weight=30 of 100) should be most common.
    const max = Math.max(...Object.values(counts));
    expect(counts["coins-5"]).toBe(max);
  });
});

describe("scoreMemory", () => {
  it("perfect game (12 moves, 30s) earns max-ish score", () => {
    const r = scoreMemory({ moves: 12, timeMs: 30_000 });
    expect(r.score).toBe(850);
    expect(r.xp).toBeGreaterThan(15);
    expect(r.coins).toBeGreaterThan(3);
  });

  it("more moves drops the score", () => {
    const ok = scoreMemory({ moves: 12, timeMs: 30_000 });
    const sloppy = scoreMemory({ moves: 40, timeMs: 30_000 });
    expect(sloppy.score).toBeLessThan(ok.score);
  });

  it("more time also drops the score", () => {
    const fast = scoreMemory({ moves: 12, timeMs: 10_000 });
    const slow = scoreMemory({ moves: 12, timeMs: 120_000 });
    expect(slow.score).toBeLessThan(fast.score);
  });

  it("never goes negative", () => {
    expect(scoreMemory({ moves: 999, timeMs: 999_999 }).score).toBe(0);
  });
});

describe("triviaReward", () => {
  it("10 XP for correct, 2 XP for wrong, no coins", () => {
    expect(triviaReward(true)).toEqual({ xp: 10, coins: 0 });
    expect(triviaReward(false)).toEqual({ xp: 2, coins: 0 });
  });
});
