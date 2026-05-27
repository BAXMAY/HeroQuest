/**
 * Brand defaults — the seed values used when `tenant_settings` has no row
 * (or partial row) for a tenant. Server `getBrandConfig()` merges a DB row
 * over these defaults so the UI always gets a fully-populated `BrandConfig`.
 *
 * Pure data + a merge function — no DB / no React imports — so it can be
 * unit-tested with vitest and imported from anywhere.
 */

export type BrandTheme = {
  /** HSL components string, e.g. "262 80% 60%" (sans the `hsl(...)` wrapper). */
  primary: string;
  secondary: string;
  accent: string;
  magic: string;
  flame: string;
  background: string;
  foreground: string;
  headingFont: string;
  bodyFont: string;
};

export type BrandConfig = {
  tenantId: string;
  appName: string;
  appShortName: string;
  logoUrl: string | null;
  mascotUrl: string | null;
  theme: BrandTheme;
  currencyName: string;
  currencyShort: string;
  xpName: string;
  /** Optional override of the 100 level titles. Null = fall through to packages/db/src/levels.ts */
  levelTitles: string[] | null;
};

/** Tier-1 defaults — the "HeroQuest / Sparky / Brave Coins" look the v2 launched with. */
export const BRAND_DEFAULT: BrandConfig = {
  tenantId: "default",
  appName: "HeroQuest",
  appShortName: "HeroQuest",
  logoUrl: null,
  mascotUrl: null,
  theme: {
    primary: "262 80% 60%",
    secondary: "162 70% 45%",
    accent: "38 95% 55%",
    magic: "300 75% 60%",
    flame: "15 90% 55%",
    background: "235 60% 98%",
    foreground: "240 30% 12%",
    headingFont: "MedievalSharp",
    bodyFont: "Nunito",
  },
  currencyName: "Brave Coins",
  currencyShort: "c",
  xpName: "XP",
  levelTitles: null,
};

/**
 * Deep partial — every leaf optional. Matches the JSON shape returned by
 * the DB row (where missing columns come back as `null`).
 */
export type BrandPatch = {
  tenantId?: string;
  appName?: string | null;
  appShortName?: string | null;
  logoUrl?: string | null;
  mascotUrl?: string | null;
  theme?: Partial<BrandTheme> | null;
  currencyName?: string | null;
  currencyShort?: string | null;
  xpName?: string | null;
  levelTitles?: string[] | null;
};

/**
 * Merge a (possibly partial) patch over the default brand. Any null or
 * undefined patch field falls back to the corresponding default. The `theme`
 * object is merged key-by-key — a patch with `{ theme: { primary: "..." } }`
 * keeps every other color from the default.
 */
export function mergeBrand(patch: BrandPatch | null | undefined): BrandConfig {
  if (!patch) return BRAND_DEFAULT;
  const themePatch = patch.theme ?? {};
  return {
    tenantId: patch.tenantId ?? BRAND_DEFAULT.tenantId,
    appName: patch.appName ?? BRAND_DEFAULT.appName,
    appShortName: patch.appShortName ?? BRAND_DEFAULT.appShortName,
    logoUrl: patch.logoUrl ?? BRAND_DEFAULT.logoUrl,
    mascotUrl: patch.mascotUrl ?? BRAND_DEFAULT.mascotUrl,
    theme: {
      primary: themePatch.primary ?? BRAND_DEFAULT.theme.primary,
      secondary: themePatch.secondary ?? BRAND_DEFAULT.theme.secondary,
      accent: themePatch.accent ?? BRAND_DEFAULT.theme.accent,
      magic: themePatch.magic ?? BRAND_DEFAULT.theme.magic,
      flame: themePatch.flame ?? BRAND_DEFAULT.theme.flame,
      background: themePatch.background ?? BRAND_DEFAULT.theme.background,
      foreground: themePatch.foreground ?? BRAND_DEFAULT.theme.foreground,
      headingFont: themePatch.headingFont ?? BRAND_DEFAULT.theme.headingFont,
      bodyFont: themePatch.bodyFont ?? BRAND_DEFAULT.theme.bodyFont,
    },
    currencyName: patch.currencyName ?? BRAND_DEFAULT.currencyName,
    currencyShort: patch.currencyShort ?? BRAND_DEFAULT.currencyShort,
    xpName: patch.xpName ?? BRAND_DEFAULT.xpName,
    levelTitles: patch.levelTitles ?? BRAND_DEFAULT.levelTitles,
  };
}

/**
 * HSL-component sanity check used by admin form validation. We don't want
 * an admin to paste `#ff00aa` into a field that the CSS-var injector will
 * turn into `hsl(#ff00aa)` — that's silently broken.
 *
 * Valid shape: "<hue 0-360> <sat 0-100>% <lit 0-100>%"
 */
const HSL_RE = /^\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*$/;

export function isValidHslComponents(s: string): boolean {
  const m = HSL_RE.exec(s);
  if (!m) return false;
  const [, h, sat, lit] = m;
  const hue = Number(h);
  const saturation = Number(sat);
  const lightness = Number(lit);
  return (
    hue >= 0 && hue <= 360 &&
    saturation >= 0 && saturation <= 100 &&
    lightness >= 0 && lightness <= 100
  );
}
