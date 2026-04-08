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

    // curve edge tracking
    this.prevTrackLeft = -1;
    this.prevTrackRight = -1;
    this.curveCount = 0;
    this.lastCurveDir = 0;
  }

  generateRow(worldY) {
    const row = [];

    // randomly decide which way the track drifts

    if (this.shiftCounter <= 0) {
      const rand = Math.random();
      if (rand < 0.4) this.shiftDirection = -1;
      else if (rand > 0.6) this.shiftDirection = 1;
      else this.shiftDirection = 0;
      this.shiftCounter = 5 + Math.floor(Math.random() * 4); // 5 to 8 rows

    }
    if (Math.random() < 0.5) this.trackCenter += this.shiftDirection;
    this.shiftCounter--;

    // dont let the track go off screen
    const halfTrack = Math.floor(this.trackWidth / 2);
    const margin = 4;
    if (this.trackCenter - halfTrack < margin) this.trackCenter = halfTrack + margin;
    if (this.trackCenter + halfTrack > this.tilesPerRow - margin) this.trackCenter = this.tilesPerRow - margin - halfTrack;

    const trackLeft = this.trackCenter - halfTrack;
    const trackRight = this.trackCenter + halfTrack;

    // use different edge tiles depending on if the track is curving
    let leftTile = 1;
    let rightTile = 4;

    if (this.prevTrackLeft >= 0) {
      const shifted = trackLeft - this.prevTrackLeft;
      const prevRow = this.rows[this.rows.length - 1];

      if (shifted < 0) {
        // curving left — start tiles go on the row before
        if (this.lastCurveDir !== -1) {
          this.curveCount = 1;
          if (prevRow) {
            prevRow.tiles[prevRow.trackLeft] = 14;
            prevRow.tiles[prevRow.trackRight] = 29;
          }
        } else {
          this.curveCount++;
        }
        this.lastCurveDir = -1;
        leftTile = 25; rightTile = 40;

      } else if (shifted > 0) {
        // curving right
        if (this.lastCurveDir !== 1) {
          this.curveCount = 1;
          if (prevRow) {
            prevRow.tiles[prevRow.trackLeft] = 24;
            prevRow.tiles[prevRow.trackRight] = 15;
          }
        } else {
          this.curveCount++;
        }
        this.lastCurveDir = 1;
        leftTile = 37; rightTile = 28;

      } else {
        // straight again — put end tiles on the last curved row
        if (this.lastCurveDir !== 0 && prevRow) {
          if (this.lastCurveDir === -1) {
            prevRow.tiles[prevRow.trackLeft] = 12;
            prevRow.tiles[prevRow.trackRight] = 51;
          } else {
            prevRow.tiles[prevRow.trackLeft] = 50;
            prevRow.tiles[prevRow.trackRight] = 17;
          }
        }
        this.curveCount = 0;
        this.lastCurveDir = 0;
      }
    }

    this.prevTrackLeft = trackLeft;
    this.prevTrackRight = trackRight;

    for (let col = 0; col < this.tilesPerRow; col++) {
      if (col === trackLeft) row.push(leftTile);
      else if (col === trackRight) row.push(rightTile);
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
      const screenY = Math.round(row.worldY - cameraY);

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
