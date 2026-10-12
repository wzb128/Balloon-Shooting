export const WAVES = [
  { groups: [{ type: 'bat', count: 6, every: 1.4 }], reward: 20 },
  { groups: [{ type: 'bat', count: 8, every: 1.1 }, { type: 'goblin', count: 2, every: 3, delay: 6 }], reward: 25 },
  { groups: [{ type: 'bat', count: 10, every: 1 }, { type: 'goblin', count: 4, every: 2.6, delay: 4 }], reward: 30 },
  { groups: [{ type: 'goblin', count: 6, every: 2.2 }], reward: 35 },
  { groups: [{ type: 'bat', count: 8, every: 1 }, { type: 'goblin', count: 6, every: 2, delay: 3 }, { type: 'knight', count: 1, every: 1, delay: 12 }], reward: 45 },
  { groups: [{ type: 'bat', count: 12, every: 0.85 }, { type: 'goblin', count: 4, every: 2.4, delay: 5 }], reward: 45 },
  { groups: [{ type: 'goblin', count: 8, every: 1.8 }, { type: 'knight', count: 2, every: 6, delay: 8 }], reward: 55 },
  { groups: [{ type: 'bat', count: 14, every: 0.8 }, { type: 'goblin', count: 6, every: 2, delay: 4 }, { type: 'knight', count: 2, every: 6, delay: 10 }], reward: 60 },
  { groups: [{ type: 'goblin', count: 10, every: 1.6 }, { type: 'knight', count: 4, every: 4.5, delay: 6 }], reward: 70 },
  { groups: [{ type: 'bat', count: 20, every: 0.7 }, { type: 'goblin', count: 8, every: 1.6, delay: 3 }, { type: 'knight', count: 4, every: 4, delay: 12 }], reward: 100 },
];

const CAPS = { bat: 30, goblin: 18, knight: 12 };

export function waveDef(n) {
  if (n <= WAVES.length) return WAVES[n - 1];
  const k = n - WAVES.length;
  const everyScale = Math.max(0.6, Math.pow(0.97, n));
  return {
    groups: [
      { type: 'bat', count: Math.min(CAPS.bat, 10 + 2 * k), every: 0.7 * everyScale },
      { type: 'goblin', count: Math.min(CAPS.goblin, 4 + 2 * k), every: 1.6 * everyScale, delay: 3 },
      { type: 'knight', count: Math.min(CAPS.knight, 2 + Math.floor(k / 2)), every: 4 * everyScale, delay: 10 },
    ],
    reward: 50 + 5 * n,
  };
}

export function speedScale(n) {
  return Math.min(1.5, 1 + (n - 1) * 0.03);
}
