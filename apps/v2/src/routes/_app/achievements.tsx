import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { listAllAchievements, listMyAchievements } from "@/server/fns/achievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@heroquest/ui";

export const Route = createFileRoute("/_app/achievements")({
  component: AchievementsPage,
});

function AchievementsPage() {
  const all = useQuery({ queryKey: ["achievements"], queryFn: () => listAllAchievements() });
  const mine = useQuery({
    queryKey: ["my-achievements"],
    queryFn: () => listMyAchievements(),
  });

  const unlockedIds = new Set(mine.data?.map((m) => m.achievement.id) ?? []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-3xl">Achievements</h1>
      <p className="text-muted-foreground">
        Earn these by completing quests and reaching milestones.
      </p>
      {all.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {all.data?.map((a) => {
            const Icon =
              ((Icons as unknown as Record<string, Icons.LucideIcon>)[a.icon]) ?? Icons.Sparkles;
            const unlocked = unlockedIds.has(a.id);
            return (
              <Card
                key={a.id}
                className={cn(
                  "transition",
                  unlocked
                    ? "border-magic/40 shadow-magic"
                    : "opacity-60 saturate-50",
                )}
              >
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl",
                      unlocked ? "bg-magic/15 text-magic" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-base">{a.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
