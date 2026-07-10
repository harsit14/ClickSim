# ✦ EMBER — Reignite the Universe

The universe is dead. You are the last ember.

EMBER is an incremental (clicker/idle) browser game that begins as a literally
empty black screen — one faint, breathing point of light. Every click is a
heartbeat. Light becomes Sparks, Sparks become Hearths, Hearths become Suns,
and the void slowly fills with everything you've built. Even the interface is
something you buy: the counter, the shop, the stats — and eventually, *a voice
in the dark*: the music itself.

A quiet narrator, **Lumen** — the last archivist of the old universe — watches
you work, and slowly lets slip what happened to the last one.

## Features

- **Buy-your-own-UI opening** — the game assembles itself from your first purchases, no tutorial needed
- **18 generator tiers**, from a single Spark to The Second Ember, each visible in the living background (low tiers glimmer near the ground; stars fill the sky)
- **65+ upgrades** through a data-driven modifier pipeline: refinements, click scaling, global dawns, and cross-generator synergies
- **66 achievements** — each grants +1% permanent Radiance; some are hidden, and at least one requires it to be 3 AM
- **Falling stars** — catch them for Frenzy (×7 production), Fury (×777 clicks), or a Gift of instant light
- **Adaptive, fully synthesized soundtrack** — no audio files; stems fade in as your empire grows (hearths bring mallets, stars bring strings, galaxies bring choir)
- **Rhythm combos** — click on the beat for climbing multipliers and rhythm blessings; a long enough streak pulls a falling star into reach
- **Supernova prestige** — collapse your universe in a full cutscene and keep the stardust: +2% production each, forever, plus the **Observatory**, a constellation skill tree you literally draw into the sky (production, clicking, star-weather, and rebirth branches)
- **Codex of Echoes** — recovered lore fragments of the universe that came before, growing darker as you climb; Act II of the story begins after your first collapse
- **Seven complete universes** — Emberlight, Tidefall, Verdance, Clockwork, Prismata, Tempest, and Canticle each own their economy, soundtrack, click timbre, archive, story, living background, reset language, and strategic law
- **Seven different signature mechanics** — stable resonance, a living tide, aging cohorts, deterministic routing, spectral recipes, bounded storm discharge, and visible measures with strategic rests
- **The Field Guide** — a searchable in-game reference for every economy, active system, universe, collection, prestige layer, trial, story system, save tool, and control; live tables stay synchronized with the game’s content definitions
- **The Deep (layer 2)** — fold whole eras of stardust into singularities; buy automation (auto-buyers, a schedulable Nova Engine), study the live Resonance Atlas, and face twelve **trials** with permanent rewards
- **The Question** — Act III. When you are ready, Lumen finally tells the truth, and asks you three words back. Three endings; one is hidden behind a complete Codex. The ember wears your answer forever.
- **The Garden** — seven Beacons close the authored saga by placing the restored worlds in relationship; living all three answers unlocks the reconciled “Continue” ending
- **The Chronicle and law loadouts** — dated world milestones, player-named Beacons, personal route records, saved builds, and shareable codes that never import progression
- **The Atlas of Possible Worlds** — seeded combinations of compatible authored laws, temporary runs that park the source world intact, deterministic replay records, and permanent non-expiring Convergences
- **Vestments** — cosmetic accent themes earned by playing (recover echoes, brave the Deep, finish trials); your ending already recolors the ember itself
- **Accessibility** — honors `prefers-reduced-motion`; Space/Enter click the ember, keys 1–9 buy generators
- **Polish controls** — persistent reduced motion, strong/off visual beat guides, large text, high contrast, and automatic/high/balanced/low canvas budgets
- **Enforced launch budget** — production verification fails above a 3 MB initial payload or when any initial asset exceeds 1 MB
- **Saves that respect you** — autosave, offline progress, copy/download/import codes, three rolling recovery checkpoints plus a daily backup, v1→v22 migrations, and an offline-capable static build
- **Translation-ready content** — the release build extracts more than 2,300 English source messages into a stable keyed catalog and proofreads them in CI
- No ads, no timers that punish you, no dark patterns. The game wants you back because it's warm, not because it scolds you.

## Run it

```bash
npm install
npm run dev        # dev server at http://localhost:5173
```

Production build (static, host anywhere):

```bash
npm run build      # outputs dist/
npm run preview    # serve the production build locally
npm run verify     # types, tests, proofreading, build, budgets, offline audit
```

Balance simulator (168 deterministic cases across all seven universes, six play styles,
first visits, accelerated returns, and Archive states; projects five years beyond the
native JavaScript number range and audits the endless law matrix):

```bash
npm run sim
```

## How to play

Click the pulsing ember. That's genuinely all you need to know — the game
teaches everything else by letting you buy it.

- **Space / Enter** also click the ember
- **G / I / O / C / V / S / D / E / L** open the Guide, Stats, Options, Cabinet, Vessel, Observatory, Deep, Codex, and Legacy hub when available
- **B** cycles bulk-buy and **Escape** closes the active utility panel
- Hover an upgrade chip (top bar) for its effect and cost
- Once the music plays, clicking in time with the pulse builds a combo
- Catch the ✦ that occasionally streaks across the sky
- Your save lives in the browser; export a save code from ⚙ options before switching machines

## Tech

Vite + Svelte 5 (runes) + TypeScript. Canvas 2D rendering, Web Audio API for
all sound and music (zero asset files). Game content — generators, upgrades,
achievements, story lines — is declarative data; the engine's economic core is
pure functions shared by the game and the headless balance simulator.

The build is split into core, expansion, endgame, and vendor chunks. CI enforces a
3 MB aggregate launch budget, a 1 MB per-asset ceiling, relative static URLs, and a
complete offline precache.

## Design

The original design lives in [GAME_DESIGN.md](GAME_DESIGN.md). The seven-universe,
Garden, Atlas, and release contracts are specified in [FUTURE.md](FUTURE.md).
