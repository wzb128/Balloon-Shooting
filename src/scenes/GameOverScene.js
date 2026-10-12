import Phaser from 'phaser';
import { DESIGN_W, DESIGN_H } from '../config.js';

const TEXT = {
  fontFamily: 'Verdana',
  fontStyle: 'bold',
  color: '#ffffff',
  stroke: '#2b2b38',
  strokeThickness: 6,
};

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOver', active: false });
  }

  init(data) {
    this.result = data || { wave: 1, score: 0 };
  }

  create() {
    this.add.rectangle(DESIGN_W / 2, DESIGN_H / 2, DESIGN_W, DESIGN_H, 0x14202e, 0.78);
    this.add.text(DESIGN_W / 2, 220, '热气球坠落！', { ...TEXT, fontSize: '52px', color: '#ffd166' }).setOrigin(0.5);
    this.add.text(DESIGN_W / 2, 310, `坚持到第 ${this.result.wave} 波`, { ...TEXT, fontSize: '28px' }).setOrigin(0.5);
    this.add.text(DESIGN_W / 2, 356, `得分 ${this.result.score}`, { ...TEXT, fontSize: '28px' }).setOrigin(0.5);

    const btn = this.add.image(DESIGN_W / 2, 470, 'ui-pill').setScale(4, 2).setInteractive();
    this.add.text(DESIGN_W / 2, 470, '再来一局', { ...TEXT, fontSize: '26px', color: '#2b2b38', stroke: '#ffffff', strokeThickness: 3 }).setOrigin(0.5);
    btn.on('pointerover', () => btn.setTint(0xfff3c4));
    btn.on('pointerout', () => btn.clearTint());
    btn.on('pointerdown', () => this.restart());

    this.input.keyboard.on('keydown-ENTER', () => this.restart());
  }

  restart() {
    const game = this.scene.get('Game');
    this.scene.stop('Shop');
    this.scene.stop('GameOver');
    game.scene.restart();
  }
}
