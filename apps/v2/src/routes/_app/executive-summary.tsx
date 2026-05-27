import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Trophy, Coins, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getExecutiveSummary } from "@/server/fns/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_app/executive-summary")({
  beforeLoad: ({ context }) => {
    const role = (context as { profile?: { role?: string } } | undefined)?.profile?.role;
    if (role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: ExecutiveSummaryPage,
});

function ExecutiveSummaryPage() {
  const data = useQuery({
    queryKey: ["exec-summary"],
    queryFn: () => getExecutiveSummary(),
  });

  if (data.isLoading || !data.data)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  const s = data.data;
  const chartData = s.topHeroes.slice(0, 8).map((h) => ({
    name: h.username,
    xp: h.totalXp,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl">Executive summary</h1>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiTile
          icon={<Users className="h-5 w-5 text-primary" />}
          label="Total users"
          value={s.totalUsers}
        />
        <KpiTile
          icon={<Trophy className="h-5 w-5 text-accent" />}
          label="Approved quests"
          value={s.approvedQuests}
        />
        <KpiTile
          icon={<Sparkles className="h-5 w-5 text-magic" />}
          label="XP awarded"
          value={s.totalXpAwarded}
        />
        <KpiTile
          icon={<Coins className="h-5 w-5 text-accent" />}
          label="Coins awarded"
          value={s.totalCoinsAwarded}
        />
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Top heroes by XP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="xp" fill="hsl(var(--brand-primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Recent approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y divide-border">
              {s.recentApprovals.map((r) => (
                <li key={r.quest.id} className="flex justify-between py-2">
                  <div>
                    <p className="font-semibold">{r.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.quest.description.slice(0, 60)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-magic">
                    +{r.quest.xpAwarded} XP
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function KpiTile({
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
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-xl bg-muted p-2.5">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl">{value.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
