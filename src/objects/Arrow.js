import Phaser from 'phaser';
import { ARROW_LIFETIME } from '../config.js';

export default class Arrow extends Phaser.GameObjects.Image {
  constructor(scene) {
    super(scene, -100, -100, 'arrow');
    scene.add.existing(this);
    this.setOrigin(0.12, 0.5);
    this.setDepth(25);
    this.visible = false;
    this.active = false;
    this.hitIds = new Set();
  }

  fire(x, y, angle, opts) {
    this.setTexture(opts.texture);
    this.setPosition(x, y);
    this.setRotation(angle - Math.PI);
    this.setVisible(true);
    this.setActive(true);
    this.active = true;
    this.damage = opts.damage;
    this.pierceLeft = opts.pierce;
    this.boomRadius = opts.boomRadius;
    this.life = ARROW_LIFETIME;
    this.vx = Math.cos(angle) * opts.speed;
    this.vy = Math.sin(angle) * opts.speed;
    this.hitIds.clear();
    return this;
  }

  update(dt) {
    if (!this.active) return true;
    const px = this.x;
    const py = this.y;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    this.lastFrom = { x: px, y: py };
    if (this.life <= 0 || this.x < -80 || this.y < -80 || this.y > 800) this.kill();
    return this.active;
  }

  afterHit() {
    if (this.pierceLeft > 0) {
      this.pierceLeft -= 1;
      return true;
    }
    this.kill();
    return false;
  }

  kill() {
    this.active = false;
    this.setVisible(false);
    this.setActive(false);
  }
}
