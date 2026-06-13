# Kids Platform — Opus Build Plan: Jazz Ball (JezzBall clone)

You are building **Jazz Ball**, a touch-first JezzBall clone for a kids web
platform: bouncing balls roam a rectangular field, the player builds walls to
fence off and capture empty territory, and a level is cleared once enough of the
field is captured. Read this entire document before writing a single line of code.

---

## Project location

`/Users/brad-personal/Projects/kids-platform/`

---

## ⚠️ CRITICAL RULES — read before anything else

Breaking any of these will cause the task to fail.

1. **No comments in code.** Not a single `//` or `/* */` block, except the one
   non-obvious algorithm explicitly allowed in Task 1 (the separate-axis ball
   collision and the flood-fill capture may each carry at most one short
   explanatory line if you judge it necessary — prefer none).
2. **No framework, no build step.** Pure vanilla HTML/CSS/JS. No React, Vue,
   bundlers, or npm imports in the browser.
3. **No placeholder code.** Every function fully implemented. No `// TODO`.
4. **Read the listed reference files before writing.** Never guess class names
   or paths.
5. **No helper abstractions** unless used 3+ times.
6. **Touch AND mouse** on every interactive surface. The canvas handles
   `touchstart` and `mousedown`; the orientation button is a `<button>` with a
   `click` handler (covers both).
7. **`e.preventDefault()` on the canvas touch handler**, registered with
   `{ passive: false }`.
8. **Unlock Web Audio (`game._ctx()`) on the first user gesture** — call it at
   the top of the canvas build handler and the orientation button handler before
   any `game.sound()`.
9. **Use `100dvh`, never `100vh`** in CSS.
10. **Never hardcode canvas pixel dimensions.** `canvas.width`/`canvas.height`
    are computed from `window.innerWidth`/`innerHeight`. `CELL` (16) is a cell
    size constant, not a canvas dimension — that is allowed.
11. **One file per task.** Never touch files outside the task scope.
12. **Write complete files — never truncate.** Task 1 gives the entire file
    verbatim; paste it exactly.

---

## Files to read before starting any task

```
/Users/brad-personal/Projects/kids-platform/public/games/_lib/KidsGame.js
/Users/brad-personal/Projects/kids-platform/public/games/_lib/confetti.js
/Users/brad-personal/Projects/kids-platform/public/games/blockblasters/index.html
/Users/brad-personal/Projects/kids-platform/public/css/kids.css
/Users/brad-personal/Projects/kids-platform/public/games/index.html
```

`blockblasters/index.html` is the reference canvas game — Jazz Ball copies its
shell structure (header + full-bleed canvas), its `setPaddleFromClient`-style
client-to-canvas coordinate mapping, its `roundRect`, its `drawBall` glow, its
`drawHUD` text style, its banner pattern, and its `requestAnimationFrame` loop.
Match those idioms; do not invent new ones.

---

## KidsGame API reference

```js
class KidsGame {
  constructor({ name: string, backUrl: string = '../' })

  init()   // override — build DOM, attach events
  start()  // override — begin/reset gameplay

  sound(name)              // 'pop' | 'correct' | 'wrong' | 'cheer' | 'click'
  correct(el?)             // green flash + correct sound
  wrong(el?)               // shake + wrong sound
  celebrate()              // confetti burst + cheer sound
  showWin(stars, onAction) // win overlay; stars 1|2|3; onAction('again'|'home')
  showLose(msg, onAction)  // lose overlay; onAction('again'|'home')
  home()                   // navigate to backUrl ('../')
  _ctx()                   // AudioContext; call on first user gesture
}
```

Notes that matter for this build:

- `game.celebrate()` already fires confetti **and** the cheer sound; do not also
  call `game.sound('cheer')` in the same beat.
- `game.showWin`/`showLose` build their own overlay DOM; you do not render win/
  lose screens yourself.
- `game.wrong()` with no element argument plays the wrong sound only — Jazz Ball
  shakes the canvas itself via the `kg-shake` class (defined in kids.css).

---

## Shared boilerplate

CSS variables available from `kids.css` (`:root`): `--coral #FF6B6B`,
`--teal #4ECDC4`, `--yellow #FFE66D`, `--green #6BCB77`, `--purple #A78BFA`,
`--orange #FB923C`, `--dark #1A202C`, `--mid #4A5568`. The `.nav-back` button,
`.kg-shake` animation, `.kg-overlay*` styles, and `.btn*` styles are all defined
there — do not redefine them.

The page is a single block-flow stack (no flexbox needed on `body`), exactly
like Block Blasters: a fixed `.nav-back`, a 56px `#header`, the `#board` canvas
sized in JS to `innerHeight - 56 - 76`, and a 76px `#bar` holding the controls.
`56 + canvasHeight + 76 === innerHeight`, and `body { overflow: hidden }` blocks
scroll.

---
---

# TASK 1 — Build the Jazz Ball game

**File to write:** `/Users/brad-personal/Projects/kids-platform/public/games/jazzball/index.html`

This is a new file in a new directory. Create the directory. Paste the file
below **verbatim** — it is complete and correct. Do not paraphrase, reorder, or
"improve" it. After pasting, read the design notes and behavioural checklist
that follow and confirm the pasted file satisfies every bullet.

### Design summary (how the game works)

- The field is a grid of `CELL`-px square cells. Each cell is `OPEN` (active
  play area), `WALL` (a solid built wall), or `FILLED` (captured territory).
  `WALL` and `FILLED` are both solid — balls bounce off them and off the grid's
  outer boundary.
- Balls move continuously in diagonal directions (`vx`, `vy` each `±speed`).
  Collision is resolved one axis at a time against the cell under the ball's
  leading edge.
- The player taps the field to start a wall growing from that cell. The wall
  grows in **both** directions along the current orientation axis (a vertical
  wall grows up and down; a horizontal wall grows left and right), one cell per
  `WALL_STEP_FRAMES` frames, until each head meets a solid cell or the boundary.
- A growing wall is **fragile**: while it is still building, if any ball touches
  any of its cells, the whole wall is destroyed, the canvas shakes, and the
  player loses a life. A completed wall becomes solid.
- Each time a wall completes, the open area is flood-filled into connected
  regions; any region containing **no ball** is captured (turned to `FILLED`).
- Coverage = solid cells / total cells. Reach the level's `target` to clear it.
- Only one wall may build at a time. Taps are ignored while a wall is building.

### Locked decisions (do not deviate)

- **Controls are tap-to-build + an orientation toggle button.** A tap on the
  field builds a wall using the current orientation. The `#orient-btn` button
  switches orientation for the next wall. Right-click on the field and the
  spacebar also toggle orientation (desktop niceties), and a right-click never
  also builds a wall.
- **Lives reset to 3 at the start of every level.** Losing all 3 lives shows the
  lose overlay; `'again'` retries the **same** level fresh (not level 1). This
  is deliberately forgiving for young children.
- **Five levels.** Clearing level 5 shows `showWin(3, …)`; its `'again'` restarts
  the whole game at level 1.

### Level table

| Level | Balls | Ball speed (px/frame, each axis) | Target coverage |
|-------|-------|----------------------------------|-----------------|
| 1 | 2 | 2.2 | 72% |
| 2 | 3 | 2.4 | 74% |
| 3 | 4 | 2.6 | 76% |
| 4 | 5 | 2.8 | 78% |
| 5 | 6 | 3.0 | 80% |

### Colour & size constants

| Thing | Value |
|-------|-------|
| Body background | `linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)` |
| Canvas backdrop (outside grid) | `#0b1020` |
| Field backdrop (open cells) | `#16213e` |
| `FILLED` cell | `#2a9d8f` with a `rgba(255,255,255,.06)` 2px top highlight |
| `WALL` cell | `#FFE66D` |
| Building wall cell | pulsing orange `rgba(251,146,60, …)` |
| Dying (destroyed) wall cell | fading `rgba(255,80,80, …)` |
| Grid border stroke | `rgba(255,255,255,.15)`, 2px |
| Ball colours (cycled) | `#FF6B6B #FFE66D #4ECDC4 #A78BFA #FB923C #F9A8D4` |
| `CELL` | 16 px |
| `BALL_R` | 6 px |
| `WALL_STEP_FRAMES` | 2 |
| `HEADER_H` / `BAR_H` | 56 / 76 px |

### Layout

```
[← nav-back, fixed top-left]
┌──────────────────────────────────────────┐
│  #header  🎱 Jazz Ball            (56px)  │
├──────────────────────────────────────────┤
│                                          │
│  #board canvas (innerHeight-56-76)       │
│    top HUD drawn on canvas:              │
│      ⭐score        meter        ❤️lives  │
│                  NN% / TT%               │
│                  Level N                 │
│    grid of cells + bouncing balls        │
│                                          │
├──────────────────────────────────────────┤
│  #bar                              (76px) │
│      [ ↕ Vertical walls ]  (orient-btn)  │
│      Tap the field to build a wall       │
└──────────────────────────────────────────┘
```

### The complete file (paste verbatim)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>Jazz Ball</title>
  <link rel="stylesheet" href="../../css/kids.css">
  <style>
    body {
      background: linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
      overflow: hidden;
    }
    #header {
      height: 56px; flex-shrink: 0; width: 100%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 900; font-size: 20px;
      letter-spacing: .5px; text-shadow: 0 2px 8px rgba(0,0,0,.4);
    }
    #board { display: block; touch-action: none; }
    #bar {
      height: 76px; flex-shrink: 0; width: 100%;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 5px;
    }
    #orient-btn {
      font-family: inherit; font-weight: 900; font-size: 18px;
      color: #1A202C; background: var(--yellow);
      border: none; border-radius: 14px; padding: 10px 26px;
      cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,.3);
    }
    #orient-btn:active { transform: scale(.94); }
    #hint { color: rgba(255,255,255,.7); font-size: 12px; font-weight: 700; }
  </style>
</head>
<body>
  <button class="nav-back" id="back-btn">←</button>
  <div id="header">🎱 Jazz Ball</div>
  <canvas id="board"></canvas>
  <div id="bar">
    <button id="orient-btn">↕ Vertical walls</button>
    <div id="hint">Tap the field to build a wall</div>
  </div>

  <script src="../_lib/confetti.js"></script>
  <script src="../_lib/KidsGame.js"></script>
  <script>
    const canvas = document.getElementById('board');
    const ctx = canvas.getContext('2d');
    const orientBtn = document.getElementById('orient-btn');

    const HEADER_H = 56;
    const BAR_H = 76;
    const CELL = 16;
    const BALL_R = 6;
    const WALL_STEP_FRAMES = 2;
    const MAX_LEVEL = 5;

    const OPEN = 0, WALL = 1, FILLED = 2;

    const LEVELS = [
      { balls: 2, speed: 2.2, target: 0.72 },
      { balls: 3, speed: 2.4, target: 0.74 },
      { balls: 4, speed: 2.6, target: 0.76 },
      { balls: 5, speed: 2.8, target: 0.78 },
      { balls: 6, speed: 3.0, target: 0.80 },
    ];
    const BALL_COLORS = ['#FF6B6B','#FFE66D','#4ECDC4','#A78BFA','#FB923C','#F9A8D4'];

    let cols, rows, offsetX, offsetY;
    let grid, balls, building, dyingWall;
    let lives, score, level, target, coverage, mode, banner;
    let orientation = 'v';
    let canvasRect, frame = 0;

    class JazzBall extends KidsGame {
      init() {
        document.getElementById('back-btn').addEventListener('click', () => this.home());
        sizeCanvas();
        bindControls();
        this.start();
        requestAnimationFrame(loop);
      }
      start() {
        score = 0;
        level = 1;
        startLevel();
      }
    }

    const game = new JazzBall({ name: 'Jazz Ball' });

    function sizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - HEADER_H - BAR_H;
      canvasRect = canvas.getBoundingClientRect();
      cols = Math.floor(canvas.width / CELL);
      rows = Math.floor(canvas.height / CELL);
      offsetX = Math.floor((canvas.width - cols * CELL) / 2);
      offsetY = Math.floor((canvas.height - rows * CELL) / 2);
    }

    function startLevel() {
      const cfg = LEVELS[Math.min(level - 1, MAX_LEVEL - 1)];
      target = cfg.target;
      lives = 3;
      building = null;
      dyingWall = null;
      banner = null;
      mode = 'play';
      coverage = 0;
      grid = [];
      for (let r = 0; r < rows; r++) grid.push(new Array(cols).fill(OPEN));
      balls = [];
      for (let i = 0; i < cfg.balls; i++) balls.push(makeBall(cfg.speed, i));
      updateOrientBtn();
    }

    function makeBall(speed, i) {
      const gw = cols * CELL, gh = rows * CELL, m = CELL * 2;
      return {
        x: offsetX + m + Math.random() * (gw - m * 2),
        y: offsetY + m + Math.random() * (gh - m * 2),
        vx: speed * (Math.random() < 0.5 ? -1 : 1),
        vy: speed * (Math.random() < 0.5 ? -1 : 1),
        color: BALL_COLORS[i % BALL_COLORS.length],
      };
    }

    function isSolid(c, r) {
      if (c < 0 || r < 0 || c >= cols || r >= rows) return true;
      return grid[r][c] !== OPEN;
    }
    function isSolidPx(px, py) {
      return isSolid(Math.floor((px - offsetX) / CELL), Math.floor((py - offsetY) / CELL));
    }
    function cellOf(px, py) {
      return { c: Math.floor((px - offsetX) / CELL), r: Math.floor((py - offsetY) / CELL) };
    }

    function tryBuild(clientX, clientY) {
      if (mode !== 'play' || building) return;
      const px = (clientX - canvasRect.left) * (canvas.width / canvasRect.width);
      const py = (clientY - canvasRect.top) * (canvas.height / canvasRect.height);
      const { c, r } = cellOf(px, py);
      if (c < 0 || r < 0 || c >= cols || r >= rows) return;
      if (grid[r][c] !== OPEN) return;
      building = {
        orient: orientation,
        cells: [{ c, r }],
        headA: { c, r, done: false },
        headB: { c, r, done: false },
        timer: 0,
      };
      game.sound('click');
    }

    function stepHead(head, dc, dr) {
      if (head.done) return;
      const nc = head.c + dc, nr = head.r + dr;
      if (isSolid(nc, nr)) { head.done = true; return; }
      head.c = nc; head.r = nr;
      building.cells.push({ c: nc, r: nr });
    }

    function growWall() {
      if (!building) return;
      if (++building.timer < WALL_STEP_FRAMES) return;
      building.timer = 0;
      if (building.orient === 'v') {
        stepHead(building.headA, 0, -1);
        stepHead(building.headB, 0, 1);
      } else {
        stepHead(building.headA, -1, 0);
        stepHead(building.headB, 1, 0);
      }
      if (building.headA.done && building.headB.done) completeWall();
    }

    function circleRect(cx, cy, r, rx, ry, rw, rh) {
      const nx = Math.max(rx, Math.min(cx, rx + rw));
      const ny = Math.max(ry, Math.min(cy, ry + rh));
      return (cx - nx) ** 2 + (cy - ny) ** 2 <= r * r;
    }

    function checkWallHit() {
      if (!building) return;
      for (const cp of building.cells) {
        const rx = offsetX + cp.c * CELL, ry = offsetY + cp.r * CELL;
        for (const b of balls) {
          if (circleRect(b.x, b.y, BALL_R, rx, ry, CELL, CELL)) { destroyWall(); return; }
        }
      }
    }

    function destroyWall() {
      dyingWall = { cells: building.cells, t: 18 };
      building = null;
      lives--;
      game.wrong();
      canvas.classList.remove('kg-shake');
      void canvas.offsetWidth;
      canvas.classList.add('kg-shake');
      if (lives <= 0) {
        mode = 'over';
        game.showLose('Out of lives! 💪', cb => { if (cb === 'again') startLevel(); });
      }
    }

    function completeWall() {
      for (const cp of building.cells) grid[cp.r][cp.c] = WALL;
      building = null;
      game.sound('pop');
      captureRegions();
      recomputeCoverage();
      if (coverage >= target) onLevelClear();
    }

    function captureRegions() {
      const ballCells = balls.map(b => cellOf(b.x, b.y));
      const seen = [];
      for (let r = 0; r < rows; r++) seen.push(new Array(cols).fill(false));
      let captured = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c] !== OPEN || seen[r][c]) continue;
          const region = [];
          const stack = [[c, r]];
          seen[r][c] = true;
          let hasBall = false;
          while (stack.length) {
            const [cc, rr] = stack.pop();
            region.push([cc, rr]);
            for (const bc of ballCells) if (bc.c === cc && bc.r === rr) hasBall = true;
            for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]) {
              const nc = cc + dc, nr = rr + dr;
              if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
              if (grid[nr][nc] !== OPEN || seen[nr][nc]) continue;
              seen[nr][nc] = true;
              stack.push([nc, nr]);
            }
          }
          if (!hasBall) {
            for (const [cc, rr] of region) grid[rr][cc] = FILLED;
            captured += region.length;
          }
        }
      }
      if (captured > 0) { score += captured; game.sound('cheer'); }
    }

    function recomputeCoverage() {
      let solid = 0;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (grid[r][c] !== OPEN) solid++;
      coverage = solid / (cols * rows);
    }

    function onLevelClear() {
      score += 100 * level;
      if (level >= MAX_LEVEL) {
        mode = 'over';
        game.showWin(3, cb => { if (cb === 'again') game.start(); });
        return;
      }
      mode = 'clear';
      banner = 'Level ' + level + ' cleared! 🎉';
      game.celebrate();
      setTimeout(() => { level++; startLevel(); }, 1500);
    }

    function updateBalls() {
      for (const b of balls) {
        const sx = Math.sign(b.vx), sy = Math.sign(b.vy);
        const nx = b.x + b.vx;
        if (isSolidPx(nx + sx * BALL_R, b.y)) b.vx = -b.vx; else b.x = nx;
        const ny = b.y + b.vy;
        if (isSolidPx(b.x, ny + sy * BALL_R)) b.vy = -b.vy; else b.y = ny;
      }
    }

    function update() {
      if (mode !== 'play') {
        if (dyingWall && --dyingWall.t <= 0) dyingWall = null;
        return;
      }
      frame++;
      updateBalls();
      growWall();
      checkWallHit();
      if (dyingWall && --dyingWall.t <= 0) dyingWall = null;
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function draw() {
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#16213e';
      ctx.fillRect(offsetX, offsetY, cols * CELL, rows * CELL);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const s = grid[r][c];
          if (s === OPEN) continue;
          const x = offsetX + c * CELL, y = offsetY + r * CELL;
          if (s === FILLED) {
            ctx.fillStyle = '#2a9d8f';
            ctx.fillRect(x, y, CELL, CELL);
            ctx.fillStyle = 'rgba(255,255,255,.06)';
            ctx.fillRect(x, y, CELL, 2);
          } else {
            ctx.fillStyle = '#FFE66D';
            ctx.fillRect(x, y, CELL, CELL);
          }
        }
      }

      if (building) {
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.3);
        ctx.fillStyle = 'rgba(251,146,60,' + (0.45 + 0.45 * pulse) + ')';
        for (const cp of building.cells)
          ctx.fillRect(offsetX + cp.c * CELL, offsetY + cp.r * CELL, CELL, CELL);
      }

      if (dyingWall) {
        ctx.fillStyle = 'rgba(255,80,80,' + (dyingWall.t / 18) + ')';
        for (const cp of dyingWall.cells)
          ctx.fillRect(offsetX + cp.c * CELL, offsetY + cp.r * CELL, CELL, CELL);
      }

      ctx.strokeStyle = 'rgba(255,255,255,.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(offsetX, offsetY, cols * CELL, rows * CELL);

      for (const b of balls) drawBall(b);

      drawHUD();
      if (banner) drawBanner();
    }

    function drawBall(b) {
      ctx.save();
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawHUD() {
      ctx.fillStyle = 'white';
      ctx.font = '900 18px Nunito, sans-serif';
      ctx.textBaseline = 'top';

      ctx.textAlign = 'left';
      ctx.fillText('⭐ ' + score, 12, 10);

      ctx.textAlign = 'right';
      ctx.fillText('❤️'.repeat(Math.max(0, lives)), canvas.width - 12, 10);

      const mw = Math.min(220, canvas.width * 0.4), mh = 14;
      const mx = (canvas.width - mw) / 2, my = 12;
      ctx.fillStyle = 'rgba(255,255,255,.18)';
      roundRect(mx, my, mw, mh, 7); ctx.fill();
      const pct = Math.min(1, coverage / target);
      ctx.fillStyle = pct >= 1 ? '#6BCB77' : '#4ECDC4';
      roundRect(mx, my, Math.max(mh, mw * pct), mh, 7); ctx.fill();

      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 13px Nunito, sans-serif';
      ctx.fillText(Math.round(coverage * 100) + '% / ' + Math.round(target * 100) + '%', canvas.width / 2, my + mh / 2 + 1);

      ctx.textBaseline = 'top';
      ctx.font = '900 12px Nunito, sans-serif';
      ctx.fillText('Level ' + level, canvas.width / 2, my + mh + 5);
    }

    function drawBanner() {
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(0, canvas.height / 2 - 46, canvas.width, 92);
      ctx.fillStyle = 'white';
      ctx.font = '900 30px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(banner, canvas.width / 2, canvas.height / 2);
    }

    function toggleOrient() {
      orientation = orientation === 'v' ? 'h' : 'v';
      updateOrientBtn();
    }
    function updateOrientBtn() {
      orientBtn.textContent = orientation === 'v' ? '↕ Vertical walls' : '↔ Horizontal walls';
    }

    function bindControls() {
      const buildHandler = e => {
        if (e.button === 2) return;
        e.preventDefault();
        game._ctx();
        const t = e.touches ? e.touches[0] : e;
        tryBuild(t.clientX, t.clientY);
      };
      canvas.addEventListener('touchstart', buildHandler, { passive: false });
      canvas.addEventListener('mousedown', buildHandler);
      canvas.addEventListener('contextmenu', e => { e.preventDefault(); game._ctx(); toggleOrient(); });
      orientBtn.addEventListener('click', () => { game._ctx(); toggleOrient(); });
      window.addEventListener('keydown', e => {
        if (e.code === 'Space') { e.preventDefault(); toggleOrient(); }
      });
      window.addEventListener('resize', () => { sizeCanvas(); startLevel(); });
    }

    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }

    document.addEventListener('DOMContentLoaded', () => game.init());
  </script>
</body>
</html>
```

### Behavioural checklist (the pasted file must satisfy every one)

- [ ] Page loads with no console errors; balls bounce inside the bordered field.
- [ ] Tapping/clicking an open cell starts an orange pulsing wall that grows in
      both directions along the current orientation until each head hits the
      boundary or a solid cell, then turns yellow (`WALL`).
- [ ] The `↕ Vertical walls` / `↔ Horizontal walls` button toggles orientation
      and updates its own label; right-click on the field and the spacebar also
      toggle; a right-click never builds a wall.
- [ ] Only one wall builds at a time — taps during a build are ignored.
- [ ] If a ball touches a still-building wall, the wall flashes red and vanishes,
      the canvas shakes (`kg-shake`), a life (❤️) is lost, and the wrong sound
      plays.
- [ ] When a wall completes, any sealed-off region with no ball turns teal
      (`FILLED`), the coverage meter rises, score increases by the captured cell
      count, and the cheer sound plays.
- [ ] The meter shows `NN% / TT%`; reaching the target clears the level
      (`Level N cleared! 🎉` banner for 1.5s, confetti), then the next level
      starts with one more ball and faster balls.
- [ ] Clearing level 5 shows the win overlay; `Play Again` restarts at level 1.
- [ ] Losing all 3 lives shows the lose overlay; `Try Again` restarts the **same**
      level with lives back to 3.
- [ ] Balls never tunnel through walls and never escape the field border.
- [ ] First tap unlocks audio (`game._ctx()` runs before any sound).
- [ ] Back button (`←`) calls `game.home()` → navigates to `../` (the games hub).

---
---

# TASK 2 — Add Jazz Ball to the games hub

**File to modify:** `/Users/brad-personal/Projects/kids-platform/public/games/index.html`

READ the current file completely before editing. Add exactly one card. Do **not**
touch any other card, the age-chip logic, or the `<script>`.

Insert this card **directly after the Block Blasters card**
(`<a href="blockblasters/" …>`) and before the Uno card:

```html
    <a href="jazzball/" class="card game-card">
      <span class="card-icon">🎱</span>
      <span class="card-title">Jazz Ball</span>
      <span class="card-desc">Trap the bouncing balls</span>
    </a>
```

Do not add `data-min`/`data-max` attributes — per the current hub convention
only Spelling is age-gated; every other game shows to all ages.

---
---

# Execution order

Complete each task fully before starting the next.

1. **Task 1** — `public/games/jazzball/index.html` (the whole game).
2. **Task 2** — add the hub card.

---

# Verification

```bash
cd /Users/brad-personal/Projects/kids-platform && node server.js &
curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" \
  http://localhost:3000/games/ \
  http://localhost:3000/games/jazzball/
```

Both must return `200`. Then open `http://localhost:3000/games/jazzball/` in a
browser with the console open (zero errors allowed) and confirm, by hand:

- Balls bounce inside the field; tapping builds a two-way wall that solidifies.
- The orientation button, right-click, and spacebar all toggle the wall axis.
- A ball hitting a building wall costs a life, shakes the canvas, and plays the
  wrong sound; a wall finishing on empty space captures it (teal) and the meter
  jumps.
- Reaching the target clears the level (banner + confetti) and adds a ball; the
  lose overlay retries the same level; clearing level 5 shows the win overlay.
- From the hub, the new 🎱 **Jazz Ball** card appears after Block Blasters and
  links to the running game.
