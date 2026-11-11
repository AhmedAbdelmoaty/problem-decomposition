# Living City Game Feel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the current Egyptian city and sales scenes into a polished, dramatic browser-game presentation without changing any analytical content, number, rule, result, or progression behavior.

**Architecture:** Keep the existing DOM/SVG game and add an isolated presentation layer in `game-feel.css` and `game-feel.js`. The presentation layer observes rendered DOM and the existing read-only `window.dcDebug.state()` surface; it never mutates gameplay state. Existing scene drawing and SVG character rendering may gain presentation-only markup/classes, while protected data and gameplay functions are hash-locked to the approved baseline.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, inline SVG, Vitest, jsdom, Vite.

**Spec:** `docs/superpowers/specs/2026-11-10-game-feel-design.md`

## Global Constraints

- Preserve every story, clue, evidence sentence, option, cause, lesson, label, number, timer, budget, penalty, score, result, and answer exactly.
- Preserve the decomposition tree, random selection rules, calculations, scoring, win/loss conditions, progression, reflection, and saved progress exactly.
- Presentation code may read gameplay state but must not mutate it or introduce a second source of truth.
- Do not migrate engines or add runtime dependencies.
- Strong success feedback occurs only after the existing proven-cause/fix state; opening a dimension or branch stays neutral.
- Preserve RTL, keyboard focus, touch targets, mobile layout, mute behavior, and `prefers-reduced-motion`.
- Audio ambience and level-4 voice work remain deferred; no automatic paid generation retries.

## Review Focus

- Randomized levels: deterministic test seeds must prove protected outcomes without changing production randomness.
- Re-rendered SVG/DOM: presentation observers must rebind without duplicate listeners or animation buildup.
- Rapid clicks and transitions: visual effects must not block, reorder, or replay gameplay actions.
- Reduced motion: every new effect must resolve immediately to a readable stable state.
- Mobile/RTL: bubbles, HUD, and scene foreground must not cover actionable controls.

---

### Task 1: Lock analytical content and logic

**Files:**
- Create: `src/test/game-logic-lock.test.ts`
- Create: `src/test/fixtures/game-logic-baseline.json`
- Modify: `public/game/index.html` only to add non-executable boundary comments if extraction needs them

**Interfaces:**
- Consumes: `public/game/index.html` at approved commit `65dae2b`
- Produces: `extractNamedFunction(source, name): string`, protected hashes/fixtures, and regression failures for analytical drift

- [ ] **Step 1: Write failing tests**

Add tests named:

- `keeps the analytical data and all player-facing case copy identical to the approved baseline`
- `keeps decomposition, scoring, fix, win, loss, and action-routing functions identical to the approved baseline`
- `keeps every protected numeric rule identical to the approved baseline`

The tests must extract real source blocks/functions, hash normalized LF content with SHA-256, and compare against a fixture that does not exist yet.

- [ ] **Step 2: Run the lock test and verify RED**

Run: `npm test -- --run src/test/game-logic-lock.test.ts`

Expected: FAIL because `game-logic-baseline.json` is missing.

- [ ] **Step 3: Generate the reviewed baseline fixture from commit `65dae2b` content**

Record hashes for the data/copy block and named functions: `why`, `plant`, `flatDim`, `refreshFlat`, `recalc`, `assemble`, `level1`, `level2`, `level3`, `level4`, `startLevel`, `lose`, `win`, `openTile`, `answerWhy`, and `fixLeaf`. Record exact values for `PENALTY`, level budgets, timers, option counts, and score/star thresholds.

- [ ] **Step 4: Run lock and full tests**

Run: `npm test -- --run src/test/game-logic-lock.test.ts`

Expected: PASS.

Run: `npm test`

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/test/game-logic-lock.test.ts src/test/fixtures/game-logic-baseline.json public/game/index.html
git commit -m "test: lock analytical game baseline"
```

### Task 2: Add the isolated presentation runtime

**Files:**
- Create: `public/game/game-feel.js`
- Create: `public/game/game-feel.css`
- Modify: `public/game/index.html` to load both files
- Create: `src/test/game-feel-runtime.test.ts`

**Interfaces:**
- Consumes: `window.dcDebug.state(): {G, S, L}` and rendered `#game`, `.stage`, `.bubble`
- Produces: `window.DCFeel.start()`, `window.DCFeel.sync()`, and DOM state attributes `data-feel-view`, `data-feel-level`, `data-feel-pressure`

- [ ] **Step 1: Write failing runtime tests**

Assert a missing `DCFeel` runtime fails to start, then cover one-time listener binding, DOM re-render observation, stable state attributes, and no mutation of a frozen debug-state fixture.

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- --run src/test/game-feel-runtime.test.ts`

Expected: FAIL because `game-feel.js` does not exist.

- [ ] **Step 3: Implement the minimal observer runtime**

Use one `MutationObserver`, one delegated pointer listener, and read-only snapshots of debug state. Do not write to `G`, `S`, or `L`.

- [ ] **Step 4: Add CSS tokens and reduced-motion foundation**

Define palette, depth, easing, duration, focus, and stable reduced-motion variables without changing existing copy or controls.

- [ ] **Step 5: Verify and commit**

Run: `npm test` and `npm run build`.

Commit: `feat: add isolated game feel runtime`.

### Task 3: Build the living Egyptian city scene

**Files:**
- Modify: `public/game/index.html` scene-rendering functions only
- Modify: `public/game/game-feel.css`
- Modify: `src/test/game-feel-runtime.test.ts`

**Interfaces:**
- Consumes: current `drawCity`, `.stage` classes, `.zone[data-z]`, and the observer runtime
- Produces: `.sky-layer`, `.city-back`, `.city-mid`, `.power-grid`, `.street-life`, `.city-front` while preserving zone mapping

- [ ] **Step 1: Add failing scene-contract tests**

Assert the layered scene exists, every original zone index remains present/clickable, and reduced-motion disables ambient animation.

- [ ] **Step 2: Verify RED**

Run the focused runtime test and confirm missing layer selectors.

- [ ] **Step 3: Add SVG depth and environmental motion**

Add skyline silhouettes, clouds, cable depth, varied windows, street silhouettes, hospital generator glow, foreground objects, and multi-depth bats. Keep all scene additions `pointer-events:none` except existing zones.

- [ ] **Step 4: Verify desktop/mobile/reduced-motion behavior**

Run tests, build, then visual playtest at desktop and narrow mobile widths.

- [ ] **Step 5: Commit**

Commit: `feat: create layered living city scene`.

### Task 4: Add state-driven visual feedback

**Files:**
- Modify: `public/game/game-feel.js`
- Modify: `public/game/game-feel.css`
- Modify: `src/test/game-feel-runtime.test.ts`

**Interfaces:**
- Consumes: successive read-only debug snapshots and rendered view changes
- Produces: transient classes for neutral navigation, proven fix, wrong attempt, pressure, win, and loss

- [ ] **Step 1: Write failing transition tests**

Cover neutral dimension/branch opening, proven fix only, wrong attempt, final-ten-second pressure, non-blocking win, non-blocking loss, rapid clicks, and duplicate-effect prevention.

- [ ] **Step 2: Verify RED**

Run focused tests and confirm missing transition classes.

- [ ] **Step 3: Implement visual-only transitions**

Create local flicker, restrained wrong shake, power-path pulse after proven fix, power restoration sequence, and loss atmosphere. Effects must never disable buttons or delay navigation.

- [ ] **Step 4: Verify and commit**

Run full tests, build, and playtest all transition states.

Commit: `feat: add game state visual feedback`.

### Task 5: Animate characters and protect dialogue presentation

**Files:**
- Modify: `public/game/index.html` character SVG/rendering only
- Modify: `public/game/game-feel.css`
- Modify: `public/game/game-feel.js`
- Modify: `src/test/game-audio.test.ts`
- Modify: `src/test/game-feel-runtime.test.ts`

**Interfaces:**
- Consumes: current character roles, bubble timing, and `voiceTrack` playback state exposed only as a presentation flag
- Produces: role/mood classes, idle breathing, blinking, speaking mouth, and win/loss poses

- [ ] **Step 1: Write failing character and dialogue tests**

Assert role mapping stays valid, bubble copy is unchanged, duration remains `VOICE[key].ms`, mouth motion only occurs during playback, and reduced-motion leaves a stable pose.

- [ ] **Step 2: Implement reusable SVG pose groups and CSS animation**

Do not add gameplay state. Derive mood from current rendered view and existing role.

- [ ] **Step 3: Verify and commit**

Run full tests, build, and visual playtest representative male/female/hospital/resident characters.

Commit: `feat: animate dialogue characters`.

### Task 6: Polish the HUD and interaction surfaces

**Files:**
- Modify: `public/game/index.html` presentation markup only
- Modify: `public/game/game-feel.css`
- Modify: `src/test/game-feel-runtime.test.ts`

**Interfaces:**
- Consumes: current DOM order, labels, numeric values, `data-act` actions, and `#game` event delegation
- Produces: breaker/fuse attempt treatment, illuminated decomposition path, contextual panels, and responsive HUD styling

- [ ] **Step 1: Write failing UI contract tests**

Assert protected text/values/actions/order remain identical, controls remain inside `#game`, and focus/touch/RTL/mobile contracts remain valid.

- [ ] **Step 2: Implement game-native styling**

Change wrappers/classes and CSS only where possible. Keep central and lower-middle playfield clear.

- [ ] **Step 3: Verify and commit**

Run tests, build, keyboard check, and desktop/mobile visual playtest.

Commit: `feat: polish game hud and interaction surfaces`.

### Task 7: Rebuild the sales-stage presentation

**Files:**
- Modify: `public/game/index.html` `drawShop`/scene presentation only
- Modify: `public/game/game-feel.css`
- Modify: `public/game/game-feel.js`
- Modify: `src/test/game-feel-runtime.test.ts`

**Interfaces:**
- Consumes: existing `axis`, `path`, branch/product/payment labels, and level-4 state
- Produces: mall/store overview, product/payment visual layers, POS/escalator/customer animation, and level-4 responsive scene

- [ ] **Step 1: Write failing sales-scene contract tests**

Assert all protected sales labels/data remain unchanged while presentation changes correctly for branch, product, and payment axes.

- [ ] **Step 2: Implement the sales scene**

Create presentation-only store zones and activity without adding new clues, hints, or correctness signals.

- [ ] **Step 3: Verify and commit**

Run full tests/build and playtest all randomized sales axes with deterministic test seeds.

Commit: `feat: create immersive sales stage`.

### Task 8: Whole-game validation and polish

**Files:**
- Modify: only files required by observed regressions
- Update: `docs/superpowers/plans/2026-11-10-game-feel-implementation.md` checkboxes

**Interfaces:**
- Consumes: Tasks 1–7
- Produces: verified four-level game-feel release candidate; audio-ambience work remains deferred

- [ ] **Step 1: Run automated verification**

Run: `npm test` and `npm run build`.

- [ ] **Step 2: Run browser playtests**

Cover four levels, correct/wrong/fix/win/loss, timer pressure, mute, repeated navigation, desktop, mobile, RTL, keyboard, and reduced motion.

- [ ] **Step 3: Compare protected baseline**

Confirm Task 1 hashes and numeric fixtures remain identical.

- [ ] **Step 4: Commit final regressions only if needed**

Commit: `fix: finish game feel playtest polish`.

- [ ] **Step 5: Stop before remote actions**

Report results and wait for explicit authorization before push, PR, merge, deploy, or Lovable publication.
