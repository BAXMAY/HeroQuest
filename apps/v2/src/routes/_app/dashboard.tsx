import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, ScrollText, Trophy } from "lucide-react";
import { listMyQuests } from "@/server/fns/quests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XPBar } from "@/components/game/xp-bar";
import { QuestCard } from "@/components/game/quest-card";

export const Route = createFileRoute("/_app/dashboard")({
  loader: ({ context }) => context,
  component: DashboardPage,
});

function DashboardPage() {
  const { profile } = Route.useRouteContext();
  const quests = useQuery({
    queryKey: ["my-quests"],
    queryFn: () => listMyQuests(),
  });
  const approved = quests.data?.filter((q) => q.status === "approved").length ?? 0;
  const pending = quests.data?.filter((q) => q.status === "pending").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h1 className="font-heading text-3xl">
          Welcome back, {profile.firstName || profile.username}!
        </h1>
        <XPBar xp={profile.totalXp} size="lg" />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat icon={<Trophy className="h-5 w-5 text-accent" />} label="Approved quests" value={approved} />
        <Stat icon={<ScrollText className="h-5 w-5 text-primary" />} label="Awaiting approval" value={pending} />
        <Stat icon={<Flame className="h-5 w-5 text-flame" />} label="Day streak" value={profile.streakCurrent} />
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Ready for a new quest?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Take a photo of a good deed you did — feed the cat, help a neighbour, recycle — and
              submit it. An adult will approve it and reward you with XP and Brave Coins.
            </p>
            <Button asChild size="lg" className="w-fit">
              <Link to="/submit">Submit a quest</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl">Recent submissions</h2>
        {quests.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : quests.data && quests.data.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {quests.data.slice(0, 5).map((q) => (
              <li key={q.id}>
                <QuestCard xp={q.xpAwarded}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{q.description.slice(0, 80)}</p>
                      <p className="text-xs text-muted-foreground">
                        {q.category} · {q.status}
                      </p>
                    </div>
                    {q.status === "approved" ? (
                      <span className="whitespace-nowrap text-sm font-bold text-magic">
                        +{q.xpAwarded} XP · +{q.coinsAwarded}c
                      </span>
                    ) : (
                      <span className="text-xs uppercase text-muted-foreground">{q.status}</span>
                    )}
                  </div>
                </QuestCard>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No quests yet — submit your first one!
          </p>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className="rounded-xl bg-muted p-2.5">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
