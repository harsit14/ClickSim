# ✦ EMBER — Reignite the Universe

The universe is dead. You are the last ember.

EMBER is a desktop-first incremental browser game built with Svelte 5, TypeScript,
Canvas 2D, and the Web Audio API. It begins with one faint Heart in an empty sky.
Clicks create the first currency, Kindlings rebuild the world, and even the interface
arrives through progression. A quiet archivist named Lumen remembers why the prior
universe ended—and what may exist beyond it.

## Current state

- Seven complete playable universes: Emberlight, Tidefall, Verdance, Clockwork,
  Prismata, Tempest, and Canticle.
- Eighteen authored Kindling tiers per universe, each with local names, economy,
  visible world states, Archive records, sound, story, and progression laws.
- Every universe has its own five-part Vessel. A Beacon and universe crossing remain
  locked until that world's Vessel is activated; completing an earlier Vessel cannot
  bypass a later world.
- Save writer version 23 with migration support for every historical release, parked
  universe runs, per-universe Vessels, atomic backups, and rollback recovery.
- Desktop release hardening is complete. Mobile-specific interface work is intentionally
  deferred.
- The complete project gate currently passes 298 automated tests, TypeScript checks,
  content proofreading, production builds, bundle budgets, and offline inspection.

## Highlights

- **Progressive opening** — the counter, shop, upgrades, records, options, music, and
  advanced systems emerge through play. Guidance and contextual prompts are off by
  default and remain available from the menu.
- **Seven genuinely different worlds** — stable resonance, a living tide, aging
  cohorts, deterministic clockwork routing, spectral recipes, bounded storm discharge,
  and musical measures with strategic rests.
- **Living playfields** — every purchase changes the world through authored objects,
  ownership states, motion, and audio. Decorative and interactive objects preserve the
  Heart's click area and the readable status zone.
- **Local Epoch Turns** — Supernova, Undertow, Pruning, Rewinding, Refraction,
  Discharge, and Refrain exchange the current run for persistent local matter with an
  exact before/after preview.
- **The Observatory layer** — each universe localizes its permanent progression map.
  Verdance uses four contained Growth Ring paths and a World-Tree capstone.
- **Cross-generator economies** — the Resonance Atlas exposes every live relationship,
  its feeder, target, unlock, cost, and exact multiplier. Verdance has a twelve-link
  Rhizome network involving all eighteen Kindlings.
- **Field Archives** — twelve purposeful records per universe, grouped into three
  shelves with lore, mechanical effects, visible landmarks, and retained-state rules.
- **Omens and active opportunities** — Falling Stars, tide phenomena, pollinators,
  Maintenance Signals, optical events, storms, and refrains use bounded rewards and
  never punish a missed event.
- **The Deep** — a second prestige layer with local presentation, permanent laws,
  automation, repeatable works, and twelve trials.
- **The Crossing and Garden** — completed local Vessels carry restored worlds into the
  Dark Between. Seven Beacons open the authored Garden conclusion and continuing play.
- **Chronicle, builds, and Atlas routes** — dated milestones, named Beacons, law
  loadouts, shareable configuration codes, deterministic route records, and permanent
  Convergences.
- **Adaptive synthesized audio** — all music and effects are generated at runtime; no
  audio assets are shipped.
- **Accessibility and presentation controls** — keyboard play, reduced motion, strong
  or disabled beat guides, large text, high contrast, non-color state signals, mute-safe
  semantics, and automatic/high/balanced/low render budgets.
- **Player-respecting persistence** — autosave, offline progress, copy/download/import
  codes, rolling checkpoints, a daily backup, and an offline-capable static build.
- No advertisements, energy systems, expiring paid timers, or loss-based engagement
  traps.

## Run locally

Requirements: a current Node.js release and npm.

```bash
npm install
npm run dev
```

The development server is available at `http://localhost:5173` by default.

Production commands:

```bash
npm run build      # static output in dist/
npm run preview    # serve the production build locally
npm run verify     # types, tests, proofreading, build, budgets, and offline audit
npm run sim        # deterministic long-horizon balance simulation
```

The simulator covers 168 primary cases across seven universes, six activity profiles,
first visits, accelerated revisits, and Archive states. It also audits long-horizon
numeric safety and the endless law interaction matrix.

## How to play

Click the Heart at the center of the universe. The game reveals everything else through
progression.

- **Space / Enter** activates the Heart.
- **1–9** purchases visible Kindlings.
- **B** cycles the bulk-purchase amount.
- **G / I / O / C / V / S / D / E / L** opens the Field Guide, records, options,
  Archive, Vessel, local Epoch panel, Deep, Codex, and Legacy hub when available.
- **Escape** closes the active utility panel.
- Hover or focus an upgrade to inspect its effect and cost.
- Export a save code from Options before changing browsers or machines.

## Architecture

- `src/engine/` — economic transactions, formulas, and runtime state.
- `src/content/` — declarative universes, Kindlings, upgrades, story, progression, and
  retained-state definitions.
- `src/render/` — canvas world rendering, manifests, salience, Heart protection, and
  HUD-clearance geometry.
- `src/ui/` — Svelte panels and interaction layers.
- `src/audio/` — semantic synthesized music and effects.
- `balance/` — deterministic simulation and multi-profile contracts.
- `tests/` — economic, migration, content, accessibility, layout, release, and
  long-horizon regression coverage.
- `docs/` — current canonical-system, save, simulator, universe, and release contracts.

Game content is data-driven. The economic core is expressed as pure functions shared by
the live game, formula inspector, tests, and headless simulator. Production output is
split into core, expansion, endgame, and vendor chunks. CI rejects builds above the 3 MB
initial payload budget, assets above 1 MB, incomplete localization, invalid offline
precaches, failing tests, or stalled simulations.

## Design references

The original production design lives in [GAME_DESIGN.md](GAME_DESIGN.md). The integrated
seven-universe design bible and long-term contracts live in [FUTURE.md](FUTURE.md).
Current implementation decisions are recorded in [docs/](docs/).
