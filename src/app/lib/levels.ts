
export type Level = {
  level: number;
  title: string;
  minXP: number;
};

const levelTitles: string[] = [
    'Novice Adventurer', 'Apprentice Hero', 'Brave Companion', 'Valiant Knight', 'Guardian of the Realm',
    'Ranger of the Wilds', 'Mystic Seer', 'Shadow Striker', 'Dawnbringer', 'Champion of Light',
    'Master of Elements', 'Dragon Tamer', 'Star Wanderer', 'Aegis Defender', 'Void Walker',
    'Sunstone Templar', 'Moonshadow Rogue', 'Earthshaker Shaman', 'Stormcaller Mage', 'Ironclad Warlord',
    'Celestial Guardian', 'Abyssal Hunter', 'Emberheart Alchemist', 'Frostwind Archer', 'Verdant Warden',
    'Soulfire Sorcerer', 'Nightfall Sentinel', 'Skybreaker Paladin', 'Chrono Weaver', 'Rune Forger',
    'Blade Master', 'Aetherial Sage', 'Apex Predator', 'Crimson Vanguard', 'Divine Herald',
    'Echo of the Ancients', 'Flameheart Berserker', 'Glimmerwood Trickster', 'Highland Thane', 'Inferno Channeler',
    'Jade Serpent Monk', 'Keystone Protector', 'Lunar Justicar', 'Mythic Carver', 'Nebula Nomad',
    'Obsidian Sentinel', 'Phoenix Ascendant', 'Quasar Knight', 'Radiant Paragon', 'Solar Flare',
    'Terraformer', 'Umbral Assassin', 'Vortex Vanquisher', 'Whispering Oracle', 'Xenith Pioneer',
    'Yggdrasil Keeper', 'Zephyr Strider', 'Astral Drifter', 'Beacon of Hope', 'Cosmic Sentinel',
    'Dimensional Ripper', 'Eternal Voyager', 'Fable Weaver', 'Galaxy Guardian', 'Harbinger of Dawn',
    'Infinity Warden', 'Justice Bringer', 'Kismet Creator', 'Lore Keeper', 'Mirage Master',
    'Nexus Guardian', 'Omega Knight', 'Paradox Pilgrim', 'Quantum Quester', 'Reality Shaper',
    'Seraphic Judge', 'Timeless Watcher', 'Universal Emissary', 'Vanguard of Ages', 'Warden of Worlds',
    'Zenith of Heroes', 'Alpha Protector', 'Beta Champion', 'Gamma Guardian', 'Delta Defender',
    'Epsilon Enforcer', 'Zeta Zealot', 'Eta Elder', 'Theta Thaumaturge', 'Iota Illusionist',
    'Kappa King', 'Lambda Legend', 'Mu Mystic', 'Nu Nomad', 'Xi Xiphos',
    'Omicron Overlord', 'Pi Paladin', 'Rho Ranger', 'Sigma Sage', 'Tau Templar', 'The Unwritten'
];


export const levels: Level[] = Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;
    const minXP = Math.floor(100 * Math.pow(level - 1, 1.55));
    return {
        level: level,
        title: levelTitles[i] || `Hero Level ${level}`,
        minXP: minXP,
    };
});

export const getLevelFromXP = (xp: number | undefined): Level => {
  if (xp === undefined) return levels[0];
  
  let currentLevel: Level = levels[0];
  for (const level of levels) {
    if (xp >= level.minXP) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
};
