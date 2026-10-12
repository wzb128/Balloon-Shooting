import Phaser from 'phaser';
import { UPGRADES, UPGRADE_KEYS } from '../data/upgrades.js';
import { DESIGN_W, DESIGN_H } from '../config.js';

const TEXT = {
  fontFamily: 'Verdana',
  fontStyle: 'bold',
  color: '#2b2b38',
  stroke: '#ffffff',
  strokeThickness: 3,
};

export default class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Shop', active: false });
  }

  create() {
    this.gameScene = this.scene.get('Game');
    this.economy = this.gameScene.economy;

    this.add.rectangle(DESIGN_W / 2, DESIGN_H / 2, DESIGN_W, DESIGN_H, 0x1b2a3d, 0.72);
    this.add.image(DESIGN_W / 2, 92, 'ui-pill').setScale(6, 2.2);
    this.add.text(DESIGN_W / 2, 92, '弓箭升级商店', { ...TEXT, fontSize: '30px', color: '#fff6d8' }).setOrigin(0.5);
    this.coinIcon = this.add.image(DESIGN_W / 2 + 250, 160, 'coin');
    this.coinLabel = this.add.text(DESIGN_W / 2 + 270, 160, '', { ...TEXT, fontSize: '24px' }).setOrigin(0, 0.5);

    this.cards = UPGRADE_KEYS.map((key, i) => this.buildCard(key, i));
    this.buildCloseButton();
    this.refresh();

    this.input.mouse.disableContextMenu();
  }

  buildCard(key, index) {
    const up = UPGRADES[key];
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = DESIGN_W / 2 + (col - 1) * 300;
    const y = 250 + row * 200;

    const bg = this.add.image(x, y, 'ui-pill').setScale(3.6, 5.4).setInteractive();
    this.add.image(x - 120, y - 62, up.icon).setScale(1.4);
    const name = this.add.text(x - 80, y - 70, up.name, { ...TEXT, fontSize: '24px' }).setOrigin(0, 0.5);
    this.add.text(x - 80, y - 42, up.desc, {
      fontFamily: 'Verdana', fontSize: '13px', color: '#4b5b6e', strokeThickness: 0,
    }).setOrigin(0, 0.5);
    const level = this.add.text(x - 120, y + 6, '', { ...TEXT, fontSize: '16px' });
    const effect = this.add.text(x - 120, y + 34, '', { fontFamily: 'Verdana', fontSize: '15px', color: '#1f6b3e', strokeThickness: 0 });
    const cost = this.add.text(x + 120, y + 60, '', { ...TEXT, fontSize: '18px' }).setOrigin(1, 0.5);

    bg.on('pointerdown', () => {
      if (this.economy.buy(key)) this.refresh();
    });
    bg.on('pointerover', () => bg.setTint(0xfff3c4));
    bg.on('pointerout', () => bg.clearTint());

    return { up, bg, name, level, effect, cost, key };
  }

  buildCloseButton() {
    const btn = this.add.image(DESIGN_W / 2, DESIGN_H - 60, 'ui-pill')
      .setScale(3.2, 1.6)
      .setInteractive();
    this.add.text(DESIGN_W / 2, DESIGN_H - 60, '继续战斗（B）', { ...TEXT, fontSize: '20px' }).setOrigin(0.5);
    btn.on('pointerdown', () => this.close());
    btn.on('pointerover', () => btn.setTint(0xfff3c4));
    btn.on('pointerout', () => btn.clearTint());
    this.input.keyboard.on('keydown-B', () => this.close());
  }

  refresh() {
    this.coinLabel.setText(`${this.economy.coins}`);
    this.cards.forEach((card) => {
      const lv = this.economy.lv(card.key);
      const maxed = lv >= card.up.max;
      const cost = this.economy.cost(card.key);
      card.level.setText(`Lv ${lv}/${card.up.max}`);
      card.effect.setText(card.up.show(lv));
      card.cost.setText(maxed ? '已满级' : `${cost} 金币`);
      card.cost.setColor(maxed || this.economy.coins < cost ? '#9aa3ad' : '#1f6b3e');
      card.bg.setAlpha(maxed ? 0.55 : 1);
    });
  }

  close() {
    this.scene.stop('Shop');
    this.scene.resume('Game');
  }
}
