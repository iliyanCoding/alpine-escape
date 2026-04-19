import { GAME } from "./config.js";

const OBSTACLE_TILES = [30, 47]; // small tree, log
const SPAWN_CHANCE = 0.25;

class Obstacles {
  constructor(image) {
    this.image = image;
    this.obstacles = [];
    this.lastSpawnY = -1;
  }

  spawn(terrainRows, cameraY) {
    for (const row of terrainRows) {
      if (row.worldY <= this.lastSpawnY) continue;

      this.lastSpawnY = row.worldY;

      const chance = Math.min(SPAWN_CHANCE + cameraY / 50000, 0.45);
      if (Math.random() > chance) continue;

      const snowCols = [];
      for (let col = 0; col < row.tiles.length; col++) {
        if (col <= row.trackLeft || col > row.trackRight) snowCols.push(col);
      }

      if (snowCols.length > 0) {
        const col = snowCols[Math.floor(Math.random() * snowCols.length)];
        const tileIndex = OBSTACLE_TILES[Math.floor(Math.random() * OBSTACLE_TILES.length)];
        this.obstacles.push({
          x: col * GAME.TILE_SIZE,
          worldY: row.worldY,
          width: GAME.TILE_SIZE,
          height: GAME.TILE_SIZE,
          tileIndex: tileIndex
        });
      }
    }
  }

  update(cameraY) {
    while (this.obstacles.length > 0 && this.obstacles[0].worldY < cameraY - GAME.TILE_SIZE) {
      this.obstacles.shift();
    }
  }

  draw(ctx, cameraY) {
    for (const obs of this.obstacles) {
      const screenY = obs.worldY - cameraY;
      const srcX = (obs.tileIndex % GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
      const srcY = Math.floor(obs.tileIndex / GAME.TILES_PER_ROW) * GAME.TILE_SIZE;

      ctx.drawImage(
        this.image,
        srcX, srcY, GAME.TILE_SIZE, GAME.TILE_SIZE,
        obs.x, screenY, GAME.TILE_SIZE, GAME.TILE_SIZE
      );
    }
  }
}

export { Obstacles };
