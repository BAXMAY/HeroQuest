import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins } from "lucide-react";
import { listMyRedemptions, listRewards, redeemReward } from "@/server/fns/rewards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCelebrate } from "@/components/game/celebrate";
import { useSound } from "@/components/game/sound-provider";

export const Route = createFileRoute("/_app/rewards")({
  loader: ({ context }) => context,
  component: RewardsPage,
});

function RewardsPage() {
  const { profile } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const rewards = useQuery({ queryKey: ["rewards"], queryFn: () => listRewards() });
  const mine = useQuery({ queryKey: ["my-redemptions"], queryFn: () => listMyRedemptions() });
  const celebrate = useCelebrate();
  const sound = useSound();
  const redeem = useMutation({
    mutationFn: redeemReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["my-redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      sound.play("coin");
      celebrate.burst();
    },
    onError: () => sound.play("reject"),
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="font-heading text-3xl">Rewards shop</h1>
        <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 font-bold text-accent-foreground">
          <Coins className="h-5 w-5 text-accent" />
          {profile.braveCoins.toLocaleString()}
        </span>
      </header>

      <section>
        <h2 className="mb-3 font-heading text-xl">Available rewards</h2>
        {rewards.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.data?.map((r) => {
              const canAfford = profile.braveCoins >= r.cost;
              return (
                <Card key={r.id}>
                  <img
                    src={r.imageUrl}
                    alt={r.name}
                    className="aspect-square w-full rounded-t-2xl object-cover"
                    loading="lazy"
                  />
                  <CardHeader>
                    <CardTitle className="text-lg">{r.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-bold text-accent">
                        <Coins className="h-4 w-4" />
                        {r.cost}
                      </span>
                      <Button
                        size="sm"
                        disabled={!canAfford || redeem.isPending}
                        onClick={() => redeem.mutate({ data: { rewardId: r.id } })}
                      >
                        {canAfford ? "Redeem" : "Not enough"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl">Your redemptions</h2>
        {mine.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : mine.data && mine.data.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {mine.data.map((r) => (
              <li
                key={r.redemption.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <p className="font-semibold">{r.reward.name}</p>
                  <p className="text-xs uppercase text-muted-foreground">{r.redemption.status}</p>
                </div>
                <span className="text-sm font-bold text-accent">
                  -{r.redemption.costAtTime}c
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">You haven't redeemed anything yet.</p>
        )}
      </section>
    </div>
  );
}
