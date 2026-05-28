import { describe, expect, it } from "vitest";
import {
  BRAND_DEFAULT,
  isValidHslComponents,
  mergeBrand,
  type BrandPatch,
} from "./brand-defaults";

describe("mergeBrand — falls back to defaults", () => {
  it("returns the default brand for null/undefined patch", () => {
    expect(mergeBrand(null)).toEqual(BRAND_DEFAULT);
    expect(mergeBrand(undefined)).toEqual(BRAND_DEFAULT);
  });

  it("returns the default brand for an empty patch object", () => {
    expect(mergeBrand({})).toEqual(BRAND_DEFAULT);
  });

  it("substitutes a single scalar override", () => {
    const out = mergeBrand({ appName: "GoodDeeds" });
    expect(out.appName).toBe("GoodDeeds");
    // Everything else stays default
    expect(out.appShortName).toBe(BRAND_DEFAULT.appShortName);
    expect(out.currencyName).toBe(BRAND_DEFAULT.currencyName);
    expect(out.theme).toEqual(BRAND_DEFAULT.theme);
  });

  it("treats null as 'fall back to default'", () => {
    // The DB returns null for unset columns; that must mean "use default".
    const patch: BrandPatch = {
      appName: null,
      logoUrl: null,
      mascotUrl: null,
      currencyName: null,
      levelTitles: null,
    };
    expect(mergeBrand(patch).appName).toBe(BRAND_DEFAULT.appName);
    expect(mergeBrand(patch).logoUrl).toBe(BRAND_DEFAULT.logoUrl);
    expect(mergeBrand(patch).levelTitles).toBe(BRAND_DEFAULT.levelTitles);
  });
});

describe("mergeBrand — theme is key-by-key", () => {
  it("a partial theme override only changes the overridden keys", () => {
    const out = mergeBrand({ theme: { primary: "180 50% 50%" } });
    expect(out.theme.primary).toBe("180 50% 50%");
    expect(out.theme.secondary).toBe(BRAND_DEFAULT.theme.secondary);
    expect(out.theme.accent).toBe(BRAND_DEFAULT.theme.accent);
    expect(out.theme.headingFont).toBe(BRAND_DEFAULT.theme.headingFont);
  });

  it("an empty theme patch leaves every default in place", () => {
    expect(mergeBrand({ theme: {} }).theme).toEqual(BRAND_DEFAULT.theme);
  });

  it("`theme: null` falls back to the default theme entirely", () => {
    expect(mergeBrand({ theme: null }).theme).toEqual(BRAND_DEFAULT.theme);
  });
});

describe("mergeBrand — full overrides", () => {
  it("a fully-specified patch wins on every field", () => {
    const fullPatch: BrandPatch = {
      tenantId: "acme",
      appName: "AcmeQuest",
      appShortName: "Acme",
      logoUrl: "https://example.com/logo.png",
      mascotUrl: "https://example.com/mascot.png",
      theme: {
        primary: "100 50% 50%",
        secondary: "110 50% 50%",
        accent: "120 50% 50%",
        magic: "130 50% 50%",
        flame: "140 50% 50%",
        background: "150 50% 50%",
        foreground: "160 50% 50%",
        headingFont: "Orbitron",
        bodyFont: "Inter",
      },
      currencyName: "Stars",
      currencyShort: "★",
      xpName: "Hero Points",
      levelTitles: ["A", "B"],
    };
    const out = mergeBrand(fullPatch);
    expect(out).toMatchObject({
      tenantId: "acme",
      appName: "AcmeQuest",
      currencyName: "Stars",
      currencyShort: "★",
      xpName: "Hero Points",
    });
    expect(out.theme.primary).toBe("100 50% 50%");
    expect(out.theme.bodyFont).toBe("Inter");
    expect(out.levelTitles).toEqual(["A", "B"]);
  });
});

describe("isValidHslComponents", () => {
  it("accepts well-formed HSL components", () => {
    expect(isValidHslComponents("262 80% 60%")).toBe(true);
    expect(isValidHslComponents("0 0% 0%")).toBe(true);
    expect(isValidHslComponents("360 100% 100%")).toBe(true);
    expect(isValidHslComponents("160.5 50% 50%")).toBe(true);
  });

  it("rejects out-of-range numbers", () => {
    expect(isValidHslComponents("400 50% 50%")).toBe(false);
    expect(isValidHslComponents("180 120% 50%")).toBe(false);
    expect(isValidHslComponents("180 50% 200%")).toBe(false);
    expect(isValidHslComponents("-10 50% 50%")).toBe(false);
  });

  it("rejects hex / rgb / wrapped hsl()", () => {
    expect(isValidHslComponents("#ff00aa")).toBe(false);
    expect(isValidHslComponents("rgb(255, 0, 170)")).toBe(false);
    expect(isValidHslComponents("hsl(180 50% 50%)")).toBe(false);
  });

  it("rejects missing % signs", () => {
    expect(isValidHslComponents("180 50 50")).toBe(false);
    expect(isValidHslComponents("180 50% 50")).toBe(false);
  });
});
