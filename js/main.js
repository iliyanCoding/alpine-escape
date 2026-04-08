// ES6 Modules: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
import { GAME } from './config.js';
import { Player } from './player.js';
import { Terrain } from './terrain.js';
import { Obstacles } from './obstacles.js';
import { loadAssets } from './assets.js';
import { collides } from './collision.js';
import { HUD } from './hud.js';
import { Turrets } from './enemies.js';
import { Wolves } from './wolves.js';

const canvas = document.getElementById("root");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d")
let cameraY = 0;
const terrain = new Terrain();
const player = new Player(terrain.image);
const obstacles = new Obstacles(terrain.image);
const turrets = new Turrets(terrain.image);
const wolves = new Wolves(terrain.image);

const hud = new HUD();
let score = 0;
let state = "title";
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let overlayActive = false;

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
  turrets.turrets = [];
  turrets.snowballs = [];
  turrets.lastSpawnY = 500;
  wolves.snowmen = [];
  wolves.wolves = [];
  wolves.lastSpawnY = 800;
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

  document.getElementById("score-form").addEventListener("submit", function (e) {
    e.preventDefault();
    let username = document.getElementById("username-input").value.trim();
    if (!username) return;
    saveScore(username);
  });

  document.getElementById("skip-btn").addEventListener("click", function () {
    hideOverlay();
    restart();
    state = "title";
  });

  fetchLeaderboard();
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
  // game gets faster the further you go, caps at 2x
  const difficulty = Math.min(1 + cameraY / 20000, 2);
  let baseSpeed = GAME.SCROLL_SPEED * difficulty;
  let scrollSpeed = baseSpeed;
  if (moveDown) scrollSpeed = baseSpeed * 3;
  else if (moveUp) scrollSpeed = baseSpeed * 0.7;
  cameraY += scrollSpeed;

  // figure out if player is on track or snow
  const playerCol = Math.floor((player.x + player.width / 2) / GAME.TILE_SIZE);
  if (terrain.rows.length > 0) {
    const nearestRow = terrain.rows[0];
    player.onTrack = playerCol > nearestRow.trackLeft && playerCol < nearestRow.trackRight;
  }

  player.update(moveLeft, moveRight, scrollSpeed);

  terrain.update(cameraY);
  obstacles.spawn(terrain.rows, cameraY);
  obstacles.update(cameraY);
  turrets.spawn(terrain.rows, cameraY);
  turrets.update(cameraY, player.x + player.width / 2, player.y + player.height / 2);
  wolves.spawn(terrain.rows, cameraY);
  wolves.update(cameraY, player.x + player.width / 2, player.y + player.height / 2);

  // collisions — obstacles
  for (const obs of obstacles.obstacles) {
    const screenY = obs.worldY - cameraY;
    if (screenY > player.y + player.height || screenY + obs.height < player.y) continue;
    if (player.hitCooldown <= 0 && collides(player, { x: obs.x, y: screenY, width: obs.width, height: obs.height })) {
      player.hp -= 1;
      player.hitCooldown = 120;
      player.hit();
      if (player.hp <= 0) {
        state = "gameover";
        showOverlay();
        return;
      }
    }
  }

  // collisions — snowballs
  for (let i = turrets.snowballs.length - 1; i >= 0; i--) {
    const s = turrets.snowballs[i];
    const screenS = { x: s.x, y: s.worldY - cameraY, width: s.width, height: s.height };
    if (player.hitCooldown <= 0 && collides(player, screenS)) {
      player.hp -= 1;
      player.hitCooldown = 120;
      player.hit();
      turrets.snowballs.splice(i, 1);
      if (player.hp <= 0) {
        state = "gameover";
        showOverlay();
        return;
      }
    }
  }

  // collisions — wolves
  for (let i = wolves.wolves.length - 1; i >= 0; i--) {
    const w = wolves.wolves[i];
    const screenW = { x: w.x, y: w.worldY - cameraY, width: w.width, height: w.height };
    if (player.hitCooldown <= 0 && collides(player, screenW)) {
      player.hp -= 1;
      player.hitCooldown = 120;
      player.hit();
      wolves.wolves.splice(i, 1);
      if (player.hp <= 0) {
        state = "gameover";
        showOverlay();
        return;
      }
    }
  }

  score = hud.update(score, scrollSpeed);

  terrain.draw(ctx, cameraY);
  obstacles.draw(ctx, cameraY);
  turrets.draw(ctx, cameraY);
  wolves.draw(ctx, cameraY);
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
  ctx.textAlign = "left";
}

function showOverlay() {
  overlayActive = true;
  document.getElementById("username-input").value = "";
  document.getElementById("score-panel").classList.remove("hidden");
  setTimeout(() => document.getElementById("username-input").focus(), 50);
}

function hideOverlay() {
  overlayActive = false;
  document.getElementById("score-panel").classList.add("hidden");
}

// Leaderboard: XMLHttpRequest pattern from CS1116 coursework
function fetchLeaderboard() {
  let xhttp = new XMLHttpRequest();
  xhttp.addEventListener("readystatechange", function () {
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      let scores = JSON.parse(xhttp.responseText);
      let list = document.getElementById("score-list");
      list.innerHTML = "";
      for (let i = 0; i < scores.length; i++) {
        let li = document.createElement("li");
        li.className = "list-group-item bg-transparent text-light";
        li.textContent = scores[i].username + " — " + scores[i].score;
        list.appendChild(li);
      }
    }
  }, false);
  xhttp.open("GET", "/api/scores", true);
  xhttp.send();
}

function saveScore(username) {
  let data = new FormData();
  data.append("username", username);
  data.append("score", score);

  let xhttp = new XMLHttpRequest();
  xhttp.addEventListener("readystatechange", function () {
    if (xhttp.readyState === 4) {
      if (xhttp.status === 200 && xhttp.responseText === "success") {
        fetchLeaderboard();
      }
      hideOverlay();
      restart();
      state = "title";
    }
  }, false);
  xhttp.open("POST", "/api/scores", true);
  xhttp.send(data);
}

function activate(event) {
  if (overlayActive) return;

  if (event.key === "Enter") {
    if (state === "title") {
      restart();
      state = "playing";
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
