const DEFS = {
  bat: {
    key: 'bat',
    name: '小兵',
    texture: 'enemy-bat',
    bodyH: 34,
    balloons: 1,
    balloonHp: 1,
    speed: 130,
    speedUpPerPop: 0,
    wobbleAmp: 14,
    wobbleSpeed: 2.4,
    balloonCoin: 2,
    killCoin: 5,
    killScore: 50,
    spin: 4,
  },
  goblin: {
    key: 'goblin',
    name: '哥布林',
    texture: 'enemy-goblin',
    bodyH: 60,
    balloons: 2,
    balloonHp: 1,
    speed: 85,
    speedUpPerPop: 0.12,
    wobbleAmp: 10,
    wobbleSpeed: 1.6,
    balloonCoin: 3,
    killCoin: 12,
    killScore: 120,
    spin: 3,
  },
  knight: {
    key: 'knight',
    name: '铁骑士',
    texture: 'enemy-knight',
    bodyH: 76,
    balloons: 3,
    balloonHp: 2,
    speed: 55,
    speedUpPerPop: 0.18,
    wobbleAmp: 8,
    wobbleSpeed: 1.1,
    balloonCoin: 4,
    killCoin: 30,
    killScore: 300,
    spin: 2,
  },
};

export const ENEMIES = DEFS;
export const ENEMY_KEYS = Object.keys(DEFS);

export const BALLOON_COLORS = ['red', 'blue', 'green', 'yellow'];

export const LAYER_BALLOON_Y = { 1: 430, 2: 320, 3: 230 };

export function balloonAttach(def) {
  return -(def.bodyH / 2 + 38);
}

export function balloonOffsets(count) {
  const out = [];
  for (let i = 0; i < count; i += 1) out.push((i - (count - 1) / 2) * 34);
  return out;
}
