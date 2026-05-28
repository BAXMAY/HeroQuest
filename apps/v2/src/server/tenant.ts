/**
 * Tenant resolution — the single seam that decides which community's
 * branding (and, in the future, data) a request belongs to.
 *
 * Today: returns the literal `'default'`. The Cloudflare Worker is one
 * deployment serving one community.
 *
 * Multi-tenant flip-day plan (do NOT edit until then):
 *   - Map `request.url`'s host to a tenant_id via a `tenant_hosts` table
 *     (or a KV-cached lookup keyed by hostname).
 *   - Throw `404 unknown community` if the host doesn't resolve.
 *   - Add tenant_id FK to user/family/quest/... and scope every server-fn
 *     read+write by `resolveTenantId(request)`.
 *   - Prefix KV keys and R2 object keys with `{tenantId}:` (R2 keys already
 *     use this shape for brand-assets — see server/r2.ts brand helpers).
 */

export const DEFAULT_TENANT_ID = "default";

// `request` is unused today but kept so callers don't have to change when
// we flip to hostname-based resolution.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function resolveTenantId(_request?: Request): string {
  return DEFAULT_TENANT_ID;
}
