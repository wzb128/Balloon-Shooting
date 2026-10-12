import { waveDef, speedScale } from '../data/waves.js';

const SPAWNING = 'spawning';
const CLEARING = 'clearing';
const INTERMISSION = 'intermission';

export const INTERMISSION_TIME = 8;

export default class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.index = 0;
    this.state = INTERMISSION;
    this.timer = 3;
    this.elapsed = 0;
    this.queue = [];
  }

  get label() {
    return this.index === 0 ? 1 : this.index;
  }

  startWave(bonusEarly = false) {
    this.index += 1;
    const def = waveDef(this.index);
    this.reward = def.reward;
    this.speedScale = speedScale(this.index);
    this.queue = [];
    def.groups.forEach((g) => {
      for (let i = 0; i < g.count; i += 1) {
        const jitter = 0.8 + Math.random() * 0.4;
        this.queue.push({ t: (g.delay || 0) + i * g.every * jitter, type: g.type });
      }
    });
    this.queue.sort((a, b) => a.t - b.t);
    this.elapsed = 0;
    this.state = SPAWNING;
    if (bonusEarly) this.scene.economy.addCoins(this.pendingReward * 0.2);
    this.scene.onWaveStart(this.index);
  }

  update(dt) {
    if (this.state === SPAWNING) {
      this.elapsed += dt;
      while (this.queue.length && this.queue[0].t <= this.elapsed) {
        const item = this.queue.shift();
        this.scene.spawnEnemy(item.type, this.speedScale);
      }
      if (!this.queue.length) this.state = CLEARING;
      return;
    }

    if (this.state === CLEARING) {
      if (this.scene.enemies.length === 0) {
        this.pendingReward = this.reward;
        this.scene.economy.addCoins(this.reward);
        this.scene.economy.addScore(this.reward * 2);
        this.scene.showFloatText(this.scene.DESIGN_W / 2, 150, `波次完成 +${this.reward} 金币`, 0xf5b942);
        this.state = INTERMISSION;
        this.timer = INTERMISSION_TIME;
        this.scene.onWaveCleared(this.index);
      }
      return;
    }

    this.timer -= dt;
    if (this.timer <= 0) this.startWave();
  }

  skipIntermission() {
    if (this.state !== INTERMISSION || this.timer >= INTERMISSION_TIME) return;
    this.startWave(true);
  }

  get enemiesLeft() {
    if (this.state === SPAWNING) return this.queue.length + this.scene.enemies.length;
    return this.scene.enemies.length;
  }

  get countdown() {
    return this.state === INTERMISSION ? Math.ceil(this.timer) : 0;
  }
}
