import { describe, expect, it } from "vitest";
import {
  applyDecision,
  canApprove,
  canRedeem,
  isTransitionAllowed,
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
