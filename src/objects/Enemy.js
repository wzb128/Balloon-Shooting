import Phaser from 'phaser';
import Balloon from './Balloon.js';
import { ENEMIES, LAYER_BALLOON_Y, BALLOON_COLORS, balloonAttach, balloonOffsets } from '../data/enemies.js';
import { DESIGN_W, DESIGN_H, LEAK_X } from '../config.js';

const FLYING = 'flying';
const FALLING = 'falling';

export default class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, typeKey, speedScale = 1) {
    const def = ENEMIES[typeKey];
    super(scene, x, y, def.texture);
    scene.add.existing(this);
    this.setDepth(15);
    this.def = def;
    this.typeKey = typeKey;
    this.baseSpeed = def.speed * speedScale;
    this.speed = this.baseSpeed;
    this.remaining = def.balloons;
    this.state = FLYING;
    this.attachY = balloonAttach(def);
    this.baseY = y;
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.balloons = [];

    const seed = Math.floor(Math.random() * BALLOON_COLORS.length);
    balloonOffsets(def.balloons).forEach((offX, i) => {
      const color = BALLOON_COLORS[(i + seed) % BALLOON_COLORS.length];
      const b = new Balloon(scene, this, x + offX, y + this.attachY, color, def.balloonHp);
      b.offX = offX;
      b.offY = this.attachY;
      this.balloons.push(b);
    });
    this.syncBalloons(0);
  }

  get aliveBalloons() {
    return this.balloons.filter((b) => b.alive);
  }

  layerTargetY() {
    return LAYER_BALLOON_Y[Math.max(1, this.remaining)] - this.attachY;
  }

  syncBalloons(sway) {
    this.balloons.forEach((b) => {
      if (!b.active) return;
      b.x = this.x + b.offX + sway;
      b.y = this.y + b.offY;
    });
  }

  update(dt, time) {
    if (this.state === FLYING) {
      this.x += this.speed * dt;
      const target = this.layerTargetY();
      this.baseY += (target - this.baseY) * Math.min(1, 5 * dt);
      this.y = this.baseY + Math.sin(time * this.def.wobbleSpeed + this.wobblePhase) * this.def.wobbleAmp;
      this.syncBalloons(Math.sin(time * 1.6 + this.wobblePhase) * 3);      if (this.x >= LEAK_X) this.leak();
    } else if (this.state === FALLING) {
      this.vy += 1400 * dt;
      this.y += this.vy * dt;
      this.x += this.drift * dt;
      this.rotation += this.spin * dt;
      if (this.y > DESIGN_H + 90 || this.x > DESIGN_W + 120) this.remove();
    }
    return this.active;
  }

  onBalloonLost() {
    this.remaining -= 1;
    if (this.remaining > 0) {
      this.speed = this.baseSpeed * (1 + this.def.speedUpPerPop * (this.def.balloons - this.remaining));
      this.setTintFill(0xffffff);
      this.scene.time.delayedCall(80, () => {
        if (this.active) this.clearTint();
      });
      return;
    }
    this.startFalling();
  }

  startFalling() {
    if (this.state !== FLYING) return;
    this.state = FALLING;
    this.vy = 30;
    this.drift = this.baseSpeed * 0.2;
    this.spin = (Math.random() > 0.5 ? 1 : -1) * this.def.spin;
    this.balloons.forEach((b) => b.active && b.destroy());
    this.scene.onEnemyDown(this);
  }

  leak() {
    if (this.state !== FLYING) return;
    this.state = FALLING;
    this.vy = -120;
    this.drift = 260;
    this.spin = 7;
    this.leaked = true;
    this.balloons.forEach((b) => b.active && b.destroy());
    this.setTint(0xffa5a5);
    this.scene.onEnemyLeak(this);
  }

  remove() {
    if (!this.active) return;
    this.balloons.forEach((b) => b.active && b.destroy());
    this.active = false;
    this.destroy();
  }
}
