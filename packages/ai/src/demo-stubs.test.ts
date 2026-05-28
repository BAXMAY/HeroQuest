import { describe, expect, it } from "vitest";
import {
  isDemoMode,
  stubEvaluateQuest,
  stubGenerateTrivia,
  stubSuggestOpportunities,
} from "./demo-stubs";

describe("isDemoMode", () => {
  it("is true when ANTHROPIC_API_KEY is missing", () => {
    expect(isDemoMode({ ANTHROPIC_API_KEY: "" } as never)).toBe(true);
    expect(isDemoMode({ ANTHROPIC_API_KEY: undefined as unknown as string })).toBe(true);
  });
  it("is true when the key starts with 'demo'", () => {
    expect(isDemoMode({ ANTHROPIC_API_KEY: "demo" })).toBe(true);
    expect(isDemoMode({ ANTHROPIC_API_KEY: "demo-mode" })).toBe(true);
  });
  it("is false for a real-looking key", () => {
    expect(isDemoMode({ ANTHROPIC_API_KEY: "sk-ant-123456" })).toBe(false);
  });
});

describe("stubEvaluateQuest", () => {
  it("returns a valid evaluation shape", () => {
    const out = stubEvaluateQuest("Helped my mom carry the groceries");
    expect(out.xp).toBeGreaterThanOrEqual(0);
    expect(out.xp).toBeLessThanOrEqual(200);
    expect(out.coins).toBeGreaterThanOrEqual(0);
    expect(out.justification.length).toBeGreaterThan(0);
  });

  it("is deterministic for the same description (stable screenshots)", () => {
    const a = stubEvaluateQuest("Read a book to my little sister");
    const b = stubEvaluateQuest("Read a book to my little sister");
    expect(a).toEqual(b);
  });
});

describe("stubGenerateTrivia", () => {
  it("returns N questions in the requested locale", () => {
    const en = stubGenerateTrivia("en", 3);
    expect(en).toHaveLength(3);
    expect(en[0]!.options).toHaveLength(4);
    const th = stubGenerateTrivia("th", 5);
    expect(th).toHaveLength(5);
    // Thai questions contain Thai chars
    expect(/[฀-๿]/.test(th[0]!.question)).toBe(true);
  });

  it("caps at available count, returns at least 1", () => {
    expect(stubGenerateTrivia("en", 0)).toHaveLength(1);
    expect(stubGenerateTrivia("en", 999).length).toBeGreaterThanOrEqual(1);
  });
});

describe("stubSuggestOpportunities", () => {
  it("returns at most N opportunities, never zero", () => {
    expect(stubSuggestOpportunities("en", 0)).toHaveLength(1);
    expect(stubSuggestOpportunities("en", 2)).toHaveLength(2);
  });
  it("Thai locale returns Thai text", () => {
    const th = stubSuggestOpportunities("th", 2);
    expect(/[฀-๿]/.test(th[0]!.title)).toBe(true);
  });
});
