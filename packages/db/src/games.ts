/**
 * Pure game rules — streaks, spin prizes, memory scoring, trivia rewards.
 * No DB access so they can be unit-tested.
 */
import type { SpinPayload } from "./types";

// ---------- Streaks ----------

export type StreakState = {
  current: number;
  longest: number;
  lastVisit: string | null; // YYYY-MM-DD
};

export type StreakUpdate = {
  next: StreakState;
  /** True if today's check-in extended the streak by 1. */
  extended: boolean;
  /** True if today is a milestone (3/7/14/30/60/100 days). */
  milestone: boolean;
  /** Extra XP awarded for the milestone, if any. */
  bonusXp: number;
};

export const STREAK_MILESTONES: Record<number, number> = {
  3: 25,
  7: 75,
  14: 150,
  30: 350,
  60: 700,
  100: 1500,
};

function daysApart(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

/**
 * Apply a daily check-in.
 *
 * Rules:
 * - First-ever visit → streak = 1.
 * - Same day → no change (idempotent — calling twice doesn't double count).
 * - Next-day visit → streak += 1.
 * - Any longer gap → streak resets to 1.
 * - longest is the max of (prev longest, new current).
 * - Milestone hits award bonus XP per STREAK_MILESTONES.
 */
export function applyDailyCheckIn(
  state: StreakState,
  today: string,
): StreakUpdate {
  if (!state.lastVisit) {
    const milestone = today in STREAK_MILESTONES;
    const bonusXp = STREAK_MILESTONES[1] ?? 0;
    void milestone;
    void bonusXp;
    return {
      next: { current: 1, longest: Math.max(state.longest, 1), lastVisit: today },
      extended: true,
      milestone: 1 in STREAK_MILESTONES,
      bonusXp: STREAK_MILESTONES[1] ?? 0,
    };
  }

  const gap = daysApart(state.lastVisit, today);
  if (gap === 0) {
    return {
      next: state,
      extended: false,
      milestone: false,
      bonusXp: 0,
    };
  }
  const nextCurrent = gap === 1 ? state.current + 1 : 1;
  const milestone = nextCurrent in STREAK_MILESTONES;
  const bonusXp = milestone ? (STREAK_MILESTONES[nextCurrent] ?? 0) : 0;
  return {
    next: {
      current: nextCurrent,
      longest: Math.max(state.longest, nextCurrent),
      lastVisit: today,
    },
    extended: nextCurrent === state.current + 1,
    milestone,
    bonusXp,
  };
}

// ---------- Spin-the-wheel ----------

export const SPIN_SEGMENTS: ReadonlyArray<{ prize: SpinPayload["prize"]; weight: number }> = [
  { prize: "coins-5", weight: 30 },
  { prize: "coins-10", weight: 25 },
  { prize: "coins-20", weight: 15 },
  { prize: "coins-50", weight: 4 },
  { prize: "xp-25", weight: 15 },
  { prize: "xp-50", weight: 7 },
  { prize: "xp-100", weight: 3 },
  { prize: "none", weight: 1 },
];

export type SpinOutcome = {
  prize: SpinPayload["prize"];
  segmentIndex: number;
  xp: number;
  coins: number;
};

/**
 * Pick a prize given a uniform random number in [0, 1).
 * Pure so we can test with a seeded RNG.
 */
export function chooseSpinPrize(random: number): SpinOutcome {
  const total = SPIN_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
  const r = Math.max(0, Math.min(0.999_999, random)) * total;
  let acc = 0;
  for (let i = 0; i < SPIN_SEGMENTS.length; i++) {
    acc += SPIN_SEGMENTS[i]!.weight;
    if (r < acc) {
      return prizeToOutcome(SPIN_SEGMENTS[i]!.prize, i);
    }
  }
  return prizeToOutcome("none", SPIN_SEGMENTS.length - 1);
}

function prizeToOutcome(prize: SpinPayload["prize"], index: number): SpinOutcome {
  const map: Record<SpinPayload["prize"], { xp: number; coins: number }> = {
    "coins-5": { xp: 0, coins: 5 },
    "coins-10": { xp: 0, coins: 10 },
    "coins-20": { xp: 0, coins: 20 },
    "coins-50": { xp: 0, coins: 50 },
    "xp-25": { xp: 25, coins: 0 },
    "xp-50": { xp: 50, coins: 0 },
    "xp-100": { xp: 100, coins: 0 },
    none: { xp: 0, coins: 0 },
  };
  return { prize, segmentIndex: index, ...map[prize] };
}

// ---------- Memory match ----------

export type MemoryScore = {
  score: number;
  xp: number;
  coins: number;
};

/**
 * Memory game scoring. Lower moves + faster time = better.
 * 6 pairs × 2 cards minimum = 12 moves, anything over is mistakes.
 */
export function scoreMemory(input: { moves: number; timeMs: number }): MemoryScore {
  const raw = Math.max(
    0,
    1000 - Math.max(0, input.moves - 12) * 30 - Math.floor(input.timeMs / 1000) * 5,
  );
  const xp = Math.round(raw / 50); // up to ~20 XP
  const coins = Math.round(raw / 200); // up to ~5 coins
  return { score: raw, xp, coins };
}

// ---------- Trivia ----------

export type TriviaReward = { xp: number; coins: number };

/**
 * Trivia: 10 XP correct, 2 XP participation. No coins.
 */
export function triviaReward(correct: boolean): TriviaReward {
  return { xp: correct ? 10 : 2, coins: 0 };
}
