import { GAME } from "./config.js";

class Player {
  constructor() {
    this.x = GAME.CANVAS_WIDTH / 2 - 16;
    this.y = GAME.CANVAS_HEIGHT / 9;
    this.width = 32;
    this.height = 32;
    this.speed = 4;
  }

  update(moveLeft, moveRight) {
    if (moveLeft) this.x -= this.speed;
    if (moveRight) this.x += this.speed;

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
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

export { Player };
