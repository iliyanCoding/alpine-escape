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
let gameOver = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

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
  if (gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
      player.hitCooldown = 120; // ~2 seconds at 60fps
      player.hit(); // trigger screen shake
      console.log("Hit! HP: " + player.hp);
      if (player.hp <= 0) gameOver = true;
    }
  }

  score = hud.update(score, scrollSpeed);

  terrain.draw(ctx, cameraY);
  obstacles.draw(ctx, cameraY);
  player.draw(ctx);
  hud.draw(ctx, terrain.image, score, player.hp);

  requestAnimationFrame(gameLoop);
}

function activate(event) {
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


