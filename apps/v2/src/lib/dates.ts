/**
 * Date helpers — streaks and daily-attempt limits are calendar concepts,
 * so we work in the user's local YYYY-MM-DD, not UTC.
 *
 * For HeroQuest's primary audience (Thailand, UTC+7) we default to that
 * timezone when no user context is available. When we do have a user, we
 * key off `userProfile.locale` to pick the right tz table.
 */

const DEFAULT_TZ = "Asia/Bangkok";

const LOCALE_TZ: Record<string, string> = {
  th: "Asia/Bangkok",
  en: "Asia/Bangkok", // app still serves Thai users primarily
};

export function localDateString(date: Date = new Date(), locale = "th"): string {
  const tz = LOCALE_TZ[locale] ?? DEFAULT_TZ;
  // Intl formatToParts gives us locale-stable YYYY-MM-DD.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function daysBetween(aIso: string, bIso: string): number {
  const a = Date.parse(`${aIso}T00:00:00Z`);
  const b = Date.parse(`${bIso}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}
