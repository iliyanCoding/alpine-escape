import { GAME } from "./config.js";

const HEART_TILE = 119;
const DIGIT_START = 84;

class HUD {
  constructor() {
    this.scoreTimer = 0;
  }

  update(score, scrollSpeed) {
    this.scoreTimer += scrollSpeed / GAME.SCROLL_SPEED;
    if (this.scoreTimer >= 60) {
      this.scoreTimer = 0;
      return score + 1;
    }
    return score;
  }

  draw(ctx, image, score, hp) {
    // hearts top left
    for (let i = 0; i < hp; i++) {
      const srcX = (HEART_TILE % GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
      const srcY = Math.floor(HEART_TILE / GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
      ctx.drawImage(
        image,
        srcX, srcY, GAME.TILE_SIZE, GAME.TILE_SIZE,
        8 + i * 20, 8, GAME.TILE_SIZE, GAME.TILE_SIZE
      );
    }

    // score top right, one digit at a time from the tileset
    const digits = String(score);
    const startX = GAME.CANVAS_WIDTH - 8 - digits.length * GAME.TILE_SIZE;
    for (let i = 0; i < digits.length; i++) {
      const tileIndex = DIGIT_START + Number(digits[i]);
      const srcX = (tileIndex % GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
      const srcY = Math.floor(tileIndex / GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
      ctx.drawImage(
        image,
        srcX, srcY, GAME.TILE_SIZE, GAME.TILE_SIZE,
        startX + i * GAME.TILE_SIZE, 8, GAME.TILE_SIZE, GAME.TILE_SIZE
      );
    }
  }
}

export { HUD };
