# Problem Decomposition — Game Feel and Presentation Design

## Intent

Turn the existing learning experience into a more dramatic, lively browser game while preserving the current analytical exercise exactly. The work improves what the player sees, hears, and feels; it does not change what the player is asked to analyze or how answers are evaluated.

Baseline snapshot: commit `65dae2b` on `feature/egyptian-city-voices`.

## Non-negotiable gameplay lock

The following are immutable for this project:

- Every story, clue, evidence sentence, option, cause, lesson, label, number, timer, budget, penalty, score, result, and answer.
- The data and behavior in `CITY_DIMS`, `SHOP_DIMS`, `CITY`, `level1`, `level2`, `level3`, `level4`, `FEAT`, `MAKERS`, and `PENALTY`.
- The decomposition tree, random selection rules, fault planting, calculation, scoring, win/loss conditions, progression, reflection comparison, and saved progress.
- The meaning and target of existing controls and `data-act` actions.

Presentation code may read gameplay state, but it must not mutate gameplay data or create a second source of truth.

Before presentation work begins, characterization tests will lock the protected content and logic. An accidental change to the protected baseline must fail the test.

## Chosen approach

Enhance the current DOM/SVG architecture as a layered, living 2D city. Do not migrate to Phaser or introduce a new rendering engine. This preserves the working logic, keeps loading light, and lets the game receive substantial visual polish without a risky rewrite.

Alternatives considered:

- Small cosmetic polish only: safer but not enough to create the desired game feeling.
- Phaser migration: more appropriate for an action game, but too risky and unnecessary for the current analytical interaction.

## Visual direction

- Keep the Egyptian city identity and the current friendly illustrated language.
- Make the city the main playfield rather than surrounding it with dashboard-like chrome.
- Use a restrained night palette during the outage and warm, spreading light after restoration.
- Give each place a recognizable silhouette and activity: homes, hospital, industrial buildings, streets, and the sales location.
- Reserve strong motion for meaningful state changes. Ambient movement stays subtle.

## Implementation phases

### 0. Protect the analytical game

- Add characterization fixtures for the immutable data, copy, numbers, results, and action wiring, plus runtime scenarios with deterministic injected randomness. Do not snapshot the whole HTML file because that would block presentation changes.
- Record the baseline hash/fixture from commit `65dae2b`.
- Add a short code comment marking the protected gameplay region.

### 1. Presentation foundation

- Introduce presentation-only CSS variables for palette, depth, easing, and motion duration.
- Organize the existing SVG into background, middle-ground, gameplay, characters, and foreground layers.
- Add parallax clouds, skyline depth, power cables, street silhouettes, window variation, and subtle environmental motion.
- Respect `prefers-reduced-motion` and keep the playfield readable on mobile.

### 2. State-driven visual feedback

- Proven cause/fix only: after the existing `fixLeaf` event, show a restrained confirmation pulse and light travelling along the relevant wire/path. Opening a dimension or branch remains visually neutral so the presentation does not reveal whether the player's analytical direction is correct.
- Wrong choice: brief local flicker and small scene reaction, without obscuring evidence or changing the penalty.
- Time pressure: visual urgency only; no timer or timing changes.
- Win: breaker pulse, power wave across districts, sequential windows, character celebration, then stable warm city lighting.
- Loss: generator/light weakening, atmosphere settling, and the existing dialogue reaction.

### 3. Characters and dialogue presentation

- Add idle breathing, blinking, mood-specific posture, and simple mouth movement while recorded dialogue plays.
- Preserve every dialogue line and its current duration mapping.
- Keep bubbles on screen for their audio duration and prevent them from covering critical controls.
- Reuse the SVG character system and extend it with small reusable pose parts rather than external character frameworks.

### 4. Game-native UI polish

- Restyle the existing controls without renaming, reordering semantically, or changing their actions.
- Present attempts/budget with fuse or breaker imagery while retaining the exact numeric value.
- Present the decomposition path as an illuminated cable/path while retaining the same hierarchy and labels.
- Reduce dashboard appearance, protect the central playfield, and move secondary information into lightweight contextual surfaces.
- Keep keyboard focus, contrast, touch targets, RTL layout, and reduced-motion behavior accessible.
- Keep interactive controls inside the existing `#game` event-delegation boundary and preserve `.zone[data-z]`, the zone-to-tile mapping, stage state classes, and current DOM action order.

### 5. Sales-stage presentation

- Give level 4 its own electronics-store/mall scene with shelves, counter, POS, escalator, customers, and staff.
- Visually react to branch/product/payment decomposition without changing any sales clue, option, data, number, or answer.
- Use the same visual grammar as the city so it feels like a new chapter of the same game.

### 6. Audio pass — deferred

- Keep the current voiceovers and restored licensed SFX intact.
- Later add separate ambience, dialogue, SFX, and music buses with dialogue ducking.
- Add environmental layers and event sounds only after visual phases are stable.
- Generate or source city, wind, rain, bats, generator, celebration, and sales ambience with a provenance manifest.
- Generate the sales-stage voiceovers in a dedicated later pass.

## Verification

- Protected-content tests must remain unchanged and green.
- Existing audio asset and character mapping tests must remain green.
- Production build must succeed.
- Playtest all four levels on desktop and mobile widths.
- Verify correct, wrong, win, loss, timer-pressure, mute, RTL, and reduced-motion states.
- Compare gameplay output against baseline to confirm no analytical content or result changed.
- Confirm win and loss animation is non-blocking and never delays or disables existing navigation actions.

## Delivery boundaries

- Work remains on focused commits on `feature/egyptian-city-voices` unless a new feature branch is requested.
- No push, merge, PR, deployment, or Lovable publication occurs without explicit authorization.
- Audio generation that spends credits is limited to explicitly approved items and is not retried automatically.
