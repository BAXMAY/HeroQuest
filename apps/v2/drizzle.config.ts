import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../../packages/db/src/schema/index.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "d1-http",
  // For `drizzle-kit studio` and `migrate` against the local D1 SQLite file,
  // wrangler's miniflare writes to .wrangler/state/v3/d1/...
  // For prod, set env vars CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID,
  // CLOUDFLARE_D1_TOKEN before running.
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
    databaseId: process.env.CLOUDFLARE_DATABASE_ID ?? "",
    token: process.env.CLOUDFLARE_D1_TOKEN ?? "",
  },
  verbose: true,
  strict: true,
});
