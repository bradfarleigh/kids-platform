<!-- Added to the implement, review and repair prompts under "Project rules".
     Say what an agent in this repo must read first, must never do, and how a
     visual or data change is proven - the things the generic prompt cannot know.
     Answer four questions here (the /sandcastle skill's init action asks them):
     - Generated files: which committed files does a command write, and which command?
       Agents edit the source and run it. Declare them under `generated` in config.ts too.
     - Do not touch: which paths must an agent never change?
     - Drift: which gate proves the generated files match their sources (the kit's docs/setup.md: A gate
       for generated files)? If none, say why.
     - Related tests: which command runs the tests that cover changed files? Which
       repo-wide tests (ratchets, scans of every file) can a new file trip? -->

## Project rules

The standing rules from `.claude/rules/opus-handover-plans.md` (scoped there to plan files, so
they are copied here):

1. No comments in code, except for genuinely non-obvious algorithms.
2. No frameworks, no build step, no new dependencies - pure vanilla HTML/CSS/JS in `public/`.
3. No placeholder code, no `// TODO` - every function fully implemented.
4. Read the files you change and the ones they use before writing; never guess names or paths.
   Games share `public/games/_lib/` (`KidsGame.js`, `words-au.js`, `confetti.js`).
5. No helper abstractions unless used 3+ times.
6. Every interactive surface handles touch AND mouse events.
7. `e.preventDefault()` on scrolling touch events, with `{ passive: false }`.
8. Unlock Web Audio (`game._ctx()`) on the first user gesture.
9. Use `100dvh`, never `100vh`.
10. Never hardcode canvas dimensions unless the ticket requires fixed sizes (say why when it does).
11. Never touch files outside the ticket's scope. Write complete files - never truncate.

Do not write `OPUS_*_PLAN.md` plans: a ticket is the plan, so implement it.

## Never

- `ADMIN_PASSWORD` is a secret: never hardcode one, log one or commit one. The admin endpoints
  stay disabled without it, which is how the tests run.
- The site deploys `public/` to GitHub Pages from `main`; never change `.github/workflows/`.

## Generated files, drift

- None. `data/videos.json` is written at runtime by the server's admin API, not by a build
  command, so there is no drift gate.

## Tests

- `npm test` (`node --test`, the whole suite in `test/`) takes seconds: run it for every change.
  It checks the word data in `public/games/_lib/words-au.js` (graphemes join to the word, every
  stage has its pool), so any edit to the word lists must keep it green.
- A visual or gameplay change cannot be seen here: say in your final message what a person
  should check in a browser, on a touch device too.
