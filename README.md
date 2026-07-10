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

## Features (so far)

- **Buy-your-own-UI opening** — the game assembles itself from your first purchases, no tutorial needed
- **18 generator tiers**, from a single Spark to The Second Ember, each visible in the living background (low tiers glimmer near the ground; stars fill the sky)
- **65+ upgrades** through a data-driven modifier pipeline: refinements, click scaling, global dawns, and cross-generator synergies
- **66 achievements** — each grants +1% permanent Radiance; some are hidden, and at least one requires it to be 3 AM
- **Falling stars** — catch them for Frenzy (×7 production), Fury (×777 clicks), or a Gift of instant light
- **Adaptive, fully synthesized soundtrack** — no audio files; stems fade in as your empire grows (hearths bring mallets, stars bring strings, galaxies bring choir)
- **Rhythm combos** — click on the beat for climbing multipliers and rhythm blessings; a long enough streak pulls a falling star into reach
- **Supernova prestige** — collapse your universe in a full cutscene and keep the stardust: +2% production each, forever, plus the **Observatory**, a constellation skill tree you literally draw into the sky (production, clicking, star-weather, and rebirth branches)
- **Codex of Echoes** — recovered lore fragments of the universe that came before, growing darker as you climb; Act II of the story begins after your first collapse
- **Universes with their own identity** — crossings change the economy, soundtrack, click timbre, active power-ups, cabinet collection, lore, and living background rather than merely recoloring the canvas
- **The Field Guide** — a searchable in-game reference for every economy, active system, universe, collection, prestige layer, trial, story system, save tool, and control; live tables stay synchronized with the game’s content definitions
- **The Deep (layer 2)** — fold whole eras of stardust into singularities; buy automation (auto-buyers, a schedulable Nova Engine), study the live Resonance Atlas, and face twelve **trials** with permanent rewards
- **The Question** — Act III. When you are ready, Lumen finally tells the truth, and asks you three words back. Three endings; one is hidden behind a complete Codex. The ember wears your answer forever.
- **Vestments** — cosmetic accent themes earned by playing (recover echoes, brave the Deep, finish trials); your ending already recolors the ember itself
- **Accessibility** — honors `prefers-reduced-motion`; Space/Enter click the ember, keys 1–9 buy generators
- **Polish controls** — persistent reduced motion, strong/off visual beat guides, large text, high contrast, and automatic/high/balanced/low canvas budgets
- **Enforced launch budget** — production verification fails above a 3 MB initial payload or when any initial asset exceeds 1 MB
- **Saves that respect you** — autosave, offline progress, copy/download/import codes, three rolling recovery checkpoints plus a daily backup, and versioned migrations so an old save never breaks
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
```

Balance simulator (plays 40 hours in every universe as idle and active greedy bots,
prints tier/milestone timing and the longest sensible-purchase wall — run after any
economy change to catch dead zones; use `--universe=tidefall` to isolate one pack):

```bash
npm run sim
npm run sim -- --universe=tidefall
```

## How to play

Click the pulsing ember. That's genuinely all you need to know — the game
teaches everything else by letting you buy it.

- **Space / Enter** also click the ember
- **G / I / O / C / V / S / D / E** open the Guide, Stats, Options, Cabinet, Vessel, Observatory, Deep, and Codex when available
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

~30 KB gzipped.

## Design

The full game design and production plan lives in
[GAME_DESIGN.md](GAME_DESIGN.md) — vision, story arc, economy math, prestige
layers (coming in M3), and the roadmap.
