import Phaser from 'phaser';
import { DESIGN_W, DESIGN_H } from './config.js';
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import ShopScene from './scenes/ShopScene.js';
import GameOverScene from './scenes/GameOverScene.js';

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: DESIGN_W,
  height: DESIGN_H,
  backgroundColor: '#8ed3f0',
  pixelArt: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
  scene: [BootScene, GameScene, UIScene, ShopScene, GameOverScene],
});
