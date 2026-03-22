# Alpine Escape — Progress Tracker

## Phase 1 — Canvas & Player Movement
- [x] Set up index.html, config.js, main.js
- [x] Canvas sized from config constants
- [x] Game loop (requestAnimationFrame)
- [x] Draw player as coloured rectangle
- [x] Keyboard input (keydown/keyup tracking)
- [x] Player movement with arrow keys
- [x] Clamp player within canvas bounds

## Phase 2 — Scrolling
- [ ] Add cameraY that increases each frame
- [ ] Draw reference shapes at fixed worldY to verify scrolling
- [ ] Player stays in upper third of screen
- [ ] Remove entities that scroll past the top

## Phase 3 — Tileset & Terrain
- [ ] Load tilemap_packed.png
- [ ] Render procedural snow terrain with tiles
- [ ] Generate new rows below screen, remove old rows above

## Phase 4 — Obstacles
- [ ] Spawn trees and rocks procedurally
- [ ] Draw obstacles from tileset
- [ ] Collision detection (player loses 1 HP)

## Phase 5 — HUD & Game States
- [ ] Health display (hearts)
- [ ] Score display
- [ ] Level indicator
- [ ] Title screen, game over screen, level complete screen
- [ ] Full game loop: title → playing → game over → restart

## Phase 6 — Turret Enemies
- [ ] Place turrets during terrain generation
- [ ] Fire projectiles toward player
- [ ] Projectile collision costs 1 HP

## Phase 7 — Wolf Enemies
- [ ] Spawn at screen edges
- [ ] Chase player each frame
- [ ] Collision costs 1 HP

## Phase 8 — Yeti Enemies
- [ ] Attach to large rock obstacles
- [ ] Trigger when player is within radius
- [ ] Lunge toward player then stop

## Phase 9 — Powerups
- [ ] Shield (absorbs one hit)
- [ ] Score multiplier (x2 for 8 seconds)
- [ ] Coins (bonus points)

## Phase 10 — Level Progression
- [ ] Define level data (length, speed, enemies, density)
- [ ] Track distance, trigger level complete
- [ ] Load next level with updated parameters

## Phase 11 — Sprites & Visual Polish
- [ ] Replace rectangles with tileset sprites
- [ ] Snow particle effect
- [ ] Screen shake on collision

## Phase 12 — Audio
- [ ] Sound effects (collision, pickup, level complete, game over)
- [ ] Optional background music

## Phase 13 — Flask Integration
- [ ] Flask app with routes
- [ ] SQLite database for scores
- [ ] POST score on game over
- [ ] Leaderboard page
