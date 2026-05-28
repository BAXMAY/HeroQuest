import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn, rarityFromXp, type Rarity } from "@heroquest/ui";

const BORDERS: Record<Rarity, string> = {
  common: "border-border",
  rare: "border-secondary/60 shadow-[0_4px_18px_-2px_hsl(var(--brand-secondary)/0.4)]",
  epic: "border-magic/60 shadow-magic",
  legendary:
    "border-transparent bg-rarity-legendary bg-[length:200%_200%] animate-rarity-shimmer",
};

const BADGE_COLORS: Record<Rarity, string> = {
  common: "bg-muted text-muted-foreground",
  rare: "bg-secondary/20 text-secondary",
  epic: "bg-magic/20 text-magic",
  legendary: "bg-accent/30 text-accent-foreground",
};

/**
 * Card with a border style that escalates with XP reward. Legendary
 * quests get an animated shimmer.
 */
export function QuestCard({
  xp,
  children,
  className,
}: {
  xp: number;
  children: ReactNode;
  className?: string;
}) {
  const rarity = rarityFromXp(xp);
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "relative rounded-2xl border-2 bg-card p-4 transition",
        BORDERS[rarity],
        className,
      )}
    >
      <span
        className={cn(
          "absolute -top-2.5 right-4 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
          BADGE_COLORS[rarity],
        )}
      >
        {rarity}
      </span>
      {children}
    </motion.div>
  );
}
