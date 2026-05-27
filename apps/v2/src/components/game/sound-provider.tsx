import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { play, setSoundState, type SoundCue } from "@/lib/sound";

type SoundCtx = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  toggleSound: () => void;
  toggleMusic: () => void;
  play: (cue: SoundCue) => void;
};

const Ctx = createContext<SoundCtx | null>(null);

const STORAGE_KEY = "hq:sound";

export function SoundProvider({
  initial,
  children,
}: {
  initial?: { soundEnabled: boolean; musicEnabled: boolean };
  children: ReactNode;
}) {
  const [soundEnabled, setSoundEnabled] = useState(initial?.soundEnabled ?? true);
  const [musicEnabled, setMusicEnabled] = useState(initial?.musicEnabled ?? true);

  // Hydrate from localStorage on first render — survives across logged-out
  // pages where we don't have the profile yet.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<{ soundEnabled: boolean; musicEnabled: boolean }>;
        if (typeof parsed.soundEnabled === "boolean") setSoundEnabled(parsed.soundEnabled);
        if (typeof parsed.musicEnabled === "boolean") setMusicEnabled(parsed.musicEnabled);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Mirror local state to the imperative `play()` helper.
  useEffect(() => {
    setSoundState({ soundEnabled, musicEnabled });
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ soundEnabled, musicEnabled }),
      );
    } catch {
      /* ignore */
    }
  }, [soundEnabled, musicEnabled]);

  const toggleSound = useCallback(() => setSoundEnabled((v) => !v), []);
  const toggleMusic = useCallback(() => setMusicEnabled((v) => !v), []);

  return (
    <Ctx.Provider
      value={{ soundEnabled, musicEnabled, toggleSound, toggleMusic, play }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSound(): SoundCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSound must be used inside <SoundProvider>");
  return ctx;
}

/** Small mute toggle for the topbar. */
export function SoundToggle() {
  const { soundEnabled, toggleSound } = useSound();
  return (
    <button
      type="button"
      onClick={toggleSound}
      className="rounded-full p-2 text-muted-foreground hover:bg-muted"
      aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
    >
      {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  );
}
