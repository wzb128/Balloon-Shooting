import Phaser from 'phaser';
import { DESIGN_W, DESIGN_H } from '../config.js';

const TEXT = {
  fontFamily: 'Verdana',
  fontStyle: 'bold',
  color: '#2b2b38',
  stroke: '#ffffff',
  strokeThickness: 4,
};

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UI', active: false });
  }

  create() {
    const bar = this.add.graphics();
    bar.fillStyle(0xffffff, 0.55);
    bar.fillRoundedRect(10, 8, DESIGN_W - 20, 48, 22);
    bar.lineStyle(3, 0x2b2b38, 0.5);
    bar.strokeRoundedRect(10, 8, DESIGN_W - 20, 48, 22);

    this.hearts = [];
    for (let i = 0; i < 5; i += 1) {
      this.hearts.push(this.add.image(34 + i * 34, 32, 'heart-full'));
    }

    this.add.image(250, 32, 'hp-bar-bg');
    this.hpFill = this.add.image(155, 32, 'hp-bar-fill').setOrigin(0, 0.5).setDisplaySize(190, 10);
    this.add.text(250, 46, 'HP', { ...TEXT, fontSize: '12px', color: '#ffffff', stroke: '#2b2b38', strokeThickness: 3 })
      .setOrigin(0.5, 0);

    this.add.image(420, 32, 'ui-pill').setScale(1.5, 1);
    this.waveText = this.add.text(420, 32, 'WAVE 1', { ...TEXT, fontSize: '20px' }).setOrigin(0.5);

    this.add.image(530, 32, 'coin');
    this.coinText = this.add.text(550, 32, '30', { ...TEXT, fontSize: '20px' }).setOrigin(0, 0.5);

    this.add.image(680, 32, 'ui-pill').setScale(2.4, 1);
    this.scoreText = this.add.text(680, 32, 'SCORE 0', { ...TEXT, fontSize: '18px' }).setOrigin(0.5);

    this.countdown = this.add.text(DESIGN_W / 2, 100, '', {
      ...TEXT, fontSize: '26px', color: '#fff6d8', stroke: '#2b2b38', strokeThickness: 6,
    }).setOrigin(0.5);

    this.bannerText = this.add.text(DESIGN_W / 2, DESIGN_H / 2 - 80, '', {
      ...TEXT, fontSize: '46px', color: '#ffffff', stroke: '#2b2b38', strokeThickness: 8,
    }).setOrigin(0.5).setAlpha(0);

    this.add.text(14, DESIGN_H - 24, '↑ / ↓ 或 W / S 上下移动热气球 · 弓箭手自动向左射击 · B 打开商店 · 空格提前开波', {
      fontFamily: 'Verdana', fontSize: '15px', color: '#ffffff', stroke: '#2b2b38', strokeThickness: 3,
    }).setAlpha(0.9);

    this.registry.events.on('hud:sync', this.onSync, this);
    this.registry.events.on('banner', this.showBanner, this);
    this.events.once('shutdown', () => {
      this.registry.events.off('hud:sync', this.onSync, this);
      this.registry.events.off('banner', this.showBanner, this);
    });
  }

  onSync(data) {
    this.hearts.forEach((h, i) => h.setTexture(i < data.lives ? 'heart-full' : 'heart-empty'));
    this.hpFill.setDisplaySize(190 * (data.lives / (data.maxLives || 5)), 10);
    this.waveText.setText(`WAVE ${data.wave}`);
    this.coinText.setText(`${data.coins}`);
    this.scoreText.setText(`SCORE ${data.score}`);
    this.countdown.setText(data.countdown > 0 ? `下一波 ${data.countdown}s · 敌人 ${data.left}` : '');
  }

  showBanner(text) {
    this.tweens.killTweensOf(this.bannerText);
    this.bannerText.setText(text).setAlpha(0);
    this.tweens.add({
      targets: this.bannerText,
      alpha: { start: 1, end: 0 },
      duration: 1500,
    });
  }
}
