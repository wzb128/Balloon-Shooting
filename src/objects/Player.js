import Phaser from 'phaser';
import {
  PLAYER_X, PLAYER_MIN_Y, PLAYER_MAX_Y, PLAYER_MOVE_SPEED, PLAYER_BOB_AMPLITUDE, PLAYER_BOB_SPEED,
} from '../config.js';

export default class Player {
  constructor(scene) {
    this.scene = scene;
    this.baseY = (PLAYER_MIN_Y + PLAYER_MAX_Y) / 2;
    this.y = this.baseY;
    this.time = 0;
    this.drawn = false;

    this.envelope = scene.add.image(PLAYER_X, 0, 'balloon-player').setOrigin(0.5, 0.93).setDepth(30);
    this.basket = scene.add.image(PLAYER_X, 0, 'basket').setOrigin(0.5, 0).setDepth(32);
    this.archer = scene.add.image(PLAYER_X - 34, 0, 'archer').setOrigin(0.21, 0.54).setDepth(31).setScale(1.15);
    this.bow = scene.add.image(PLAYER_X - 34, 0, 'bow-rest').setOrigin(0.13, 0.5).setDepth(33).setScale(1.15);
    this.layout();
  }

  layout() {
    this.bow.y = this.y;
    this.archer.y = this.y;
    this.basket.y = this.y + 8;
    this.envelope.y = this.y + 8;
  }

  setDrawing(on) {
    if (this.drawn === on) return;
    this.drawn = on;
    this.bow.setTexture(on ? 'bow-drawn' : 'bow-rest');
  }

  update(dt, dir) {
    this.time += dt;
    this.baseY = Phaser.Math.Clamp(this.baseY + dir * PLAYER_MOVE_SPEED * dt, PLAYER_MIN_Y, PLAYER_MAX_Y);
    const bob = Math.sin(this.time * PLAYER_BOB_SPEED) * PLAYER_BOB_AMPLITUDE;
    this.y += (this.baseY + bob - this.y) * Math.min(1, 8 * dt);
    this.layout();
  }

  bowTip() {
    return { x: this.bow.x - 30, y: this.y };
  }

  destroy() {
    [this.envelope, this.basket, this.archer, this.bow].forEach((o) => o && o.destroy());
  }
}
