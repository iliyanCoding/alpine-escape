import { GAME } from "./config.js";

const SNOWMAN_TILE = 69;
const WOLF_WALK_TILES = [78, 79];
const WOLF_LEAP_TILE = 80;
const TRIGGER_RANGE = 130;
const WOLF_SPEED = 3.5;
const LEAP_DISTANCE = 120;
const WINDUP_FRAMES = 45;
const SPAWN_CHANCE = 0.08;
const MIN_SPACING = 400;

class Wolves {
  constructor(image) {
    this.image = image;
    this.snowmen = [];
    this.wolves = [];
    this.lastSpawnY = 800;
  }

  spawn(terrainRows, cameraY) {
    for (const row of terrainRows) {
      if (row.worldY <= this.lastSpawnY) continue;
      this.lastSpawnY = row.worldY;

      const chance = Math.min(SPAWN_CHANCE + cameraY / 60000, 0.15);
      if (Math.random() > chance) continue;

      // place snowman on or near the track
      const trackCols = [];
      for (let col = row.trackLeft + 1; col <= row.trackRight; col++) {
        trackCols.push(col);
      }
      if (trackCols.length === 0) continue;

      const spacing = Math.max(MIN_SPACING - cameraY / 60, 200);
      const tooClose = this.snowmen.some(
        s => Math.abs(s.worldY - row.worldY) < spacing
      );
      if (tooClose) continue;

      const col = trackCols[Math.floor(Math.random() * trackCols.length)];
      this.snowmen.push({
        x: col * GAME.TILE_SIZE,
        worldY: row.worldY,
        width: GAME.TILE_SIZE,
        height: GAME.TILE_SIZE,
        triggered: false
      });
    }
  }

  update(cameraY, playerX, playerY) {
    // clean up off-screen snowmen
    this.snowmen = this.snowmen.filter(
      s => s.worldY >= cameraY - GAME.TILE_SIZE * 2
    );

    // trigger snowmen when player gets close
    for (const snowman of this.snowmen) {
      if (snowman.triggered) continue;

      const screenY = snowman.worldY - cameraY;
      const cx = snowman.x + GAME.TILE_SIZE / 2;
      const cy = screenY + GAME.TILE_SIZE / 2;
      const dx = playerX - cx;
      const dy = playerY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < TRIGGER_RANGE) {
        snowman.triggered = true;

        // spawn wolf, it waits a bit before jumping
        this.wolves.push({
          x: snowman.x,
          worldY: snowman.worldY,
          dx: 0,
          dy: 0,
          width: GAME.TILE_SIZE,
          height: GAME.TILE_SIZE,
          frame: 0,
          windup: WINDUP_FRAMES,
          leaping: false
        });
      }
    }

    // update wolves
    for (let i = this.wolves.length - 1; i >= 0; i--) {
      const wolf = this.wolves[i];
      wolf.frame++;

      if (!wolf.leaping) {
        wolf.windup--;
        if (wolf.windup <= 0) {
          // done waiting, jump at the player now
          wolf.leaping = true;
          const cx = wolf.x + GAME.TILE_SIZE / 2;
          const playerWorldY = playerY + cameraY;
          const leadOffset = GAME.SCROLL_SPEED * 30;
          const wdx = playerX - cx;
          // done with AI: only lead the target when the player is below the wolf
          const rawDy = playerWorldY - wolf.worldY;
          const wdy = rawDy > 0 ? rawDy + leadOffset : rawDy;
          const wdist = Math.sqrt(wdx * wdx + wdy * wdy);
          wolf.dx = (wdx / wdist) * WOLF_SPEED;
          wolf.dy = (wdy / wdist) * WOLF_SPEED;
          wolf.traveled = 0;
        }
      }

      if (wolf.leaping && wolf.traveled < LEAP_DISTANCE) {
        wolf.x += wolf.dx;
        wolf.worldY += wolf.dy;
        wolf.traveled += WOLF_SPEED;
      }

      // remove wolves that scrolled off screen
      const screenY = wolf.worldY - cameraY;
      if (screenY < -GAME.TILE_SIZE * 2) {
        this.wolves.splice(i, 1);
      }
    }
  }

  draw(ctx, cameraY) {
    // snowmen (hide the ones that already popped)
    for (const snowman of this.snowmen) {
      if (snowman.triggered) continue;
      const screenY = snowman.worldY - cameraY;
      const srcX = (SNOWMAN_TILE % GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
      const srcY = Math.floor(SNOWMAN_TILE / GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
      ctx.drawImage(
        this.image,
        srcX, srcY, GAME.TILE_SIZE, GAME.TILE_SIZE,
        snowman.x, screenY, GAME.TILE_SIZE, GAME.TILE_SIZE
      );
    }

    // draw wolves
    for (const wolf of this.wolves) {
      let tile;
      const isLeaping = wolf.leaping && wolf.traveled < LEAP_DISTANCE;
      if (isLeaping) {
        tile = WOLF_LEAP_TILE;
      } else {
        // walking in place or standing after missing
        tile = WOLF_WALK_TILES[Math.floor(wolf.frame / 8) % 2];
      }
      const srcX = (tile % GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
      const srcY = Math.floor(tile / GAME.TILES_PER_ROW) * GAME.TILE_SIZE;
      const screenY = wolf.worldY - cameraY;

      if (isLeaping) {
        // Sprite rotation using canvas transformations: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
        const angle = Math.atan2(wolf.dy, wolf.dx) + Math.PI / 2;
        ctx.save();
        ctx.translate(wolf.x + GAME.TILE_SIZE / 2, screenY + GAME.TILE_SIZE / 2);
        ctx.rotate(angle);
        ctx.drawImage(
          this.image,
          srcX, srcY, GAME.TILE_SIZE, GAME.TILE_SIZE,
          -GAME.TILE_SIZE / 2, -GAME.TILE_SIZE / 2, GAME.TILE_SIZE, GAME.TILE_SIZE
        );
        ctx.restore();
      } else {
        ctx.drawImage(
          this.image,
          srcX, srcY, GAME.TILE_SIZE, GAME.TILE_SIZE,
          wolf.x, screenY, GAME.TILE_SIZE, GAME.TILE_SIZE
        );
      }
    }
  }
}

export { Wolves };
