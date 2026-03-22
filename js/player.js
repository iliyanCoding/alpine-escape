import { GAME } from "./config.js";

class Player {
  constructor() {
    this.x = GAME.CANVAS_WIDTH / 2;
    this.y = GAME.CANVAS_HEIGHT / 2;
    this.width = 32;
    this.height = 32;
    this.speed = 4;
  }

  update(moveLeft, moveRight, moveUp, moveDown) {
    if (moveLeft) this.x -= this.speed;
    if (moveRight) this.x += this.speed;
    if (moveUp) this.y -= this.speed;
    if (moveDown) this.y += this.speed;

    if (this.x < 0) {
      this.x = 0;
    }
    else if (this.x + this.width > GAME.CANVAS_WIDTH) {
      this.x = GAME.CANVAS_WIDTH - this.width;
    }


    if (this.y < 0) {
      this.y = 0;
    }
    else if (this.y + this.height > GAME.CANVAS_HEIGHT) {
      this.y = GAME.CANVAS_HEIGHT - this.height;
    }
  }

  draw(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

export { Player };
