import { GAME } from "./config.js";

const CART_TILES = [
  [42, 43, 44],
  [54, 55, 56],
  [66, 67, 68]
];
const WIRE_TILE = 46;
const SNOWBALL_TILE = 95;
const FIRE_RANGE = 350;
const FIRE_COOLDOWN = 60;
const SNOWBALL_SPEED = 4;
const SPAWN_CHANCE = 0.05;
const MIN_SPACING = 600;

class Turrets {
  constructor(image) {
    this.image = image;
    this.turrets = [];
    this.snowballs = [];
    this.lastSpawnY = 1500; // no turrets in the first stretch
  }

  spawn(terrainRows, cameraY) {
    for (const row of terrainRows) {
      if (row.worldY <= this.lastSpawnY) continue;
      this.lastSpawnY = row.worldY;

      if (Math.random() > SPAWN_CHANCE) continue;

      // place cart on a random snow column (avoid edges)
      const snowCols = [];
      for (let col = 2; col < row.tiles.length - 4; col++) {
        if (col <= row.trackLeft || col > row.trackRight) snowCols.push(col);
      }
      if (snowCols.length === 0) continue;

      // check spacing from existing turrets
      const tooClose = this.turrets.some(
        t => Math.abs(t.worldY - row.worldY) < MIN_SPACING
      );
      if (tooClose) continue;

      const col = snowCols[Math.floor(Math.random() * snowCols.length)];
      this.turrets.push({
        x: col * GAME.TILE_SIZE,
        worldY: row.worldY,
        cooldown: 0
      });
    }
  }

  update(cameraY, playerX, playerY) {
    // remove turrets that scrolled past the top
    while (this.turrets.length > 0 && this.turrets[0].worldY < cameraY - GAME.TILE_SIZE * 3) {
      this.turrets.shift();
    }

    // fire snowballs at player if in range
    for (const turret of this.turrets) {
      if (turret.cooldown > 0) {
        turret.cooldown--;
        continue;
      }

      const screenY = turret.worldY - cameraY + GAME.TILE_SIZE;
      const turretCenterX = turret.x + GAME.TILE_SIZE * 1.5;
      const dx = playerX - turretCenterX;
      const dy = playerY - screenY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < FIRE_RANGE) {
        const nx = dx / dist;
        const ny = dy / dist;
        this.snowballs.push({
          x: turretCenterX,
          y: screenY,
          dx: nx * SNOWBALL_SPEED,
          dy: ny * SNOWBALL_SPEED,
          width: GAME.TILE_SIZE,
          height: GAME.TILE_SIZE
        });
        turret.cooldown = FIRE_COOLDOWN;
      }
    }

    // update snowballs and remove off-screen ones
    for (let i = this.snowballs.length - 1; i >= 0; i--) {
      this.snowballs[i].x += this.snowballs[i].dx;
      this.snowballs[i].y += this.snowballs[i].dy;

      const s = this.snowballs[i];
      if (s.x < -GAME.TILE_SIZE || s.x > GAME.CANVAS_WIDTH + GAME.TILE_SIZE ||
          s.y < -GAME.TILE_SIZE || s.y > GAME.CANVAS_HEIGHT + GAME.TILE_SIZE) {
        this.snowballs.splice(i, 1);
      }
    }
  }

  draw(ctx, cameraY) {
    const tilesPerRow = GAME.CANVAS_WIDTH / GAME.TILE_SIZE;

    for (const turret of this.turrets) {
      const screenY = turret.worldY - cameraY;
      const cartCol = Math.floor(turret.x / GAME.TILE_SIZE);

      // draw wire across the top row of the cart
      const wireSrcX = (WIRE_TILE % GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
      const wireSrcY = Math.floor(WIRE_TILE / GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
      for (let col = 0; col < tilesPerRow; col++) {
        if (col >= cartCol && col < cartCol + 3) continue;
        ctx.drawImage(
          this.image,
          wireSrcX, wireSrcY, GAME.TILE_SIZE, GAME.TILE_SIZE,
          col * GAME.TILE_SIZE, screenY, GAME.TILE_SIZE, GAME.TILE_SIZE
        );
      }

      // draw 3x3 cart
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const tileIndex = CART_TILES[r][c];
          const srcX = (tileIndex % GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
          const srcY = Math.floor(tileIndex / GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
          ctx.drawImage(
            this.image,
            srcX, srcY, GAME.TILE_SIZE, GAME.TILE_SIZE,
            turret.x + c * GAME.TILE_SIZE, screenY + r * GAME.TILE_SIZE, GAME.TILE_SIZE, GAME.TILE_SIZE
          );
        }
      }
    }

    // draw snowballs
    const sbSrcX = (SNOWBALL_TILE % GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
    const sbSrcY = Math.floor(SNOWBALL_TILE / GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
    for (const s of this.snowballs) {
      ctx.drawImage(
        this.image,
        sbSrcX, sbSrcY, GAME.TILE_SIZE, GAME.TILE_SIZE,
        s.x, s.y, GAME.TILE_SIZE, GAME.TILE_SIZE
      );
    }
  }
}

export { Turrets };
