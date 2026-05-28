/**
 * Sound effect manager — single Howler sprite for low overhead.
 *
 * Drop `/public/sfx/sprite.webm` (and matching `sprite.mp3` for Safari)
 * with the segments laid out below. If the sprite isn't present (dev
 * before audio assets land), play() is a no-op so the UI still works.
 */
import { Howl } from "howler";

export type SoundCue =
  | "click"
  | "coin"
  | "xp"
  | "levelup"
  | "approve"
  | "reject"
  | "achievement"
  | "streak";

// Times in ms — keep in sync with the recording.
const SPRITE_MAP: Record<SoundCue, [number, number]> = {
  click: [0, 200],
  coin: [400, 700],
  xp: [1300, 800],
  levelup: [2300, 2400],
  approve: [5000, 1500],
  reject: [6800, 1000],
  achievement: [8200, 2200],
  streak: [10800, 900],
};

let sprite: Howl | null = null;
let attemptedLoad = false;

function ensureSprite(): Howl | null {
  if (sprite || attemptedLoad) return sprite;
  attemptedLoad = true;
  try {
    sprite = new Howl({
      src: ["/sfx/sprite.webm", "/sfx/sprite.mp3"],
      sprite: SPRITE_MAP as unknown as Record<string, [number, number]>,
      preload: true,
      onloaderror: () => {
        sprite = null; // assets not deployed — fall back to silence
      },
    });
  } catch {
    sprite = null;
  }
  return sprite;
}

export type SoundState = {
  soundEnabled: boolean;
  musicEnabled: boolean;
};

let state: SoundState = { soundEnabled: true, musicEnabled: true };

export function setSoundState(next: Partial<SoundState>): void {
  state = { ...state, ...next };
}

export function getSoundState(): SoundState {
  return state;
}

export function play(cue: SoundCue): void {
  if (!state.soundEnabled) return;
  if (typeof window === "undefined") return;
  const s = ensureSprite();
  if (!s) return;
  try {
    s.play(cue);
  } catch {
    // Howler can throw on autoplay-blocked first play — ignore.
  }
}
