import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { SPIN_SEGMENTS } from "@heroquest/db";
import { playSpin } from "@/server/fns/games";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCelebrate } from "@/components/game/celebrate";
import { useSound } from "@/components/game/sound-provider";

export const Route = createFileRoute("/_app/games/spin")({
  component: SpinPage,
});

const SEGMENT_ANGLE = 360 / SPIN_SEGMENTS.length;

const COLORS = [
  "hsl(var(--brand-primary))",
  "hsl(var(--brand-secondary))",
  "hsl(var(--brand-accent))",
  "hsl(var(--brand-magic))",
  "hsl(var(--brand-flame))",
  "hsl(var(--brand-primary))",
  "hsl(var(--brand-secondary))",
  "hsl(var(--muted))",
];

function SpinPage() {
  const queryClient = useQueryClient();
  const celebrate = useCelebrate();
  const sound = useSound();
  const [rotation, setRotation] = useState(0);
  const [done, setDone] = useState<{ xp: number; coins: number; prize: string } | null>(null);

  const spin = useMutation({
    mutationFn: playSpin,
    onMutate: () => sound.play("click"),
    onSuccess: (outcome) => {
      const turns = 6 + Math.random() * 2; // 6-8 full turns
      // Land mid-segment so the pointer (top, 0deg) points at the prize.
      const target =
        turns * 360 + 360 - (outcome.segmentIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2);
      setRotation(target);
      setTimeout(() => {
        setDone({ xp: outcome.xp, coins: outcome.coins, prize: outcome.prize });
        if (outcome.xp || outcome.coins) {
          sound.play(outcome.coins > 0 ? "coin" : "xp");
          celebrate.burst();
        }
        queryClient.invalidateQueries({ queryKey: ["daily-state"] });
        queryClient.invalidateQueries({ queryKey: ["me"] });
      }, 3000);
    },
  });

  const spinningRef = useRef(false);
  function onSpin() {
    if (spinningRef.current || done) return;
    spinningRef.current = true;
    spin.mutate({});
  }

  return (
    <div className="mx-auto max-w-md flex flex-col items-center gap-6">
      <h1 className="font-heading text-3xl">Daily Spin</h1>
      <p className="text-center text-muted-foreground">
        One spin per day. May the wheel be ever in your favour!
      </p>
      <div className="relative h-72 w-72">
        {/* pointer */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
          <svg viewBox="0 0 20 20" className="h-6 w-6 fill-flame">
            <path d="M10 18 L2 6 L18 6 Z" />
          </svg>
        </div>
        <motion.div
          className="relative h-full w-full rounded-full border-4 border-card shadow-quest"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {SPIN_SEGMENTS.map((s, i) => {
              const startAngle = i * SEGMENT_ANGLE - 90 - SEGMENT_ANGLE / 2;
              const endAngle = startAngle + SEGMENT_ANGLE;
              const r = 50;
              const cx = 50;
              const cy = 50;
              const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
              const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
              const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
              const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
              const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`;
              const labelAngle = (startAngle + endAngle) / 2;
              const labelX = cx + r * 0.62 * Math.cos((labelAngle * Math.PI) / 180);
              const labelY = cy + r * 0.62 * Math.sin((labelAngle * Math.PI) / 180);
              return (
                <g key={s.prize}>
                  <path d={path} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth="0.5" />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="4"
                    fontWeight="bold"
                  >
                    {s.prize === "none" ? "—" : s.prize.replace("-", " ")}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>
      </div>

      {done ? (
        <div className="flex flex-col items-center gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm uppercase tracking-wider text-muted-foreground">
                You won
              </p>
              <p className="font-heading text-3xl">
                {done.prize === "none"
                  ? "Try again tomorrow!"
                  : `+${done.xp} XP, +${done.coins} coins`}
              </p>
            </CardContent>
          </Card>
          <Button asChild>
            <Link to="/games">Back to games</Link>
          </Button>
        </div>
      ) : (
        <Button onClick={onSpin} disabled={spin.isPending} size="lg" className="w-full">
          {spin.isPending ? "Spinning…" : "Spin the wheel"}
        </Button>
      )}
    </div>
  );
}
