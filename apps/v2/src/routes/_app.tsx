import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Home, ScrollText, Sparkles, ShieldCheck, LogOut, Trophy, Gift, Award } from "lucide-react";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { SoundToggle } from "@/components/game/sound-provider";
import { CoinCounter } from "@/components/game/coin-counter";
import { StreakFlame } from "@/components/game/streak-flame";
import { MascotSparky } from "@/components/game/mascot-sparky";
import { useEffect } from "react";
import { signOut, useSession } from "@/lib/auth-client";
import { getMe } from "@/server/fns/profile";

/**
 * Authenticated app shell — sidebar nav + topbar. Loader prefetches the
 * current user's profile so the topbar can render their coin / XP counters
 * without a flash.
 */
export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const { user, profile } = await getMe();
    if (!user) throw redirect({ to: "/login" });
    if (!profile) throw redirect({ to: "/onboarding" });
    return { user, profile };
  },
  loader: ({ context }) => context,
  component: AppLayout,
});

function AppLayout() {
  const { profile } = Route.useRouteContext();
  const navigate = useNavigate();
  const session = useSession();

  // Better Auth's React client may need a hydration tick to populate session
  // — when the cookie expires mid-session we redirect to login.
  useEffect(() => {
    if (session.data === null) navigate({ to: "/login" });
  }, [session.data, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="font-heading text-xl font-bold text-primary">
            HeroQuest
          </Link>
          <nav className="hidden gap-1 md:flex">
            <NavLink to="/dashboard" icon={<Home className="h-4 w-4" />}>
              Home
            </NavLink>
            <NavLink to="/submit" icon={<ScrollText className="h-4 w-4" />}>
              Submit quest
            </NavLink>
            <NavLink to="/rewards" icon={<Gift className="h-4 w-4" />}>
              Rewards
            </NavLink>
            <NavLink to="/leaderboard" icon={<Trophy className="h-4 w-4" />}>
              Leaderboard
            </NavLink>
            <NavLink to="/achievements" icon={<Award className="h-4 w-4" />}>
              Badges
            </NavLink>
            {(profile.role === "admin" || profile.role === "parent") && (
              <NavLink to="/approvals" icon={<ShieldCheck className="h-4 w-4" />}>
                Approvals
              </NavLink>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {profile.streakCurrent > 0 ? (
            <StreakFlame days={profile.streakCurrent} />
          ) : null}
          <span className="hidden items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-bold sm:inline-flex">
            <Sparkles className="h-4 w-4 text-magic" />
            {profile.totalXp.toLocaleString()} XP
          </span>
          <CoinCounter value={profile.braveCoins} />
          <SoundToggle />
          <NotificationsDropdown />
          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate({ to: "/login" });
            }}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
      <main className="container py-8">
        <Outlet />
      </main>
      <MascotSparky />
    </div>
  );
}

function NavLink({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground [&.active]:bg-primary [&.active]:text-primary-foreground"
      activeOptions={{ exact: true }}
    >
      {icon}
      {children}
    </Link>
  );
}
