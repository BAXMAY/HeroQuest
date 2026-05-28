/**
 * CI guardrail: ensure EN and TH have the exact same key sets.
 *
 *   pnpm i18n:check
 *
 * Exits non-zero if any key exists in one locale but not the other.
 */
import { en } from "../src/i18n/en";
import { th } from "../src/i18n/th";

function flatten(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out.push(key);
    else if (typeof v === "object") out.push(...flatten(v, key));
  }
  return out;
}

const enKeys = new Set(flatten(en));
const thKeys = new Set(flatten(th));

const missingInTh = [...enKeys].filter((k) => !thKeys.has(k));
const missingInEn = [...thKeys].filter((k) => !enKeys.has(k));

if (missingInTh.length || missingInEn.length) {
  if (missingInTh.length) {
    console.error("Missing in th.ts:");
    missingInTh.forEach((k) => console.error(`  - ${k}`));
  }
  if (missingInEn.length) {
    console.error("Missing in en.ts:");
    missingInEn.forEach((k) => console.error(`  - ${k}`));
  }
  process.exit(1);
}

console.log(`OK — ${enKeys.size} keys in sync between en/th.`);
