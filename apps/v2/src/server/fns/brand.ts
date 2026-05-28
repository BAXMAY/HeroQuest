import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  BRAND_DEFAULT,
  isValidHslComponents,
  mergeBrand,
  schema,
  type BrandConfig,
  type BrandTheme,
} from "@heroquest/db";
import { db } from "@/server/db";
import { getEnv } from "@/lib/env";
import { resolveTenantId } from "@/server/tenant";
import { getSessionContext } from "@/server/middleware";

const KV_TTL_SECONDS = 60;
const kvKey = (tenantId: string) => `brand:${tenantId}`;

/**
 * Resolve the active brand for this request. KV-cached 60s.
 *
 * Cache flow:
 *   1. resolveTenantId() — today always 'default'
 *   2. KV hit → return parsed BrandConfig
 *   3. KV miss → SELECT tenant_settings, merge over BRAND_DEFAULT, write KV
 *   4. DB miss (fresh deployment, migration not applied) → return BRAND_DEFAULT
 */
export const getBrandConfig = createServerFn({ method: "GET" }).handler(async () => {
  const tenantId = resolveTenantId(getRequest());
  const env = getEnv();

  try {
    const cached = await env.TRIVIA_KV.get(kvKey(tenantId), "json");
    if (cached) return cached as BrandConfig;
  } catch {
    /* KV not bound in early dev — fall through */
  }

  let row: typeof schema.tenantSettings.$inferSelect | null = null;
  try {
    row = await db()
      .select()
      .from(schema.tenantSettings)
      .where(eq(schema.tenantSettings.tenantId, tenantId))
      .limit(1)
      .then((r) => r[0] ?? null);
  } catch {
    /* Migration not applied yet — defaults are fine */
  }

  const merged = row
    ? mergeBrand({
        tenantId: row.tenantId,
        appName: row.appName,
        appShortName: row.appShortName,
        logoUrl: row.logoUrl,
        mascotUrl: row.mascotUrl,
        theme: row.theme as Partial<BrandTheme> | null,
        currencyName: row.currencyName,
        currencyShort: row.currencyShort,
        xpName: row.xpName,
        levelTitles: row.levelTitles as string[] | null,
      })
    : { ...BRAND_DEFAULT, tenantId };

  try {
    await env.TRIVIA_KV.put(kvKey(tenantId), JSON.stringify(merged), {
      expirationTtl: KV_TTL_SECONDS,
    });
  } catch {
    /* ignore */
  }
  return merged;
});

// ---------- Mutations (admin-only) ----------

const themePatchSchema = z
  .object({
    primary: z.string().refine(isValidHslComponents, "primary: bad HSL").optional(),
    secondary: z.string().refine(isValidHslComponents, "secondary: bad HSL").optional(),
    accent: z.string().refine(isValidHslComponents, "accent: bad HSL").optional(),
    magic: z.string().refine(isValidHslComponents, "magic: bad HSL").optional(),
    flame: z.string().refine(isValidHslComponents, "flame: bad HSL").optional(),
    background: z.string().refine(isValidHslComponents, "background: bad HSL").optional(),
    foreground: z.string().refine(isValidHslComponents, "foreground: bad HSL").optional(),
    headingFont: z.string().max(80).optional(),
    bodyFont: z.string().max(80).optional(),
  })
  .nullable()
  .optional();

const brandPatchSchema = z.object({
  appName: z.string().min(1).max(60).nullable().optional(),
  appShortName: z.string().min(1).max(24).nullable().optional(),
  logoUrl: z.string().max(500).nullable().optional(),
  mascotUrl: z.string().max(500).nullable().optional(),
  theme: themePatchSchema,
  currencyName: z.string().min(1).max(40).nullable().optional(),
  currencyShort: z.string().min(1).max(6).nullable().optional(),
  xpName: z.string().min(1).max(20).nullable().optional(),
  levelTitles: z.array(z.string().min(1).max(60)).length(100).nullable().optional(),
});

function assertAdmin(ctx: { profile?: { role?: string } | null }) {
  if (ctx.profile?.role !== "admin") throw new Error("FORBIDDEN");
}

async function bustCache(env: CloudflareEnv, tenantId: string): Promise<void> {
  try {
    await env.TRIVIA_KV.delete(kvKey(tenantId));
  } catch {
    /* ignore */
  }
}

export const updateBrandConfig = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => brandPatchSchema.parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user) throw new Error("UNAUTHORIZED");
    assertAdmin(ctx);

    const tenantId = resolveTenantId(getRequest());
    const env = getEnv();
    const now = new Date();

    // Existing theme JSON merges with the patch — we want a partial update
    // to leave non-touched colors alone in the DB, not just at read time.
    const existing = await db()
      .select({ theme: schema.tenantSettings.theme })
      .from(schema.tenantSettings)
      .where(eq(schema.tenantSettings.tenantId, tenantId))
      .limit(1)
      .then((r) => r[0]);

    const mergedTheme = data.theme === undefined
      ? existing?.theme ?? null
      : data.theme === null
        ? null
        : { ...(existing?.theme ?? {}), ...data.theme };

    const row = {
      tenantId,
      appName: data.appName ?? null,
      appShortName: data.appShortName ?? null,
      logoUrl: data.logoUrl ?? null,
      mascotUrl: data.mascotUrl ?? null,
      theme: mergedTheme,
      currencyName: data.currencyName ?? null,
      currencyShort: data.currencyShort ?? null,
      xpName: data.xpName ?? null,
      levelTitles: data.levelTitles ?? null,
      updatedAt: now,
    };

    await db()
      .insert(schema.tenantSettings)
      .values(row)
      .onConflictDoUpdate({
        target: schema.tenantSettings.tenantId,
        set: {
          appName: row.appName,
          appShortName: row.appShortName,
          logoUrl: row.logoUrl,
          mascotUrl: row.mascotUrl,
          theme: row.theme,
          currencyName: row.currencyName,
          currencyShort: row.currencyShort,
          xpName: row.xpName,
          levelTitles: row.levelTitles,
          updatedAt: now,
        },
      });

    await bustCache(env, tenantId);
    return { ok: true };
  });

// ---------- R2 presigned brand-asset upload ----------

const presignSchema = z.object({
  kind: z.enum(["logo", "mascot"]),
  contentType: z.string().regex(/^image\/(png|jpeg|webp|svg\+xml)$/),
});

export const presignBrandUpload = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => presignSchema.parse(data))
  .handler(async ({ data }) => {
    const ctx = await getSessionContext(getRequest());
    if (!ctx.user) throw new Error("UNAUTHORIZED");
    assertAdmin(ctx);
    const tenantId = resolveTenantId(getRequest());
    const { presignR2Upload } = await import("@/server/r2");
    return presignR2Upload({
      bucket: "brand-assets",
      env: getEnv(),
      keyPrefix: `tenants/${tenantId}/${data.kind}`,
      contentType: data.contentType,
    });
  });

void sql;
