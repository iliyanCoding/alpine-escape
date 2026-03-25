import { GAME } from './config.js';
import { Player } from './player.js';
import { Terrain } from './terrain.js';
import { Obstacles } from './obstacles.js';
import { loadAssets } from './assets.js';
import { collides } from './collision.js';
import { HUD } from './hud.js';

const canvas = document.getElementById("root");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d")
let cameraY = 0;
const terrain = new Terrain();
const player = new Player(terrain.image);
const obstacles = new Obstacles(terrain.image);

const hud = new HUD();
let score = 0;
let state = "title";
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

function restart() {
  cameraY = 0;
  score = 0;
  hud.scoreTimer = 0;
  player.reset();
  terrain.rows = [];
  terrain.nextWorldY = 0;
  terrain.trackCenter = Math.floor(terrain.tilesPerRow / 2);
  terrain.shiftDirection = 0;
  terrain.shiftCounter = 0;
  terrain.prevTrackLeft = -1;
  terrain.prevTrackRight = -1;
  terrain.curveCount = 0;
  terrain.lastCurveDir = 0;
  obstacles.obstacles = [];
  obstacles.lastSpawnY = -1;
  moveLeft = false;
  moveRight = false;
  moveUp = false;
  moveDown = false;
}

function init() {
  canvas.width = GAME.CANVAS_WIDTH;
  canvas.height = GAME.CANVAS_HEIGHT;

  window.addEventListener("keydown", activate, false);
  window.addEventListener("keyup", deactivate, false);

  loadAssets([
    { var: terrain.image, url: "assets/tilemap_packed.png" }
  ], gameLoop);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state === "title") {
    drawTitle();
  } else if (state === "playing") {
    updatePlaying();
  } else if (state === "gameover") {
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

function drawTitle() {
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "32px monospace";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("Alpine Escape", canvas.width / 2, canvas.height / 3);

  ctx.font = "16px monospace";
  ctx.fillText("Press ENTER to Start", canvas.width / 2, canvas.height / 2);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#aaa";
  ctx.fillText("Arrow keys to move", canvas.width / 2, canvas.height / 2 + 40);
  ctx.fillText("UP to slow down, DOWN to speed up", canvas.width / 2, canvas.height / 2 + 60);
  ctx.textAlign = "left";
}

function updatePlaying() {
  let scrollSpeed = GAME.SCROLL_SPEED;
  if (moveDown) scrollSpeed = GAME.SCROLL_SPEED * 3;
  else if (moveUp) scrollSpeed = GAME.SCROLL_SPEED * 0.7;
  cameraY += scrollSpeed;

  // check if player is on track or snow for different friction
  const playerCol = Math.floor((player.x + player.width / 2) / GAME.TILE_SIZE);
  if (terrain.rows.length > 0) {
    const nearestRow = terrain.rows[0];
    player.onTrack = playerCol > nearestRow.trackLeft && playerCol < nearestRow.trackRight;
  }

  player.update(moveLeft, moveRight, scrollSpeed);

  terrain.update(cameraY);
  obstacles.spawn(terrain.rows, cameraY);
  obstacles.update(cameraY);

  // check collisions (only for obstacles near the player's Y)
  for (const obs of obstacles.obstacles) {
    const screenY = obs.worldY - cameraY;
    if (screenY > player.y + player.height || screenY + obs.height < player.y) continue;
    if (player.hitCooldown <= 0 && collides(player, { x: obs.x, y: screenY, width: obs.width, height: obs.height })) {
      player.hp -= 1;
      player.hitCooldown = 120;
      player.hit();
      if (player.hp <= 0) {
        state = "gameover";
        return;
      }
    }
  }

  score = hud.update(score, scrollSpeed);

  terrain.draw(ctx, cameraY);
  obstacles.draw(ctx, cameraY);
  player.draw(ctx);
  hud.draw(ctx, terrain.image, score, player.hp);
}

function drawGameOver() {
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "32px monospace";
  ctx.fillStyle = "#ff4444";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 3);

  ctx.font = "20px monospace";
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2);

  ctx.font = "16px monospace";
  ctx.fillText("Press ENTER to Restart", canvas.width / 2, canvas.height / 2 + 50);
  ctx.textAlign = "left";
}

function activate(event) {
  if (event.key === "Enter") {
    if (state === "title") {
      restart();
      state = "playing";
    } else if (state === "gameover") {
      restart();
      state = "title";
    }
    return;
  }

  if (event.key === "ArrowLeft") moveLeft = true;
  else if (event.key === "ArrowRight") moveRight = true;
  else if (event.key === "ArrowUp") moveUp = true;
  else if (event.key === "ArrowDown") moveDown = true;
}

function deactivate(event) {
  if (event.key === "ArrowLeft") moveLeft = false;
  else if (event.key === "ArrowRight") moveRight = false;
  else if (event.key === "ArrowUp") moveUp = false;
  else if (event.key === "ArrowDown") moveDown = false;
}

init();
