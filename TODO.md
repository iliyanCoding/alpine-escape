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
- [x] Add cameraY that increases each frame
- [x] Draw reference shapes at fixed worldY to verify scrolling
- [x] Player stays in upper third of screen
- [x] Remove entities that scroll past the top

## Phase 3 — Tileset & Terrain
- [x] Load tilemap_packed.png
- [x] Render procedural snow terrain with tiles
- [x] Generate new rows below screen, remove old rows above
- [x] Corner tile transitions for smooth track curves

## Phase 4 — Obstacles
- [x] Spawn trees and rocks procedurally
- [x] Draw obstacles from tileset
- [x] Collision detection (player loses 1 HP)

## Phase 5 — HUD & Game States
- [x] Health display (hearts)
- [x] Score display
- [ ] Level indicator
- [x] Title screen, game over screen
- [x] Full game loop: title → playing → game over → restart

## Phase 6 — Turret Enemies
- [x] Place turrets during terrain generation
- [x] Fire projectiles toward player (with lead aiming)
- [x] Projectile collision costs 1 HP

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
- [ ] Coins/collectibles (bonus points on track)

## Phase 10 — Increasing Difficulty
- [ ] Turrets fire faster over time
- [ ] Obstacles spawn more densely
- [ ] Scroll speed gradually increases the longer you survive

## Phase 11 — Sprites & Visual Polish
- [x] Replace rectangles with tileset sprites
- [x] Snow particle trail behind player
- [x] Screen shake on collision
- [x] Player animation speed scales with scroll speed
- [x] Character leans during direction changes
- [ ] High score saved to localStorage, shown on title screen
- [ ] Combo system (near-misses give bonus points)

## Phase 12 — New Obstacles & Events
- [ ] Snowdrifts that slow you down
- [ ] Ice patches that reduce friction
- [ ] Moving obstacles (animals crossing the track)
- [ ] Speed boost ramps
- [ ] Avalanche event (wall of snow chases you)

## Phase 13 — Audio
- [ ] Sound effects (collision, pickup, level complete, game over)
- [ ] Optional background music

## Phase 14 — Flask Integration
- [ ] Flask app with routes
- [ ] SQLite database for scores
- [ ] POST score on game over
- [ ] Leaderboard page
