import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "@/lib/use-window-size";
import type { Level } from "@heroquest/db";
import { useSound } from "./sound-provider";

type CelebrateCtx = {
  /** Trigger a generic confetti burst (1.5s). */
  burst: () => void;
  /** Trigger the level-up overlay. */
  levelUp: (level: Level) => void;
  /** Trigger an achievement toast with confetti. */
  achievement: (achievementName: string) => void;
};

const Ctx = createContext<CelebrateCtx | null>(null);

export function CelebrateProvider({ children }: { children: ReactNode }) {
  const [confetti, setConfetti] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<Level | null>(null);
  const [achievementName, setAchievementName] = useState<string | null>(null);
  const { width, height } = useWindowSize();
  const sound = useSound();

  const burst = useCallback(() => {
    setConfetti(true);
    sound.play("approve");
    setTimeout(() => setConfetti(false), 5000);
  }, [sound]);

  const levelUp = useCallback(
    (level: Level) => {
      setLevelUpInfo(level);
      setConfetti(true);
      sound.play("levelup");
      setTimeout(() => setConfetti(false), 5000);
    },
    [sound],
  );

  const achievement = useCallback(
    (name: string) => {
      setAchievementName(name);
      setConfetti(true);
      sound.play("achievement");
      setTimeout(() => setConfetti(false), 4000);
      setTimeout(() => setAchievementName(null), 4000);
    },
    [sound],
  );

  return (
    <Ctx.Provider value={{ burst, levelUp, achievement }}>
      {children}
      {confetti && width && height ? (
        <div className="pointer-events-none fixed inset-0 z-[60]">
          <Confetti
            width={width}
            height={height}
            numberOfPieces={300}
            recycle={false}
            colors={[
              "#a78bfa",
              "#34d399",
              "#fbbf24",
              "#f472b6",
              "#fb7185",
            ]}
          />
        </div>
      ) : null}
      <AnimatePresence>
        {levelUpInfo ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[55] flex items-center justify-center bg-background/60 backdrop-blur-sm"
            onAnimationComplete={() => {
              setTimeout(() => setLevelUpInfo(null), 3500);
            }}
          >
            <motion.div
              initial={{ scale: 0.7, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="pointer-events-auto rounded-3xl border-2 border-magic bg-card p-10 text-center shadow-magic"
            >
              <p className="font-heading text-sm uppercase tracking-[0.3em] text-magic">
                Level up!
              </p>
              <p className="mt-2 font-heading text-6xl font-bold text-foreground">
                {levelUpInfo.level}
              </p>
              <p className="mt-3 font-heading text-2xl text-accent">{levelUpInfo.title}</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {achievementName ? (
          <motion.div
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 16, opacity: 1 }}
            exit={{ y: -120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="pointer-events-auto fixed left-1/2 top-0 z-[55] -translate-x-1/2 rounded-2xl border border-magic bg-card px-6 py-3 shadow-magic"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-magic">
              Achievement unlocked
            </p>
            <p className="font-heading text-lg">{achievementName}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

export function useCelebrate(): CelebrateCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCelebrate must be used inside <CelebrateProvider>");
  return ctx;
}
