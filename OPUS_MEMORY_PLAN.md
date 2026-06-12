# Kids Platform — Opus Build Plan: Memory Pairs

You are building a card-matching memory game for a kids web platform. Read this entire document before writing a single line of code.

---

## Project location

`/Users/brad-personal/Projects/kids-platform/`

---

## ⚠️ CRITICAL RULES — read before anything else

These are the most common mistakes in code generation. Breaking any of these will cause the task to fail.

1. **No comments in code.** Not a single `//` comment or `/* */` block unless explaining a non-obvious algorithm.
2. **No framework, no build step.** Pure vanilla HTML/CSS/JS. No React, Vue, bundlers, or npm imports in the browser.
3. **No placeholder code.** Every function must be fully implemented. No `// TODO` or `// implement later`.
4. **Read files before writing.** For every task, READ the listed reference files first. Do not guess at class names or import paths.
5. **No helper abstractions.** Don't create a utility class or function unless it is called 3+ times.
6. **Cards are DOM buttons, not canvas.** Use `<button>` elements with `click` handlers — click fires reliably on both touch and mouse. Do not add separate touch listeners for the cards.
7. **Always call `game._ctx()`** on the first user gesture (the difficulty button tap) to unlock the Web Audio API before calling `game.sound()`.
8. **Use `100dvh`** not `100vh`.
9. **Each task is one file.** Don't create extra files. Don't modify files outside the task scope.
10. **Complete the entire file.** Never truncate. If the file is long, write it all.
11. **The grid must never scroll.** All cards must fit the viewport at every difficulty, portrait and landscape.

---

## Files to read before starting any task

```
/Users/brad-personal/Projects/kids-platform/public/games/_lib/KidsGame.js
/Users/brad-personal/Projects/kids-platform/public/games/_lib/confetti.js
/Users/brad-personal/Projects/kids-platform/public/css/kids.css
/Users/brad-personal/Projects/kids-platform/public/games/spelling/index.html
/Users/brad-personal/Projects/kids-platform/public/games/index.html
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
  home()                   // navigate to backUrl
  _ctx()                   // returns AudioContext; call on first user gesture
}
```

Import pattern:
```html
<script src="/games/_lib/confetti.js"></script>
<script src="/games/_lib/KidsGame.js"></script>
```

---

---

# TASK 1 — Memory Pairs game

**File to write:** `/Users/brad-personal/Projects/kids-platform/public/games/memory/index.html`

**Body background:** `linear-gradient(160deg, #667eea 0%, #764ba2 100%)`

Use the standard HTML shell (same as the spelling game): `nav-back` button, kids.css link, the two `_lib` scripts, then the game script. Class name: `MemoryGame extends KidsGame`.

### Concept

Cards lie face-down in a grid. The child taps cards to flip them over, two at a time. If the two cards match, they stay revealed. If not, they flip back. Points are awarded per pair based on how quickly the pair was found after the previous match. The game is won when all pairs are found — there is no lose state.

### Difficulty select screen (first screen)

Copy the mode-card pattern from the spelling game (`.mode-cards` grid of white cards). Three difficulties:

```js
const DIFFICULTIES = {
  easy:   { label: 'Easy',   icon: '🐣', pairs: 3, cols: 3 },
  medium: { label: 'Medium', icon: '🦊', pairs: 6, cols: 4 },
  hard:   { label: 'Hard',   icon: '🦁', pairs: 8, cols: 4 },
};
```

Each card shows icon, label, and a sub-line like "6 cards". Below each label, show the saved best score for that difficulty (from localStorage) as `Best: ⭐ 480`, or nothing if no best exists yet. Tapping a card calls `game._ctx()`, hides the select screen, shows the game screen, and starts a round.

### Emoji pool

```js
const EMOJI_POOL = ['🐶','🐱','🦊','🐸','🐵','🦄','🐢','🐠','🦋','🐝',
                    '🍎','🍌','🍓','🍕','🍦','🚀','🚗','⚽','🌈','⭐'];
```

Per round: shuffle the pool, take `pairs` emoji, duplicate each, then Fisher–Yates shuffle the combined deck:

```js
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

### Game screen layout (top → bottom)

```
[back btn]                          (standard .nav-back, returns to difficulty select, not /games/)
[header row: ⭐ score    |    ⏱ elapsed time]
[card grid — centered, fills remaining space]
```

The back button on the game screen returns to the difficulty select screen (show/hide the two screen divs); the back button on the difficulty select screen goes to `/games/`.

### Header

- Score: `⭐ 0`, font-weight 900, white, 20px — updates on every match.
- Timer: `⏱ 0:42` — total elapsed round time, updated by a 250ms `setInterval`. Format `m:ss`. Stop the interval on win and when leaving the game screen.

### Card grid sizing

```css
.grid {
  flex: 1; display: grid; gap: clamp(8px, 1.8vw, 14px);
  padding: 12px 16px 24px; width: 100%; max-width: 560px;
  align-content: center; justify-content: center; margin: 0 auto;
}
```

Set `grid-template-columns: repeat(COLS, 1fr)` from JS per difficulty. Each card uses `aspect-ratio: 3 / 4` and `max-height: calc((100dvh - 140px) / ROWS)` where ROWS = `Math.ceil(cardCount / cols)` — compute and set this via JS so the grid never overflows the viewport.

### Card markup and flip animation

Each card is a `<button class="mcard">` containing a 3D-flipping inner wrapper:

```html
<button class="mcard">
  <div class="mcard-inner">
    <div class="mcard-face mcard-back">?</div>
    <div class="mcard-face mcard-front">🐶</div>
  </div>
</button>
```

```css
.mcard { background: none; border: none; padding: 0; perspective: 600px; cursor: pointer; font-family: inherit; }
.mcard-inner {
  position: relative; width: 100%; height: 100%;
  transform-style: preserve-3d;
  transition: transform .4s cubic-bezier(.4, 1.4, .6, 1);
}
.mcard.flipped .mcard-inner { transform: rotateY(180deg); }
.mcard-face {
  position: absolute; inset: 0;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(0,0,0,.18);
}
.mcard-back {
  background: linear-gradient(145deg, #FF6B6B, #FB923C);
  color: rgba(255,255,255,.9);
  font-size: clamp(28px, 6vw, 44px); font-weight: 900;
}
.mcard-front {
  background: white;
  transform: rotateY(180deg);
  font-size: clamp(32px, 8vw, 56px);
}
.mcard.matched { pointer-events: none; }
.mcard.matched .mcard-inner { animation: matched-pop .45s cubic-bezier(.34,1.56,.64,1); }
.mcard.matched .mcard-front { box-shadow: 0 0 0 4px var(--green), 0 4px 14px rgba(0,0,0,.18); }
@keyframes matched-pop {
  0% { transform: rotateY(180deg) scale(1); }
  50% { transform: rotateY(180deg) scale(1.12); }
  100% { transform: rotateY(180deg) scale(1); }
}
```

### Tap state machine

```js
let firstCard = null;
let lock = false;

function onCardTap(card) {
  if (lock || card === firstCard || card.classList.contains('flipped')) return;
  this.sound('pop');
  card.classList.add('flipped');
  if (!firstCard) { firstCard = card; return; }
  lock = true;
  const a = firstCard, b = card;
  firstCard = null;
  if (a.dataset.emoji === b.dataset.emoji) {
    setTimeout(() => this.onMatch(a, b), 450);
  } else {
    setTimeout(() => {
      a.classList.remove('flipped');
      b.classList.remove('flipped');
      this.sound('wrong');
      lock = false;
    }, 900);
  }
}
```

Do NOT call `this.wrong(el)` on a mismatch (the shake reads as punishment) — play only the `'wrong'` sound. The 900ms mismatch delay is deliberate: it gives the child time to study both cards before they flip back.

### Scoring — time per pair

A per-pair stopwatch starts when the round begins and resets after every match. Faster finds earn more points, and a slow find still always earns something:

```js
function pairPoints(elapsedMs) {
  return Math.max(20, 100 - Math.floor(elapsedMs / 1000) * 5);
}
```

In `onMatch(a, b)`:
1. `const pts = pairPoints(Date.now() - this.pairStart);`
2. `this.pairStart = Date.now();`
3. `this.score += pts;` update the header score.
4. `this.correct(a.querySelector('.mcard-front')); this.correct(b.querySelector('.mcard-front'));`
5. Add `.matched` to both cards.
6. Show a floating `+pts` popup rising from card `b` (see below).
7. `lock = false;`
8. If all pairs are matched, call `endRound()` after a 600ms delay.

### Floating points popup

```js
function popPoints(card, pts) {
  const el = document.createElement('div');
  el.className = 'pts-pop';
  el.textContent = `+${pts}`;
  const r = card.getBoundingClientRect();
  el.style.left = (r.left + r.width / 2) + 'px';
  el.style.top = r.top + 'px';
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}
```

```css
.pts-pop {
  position: fixed; z-index: 600; transform: translateX(-50%);
  font-size: 28px; font-weight: 900; color: var(--yellow);
  text-shadow: 0 2px 8px rgba(0,0,0,.35);
  pointer-events: none;
  animation: pts-rise .9s ease-out forwards;
}
@keyframes pts-rise {
  from { opacity: 1; translate: 0 0; }
  to   { opacity: 0; translate: 0 -70px; }
}
```

### Round end

```js
function endRound() {
  clearInterval(this.clockTimer);
  const avg = this.score / this.cfg.pairs;
  const stars = avg >= 75 ? 3 : avg >= 45 ? 2 : 1;
  const key = `memory-best-${this.difficulty}`;
  const best = parseInt(localStorage.getItem(key) ?? '0');
  if (this.score > best) localStorage.setItem(key, String(this.score));
  this.showWin(stars, action => {
    if (action === 'again') this.startRound(this.difficulty);
  });
}
```

`showWin` already fires confetti and the cheer sound — do not call `celebrate()` separately. After `showWin`, also refresh the best-score lines on the difficulty select screen so a new best shows when the child goes back.

### Round start / reset

`startRound(difficulty)` must fully reset state: clear the grid DOM and rebuild it from a fresh shuffled deck, `score = 0`, `firstCard = null`, `lock = false`, `pairStart = Date.now()`, `roundStart = Date.now()`, restart the clock interval, update header to `⭐ 0` and `⏱ 0:00`.

Store each card's emoji in `dataset.emoji`. The face-up emoji must not be discoverable via accessibility shortcuts before flipping — that's fine at this fidelity; do not add `aria-label`s containing the emoji.

---

---

# TASK 2 — Add Memory to the games hub

**File to modify:** `/Users/brad-personal/Projects/kids-platform/public/games/index.html`

READ the current file before editing. Add ONE new card (an `<a>`, not a `<div>`, no `coming-soon` class) alongside the existing live game cards:

| Emoji | Title | Desc | Badge | Href |
|-------|-------|------|-------|------|
| 🧠 | Memory | Find the pairs | 4–7 yrs (`badge-all`) | /games/memory/ |

Do not change any other card.

---

---

# Execution order

1. Task 1 (Memory game)
2. Task 2 (hub card)

After both tasks, start the server and verify:

```bash
cd /Users/brad-personal/Projects/kids-platform && node server.js &
curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" \
  http://localhost:3000/games/ \
  http://localhost:3000/games/memory/
```

Both should return 200. Then open `/games/memory/` and verify by hand:

- Each difficulty renders its grid with no scrolling, portrait and landscape.
- Tapping two non-matching cards flips both back after ~0.9s; rapid tapping during that window does nothing.
- Tapping the same card twice does not count as a pair.
- A match keeps both cards face-up, pops `+points`, and updates the score.
- Finding the final pair shows the win overlay with stars; Play Again starts a clean round.
- Best score appears on the difficulty card after beating it.
- No console errors.
