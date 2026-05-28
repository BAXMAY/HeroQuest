import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@heroquest/ui";

const MILESTONES = [3, 7, 14, 30, 60, 100];

function nextMilestone(days: number): number | null {
  for (const m of MILESTONES) if (m > days) return m;
  return null;
}

/**
 * Streak flame — scales subtly with streak length, glows on milestone.
 * Tooltip explains the next milestone goal.
 */
export function StreakFlame({
  days,
  className,
}: {
  days: number;
  className?: string;
}) {
  const next = nextMilestone(days);
  const onMilestone = MILESTONES.includes(days);
  const scale = Math.min(1.3, 1 + days * 0.01);
  return (
    <motion.span
      title={
        next
          ? `${days}-day streak — keep going to reach ${next} days!`
          : `${days}-day streak — legendary!`
      }
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-flame/15 px-3 py-1 text-sm font-bold text-flame-foreground",
        onMilestone && "shadow-flame",
        className,
      )}
      animate={onMilestone ? { rotate: [0, -8, 8, 0] } : {}}
      transition={{ duration: 0.6 }}
    >
      <Flame
        className="h-4 w-4 text-flame"
        style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
      />
      <span>{days}</span>
    </motion.span>
  );
}
