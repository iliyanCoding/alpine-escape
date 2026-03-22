import { GAME } from './config.js';
import { Player } from './player.js';

const canvas = document.getElementById("root");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d")
let cameraY = 0;
const player = new Player();

let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

function init() {
  canvas.width = GAME.CANVAS_WIDTH;
  canvas.height = GAME.CANVAS_HEIGHT;

  window.addEventListener("keydown", activate, false);
  window.addEventListener("keyup", deactivate, false);

  gameLoop();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.update(moveLeft, moveRight, moveUp, moveDown);
  cameraY += GAME.SCROLL_SPEED;

  ctx.fillStyle = "#87cefa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw(ctx);

  // temp: test rectangles to verify scrolling
  ctx.fillStyle = "green";
  ctx.fillRect(200, 300 - cameraY, 32, 32);
  ctx.fillRect(100, 600 - cameraY, 32, 32);

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


