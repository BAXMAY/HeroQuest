/**
 * Capture screenshots of every screen against the live demo dev server.
 * Run with:  PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/capture-screenshots.mjs
 *
 * Assumes dev server is running on http://localhost:5173.
 * Writes PNGs to docs/screens/.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "http://localhost:5173";
const OUT = path.join(process.cwd(), "docs/screens");
fs.mkdirSync(OUT, { recursive: true });

async function shot(page, name) {
  const dest = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: dest, fullPage: false });
  console.log(`  → ${name}.png (${fs.statSync(dest).size} bytes)`);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Pages that render without an authenticated session against the demo
  // dev server (env-resolution gap in @cloudflare/vite-plugin + TanStack
  // Start dev means DB-backed auth POSTs still 500 — these capture the
  // public UI today).
  const publicPages = [
    { name: "01-landing", path: "/" },
    { name: "02-register", path: "/register" },
    { name: "03-login", path: "/login" },
  ];

  for (const { name, path: p } of publicPages) {
    console.log(`→ ${name} ${p}`);
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await wait(700); // let mascot wave-in finish + Framer Motion settle
    await shot(page, name);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
