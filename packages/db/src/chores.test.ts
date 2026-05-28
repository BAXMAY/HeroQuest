import { describe, expect, it } from "vitest";
import { generateInviteCode, isChoreDueOn, isInviteCodeShape } from "./chores";

describe("isChoreDueOn", () => {
  // Use specific weekdays:
  // 2025-06-01 = Sunday, 2025-06-02 = Monday, …, 2025-06-07 = Saturday
  const sunday = new Date("2025-06-01T12:00:00Z");
  const monday = new Date("2025-06-02T12:00:00Z");
  const wednesday = new Date("2025-06-04T12:00:00Z");
  const saturday = new Date("2025-06-07T12:00:00Z");

  it("daily is due every day", () => {
    const chore = { frequency: "daily" as const, active: true };
    for (const d of [sunday, monday, wednesday, saturday]) {
      expect(isChoreDueOn(chore, d)).toBe(true);
    }
  });

  it("weekdays is due Mon-Fri only", () => {
    const chore = { frequency: "weekdays" as const, active: true };
    expect(isChoreDueOn(chore, sunday)).toBe(false);
    expect(isChoreDueOn(chore, monday)).toBe(true);
    expect(isChoreDueOn(chore, wednesday)).toBe(true);
    expect(isChoreDueOn(chore, saturday)).toBe(false);
  });

  it("weekly is due Sunday", () => {
    const chore = { frequency: "weekly" as const, active: true };
    expect(isChoreDueOn(chore, sunday)).toBe(true);
    expect(isChoreDueOn(chore, monday)).toBe(false);
  });

  it("custom respects daysOfWeek CSV (Mon=1, Wed=3)", () => {
    const chore = {
      frequency: "custom" as const,
      daysOfWeek: "1,3",
      active: true,
    };
    expect(isChoreDueOn(chore, monday)).toBe(true);
    expect(isChoreDueOn(chore, wednesday)).toBe(true);
    expect(isChoreDueOn(chore, sunday)).toBe(false);
    expect(isChoreDueOn(chore, saturday)).toBe(false);
  });

  it("inactive chore is never due", () => {
    expect(
      isChoreDueOn({ frequency: "daily", active: false }, monday),
    ).toBe(false);
  });
});

describe("generateInviteCode", () => {
  it("returns 8 chars from the confusable-free alphabet", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateInviteCode();
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[A-HJ-NP-Z2-9]+$/);
    }
  });

  it("is deterministic given the same RNG output", () => {
    const seq = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
    const make = () => {
      let i = 0;
      return () => seq[i++]!;
    };
    expect(generateInviteCode(make())).toBe(generateInviteCode(make()));
  });
});

describe("isInviteCodeShape", () => {
  it("accepts valid 8-char codes", () => {
    expect(isInviteCodeShape("ABCDEF23")).toBe(true);
  });
  it("rejects wrong length", () => {
    expect(isInviteCodeShape("ABC")).toBe(false);
    expect(isInviteCodeShape("ABCDEFGHJ")).toBe(false);
  });
  it("rejects forbidden chars (I/O/0/1)", () => {
    expect(isInviteCodeShape("ABCDEFG1")).toBe(false);
    expect(isInviteCodeShape("ABCDEFG0")).toBe(false);
    expect(isInviteCodeShape("ABCDEFGI")).toBe(false);
    expect(isInviteCodeShape("ABCDEFGO")).toBe(false);
  });
});
