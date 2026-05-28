import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CircleDot, HelpCircle, Sparkles } from "lucide-react";
import { getDailyState } from "@/server/fns/games";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@heroquest/ui";

export const Route = createFileRoute("/_app/games/")({
  component: GamesHub,
});

function GamesHub() {
  const state = useQuery({ queryKey: ["daily-state"], queryFn: () => getDailyState() });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl">Today's games</h1>
      <p className="text-muted-foreground">
        One play per game per day. Come back tomorrow for fresh rewards!
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <GameTile
          to="/games/spin"
          icon={<CircleDot className="h-6 w-6 text-accent" />}
          title="Daily Spin"
          desc="Spin the wheel for free XP or coins."
          available={state.data?.spinAvailable ?? false}
        />
        <GameTile
          to="/games/memory"
          icon={<Sparkles className="h-6 w-6 text-magic" />}
          title="Memory Match"
          desc="Flip cards to match heroic icons."
          available={state.data?.memoryAvailable ?? false}
        />
        <GameTile
          to="/games/trivia"
          icon={<HelpCircle className="h-6 w-6 text-primary" />}
          title="Daily Trivia"
          desc="One question about kindness or good values."
          available={state.data?.triviaAvailable ?? false}
        />
      </div>
    </div>
  );
}

function GameTile({
  to,
  icon,
  title,
  desc,
  available,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  available: boolean;
}) {
  return (
    <Card className={cn(!available && "opacity-60")}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-muted p-2.5">{icon}</div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        {available ? (
          <Button asChild className="w-full">
            <Link to={to}>Play</Link>
          </Button>
        ) : (
          <Button disabled className="w-full" variant="outline">
            Played today
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
