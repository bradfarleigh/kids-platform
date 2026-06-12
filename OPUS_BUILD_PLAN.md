# Kids Platform — Opus Build Plan

You are building games for a kids web platform. Read this entire document before writing a single line of code.

---

## Project location

`/Users/brad-personal/Projects/kids-platform/`

---

## ⚠️ CRITICAL RULES — read before anything else

These are the most common mistakes in code generation. Breaking any of these will cause the task to fail.

1. **No comments in code.** Not a single `//` comment or `/* */` block unless explaining a non-obvious algorithm (e.g. the physics bounce formula). No "this function does X" comments.
2. **No framework, no build step.** Pure vanilla HTML/CSS/JS. No React, Vue, bundlers, or npm imports in the browser.
3. **No placeholder code.** Every function must be fully implemented. No `// TODO` or `// implement later`.
4. **Read files before writing.** For every task, READ the listed reference files first. Do not guess at class names or import paths.
5. **No helper abstractions.** Don't create a utility class or function unless it is called 3+ times.
6. **Touch AND mouse.** Every interactive canvas must handle both `touchstart/touchmove/touchend` AND `mousedown/mousemove/mouseup`.
7. **`e.preventDefault()` on all touch events** that would otherwise scroll. Pass `{ passive: false }` to addEventListener.
8. **Always call `game._ctx()`** on the first user gesture to unlock the Web Audio API before calling `game.sound()`.
9. **Use `100dvh`** not `100vh`.
10. **Canvas auto-sizing.** Never hardcode canvas dimensions. Always compute from `window.innerWidth` / `window.innerHeight` minus UI chrome.
11. **Each task is one file.** Don't create extra files. Don't modify files outside the task scope.
12. **Complete the entire file.** Never truncate. If the file is long, write it all.

---

## Files to read before starting any task

```
/Users/brad-personal/Projects/kids-platform/public/games/_lib/KidsGame.js
/Users/brad-personal/Projects/kids-platform/public/games/_lib/confetti.js
/Users/brad-personal/Projects/kids-platform/public/css/kids.css
/Users/brad-personal/Projects/kids-platform/public/games/spelling/index.html
/Users/brad-personal/Projects/kids-platform/public/games/coloring/index.html
```

---

## KidsGame API reference

```js
class KidsGame {
  constructor({ name: string, backUrl: string = '/games/' })

  // Override in subclass:
  init()   // called once — build DOM, attach events
  start()  // called to begin/reset gameplay

  // Call from your game:
  sound(name)              // 'pop' | 'correct' | 'wrong' | 'cheer' | 'click'
  correct(el?)             // green flash + correct sound on optional element
  wrong(el?)               // shake + wrong sound on optional element
  celebrate()              // confetti burst + cheer sound
  showWin(stars, onAction) // win overlay; stars = 1|2|3; onAction called with 'again'|'home'
  showLose(msg, onAction)  // lose overlay; onAction called with 'again'|'home'
  home()                   // navigate to backUrl
  _ctx()                   // returns AudioContext; call on first user gesture
}
```

Import pattern for every game:
```html
<script src="/games/_lib/confetti.js"></script>
<script src="/games/_lib/KidsGame.js"></script>
```

---

## Standard HTML shell (every game page)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>GAME NAME</title>
  <link rel="stylesheet" href="/css/kids.css">
  <style>
    body { background: GRADIENT; overflow: hidden; }
    /* game-specific styles only */
  </style>
</head>
<body>
  <button class="nav-back" onclick="location.href='/games/'">←</button>
  <!-- game content -->
  <script src="/games/_lib/confetti.js"></script>
  <script src="/games/_lib/KidsGame.js"></script>
  <script>
    /* game code */
  </script>
</body>
</html>
```

---

## CSS custom properties available from kids.css

```
--coral: #FF6B6B   --teal: #4ECDC4   --yellow: #FFE66D   --green: #6BCB77
--purple: #A78BFA  --orange: #FB923C  --dark: #1A202C     --mid: #4A5568
```

Available classes: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-success`, `.badge`, `.badge-4`, `.badge-6`, `.badge-all`, `.card`, `.nav-back`, `.page-title`, `.hidden`, `.anim-pop-in`, `.anim-bounce-in`, `.kg-shake`, `.tc0`–`.tc5` (tile colours)

---

---

# TASK 1 — Tetris game

**File to write:** `/Users/brad-personal/Projects/kids-platform/public/games/blocks/index.html`

**Body background:** `linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)`

### Layout

```
[back btn]
[info row: score | level | lines | [next-piece canvas]]
[game canvas — auto-sized, centered]
[control buttons: ◀  🔄  ▶  ⬇️]
```

### Canvas sizing

```js
const COLS = 10, ROWS = 20;
const headerH = 80;   // info row + padding
const controlH = 90;  // buttons + padding
const availH = window.innerHeight - headerH - controlH;
const availW = window.innerWidth * 0.65;
const CELL = Math.max(22, Math.min(Math.floor(availH / ROWS), Math.floor(availW / COLS)));
canvas.width = COLS * CELL;
canvas.height = ROWS * CELL;
```

### Piece definitions

```js
const PIECES = [
  { color: '#4ECDC4', cells: [[0,0],[1,0],[2,0],[3,0]] }, // I
  { color: '#FFE66D', cells: [[0,0],[1,0],[0,1],[1,1]] }, // O
  { color: '#A78BFA', cells: [[0,0],[1,0],[2,0],[1,1]] }, // T
  { color: '#6BCB77', cells: [[1,0],[2,0],[0,1],[1,1]] }, // S
  { color: '#FF6B6B', cells: [[0,0],[1,0],[1,1],[2,1]] }, // Z
  { color: '#7DD3FC', cells: [[0,0],[0,1],[1,1],[2,1]] }, // J
  { color: '#FB923C', cells: [[2,0],[0,1],[1,1],[2,1]] }, // L
];
```

### Clockwise rotation algorithm

```js
function rotateCW(cells) {
  const maxR = Math.max(...cells.map(([,r]) => r));
  const rot = cells.map(([c,r]) => [maxR - r, c]);
  const minC = Math.min(...rot.map(([c]) => c));
  const minR = Math.min(...rot.map(([,r]) => r));
  return rot.map(([c,r]) => [c - minC, r - minR]);
}
```

### Collision detection

```js
function collides(cells, x, y) {
  return cells.some(([c,r]) => {
    const nc = x + c, nr = y + r;
    return nc < 0 || nc >= COLS || nr >= ROWS || (nr >= 0 && board[nr][nc]);
  });
}
```

### Game requirements

- Board is a 2D array: `board[row][col]` = color string or `null`
- Drop speed: `Math.max(100, 900 - (level-1)*80)` ms per tick, via `setInterval`
- Use `requestAnimationFrame` for rendering (separate from the tick interval)
- Ghost piece: find lowest Y where piece can land, draw at 20% opacity
- Lock piece when it can't move down: copy cells into board, call `clearLines()`, spawn next
- `clearLines()`: scan bottom-up, remove full rows, unshift empty rows; return count
- Scoring: `[0, 100, 300, 500, 800][linesCleared] * level`
- Level up every 10 lines; call `startDropTimer()` to reset interval at new speed
- Game over when spawn position immediately collides: call `this.showLose('Game Over! 😢', cb)`
- On restart (cb = 'again'): reset board, score, level, lines; re-spawn
- Call `this.celebrate()` when clearing 4 lines at once (Tetris!)
- Draw cells with top-left highlight (`rgba(255,255,255,0.3)` strip) and bottom-right shadow (`rgba(0,0,0,0.3)` strip) for 3D look
- Draw grid lines on canvas: `rgba(255,255,255,0.04)`
- Next piece preview: render on a separate `<canvas id="next-canvas">` sized 4×CELL × 4×CELL, centred

### Controls

Buttons: `◀` (left), `🔄` (rotate CW), `▶` (right), `⬇️` (soft drop — moves down 1 row per press).

Use `touchstart` (with `preventDefault`) for instant response. Implement auto-repeat on left/right:

```js
let repeatTimer = null;
function startRepeat(fn) {
  fn();
  repeatTimer = setInterval(fn, 110);
}
function stopRepeat() { clearInterval(repeatTimer); repeatTimer = null; }

btnLeft.addEventListener('touchstart',  e => { e.preventDefault(); startRepeat(moveLeft); }, {passive:false});
btnLeft.addEventListener('touchend',    stopRepeat);
btnLeft.addEventListener('touchcancel', stopRepeat);
// same pattern for btnRight
```

Rotate and drop buttons just use `touchstart` with `preventDefault`, no repeat.

Also attach `mousedown`/`mouseup`/`mouseleave` equivalents for desktop testing.

### Start screen

Show a centred overlay on the canvas before the game starts:
```html
<div id="start-screen" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);border-radius:8px">
  <div style="text-align:center;color:white">
    <div style="font-size:60px">🧱</div>
    <h2 style="font-size:36px;font-weight:900;margin:8px 0 24px">Blocks</h2>
    <button id="start-btn" class="btn btn-primary" style="width:160px">Play ▶</button>
  </div>
</div>
```

Remove the overlay on start button tap, then call `game.start()`.

---

---

# TASK 2 — Block Blasters (Breakout/Arkanoid clone)

**File to write:** `/Users/brad-personal/Projects/kids-platform/public/games/blockblasters/index.html`

**Body background:** `linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)`

### Canvas sizing

Canvas fills the full viewport minus a 60px header bar:
```js
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight - 60;
```

### Game objects

```js
const BALL_R = 10;
const PADDLE_H = 14;
const PADDLE_W = Math.min(120, canvas.width * 0.2);

let ball    = { x: canvas.width/2, y: canvas.height - 80, vx: 3, vy: -4 };
let paddle  = { x: canvas.width/2 - PADDLE_W/2, y: canvas.height - 30, w: PADDLE_W, h: PADDLE_H };
let blocks  = [];  // { x, y, w, h, color, hits, maxHits }
let lives   = 3;
let score   = 0;
let level   = 1;
let launching = true;  // ball stuck to paddle before launch
```

### Block grid generation

```js
const BLOCK_ROWS_PER_LEVEL = [4, 5, 6, 7, 8];
const BLOCK_COLS = 10;
const BLOCK_H = 22;
const BLOCK_GAP = 4;
const BLOCK_W = Math.floor((canvas.width - (BLOCK_COLS+1)*BLOCK_GAP) / BLOCK_COLS);
const ROW_COLORS = ['#FFE66D','#FB923C','#FF6B6B','#F9A8D4','#A78BFA','#4ECDC4','#6BCB77','#7DD3FC'];

function buildBlocks(lvl) {
  const rows = BLOCK_ROWS_PER_LEVEL[Math.min(lvl-1, 4)];
  const blocks = [];
  for (let r = 0; r < rows; r++) {
    const maxHits = lvl >= 3 && r < 2 ? 2 : 1;
    for (let c = 0; c < BLOCK_COLS; c++) {
      blocks.push({
        x: BLOCK_GAP + c * (BLOCK_W + BLOCK_GAP),
        y: 70 + r * (BLOCK_H + BLOCK_GAP),
        w: BLOCK_W, h: BLOCK_H,
        color: ROW_COLORS[r % ROW_COLORS.length],
        hits: maxHits, maxHits,
      });
    }
  }
  return blocks;
}
```

### Ball physics

Ball bounces off walls (left, right, top). Angle on paddle hit is based on impact position:

```js
function hitPaddle() {
  const hitPos = (ball.x - paddle.x) / paddle.w;      // 0.0 (left) → 1.0 (right)
  const angle  = (hitPos - 0.5) * (Math.PI * 0.75);   // -67.5° to +67.5°
  const speed  = Math.sqrt(ball.vx**2 + ball.vy**2);
  ball.vx = speed * Math.sin(angle);
  ball.vy = -Math.abs(speed * Math.cos(angle));        // always upward
  ball.y  = paddle.y - BALL_R;
}
```

Block collision: use circle-rect nearest-point test:
```js
function circleRect(ball, rect) {
  const nx = Math.max(rect.x, Math.min(ball.x, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(ball.y, rect.y + rect.h));
  return (ball.x-nx)**2 + (ball.y-ny)**2 <= BALL_R**2;
}
```

When block is hit:
- Determine bounce direction: if overlap is more horizontal → flip `vx`, else flip `vy`
- Decrement `block.hits`; remove from array when 0
- Add score; call `game.sound('pop')`
- Only process ONE block collision per frame

### Ball speed per level

```js
const BASE_SPEED = [4.5, 5, 5.5, 6, 6.5];
```

On level start, normalise ball velocity to the level's speed.

### Controls

Paddle follows finger/mouse across the full canvas width:

```js
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  const tx = (e.touches[0].clientX - r.left) * (canvas.width / r.width);
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, tx - paddle.w/2));
}, { passive: false });

canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.w,
    (e.clientX - r.left) * (canvas.width / r.width) - paddle.w/2));
});
```

Tap/click launches the ball when `launching = true`.

### Drawing

- Canvas background: `#0a0a1a`
- Grid lines: very faint (`rgba(255,255,255,0.03)`)
- Blocks: filled with `block.color`; if `maxHits > 1` and `hits === 1`, draw a diagonal crack line across the block
- Blocks with 2 hits: slightly darker shade on top half for depth
- Paddle: white rounded rectangle with a radial gradient (lighter in centre)
- Ball: white circle with a `shadowBlur` glow (`shadowColor = '#fff', shadowBlur = 12`)
- Lives: `❤️` icons top-right
- Score: top-left
- Level: top-centre

### Level complete / game over

- When `blocks.length === 0`: brief overlay "Level {n} ✓ 🎉", then `level++`, rebuild blocks, reset ball
- After level 5 complete: `this.showWin(3, cb)` + `this.celebrate()`
- When `lives === 0`: `this.showLose('Game Over! 💥', cb)`
- On restart: reset everything to level 1

### Launch state

When `launching = true`, the ball sits on top of the paddle. On each frame, set `ball.x = paddle.x + paddle.w/2` and `ball.y = paddle.y - BALL_R - 1`. Show "Tap to launch! 👆" text. On tap/click, set `launching = false` and give ball initial velocity at a slight random angle.

---

---

# TASK 3 — Uno card game

**File to write:** `/Users/brad-personal/Projects/kids-platform/public/games/uno/index.html`

**Body background:** `linear-gradient(160deg, #2d1b69 0%, #11998e 100%)`

### Deck

108 cards:
- Per colour (red, blue, green, yellow): one `0`; two each of `1`–`9`; two `skip`; two `reverse`; two `draw2` → 25 per colour × 4 = 100
- 4 × `wild`, 4 × `wild-draw4` → 8
- Card object: `{ color: 'red'|'blue'|'green'|'yellow'|'wild', value: string }`
- When draw pile empties: take all discard cards except the top one, shuffle, use as new draw pile

### Can-play rule

```js
function canPlay(card, topCard, currentColor) {
  if (card.color === 'wild') return true;
  if (card.color === currentColor) return true;
  if (card.value === topCard.value) return true;
  return false;
}
```

### Game state

```js
let deck, discard, playerHand, cpuHand, currentColor, turn, gameOver;
```

### Page layout (top → bottom)

```
[CPU area: face-down cards + card count badge]
[Game centre: deck pile | discard pile + color indicator | toast messages]
[UNO banner — shown when either player has 1 card]
[Player hand: scrollable row of face-up cards]
```

### Card HTML/CSS

Each card is a `<div>` with classes `card` + `red|blue|green|yellow|wild`:
- Size: `68px × 100px`, `border-radius: 12px`, `border: 3px solid rgba(255,255,255,0.8)`
- Colour backgrounds: red `#E53935`, blue `#1E88E5`, green `#43A047`, yellow `#FDD835`
- Wild: `background: conic-gradient(#E53935 0deg 90deg, #1E88E5 90deg 180deg, #43A047 180deg 270deg, #FDD835 270deg)`
- Value display: large centred text (number, or symbol: `⊘` skip, `↺` reverse, `+2`, `W`, `+4`)
- Face-down cards: deep blue `#1a237e` with small `UNO` text

Valid cards in player's hand: `transform: translateY(-12px)` on hover/focus, pointer cursor.
Invalid cards: `opacity: 0.4`, `cursor: not-allowed`.

### CPU AI

1. Wait 1200ms
2. Find playable cards. If none: draw one card; if still can't play, pass turn.
3. Choose: prefer action cards; otherwise first playable.
4. For wilds: choose colour with the most cards in CPU hand (or random if tied).
5. Play the card: animate it to discard pile (CSS transition), apply its effect.

### Action card effects

Apply immediately after card is played:
- `skip`: other player loses next turn
- `reverse`: with 2 players = skip (other player loses turn)
- `draw2`: other player draws 2 cards AND loses turn
- `wild`: player who played it chooses colour (show colour picker for human, AI picks automatically)
- `wild-draw4`: other player draws 4 AND loses turn; player who played chooses colour

### Colour picker (shown when human plays wild/wild-draw4)

Full-screen translucent overlay with 4 large buttons:
```html
<div class="color-picker-overlay">
  <div class="cp-title">Choose a colour</div>
  <div class="cp-grid">
    <button class="cp-btn" data-color="red"    style="background:#E53935">🔴 Red</button>
    <button class="cp-btn" data-color="blue"   style="background:#1E88E5">🔵 Blue</button>
    <button class="cp-btn" data-color="green"  style="background:#43A047">🟢 Green</button>
    <button class="cp-btn" data-color="yellow" style="background:#FDD835;color:#333">🟡 Yellow</button>
  </div>
</div>
```

Use a Promise to await the selection.

### Colour indicator

A coloured circle above/beside the discard pile that always shows `currentColor`. Update its background on every colour change.

### Toast messages

Brief (1.5s) sliding message at the top of the game centre:
- "CPU plays Skip! 🚫"
- "You draw 2 cards! 😬"
- "UNO! 🎉" (persistent until hand size ≠ 1)

### Win/lose

- Player empties hand: `this.showWin(3, cb)` + `this.celebrate()`
- CPU empties hand: `this.showLose('CPU wins! 🤖', cb)`

### UNO banner

When either player reaches exactly 1 card:
```html
<div id="uno-banner" class="hidden">UNO! 🎉</div>
```
Show with large text, bright yellow, pulsing animation. Hide when hand size changes away from 1.

---

---

# TASK 4 — Letter & Number Tracing game

**File to write:** `/Users/brad-personal/Projects/kids-platform/public/games/tracing/index.html`

**Body background:** `linear-gradient(160deg, #a18cd1 0%, #fbc2eb 100%)`

### Purpose

Child traces letters (A-Z) or numbers (0-9) with their finger on a canvas overlay. Designed for 4-year-olds.

### Mode selection (first screen)

Three big cards:
- `🔤 Letters` — A-Z uppercase
- `🔢 Numbers` — 0-9
- `🎲 Mix` — random from both

### Game flow

5 characters per session. For each character:
1. Show the character as a large grey guide on a background canvas
2. Child draws on a transparent overlay canvas with their finger
3. System measures how much of the letter has been covered by the stroke
4. At 70% coverage: celebrate, show ✓, auto-advance after 900ms
5. A `Clear ✏️` button lets the child erase and retry

### Canvas setup

Two stacked canvases in a container:
```html
<div class="trace-area" style="position:relative; width:260px; height:260px">
  <canvas id="guide-canvas" width="260" height="260"
          style="position:absolute;top:0;left:0;border-radius:20px;background:white;box-shadow:0 8px 32px rgba(0,0,0,.12)"></canvas>
  <canvas id="draw-canvas"  width="260" height="260"
          style="position:absolute;top:0;left:0;border-radius:20px;background:transparent"></canvas>
</div>
```

Both canvases are **260×260px** (fixed — do not use window dimensions here, the letter map depends on pixel positions matching).

### Drawing the guide letter

```js
function drawGuide(char) {
  const ctx = guideCanvas.getContext('2d');
  ctx.clearRect(0, 0, 260, 260);
  ctx.font = '900 190px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#E8E8E8';
  ctx.fillText(char, 130, 130);
  ctx.strokeStyle = '#D0D0D0';
  ctx.lineWidth = 3;
  ctx.strokeText(char, 130, 130);
}
```

### Building the letter pixel map

Call this AFTER `drawGuide()` so the offscreen canvas uses identical font/size/position:

```js
function buildLetterMap(char) {
  const oc = document.createElement('canvas');
  oc.width = 260; oc.height = 260;
  const octx = oc.getContext('2d');
  octx.font = '900 190px Arial, sans-serif';
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';
  octx.fillStyle = '#000';
  octx.fillText(char, 130, 130);

  const data = octx.getImageData(0, 0, 260, 260).data;
  const GRID = 8;
  const letterCells = new Set();

  for (let gy = 0; gy < Math.ceil(260/GRID); gy++) {
    for (let gx = 0; gx < Math.ceil(260/GRID); gx++) {
      let found = false;
      for (let dy = 0; dy < GRID && !found; dy++) {
        for (let dx = 0; dx < GRID && !found; dx++) {
          const px = gx*GRID + dx, py = gy*GRID + dy;
          if (px < 260 && py < 260 && data[(py*260+px)*4+3] > 60) found = true;
        }
      }
      if (found) letterCells.add(`${gx},${gy}`);
    }
  }
  return letterCells;
}
```

### Drawing strokes

```js
let drawing = false, lastX = null, lastY = null;
const strokeColor = '#FF6B6B';
const drawCtx = drawCanvas.getContext('2d');
drawCtx.lineWidth = 22;
drawCtx.lineCap = 'round';
drawCtx.lineJoin = 'round';
drawCtx.strokeStyle = strokeColor;

function onMove(x, y) {
  if (!drawing) return;
  drawCtx.beginPath();
  drawCtx.moveTo(lastX ?? x, lastY ?? y);
  drawCtx.lineTo(x, y);
  drawCtx.stroke();
  lastX = x; lastY = y;
  checkCoverage(x, y);
}
```

For touch events, compute canvas-relative coordinates:
```js
function canvasXY(e) {
  const r = drawCanvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return [
    (t.clientX - r.left) * (260 / r.width),
    (t.clientY - r.top)  * (260 / r.height),
  ];
}
```

### Coverage checking

```js
const GRID = 8;
let coveredCells = new Set();
let letterCells  = new Set(); // built by buildLetterMap()
let clears = 0;               // how many times Clear was pressed this character

function checkCoverage(x, y) {
  const gx = Math.floor(x / GRID);
  const gy = Math.floor(y / GRID);
  let newCells = false;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const key = `${gx+dc},${gy+dr}`;
      if (letterCells.has(key) && !coveredCells.has(key)) {
        coveredCells.add(key);
        newCells = true;
      }
    }
  }
  if (newCells) {
    game.sound('pop');
    updateProgress();
  }
  if (coveredCells.size / letterCells.size >= 0.70) onCharComplete();
}

function updateProgress() {
  const pct = Math.min(1, coveredCells.size / letterCells.size);
  progressBar.style.width = (pct * 100) + '%';
}
```

### On character complete

```js
function onCharComplete() {
  game.sound('correct');
  // Show ✓ flash overlay briefly
  setTimeout(() => {
    wordIndex++;
    if (wordIndex >= session.length) {
      const stars = clears === 0 ? 3 : clears <= 2 ? 2 : 1;
      game.showWin(stars, cb => { if (cb === 'again') startGame(currentMode); });
    } else {
      loadChar(session[wordIndex]);
    }
  }, 900);
}
```

### Progress bar

Below the trace area, a pill-shaped progress bar, 220px wide, fills with `var(--green)`.

### Clear button

Clears the draw canvas; resets `coveredCells`; increments `clears`:
```js
clearBtn.onclick = () => {
  drawCtx.clearRect(0, 0, 260, 260);
  coveredCells = new Set();
  clears++;
  updateProgress();
  game.sound('click');
};
```

### Character sets

```js
const LETTERS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS  = '0123456789'.split('');
```

Pick 5 random (no repeats) per session. Shuffle using Fisher-Yates.

### Stars

After 5 characters: total `clears` across all 5.
- 0–1 clears: 3 stars
- 2–4 clears: 2 stars
- 5+ clears: 1 star

---

---

# TASK 5 — Update spelling game for ages 4 and 6

**File to modify:** `/Users/brad-personal/Projects/kids-platform/public/games/spelling/index.html`

READ this file completely before touching it.

### Changes required

**Easy mode (4-year-old):** Replace the word-spelling mechanic entirely.

New Easy mode: "Letters & Numbers" — identical to the Tracing game (Task 4) but embedded directly here as the Easy mode. The child traces 5 characters per game. Use the same canvas-tracing approach from Task 4.

Mode select screen — update the Easy card:
```
🐣 Easy
"Letters & Numbers"
Ages 4+  •  Trace letters & numbers
```

Easy gameplay = full Tracing game implementation inline (no separate import needed — duplicate the tracing logic inside this file for the Easy mode state).

**Medium mode (6-year-old):** Keep the existing word-spelling mechanic exactly as-is. Do not change a single line of the Medium mode.

**Mode select screen:** Update only the Easy card label and description. Keep the Medium card unchanged.

---

---

# TASK 6 — Update games hub

**File to modify:** `/Users/brad-personal/Projects/kids-platform/public/games/index.html`

READ the current file before editing.

Replace all game cards with working links (no "coming soon" tags). Final cards:

| Emoji | Title | Desc | Badge | Href |
|-------|-------|------|-------|------|
| 📝 | Spelling | Letters & words | 4–7 yrs | /games/spelling/ |
| ✏️ | Tracing | Trace letters & numbers | 4+ yrs | /games/tracing/ |
| 🎨 | Colouring | Paint & draw | 4+ yrs | /games/coloring/ |
| 🧱 | Blocks | Classic Tetris | 6+ yrs | /games/blocks/ |
| 🎮 | Block Blasters | Break the blocks! | 5+ yrs | /games/blockblasters/ |
| 🃏 | Uno | Card game | 6+ yrs | /games/uno/ |

Grid: `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`

Remove ALL `.coming-soon` classes and the `.coming-tag` elements. Every card is a `<a>` not a `<div>`.

---

---

# Execution order

Do the tasks in this order. Complete each one fully before starting the next.

1. Task 6 (games hub update) — easiest, confirms the structure
2. Task 1 (Tetris)
3. Task 2 (Block Blasters)
4. Task 4 (Tracing game)
5. Task 5 (Spelling update)
6. Task 3 (Uno) — most complex, do last

After all tasks, start the server and verify each game loads without console errors:
```bash
cd /Users/brad-personal/Projects/kids-platform && node server.js &
curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" \
  http://localhost:3000/games/ \
  http://localhost:3000/games/blocks/ \
  http://localhost:3000/games/blockblasters/ \
  http://localhost:3000/games/tracing/ \
  http://localhost:3000/games/spelling/ \
  http://localhost:3000/games/uno/
```

All should return 200.
