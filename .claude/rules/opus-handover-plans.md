# Writing handover plans for Opus

These rules apply whenever Fable (the planning model) writes an implementation
plan that Opus (the executing model) will carry out. `OPUS_BUILD_PLAN.md` is the
reference example of the format — match its style.

## Core principle

The plan is Opus's ONLY context. Opus will not ask follow-up questions, will not
see this conversation, and should never have to make a design decision. If a
detail is left open, Opus will guess — so close every detail before handover.
Plan as if writing for a capable engineer with zero project knowledge and no way
to reach you.

## File naming and location

- One plan per handover, at the repo root, named `OPUS_<FEATURE>_PLAN.md`
  (e.g. `OPUS_BUILD_PLAN.md`, `OPUS_AUDIO_PLAN.md`).
- The plan must open with: a one-line statement of what is being built, an
  instruction to read the entire document before writing any code, and the
  absolute project path.

## Required structure (in this order)

1. **Title + project location** — absolute path to the project root.
2. **⚠️ CRITICAL RULES** — a numbered list of the failure modes that matter
   most for this work (project conventions, platform gotchas, things Opus
   models commonly get wrong). State them as hard rules, not suggestions.
   Always include the standing project rules that apply (see below).
3. **Files to read before starting** — absolute paths. Opus must read these
   before writing anything; say so explicitly.
4. **API / contract reference** — inline the signatures of every shared
   library, helper, or endpoint the tasks will touch (e.g. the `KidsGame`
   API). Never make Opus discover an interface by reading source if the plan
   can state it.
5. **Shared boilerplate** — any HTML shell, import pattern, CSS variables, or
   config that every task uses, given once, verbatim.
6. **Numbered TASK sections** — see below.
7. **Execution order** — explicit ordered list. Sequence easiest/structural
   tasks first to confirm the setup, most complex last. State that each task
   must be fully complete before the next begins.
8. **Verification** — runnable commands (server start, `curl` checks, tests)
   with the expected output stated (e.g. "all should return 200").

## Per-task rules

Each task section must contain:

- **Exactly one file** to write or modify, with its absolute path on the first
  line. If a task needs two files, it is two tasks.
- For modifications: "READ this file completely before touching it", plus an
  explicit list of what must NOT change.
- **Exact values, not adjectives.** Colours as hex, sizes in px, timings in ms,
  speeds as formulas, copy and emoji verbatim. Never "an appropriate colour"
  or "a reasonable delay".
- **Code for anything non-obvious.** Algorithms (rotation, collision, physics,
  coverage maps), sizing math, and tricky event wiring are given as complete,
  correct snippets to copy — not described in prose. Prose describes intent;
  code defines behaviour.
- **Layout as ASCII diagram** when the task has UI structure (top-to-bottom
  regions in a fenced block).
- **Behavioural requirements as a bullet checklist** — each bullet a single
  testable statement, including win/lose conditions, scoring, and which shared
  API calls to make (`this.showWin(...)`, `this.celebrate()`, etc.).

## Standing project rules to embed in every plan's CRITICAL RULES

1. No comments in code, except for genuinely non-obvious algorithms.
2. No frameworks, no build step — pure vanilla HTML/CSS/JS.
3. No placeholder code, no `// TODO` — every function fully implemented.
4. Read listed reference files before writing; never guess names or paths.
5. No helper abstractions unless used 3+ times.
6. Every interactive surface handles touch AND mouse events.
7. `e.preventDefault()` on scrolling touch events, with `{ passive: false }`.
8. Unlock Web Audio (`game._ctx()`) on the first user gesture.
9. Use `100dvh`, never `100vh`.
10. Never hardcode canvas dimensions unless the task explicitly requires fixed
    sizes (state the reason when it does).
11. One file per task; never touch files outside the task scope.
12. Write complete files — never truncate.

## Style

- Imperative voice throughout ("Build...", "Use...", "Never...").
- Tables for enumerable facts (card grids, colour palettes, level tables).
- Horizontal rules between major sections and between tasks.
- No hedging ("probably", "you could", "consider") — every sentence is either
  a fact or an instruction.
- If a decision was made during planning, state only the decision, not the
  alternatives.

## Before handing over

Re-read the finished plan and check: could Opus complete every task with this
document alone, no questions, no guessing? Every file path absolute? Every
magic number specified? Verification commands runnable as-is? If any answer is
no, the plan is not done.
