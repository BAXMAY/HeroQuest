import { createFileRoute } from "@tanstack/react-router";
import { getLevelProgress } from "@heroquest/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_app/profile")({
  loader: ({ context }) => context,
  component: ProfilePage,
});

function ProfilePage() {
  const { profile } = Route.useRouteContext();
  const level = getLevelProgress(profile.totalXp);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{profile.firstName || profile.username}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Username" value={profile.username} />
            <Field label="Level" value={`${level.current.level} · ${level.current.title}`} />
            <Field label="Total XP" value={profile.totalXp.toLocaleString()} />
            <Field label="Brave Coins" value={profile.braveCoins.toLocaleString()} />
            <Field label="Quests completed" value={profile.questsCompleted} />
            <Field label="Current streak" value={profile.streakCurrent} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
