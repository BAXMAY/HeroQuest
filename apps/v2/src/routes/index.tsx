import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Coins, Crown, Sparkles, Trophy, Flame, Heart } from "lucide-react";
import { MascotSparky } from "@/components/game/mascot-sparky";

/**
 * Landing page — bright + RPG hero with mascot teaser, feature cards.
 */
export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="relative isolate overflow-hidden">
      {/* Gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-magic/20 blur-3xl" />
        <div className="absolute right-1/4 top-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <section className="container flex min-h-[80vh] flex-col items-center justify-center gap-8 py-24 text-center">
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-full border border-magic/30 bg-card px-4 py-1 text-sm font-bold uppercase tracking-[0.2em] text-magic"
        >
          HeroQuest v2
        </motion.p>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-balance font-heading text-5xl font-bold leading-tight md:text-7xl"
        >
          Real-world good deeds.
          <br />
          <span className="bg-gradient-to-r from-primary via-magic to-accent bg-clip-text text-transparent">
            Heroic rewards.
          </span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl text-balance text-lg text-muted-foreground"
        >
          Kids complete quests in the real world. Parents approve them. Everyone levels up,
          collects Brave Coins, and earns badges along the way.
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/register"
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-8 text-base font-bold text-primary-foreground shadow-quest transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Start your quest
          </Link>
          <Link
            to="/login"
            className="inline-flex h-14 items-center justify-center rounded-2xl border border-border bg-card px-8 text-base font-semibold transition hover:bg-muted"
          >
            Sign in
          </Link>
        </motion.div>
      </section>

      <section className="container py-16">
        <h2 className="mb-10 text-center font-heading text-3xl">How HeroQuest works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            icon={<Sparkles className="h-6 w-6 text-magic" />}
            title="Submit a quest"
            body="Snap a photo of your good deed and tell us what you did. Easy."
          />
          <Feature
            icon={<Heart className="h-6 w-6 text-flame" />}
            title="An adult approves"
            body="Your parent or teacher gives the green light and decides the reward."
          />
          <Feature
            icon={<Coins className="h-6 w-6 text-accent" />}
            title="Earn XP & coins"
            body="Level up, unlock badges, spin the daily wheel, and redeem rewards."
          />
        </div>
      </section>

      <section className="container py-16">
        <div className="grid items-center gap-10 rounded-3xl border border-border bg-card p-10 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="font-heading text-3xl">Built for kids. Loved by parents.</h2>
            <ul className="flex flex-col gap-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Crown className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                100 hero levels with epic titles
              </li>
              <li className="flex items-start gap-2">
                <Trophy className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                12 badges to collect across categories
              </li>
              <li className="flex items-start gap-2">
                <Flame className="mt-0.5 h-5 w-5 flex-shrink-0 text-flame" />
                Daily streaks and mini-games
              </li>
              <li className="flex items-start gap-2">
                <Heart className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                Photos stay private — only family + admins can see
              </li>
            </ul>
          </div>
          <div className="relative flex h-72 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 via-magic/10 to-accent/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 animate-pulse rounded-full bg-magic/15 blur-xl" />
            </div>
            <div className="relative">
              <SparkyPreview />
            </div>
          </div>
        </div>
      </section>

      <MascotSparky />
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <motion.div
      whileInView={{ y: [10, 0], opacity: [0, 1] }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-muted">
        {icon}
      </div>
      <h3 className="font-heading text-xl">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </motion.div>
  );
}

function SparkyPreview() {
  // Bigger inline dragon — same SVG body as the corner mascot, just scaled.
  return (
    <svg viewBox="0 0 80 80" className="h-48 w-48 animate-mascot-breathe">
      <circle cx="40" cy="42" r="30" fill="hsl(var(--brand-magic) / 0.12)" />
      <path d="M18 32 Q8 22 14 42 Q20 38 22 36 Z" fill="hsl(var(--brand-magic))" />
      <ellipse cx="42" cy="48" rx="22" ry="18" fill="hsl(var(--brand-primary))" />
      <ellipse cx="42" cy="54" rx="14" ry="9" fill="hsl(var(--brand-magic) / 0.5)" />
      <circle cx="48" cy="30" r="14" fill="hsl(var(--brand-primary))" />
      <path d="M52 18 L56 12 L58 22 Z" fill="hsl(var(--brand-accent))" />
      <circle cx="51" cy="30" r="3.5" fill="white" />
      <circle cx="52" cy="31" r="2" fill="#1A1140" />
      <path
        d="M44 36 q4 4 8 0"
        stroke="hsl(var(--brand-accent))"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
