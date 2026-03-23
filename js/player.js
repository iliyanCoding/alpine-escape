import { GAME } from "./config.js";

class Player {
  constructor(image) {
    this.image = image;
    this.x = GAME.CANVAS_WIDTH / 2 - 16;
    this.y = GAME.CANVAS_HEIGHT / 9;
    this.width = GAME.TILE_SIZE;
    this.height = GAME.TILE_SIZE;
    this.speed = 0.25;
    this.xVelocity = 0;
    this.friction = 0.97;
    this.frame = 70;
    this.animTimer = 0;
    this.animSpeed = 20;
  }

  update(moveLeft, moveRight) {
    if (moveLeft) this.xVelocity -= this.speed;
    if (moveRight) this.xVelocity += this.speed;
    this.xVelocity *= this.friction;
    this.x += this.xVelocity;

    if (this.x < 0) {
      this.x = 0;
    }
    else if (this.x + this.width > GAME.CANVAS_WIDTH) {
      this.x = GAME.CANVAS_WIDTH - this.width;
    }


    if (this.y < 0) {
      this.y = 0;
    }
    else if (this.y > 2 * GAME.CANVAS_HEIGHT / 3) { //Keeps the player in the upper two thirds of the scrren
      this.y = 2 * GAME.CANVAS_HEIGHT / 3;
    }
  }

  draw(ctx) {
    this.animTimer++;
    if (this.animTimer >= this.animSpeed) {
      this.frame = this.frame === 70 ? 71 : 70;
      this.animTimer = 0;
    }

    const srcX = (this.frame % GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
    const srcY = Math.floor(this.frame / GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
    ctx.drawImage(
      this.image,
      srcX, srcY, GAME.TILE_SIZE, GAME.TILE_SIZE,
      this.x, this.y, this.width, this.height
    );
  }
}

export { Player };
