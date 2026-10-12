import Phaser from 'phaser';

export default class Balloon extends Phaser.GameObjects.Image {
  constructor(scene, enemy, x, y, colorKey, hp) {
    super(scene, x, y, `balloon-${colorKey}`);
    scene.add.existing(this);
    this.setOrigin(0.5, 0.4);
    this.setDepth(20);
    this.enemy = enemy;
    this.colorKey = colorKey;
    this.hp = hp;
    this.maxHp = hp;
    this.alive = true;
    this.radius = 14;
  }

  get worldX() {
    return this.x;
  }

  get worldY() {
    return this.y;
  }

  damage(amount) {
    if (!this.alive) return false;
    this.hp -= amount;
    if (this.hp > 0) {
      this.setTintFill(0xffffff);
      this.setScale(0.8);
      this.scene.tweens.add({
        targets: this,
        scale: 0.86,
        duration: 100,
        onComplete: () => this.clearTint(),
      });
      return false;
    }
    this.pop();
    return true;
  }

  pop() {
    this.alive = false;
    const pieces = this.scene.add
      .image(this.x, this.y - this.height * 0.1, `balloon-${this.colorKey}-popped`)
      .setDepth(22);
    this.scene.tweens.add({
      targets: pieces,
      alpha: 0,
      scale: 1.9,
      duration: 280,
      onComplete: () => pieces.destroy(),
    });
    this.destroy();
  }
}
