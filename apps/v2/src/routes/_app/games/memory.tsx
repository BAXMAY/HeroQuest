import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Heart, Star, Crown, Flame, Trophy } from "lucide-react";
import { submitMemoryResult } from "@/server/fns/games";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCelebrate } from "@/components/game/celebrate";
import { useSound } from "@/components/game/sound-provider";
import { cn } from "@heroquest/ui";

export const Route = createFileRoute("/_app/games/memory")({
  component: MemoryPage,
});

const ICONS = [Sparkles, Heart, Star, Crown, Flame, Trophy] as const;

type Card = {
  id: number;
  iconIndex: number;
  flipped: boolean;
  matched: boolean;
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function buildBoard(): Card[] {
  // 6 pairs = 12 cards.
  return shuffle(
    [0, 1, 2, 3, 4, 5].flatMap((i) => [
      { id: i * 2, iconIndex: i, flipped: false, matched: false },
      { id: i * 2 + 1, iconIndex: i, flipped: false, matched: false },
    ]),
  );
}

function MemoryPage() {
  const queryClient = useQueryClient();
  const celebrate = useCelebrate();
  const sound = useSound();
  const [board, setBoard] = useState<Card[]>(() => buildBoard());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const submit = useMutation({
    mutationFn: submitMemoryResult,
    onSuccess: (result) => {
      sound.play("coin");
      celebrate.burst();
      queryClient.invalidateQueries({ queryKey: ["daily-state"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      void result;
    },
  });

  const completed = board.every((c) => c.matched);

  useEffect(() => {
    if (!completed || submit.isPending || submit.isSuccess) return;
    submit.mutate({ data: { moves, timeMs: Date.now() - startedAt } });
  }, [completed, moves, startedAt, submit]);

  // Auto-flip back unmatched pairs after a beat.
  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;
    const ca = board.find((c) => c.id === a);
    const cb = board.find((c) => c.id === b);
    if (!ca || !cb) return;
    if (ca.iconIndex === cb.iconIndex) {
      // Match — keep flipped + mark matched.
      setBoard((b) =>
        b.map((c) => (c.id === ca.id || c.id === cb.id ? { ...c, matched: true } : c)),
      );
      sound.play("xp");
      setFlipped([]);
    } else {
      const timeout = setTimeout(() => {
        setBoard((b) =>
          b.map((c) => (c.id === ca.id || c.id === cb.id ? { ...c, flipped: false } : c)),
        );
        setFlipped([]);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [flipped, board, sound]);

  function onCardClick(id: number) {
    if (flipped.length >= 2) return;
    const target = board.find((c) => c.id === id);
    if (!target || target.flipped || target.matched) return;
    sound.play("click");
    setBoard((b) => b.map((c) => (c.id === id ? { ...c, flipped: true } : c)));
    setFlipped((f) => [...f, id]);
    setMoves((m) => m + 1);
  }

  const stats = useMemo(() => {
    if (!completed || !submit.data) return null;
    return submit.data;
  }, [completed, submit.data]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6">
      <h1 className="font-heading text-3xl">Memory Match</h1>
      <p className="text-sm text-muted-foreground">
        Moves: <span className="font-bold text-foreground">{moves}</span>
      </p>
      <div className="grid grid-cols-4 gap-3">
        {board.map((card) => {
          const Icon = ICONS[card.iconIndex]!;
          return (
            <motion.button
              key={card.id}
              type="button"
              onClick={() => onCardClick(card.id)}
              disabled={card.matched}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "flex h-20 w-20 items-center justify-center rounded-2xl border-2 transition",
                card.matched
                  ? "border-magic bg-magic/15 text-magic"
                  : card.flipped
                    ? "border-primary bg-card text-primary"
                    : "border-border bg-muted",
              )}
              aria-label="memory card"
            >
              {card.flipped || card.matched ? <Icon className="h-8 w-8" /> : null}
            </motion.button>
          );
        })}
      </div>

      {stats ? (
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              Final score
            </p>
            <p className="font-heading text-3xl">{stats.score}</p>
            <p className="mt-1 text-sm text-magic">
              +{stats.xp} XP · +{stats.coins} coins
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Button asChild variant="outline">
        <Link to="/games">Back to games</Link>
      </Button>
    </div>
  );
}
