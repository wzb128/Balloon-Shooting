import Phaser from 'phaser';
import Player from '../objects/Player.js';
import Arrow from '../objects/Arrow.js';
import Enemy from '../objects/Enemy.js';
import Economy from '../systems/Economy.js';
import WaveManager from '../systems/WaveManager.js';
import {
  DESIGN_W, DESIGN_H, BASE_COOLDOWN, LEAK_X,
} from '../config.js';
import { ENEMIES, LAYER_BALLOON_Y, balloonAttach } from '../data/enemies.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Game', active: false });
  }

  init() {
    this.DESIGN_W = DESIGN_W;
    this.economy = new Economy(this.registry);
    this.waves = new WaveManager(this);
    this.enemies = [];
    this.arrows = [];
    this.fireTimer = 0;
    this.hudTimer = 0;
  }

  create() {
    this.createBackground();
    this.player = new Player(this);
    this.createPools();

    const KC = Phaser.Input.Keyboard.KeyCodes;
    this.input.keyboard.addCapture('UP,DOWN,SPACE,B,H,C,K');
    this.keyUp = [this.input.keyboard.addKey(KC.UP), this.input.keyboard.addKey(KC.W)];
    this.keyDown = [this.input.keyboard.addKey(KC.DOWN), this.input.keyboard.addKey(KC.S)];
    this.keyDebug = this.input.keyboard.addKey(KC.H);
    this.input.keyboard.on('keydown-B', () => this.openShop());
    this.input.keyboard.on('keydown-SPACE', () => this.waves.skipIntermission());
    this.input.keyboard.on('keydown-C', () => this.economy.addCoins(100));
    this.input.keyboard.on('keydown-K', () => this.debugSkipWave());

    this.floatLayer = this.add.layer().setDepth(60);
    this.debugText = this.add.text(12, DESIGN_H - 26, '', {
      fontFamily: 'Verdana', fontSize: '15px', color: '#2b2b38',
    }).setDepth(61).setVisible(false);

    this.economy.sync({ wave: 1, countdown: this.waves.countdown, left: 0 });
  }

  createBackground() {
    this.add.image(DESIGN_W / 2, DESIGN_H / 2, 'sky-band').setDisplaySize(DESIGN_W, DESIGN_H).setDepth(0);

    this.farLayer = [];
    this.nearLayer = [];
    this.cloudLayer = [];

    for (let i = 0; i < 4; i += 1) {
      this.farLayer.push(this.add.image(
        Phaser.Math.Between(0, DESIGN_W), Phaser.Math.Between(180, 400), 'island-far',
      ).setAlpha(0.55).setScale(Phaser.Math.FloatBetween(0.6, 0.9)).setDepth(1));
    }
    for (let i = 0; i < 2; i += 1) {
      this.nearLayer.push(this.add.image(
        Phaser.Math.Between(0, DESIGN_W), Phaser.Math.Between(520, 660), 'island-near',
      ).setScale(Phaser.Math.FloatBetween(0.8, 1.1)).setDepth(2));
    }
    for (let i = 0; i < 9; i += 1) {
      this.cloudLayer.push(this.add.image(
        Phaser.Math.Between(0, DESIGN_W), Phaser.Math.Between(40, 620), 'cloud-puff',
      ).setAlpha(Phaser.Math.FloatBetween(0.45, 0.85))
        .setScale(Phaser.Math.FloatBetween(0.7, 1.5))
        .setDepth(i > 6 ? 40 : 3));
    }
  }

  createPools() {
    for (let i = 0; i < 40; i += 1) this.arrows.push(new Arrow(this));
    this.popParticles = this.add.particles(0, 0, 'particle-dot', {
      speed: { min: 70, max: 240 },
      lifespan: { min: 260, max: 520 },
      scale: { start: 1.6, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xe8443a, 0x4aa3e8, 0x59c26a, 0xf5d34a],
      emitting: false,
    }).setDepth(45);
  }

  freeArrow() {
    const free = this.arrows.find((a) => !a.active);
    if (free) return free;
    const oldest = this.arrows[0];
    oldest.kill();
    return oldest;
  }

  shotOptions() {
    const e = this.economy;
    const boomRadius = e.value('boom');
    const pierce = e.value('pierce');
    return {
      damage: e.value('damage'),
      speed: 850 * e.value('speed'),
      shots: e.value('multi'),
      spread: (9 * Math.PI) / 180,
      pierce,
      boomRadius,
      texture: boomRadius > 0 ? 'arrow-fire' : (pierce > 0 ? 'arrow-ice' : 'arrow'),
    };
  }

  shoot() {
    const opts = this.shotOptions();
    const origin = this.player.bowTip();
    const n = opts.shots;
    for (let i = 0; i < n; i += 1) {
      const offset = (i - (n - 1) / 2) * opts.spread;
      const arrow = this.freeArrow();
      arrow.fire(origin.x, origin.y, Math.PI + offset, opts);
    }
    this.player.setDrawing(true);
    this.time.delayedCall(110, () => this.player.setDrawing(false));
  }

  spawnEnemy(type, scale) {
    const def = ENEMIES[type];
    const y = LAYER_BALLOON_Y[def.balloons] - balloonAttach(def);
    const enemy = new Enemy(this, -70, y + Phaser.Math.Between(-14, 14), type, scale);
    this.enemies.push(enemy);
    return enemy;
  }

  update(_t, deltaMs) {
    const dt = Math.min(0.033, deltaMs / 1000);
    const time = this.time.now / 1000;
    this.scrollBackground(dt);

    const down = this.keyDown.some((k) => k.isDown) ? 1 : 0;
    const up = this.keyUp.some((k) => k.isDown) ? 1 : 0;
    this.player.update(dt, down - up);

    this.waves.update(dt);

    const cooldown = BASE_COOLDOWN * this.economy.value('rate');
    this.fireTimer += dt;
    if (this.fireTimer >= cooldown) {
      this.fireTimer = 0;
      this.shoot();
    }

    this.updateArrows(dt);
    this.updateEnemies(dt, time);
    this.syncHud(dt);

    if (this.keyDebug.isDown) {
      this.debugText.setVisible(true);
      this.debugText.setText(
        `FPS ${Math.round(this.game.loop.actualFps)} · 敌人 ${this.enemies.length} · 箭 ${this.arrows.filter((a) => a.active).length} · 波 ${this.waves.index} · ${this.waves.state}`,
      );
    }
  }

  scrollBackground(dt) {
    const move = (list, speed, h) => {
      list.forEach((o) => {
        o.x -= speed * dt;
        if (o.x < -o.width) {
          o.x = DESIGN_W + o.width;
          o.y = Phaser.Math.Between(h[0], h[1]);
        }
      });
    };
    move(this.farLayer, 12, [180, 400]);
    move(this.nearLayer, 34, [520, 660]);
    move(this.cloudLayer, 70, [40, 620]);
  }

  updateArrows(dt) {
    this.arrows.forEach((arrow) => {
      if (!arrow.update(dt)) return;
      this.checkHits(arrow);
    });
  }

  checkHits(arrow) {
    const from = arrow.lastFrom || { x: arrow.x, y: arrow.y };
    const travel = Phaser.Math.Distance.Between(from.x, from.y, arrow.x, arrow.y);
    const steps = Phaser.Math.Clamp(Math.ceil(travel / 12), 1, 6);

    for (let s = 1; s <= steps; s += 1) {
      if (!arrow.active) return;
      const t = s / steps;
      const ax = from.x + (arrow.x - from.x) * t;
      const ay = from.y + (arrow.y - from.y) * t;

      for (const enemy of this.enemies) {
        if (!enemy.active || enemy.state !== 'flying') continue;
        for (const balloon of enemy.balloons) {
          if (!balloon.alive || arrow.hitIds.has(balloon)) continue;
          const r = balloon.radius + 7;
          if (Phaser.Math.Distance.Between(ax, ay, balloon.x, balloon.y) > r) continue;
          arrow.hitIds.add(balloon);
          this.onArrowHitBalloon(arrow, balloon, enemy);
          if (!arrow.active) return;
        }
      }
    }
  }

  onArrowHitBalloon(arrow, balloon, enemy) {
    const popped = balloon.damage(arrow.damage);
    if (popped) {
      this.economy.addCoins(enemy.def.balloonCoin);
      this.economy.addScore(20);
      this.popParticles.emitParticleAt(balloon.x, balloon.y, 10);
      this.showFloatText(balloon.x, balloon.y, `+${enemy.def.balloonCoin}`, 0xf5b942);
      enemy.onBalloonLost();
    }

    if (arrow.boomRadius > 0) {
      this.explode(balloon.x, balloon.y, arrow.boomRadius, arrow.damage);
      arrow.kill();
      return;
    }
    arrow.afterHit();
  }

  explode(x, y, radius, damage) {
    const ring = this.add.image(x, y, 'explosion-ring').setDepth(44).setScale(0.2).setAlpha(0.95);
    this.tweens.add({
      targets: ring, scale: radius / 60, alpha: 0, duration: 260, onComplete: () => ring.destroy(),
    });
    const splash = Math.max(1, Math.ceil(damage / 2));
    this.enemies.forEach((enemy) => {
      if (!enemy.active || enemy.state !== 'flying') return;
      enemy.balloons.forEach((balloon) => {
        if (!balloon.alive) return;
        if (Phaser.Math.Distance.Between(x, y, balloon.x, balloon.y) > radius) return;
        if (balloon.damage(splash)) {
          this.economy.addCoins(enemy.def.balloonCoin);
          this.economy.addScore(20);
          this.popParticles.emitParticleAt(balloon.x, balloon.y, 8);
          enemy.onBalloonLost();
        }
      });
    });
  }

  updateEnemies(dt, time) {
    for (let i = this.enemies.length - 1; i >= 0; i -= 1) {
      const enemy = this.enemies[i];
      if (!enemy.active) {
        this.enemies.splice(i, 1);
        continue;
      }
      enemy.update(dt, time);
    }
  }

  onWaveStart(index) {
    this.registry.events.emit('banner', `WAVE ${index}`);
    this.economy.sync({ wave: index, countdown: 0, left: this.waves.enemiesLeft });
  }

  onEnemyDown(enemy) {
    const coins = enemy.def.killCoin;
    this.economy.addCoins(coins);
    this.economy.addScore(enemy.def.killScore);
    this.showFloatText(enemy.x, Math.min(enemy.y, DESIGN_H - 120), `+${coins}`, 0xf5b942);
    this.showFloatText(enemy.x + 40, enemy.y - 30, `+${enemy.def.killScore}`, 0xffffff);
  }

  onEnemyLeak(enemy) {
    const left = this.economy.loseLife();
    this.cameras.main.flash(240, 255, 255, 255);
    this.cameras.main.shake(160, 0.012);
    this.showFloatText(LEAK_X - 60, enemy.y, '-1 生命', 0xef4444);
    if (left <= 0) this.gameOver();
  }

  onWaveCleared(index) {
    if (index % 2 === 0) this.openShop();
  }

  openShop() {
    if (this.scene.isActive('Shop')) return;
    this.scene.pause('Game');
    this.scene.launch('Shop');
  }

  gameOver() {
    this.scene.pause('Game');
    this.scene.launch('GameOver', { wave: this.waves.index, score: this.economy.score });
  }

  showFloatText(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontFamily: 'Verdana', fontSize: '22px', fontStyle: 'bold',
      color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#2b2b38', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(58);
    this.floatLayer.add(t);
    this.tweens.add({
      targets: t, y: y - 46, alpha: 0, duration: 700, onComplete: () => t.destroy(),
    });
  }

  syncHud(dt) {
    this.hudTimer += dt;
    if (this.hudTimer < 0.2) return;
    this.hudTimer = 0;
    this.economy.sync({
      wave: this.waves.index || 1,
      countdown: this.waves.countdown,
      left: this.waves.enemiesLeft,
    });
  }

  debugSkipWave() {
    this.waves.queue = [];
    this.enemies.forEach((e) => e.state === 'flying' && e.startFalling());
  }
}
