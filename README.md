# Alpine Escape

An endless downhill skiing game built for CS1116 CA2. You ski down a procedurally
generated mountain, dodging trees, snowball-firing ski lift carts, and wolves
disguised as snowmen. Survive as long as you can, then save your score to a
persistent leaderboard.

The game runs entirely in the browser on a HTML5 `<canvas>` element using ES6
modules. A small Flask application serves the pages and exposes a JSON API backed
by SQLite for the top-ten scoreboard.

## Gameplay

- **Score** ticks up the longer you survive, and rises faster the faster you ski.
- **Health** starts at 3 hearts. Each hit costs one; the third crash ends the run.
  After a hit you get a short window of invulnerability (the skier flashes).
- **Difficulty** scales with distance travelled: the slope scrolls faster (up to
  2×), obstacles and enemies spawn more often, and lift carts fire more rapidly.
- **Off-piste** skiing (leaving the marked track) slows you down, so staying on
  the track is worth the risk of the obstacles on it.

### Hazards

| Hazard | Behaviour |
| --- | --- |
| Trees and logs | Static, spawn on the snow either side of the track. |
| Ski lift carts | Sit off-piste on an overhead wire. When you come within range they fire snowballs, aiming ahead of you to lead the shot. |
| Snowmen / wolves | Innocent-looking snowmen sitting on the track. Get close and a wolf bursts out, winds up, then leaps at your predicted position. |

### Controls

| Key | Action |
| --- | --- |
| <kbd>←</kbd> <kbd>→</kbd> | Steer. Holding a direction ramps up your turn rate; turning is harder at speed. |
| <kbd>↑</kbd> | Slow down (0.7× scroll speed) |
| <kbd>↓</kbd> | Speed up (3× scroll speed) |
| <kbd>Enter</kbd> | Start a run from the title screen |
| <kbd>P</kbd> | Pause / resume |
| <kbd>I</kbd> | Cheat: toggle invincibility (the skier gains a golden glow) |

## Running the project

Requires Python 3 and Flask.

```bash
pip install flask

# create the leaderboard database (once)
sqlite3 scores.db < schema.sql

flask run
```

Then open <http://127.0.0.1:5000/>. `.flaskenv` already sets `FLASK_APP=app.py`
and enables debug mode, so `flask run` needs no extra arguments (install
`python-dotenv` if the variables are not picked up).

Note that `schema.sql` begins with `DROP TABLE IF EXISTS scores`, so re-running
it wipes any saved scores.

## Project structure

```
app.py                  Flask routes: pages + /api/scores GET and POST
database.py             SQLite connection helpers bound to the Flask app context
schema.sql              scores table definition
scores.db               SQLite database (gitignored)

templates/
  base.html             Shared layout, Bootstrap 5, navbar
  home.html             Rules, controls, and cheats page
  play.html             Canvas, leaderboard panel, and save-score form

static/css/style.css    Canvas border and the .hidden helper
static/assets/          tilemap_packed.png spritesheet
static/js/
  main.js               Entry point: game loop, state machine, input, collisions, AJAX
  config.js             Shared constants (canvas size, tile size, base scroll speed)
  assets.js             Image/audio preloader that fires a callback when ready
  collision.js          AABB overlap test
  terrain.js            Procedural track generation and tilemap rendering
  player.js             Skier movement, lean, snow particles, damage flash
  obstacles.js          Tree and log spawning
  enemies.js            Ski lift carts and their snowball projectiles
  wolves.js             Snowman traps and leaping wolves
  hud.js                Hearts and tilemap-rendered score digits
```

## How it works

### Coordinate system

The camera scrolls down an infinite slope. Terrain rows, obstacles, and enemies
are all stored in **world space** (a `worldY` that only ever increases), while
the player and everything drawn to the canvas live in **screen space**. Rendering
converts with `screenY = worldY - cameraY`. Rows and entities that scroll off the
top are discarded, so memory stays flat no matter how long the run lasts.

### Terrain generation

`Terrain` emits one 16px row at a time, just far enough ahead to fill the canvas.
The track centre performs a random walk: a direction (`-1`, `0`, `+1`) is chosen
and held for 5–8 rows, and each row has a 50% chance of shifting by one tile in
that direction. The centre is clamped so the track always keeps a margin from the
canvas edges.

The edges use different tiles depending on whether the track is running straight,
curving left, or curving right, and when the curve direction changes the
*previous* row's edge tiles are rewritten to a corner variant. That retroactive
fix-up is what makes the transitions look continuous rather than stepped.

Each row records its `trackLeft` and `trackRight` columns, which everything else
reuses: obstacles and lift carts spawn only outside that range, wolves spawn only
inside it, and the on-track test looks up the row under the player.

### Player movement

The skier is velocity-based rather than position-based: arrow keys apply
acceleration, and friction is applied each frame (0.98 on track, 0.88 off it, so
deep snow bleeds off speed). Two feedback mechanics sit on top:

- **Ramping** — holding a direction builds a `holdTimer` up to 60 frames, scaling
  acceleration up to 1.5×, so taps are precise and holds commit to a turn.
- **Steer factor** — acceleration is divided by the current scroll speed, so
  descending fast makes the skier harder to control.

Presentation details: the sprite leans into direction changes via a canvas
rotation, sprays snow particles when moving sideways, animates faster at higher
scroll speeds, shakes the frame on impact, and flashes during the hit cooldown.

### Enemies

Both enemy types aim ahead of the player rather than at them. Lift carts compute
a unit direction vector to the player's position plus a lead offset and launch a
snowball along it. Wolves trigger within 130px, spend 45 frames winding up (which
gives you time to react), then leap a fixed distance along a leading vector —
only leading the shot when the player is below them, since a player above is
already skiing away.

### Leaderboard

`GET /api/scores` returns the top ten scores as JSON; `POST /api/scores` takes a
`username` and `score` as form data. The insert uses SQLite's
`ON CONFLICT ... DO UPDATE ... WHERE ? > scores.score`, so a name keeps its
personal best and a worse run never overwrites it. The server rejects empty names
and non-numeric scores.

The front end talks to the API with `XMLHttpRequest` (the pattern used in the
CS1116 coursework). The leaderboard is fetched on page load and refreshed after a
successful save. URLs are not hardcoded in the JavaScript — `play.html` passes
them through `data-` attributes generated by `url_for`, which the module reads on
startup.

### Game states

`main.js` runs a single `requestAnimationFrame` loop over three states:
`title`, `playing`, and `gameover`. Pausing draws the last frame plus an overlay
instead of updating, and clears held keys so you do not resume mid-turn. Keyboard
input is ignored while the save-score form is open so typing a name cannot steer
the skier.

## Credits

- Sprites: Kenney's *Tiny Ski* tileset (CC0).
- Technique references are linked inline in the source, mostly to MDN — tilemap
  scrolling, 2D AABB collision, canvas transformations, and ES6 modules.
