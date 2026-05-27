/**
 * 100-level progression — ported verbatim from
 * `apps/legacy/src/app/lib/levels.ts` so XP curves stay consistent.
 *
 * minXP curve: floor(100 * (level-1)^1.55)
 */

export type Level = {
  level: number;
  title: string;
  minXP: number;
};

const LEVEL_TITLES: readonly string[] = [
  "Novice Adventurer",
  "Apprentice Hero",
  "Brave Companion",
  "Valiant Knight",
  "Guardian of the Realm",
  "Ranger of the Wilds",
  "Mystic Seer",
  "Shadow Striker",
  "Dawnbringer",
  "Champion of Light",
  "Master of Elements",
  "Dragon Tamer",
  "Star Wanderer",
  "Aegis Defender",
  "Void Walker",
  "Sunstone Templar",
  "Moonshadow Rogue",
  "Earthshaker Shaman",
  "Stormcaller Mage",
  "Ironclad Warlord",
  "Celestial Guardian",
  "Abyssal Hunter",
  "Emberheart Alchemist",
  "Frostwind Archer",
  "Verdant Warden",
  "Soulfire Sorcerer",
  "Nightfall Sentinel",
  "Skybreaker Paladin",
  "Chrono Weaver",
  "Rune Forger",
  "Blade Master",
  "Aetherial Sage",
  "Apex Predator",
  "Crimson Vanguard",
  "Divine Herald",
  "Echo of the Ancients",
  "Flameheart Berserker",
  "Glimmerwood Trickster",
  "Highland Thane",
  "Inferno Channeler",
  "Jade Serpent Monk",
  "Keystone Protector",
  "Lunar Justicar",
  "Mythic Carver",
  "Nebula Nomad",
  "Obsidian Sentinel",
  "Phoenix Ascendant",
  "Quasar Knight",
  "Radiant Paragon",
  "Solar Flare",
  "Terraformer",
  "Umbral Assassin",
  "Vortex Vanquisher",
  "Whispering Oracle",
  "Xenith Pioneer",
  "Yggdrasil Keeper",
  "Zephyr Strider",
  "Astral Drifter",
  "Beacon of Hope",
  "Cosmic Sentinel",
  "Dimensional Ripper",
  "Eternal Voyager",
  "Fable Weaver",
  "Galaxy Guardian",
  "Harbinger of Dawn",
  "Infinity Warden",
  "Justice Bringer",
  "Kismet Creator",
  "Lore Keeper",
  "Mirage Master",
  "Nexus Guardian",
  "Omega Knight",
  "Paradox Pilgrim",
  "Quantum Quester",
  "Reality Shaper",
  "Seraphic Judge",
  "Timeless Watcher",
  "Universal Emissary",
  "Vanguard of Ages",
  "Warden of Worlds",
  "Zenith of Heroes",
  "Alpha Protector",
  "Beta Champion",
  "Gamma Guardian",
  "Delta Defender",
  "Epsilon Enforcer",
  "Zeta Zealot",
  "Eta Elder",
  "Theta Thaumaturge",
  "Iota Illusionist",
  "Kappa King",
  "Lambda Legend",
  "Mu Mystic",
  "Nu Nomad",
  "Xi Xiphos",
  "Omicron Overlord",
  "Pi Paladin",
  "Rho Ranger",
  "Sigma Sage",
  // "Tau Templar" intentionally dropped — legacy listed 101 titles for 100
  // levels, so the endgame "The Unwritten" was never shown. v2 makes it
  // the proper level-100 title.
  "The Unwritten",
];

export const LEVELS: readonly Level[] = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  return {
    level,
    title: LEVEL_TITLES[i] ?? `Hero Level ${level}`,
    minXP: Math.floor(100 * Math.pow(level - 1, 1.55)),
  };
});

export function getLevelFromXP(xp: number | undefined | null): Level {
  if (!xp) return LEVELS[0]!;
  let current: Level = LEVELS[0]!;
  for (const l of LEVELS) {
    if (xp >= l.minXP) current = l;
    else break;
  }
  return current;
}

export function getNextLevel(current: Level): Level | null {
  return LEVELS[current.level] ?? null;
}

export function getLevelProgress(xp: number): {
  current: Level;
  next: Level | null;
  xpIntoLevel: number;
  xpForNextLevel: number | null;
  fractionToNext: number;
} {
  const current = getLevelFromXP(xp);
  const next = getNextLevel(current);
  const xpIntoLevel = xp - current.minXP;
  const xpForNextLevel = next ? next.minXP - current.minXP : null;
  const fractionToNext =
    xpForNextLevel && xpForNextLevel > 0 ? Math.min(1, xpIntoLevel / xpForNextLevel) : 1;
  return { current, next, xpIntoLevel, xpForNextLevel, fractionToNext };
}
