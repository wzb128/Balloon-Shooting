import { OUTLINE } from '../config.js';

const C = {
  outline: OUTLINE,
  red: 0xe8443a,
  redDark: 0xb62f26,
  yellow: 0xf7c948,
  wood: 0xa9713c,
  woodDark: 0x7a4f26,
  skin: 0xf3c9a0,
  cloth: 0x3fa7d6,
  green: 0x6ec25a,
  greenDark: 0x4a9a3c,
  steel: 0x9aa8bd,
  steelDark: 0x6f7f95,
  bat: 0x8b6fd6,
  batDark: 0x6b4fb5,
  brown: 0xb07a4a,
  white: 0xffffff,
  string: 0x5b4632,
};

function tex(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ add: false });
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

function fill(g, color, alpha = 1) {
  g.fillStyle(color, alpha);
}

function line(g, width, color, alpha = 1) {
  g.lineStyle(width, color, alpha);
}

function pointsAround(cx, cy, r, a0, a1, steps) {
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = a0 + ((a1 - a0) * i) / steps;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function heart(g, x, y, size, color, outline) {
  const r = size * 0.27;
  fill(g, color);
  g.fillCircle(x - r, y + r * 0.4, r);
  g.fillCircle(x + r, y + r * 0.4, r);
  g.fillTriangle(x - r * 2, y + r * 0.6, x + r * 2, y + r * 0.6, x, y + size * 0.95);
  if (outline) {
    line(g, 3, C.outline);
    g.strokeCircle(x - r, y + r * 0.4, r);
    g.strokeCircle(x + r, y + r * 0.4, r);
    g.strokeTriangle(x - r * 2, y + r * 0.6, x + r * 2, y + r * 0.6, x, y + size * 0.95);
  }
}

function createPlayerTextures(scene) {
  tex(scene, 'balloon-player', 160, 200, (g) => {
    fill(g, C.red);
    g.fillEllipse(80, 74, 150, 148);
    fill(g, C.yellow);
    [-54, -18, 18, 54].forEach((dx) => g.fillEllipse(80 + dx, 74, 26, 142));
    fill(g, C.white, 0.32);
    g.fillEllipse(50, 46, 28, 44);
    fill(g, C.redDark);
    g.fillPoints([{ x: 66, y: 134 }, { x: 94, y: 134 }, { x: 90, y: 156 }, { x: 70, y: 156 }], true);
    line(g, 4, C.outline);
    g.strokeEllipse(80, 74, 150, 148);
    line(g, 3, C.outline);
    g.strokePoints([{ x: 66, y: 134 }, { x: 94, y: 134 }, { x: 90, y: 156 }, { x: 70, y: 156 }], true);
    line(g, 2, C.string);
    g.lineBetween(70, 156, 62, 186);
    g.lineBetween(90, 156, 98, 186);
    g.lineBetween(80, 158, 80, 186);
    g.strokePath();
  });

  tex(scene, 'basket', 70, 46, (g) => {
    fill(g, C.wood);
    g.fillRoundedRect(4, 10, 62, 34, 8);
    fill(g, C.woodDark);
    g.fillRoundedRect(0, 0, 70, 13, 6);
    line(g, 2, C.woodDark, 0.85);
    g.lineBetween(8, 23, 62, 23);
    g.lineBetween(8, 32, 62, 32);
    g.lineBetween(24, 13, 24, 44);
    g.lineBetween(46, 13, 46, 44);
    g.strokePath();
    line(g, 3, C.outline);
    g.strokeRoundedRect(4, 10, 62, 34, 8);
    g.strokeRoundedRect(0, 0, 70, 13, 6);
  });

  tex(scene, 'archer', 48, 56, (g) => {
    fill(g, C.cloth);
    g.fillEllipse(26, 40, 26, 26);
    fill(g, C.greenDark);
    g.fillTriangle(12, 20, 38, 20, 26, 2);
    fill(g, C.skin);
    g.fillCircle(26, 18, 11);
    fill(g, C.outline);
    g.fillCircle(20, 17, 2);
    line(g, 5, C.skin);
    g.lineBetween(22, 34, 8, 28);
    g.lineBetween(26, 38, 14, 44);
    g.strokePath();
    line(g, 3, C.outline);
    g.strokeCircle(26, 18, 11);
    g.strokeEllipse(26, 40, 26, 26);
  });

  const bowFrame = (drawn) => (g) => {
    const limb = pointsAround(36, 42, 30, (130 * Math.PI) / 180, (230 * Math.PI) / 180, 22);
    line(g, 7, C.wood);
    g.strokePoints(limb, false);
    line(g, 3, C.outline);
    g.strokePoints(limb, false);
    fill(g, C.woodDark);
    g.fillCircle(6, 42, 5);
    line(g, 2, 0xf2f2f2, 0.95);
    if (drawn) {
      g.lineBetween(17, 19, 32, 42);
      g.lineBetween(32, 42, 17, 65);
      g.strokePath();
      line(g, 3, C.steel);
      g.lineBetween(32, 42, 4, 42);
      g.strokePath();
    } else {
      g.lineBetween(17, 19, 17, 65);
      g.strokePath();
    }
  };
  tex(scene, 'bow-rest', 46, 84, bowFrame(false));
  tex(scene, 'bow-drawn', 46, 84, bowFrame(true));
}

function createArrowTextures(scene) {
  const arrow = (head, fletch) => (g) => {
    fill(g, C.wood);
    g.fillRect(10, 3, 48, 2);
    fill(g, head);
    g.fillTriangle(0, 4, 13, 0, 13, 8);
    fill(g, fletch);
    g.fillTriangle(50, 4, 64, 0, 64, 4);
    g.fillTriangle(50, 4, 64, 8, 64, 4);
    line(g, 1, C.outline, 0.7);
    g.strokeRect(10, 3, 48, 2);
  };
  tex(scene, 'arrow', 64, 8, arrow(C.steel, C.red));
  tex(scene, 'arrow-ice', 64, 8, arrow(0x8fd8ff, 0x3b82c4));
  tex(scene, 'arrow-fire', 64, 8, arrow(0xffd166, 0xff6b35));

  tex(scene, 'explosion-ring', 120, 120, (g) => {
    fill(g, 0xffe066, 0.45);
    g.fillCircle(60, 60, 58);
    fill(g, 0xff9f43, 0.7);
    g.fillCircle(60, 60, 40);
    fill(g, 0xef4444, 0.9);
    g.fillCircle(60, 60, 24);
    fill(g, C.white, 0.8);
    g.fillCircle(60, 60, 10);
  });
}

function createEnemyTextures(scene) {
  tex(scene, 'enemy-bat', 44, 34, (g) => {
    fill(g, C.batDark);
    g.fillTriangle(12, 16, 0, 6, 6, 26);
    g.fillTriangle(32, 16, 44, 6, 38, 26);
    fill(g, C.bat);
    g.fillEllipse(22, 20, 24, 22);
    g.fillTriangle(9, 11, 13, 1, 18, 10);
    g.fillTriangle(35, 11, 31, 1, 26, 10);
    fill(g, C.white);
    g.fillCircle(17, 18, 3.5);
    g.fillCircle(27, 18, 3.5);
    fill(g, C.outline);
    g.fillCircle(16, 19, 1.7);
    g.fillCircle(26, 19, 1.7);
    fill(g, C.red);
    g.fillTriangle(17, 25, 27, 25, 22, 30);
    fill(g, C.white);
    g.fillTriangle(19, 25, 22, 25, 20.5, 28);
    line(g, 3, C.outline);
    g.strokeEllipse(22, 20, 24, 22);
  });

  tex(scene, 'enemy-goblin', 56, 60, (g) => {
    fill(g, C.brown);
    g.fillRoundedRect(14, 36, 28, 22, 7);
    fill(g, C.green);
    g.fillEllipse(9, 44, 12, 8);
    g.fillEllipse(47, 44, 12, 8);
    g.fillEllipse(22, 58, 10, 7);
    g.fillEllipse(34, 58, 10, 7);
    g.fillTriangle(11, 18, 1, 8, 14, 27);
    g.fillTriangle(45, 18, 55, 8, 42, 27);
    g.fillCircle(28, 22, 17);
    fill(g, C.white);
    g.fillCircle(22, 20, 4.5);
    g.fillCircle(34, 20, 4.5);
    fill(g, C.outline);
    g.fillCircle(23, 21, 2);
    g.fillCircle(35, 21, 2);
    fill(g, C.greenDark);
    g.fillTriangle(20, 28, 36, 28, 28, 35);
    fill(g, C.white);
    g.fillTriangle(23, 28, 27, 28, 25, 32);
    line(g, 3, C.outline);
    g.strokeCircle(28, 22, 17);
    g.strokeRoundedRect(14, 36, 28, 22, 7);
  });

  tex(scene, 'enemy-knight', 72, 76, (g) => {
    fill(g, 0xc0392b);
    g.fillTriangle(36, 2, 30, 16, 42, 16);
    fill(g, C.steelDark);
    g.fillEllipse(11, 50, 18, 26);
    fill(g, C.steel);
    g.fillRoundedRect(18, 34, 36, 34, 8);
    g.fillCircle(36, 24, 16);
    g.fillEllipse(15, 44, 12, 10);
    g.fillEllipse(57, 44, 12, 10);
    fill(g, C.outline, 0.95);
    g.fillRect(24, 20, 24, 6);
    fill(g, C.white, 0.35);
    g.fillEllipse(30, 16, 10, 8);
    fill(g, 0xd4af37);
    g.fillCircle(36, 44, 5);
    line(g, 3, C.outline);
    g.strokeCircle(36, 24, 16);
    g.strokeRoundedRect(18, 34, 36, 34, 8);
    g.strokeEllipse(11, 50, 18, 26);
    line(g, 2, 0xf2f2f2, 0.8);
    g.lineBetween(20, 60, 52, 60);
    g.strokePath();
  });
}

const BALLOON_HEX = { red: 0xe8443a, blue: 0x4aa3e8, green: 0x59c26a, yellow: 0xf5d34a };

function createBalloonTextures(scene) {
  Object.entries(BALLOON_HEX).forEach(([name, color]) => {
    tex(scene, `balloon-${name}`, 30, 50, (g) => {
      fill(g, color);
      g.fillCircle(15, 20, 14);
      g.fillTriangle(11, 32, 19, 32, 15, 39);
      fill(g, C.white, 0.5);
      g.fillEllipse(10, 13, 8, 11);
      line(g, 3, C.outline);
      g.strokeCircle(15, 20, 14);
      line(g, 2, C.string);
      g.lineBetween(15, 39, 15, 50);
      g.strokePath();
    });

    tex(scene, `balloon-${name}-popped`, 34, 14, (g) => {
      fill(g, color);
      g.fillTriangle(2, 8, 9, 1, 11, 9);
      g.fillTriangle(13, 2, 20, 6, 15, 11);
      g.fillTriangle(22, 9, 28, 1, 31, 8);
      line(g, 2, C.outline, 0.8);
      g.strokePoints([{ x: 2, y: 8 }, { x: 9, y: 1 }, { x: 11, y: 9 }], true);
    });
  });
}

function createBackgroundTextures(scene) {
  tex(scene, 'sky-band', 4, 720, (g) => {
    const top = [0xa8, 0xdd, 0xff];
    const bottom = [0x63, 0xae, 0xe4];
    const bands = 24;
    for (let i = 0; i < bands; i += 1) {
      const t = i / (bands - 1);
      const rgb = top.map((v, k) => Math.round(v + (bottom[k] - v) * t));
      fill(g, (rgb[0] << 16) | (rgb[1] << 8) | rgb[2]);
      g.fillRect(0, (720 / bands) * i, 4, 720 / bands + 1);
    }
  });

  tex(scene, 'cloud-puff', 160, 70, (g) => {
    fill(g, 0xdfeefc);
    g.fillRoundedRect(20, 46, 120, 20, 10);
    fill(g, C.white, 0.96);
    [[45, 42, 26], [80, 32, 32], [115, 44, 24], [62, 50, 22], [100, 52, 20]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
  });

  tex(scene, 'island-far', 240, 110, (g) => {
    fill(g, 0x9a6a3f);
    g.fillTriangle(34, 50, 206, 50, 120, 106);
    fill(g, 0x74c476);
    g.fillRoundedRect(22, 30, 196, 26, 13);
    fill(g, C.woodDark);
    g.fillRect(150, 8, 7, 24);
    fill(g, 0x4f9e52);
    g.fillCircle(153, 8, 15);
    line(g, 3, C.outline, 0.55);
    g.strokeRoundedRect(22, 30, 196, 26, 13);
  });

  tex(scene, 'island-near', 320, 150, (g) => {
    fill(g, 0x8a5a34);
    g.fillTriangle(44, 72, 276, 72, 160, 146);
    fill(g, 0x6f4626);
    g.fillTriangle(120, 92, 180, 92, 156, 132);
    fill(g, 0x68bd6c);
    g.fillRoundedRect(30, 44, 260, 34, 17);
    fill(g, C.white, 0.75);
    g.fillRect(150, 78, 16, 62);
    fill(g, 0x4f9e52);
    g.fillCircle(72, 40, 20);
    g.fillCircle(96, 46, 14);
    g.fillCircle(246, 42, 18);
    line(g, 3, C.outline, 0.6);
    g.strokeRoundedRect(30, 44, 260, 34, 17);
  });
}

function createUiTextures(scene) {
  tex(scene, 'coin', 26, 26, (g) => {
    fill(g, 0xf5b942);
    g.fillCircle(13, 13, 12);
    fill(g, 0xfde68a);
    g.fillCircle(13, 13, 7);
    fill(g, 0xd89b2b);
    g.fillTriangle(13, 6, 16, 13, 13, 20);
    line(g, 3, C.outline);
    g.strokeCircle(13, 13, 12);
  });

  tex(scene, 'heart-full', 30, 28, (g) => heart(g, 15, 4, 26, C.red, true));
  tex(scene, 'heart-empty', 30, 28, (g) => heart(g, 15, 4, 26, 0xb9c0c9, true));

  tex(scene, 'ui-pill', 80, 32, (g) => {
    fill(g, C.white, 0.92);
    g.fillRoundedRect(1, 1, 78, 30, 15);
    line(g, 3, C.outline);
    g.strokeRoundedRect(1, 1, 78, 30, 15);
  });

  tex(scene, 'hp-bar-bg', 200, 16, (g) => {
    fill(g, 0x2f3b4c, 0.9);
    g.fillRoundedRect(0, 0, 200, 16, 8);
    line(g, 3, C.outline);
    g.strokeRoundedRect(0, 0, 200, 16, 8);
  });

  tex(scene, 'hp-bar-fill', 190, 10, (g) => {
    fill(g, 0xef4444);
    g.fillRoundedRect(0, 0, 190, 10, 5);
    fill(g, 0xffa5a5, 0.85);
    g.fillRoundedRect(4, 1, 182, 4, 2);
  });

  tex(scene, 'particle-dot', 6, 6, (g) => {
    fill(g, C.white);
    g.fillCircle(3, 3, 3);
  });
}

export function createAllTextures(scene) {
  createPlayerTextures(scene);
  createArrowTextures(scene);
  createEnemyTextures(scene);
  createBalloonTextures(scene);
  createBackgroundTextures(scene);
  createUiTextures(scene);
}

export const TEXTURE_KEYS = [
  'balloon-player', 'basket', 'archer', 'bow-rest', 'bow-drawn',
  'arrow', 'arrow-ice', 'arrow-fire', 'explosion-ring',
  'enemy-bat', 'enemy-goblin', 'enemy-knight',
  'balloon-red', 'balloon-blue', 'balloon-green', 'balloon-yellow',
  'balloon-red-popped', 'balloon-blue-popped', 'balloon-green-popped', 'balloon-yellow-popped',
  'cloud-puff', 'island-far', 'island-near',
  'coin', 'heart-full', 'heart-empty', 'ui-pill', 'hp-bar-bg', 'hp-bar-fill', 'particle-dot',
];
