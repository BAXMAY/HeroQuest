import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { getLeaderboard } from "@/server/fns/leaderboard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/leaderboard")({
  loader: ({ context }) => context,
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { profile } = Route.useRouteContext();
  const [scope, setScope] = useState<"global" | "family">("global");
  const lb = useQuery({
    queryKey: ["leaderboard", scope],
    queryFn: () => getLeaderboard({ data: { scope } }),
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-3xl">Leaderboard</h1>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={scope === "global" ? "default" : "outline"}
          onClick={() => setScope("global")}
        >
          Global
        </Button>
        <Button
          size="sm"
          variant={scope === "family" ? "default" : "outline"}
          onClick={() => setScope("family")}
          disabled={!profile.familyId}
        >
          Family
        </Button>
      </div>

      {lb.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : lb.data && lb.data.length > 0 ? (
        <ol className="flex flex-col gap-2">
          {lb.data.map((row) => {
            const isMe = row.userId === profile.userId;
            return (
              <li
                key={row.userId}
                className={`flex items-center justify-between rounded-xl border p-4 ${
                  isMe ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <RankBadge rank={row.rank} />
                  <span className="font-semibold">
                    {row.username} {isMe ? <span className="text-primary">(you)</span> : null}
                  </span>
                </div>
                <span className="font-bold text-magic">{row.totalXp.toLocaleString()} XP</span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">
          {scope === "family"
            ? "Join a family to see siblings here."
            : "No heroes on the leaderboard yet."}
        </p>
      )}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <Crown className="h-6 w-6 text-accent" />;
  }
  if (rank === 2) {
    return <Trophy className="h-6 w-6 text-muted-foreground" />;
  }
  if (rank === 3) {
    return <Medal className="h-6 w-6 text-flame" />;
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
      {rank}
    </span>
  );
}
