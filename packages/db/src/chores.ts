/**
 * Pure logic for recurring chores: which chores are due on which day,
 * + invite-code generation.
 */
import type { ChoreFrequency } from "./types";

export type ChoreScheduleInput = {
  frequency: ChoreFrequency;
  /** CSV "0,1,2" where Sun=0 — only used when frequency='custom'. */
  daysOfWeek?: string | null;
  active: boolean;
};

/**
 * True if a recurring chore should generate an instance for the given date.
 * Date is interpreted in the user's local calendar (caller provides the
 * right Date), so we just look at getDay().
 */
export function isChoreDueOn(chore: ChoreScheduleInput, date: Date): boolean {
  if (!chore.active) return false;
  const dow = date.getDay(); // 0 = Sun … 6 = Sat
  switch (chore.frequency) {
    case "daily":
      return true;
    case "weekdays":
      return dow >= 1 && dow <= 5;
    case "weekly":
      // Weekly == Sunday by default (matches family chore-list patterns).
      return dow === 0;
    case "custom": {
      if (!chore.daysOfWeek) return false;
      return chore.daysOfWeek
        .split(",")
        .map((s) => Number(s.trim()))
        .includes(dow);
    }
    default:
      return false;
  }
}

const INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/1/0 to avoid confusion
const INVITE_LENGTH = 8;

/**
 * Generate a readable family invite code: 8 chars from a confusable-free
 * alphabet (no 0/O, 1/I/L). Caller is responsible for uniqueness — collide
 * detection happens at DB insert time.
 */
export function generateInviteCode(rand: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < INVITE_LENGTH; i++) {
    out += INVITE_ALPHABET[Math.floor(rand() * INVITE_ALPHABET.length)];
  }
  return out;
}

export function isInviteCodeShape(s: string): boolean {
  if (s.length !== INVITE_LENGTH) return false;
  for (const ch of s) {
    if (!INVITE_ALPHABET.includes(ch)) return false;
  }
  return true;
}
