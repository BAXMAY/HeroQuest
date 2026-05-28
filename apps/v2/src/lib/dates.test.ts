import { describe, expect, it } from "vitest";
import { daysBetween, localDateString } from "./dates";

describe("localDateString", () => {
  it("returns YYYY-MM-DD in Asia/Bangkok by default", () => {
    // 2025-06-15 18:00 UTC = 2025-06-16 01:00 Bangkok
    const d = new Date(Date.UTC(2025, 5, 15, 18, 0, 0));
    expect(localDateString(d)).toBe("2025-06-16");
  });

  it("formatted string is parseable as YYYY-MM-DD", () => {
    const s = localDateString();
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("daysBetween", () => {
  it("returns 0 for the same date", () => {
    expect(daysBetween("2025-01-01", "2025-01-01")).toBe(0);
  });

  it("returns positive when b is after a", () => {
    expect(daysBetween("2025-01-01", "2025-01-05")).toBe(4);
  });

  it("returns negative when b is before a", () => {
    expect(daysBetween("2025-01-05", "2025-01-01")).toBe(-4);
  });

  it("handles month / year boundaries correctly", () => {
    expect(daysBetween("2025-01-31", "2025-02-01")).toBe(1);
    expect(daysBetween("2024-12-31", "2025-01-01")).toBe(1);
  });
});
