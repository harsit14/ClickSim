# EMBER — Reignite the Universe
### Master Design & Production Plan for an Addictive Browser Clicker

---

## 1. Vision

**One-line pitch:** The universe is dead. You are the last ember. Every click is a heartbeat that brings light back — starting from a single pixel on a pitch-black screen and ending with you painting galaxies.

**Design pillars:**

1. **The screen IS the progression.** The game starts as a literally empty black screen. Every UI element — the counter, the shop, the music, even the settings button — is something you *buy*. Watching the game itself materialize is the core fantasy.
2. **Every click feels delicious.** Sound, particles, screen response, and numbers must make a single click satisfying on its own, before any strategy exists.
3. **Always two carrots.** At any moment the player can see something affordable *now* and something aspirational *soon*. No dead air, ever.
4. **Depth reveals itself.** A beginner sees "click thing, buy thing." A hardcore player sees prestige optimization, synergy webs, challenge runs, and rhythm-combo tech. Same game, zero tutorials required.
5. **Respect the player.** Addictive through delight, not dark patterns: full offline progress, no energy systems, no ads, export-your-save-anytime.

**Inspirations & what we take/beat:**

| Game | Steal this | Beat it by |
|---|---|---|
| Cookie Clicker | Cost curves, golden cookies, achievement "milk" | Actual story, evolving visuals, adaptive music |
| Universal Paperclips | UI that unlocks piece-by-piece, narrative phases | Beauty and sound; Paperclips is deliberately sterile |
| A Dark Room | Mystery-first storytelling, minimal opening | Richer long-game and prestige depth |
| Antimatter Dimensions | Challenge runs, layered prestige | Gentler on-ramp, visual spectacle |
| Candy Box | Whimsy, hidden surprises | Coherent world and persistent progression |

---

## 2. Story & World

### Premise
Heat death has taken everything. One ember remains — you. A quiet voice, **Lumen** (the last archivist of the old universe), notices you flicker and begins to speak. Your light literally rebuilds reality, and as it spreads, Lumen recovers **Echoes**: memory-fragments of the civilization that burned itself out.

### The mystery (the hook that makes people keep playing)
Echoes slowly reveal that the old universe didn't just fade — something *consumed* it. In Act III the twist lands: **the ember is the consumer.** You are the entity that devoured the last universe, reduced to a spark, and Lumen has known all along. The rekindling is either your redemption or your next feeding cycle — the final prestige lets the player choose, giving two endings (plus a secret third for 100% achievements: Lumen's own confession).

### Three acts, mapped to game phases
- **Act I — The Ember (0 → first prestige):** intimate, quiet, tutorial-by-discovery. Lumen is curious about you.
- **Act II — The Forge (prestige layers 1–2):** civilization-scale. Echo fragments become darker; Lumen grows evasive.
- **Act III — The Devourer (layer 3 → endings):** cosmic scale, the truth, the choice.

### Narrative delivery (never blocks gameplay)
- Lumen speaks in a one-line ticker at the bottom of the screen (Cookie Clicker news-ticker style, but with an arc).
- **Echoes** are collectible lore cards earned at milestones/achievements — readable in a Codex, each with unique art.
- Major beats (first prestige, act transitions, endings) trigger **in-engine cutscenes** (see §9).

---

## 3. The Core Loop

```
CLICK the Ember  →  earn LIGHT  →  buy GENERATORS (passive Light/sec)
      ↑                                     ↓
  upgrades make clicks scale off passive income
      ↑                                     ↓
ACHIEVEMENTS grant permanent %  ←  MILESTONES unlock upgrades/story
                                            ↓
              wall reached → PRESTIGE (Supernova) → STARDUST
                                            ↓
              permanent multipliers + new mechanics each reset
```

**Session loop (minutes):** click bursts → afford next generator → number goes up → small dopamine hit.
**Day loop (hours):** upgrade tiers, achievement hunting, falling-star events, offline gains to collect.
**Meta loop (weeks):** prestige resets, story acts, challenge runs, endings.

### The first 120 seconds (most important design in the game)
1. Black screen. A faint warm pixel pulses at center. No text, no UI. (Curiosity does the tutorial's job.)
2. First click: soft *thump*, a spark particle, the ember grows 2%. A number floats up: `+1`.
3. ~10 clicks: the ember is visibly a small flame. Lumen's first line fades in: *"...oh. You're awake."*
4. ~25 clicks: first purchase appears — not a generator, but **the Light counter itself** (cost: 10 Light). The player buys their own HUD.
5. Then in sequence they buy: the shop panel (25), their first generator "Spark" (15), the stats line (50), the options gear (100), the music (500 — the moment audio blooms in is a designed goosebump; see §8).
6. By minute 5 the player has assembled the game's interface with their own hands and understands everything without a single tutorial popup.

---

## 4. Currencies & Numbers

| Currency | Earned by | Spent on | Layer |
|---|---|---|---|
| **Light** | Clicking + generators | Generators, upgrades | Base |
| **Radiance** | Achievements (1 each) | Nothing — each = +1% global production (Cookie Clicker "milk") | Base |
| **Stardust** | Prestige 1: Supernova | Permanent multipliers, new mechanics, Constellation tree | Prestige 1 |
| **Singularities** | Prestige 2: Collapse | Automation, challenge unlocks, Stardust gain multipliers | Prestige 2 |
| **Echo Shards** | Story milestones, hidden achievements | Codex art, cosmetic themes, Lumen dialogue branches | Meta |

**Big number handling:** use `break_eternity.js` (handles up to 10^^1e308). Display with standard suffixes (K, M, B, T, then aa, ab...) plus optional scientific/engineering notation toggle for hardcore players.

### Core math (industry-proven curves, tuned)
- **Generator cost:** `cost = base × 1.15^owned` (the canonical Cookie Clicker curve; keeps ~7–10 purchases per tier feeling right).
- **Each tier's base production** ≈ 8–10× the previous tier, base cost ≈ 12–15×, so higher tiers are always briefly "too expensive" then dominant.
- **Click power:** base 1, but the key upgrade line converts clicks to `% of Light/sec` (0.5% → 1% → 2%...). This keeps clicking relevant forever without RSI-mandatory gameplay.
- **Prestige formula:** `stardust = floor((totalLightEverEarned / 1e12)^0.5)`. Square root = strong early prestiges, diminishing returns force strategy about *when* to reset.
- Each Stardust = +2% permanent production (multiplicative with everything).

---

## 5. Content Systems

### 5.1 Generators (18 tiers, thematically escalating)
| # | Name | Flavor |
|---|---|---|
| 1 | Spark | A fleck of you, set loose |
| 2 | Wisp | It dances. It shouldn't. It does |
| 3 | Hearth | The first place warmth calls home |
| 4 | Kiln | Light, concentrated into making |
| 5 | Forge | Where light learns to work |
| 6 | Beacon | Light that calls to nothing... yet |
| 7 | Furnace Titan | A heart the size of a hill |
| 8 | Star Seed | Plant it. Wait. Believe |
| 9 | Protostar | The waiting pays off |
| 10 | Sun | You remember how to make these |
| 11 | Binary Pair | Suns are less lonely in twos |
| 12 | Constellation | You're drawing with stars now |
| 13 | Nebula Garden | Stellar nurseries, tended by wisps |
| 14 | Galaxy | A hundred billion of your children |
| 15 | Supercluster | Structure at the scale of everything |
| 16 | Cosmic Web | The filaments between all things |
| 17 | Deep Loom | Where reality is woven (Act III) |
| 18 | The Second Ember | ...it looks back at you (secret, endgame) |

Each generator has: unique icon, 3 visual states on the canvas (owning 1 / 10 / 100 changes what you *see* in the world — see §7), flavor text, and per-tier upgrade lines.

### 5.2 Upgrades (~300 at v1.0)
- **Tiered generator upgrades:** at 10/25/50/100/150/200 owned → ×2 that generator.
- **Synergy upgrades** (the hardcore candy): "Suns produce +1% per Hearth owned," "Wisps boost click power," etc. Creates a web that min-maxers theorycraft.
- **Click line:** click → % of passive income; crit clicks (5% chance ×10, upgradeable); "afterglow" (clicking leaves a 3s production buff).
- **Global multipliers:** milestone-gated ×2s that reset the "wall" pacing.
- **Quality-of-life as content:** buy autosave frequency, buy bulk-buy (×10/×100/max), buy the offline-progress cap increase, buy auto-clickers (late). QoL-as-purchasable makes even convenience feel like progression.

### 5.3 Achievements (~250 at v1.0, each grants +1% Radiance)
Categories: production milestones, ownership counts, click counts, prestige feats, speed feats ("reach 1M Light within 5 min of a reset"), event feats, and **~40 hidden/joke achievements** ("Click the ember 7 times while the shop is empty: *Impatience*", "Rename nothing: *It Was Already Perfect*", "Open the codex at 3am local: *Night Reader*"). Hidden achievements are the #1 driver of community wikis and word-of-mouth.

Achievement toast: corner banner + unique chime + the Radiance jar visibly filling. Radiance jar itself is a purchasable HUD element with cosmetic skins.

### 5.4 Random events — "Falling Stars"
Every 3–8 minutes a falling star streaks across the screen; clicking it grants one of: ×7 production for 77s ("Frenzy"), instant Light (15 min of production), ×777 click power for 13s ("Fury"), or rare weird effects ("Gravity Well": clicks anywhere on screen count as ember clicks for 10s). Late upgrades let stars come in showers, chain, or be attracted. This is the anti-AFK heartbeat that keeps active play optimal-but-optional.

### 5.5 Rhythm combos (our signature mechanic — no other clicker has this)
The adaptive soundtrack (§8) has a beat. Clicking **on-beat** builds a combo meter: 8-beat streak = ×2 clicks, 16 = ×4, 32 = ×8, with an on-screen pulse ring around the ember showing the beat window. Miss = combo resets. Beginners can ignore it entirely; hardcore players learn to "play the ember like an instrument." Accessibility toggle: visual-only beat indicator, or disable combos and average the bonus in.

### 5.6 Prestige layers
- **Layer 1 — Supernova** (unlocks ~2–4 hours in): reset Light + generators for Stardust. First supernova is a full cutscene. Stardust buys the **Constellation Tree** — a literal star-map skill tree where nodes are stars and chosen paths draw glowing constellation lines (12 constellations, each a build archetype: Clicker, Idle, Event-focused, Combo, etc.).
- **Layer 2 — Collapse** (days in): reset Stardust structure for Singularities → automation (auto-buyers, auto-prestige rules the player scripts with simple triggers: "supernova when stardust gain ≥ ×1.5"), plus **Challenge Runs**: 12 modifier runs ("Silence": no music/combos; "Entropy": costs scale 1.30^n; "Blackout": UI elements must be re-bought) each granting unique permanent rewards.
- **Layer 3 — The Question** (weeks in): story-gated, sets up the endings. Deliberately not a numeric layer — it's a narrative decision engine with three endings and NG+ ("Remembrance" mode: restart with all Echoes kept and new Lumen dialogue).

### 5.7 The Shop(s)
- **Generator panel** (right side): the classic buy-list with count, cost, /sec, and bulk toggles.
- **Upgrade bar** (top): Cookie Clicker-style icon row of affordable upgrades — glowing when buyable.
- **Stardust Observatory** (post-prestige screen): the constellation tree.
- **Echo Bazaar** (cosmetics only, bought with Echo Shards): UI themes (Blueprint, Vellum, Void, CRT), ember skins, particle styles, music variants. Zero gameplay power — pure expression.

### 5.8 Beginner ↔ hardcore bridge
- **Beginner:** the "next best purchase" is subtly highlighted (toggleable); tooltips show plain-language payback ("pays for itself in 3m 12s"); nothing is missable; no timed FOMO.
- **Hardcore:** stats panel (all-time numbers, session, per-generator DPS breakdown), notation options, hotkeys (1–9 buy, B bulk toggle, S supernova), challenge runs, synergy web, rhythm tech, speedrun timer mode, and an in-game "Almanac" graphing Light-over-time.

---

## 6. Retention Architecture (the "addictive" engineering, done ethically)

- **Variable-ratio rewards:** falling stars + crit clicks (the slot-machine schedule, but costs nothing).
- **Appointment mechanics without FOMO:** offline progress (base 50% rate, upgradeable to 100%, capped hours upgradeable) means *returning* always feels like a gift, never a punishment. "Welcome back — your suns made 4.2M Light" screen with a satisfying collect button.
- **Near-miss visibility:** the next locked upgrade is always shown grayed with its cost — "just 20% more."
- **Session-end hooks:** Lumen occasionally ends a story beat on a cliffhanger line; the ticker shows "something stirs at 1e15 Light..."
- **Streaks, not penalties:** consecutive-day play gives a small "Kindled" buff (+5%/day, cap +25%); missing days just pauses it — never resets it.
- **What we deliberately exclude:** ads, energy timers, pay-anything, loss-on-absence, notification spam. The game should be a warm place, and warm places get revisited.

---

## 7. Visual Design

### Art direction
**"Light against the void."** Near-black canvas (#07070d, never pure black), all luminance comes from game objects. Warm ember palette (amber → gold → white-hot) against cool voids (deep indigo, teal nebulae). Typography: a humanist serif for Lumen/story (e.g., Fraunces), clean geometric sans for numbers/UI (e.g., Inter/Space Grotesk tabular figures — numbers must not jitter as they change width).

### The living background (the game's biggest visual flex)
The entire screen is a canvas that **evolves with your empire**. Own Hearths → tiny warm dots appear in the darkness below. Own Suns → they hang in the sky, actually glowing (bloom shader). Constellations literally connect your stars. By endgame the void is a painted cosmos — and prestige *visibly* collapses it back to black in the supernova cutscene, making the loss/rebirth emotional, not just numeric. Rendered with PixiJS (WebGL) with a canvas-2D fallback.

### Juice checklist (every interaction)
- Click: ember squash-and-stretch, spark burst particle (pooled), floating `+N` with slight random arc, sub-50ms audio.
- Purchase: button press-down, coin-shimmer sweep, generator icon "lands" into the world with a thud particle.
- Big milestones: brief slow-motion + bloom flare (never screen-shake spam; reserve shake for supernovae only).
- Numbers animate by counting (lerp), never snap.
- Idle screen is never static: ember breathes, wisps drift, stars twinkle at ~1% CPU.

### Layout
Three-zone desktop layout: world canvas center-left (dominant), generator list right rail, upgrade strip top, Lumen ticker bottom. Fully responsive: on mobile the rails become swipeable bottom sheets and the ember stays thumb-centered. Target 60fps on a mid-range phone.

---

## 8. Audio & Music

### Adaptive layered soundtrack (the crown jewel)
One continuous composition built from **stems that unlock with progression**:
- Start: silence except click sounds and a faint room-tone drone.
- Buying "the music" (500 Light) fades in the base layer: a slow warm pad + heartbeat pulse — designed as a memorable "the game comes alive" moment.
- Each generator *tier family* adds a stem when first purchased: Hearths add soft mallets, Forges add rhythmic anvil percussion, Suns add strings, Galaxies add choir. Your economy is literally your orchestra — mute a generator category in the mixer for fun.
- Acts re-key the piece: Act I warm major, Act II driving modal, Act III unsettling then resolving per-ending.
- Implementation: Web Audio API with a stem scheduler (Tone.js or hand-rolled ~200-line scheduler); all stems same BPM/key per act, beat-grid exported for the rhythm-combo system.

### SFX principles
- Clicks: round, woody, ~pitch-randomized ±3% so 10 clicks/sec doesn't grate; subtle velocity layers.
- Purchase/achievement/star-catch each get a distinct earcon; achievement chime harmonizes with the current music key (pick chime pitch from current chord — small detail, huge polish).
- Master/music/SFX sliders from the start; mute persists in save.

### Sourcing
v0: CC0/CC-BY packs (Kenney SFX, freesound) + a composed loop from a stem-friendly source. v1.0: commission a composer for a proper 4-stem × 3-act score (budget item; ~$1.5–4k typical for indie web). All licenses tracked in `CREDITS.md`.

---

## 9. "Videos" — Cutscenes Strategy

Real video files (MP4/WebM) are heavy, don't scale with resolution, and break the aesthetic. Instead:

- **In-engine cinematic sequences** for the ~8 major beats (awakening, first supernova, act transitions, three endings): scripted camera + particle + shader moments on the same PixiJS canvas, with letterbox bars and music stings. 15–45 seconds, skippable after first view, replayable from the Codex.
- The **first supernova** is the showpiece: time slows, stems drop out one by one, the screen's accumulated cosmos gets pulled into the ember, one beat of black silence, then the blast paints the screen white and Stardust rains down as the UI rebuilds itself. This 30-second sequence is what people will clip and share.
- Optional: tiny ambient WebM loops (<300KB) for Codex card backgrounds only.

---

## 10. Save System

- **Autosave** every 30s + on `visibilitychange`/`beforeunload`, to `localStorage` with an `IndexedDB` mirror (survives localStorage clears better, and holds bigger saves).
- **Rotating slots:** keep last 3 autosaves + 1 daily backup, so a corrupt write never kills a player.
- **Export/Import:** base64-encoded JSON string, copy-to-clipboard and file download — the sacred incremental-game contract.
- **Schema versioning:** every save carries `version`; a migrations array upgrades old saves step-by-step. Never break a save. Ever. (This is the #1 way idle games lose players.)
- **Offline progress:** on load, compute elapsed × rate × offline-efficiency, capped; show the Welcome Back collect screen.
- **Integrity:** store a checksum; on mismatch just flag `save.touched = true` (disables leaderboard eligibility later, if any) — never punish, some players *like* editing saves.
- **Cloud (post-v1.0):** optional account-less sync via a tiny backend or Supabase; export/import remains the guarantee.
- Hard rule: **the game must be 100% playable offline/static-hosted.** No server dependency.

---

## 11. Tech Stack & Architecture

| Concern | Choice | Why |
|---|---|---|
| Build | **Vite + TypeScript** | Instant HMR, strict types for game math |
| UI framework | **Svelte 5** | Reactive stores map perfectly to "numbers that change 20×/sec"; tiny bundle. (React acceptable if preferred) |
| World rendering | **PixiJS v8** (WebGL) | Particles/bloom at 60fps; canvas-2D fallback |
| Big numbers | **break_eternity.js** | Prestige-game standard |
| Audio | **Web Audio API** (+ small stem scheduler) | Sample-accurate stem sync + beat grid |
| State | Single `GameState` object + Svelte stores as views | One source of truth → trivial save/load |
| Testing | Vitest for all math/balance/migration | Balance bugs are game-killers |
| Hosting | Static — GitHub Pages / Netlify / itch.io | Zero server, zero cost |

### Architecture rules
- **Fixed-timestep logic loop** (10 ticks/sec, accumulator pattern) decoupled from rAF rendering. Deterministic ticks make offline calc = "run N ticks cheaply or closed-form."
- **All content is data, not code:** generators, upgrades, achievements, echoes, stars live in typed JSON/TS definition files (`content/*.ts`). Adding a generator = adding an object. Effects expressed as declarative modifiers (`{target:'sun', type:'mult', value:2}`) resolved by a single modifier pipeline — this is what makes 300 upgrades maintainable.
- **Event bus** (`emit('purchase', ...)`) so achievements/story/audio react without coupling.
- **Derived-value cache:** recompute production only on state-changing events, not per tick.

### File structure
```
src/
  main.ts            // boot, loop
  core/              // loop, eventBus, saves/{save,load,migrations}, offline
  engine/            // modifiers, production, prestige, rng
  content/           // generators, upgrades, achievements, echoes, constellations, story
  systems/           // clicking, combos, fallingStars, storyDirector, audioDirector
  render/            // world (pixi), particles, cutscenes/
  ui/                // Svelte components: HUD, ShopPanel, UpgradeBar, Codex, Observatory, ...
  audio/             // stems, sfx, scheduler
  balance/           // curves.ts + simulate.ts (headless balance simulator)
```

---

## 12. Balancing Methodology

1. **Spreadsheet first:** model every generator's cost/production and the prestige curve; target pacing table below.
2. **Headless simulator** (`balance/simulate.ts`): scripted bot plays 40 hours of game in 2 seconds of CPU under three profiles (idle-only, active clicker, optimal) and graphs Light-over-time. Every balance change re-runs the sim in CI. This is the single highest-leverage tool for "never a dead moment."
3. **Pacing targets:**

| Milestone | Target time (active) |
|---|---|
| First generator | 30–60s |
| All HUD assembled | 5 min |
| 10th generator tier | 90 min |
| First Supernova available | 2.5–4 h |
| Second Supernova | +1.5 h (resets must feel *faster*, that's the point) |
| Layer 2 | day 3–5 |
| Story complete (one ending) | 3–4 weeks casual |

4. **Wall policy:** a "wall" (nothing affordable, nothing imminent) may never exceed ~10 minutes of active play without a star event, upgrade, or story beat landing.

---

## 13. Production Roadmap

### M0 — Ember Prototype (week 1) ✦ *prove the feel*
Vite+Svelte skeleton, clickable ember with particles+sound, Light counter, 3 generators, cost curve, autosave/load, deploy to a URL. **Gate: is clicking fun for 10 minutes with zero content?** If not, iterate juice before building anything else.

### M1 — The Loop (weeks 2–3)
All 18 generators (data-driven), upgrade system + modifier pipeline, buy-the-UI opening sequence, bulk buy, offline progress, stats panel, save migrations + export/import, balance sim v1.

### M2 — Heartbeat (weeks 4–5)
Achievements + Radiance, falling stars, Lumen ticker + story director (Act I text), adaptive audio base + first stems, rhythm combos, living background v1 (hearths/suns appear).

### M3 — Supernova (weeks 6–8)
Prestige layer 1 + Constellation tree + Observatory UI, the supernova cutscene, Act II content, Echo codex, cosmetic bazaar, mobile layout pass.

### M4 — Depth (weeks 9–11)
Layer 2 (Collapse), automation, 12 challenge runs, synergy upgrade web, Act III + three endings + cutscenes, hidden achievements, full soundtrack integration.

### M5 — Polish & Launch (weeks 12–14)
Balance passes via sim + playtesters, performance budget enforcement (60fps mid-phone, <3MB initial load, stems lazy-loaded), accessibility pass (reduced-motion mode, colorblind-safe palettes, visual beat indicator, keyboard-only play), settings depth, credits, itch.io + web launch, feedback channel.

### Post-launch candidates
Cloud sync, seasonal star events (cosmetic-only), Layer 3 expansion "The Garden," Steam wrapper (Electron/Tauri) — Cookie Clicker's Steam release proved the market, weekly community challenge seeds.

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Balance dead-zones kill retention | Headless simulator in CI + pacing table + wall policy |
| Save corruption/breakage | Versioned migrations, rotating backups, export/import, migration tests |
| Scope creep (this doc is ambitious) | M0 gate is sacred; every milestone ships a playable build; content is data so cutting = deleting rows |
| Performance death by particles | Object pooling, particle budget per quality tier, auto-degrade on low FPS |
| Rhythm combos alienate some players | Fully optional; averaged-bonus accessibility mode |
| Music licensing | CC0 placeholder pipeline from day 1; commission later; CREDITS.md ledger |

---

## 15. Definition of "Better Than Most"

Ship checklist — the game is done when a new player, with no instructions:
- feels compelled to click a lone pixel within 5 seconds,
- assembles the entire UI themselves and understands the game by minute 5,
- gasps when the music blooms in at purchase #6,
- looks up at hour 3 realizing their screen has become a sky,
- feels genuine loss-then-awe at the first supernova,
- and comes back tomorrow not because a timer scolded them — but because Lumen ended on "*...there's something I haven't told you.*"
