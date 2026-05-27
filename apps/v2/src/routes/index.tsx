import { createFileRoute, Link } from "@tanstack/react-router";

/**
 * Landing page — the bright + RPG redesign target.
 * Phase 3 will replace this with a polished hero + mascot.
 */
export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="relative isolate overflow-hidden">
      <div className="container flex min-h-screen flex-col items-center justify-center gap-8 py-24 text-center">
        <p className="rounded-full border border-border bg-card px-4 py-1 text-sm font-semibold uppercase tracking-wider text-primary">
          HeroQuest v2
        </p>
        <h1 className="text-balance font-heading text-5xl font-bold leading-tight md:text-7xl">
          Real-world good deeds.
          <br />
          <span className="bg-gradient-to-r from-primary via-magic to-accent bg-clip-text text-transparent">
            Heroic rewards.
          </span>
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground">
          Kids complete quests in the real world. Parents approve them. Everyone levels up.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-8 text-base font-bold text-primary-foreground shadow-quest transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Start your quest
          </Link>
          <a
            href="https://github.com"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-card px-8 text-base font-semibold transition hover:bg-muted"
          >
            For parents
          </a>
        </div>
      </div>
    </main>
  );
}
