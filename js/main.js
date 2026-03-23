import { GAME } from './config.js';
import { Player } from './player.js';
import { Terrain } from './terrain.js';
import { Obstacles } from './obstacles.js';
import { loadAssets } from './assets.js';

const canvas = document.getElementById("root");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d")
let cameraY = 0;
const player = new Player();
const terrain = new Terrain();
const obstacles = new Obstacles(terrain.image);

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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.update(moveLeft, moveRight);

  let scrollSpeed = GAME.SCROLL_SPEED;
  if (moveDown) scrollSpeed = GAME.SCROLL_SPEED * 3;
  else if (moveUp) scrollSpeed = GAME.SCROLL_SPEED * 0.7;
  cameraY += scrollSpeed;

  terrain.update(cameraY);
  obstacles.spawn(terrain.rows, cameraY);
  obstacles.update(cameraY);
  terrain.draw(ctx, cameraY);
  obstacles.draw(ctx, cameraY);
  player.draw(ctx);

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


