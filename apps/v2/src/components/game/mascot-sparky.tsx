import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@heroquest/ui";
import { useBrand } from "@/components/brand-provider";

export type MascotMood = "idle" | "wave" | "cheer" | "sleep";

/**
 * Sparky — the default mascot SVG, anchored bottom-right.
 *
 * If the active brand has `mascotUrl` set, that image replaces the inline
 * SVG. The same wrapper handles state-machine animations (idle breathing,
 * wave on mount, cheer on celebration, sleep after inactivity) so custom
 * mascots still bob + scale on hover.
 */
export function MascotSparky({
  mood = "idle",
  className,
  onClick,
}: {
  mood?: MascotMood;
  className?: string;
  onClick?: () => void;
}) {
  const brand = useBrand();
  // Wave once on mount.
  const [hasWavedIn, setHasWavedIn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHasWavedIn(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const activeMood: MascotMood = mood !== "idle" ? mood : hasWavedIn ? "idle" : "wave";

  const wingAnim =
    activeMood === "cheer"
      ? { rotate: [-20, 30, -20] }
      : activeMood === "wave"
        ? { rotate: [0, -25, 0, -25, 0] }
        : { rotate: [-5, 5, -5] };
  const bodyAnim =
    activeMood === "sleep" ? { y: [0, 2, 0] } : { y: [0, -3, 0], scale: [1, 1.02, 1] };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`${brand.appName} mascot`}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      animate={bodyAnim}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      className={cn(
        "pointer-events-auto fixed bottom-4 right-4 z-50 flex h-20 w-20 items-center justify-center rounded-full bg-card shadow-magic ring-2 ring-magic/40",
        className,
      )}
    >
      {brand.mascotUrl ? (
        <img
          src={brand.mascotUrl}
          alt={`${brand.appName} mascot`}
          className="h-16 w-16 object-contain"
          loading="lazy"
        />
      ) : (
        <svg viewBox="0 0 80 80" className="h-16 w-16" aria-hidden>
        {/* Background glow */}
        <circle cx="40" cy="42" r="30" fill="hsl(var(--brand-magic) / 0.12)" />
        {/* Wing */}
        <motion.path
          d="M18 32 Q8 22 14 42 Q20 38 22 36 Z"
          fill="hsl(var(--brand-magic))"
          animate={wingAnim}
          transition={{ duration: activeMood === "wave" ? 0.7 : 2.4, repeat: Infinity }}
          style={{ transformOrigin: "20px 36px" }}
        />
        {/* Body */}
        <ellipse cx="42" cy="48" rx="22" ry="18" fill="hsl(var(--brand-primary))" />
        {/* Belly */}
        <ellipse cx="42" cy="54" rx="14" ry="9" fill="hsl(var(--brand-magic) / 0.5)" />
        {/* Head */}
        <circle cx="48" cy="30" r="14" fill="hsl(var(--brand-primary))" />
        {/* Horn */}
        <path d="M52 18 L56 12 L58 22 Z" fill="hsl(var(--brand-accent))" />
        {/* Eye */}
        {activeMood === "sleep" ? (
          <path d="M48 30 q3 -2 6 0" stroke="white" strokeWidth="1.5" fill="none" />
        ) : (
          <>
            <circle cx="51" cy="30" r="3.5" fill="white" />
            <motion.circle
              cx="52"
              cy="31"
              r="2"
              fill="#1A1140"
              animate={activeMood === "cheer" ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.4, repeat: activeMood === "cheer" ? Infinity : 0 }}
            />
          </>
        )}
        {/* Smile / cheek */}
        {activeMood === "cheer" ? (
          <path
            d="M44 36 q4 4 8 0"
            stroke="hsl(var(--brand-accent))"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M46 35 q3 2 6 0"
            stroke="hsl(var(--brand-accent))"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        )}
        </svg>
      )}
    </motion.button>
  );
}
