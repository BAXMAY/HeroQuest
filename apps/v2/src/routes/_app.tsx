import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Coins, Home, ScrollText, Sparkles, ShieldCheck, LogOut } from "lucide-react";
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
            {(profile.role === "admin" || profile.role === "parent") && (
              <NavLink to="/approvals" icon={<ShieldCheck className="h-4 w-4" />}>
                Approvals
              </NavLink>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-bold">
            <Sparkles className="h-4 w-4 text-magic" />
            {profile.totalXp.toLocaleString()} XP
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-bold">
            <Coins className="h-4 w-4 text-accent" />
            {profile.braveCoins.toLocaleString()}
          </span>
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
