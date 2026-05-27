# HeroQuest

Gamified good-deeds tracker for kids — children submit good deeds with photo proof, elders (parents/admins) approve them in exchange for XP and Brave Coins.

## Monorepo layout

```
apps/
  legacy/      Original Next.js 16 + Firebase app (reference; archived).
  v2/          New TanStack Start + Cloudflare (D1 + R2 + Workers) rebuild.
packages/
  db/          Drizzle schema, Zod types, D1 client helpers (shared).
  ai/          Anthropic Claude SDK wrapper + prompts (deed eval, trivia, etc).
  ui/          Shared React components (XPBar, MascotSparky, sound system, etc).
  config/      Shared eslint/tsconfig/tailwind presets.
```

## Quick start

```bash
pnpm install
pnpm dev                # runs apps/v2 with wrangler dev (D1/R2/KV emulated locally)
pnpm db:migrate:local   # apply drizzle migrations to local D1
pnpm db:seed            # seed admin + sample data
```

## Stack (v2)

- **Framework**: TanStack Start (React 19, file-based routing, server functions)
- **Runtime**: Cloudflare Workers (via the Cloudflare adapter)
- **DB**: Cloudflare D1 + Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible, presigned uploads)
- **Auth**: Better Auth (email/password + Google OAuth, sessions in D1)
- **AI**: Anthropic Claude (`claude-haiku-4-5` for deed eval + trivia, `claude-opus-4-7` for insights), with prompt caching
- **UI**: Tailwind + shadcn/ui + Framer Motion + Howler.js, custom hybrid bright + RPG theme
- **PWA**: vite-plugin-pwa with IndexedDB-backed offline draft queue
- **i18n**: Custom EN/TH translations (ported from legacy)

See [`/root/.claude/plans/this-is-the-old-mighty-moon.md`](#) for the full v2 rebuild plan.
