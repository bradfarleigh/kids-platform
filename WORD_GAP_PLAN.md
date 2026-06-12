# Kids Platform — Word Gap Build Plan

A new game: **Word Gap** (missing-letter game). A word is shown with one gap. The child sees a few letter (or letter-sound) tiles and taps the one that fills the gap. Three difficulty levels, including a phonics level built around the digraph sounds **SH, TH, CH, OO**.

Read this entire document before writing a single line of code.

---

## ⚠️ CRITICAL RULES

Same rules as `OPUS_BUILD_PLAN.md`. The most important ones:

1. **No comments in code** unless explaining a non-obvious algorithm.
2. **No framework, no build step.** Pure vanilla HTML/CSS/JS.
3. **No placeholder code.** Every function fully implemented.
4. **Read files before writing.** Do not guess at class names or APIs.
5. **Touch AND mouse** on every interactive element.
6. **Call `game._ctx()`** on the first user gesture to unlock Web Audio before `game.sound()`.
7. **Use `100dvh`** not `100vh`.
8. **Each task is one file.** Don't create extra files.

---

## Files to read before starting

```
public/games/_lib/KidsGame.js
public/games/_lib/confetti.js
public/css/kids.css
public/games/spelling/index.html   ← closest existing game; reuse its patterns
public/games/index.html            ← hub page (Task 2)
```

The spelling game already has the mode-select screen, progress dots, score header, slot/tile styling, hint behaviour, and win-flow patterns this game needs. Reuse those patterns rather than inventing new ones.

---

# TASK 1 — Word Gap game

**File to write:** `public/games/wordgap/index.html`

**Body background:** `linear-gradient(160deg, #fddb92 0%, #d1fdff 100%)`

## Game concept

Each round shows:

```
[back btn]
[progress dots          ⭐ score]

        🐱   (emoji hint — tap to hear the word)

      C  _  T   (word tiles, one dashed gap slot)

     [ A ] [ O ] [ E ]   (choice tiles — tap the right one)

        💡 Hint
```

Tap the correct choice → it flies into the gap, the slot turns green, pop sound, short 🎉 flash, next word. Tap a wrong choice → shake + wrong sound. 5 words per round, then the `showWin` overlay with stars.

## Level select screen (first screen)

Identical pattern to the spelling game's mode select. Three cards:

| Card | Icon | Label | Sub |
|------|------|-------|-----|
| `data-level="easy"` | 🐣 | Easy | Ages 4+ • First letter |
| `data-level="medium"` | 🦁 | Medium | Ages 5+ • Any letter |
| `data-level="sounds"` | 🦉 | Sounds | Ages 6+ • sh th ch oo |

Cards use the spelling game's `.mode-card` styling with border-top colours: easy `#6BCB77`, medium `#FB923C`, sounds `#A78BFA`.

The back button behaves like the spelling game's: in-game it returns to level select; on level select it goes home.

## Data model

Every word is stored as three segments so the gap is unambiguous (even when a letter or digraph appears twice in the word):

```js
{ pre: 'FI', ans: 'SH', post: '', e: '🐟' }
```

The displayed word is `pre + ans + post`; the gap covers `ans`. For easy/medium levels `ans` is a single letter; for the sounds level `ans` is one of `SH`, `TH`, `CH`, `OO`.

## Word banks

```js
const BANK = {
  easy: [
    { pre:'', ans:'C', post:'AT', e:'🐱' }, { pre:'', ans:'D', post:'OG', e:'🐶' },
    { pre:'', ans:'B', post:'US', e:'🚌' }, { pre:'', ans:'S', post:'UN', e:'☀️' },
    { pre:'', ans:'H', post:'AT', e:'🎩' }, { pre:'', ans:'C', post:'UP', e:'☕' },
    { pre:'', ans:'C', post:'OW', e:'🐮' }, { pre:'', ans:'P', post:'IG', e:'🐷' },
    { pre:'', ans:'H', post:'EN', e:'🐔' }, { pre:'', ans:'E', post:'GG', e:'🥚' },
    { pre:'', ans:'B', post:'ED', e:'🛏️' }, { pre:'', ans:'C', post:'AR', e:'🚗' },
    { pre:'', ans:'B', post:'OX', e:'📦' }, { pre:'', ans:'F', post:'OX', e:'🦊' },
    { pre:'', ans:'O', post:'WL', e:'🦉' }, { pre:'', ans:'J', post:'AM', e:'🫙' },
    { pre:'', ans:'A', post:'NT', e:'🐜' }, { pre:'', ans:'B', post:'AG', e:'👜' },
  ],
  medium: [
    { pre:'A',    ans:'P', post:'PLE', e:'🍎' }, { pre:'BR',   ans:'EA', post:'D', e:'🍞' },
    { pre:'FR',   ans:'O', post:'G',   e:'🐸' }, { pre:'H',    ans:'OR', post:'SE', e:'🐴' },
    { pre:'HOU',  ans:'S', post:'E',   e:'🏠' }, { pre:'LEM',  ans:'O', post:'N',  e:'🍋' },
    { pre:'PL',   ans:'A', post:'NE',  e:'✈️' }, { pre:'ROB',  ans:'O', post:'T',  e:'🤖' },
    { pre:'SN',   ans:'A', post:'KE',  e:'🐍' }, { pre:'TIG',  ans:'E', post:'R',  e:'🐯' },
    { pre:'TR',   ans:'A', post:'IN',  e:'🚂' }, { pre:'WH',   ans:'A', post:'LE', e:'🐋' },
    { pre:'PIZZ', ans:'A', post:'',    e:'🍕' }, { pre:'QU',   ans:'E', post:'EN', e:'👸' },
    { pre:'CL',   ans:'O', post:'CK',  e:'🕐' }, { pre:'GR',   ans:'A', post:'SS', e:'🌿' },
  ],
  sounds: [
    { pre:'',    ans:'SH', post:'IP',  e:'🚢' }, { pre:'FI',  ans:'SH', post:'',   e:'🐟' },
    { pre:'',    ans:'SH', post:'EEP', e:'🐑' }, { pre:'',    ans:'SH', post:'ELL',e:'🐚' },
    { pre:'',    ans:'SH', post:'ARK', e:'🦈' }, { pre:'',    ans:'SH', post:'IRT',e:'👕' },
    { pre:'',    ans:'TH', post:'REE', e:'3️⃣' }, { pre:'BA',  ans:'TH', post:'',   e:'🛁' },
    { pre:'MOU', ans:'TH', post:'',    e:'👄' }, { pre:'EAR', ans:'TH', post:'',   e:'🌍' },
    { pre:'TOO', ans:'TH', post:'',    e:'🦷' }, { pre:'',    ans:'CH', post:'AIR',e:'🪑' },
    { pre:'',    ans:'CH', post:'EESE',e:'🧀' }, { pre:'',    ans:'CH', post:'ICK',e:'🐤' },
    { pre:'',    ans:'CH', post:'ERRY',e:'🍒' }, { pre:'BEA', ans:'CH', post:'',   e:'🏖️' },
    { pre:'PEA', ans:'CH', post:'',    e:'🍑' }, { pre:'M',   ans:'OO', post:'N',  e:'🌙' },
    { pre:'B',   ans:'OO', post:'K',   e:'📖' }, { pre:'F',   ans:'OO', post:'T',  e:'🦶' },
    { pre:'SP',  ans:'OO', post:'N',   e:'🥄' }, { pre:'BR',  ans:'OO', post:'M',  e:'🧹' },
  ],
};

const WORDS_PER_GAME = 5;
const DIGRAPHS = ['SH', 'TH', 'CH', 'OO'];
```

Medium-level note: a few medium answers are two letters (`EA`, `OR`) — the gap mechanic handles any `ans` length, so nothing special is needed; this gently introduces multi-letter sounds before the sounds level.

## Choice tile generation

- **Easy:** 3 choices — the answer + 2 distractor letters.
- **Medium:** 4 choices — the answer + 3 distractors of the **same length** as the answer (single letters for single-letter answers; for `EA`/`OR` style answers pick from `['EA','OR','AI','OU','EE','OA']`).
- **Sounds:** always the 4 digraphs `SH TH CH OO`, shuffled. (The answer is always one of them, and the child learns to discriminate the four sounds.)

Distractor rules for easy/medium single letters:

```js
function makeDistractors(word, count) {
  const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const out = [];
  while (out.length < count) {
    const c = pool[Math.floor(Math.random() * pool.length)];
    if (c === word.ans) continue;
    if (out.includes(c)) continue;
    if (VALID_WORDS.has(word.pre + c + word.post)) continue;
    out.push(c);
  }
  return out;
}
```

`VALID_WORDS` is a `Set` of every full word in all three banks **plus** this ambiguity list, so a distractor can never also form a real word (e.g. `C_T` must not offer both `A` and `U`):

```js
const EXTRA_WORDS = ['CUT','COT','BAT','RAT','MAT','SAT','FAT','PAT','BIG','DIG',
  'WIG','PEN','TEN','MEN','BUN','RUN','FUN','GUN','HOG','LOG','FOG','JOG','MAP',
  'CAP','TAP','LAP','POT','HOT','DOT','NOT','BEE','SEE','PET','SET','WET','GET',
  'PAN','CAN','MAN','FAN','VAN','BOG','BUG','RUG','MUG','HUT','NUT','BUT','SIT',
  'HIT','BIT','FIT','PIT','KIT','BAD','DAD','SAD','MAD','PAD','HAD','LID','KID'];
```

Shuffle answer + distractors together (Fisher-Yates, same `shuffle()` as the spelling game) and render as `.tile tc0`–`tc5` buttons like the spelling game.

## Word rendering

Render the word as a row of slots (reuse `.slot` styling from the spelling game):

- Letters from `pre` and `post`: solid white tiles showing the letter, `background: rgba(255,255,255,.85)`, dark text.
- The gap: one **wider** dashed slot (for digraphs it must fit 2 characters: width `clamp(64px, 12vw, 100px)` when `ans.length === 2`, normal slot width otherwise), empty until answered.

On a correct answer the gap slot gets the answer text, `.filled` styling (green, slight scale-up), and all choice tiles disable.

## Speech (word audio)

Tapping the emoji (or an explicit `🔊` button next to it) speaks the word using the Web Speech API — no audio files:

```js
function sayWord() {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance((word.pre + word.ans + word.post).toLowerCase());
  u.rate = 0.8;
  u.pitch = 1.1;
  speechSynthesis.speak(u);
}
```

Also call `sayWord()` automatically 400ms after each new word renders, and again on a correct answer. Wrap in the feature check so it degrades silently. This matters most in the sounds level, where hearing "fish" is the whole point of choosing `SH`.

## Gameplay rules

- 5 words per round, drawn with `shuffle([...BANK[level]]).slice(0, WORDS_PER_GAME)`.
- First tap anywhere calls `game._ctx()` to unlock audio.
- Correct tap: `game.sound('pop')`, fill the gap, brief full-screen 🎉 flash (reuse `.word-done-flash`), `game.sound('cheer')`, advance after 900ms.
- Wrong tap: `game.wrong(tile)`, increment `totalMistakes` and `wrongOnWord`.
- After 2 wrong taps on the same word, auto-hint: add `.kg-hint` to the correct tile (same as spelling). A `💡 Hint` button does the same on demand.
- Score: `Math.max(10, 30 - totalMistakes * 5)` points per word, shown in the header.
- Progress dots across the top, same as spelling.
- After 5 words: stars = `totalMistakes <= 2 ? 3 : totalMistakes <= 5 ? 2 : 1`, then `game.showWin(stars, cb)`; `'again'` restarts the same level (new random words).

## Class structure

```js
class WordGapGame extends KidsGame {
  init() { /* wire level cards, hint button, back button */ }
}
document.addEventListener('DOMContentLoaded', () => {
  game = new WordGapGame({ name: 'Word Gap' });
  game.init();
});
```

Follow the spelling game's screen-switching approach (`#screen-mode` / `#screen-game` with `display` toggling) and its overall file layout.

---

# TASK 2 — Add Word Gap to the games hub

**File to modify:** `public/games/index.html`

READ the current file before editing. Add one card to the grid (after Spelling), as a working `<a>` link — no `coming-soon` class:

```html
<a href="/games/wordgap/" class="card game-card">
  <span class="card-icon">🔤</span>
  <span class="card-title">Word Gap</span>
  <span class="card-desc">Find the missing letter</span>
  <span class="badge badge-all">4 – 7 yrs</span>
</a>
```

Do not touch the other cards.

---

# Execution order

1. Task 1 (the game)
2. Task 2 (hub card)

After both tasks, verify:

```bash
node server.js &
curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" \
  http://localhost:3000/games/ \
  http://localhost:3000/games/wordgap/
```

Both should return 200, and the game should load with no console errors. Manually check: each of the three levels plays through 5 words; a digraph gap slot is wide enough for two characters; wrong answers shake; the win overlay appears with the right star count.
