import { describe, expect, it } from "vitest";
import { rarityFromXp } from "./rarity";

describe("rarityFromXp", () => {
  it("returns common for xp < 50", () => {
    expect(rarityFromXp(0)).toBe("common");
    expect(rarityFromXp(49)).toBe("common");
  });
  it("returns rare for xp 50-99", () => {
    expect(rarityFromXp(50)).toBe("rare");
    expect(rarityFromXp(99)).toBe("rare");
  });
  it("returns epic for xp 100-149", () => {
    expect(rarityFromXp(100)).toBe("epic");
    expect(rarityFromXp(149)).toBe("epic");
  });
  it("returns legendary for xp >= 150", () => {
    expect(rarityFromXp(150)).toBe("legendary");
    expect(rarityFromXp(9999)).toBe("legendary");
  });
});
