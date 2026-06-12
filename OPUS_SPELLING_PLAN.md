# Kids Platform — Opus Build Plan: Australian Spelling Suite

You are rebuilding the spelling game and adding four new word games for a kids web platform, all aligned to the Australian synthetic-phonics scope and sequence (NSW English K–2 syllabus / Australian Curriculum English v9) for ages 4–10. Read this entire document before writing a single line of code.

This plan supersedes `WORD_GAP_PLAN.md` (deleted). The Word Gap game is Task 5 of this plan.

---

## Project location

`/Users/brad-personal/Projects/kids-platform/`

---

## ⚠️ CRITICAL RULES — read before anything else

Breaking any of these will cause the task to fail.

1. **No comments in code.** Not a single `//` or `/* */` block unless explaining a non-obvious algorithm.
2. **No framework, no build step.** Pure vanilla HTML/CSS/JS. No React, Vue, bundlers, or npm imports in the browser.
3. **No placeholder code.** Every function fully implemented. No `// TODO`.
4. **Read the listed reference files before writing.** Never guess class names or paths.
5. **No helper abstractions** unless used 3+ times. The shared helpers live in `words-au.js` (Task 1) — games must use them, not re-implement them.
6. **Touch AND mouse** on every interactive surface. Plain `<button>` elements with `click` handlers count as handling both.
7. **`e.preventDefault()` on scrolling touch events**, with `{ passive: false }`.
8. **Unlock Web Audio (`game._ctx()`) on the first user gesture** before any `game.sound()` call.
9. **Use `100dvh`, never `100vh`.**
10. **Never hardcode canvas dimensions** except the 260×260 tracing canvases in Task 6 — the tracing coverage map depends on fixed pixel positions.
11. **One file per task.** Never touch files outside the task scope.
12. **Write complete files — never truncate.**
13. **All word text is lowercase.** Children learn lowercase first; every word, tile, slot, grapheme, and keyboard key renders lowercase. No `text-transform: uppercase` anywhere.
14. **Australian spelling only** — `colour`, `favourite`, `mum`, `harbour`. Never an American spelling in any word bank, label, or string.
15. **Speech is a layer, never a gate.** All speech goes through `AU.speak()`. It degrades silently when `speechSynthesis` is missing; gameplay must be fully playable with speech unavailable.
16. **In hear-and-type stages the word and sentence are SPOKEN, never displayed** — showing the sentence would reveal the spelling.
17. **A distractor must never form a word in `AU.VALID` or `AU.BLOCKED`.** Always run the candidate check given in Task 5 before offering a choice.

---

## Files to read before starting any task

```
/Users/brad-personal/Projects/kids-platform/public/games/_lib/KidsGame.js
/Users/brad-personal/Projects/kids-platform/public/games/_lib/confetti.js
/Users/brad-personal/Projects/kids-platform/public/css/kids.css
/Users/brad-personal/Projects/kids-platform/public/games/spelling/index.html
/Users/brad-personal/Projects/kids-platform/public/games/index.html
```

After completing Task 1, also read `/Users/brad-personal/Projects/kids-platform/public/games/_lib/words-au.js` before every later task.

---

## Curriculum model

Seven stages span ages 4–10. Every game in this plan draws its words from these stages — no game invents its own word list.

| Stage | Ages | Curriculum anchor | Content |
|-------|------|-------------------|---------|
| 1 | 4–5 | Foundation readiness | Letter formation (tracing) + letter sounds |
| 2 | 5 | Foundation: spell most CVC words | CVC words, single-letter GPCs + ck ll ss ff |
| 3 | 6 | Year 1: consonant digraphs, blends | sh ch th ng qu, CCVC/CVCC |
| 4 | 6–7 | Year 1: vowel digraphs, split digraphs | ai ay ee ea igh oa ow oo ar or er ir ur, a_e i_e o_e u_e |
| 5 | 7–8 | Year 2: less common GPCs, suffixes, compounds | wh ph ce oi oy ou air ear, -ing/-ed with doubling, compound words |
| 6 | 8–9 | Year 3–4: morphemes, two-syllable words | Prefixes/suffixes, dictation with no visual support |
| 7 | 9–10 | Year 4–5: etymology, irregular words | -tion/-ture, silent letters, ough/augh, Australian -our/-ise conventions |

Techniques embedded across the games: audio-first encoding (hear the word, then build it — dictation, not copying), grapheme tiles instead of letter tiles (children spell by sounds, the core synthetic-phonics move), one slot per grapheme (phoneme-frame scaffolding), pseudo-word decoding (the national Year 1 Phonics Check format), pattern sorting (word study), morphology building (Years 3–6 curriculum), and spaced retrieval of missed words via localStorage.

---

## KidsGame API reference

```js
class KidsGame {
  constructor({ name: string, backUrl: string = '/games/' })

  init()   // override — build DOM, attach events
  start()  // override — begin/reset gameplay

  sound(name)              // 'pop' | 'correct' | 'wrong' | 'cheer' | 'click'
  correct(el?)             // green flash + correct sound
  wrong(el?)               // shake + wrong sound
  celebrate()              // confetti burst + cheer sound
  showWin(stars, onAction) // win overlay; stars 1|2|3; onAction('again'|'home')
  showLose(msg, onAction)
  home()
  _ctx()                   // AudioContext; call on first user gesture
}
```

## AU library API reference (created in Task 1)

```js
AU.STAGES        // array of 7 stage objects: { id, icon, label, ages, sub, mode, words }
                 //   mode: 'trace' | 'tiles' | 'type'
                 //   tiles word: { w:'fish', g:['f','i','sh'], e:'🐟' }
                 //   type  word: { w:'colour', s:'Green is my favourite colour.' }
AU.GPC           // { 2:{cons:[],vowels:[]}, 3:{...}, 4:{...}, 5:{...} } grapheme pools per stage
AU.SOUND_WORDS   // { a:'apple', b:'ball', ... } anchor word per letter
AU.ALIEN         // { 1:{real:[],alien:[]}, 2:{...}, 3:{...} } for the Phonics-Check game
AU.SORTS         // array of 6 sort sets: { id, icon, title, ages, rule, cols:[{label, words[]}] }
AU.FACTORY       // { 1:[puzzles], 2:[...], 3:[...] } morphology puzzles
AU.EXTRA_WORDS   // real words not in any bank, used for collision checks
AU.VALID         // Set of every real word (banks + EXTRA_WORDS)
AU.BLOCKED       // Set of strings that must never be formable by any distractor
AU.shuffle(arr)  // in-place Fisher–Yates, returns arr
AU.speak(text, { rate = 0.85, pitch = 1.05 })  // en-AU voice, silent no-op if unsupported
```

Import pattern for every game page in this plan:

```html
<script src="/games/_lib/confetti.js"></script>
<script src="/games/_lib/KidsGame.js"></script>
<script src="/games/_lib/words-au.js"></script>
```

---

## Shared boilerplate

Standard HTML shell for every game page:

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
    body { background: GRADIENT; }
  </style>
</head>
<body>
  <button class="nav-back" id="back-btn">←</button>
  <!-- screens -->
  <script src="/games/_lib/confetti.js"></script>
  <script src="/games/_lib/KidsGame.js"></script>
  <script src="/games/_lib/words-au.js"></script>
  <script>
  </script>
</body>
</html>
```

Every game uses the spelling game's two-screen pattern: `#screen-mode` (level/stage select, `.mode-cards` grid of `.mode-card` buttons) and `#screen-game`, toggled with `display`. The back button returns to the select screen from in-game, and goes `game.home()` from the select screen — copy this wiring from the current spelling game.

CSS variables from kids.css: `--coral #FF6B6B`, `--teal #4ECDC4`, `--yellow #FFE66D`, `--green #6BCB77`, `--purple #A78BFA`, `--orange #FB923C`, `--dark #1A202C`, `--mid #4A5568`. Tile colour classes `.tc0`–`.tc5`.

Rounds are 5 items unless a task states otherwise. Stars formula unless a task states otherwise: `mistakes <= 2 ? 3 : mistakes <= 5 ? 2 : 1`.

---
---

# TASK 1 — Curriculum word library

**File to write:** `/Users/brad-personal/Projects/kids-platform/public/games/_lib/words-au.js`

Write the file exactly as specified below — same data, same structure, no comments. This is a plain classic script defining one global `const AU`.

```js
const AU = {};

AU.SOUND_WORDS = {
  a:'apple', b:'ball', c:'cat', d:'dog', e:'egg', f:'fish', g:'goat',
  h:'hat', i:'insect', j:'jam', k:'kite', l:'leg', m:'moon', n:'net',
  o:'orange', p:'pig', q:'queen', r:'rain', s:'sun', t:'tap',
  u:'umbrella', v:'van', w:'web', x:'fox', y:'yo-yo', z:'zebra',
};

AU.STAGES = [
  { id:1, icon:'🐣', label:'Letters', ages:'4–5', sub:'Trace letters & hear their sounds', mode:'trace', words:null },
  { id:2, icon:'🐱', label:'First Words', ages:'5', sub:'Sound out short words', mode:'tiles', words:[
    { w:'cat', g:['c','a','t'], e:'🐱' }, { w:'dog', g:['d','o','g'], e:'🐶' },
    { w:'sun', g:['s','u','n'], e:'☀️' }, { w:'pig', g:['p','i','g'], e:'🐷' },
    { w:'hen', g:['h','e','n'], e:'🐔' }, { w:'bus', g:['b','u','s'], e:'🚌' },
    { w:'hat', g:['h','a','t'], e:'🎩' }, { w:'cup', g:['c','u','p'], e:'☕' },
    { w:'bed', g:['b','e','d'], e:'🛏️' }, { w:'box', g:['b','o','x'], e:'📦' },
    { w:'fox', g:['f','o','x'], e:'🦊' }, { w:'egg', g:['e','gg'], e:'🥚' },
    { w:'ant', g:['a','n','t'], e:'🐜' }, { w:'bag', g:['b','a','g'], e:'👜' },
    { w:'net', g:['n','e','t'], e:'🥅' }, { w:'web', g:['w','e','b'], e:'🕸️' },
    { w:'bug', g:['b','u','g'], e:'🐛' }, { w:'rat', g:['r','a','t'], e:'🐀' },
    { w:'leg', g:['l','e','g'], e:'🦵' }, { w:'map', g:['m','a','p'], e:'🗺️' },
    { w:'pan', g:['p','a','n'], e:'🍳' }, { w:'van', g:['v','a','n'], e:'🚐' },
    { w:'ten', g:['t','e','n'], e:'🔟' }, { w:'pen', g:['p','e','n'], e:'🖊️' },
    { w:'nut', g:['n','u','t'], e:'🥜' }, { w:'cap', g:['c','a','p'], e:'🧢' },
    { w:'log', g:['l','o','g'], e:'🪵' }, { w:'tap', g:['t','a','p'], e:'🚰' },
    { w:'duck', g:['d','u','ck'], e:'🦆' }, { w:'sock', g:['s','o','ck'], e:'🧦' },
    { w:'bell', g:['b','e','ll'], e:'🔔' },
  ]},
  { id:3, icon:'🚢', label:'Sound Teams', ages:'6', sub:'sh ch th ng & blends', mode:'tiles', words:[
    { w:'ship', g:['sh','i','p'], e:'🚢' }, { w:'fish', g:['f','i','sh'], e:'🐟' },
    { w:'shell', g:['sh','e','ll'], e:'🐚' }, { w:'shop', g:['sh','o','p'], e:'🏪' },
    { w:'chick', g:['ch','i','ck'], e:'🐤' }, { w:'chips', g:['ch','i','p','s'], e:'🍟' },
    { w:'lunch', g:['l','u','n','ch'], e:'🍱' }, { w:'bath', g:['b','a','th'], e:'🛁' },
    { w:'ring', g:['r','i','ng'], e:'💍' }, { w:'king', g:['k','i','ng'], e:'👑' },
    { w:'wing', g:['w','i','ng'], e:'🪽' }, { w:'song', g:['s','o','ng'], e:'🎵' },
    { w:'frog', g:['f','r','o','g'], e:'🐸' }, { w:'crab', g:['c','r','a','b'], e:'🦀' },
    { w:'drum', g:['d','r','u','m'], e:'🥁' }, { w:'flag', g:['f','l','a','g'], e:'🚩' },
    { w:'swim', g:['s','w','i','m'], e:'🏊' }, { w:'nest', g:['n','e','s','t'], e:'🪺' },
    { w:'tent', g:['t','e','n','t'], e:'⛺' }, { w:'hand', g:['h','a','n','d'], e:'✋' },
    { w:'milk', g:['m','i','l','k'], e:'🥛' }, { w:'gift', g:['g','i','f','t'], e:'🎁' },
    { w:'plant', g:['p','l','a','n','t'], e:'🪴' }, { w:'truck', g:['t','r','u','ck'], e:'🚚' },
    { w:'clap', g:['c','l','a','p'], e:'👏' }, { w:'stop', g:['s','t','o','p'], e:'🛑' },
  ]},
  { id:4, icon:'🌙', label:'Long Vowels', ages:'6–7', sub:'ai ee oa oo & magic e', mode:'tiles', words:[
    { w:'rain', g:['r','ai','n'], e:'🌧️' }, { w:'snail', g:['s','n','ai','l'], e:'🐌' },
    { w:'train', g:['t','r','ai','n'], e:'🚂' }, { w:'hay', g:['h','ay'], e:'🌾' },
    { w:'tree', g:['t','r','ee'], e:'🌳' }, { w:'bee', g:['b','ee'], e:'🐝' },
    { w:'sheep', g:['sh','ee','p'], e:'🐑' }, { w:'queen', g:['qu','ee','n'], e:'👸' },
    { w:'sea', g:['s','ea'], e:'🌊' }, { w:'leaf', g:['l','ea','f'], e:'🍃' },
    { w:'peach', g:['p','ea','ch'], e:'🍑' }, { w:'beach', g:['b','ea','ch'], e:'🏖️' },
    { w:'night', g:['n','igh','t'], e:'🌃' }, { w:'light', g:['l','igh','t'], e:'💡' },
    { w:'moon', g:['m','oo','n'], e:'🌙' }, { w:'spoon', g:['s','p','oo','n'], e:'🥄' },
    { w:'boot', g:['b','oo','t'], e:'🥾' }, { w:'book', g:['b','oo','k'], e:'📖' },
    { w:'boat', g:['b','oa','t'], e:'⛵' }, { w:'goat', g:['g','oa','t'], e:'🐐' },
    { w:'coat', g:['c','oa','t'], e:'🧥' }, { w:'road', g:['r','oa','d'], e:'🛣️' },
    { w:'snow', g:['s','n','ow'], e:'☃️' }, { w:'owl', g:['ow','l'], e:'🦉' },
    { w:'cow', g:['c','ow'], e:'🐮' }, { w:'clown', g:['c','l','ow','n'], e:'🤡' },
    { w:'star', g:['s','t','ar'], e:'⭐' }, { w:'shark', g:['sh','ar','k'], e:'🦈' },
    { w:'car', g:['c','ar'], e:'🚗' }, { w:'corn', g:['c','or','n'], e:'🌽' },
    { w:'fork', g:['f','or','k'], e:'🍴' }, { w:'storm', g:['s','t','or','m'], e:'⛈️' },
    { w:'surf', g:['s','ur','f'], e:'🏄' }, { w:'bird', g:['b','ir','d'], e:'🐦' },
    { w:'girl', g:['g','ir','l'], e:'👧' }, { w:'cake', g:['c','a','k','e'], e:'🎂' },
    { w:'snake', g:['s','n','a','k','e'], e:'🐍' }, { w:'plane', g:['p','l','a','n','e'], e:'✈️' },
    { w:'kite', g:['k','i','t','e'], e:'🪁' }, { w:'bike', g:['b','i','k','e'], e:'🚲' },
    { w:'bone', g:['b','o','n','e'], e:'🦴' }, { w:'nose', g:['n','o','s','e'], e:'👃' },
    { w:'rose', g:['r','o','s','e'], e:'🌹' },
  ]},
  { id:5, icon:'🦘', label:'Tricky Words', ages:'7–8', sub:'Bigger words & endings', mode:'tiles', words:[
    { w:'whale', g:['wh','a','l','e'], e:'🐋' }, { w:'wheel', g:['wh','ee','l'], e:'🛞' },
    { w:'phone', g:['ph','o','n','e'], e:'📱' }, { w:'dolphin', g:['d','o','l','ph','i','n'], e:'🐬' },
    { w:'coin', g:['c','oi','n'], e:'🪙' }, { w:'boy', g:['b','oy'], e:'👦' },
    { w:'toy', g:['t','oy'], e:'🧸' }, { w:'cloud', g:['c','l','ou','d'], e:'☁️' },
    { w:'mouse', g:['m','ou','s','e'], e:'🐭' }, { w:'house', g:['h','ou','s','e'], e:'🏠' },
    { w:'chair', g:['ch','air'], e:'🪑' }, { w:'bear', g:['b','ear'], e:'🐻' },
    { w:'pear', g:['p','ear'], e:'🍐' }, { w:'face', g:['f','a','ce'], e:'🙂' },
    { w:'dance', g:['d','a','n','ce'], e:'💃' }, { w:'giraffe', g:['g','i','r','a','ff','e'], e:'🦒' },
    { w:'kangaroo', g:['k','a','ng','a','r','oo'], e:'🦘' }, { w:'koala', g:['k','o','a','l','a'], e:'🐨' },
    { w:'rainbow', g:['r','ai','n','b','ow'], e:'🌈' }, { w:'football', g:['f','oo','t','b','a','ll'], e:'⚽' },
    { w:'cupcake', g:['c','u','p','c','a','k','e'], e:'🧁' }, { w:'sunflower', g:['s','u','n','f','l','ow','er'], e:'🌻' },
    { w:'butterfly', g:['b','u','tt','er','f','l','y'], e:'🦋' }, { w:'running', g:['r','u','nn','i','ng'], e:'🏃' },
    { w:'sleeping', g:['s','l','ee','p','i','ng'], e:'😴' }, { w:'smiled', g:['s','m','i','l','e','d'], e:'😊' },
  ]},
  { id:6, icon:'⌨️', label:'Hear & Type', ages:'8–9', sub:'Listen, then type the word', mode:'type', words:[
    { w:'unhappy', s:'The unhappy baby cried.' },
    { w:'unlock', s:'Use the key to unlock the door.' },
    { w:'replay', s:'Tap the button to replay the song.' },
    { w:'dislike', s:'I dislike cold showers.' },
    { w:'careful', s:'Be careful crossing the road.' },
    { w:'careless', s:'The careless puppy knocked over the plant.' },
    { w:'helpful', s:'It is helpful to pack your own bag.' },
    { w:'hopeless', s:'The team felt hopeless at half time.' },
    { w:'slowly', s:'The wombat walked slowly across the road.' },
    { w:'quickly', s:'She quickly packed her school bag.' },
    { w:'quicker', s:'A plane is quicker than a car.' },
    { w:'brightest', s:'That is the brightest star in the sky.' },
    { w:'playful', s:'The playful puppy chased its tail.' },
    { w:'teacher', s:'Our teacher reads us a story every day.' },
    { w:'sunny', s:'It was a sunny day at the beach.' },
    { w:'funny', s:'He told a funny joke at lunch.' },
    { w:'garden', s:'We grow tomatoes in our garden.' },
    { w:'window', s:'Rain ran down the window.' },
    { w:'morning', s:'We walk to school every morning.' },
    { w:'yellow', s:'The yellow bus stopped at our street.' },
  ]},
  { id:7, icon:'🏆', label:'Champions', ages:'9–10', sub:'Spelling-bee words', mode:'type', words:[
    { w:'station', s:'The train stops at the station.' },
    { w:'question', s:'Put your hand up to ask a question.' },
    { w:'picture', s:'She drew a picture of her family.' },
    { w:'nature', s:'We saw lots of nature on our bushwalk.' },
    { w:'colour', s:'Green is my favourite colour.' },
    { w:'favourite', s:'Mangoes are my favourite fruit.' },
    { w:'neighbour', s:'Our neighbour has a friendly dog.' },
    { w:'harbour', s:'The ferry crossed the harbour.' },
    { w:'because', s:'We stayed inside because of the storm.' },
    { w:'friend', s:'My friend lives next door.' },
    { w:'beautiful', s:'The reef was beautiful.' },
    { w:'enough', s:'Is there enough cake for everyone?' },
    { w:'thought', s:'I thought it would rain today.' },
    { w:'caught', s:'She caught the ball with one hand.' },
    { w:'knee', s:'He grazed his knee at footy training.' },
    { w:'knife', s:'Use a knife and fork.' },
    { w:'write', s:'Please write your name at the top.' },
    { w:'wrong', s:'I took the wrong bus home.' },
    { w:'climb', s:'Koalas climb gum trees.' },
    { w:'lamb', s:'The lamb stayed close to its mum.' },
    { w:'island', s:'We sailed to a small island.' },
    { w:'answer', s:'Write the answer in your book.' },
    { w:'minute', s:'The popcorn takes one minute.' },
    { w:'often', s:'We often swim at the beach in summer.' },
  ]},
];

AU.GPC = {
  2: {
    cons: ['b','c','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','x','y','z','ck','ll','ss','ff'],
    vowels: ['a','e','i','o','u'],
  },
  3: {
    cons: ['b','c','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','x','y','z','ck','ll','ss','ff','sh','ch','th','ng','qu'],
    vowels: ['a','e','i','o','u'],
  },
  4: {
    cons: ['b','c','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','x','y','z','ck','ll','ss','ff','sh','ch','th','ng','qu'],
    vowels: ['a','e','i','o','u','ai','ay','ee','ea','igh','oa','ow','oo','ar','or','er','ir','ur'],
  },
  5: {
    cons: ['b','c','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','x','y','z','ck','ll','ss','ff','sh','ch','th','ng','qu','wh','ph','ce','tt','nn'],
    vowels: ['a','e','i','o','u','ai','ay','ee','ea','igh','oa','ow','oo','ar','or','er','ir','ur','oi','oy','ou','air','ear'],
  },
};

AU.ALIEN = {
  1: {
    real: ['cat','dog','sun','pig','hen','bus','nut','leg','map','bed'],
    alien: ['vap','mip','dop','zub','fet','hib','gud','sep','taz','wob'],
  },
  2: {
    real: ['ship','fish','chick','bath','ring','frog','drum','flag','nest','milk'],
    alien: ['shap','chom','thip','quen','drap','snib','frip','plon','clab','trab'],
  },
  3: {
    real: ['rain','sheep','night','moon','boat','snow','star','corn','cake','kite'],
    alien: ['straim','queep','foan','glay','jound','sloam','groak','thaip','murn','doil'],
  },
};

AU.SORTS = [
  { id:'long-a', icon:'🌧️', title:'Long a', ages:'7+', rule:'ay ends a word, ai sits in the middle, a_e wraps around the end.',
    cols: [
      { label:'ai', words:['rain','snail','train','paint','chain','tail'] },
      { label:'ay', words:['play','day','tray','stay','away','spray'] },
      { label:'a_e', words:['cake','snake','plane','gate','late','wave'] },
    ]},
  { id:'long-e', icon:'🌳', title:'Long e', ages:'7+', rule:'ee and ea both say ee — you have to remember which team each word is on.',
    cols: [
      { label:'ee', words:['tree','sheep','green','sleep','queen','week'] },
      { label:'ea', words:['sea','leaf','beach','read','dream','team'] },
    ]},
  { id:'long-o', icon:'⛵', title:'Long o', ages:'7+', rule:'ow usually ends a word, oa sits in the middle, o_e wraps around the end.',
    cols: [
      { label:'oa', words:['boat','goat','coat','road','soap','toast'] },
      { label:'ow', words:['snow','grow','show','slow','yellow','window'] },
      { label:'o_e', words:['bone','nose','home','rope','stone','smoke'] },
    ]},
  { id:'ed', icon:'🏃', title:'ed endings', ages:'8+', rule:'ed can say t, d or id — say the word out loud to hear it.',
    cols: [
      { label:'ed says t', words:['jumped','kicked','looked','washed','helped','licked'] },
      { label:'ed says d', words:['played','smiled','rained','cleaned','yelled','opened'] },
      { label:'ed says id', words:['wanted','painted','planted','shouted','landed','melted'] },
    ]},
  { id:'er-ir-ur', icon:'🐦', title:'er ir ur', ages:'8+', rule:'er, ir and ur all say the same sound.',
    cols: [
      { label:'er', words:['her','fern','winter','river','sister','under'] },
      { label:'ir', words:['bird','girl','first','shirt','dirt','third'] },
      { label:'ur', words:['turn','burn','nurse','surf','curl','hurt'] },
    ]},
  { id:'plurals', icon:'🐈', title:'s or es', ages:'8+', rule:'Add es when a word ends in s, x, sh or ch.',
    cols: [
      { label:'s', words:['cats','dogs','birds','trees','cars','hands'] },
      { label:'es', words:['boxes','buses','wishes','beaches','foxes','glasses'] },
    ]},
];

AU.FACTORY = {
  1: [
    { clue:'not happy', base:'happy', affix:'un', pos:'pre', word:'unhappy' },
    { clue:'open the lock', base:'lock', affix:'un', pos:'pre', word:'unlock' },
    { clue:'not kind', base:'kind', affix:'un', pos:'pre', word:'unkind' },
    { clue:'tell again', base:'tell', affix:'re', pos:'pre', word:'retell' },
    { clue:'play again', base:'play', affix:'re', pos:'pre', word:'replay' },
    { clue:'read again', base:'read', affix:'re', pos:'pre', word:'reread' },
    { clue:'does not like', base:'like', affix:'dis', pos:'pre', word:'dislike' },
    { clue:'does not agree', base:'agree', affix:'dis', pos:'pre', word:'disagree' },
    { clue:'behave badly', base:'behave', affix:'mis', pos:'pre', word:'misbehave' },
    { clue:'take things out of a bag', base:'pack', affix:'un', pos:'pre', word:'unpack' },
  ],
  2: [
    { clue:'full of care', base:'care', affix:'ful', pos:'suf', word:'careful' },
    { clue:'without care', base:'care', affix:'less', pos:'suf', word:'careless' },
    { clue:'full of help', base:'help', affix:'ful', pos:'suf', word:'helpful' },
    { clue:'without hope', base:'hope', affix:'less', pos:'suf', word:'hopeless' },
    { clue:'in a slow way', base:'slow', affix:'ly', pos:'suf', word:'slowly' },
    { clue:'in a quick way', base:'quick', affix:'ly', pos:'suf', word:'quickly' },
    { clue:'a person who paints', base:'paint', affix:'er', pos:'suf', word:'painter' },
    { clue:'a person who teaches', base:'teach', affix:'er', pos:'suf', word:'teacher' },
    { clue:'the most bright', base:'bright', affix:'est', pos:'suf', word:'brightest' },
    { clue:'full of colour', base:'colour', affix:'ful', pos:'suf', word:'colourful' },
  ],
  3: [
    { clue:'not helpful', base:'help', pre:'un', suf:'ful', word:'unhelpful' },
    { clue:'in a way that is not fair', base:'fair', pre:'un', suf:'ly', word:'unfairly' },
    { clue:'showing no respect', base:'respect', pre:'dis', suf:'ful', word:'disrespectful' },
    { clue:'tricking someone the wrong way', base:'lead', pre:'mis', suf:'ing', word:'misleading' },
    { clue:'painted again', base:'paint', pre:'re', suf:'ed', word:'repainted' },
    { clue:'took everything out', base:'pack', pre:'un', suf:'ed', word:'unpacked' },
    { clue:'played again', base:'play', pre:'re', suf:'ed', word:'replayed' },
    { clue:'does not trust', base:'trust', pre:'dis', suf:'ful', word:'distrustful' },
    { clue:'in an unkind way', base:'kind', pre:'un', suf:'ly', word:'unkindly' },
    { clue:'treated badly', base:'treat', pre:'mis', suf:'ed', word:'mistreated' },
  ],
};

AU.FACTORY_AFFIXES = { pre: ['un','re','dis','mis'], suf: ['ful','less','ly','er','est','ing','ed'] };

AU.EXTRA_WORDS = ['cot','cut','bat','bit','but','bet','bad','bud','bid','dig','dug','wig','pin','pun','pit','pat','pot','put','pet','rot','rut','ran','run','rib','rob','rub','hot','hit','hut','ham','him','hum','hop','hip','top','tip','tin','tan','ton','men','man','mat','met','mad','mud','sat','sit','set','sad','son','sip','sap','fan','fun','fin','fit','fat','fig','lap','lip','lit','lot','let','led','lad','lid','kid','kit','gas','got','gut','gun','gum','jet','jot','jab','job','jog','jug','win','wet','wit','vet','yes','yet','zip','cop','cob','cab','nip','nap','nod','not','peg','pop','pup','pad','red','rid','rod','rag','rig','rug','tag','tug','wag','dot','den','din','don','dim','dam','beg','bog','bun','ban','bin','hag','hog','keg','mob','mop','mum','nan','pal','paw','sob','sow','sew','tab','tub','tot','vat','wax','fix','mix','deck','dock','dack','rock','lock','lick','kick','pick','tick','sick','neck','peck','pack','puck','luck','muck','tuck','suck','back','sack','rack','tack','lack','jack','buck','yuck','mock','hock','jock','nick','wick','cell','dell','fen','ken','hem','dill','bill','fill','hill','mill','pill','till','will','tell','sell','fell','well','yell','ball','call','fall','tall','wall','doll','dull','gull','hull','coke','lake','like','lime','line','lane','mane','mine','bake','rake','wake','woke','poke','pike','duke','dome','dime','dame','game','gate','late','mate','rate','site','bite','note','vote','rope','ripe','rise','rude','ride','rode','code','cove','cave','dive','dove','five','hive','gave','give','live','love','made','mode','wide','wade','wine','vine','nine','pine','pane','cane','cone','tone','tune','tame','time','tale','tile','pole','pale','pile','mile','mole','male','sale','sole','tide','hide','hole','kale','toad','load','goad','maid','paid','raid','main','pain','gain','vain','wait','bait','meat','heat','beat','neat','seat','bead','lead','read','mean','bean','lean','team','beam','seam','week','seek','peek','meek','keen','teen','seen','been','feet','meet','beet','feed','seed','weed','deed','need','reel','feel','peel','heel','moan','loan','soak','coal','foal','goal','born','horn','torn','worn','cord','lord','ford','form','fort','sort','port','part','park','dark','bark','mark','lark','hard','card','cart','tart','dart','barn','yarn','farm','harm','chat','chin','chop','chest','than','then','them','this','that','thud','shin','shed','shot','shut','sham','wish','dish','dash','mash','rash','cash','bash','gash','hash','wash','mesh','gosh','hush','rush','bush','push','rang','sang','hang','bang','gang','long','lung','sung','rung','ring','wink','sink','link','pink','hunk','junk','bunk','sunk','howl','fowl','gown','town','down','brown','frown','crow','blow','flow','glow','slow','stow','mown','sown','dawn','lawn','seal','heal','meal','deal','real','peat','feat'];

AU.BLOCKED = new Set(['dick','cock','tit','tits','ass','arse','crap','fart','poo','wee','bum','shit','shat','shet','piss','damn','hell','sex','wank','slut','fuck','fuk','cunt','knob','nob','dik','fag','prat','git','sod','turd','spaz','homo','negro','nazi']);

AU.VALID = new Set(AU.EXTRA_WORDS);
AU.STAGES.forEach(s => (s.words ?? []).forEach(x => AU.VALID.add(x.w)));
AU.SORTS.forEach(s => s.cols.forEach(c => c.words.forEach(w => AU.VALID.add(w))));
Object.values(AU.ALIEN).forEach(l => l.real.forEach(w => AU.VALID.add(w)));
Object.values(AU.FACTORY).forEach(l => l.forEach(p => AU.VALID.add(p.word)));

AU.shuffle = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

let _auVoices = [];
if ('speechSynthesis' in window) {
  _auVoices = speechSynthesis.getVoices();
  speechSynthesis.addEventListener('voiceschanged', () => { _auVoices = speechSynthesis.getVoices(); });
}

AU.speak = (text, opts = {}) => {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = _auVoices.find(x => x.lang === 'en-AU')
    || _auVoices.find(x => x.lang && x.lang.startsWith('en-GB'))
    || _auVoices.find(x => x.lang && x.lang.startsWith('en'));
  if (v) u.voice = v;
  u.rate = opts.rate ?? 0.85;
  u.pitch = opts.pitch ?? 1.05;
  speechSynthesis.speak(u);
};
```

Behavioural requirements:

- [ ] The file defines exactly one global, `AU`, plus the module-level `_auVoices`.
- [ ] `AU.VALID` contains every word from every stage bank, sort set, alien real list, factory answer, and `EXTRA_WORDS`.
- [ ] `AU.speak('cat')` is a silent no-op in a browser with no `speechSynthesis`.
- [ ] Loading the file in a page produces no console errors and no network requests.

---
---

# TASK 2 — Alien Words (Phonics-Check decoding game)

**File to write:** `/Users/brad-personal/Projects/kids-platform/public/games/alienwords/index.html`

**Body background:** `linear-gradient(160deg, #0f2027 0%, #203a43 50%, #2c5364 100%)`

The national Year 1 Phonics Check format: the child reads a word and decides whether it is a real word or a made-up "alien" word. Pseudo-words force decoding instead of memory.

### Level select screen

Three `.mode-card` buttons:

| data-level | Icon | Label | Sub | border-top |
|---|---|---|---|---|
| 1 | 🐣 | Short Words | Ages 5+ • cat, vap | `#6BCB77` |
| 2 | 🚀 | Sound Teams | Ages 6+ • ship, shap | `#FB923C` |
| 3 | 👽 | Tricky Words | Ages 7+ • rain, straim | `#A78BFA` |

### Game screen layout

```
[back btn]
[progress dots (10)            ⭐ score]

            ┌─────────────┐
            │    fish     │   word card — white, radius 24px,
            └─────────────┘   font clamp(40px, 12vw, 72px), weight 900, lowercase

      "Is it a real word, or an alien word?"

   ┌──────────────┐   ┌──────────────┐
   │  🦘  Real     │   │  👽  Alien    │   two big answer buttons
   └──────────────┘   └──────────────┘
```

Answer buttons: side-by-side, each `flex: 1`, max-width 200px, height 110px, radius 20px, font 22px weight 900, white text. Real button background `#6BCB77`, Alien button background `#A78BFA`. Icon 40px above the label.

### Round rules

- A round is 10 cards: 5 drawn from `AU.ALIEN[level].real` + 5 from `AU.ALIEN[level].alien`, each via `AU.shuffle([...list]).slice(0, 5)`, then the 10 shuffled together.
- Each card stores `{ w, isReal }`.
- First tap of any button calls `game._ctx()`.
- On answer: disable both buttons, then —
  - Correct: `game.correct(wordCard)`, `score += 10`, `AU.speak(card.w)`.
  - Wrong: `game.wrong(wordCard)`, `mistakes++`, `AU.speak(card.w)`, and show a 1.2s label under the card: `that one is real! 🦘` or `that one is alien! 👽`.
- Advance to the next card after 1300ms; re-enable buttons.
- Progress dots: 10 dots, same `.dot/.done/.current` pattern as the spelling game.
- After 10 cards: stars = `mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1`, then `game.showWin(stars, cb)`; `'again'` restarts the same level with a fresh draw.
- Never show the same word twice in one round.
- Back button: in-game → level select; level select → `game.home()`.

---
---

# TASK 3 — Word Sort (pattern sorting game)

**File to write:** `/Users/brad-personal/Projects/kids-platform/public/games/wordsort/index.html`

**Body background:** `linear-gradient(160deg, #d4fc79 0%, #96e6a1 100%)`

Word study through pattern sorting: the child reads a word and taps the spelling-pattern bucket it belongs to.

### Set select screen

One `.mode-card` per entry in `AU.SORTS` (6 cards), grid `grid-template-columns: 1fr 1fr`, screen scrolls vertically if needed (`overflow-y: auto` on the screen container). Each card shows `set.icon`, `set.title`, and sub-line `Ages {set.ages} • {column labels joined with ' · '}`. border-top colour cycles `#6BCB77, #FB923C, #A78BFA, #4ECDC4, #FF6B6B, #FFE66D` in order.

### Game screen layout

```
[back btn]
[progress: "4 / 12"           ⭐ score]

            ┌─────────────┐
            │    rain  🔊  │   current word card — tap anywhere on it to hear the word
            └─────────────┘

   ┌────────┐ ┌────────┐ ┌────────┐
   │   ai   │ │   ay   │ │  a_e   │   bucket headers — tap to sort
   │ snail  │ │  play  │ │  cake  │   sorted words stack inside as chips
   │ train  │ │        │ │        │
   └────────┘ └────────┘ └────────┘
```

- Word card: white, radius 20px, padding 18px 36px, font clamp(32px, 9vw, 56px) weight 900 colour `#1A202C`. Tapping it calls `AU.speak(word)`.
- Buckets: `display: flex; gap: 12px;` row filling the width, each bucket `flex: 1`, background `rgba(255,255,255,.35)`, radius 16px, min-height 38dvh, `padding: 10px`. Header: font 24px weight 900 colour `#1A202C`, centred, padding-bottom 8px, border-bottom `3px solid rgba(0,0,0,.1)`.
- Chips: font 16px weight 800, background white, radius 10px, padding 6px 10px, margin-top 8px, centred, `animation: pop-in` (use the existing `.anim-pop-in` class from kids.css).
- The whole bucket is the tap target (a `<button>`), not just the header.

### Round rules

- A round draws 12 words from the chosen set: 3 columns → 4 random words per column; 2 columns → 6 per column. Shuffle the 12 into one queue.
- The current word is spoken automatically 400ms after it appears (`AU.speak(word)`).
- Correct bucket: `game.sound('pop')`, chip appears in the bucket, `score += 10`, next word.
- Wrong bucket: `game.wrong(bucketEl)`, `mistakes++`. The word stays until sorted correctly.
- First tap anywhere calls `game._ctx()`.
- After all 12: show a rule banner before the win overlay — a centred white card displaying `set.rule` at font 20px weight 800, with a `Got it! 👍` `.btn .btn-primary` button. Speak the rule with `AU.speak(set.rule, { rate: 0.95 })`. Tapping the button dismisses it and calls `game.showWin(stars, cb)` with stars = `mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1`; `'again'` redraws the same set.
- Back button: in-game → set select; set select → `game.home()`.

---
---

# TASK 4 — Word Factory (morphology builder)

**File to write:** `/Users/brad-personal/Projects/kids-platform/public/games/wordfactory/index.html`

**Body background:** `linear-gradient(160deg, #f6d365 0%, #fda085 100%)`

Morphemic word building for Years 3–5: combine a prefix and/or suffix with a base word to match a meaning clue.

### Level select screen

| data-level | Icon | Label | Sub | border-top |
|---|---|---|---|---|
| 1 | 🔧 | Prefixes | Ages 8+ • un re dis mis | `#6BCB77` |
| 2 | 🔩 | Suffixes | Ages 8+ • ful less ly er est | `#FB923C` |
| 3 | 🏭 | Full Factory | Ages 9+ • prefix + suffix | `#A78BFA` |

### Game screen layout

```
[back btn]
[progress dots (6)             ⭐ score]

        ┌───────────────────────────┐
        │   "not happy"          🔊 │   clue card — tap to hear the clue
        └───────────────────────────┘

        ┌─────┐ ┌────────┐ ┌─────┐
        │  ?  │ │ happy  │ │     │     word frame: [prefix slot][base][suffix slot]
        └─────┘ └────────┘ └─────┘     unused slot is not rendered

        [ un ] [ re ] [ dis ] [ mis ]   affix tiles
```

- Clue card: white, radius 20px, padding 16px 28px, font clamp(22px, 5vw, 32px) weight 900, colour `#1A202C`. Tapping it calls `AU.speak(puzzle.clue)`; also auto-speak 400ms after the puzzle renders.
- Base block: background `rgba(255,255,255,.9)`, radius 14px, padding 12px 18px, font clamp(26px, 6vw, 40px) weight 900, colour `#1A202C`.
- Empty affix slot: same size, dashed 3px border `rgba(0,0,0,.25)`, background `rgba(255,255,255,.25)`, shows `?` in colour `rgba(0,0,0,.3)`. Filled slot: background `#6BCB77`, white text, `transform: scale(1.06)`.
- Affix tiles: reuse the spelling game's `.tile` pattern with `.tc0`–`.tc5` colours, width auto with `padding: 0 18px`, height clamp(56px, 9.5vw, 84px), font clamp(24px, 5vw, 40px) weight 900, lowercase.

### Round rules

- A round is 6 puzzles: `AU.shuffle([...AU.FACTORY[level]]).slice(0, 6)`.
- **Levels 1 and 2:** one empty slot (position from `puzzle.pos`). Tiles = `puzzle.affix` + 3 others from `AU.FACTORY_AFFIXES[puzzle.pos]` (no duplicates), shuffled. Tapping the right tile fills the slot; the assembled word then shows joined (`unhappy`) for 1s while `AU.speak(puzzle.word)` plays, then `game.sound('cheer')` flash and next puzzle. Wrong tile: `game.wrong(tile)`, `mistakes++`; after 2 wrongs on one puzzle add `.kg-hint` to the correct tile.
- **Level 3:** both slots empty. Two tile rows: 4 prefix tiles (always all of `un re dis mis`) and 4 suffix tiles (`puzzle.suf` + 3 others from the suffix pool), each row shuffled. Slots can be filled in either order; a prefix tile only fills the prefix slot, a suffix tile only the suffix slot. A tile is wrong if it does not match that slot's answer. The puzzle completes when both slots are correct.
- Scoring: `score += Math.max(10, 30 - wrongsOnThisPuzzle * 10)` per puzzle.
- First tap of anything calls `game._ctx()`.
- After 6 puzzles: stars = standard formula, `game.showWin(stars, cb)`; `'again'` restarts the level with a fresh draw.
- Back button: in-game → level select; level select → `game.home()`.

---
---

# TASK 5 — Word Gap (missing-grapheme game)

**File to write:** `/Users/brad-personal/Projects/kids-platform/public/games/wordgap/index.html`

**Body background:** `linear-gradient(160deg, #fddb92 0%, #d1fdff 100%)`

A word appears with one grapheme missing; the child taps the choice tile that completes it. Gaps and choices are graphemes (sound-spellings), not just letters.

### Level select screen

| data-level | Icon | Label | Sub | border-top | Source |
|---|---|---|---|---|---|
| 1 | 🐣 | First Sound | Ages 4+ • _at | `#6BCB77` | Stage 2 words, gap always index 0, 3 choices |
| 2 | 🦁 | Any Sound | Ages 5+ • fi_h | `#FB923C` | Stage 3 words, random gap, 4 choices |
| 3 | 🦉 | Tricky Sound | Ages 6+ • r_n | `#A78BFA` | Stage 4 words, random gap, 4 choices |

Stage words come from `AU.STAGES` (`AU.STAGES.find(s => s.id === N).words`).

### Game screen layout

```
[back btn]
[progress dots (5)             ⭐ score]

              🐟        (emoji — tap to hear the word)

         f   _   sh? →  [f] [_] (gap is one dashed slot)

       [ i ] [ a ] [ o ] [ u ]    choice tiles

              💡 Hint
```

- Word row: one slot per grapheme. Known graphemes: solid tiles, background `rgba(255,255,255,.85)`, colour `#1A202C`. The gap: dashed 3px border `rgba(0,0,0,.3)`, background `rgba(255,255,255,.25)`, empty. Slot sizing: height clamp(52px, 9vw, 80px), `min-width: clamp(52px, 9vw, 80px)`, `width: auto`, `padding: 0 10px` so multi-letter graphemes (`sh`, `igh`) fit. Font clamp(26px, 5vw, 44px) weight 900 lowercase.
- Choice tiles: `.tile .tc0`–`.tc5` pattern, same auto-width sizing as slots.
- Emoji: clamp(72px, 15vw, 120px), tapping calls `AU.speak(word.w)`; also auto-speak 400ms after each word renders and again on a correct answer.

### Gap and choice algorithm

```js
function pickGapIndex(word, level) {
  if (level === 1) return 0;
  const idxs = word.g.map((g, i) => i)
    .filter(i => !(i === word.g.length - 1 && word.g[i] === 'e'));
  return idxs[Math.floor(Math.random() * idxs.length)];
}

function makeChoices(word, gi, stageId, count) {
  const ans = word.g[gi];
  const pool = AU.GPC[stageId].vowels.includes(ans)
    ? AU.GPC[stageId].vowels : AU.GPC[stageId].cons;
  const out = [ans];
  for (const c of AU.shuffle([...pool])) {
    if (out.length === count) break;
    if (c === ans || out.includes(c)) continue;
    const cand = word.g.map((g, i) => i === gi ? c : g).join('');
    if (AU.VALID.has(cand) || AU.BLOCKED.has(cand)) continue;
    out.push(c);
  }
  return AU.shuffle(out);
}
```

If the pool runs out before `count` choices exist, show however many were found (minimum is always 2 — the answer plus at least one safe distractor exists in every pool).

### Round rules

- 5 words per round: `AU.shuffle([...stageWords]).slice(0, 5)`.
- First tap anywhere calls `game._ctx()`.
- Correct tap: `game.sound('pop')`, gap fills with green `.filled` styling (background `#6BCB77`, white text, scale 1.08), choice tiles disable, `AU.speak(word.w)`, full-screen 🎉 flash for 900ms (copy the spelling game's `.word-done-flash`), then next word.
- Wrong tap: `game.wrong(tile)`, `totalMistakes++`, `wrongOnWord++`; after 2 wrongs on one word add `.kg-hint` to the correct tile. A `💡 Hint` button does the same on demand.
- Score per word: `Math.max(10, 30 - totalMistakes * 5)`.
- After 5 words: standard stars formula, `game.showWin(stars, cb)`; `'again'` restarts the level.
- Back button: in-game → level select; level select → `game.home()`.

---
---

# TASK 6 — Rebuild the Spelling game (7 stages, ages 4–10)

**File to modify:** `/Users/brad-personal/Projects/kids-platform/public/games/spelling/index.html`

READ this file completely before touching it. This is a full rebuild of the file, but these parts must carry over UNCHANGED:

- The tracing implementation: `buildLetterMap`, `checkCoverage`, `traceXY`, `traceStart/Move/End`, `bindTracing`, the 260×260 canvases, `TRACE_GRID = 8`, `COVER_TARGET = 0.70`, the clear button, the progress bar, and all tracing event wiring with `{ passive: false }`.
- The header pattern (progress dots + ⭐ score), `.word-done-flash`, the hint behaviour (`.kg-hint` after 2 wrongs + 💡 button), and the screen-switching approach.
- The page background gradient.

Add `<script src="/games/_lib/words-au.js"></script>` after `KidsGame.js`.

### Stage select screen (replaces the two-card mode select)

Title: `Spelling 📝`. Below it, a 2-column grid of 7 stage cards built from `AU.STAGES` (`.mode-card` styling, icon + label + sub-line `Ages {ages} • {sub}`). border-top colours in stage order: `#6BCB77, #4ECDC4, #FB923C, #A78BFA, #FF6B6B, #FFE66D, #F9A8D4`. The screen container gets `overflow-y: auto` so all 7 cards are reachable on small phones. The last-played stage id is stored in localStorage key `au-spelling-stage`; that card gets `box-shadow: 0 0 0 4px var(--yellow), 0 8px 32px rgba(0,0,0,.12)`.

### Stage 1 — trace mode

The existing tracing flow with two changes only:

1. The character pool becomes lowercase letters plus digits: `'abcdefghijklmnopqrstuvwxyz'.split('')` and `'0123456789'.split('')` — same 5-per-session draw.
2. Speech. When a character loads: for a letter `c`, `AU.speak(c === 'x' ? 'x. x is in fox' : \`${c}. ${c} is for ${AU.SOUND_WORDS[c]}\`)`; for a digit, `AU.speak(c)`. On trace completion, before advancing: `AU.speak(\`${c}! well done\`)`.

Everything else in tracing stays byte-for-byte identical.

### Tile mode — stages 2, 3, 4, 5

The hear-and-build flow (replaces the old fixed word bank and letters-only tiles):

```
[progress dots            ⭐ score]

              🐟          (emoji — tap to hear the word again)

        [_] [_] [_]       one dashed slot PER GRAPHEME (not per letter)

   [f] [sh] [i] [b] [oo] [t]    tiles: the word's graphemes + 3 distractors

              💡 Hint
```

- Words: 5 per round from `stage.words` (selection rules below in "Review queue").
- Slots: one per entry in `word.g`, auto-width (same slot sizing spec as Task 5) so `igh` fits.
- Tiles: the word's graphemes in shuffled order, plus 3 distractor graphemes drawn from `AU.GPC[stage.id].cons.concat(AU.GPC[stage.id].vowels)` that (a) do not appear anywhere in `word.g` and (b) are distinct from each other. All tiles shuffled together, `.tile .tc0`–`.tc5`, lowercase, auto-width with `padding: 0 14px`.
- Tap flow: identical to the existing game — `tile.dataset.g === word.g[currentSlot]` fills the next slot, wrong tap shakes, 2 wrongs auto-hint, 💡 button hints on demand. Duplicate graphemes in a word (kangaroo has two `a`) work because matching is by value.
- Speech: `AU.speak(word.w)` 400ms after the word renders, on every emoji tap, and once more when the word completes.
- Word complete: existing 🎉 flash + cheer + `points = Math.max(10, 30 - totalMistakes * 3)` then next word.

### Type mode — stages 6, 7

Hear-and-type dictation. The word and sentence are spoken only — never rendered as text before a failed second attempt.

```
[progress dots            ⭐ score]

         ┌──────────┐
         │    🔊    │     big speaker button — replays the dictation
         └──────────┘

     [_][_][_][_][_][_]    one box per letter, fills as the child types

  [q][w][e][r][t][y][u][i][o][p]
   [a][s][d][f][g][h][j][k][l]
   [⌫][z][x][c][v][b][n][m][✓]
```

- Dictation: `AU.speak(\`${word.w}. ${word.s} ${word.w}.\`)` — played 400ms after the word loads, and on every speaker tap. Speaker button: 96px circle, background `rgba(255,255,255,.3)`, font-size 44px.
- Letter boxes: one per letter of `word.w`, same dashed-slot styling, font clamp(22px, 4.5vw, 36px). Typed letters fill left to right; ⌫ clears the rightmost filled box.
- Keyboard: three `.kb-row` flex rows inside a `.kb` column (gap 6px, max-width 520px). Keys are `<button class="kb-key">`: `flex: 1; max-width: 48px; height: 52px; border-radius: 10px; border: none; background: white; color: #1A202C; font-family: inherit; font-size: 20px; font-weight: 900; cursor: pointer;` active state `transform: scale(.9)`. ⌫ and ✓ get `max-width: 72px`; ✓ background `var(--green)`, white text, disabled (opacity .4) until every box is filled.
- Physical keyboard support: `keydown` for `a`–`z` (lowercase the key), `Backspace`, `Enter` (submit when full).
- Submit (✓ or Enter): compare typed string to `word.w`.
  - Correct: boxes turn green (`background: #6BCB77; color: white; border-style: solid`), `game.sound('cheer')`, `AU.speak(word.w)`, 🎉 flash, next word after 1200ms.
  - Wrong: `attempts++`. For 1500ms, colour each box — letter correct for its position → green; otherwise → `background: #FF6B6B; color: white`. Then clear all boxes and replay the dictation. After the 2nd failed attempt, additionally show the correct word as ghost letters inside the boxes (`color: rgba(0,0,0,.25)`) for the child to copy; typed letters overwrite the ghosts.
- Points per word: `attempts === 0 ? 30 : attempts === 1 ? 20 : 10` (attempts counted at the moment of the correct submit).

### Review queue (spaced retrieval) — tile and type stages

Missed words come back in later rounds. localStorage key `au-spelling-missed` holds JSON like `{"3":["ship","lunch"],"6":["careless"]}`.

```js
function getMissed() {
  try { return JSON.parse(localStorage.getItem('au-spelling-missed')) ?? {}; }
  catch { return {}; }
}
function saveMissed(m) { localStorage.setItem('au-spelling-missed', JSON.stringify(m)); }
```

- Round build: take up to 2 words whose `w` is in the missed list for this stage (and still exists in `stage.words`), fill the rest of the 5 randomly from the unmissed words, shuffle the 5 together.
- After each word: 2 or more mistakes/failed attempts on that word → add `w` to the stage's missed list (no duplicates, cap the list at 10 by dropping the oldest); 0 mistakes → remove `w` from the list. Save after every change.

### Stage select bookkeeping

On starting any stage, write its id to `au-spelling-stage`. Round length stays 5; stars stay `totalMistakes <= 3 ? 3 : totalMistakes <= 7 ? 2 : 1` (for type mode, count failed attempts as mistakes); `showWin` 'again' restarts the same stage with a fresh draw.

### What must NOT change

- The tracing algorithm internals listed above.
- The `SpellingGame extends KidsGame` structure, DOMContentLoaded bootstrapping, and back-button behaviour (in-game → stage select, stage select → home).
- `WORDS_PER_GAME = 5`.

---
---

# TASK 7 — Update the games hub

**File to modify:** `/Users/brad-personal/Projects/kids-platform/public/games/index.html`

READ the current file before editing. Change the Spelling card's description and badge, and add four new cards directly after it. Do not touch the Tracing, Colouring, Blocks, Block Blasters, or Uno cards.

Spelling card becomes:

```html
<a href="/games/spelling/" class="card game-card">
  <span class="card-icon">📝</span>
  <span class="card-title">Spelling</span>
  <span class="card-desc">Hear it, build it, type it</span>
  <span class="badge badge-all">4 – 10 yrs</span>
</a>
```

New cards, in this order after Spelling:

```html
<a href="/games/wordgap/" class="card game-card">
  <span class="card-icon">🔤</span>
  <span class="card-title">Word Gap</span>
  <span class="card-desc">Find the missing sound</span>
  <span class="badge badge-all">4 – 7 yrs</span>
</a>

<a href="/games/alienwords/" class="card game-card">
  <span class="card-icon">👽</span>
  <span class="card-title">Alien Words</span>
  <span class="card-desc">Real word or alien?</span>
  <span class="badge badge-6">5 – 7 yrs</span>
</a>

<a href="/games/wordsort/" class="card game-card">
  <span class="card-icon">🗂️</span>
  <span class="card-title">Word Sort</span>
  <span class="card-desc">Sort the spelling patterns</span>
  <span class="badge badge-6">7 – 9 yrs</span>
</a>

<a href="/games/wordfactory/" class="card game-card">
  <span class="card-icon">🏭</span>
  <span class="card-title">Word Factory</span>
  <span class="card-desc">Build words from parts</span>
  <span class="badge badge-6">8 – 10 yrs</span>
</a>
```

---
---

# Execution order

Complete each task fully before starting the next.

1. Task 1 — `words-au.js` (everything depends on it)
2. Task 2 — Alien Words (simplest game; confirms the AU library works)
3. Task 3 — Word Sort
4. Task 4 — Word Factory
5. Task 5 — Word Gap
6. Task 6 — Spelling rebuild (most complex; modifies an existing file)
7. Task 7 — Games hub

---

# Verification

```bash
cd /Users/brad-personal/Projects/kids-platform && node server.js &
curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" \
  http://localhost:3000/games/ \
  http://localhost:3000/games/_lib/words-au.js \
  http://localhost:3000/games/spelling/ \
  http://localhost:3000/games/wordgap/ \
  http://localhost:3000/games/alienwords/ \
  http://localhost:3000/games/wordsort/ \
  http://localhost:3000/games/wordfactory/
```

All must return 200. Then check by hand, with the browser console open (zero errors allowed on every page):

- Spelling: all 7 stage cards render; stage 1 traces lowercase letters and speaks the sound; stage 3 shows grapheme slots (`fish` = 3 slots) and grapheme tiles; stage 6 plays dictation, the on-screen and physical keyboards both work, a wrong submit shows green/red letters then clears, a second failure shows ghost letters; a word failed twice reappears in a later round of the same stage.
- Word Gap: level 1 always gaps the first sound with 3 choices; level 3 gaps random graphemes with 4 choices; no choice ever completes a different real word.
- Alien Words: 10 cards per round, 5 real + 5 alien; every word is spoken after answering; wrong answers show the reveal label.
- Word Sort: 12 words per round; wrong bucket shakes and keeps the word; the rule banner appears before the win overlay.
- Word Factory: level 3 requires both slots; the assembled word is spoken on completion.
- Hub: 10 cards total, all linking to live games.
- With speech unavailable (run `delete window.speechSynthesis` before page scripts load, or test in a browser without voices): every game remains fully playable.
