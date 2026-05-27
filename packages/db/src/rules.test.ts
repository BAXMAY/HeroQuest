import { describe, expect, it } from "vitest";
import {
  applyDecision,
  applyRedemption,
  canApprove,
  canRedeem,
  isTransitionAllowed,
  rankLeaderboard,
  type ProfileStats,
} from "./rules";

const blankStats: ProfileStats = {
  totalXp: 0,
  braveCoins: 0,
  questsCompleted: 0,
};

describe("applyDecision — approved", () => {
  it("adds XP, coins and increments quests counter", () => {
    const r = applyDecision(blankStats, {
      decision: "approved",
      xp: 50,
      coins: 5,
    });
    expect(r.newStats).toEqual({ totalXp: 50, braveCoins: 5, questsCompleted: 1 });
  });

  it("flags leveledUp when crossing a level boundary", () => {
    // Level 2 starts at 100 XP (curve floor(100 * 1^1.55) = 100).
    const r = applyDecision(blankStats, {
      decision: "approved",
      xp: 100,
      coins: 10,
    });
    expect(r.leveledUp).toBe(true);
    expect(r.previousLevel.level).toBe(1);
    expect(r.newLevel.level).toBe(2);
  });

  it("does not flag leveledUp when staying at the same level", () => {
    const r = applyDecision(blankStats, {
      decision: "approved",
      xp: 30,
      coins: 3,
    });
    expect(r.leveledUp).toBe(false);
    expect(r.previousLevel.level).toBe(1);
    expect(r.newLevel.level).toBe(1);
  });

  it("floors fractional XP/coins and rejects negatives", () => {
    const r = applyDecision(blankStats, {
      decision: "approved",
      xp: 50.9,
      coins: -10,
    });
    expect(r.newStats.totalXp).toBe(50);
    expect(r.newStats.braveCoins).toBe(0);
  });
});

describe("applyDecision — rejected", () => {
  it("leaves stats unchanged", () => {
    const r = applyDecision(
      { totalXp: 250, braveCoins: 30, questsCompleted: 5 },
      { decision: "rejected", xp: 100, coins: 10 },
    );
    expect(r.newStats).toEqual({ totalXp: 250, braveCoins: 30, questsCompleted: 5 });
    expect(r.leveledUp).toBe(false);
  });
});

describe("canApprove", () => {
  it("admins approve anything", () => {
    expect(
      canApprove({
        approverRole: "admin",
        approverFamilyId: null,
        questOwnerFamilyId: "fam-1",
      }),
    ).toBe(true);
  });

  it("students never approve", () => {
    expect(
      canApprove({
        approverRole: "student",
        approverFamilyId: "fam-1",
        questOwnerFamilyId: "fam-1",
      }),
    ).toBe(false);
  });

  it("parents approve only inside their family", () => {
    expect(
      canApprove({
        approverRole: "parent",
        approverFamilyId: "fam-1",
        questOwnerFamilyId: "fam-1",
      }),
    ).toBe(true);
    expect(
      canApprove({
        approverRole: "parent",
        approverFamilyId: "fam-1",
        questOwnerFamilyId: "fam-2",
      }),
    ).toBe(false);
    expect(
      canApprove({
        approverRole: "parent",
        approverFamilyId: null,
        questOwnerFamilyId: "fam-1",
      }),
    ).toBe(false);
  });
});

describe("canRedeem", () => {
  it("allows when coins >= cost", () => {
    expect(canRedeem({ currentCoins: 100, cost: 100 })).toBe(true);
    expect(canRedeem({ currentCoins: 101, cost: 100 })).toBe(true);
  });
  it("rejects when coins < cost", () => {
    expect(canRedeem({ currentCoins: 99, cost: 100 })).toBe(false);
  });
  it("rejects negative cost", () => {
    expect(canRedeem({ currentCoins: 50, cost: -1 })).toBe(false);
  });
});

describe("applyRedemption", () => {
  it("subtracts cost when affordable", () => {
    expect(applyRedemption({ currentCoins: 100, cost: 30 })).toEqual({ newCoins: 70 });
  });
  it("allows spending the exact balance", () => {
    expect(applyRedemption({ currentCoins: 50, cost: 50 })).toEqual({ newCoins: 0 });
  });
  it("throws when unaffordable", () => {
    expect(() => applyRedemption({ currentCoins: 10, cost: 50 })).toThrow(/INSUFFICIENT_COINS/);
  });
  it("throws on negative cost", () => {
    expect(() => applyRedemption({ currentCoins: 10, cost: -5 })).toThrow(/INSUFFICIENT_COINS/);
  });
});

describe("rankLeaderboard", () => {
  it("orders by XP descending then by username", () => {
    const out = rankLeaderboard([
      { userId: "a", username: "alice", totalXp: 200, showOnLeaderboard: true },
      { userId: "b", username: "bob", totalXp: 500, showOnLeaderboard: true },
      { userId: "c", username: "carol", totalXp: 200, showOnLeaderboard: true },
    ]);
    expect(out.map((r) => r.userId)).toEqual(["b", "a", "c"]);
    expect(out.map((r) => r.rank)).toEqual([1, 2, 2]); // ties share a rank
  });

  it("filters out users who opted out", () => {
    const out = rankLeaderboard([
      { userId: "a", username: "alice", totalXp: 200, showOnLeaderboard: true },
      { userId: "b", username: "bob", totalXp: 500, showOnLeaderboard: false },
    ]);
    expect(out.map((r) => r.userId)).toEqual(["a"]);
  });

  it("produces 1-indexed ranks with proper skipping after ties", () => {
    const out = rankLeaderboard([
      { userId: "a", username: "a", totalXp: 100, showOnLeaderboard: true },
      { userId: "b", username: "b", totalXp: 100, showOnLeaderboard: true },
      { userId: "c", username: "c", totalXp: 50, showOnLeaderboard: true },
    ]);
    expect(out.map((r) => r.rank)).toEqual([1, 1, 3]);
  });
});

describe("isTransitionAllowed", () => {
  it("allows draft → pending and draft → rejected", () => {
    expect(isTransitionAllowed("draft", "pending")).toBe(true);
    expect(isTransitionAllowed("draft", "rejected")).toBe(true);
  });
  it("allows pending → approved and pending → rejected", () => {
    expect(isTransitionAllowed("pending", "approved")).toBe(true);
    expect(isTransitionAllowed("pending", "rejected")).toBe(true);
  });
  it("forbids any transition out of approved (terminal)", () => {
    expect(isTransitionAllowed("approved", "rejected")).toBe(false);
    expect(isTransitionAllowed("approved", "pending")).toBe(false);
  });
  it("allows rejected → pending (re-submission)", () => {
    expect(isTransitionAllowed("rejected", "pending")).toBe(true);
  });
  it("forbids no-op transitions", () => {
    expect(isTransitionAllowed("pending", "pending")).toBe(false);
  });
});
