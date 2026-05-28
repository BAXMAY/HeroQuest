import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { BrandTheme } from "../brand-defaults";

/**
 * Per-tenant branding config. One row per tenant; today the only tenant
 * is `'default'` (the deployed community). When we go multi-tenant, the
 * tenant_id resolver in apps/v2/src/server/tenant.ts is the only thing
 * that changes here.
 *
 * Null columns mean "fall back to BRAND_DEFAULT" — see mergeBrand().
 */
export const tenantSettings = sqliteTable("tenant_settings", {
  tenantId: text("tenant_id").primaryKey(),

  appName: text("app_name"),
  appShortName: text("app_short_name"),
  logoUrl: text("logo_url"),
  mascotUrl: text("mascot_url"),

  theme: text("theme", { mode: "json" }).$type<Partial<BrandTheme>>(),

  currencyName: text("currency_name"),
  currencyShort: text("currency_short"),
  xpName: text("xp_name"),

  levelTitles: text("level_titles", { mode: "json" }).$type<string[]>(),

  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export type TenantSettings = typeof tenantSettings.$inferSelect;
export type NewTenantSettings = typeof tenantSettings.$inferInsert;
