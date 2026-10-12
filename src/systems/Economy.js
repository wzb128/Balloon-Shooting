import { UPGRADES, COST_GROWTH } from '../data/upgrades.js';
import { START_COINS, START_LIVES } from '../config.js';

export default class Economy {
  constructor(registry) {
    this.registry = registry;
    this.reset();
  }

  reset() {
    this.coins = START_COINS;
    this.score = 0;
    this.lives = START_LIVES;
    this.maxLives = START_LIVES;
    this.levels = {};
    Object.keys(UPGRADES).forEach((k) => { this.levels[k] = 0; });
    this.sync();
  }

  lv(key) {
    return this.levels[key];
  }

  value(key) {
    return UPGRADES[key].value(this.levels[key]);
  }

  cost(key) {
    const u = UPGRADES[key];
    return Math.round(u.baseCost * Math.pow(COST_GROWTH, this.levels[key]));
  }

  canBuy(key) {
    const u = UPGRADES[key];
    return this.levels[key] < u.max && this.coins >= this.cost(key);
  }

  buy(key) {
    if (!this.canBuy(key)) return false;
    this.coins -= this.cost(key);
    this.levels[key] += 1;
    this.sync();
    return true;
  }

  addCoins(n) {
    this.coins += Math.round(n);
    this.sync();
  }

  addScore(n) {
    this.score += Math.round(n);
    this.sync();
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    this.sync();
    return this.lives;
  }

  sync(extra = {}) {
    this.hud = { ...(this.hud || {}), wave: 1, countdown: 0, left: 0, ...extra };
    this.registry.events.emit('hud:sync', {
      coins: this.coins,
      score: this.score,
      lives: this.lives,
      maxLives: this.maxLives,
      ...this.hud,
    });
  }
}
