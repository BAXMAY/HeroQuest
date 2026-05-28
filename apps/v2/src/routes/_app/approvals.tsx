import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { decideQuest, listPendingQuests } from "@/server/fns/quests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useCelebrate } from "@/components/game/celebrate";
import { useSound } from "@/components/game/sound-provider";
import { ACHIEVEMENT_CATALOG } from "@heroquest/db";

export const Route = createFileRoute("/_app/approvals")({
  beforeLoad: ({ context }) => {
    const role = (context as { profile?: { role?: string } } | undefined)?.profile?.role;
    if (role !== "admin" && role !== "parent") throw redirect({ to: "/dashboard" });
  },
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const queryClient = useQueryClient();
  const celebrate = useCelebrate();
  const sound = useSound();
  const pending = useQuery({
    queryKey: ["pending-quests"],
    queryFn: () => listPendingQuests(),
  });
  const decide = useMutation({
    mutationFn: decideQuest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pending-quests"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      if (!data?.ok) return;
      if (data.leveledUp && data.newLevel) {
        celebrate.levelUp(data.newLevel);
      } else {
        celebrate.burst();
      }
      const catalogById = new Map(ACHIEVEMENT_CATALOG.map((a) => [a.id, a]));
      data.newAchievements?.forEach((id) => {
        const def = catalogById.get(id);
        if (def) celebrate.achievement(def.name);
      });
    },
    onError: () => sound.play("reject"),
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-3xl">Pending approvals</h1>
      {pending.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : pending.data && pending.data.length > 0 ? (
        pending.data.map((row) => (
          <PendingQuestCard
            key={row.quest.id}
            quest={row.quest}
            submitterUsername={row.profile.username}
            onDecide={(decision, xp, coins) =>
              decide.mutate({ data: { questId: row.quest.id, decision, xp, coins } })
            }
            disabled={decide.isPending}
          />
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No pending quests — great job team!</p>
      )}
    </div>
  );
}

function PendingQuestCard({
  quest,
  submitterUsername,
  onDecide,
  disabled,
}: {
  quest: {
    id: string;
    description: string;
    category: string;
    photoR2Key: string;
    submittedAt: Date;
  };
  submitterUsername: string;
  onDecide: (decision: "approved" | "rejected", xp: number, coins: number) => void;
  disabled: boolean;
}) {
  const [xp, setXp] = useState(50);
  const [coins, setCoins] = useState(5);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{submitterUsername}</CardTitle>
        <CardDescription>{quest.category}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 md:flex-row">
        <img
          src={`/api/r2/${encodeURIComponent(quest.photoR2Key)}`}
          alt="Quest proof"
          className="h-48 w-full rounded-xl border border-border object-cover md:w-64"
        />
        <div className="flex flex-1 flex-col gap-3">
          <p className="text-sm">{quest.description}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground">XP</label>
              <Input
                type="number"
                min={0}
                max={500}
                value={xp}
                onChange={(e) => setXp(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Brave Coins
              </label>
              <Input
                type="number"
                min={0}
                max={50}
                value={coins}
                onChange={(e) => setCoins(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              disabled={disabled}
              onClick={() => onDecide("approved", xp, coins)}
              className="flex-1"
            >
              Approve
            </Button>
            <Button
              disabled={disabled}
              onClick={() => onDecide("rejected", 0, 0)}
              variant="outline"
              className="flex-1"
            >
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
