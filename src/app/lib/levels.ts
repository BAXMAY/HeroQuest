
export type Level = {
  level: number;
  title: string;
  minXP: number;
};

export const levels: Level[] = [
  { level: 1, title: 'Novice Adventurer', minXP: 0 },
  { level: 2, title: 'Apprentice Hero', minXP: 100 },
  { level: 3, title: 'Brave Companion', minXP: 250 },
  { level: 4, title: 'Valiant Knight', minXP: 500 },
  { level: 5, title: 'Guardian of the Realm', minXP: 1000 },
  { level: 6, title: 'Legend of Aerthos', minXP: 2000 },
];

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
