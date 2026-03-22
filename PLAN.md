# Alpine Escape — Project Plan & Directions

## Overview
Alpine Escape is a top-down skiing game built for a university assignment (CS1116/CS5018 CA2, worth 50%). The player skis downhill through increasingly dangerous mountain courses, dodging obstacles, avoiding enemies, and collecting powerups. Each level has a finish line. The game is built with pure JavaScript (no libraries) using the HTML5 Canvas API. It will later be integrated into a Flask app for score storage and a leaderboard.

## Code Style & Conventions
- **`const` by default**, `let` only for values that get reassigned (counters, state, positions).
- **ES6 modules** — each file uses `import`/`export`. Only `main.js` needs a `<script>` tag with `type="module"`.
- **No external JS libraries** (assignment rule).
- **Attribution required** for any code or assets from external sources — include exact URLs.

## File Structure
```
game/
├── index.html
├── css/
│   └── style.css
├── assets/
│   └── tilemap_packed.png       (Kenney 1-Bit Winter Pack, 16x16 tiles, no padding)
└── js/
    ├── config.js                 (Constants — imported by other modules)
    ├── input.js                  (Keyboard handler class)
    ├── collision.js              (AABB collision helper)
    ├── player.js                 (Player class)
    ├── terrain.js                (Procedural terrain generation + tile rendering)
    ├── obstacles.js              (Obstacle spawning and management)
    ├── enemies.js                (Enemy classes: Turret, Wolf, Yeti, Avalanche)
    ├── powerups.js               (Shield, Score Multiplier, Coin)
    ├── hud.js                    (Score, health, progress bar, active powerup display)
    └── main.js                   (Entry point — imports everything, runs game loop)
```

Only `main.js` needs a `<script type="module">` tag in index.html. All other files are pulled in via `import` statements.

## Tileset Details
- **File:** `tilemap_packed.png` (Kenney pack)
- **Tile size:** 16x16 pixels, no padding between tiles
- **Grid:** 12 columns × 11 rows = 132 tiles
- **Tiles per row:** 12
- **Extraction formula:**
  ```js
  const srcX = (tileIndex % Game.TILES_PER_ROW) * Game.TILE_SIZE;
  const srcY = Math.floor(tileIndex / Game.TILES_PER_ROW) * Game.TILE_SIZE;
  ```
- The student knows which tile indices to use for what — don't guess tile mappings, ask them.

## Core Mechanics

### Scrolling
- The camera moves downward through the world each frame (`cameraY += scrollSpeed`).
- Every entity has a `worldY` (true position in the level).
- Screen position: `screenY = entity.worldY - cameraY`.
- The player is positioned in the upper third of the screen.
- Terrain, obstacles, enemies, and powerups spawn below the visible screen and scroll upward as the camera advances.
- Entities that scroll past the top of the screen are removed.

### Player
- Moves left/right with arrow keys.
- Up arrow: slow down (reduce scroll speed slightly).
- Down arrow: speed up (increase scroll speed for bonus points but more risk).
- Has 3 HP (hit points), displayed as hearts.
- Loses 1 HP per collision with obstacle or enemy hit.
- Game over at 0 HP.

### Obstacles (static, scroll with terrain)
- **Pine trees:** Most common. Small hitbox.
- **Rocks/boulders:** Larger hitbox. Sometimes form narrow passages.
- **Frozen lake patches:** Reduce steering control (player slides). No direct damage.
- **Moguls:** Slow the player momentarily. Later levels only.
- Spawned procedurally. Rules prevent unfair clustering.

### Enemies (4 types, introduced across levels)
1. **Snowball Turret (Level 1+):** Stationary. Fires snowballs at player when in range. Predictable pattern.
2. **Wolf (Level 2+):** Chaser. Spawns at edges, moves toward player. Simple line-of-sight pursuit.
3. **Yeti (Level 3+):** Ambusher. Hides behind large obstacles. Lunges when player is within trigger radius. Short burst then stops.
4. **Avalanche Fragment (Level 4+):** Environmental. Large snow chunks falling faster than the player from random horizontal positions. Must be dodged.

### Powerups
- **Shield:** Absorbs next hit. Visual bubble around player. Lasts until hit once.
- **Score Multiplier (x2):** Doubles all score for 8 seconds. HUD shows "x2" indicator.
- **Coin:** Basic collectible for bonus points. Spawns frequently.
- Powerups glow/pulse to stand out. Collected by skiing over them.

### Levels
- Each level has a defined length (distance units). Finish line visible near the end.
- Between levels: score summary screen, "Press ENTER for Next Level".
- Level progression:
  1. **Gentle Slopes** — sparse trees, turrets only, slow scroll. Tutorial-like.
  2. **Pine Forest** — dense trees, wolves introduced, moderate speed.
  3. **Rocky Pass** — boulders, yetis, ice patches, narrow passages.
  4. **The Summit** — avalanche fragments, all enemies, fast scroll, heavy snowfall.
  5. **Bonus (5+)** — procedural remix of everything. Endless for high scores.

### Scoring
- Distance travelled (accumulates as camera moves).
- Coins collected (bonus points per coin).
- Speed bonus (going faster = more points per distance unit).
- Score multiplier powerup doubles all gains while active.

### Game States
- `"title"` — Logo, "Press ENTER to Start". Optional snow animation.
- `"playing"` — Core gameplay loop.
- `"levelcomplete"` — Score summary, next level prompt.
- `"gameover"` — Final score, restart prompt.
- `"paused"` — P or Escape to toggle. Overlay with "PAUSED" text.

State managed by a `Game.state` variable. Game loop switches on it.

### HUD
- **Health:** Heart icons, top-left.
- **Score:** Running total, top-right.
- **Level indicator:** Current level, top-centre.
- **Active powerup:** Icon + timer bar below score.
- **Distance bar:** Thin progress bar at bottom showing distance to finish line.

## Collision Detection
- AABB (axis-aligned bounding box) rectangle overlap.
- Hitboxes should be ~60-70% of sprite size for forgiving feel.
```js
function collides(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
```

## Procedural Terrain Generation
- Maintain a buffer of terrain rows (visible area + some extra).
- As camera moves down, generate new rows at the bottom, remove rows that scroll past the top.
- Each row: fill with snow tiles, then randomly place obstacles based on level rules.
- Rules: don't cluster obstacles in adjacent columns/rows, ensure there's always a navigable path, increase density per level.
- Enemies and powerups are spawned separately based on distance thresholds and randomness.

## Flask Integration (Later Phase)
- Game is fully client-side, lives in Flask's `static/` folder.
- On game over, send score to a Flask route via `fetch()` (Ajax POST).
- Flask stores score in a SQLite database (player name + score + level reached + date).
- Flask serves a leaderboard page showing top scores.
- Optional: login system so players are identified.

## Build Phases (incremental — each produces a playable game)

### Phase 1 — Canvas & Player Movement
- Set up index.html, config.js, main.js.
- Draw player as a coloured rectangle.
- Arrow keys move it. Keep within canvas bounds.
- Solid colour background.
- **Test: player moves smoothly, stays in bounds.**

### Phase 2 — Scrolling
- Add `cameraY` that increases each frame.
- Draw reference lines or shapes at fixed `worldY` positions to verify scrolling.
- Player stays in upper third of screen.
- **Test: world scrolls upward, reference objects pass by.**

### Phase 3 — Tileset & Terrain
- Load tilemap_packed.png using the asset loader pattern.
- Render procedural snow terrain using tile indices.
- New rows generate below screen, old rows removed above.
- **Test: continuous snowy ground scrolls smoothly, no gaps.**

### Phase 4 — Obstacles
- Spawn trees and rocks procedurally on terrain rows.
- Draw them from tileset.
- Collision with player costs 1 HP (log to console first, then implement health).
- **Test: obstacles appear, scroll past, collisions detected.**

### Phase 5 — HUD & Game States
- Draw health (hearts), score, level indicator.
- Implement title screen, game over screen, level complete screen.
- Score increases with distance.
- Game over when HP = 0.
- **Test: full game loop from title → playing → game over → restart.**

### Phase 6 — Turret Enemies
- Stationary turrets placed during terrain generation.
- Fire projectiles toward player when in range.
- Projectiles are small objects that move in a direction, removed off-screen.
- Collision with projectile costs 1 HP.
- **Test: turrets shoot, projectiles move, collisions work.**

### Phase 7 — Wolf Enemies
- Spawn at screen edges.
- Move toward player each frame (simple: adjust x/y toward player's x/y).
- Collision costs 1 HP.
- **Test: wolves chase player, can be dodged.**

### Phase 8 — Yeti Enemies
- Attached to large rock obstacles during generation.
- Hidden until player is within trigger radius.
- Lunge toward player position at time of trigger, then stop.
- **Test: yetis surprise the player, lunge works.**

### Phase 9 — Powerups
- Spawn shield and score multiplier randomly on terrain.
- Shield: set a flag, draw bubble, absorb one hit then remove.
- Score multiplier: set a flag + timer, double score gains, remove when timer expires.
- Coins: simple collectible, add to score on pickup.
- **Test: powerups appear, can be collected, effects work.**

### Phase 10 — Level Progression
- Define level data: length, scroll speed, enemy types enabled, obstacle density.
- Track distance. When distance >= level length, show level complete screen.
- Load next level with updated parameters.
- **Test: can complete level 1, transition to level 2, difficulty increases.**

### Phase 11 — Sprites & Visual Polish
- Replace coloured rectangles with tileset sprites.
- Animate player (if spritesheet frames available).
- Add snow particle effect (small white dots drifting).
- Screen shake on collision.
- **Test: game looks polished, animations smooth.**

### Phase 12 — Audio
- Sound effects: collision, powerup pickup, level complete, game over.
- Optional background music.
- Use the `load_assets` pattern to preload audio.
- **Test: sounds play at right moments, not annoying.**

### Phase 13 — Flask Integration
- Create Flask app with routes: serve game page, POST score, GET leaderboard.
- Set up SQLite database for scores.
- On game over, `fetch("/api/score", { method: "POST", body: JSON.stringify({score, level}) })`.
- Leaderboard page queries DB and displays top scores.
- **Test: scores persist, leaderboard shows them.**

## Key Tips
- **Test every 5 lines.** Don't write big chunks without checking.
- **Use console.log liberally.** Print positions, collision results, state changes. Remove before submission.
- **Keep backups.** After each working phase, copy the folder.
- **Start with shapes.** Coloured rectangles first, sprites later.
- **Chrome DevTools (F12)** — Console for errors, debugger for breakpoints.
- **Hitboxes smaller than sprites** — makes the game feel fair.
- **Don't optimise early** — get it working first, make it fast later.
