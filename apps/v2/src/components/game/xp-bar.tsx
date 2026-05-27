import { motion } from "framer-motion";
import { getLevelProgress } from "@heroquest/db";
import { cn } from "@heroquest/ui";

/**
 * Animated XP progress bar with current level + next-level label.
 */
export function XPBar({
  xp,
  size = "md",
  className,
}: {
  xp: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { current, next, xpIntoLevel, xpForNextLevel, fractionToNext } =
    getLevelProgress(xp);
  const heights: Record<typeof size, string> = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-bold text-foreground">
          Lvl {current.level} · {current.title}
        </span>
        {next ? (
          <span className="text-muted-foreground">
            {xpIntoLevel.toLocaleString()} / {xpForNextLevel?.toLocaleString()} XP
          </span>
        ) : (
          <span className="font-semibold text-magic">MAX</span>
        )}
      </div>
      <div className={cn("overflow-hidden rounded-full bg-muted", heights[size])}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary via-magic to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(fractionToNext * 100)}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
      </div>
    </div>
  );
}
