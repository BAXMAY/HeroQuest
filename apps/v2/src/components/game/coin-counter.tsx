import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Coins } from "lucide-react";
import { cn } from "@heroquest/ui";

/**
 * Coin badge that springs/counts up when the value changes — used in the
 * topbar so the kid sees their reward animate in after an approval.
 */
export function CoinCounter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1],
    });
    return controls.stop;
  }, [value, mv]);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-sm font-bold text-foreground",
        className,
      )}
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.4 }}
        key={value}
        className="flex items-center"
      >
        <Coins className="h-4 w-4 text-accent" />
      </motion.span>
      <motion.span>{rounded}</motion.span>
    </span>
  );
}
