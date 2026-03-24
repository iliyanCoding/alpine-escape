import { GAME } from "./config.js";

class Terrain {
  constructor() {
    this.image = new Image();
    this.rows = [];
    this.tilesPerRow = GAME.CANVAS_WIDTH / GAME.TILE_SIZE;
    this.trackWidth = Math.floor(this.tilesPerRow * 0.4);
    this.trackCenter = Math.floor(this.tilesPerRow / 2);

    this.shiftDirection = 0;
    this.shiftCounter = 0;
    this.nextWorldY = 0;
  }

  generateRow(worldY) {
    const row = [];

    // pick a new direction when counter runs out

    if (this.shiftCounter <= 0) {
      const rand = Math.random();
      if (rand < 0.4) this.shiftDirection = -1;
      else if (rand > 0.6) this.shiftDirection = 1;
      else this.shiftDirection = 0;
      this.shiftCounter = 5 + Math.floor(Math.random() * 4); // 5 to 8 rows

    }
    if (Math.random() < 0.5) this.trackCenter += this.shiftDirection;
    this.shiftCounter--;

    // clamp so track stays on screen
    const halfTrack = Math.floor(this.trackWidth / 2);
    const margin = 4;
    if (this.trackCenter - halfTrack < margin) this.trackCenter = halfTrack + margin;
    if (this.trackCenter + halfTrack > this.tilesPerRow - margin) this.trackCenter = this.tilesPerRow - margin - halfTrack;

    const trackLeft = this.trackCenter - halfTrack;
    const trackRight = this.trackCenter + halfTrack;
    for (let col = 0; col < this.tilesPerRow; col++) {
      if (col === trackLeft) row.push(1);
      else if (col === trackRight) row.push(4);
      else if (col > trackLeft && col < trackRight) row.push(2);
      else row.push(0);
    }

    return { worldY: worldY, tiles: row, trackLeft: trackLeft, trackRight: trackRight };
  }

  update(cameraY) {
    while (this.nextWorldY < cameraY + GAME.CANVAS_HEIGHT + GAME.TILE_SIZE) {
      this.rows.push(this.generateRow(this.nextWorldY));
      this.nextWorldY += GAME.TILE_SIZE;
    }

    while (this.rows.length > 0 && this.rows[0].worldY < cameraY - GAME.TILE_SIZE) {
      this.rows.shift();
    }
  }

  draw(ctx, cameraY) {
    for (const row of this.rows) {
      const screenY = row.worldY - cameraY;

      for (let col = 0; col < row.tiles.length; col++) {
        const tileIndex = row.tiles[col];
        const srcX = (tileIndex % GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
        const srcY = Math.floor(tileIndex / GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
        const destX = col * GAME.TILE_SIZE;

        ctx.drawImage(
          this.image,
          srcX, srcY, GAME.TILE_SIZE, GAME.TILE_SIZE,
          destX, screenY, GAME.TILE_SIZE, GAME.TILE_SIZE
        );
      }
    }
  }
}

export { Terrain };
