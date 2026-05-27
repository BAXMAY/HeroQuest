/**
 * Pure business rules — no DB access — so we can test the math without a
 * D1 instance. Server functions compose these with `db.batch([...])` calls.
 */
import { getLevelFromXP, type Level } from "./levels";
import type { QuestStatus } from "./types";

export type ProfileStats = {
  totalXp: number;
  braveCoins: number;
  questsCompleted: number;
};

export type QuestDecision = {
  decision: "approved" | "rejected";
  xp: number;
  coins: number;
};

export type ApprovalResult = {
  newStats: ProfileStats;
  /** True iff the user's level changed because of this approval. */
  leveledUp: boolean;
  previousLevel: Level;
  newLevel: Level;
};

/**
 * Apply a quest approval decision and return the new profile stats plus
 * level-change info. Caller persists the change.
 *
 * Invariant: rejected quests never change stats (you can't lose XP for
 * a bad submission — the worst case is no reward).
 */
export function applyDecision(prev: ProfileStats, decision: QuestDecision): ApprovalResult {
  const previousLevel = getLevelFromXP(prev.totalXp);

  if (decision.decision === "rejected") {
    return {
      newStats: prev,
      leveledUp: false,
      previousLevel,
      newLevel: previousLevel,
    };
  }

  const xpDelta = Math.max(0, Math.floor(decision.xp));
  const coinsDelta = Math.max(0, Math.floor(decision.coins));

  const newStats: ProfileStats = {
    totalXp: prev.totalXp + xpDelta,
    braveCoins: prev.braveCoins + coinsDelta,
    questsCompleted: prev.questsCompleted + 1,
  };
  const newLevel = getLevelFromXP(newStats.totalXp);

  return {
    newStats,
    leveledUp: newLevel.level > previousLevel.level,
    previousLevel,
    newLevel,
  };
}

/**
 * Decide whether the current user is allowed to act on a quest in the given
 * way. Centralised so route handlers and tests share one rule.
 *
 * - student/parent/admin can submit a quest.
 * - Only admin or parent can approve/reject.
 * - Parents can only act on quests of users in their own family.
 */
export type CanApproveInput = {
  approverRole: "student" | "parent" | "admin";
  approverFamilyId: string | null;
  questOwnerFamilyId: string | null;
};

export function canApprove(input: CanApproveInput): boolean {
  if (input.approverRole === "admin") return true;
  if (input.approverRole !== "parent") return false;
  return (
    input.approverFamilyId !== null &&
    input.questOwnerFamilyId === input.approverFamilyId
  );
}

export type RedemptionInput = {
  currentCoins: number;
  cost: number;
};

export function canRedeem(input: RedemptionInput): boolean {
  return input.cost >= 0 && input.currentCoins >= input.cost;
}

export type RedemptionResult = {
  newCoins: number;
};

/**
 * Apply a redemption: subtract cost from coin balance. Throws if the user
 * cannot afford it — caller should check `canRedeem` first.
 */
export function applyRedemption(input: RedemptionInput): RedemptionResult {
  if (!canRedeem(input)) {
    throw new Error(
      `INSUFFICIENT_COINS: have ${input.currentCoins}, need ${input.cost}`,
    );
  }
  return { newCoins: input.currentCoins - input.cost };
}

/**
 * Leaderboard entry sorted by total XP descending, then by username for
 * stable ordering when XP ties. Pure so we can unit-test ranking.
 */
export type LeaderboardRow = {
  userId: string;
  username: string;
  totalXp: number;
  showOnLeaderboard: boolean;
};

export function rankLeaderboard(rows: readonly LeaderboardRow[]): Array<LeaderboardRow & { rank: number }> {
  const visible = rows.filter((r) => r.showOnLeaderboard);
  const sorted = [...visible].sort((a, b) => {
    if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp;
    return a.username.localeCompare(b.username);
  });
  let lastXp = -1;
  let lastRank = 0;
  let nextRank = 1;
  return sorted.map((row) => {
    const rank = row.totalXp === lastXp ? lastRank : nextRank;
    lastXp = row.totalXp;
    lastRank = rank;
    nextRank++;
    return { ...row, rank };
  });
}

/**
 * Permitted transitions for a quest's status — used by `decideQuest` to
 * reject double-approvals or attempts to un-approve a finished quest.
 */
export function isTransitionAllowed(from: QuestStatus, to: QuestStatus): boolean {
  if (from === to) return false;
  const TRANSITIONS: Record<QuestStatus, readonly QuestStatus[]> = {
    draft: ["pending", "rejected"],
    pending: ["approved", "rejected"],
    approved: [],
    rejected: ["pending"],
  };
  return TRANSITIONS[from].includes(to);
}
