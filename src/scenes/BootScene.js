import Phaser from 'phaser';
import { createAllTextures } from '../systems/textures.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    createAllTextures(this);
    this.scene.start('Game');
    this.scene.launch('UI');
  }
}
