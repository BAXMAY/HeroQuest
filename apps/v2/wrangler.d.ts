/**
 * Hand-written Cloudflare bindings type. Regenerate via `wrangler types` once
 * Wrangler is installed; this file is the contract until then so the app code
 * has IDE help.
 */
/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    // D1
    DB: D1Database;

    // R2
    QUEST_PHOTOS: R2Bucket;
    AVATARS: R2Bucket;
    BRAND_ASSETS: R2Bucket;

    // KV
    TRIVIA_KV: KVNamespace;

    // Static assets binding (auto)
    ASSETS: Fetcher;

    // Public vars
    PUBLIC_APP_URL: string;

    // Secrets (set via `wrangler secret put`)
    BETTER_AUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    ANTHROPIC_API_KEY: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_ACCOUNT_ID: string;
  }
}

export {};
