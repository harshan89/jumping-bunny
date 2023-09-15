import Phaser from 'phaser';

import background from '../assets/bg_layer1.png';
import platform from '../assets/ground_grass.png';
import bunny from '../assets/bunny1_stand.png';
import carrot from '../assets/carrot.png';
import Carrot from '../src/carrot';

export default class HelloWorldScene extends Phaser.Scene {
  player;
  platforms;
  cursors;
  carrots;
  carrotsCollected = 0;
  carrotsCollectedText;

  constructor() {
    super({ key: 'main-scene', active: true });
  }

  addCarrotAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;
    const carrot = this.carrots.get(sprite.x, y, 'carrot');

    // set active and visible
    carrot.setActive(true);
    carrot.setVisible(true);

    this.add.existing(carrot);

    carrot.body.setSize(carrot.width, carrot.height);

    // make sure body is enabed in the physics world
    this.physics.world.enable(carrot);

    return carrot;
  }

  handleCollectCarrot(player, carrot) {
    // hide from display
    this.carrots.killAndHide(carrot);
    // disable from physics world
    this.physics.world.disableBody(carrot.body);
    this.carrotsCollected++;

    const value = 'Carrots: ' + this.carrotsCollected;
    this.carrotsCollectedText.text = value;
  }

  preload() {
    this.load.image('background', background);
    this.load.image('platform', platform);
    this.load.image('bunny-stand', bunny);
    this.load.image('carrot', carrot);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    const style = { color: '#000', fontSize: 24 };
    this.carrotsCollectedText = this.add.text(240, 10, 'Carrots: 0', style).setScrollFactor(1);
    this.add.text(240, 10, 'Carrots: 0', style).setScrollFactor(0).setOrigin(0.5, 0);

    this.add.image(240, 320, 'background').setScrollFactor(1, 0);
    this.platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 5; ++i) {
      const x = Phaser.Math.Between(80, 400);
      const y = 150 * i;
      const platform = this.platforms.create(x, y, 'platform');
      platform.scale = 0.1;
      const body = platform.body;
      body.updateFromGameObject();
    }

    this.physics.add.sprite(240, 320, 'bunny-stand').setScale(0.5);

    this.player = this.physics.add.sprite(240, 320, 'bunny-stand').setScale(0.1);
    this.physics.add.collider(this.platforms, this.player);

    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setDeadzone(this.scale.width * 1.5);

    this.carrots = this.physics.add.group({
      classType: Carrot
    });

    this.physics.add.collider(this.platforms, this.carrots);

    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollectCarrot, // called on overlap
      undefined,
      this
    );
  }

  update(t, dt) {
    this.horizontalWrap(this.player);

    const touchingDown = this.player.body.touching.down;

    if (touchingDown) {
      this.player.setVelocityY(-300);
    }
    // left and right input logic
    if (this.cursors.left.isDown && !touchingDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown && !touchingDown) {
      this.player.setVelocityX(200);
    } else {
      // stop movement if not left or right
      this.player.setVelocityX(0);
    }

    this.platforms.children.iterate(child => {
      const platform = child;

      const scrollY = this.cameras.main.scrollY;
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();

        this.addCarrotAbove(platform);
      }
    });
  }

  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  }
}
