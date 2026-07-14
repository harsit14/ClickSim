# EMBER — Current Game State

> A story-driven incremental game about rebuilding a dead universe—and deciding what the next one should become.

This README is the single canonical project document. It describes the game as it exists now; older design proposals, rebuild plans, audits, and phase reports have been retired. The implementation, manifests, and automated tests remain the final authority when this overview and code ever disagree.

## Status at a glance

EMBER is a desktop-first browser game built with Svelte 5, TypeScript, Vite, Canvas 2D, and the Web Audio API. The complete seven-realm route is playable in the development build, including its endings, the Garden synthesis, and continuing Atlas routes. Music and sound effects are synthesized at runtime.

The game is still being refined for formal public release. Browser saves are local; there is no account or cloud-sync service. External Hindu cultural consultation and South Asian art and iconography review remain release gates.

The project has no ads, gacha, energy timers, paid boosts, expiring rewards, or punishment for missing a timed event. Missing an opportunity may change immediate yield, but never removes existing progress.

## The seven realms

Each realm has its own economy, visual language, soundscape, active system, Archive, trials, story, and ending ritual.

| Realm | Core identity | Heart | First reset | Archive | ID |
|---|---|---|---|---|---|
| **Emberlight** | Rebuild warmth, settlement, and a remembered sky | Last Ember | Supernova / Stardust | Astral Cabinet | `emberlight` |
| **Tidefall** | Raise Glow through a moonless living ocean | Tideheart | Turning tide | Pelagic Archive | `tidefall` |
| **Verdance** | Grow living cohorts that root, mature, remember, and renew | First Seed | Pruning / Memory Seeds | Impossible Herbarium | `verdance` |
| **Clockwork** | Route deterministic power through a civic machine | Escapement Heart | Rewinding / Mainsprings | Patent Ledger | `clockwork` |
| **Brahmalok** | Unfold possibility through seed, measure, name, and form | Lotus of Becoming | Epoch Recomposition | Archive of First Forms | `brahmalok` |
| **Vishnulok** | Sustain continuity through refuge, correction, and return | The Endless Circuit | Renewal | Ocean of Continuance | `vishnulok` |
| **Kailash** | Approach release with shelter, grace, stillness, and renewal visible | The Still Point | Release | Mountain Witness | `kailash` |

Every realm and its content use the current canonical name as their internal namespace. Brahmalok, Vishnulok, and Kailash therefore use `brahmalok-`, `vishnulok-`, and `kailash-` content IDs.

### Terminology contract

- **Realm** is the public umbrella term for any of the seven playable destinations.
- **Restored world** refers specifically to Emberlight, Tidefall, Verdance, or Clockwork.
- **Loka** refers specifically to Brahmalok, Vishnulok, or Kailash.
- **World** by itself is reserved for the local reset scope: currency, current-run earnings, Kindlings, ordinary upgrades, and buy mode.
- **Universe ID** is the implementation term for a realm’s canonical key, such as `emberlight`, `brahmalok`, or `kailash`.

### Current world presentation

- **Emberlight** is the flagship authored world: settlement, constellations, celestial machinery, and landmarks accumulate around a protected central Heart.
- **Tidefall** inverts the composition into an ocean. Its mid-depth band contains sparse migrations and drifting forms tied to owned Kindlings while the trench keeps intentional negative space.
- **Verdance** has a canopy, visible ground line, root network, botanical landmarks, and on-canvas cohort aging. New, rooted, mature, and ancient growth reads through height, rings, and density before numbers are read.
- **Clockwork** is a deterministic machine floor whose routing and maintenance state remain visually legible.
- **Brahmalok** unfolds as a four-direction creation mandala rather than a collection of interface badges.
- **Vishnulok** carries visible shelter and Returning School traffic along its orbital circuits. Its running instrument settles to one summary strip plus threshold meter; configuration controls appear only when explicitly expanded.
- **Kailash** keeps an austere mountain composition without becoming empty. Sparse snow, shelter lights, wind lines, authored mountain objects, and ownership-driven landforms occupy the ambient layer. The Still Point remains visible and clickable through the Open Summit aperture instead of turning into a black occluded disk.

World objects use material silhouettes rather than rounded app-icon badges. New objects must have an authored identity, silhouette, interior structure, grounding, palette fit, and legible 32 px flat-black silhouette; a naked circle, square, line, or generic pill is not a finished world object. Existing accessible names and interaction hit areas are preserved.

Ownership changes form at the thresholds **1 / 10 / 25 / 50 / 100**. These thresholds add structure, material, scale, or role; they do not simply stamp more identical objects onto the canvas. Density and salience are capped so the Heart, current decision, and major feedback retain hierarchy.

## Progression and reset contracts

The central input is the realm's **Heart**. Every realm has 18 producer tiers called **Kindlings**, ordinary upgrades, bounded active opportunities called **Omens**, and a 12-record Archive arranged in three shelves.

Progress is intentionally scoped:

| Scope | State contained here |
|---|---|
| **World** | Currency, current-run earnings, Kindlings, ordinary upgrades, and buy mode |
| **Epoch** | Local Epoch Matter, doctrines or projects, and era earnings |
| **Deep / history** | Singularities or Deep laws, trials, Archives, Echoes, story, and local records |
| **Between** | Beacons, Dark Between, Wayfinder, per-realm Vessels, achievements, preferences, Chronicle, Garden, and Atlas |

The destructive boundaries are fixed:

- **Epoch Turn** is the local first prestige. It replaces World state and preserves deeper scopes.
- **Deep Collapse** is the local second prestige. It replaces World and Epoch state while retaining Deep progression and history.
- **Crossing** parks the complete local realm state. It is navigation, not a reset.
- **Beacon** consumes nothing. It is permanent proof that a realm is complete.
- **Remembrance** resets only the active local run. Other parked realms remain intact.
- **Garden** is the synthesis of all seven Beacons, not an eighth realm.
- **Atlas** is a deterministic post-saga route system.
- Only an explicit full save wipe clears all active state, parked realms, history, and Between progression.

Any reset confirmation must state what changes, what remains, and the reward before the player commits.

## Interface and feedback standards

The current interface protects these qualities:

- The Heart is immediately legible and remains the primary target.
- The world visibly accumulates authored objects instead of becoming a dashboard.
- Each realm has a distinct instrument and visual grammar.
- The Field Guide, Options, save recovery, and accessibility controls remain reachable.
- Reset flows use cautious comparison and confirmation language.
- Persistent information does not cover purchase targets, panel headers, or controls.

Screen composition follows a feedback hierarchy: one primary target, a small number of secondary objects, bounded temporary rewards, one subtitle, and at most one major panel. A density governor reduces ambient detail before it compromises controls or meaning.

Transient achievements, Echoes, and shorthand messages share one central reserved notification lane with queueing. They must not cover the HUD counter or an open panel's header and controls in any realm.

Text participates in layout flow. Micro-labels and sub-labels belong to grids or normal document flow rather than absolute coordinates, so large text can reflow without overlaps or clipping.

## Accessibility

Every required mechanic has keyboard and pointer access. Essential meaning is never conveyed by color, animation, or sound alone. The Options panel provides:

- reduced motion, including static equivalents for ambient movement;
- large text and reflow-safe panels;
- high contrast and explicit non-color state labels;
- mute-safe visual and timing equivalents;
- beat-guide strength and averaged rhythm support;
- render-quality controls that reduce ambient density before functional content.

The supported visual QA sizes are **1440×900** and **1280×800** in default mode and in the combined large-text, high-contrast, reduced-motion mode. The game is currently desktop only.

## Cultural guardrails for the three lokas

Hindu traditions are diverse; these realms are original game fiction shaped by careful environmental themes, not representations of a single definitive tradition. Brahmalok, Vishnulok, and Kailash are environment-first. Sacred beings and attributes are never currencies, generators, upgrades, enemies, bosses, loot, joke achievements, cabinet collectibles, or controllable instruments.

Saraswati, Lakshmi, and Parvati are not accessories to a progression system. Their names, presences, and associated traditions require restraint and contextual review. A qualified cultural consultant and South Asian iconographic reviewer must review this material before public release. External cultural review remains a release gate even when automated tests and internal QA pass.

Public loka names may appear in live UI only after their environment, mechanics, copy, and route are implemented together.

## Saves and compatibility

The current save schema is version **23**. Economy values use canonical base-10 strings in persisted data and normalized mantissa/exponent values at runtime; older numeric saves migrate through the compatibility path. Version 22 introduced Chronicle, Garden, and Atlas state. Version 23 made Vessel progression local to each realm.

Save rules:

- IDs are never reused or remapped by array position.
- New realm content stays within its canonical realm namespace.
- Import validates structure and content before replacing the active save.
- The game autosaves locally and supports export codes, downloadable backups, rolling recovery checkpoints, and offline progress.

## Controls

| Input | Action |
|---|---|
| Click, <kbd>Space</kbd>, or <kbd>Enter</kbd> | Activate the Heart |
| <kbd>1</kbd>–<kbd>9</kbd> | Buy a visible Kindling |
| <kbd>B</kbd> | Cycle bulk purchase amount |
| <kbd>G</kbd> | Open the Field Guide |
| <kbd>I</kbd> | Open run records |
| <kbd>O</kbd> | Open Options |
| <kbd>C</kbd> | Open the current Archive |
| <kbd>V</kbd> | Open the Vessel |
| <kbd>S</kbd> | Open the local Epoch system |
| <kbd>D</kbd> | Enter the Deep |
| <kbd>E</kbd> | Open the Story Archive |
| <kbd>L</kbd> | Open the Legacy hub |
| <kbd>Escape</kbd> | Close the active panel |

Controls appear as their systems awaken. In development, <kbd>F10</kbd> opens the Dev Playtest Panel.

## Run locally

Install a current Node.js release and npm, then:

```bash
npm install
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`.

Development states can be reached without modifying progression:

```text
http://localhost:5173/?scenario=kailash&playtest=1
```

Available scenario names are `opening`, `ember-camp`, `midgame`, `ember-cosmic`, `ember-postnova`, `endgame`, `question`, `crossing`, `tidefall`, `verdance`, `pruning`, `clockwork`, `brahmalok`, `vishnulok`, `kailash`, `garden`, and `markets`. The Dev Playtest Panel and `window.__ember` expose development-only navigation and state cheats.

## Verification and release workflow

```bash
npm run verify   # TypeScript, tests, proofing, production build, budgets, offline audit
npm run test     # Node test suite
npm run build    # Static production build in dist/
npm run budget   # Production asset budget
npm run preview  # Preview the production build
npm run sim      # Headless balance simulation
```

Every presentation change should be exercised in the running game, tested at both supported desktop viewports, and checked in the combined accessibility mode. Economy, balance, mechanics, and content meaning must not change during visual-only work. World-manifest changes go through their validators rather than bypassing them.
