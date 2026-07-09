# EMBER — The Crossing
### Design Plan for the Multiverse Layer (v2.0) + Stimulation Clicker Analysis

---

## Part 1 — What Stimulation Clicker teaches us

Neal Agarwal's *Stimulation Clicker* (Jan 2025, neal.fun) is a ~1-hour satirical clicker where
purchases pile escalating sensory chaos onto the screen — bouncing DVD logos, Subway Surfers
footage, a true-crime podcast, reaction streamers, a stock-market minigame, a chicken that dies
if unfed, joke ads — until the final 2M-point purchase, **"Go to the ocean,"** replaces
everything with calm waves and ends the game. It has ~50 one-shot upgrades in a 5-slot rotating
shop, purchasable achievements, critical clicks, and deliberately no saving.

### What it does brilliantly (and what EMBER should steal)

| Lesson | How it works there | How EMBER adopts it |
|---|---|---|
| **Purchases change the screen, not just numbers** | Every upgrade adds a persistent visible/audible thing | We half-do this (glimmers, stems). Go further: **Curiosities** — a new class of one-shot purchases that add living toys to the void (see below) |
| **One-shot novelty beats repeatable increments** | ~50 unique upgrades, each a surprise; the *next thing* is always unknown | Our upgrade bar is mostly ×2s. Seed it with unique, weird, once-only items whose effect you can't predict from the icon |
| **A tended pet creates appointment care** | The chicken must be fed or it dies (permanently!) | A gentler version: **the Hearthkeeper wisp** — feed it light occasionally; it never dies, it just sulks and stops helping. Care, not punishment |
| **Minigames inside the clicker** | Stock market invests stimulation | The Deep could host a tiny "gravity garden" — optional, thematic |
| **The finale is the *opposite* of the game** | An hour of overload → silent ocean | EMBER already has this DNA (supernova's beat of black silence). The Crossing doubles down: the moment between universes is **absolute quiet** |
| **Contrast as message** | Chaos makes the calm meaningful | Each EMBER universe should *feel* different enough that returning to Emberlight is nostalgic |

### What EMBER deliberately does differently
Stimulation Clicker is a one-hour art piece with no saves and intentional annoyance; EMBER is a
weeks-long warm place. We steal its *novelty density* and *screen-as-inventory* ideas, not its
hostility. Every borrowed idea must pass the pillar test: **"the screen IS the progression"**
and **"respect the player."**

### Concrete new content this analysis produces (buildable now, pre-multiverse)
1. **Curiosities shop tab** (~12 one-shot oddities, costed like mid dawns):
   *A Moth* (orbits the ember forever), *Wind Chimes* (random pentatonic notes join the music),
   *A Small Door* (sits in the void; opens at 1e30 lifetime light; nobody knows what's inside —
   community-bait like hidden achievements), *The Hearthkeeper* (the feedable wisp),
   *A Second Cursor* (ghost cursor that mirror-clicks the ember once per beat), etc.
2. **Critical clicks** — 3% chance ×10, upgradeable; satisfying slot-machine layer we specced in
   the original doc but never shipped.
3. **Unique upgrade seasoning** — retire nothing, but interleave one-off weird upgrades between
   refinement tiers so the upgrade bar always holds at least one mystery.

---

## Part 2 — THE CROSSING: multiverse design

> *"You reignited one universe. The dark between universes noticed."*

### The player-facing loop
1. In any universe, progress as today (light → supernovae → the Deep → trials).
2. Reaching **Crossing thresholds** unlocks parts of **the Vessel** — a ship built from your
   own empire.
3. Launch = **the Crossing cutscene**: the sky peels back, the vessel sails the silent dark,
   arrives at a dead universe with *different physics*.
4. New universe = new kindling roster, new mechanic twist, new palette/music mode, new Lumen
   commentary — but your **meta layer travels with you** (achievements, echoes, remembrances,
   and a new currency below).
5. Each universe reaches its own "reignited" state (its final generator + a short story beat),
   granting a permanent **Beacon** — a cross-universe multiplier — and feeding the endgame.

### 2.1 The Vessel (layer-3 construction project)
Built in the current universe from five parts, each gated by a *kind* of mastery — thresholds,
not purchases, so the Vessel is a trophy cabinet you can see assembling in the void:

| Part | Requirement (v2.0 tuning) | Source metaphor |
|---|---|---|
| **Hull of Hearths** | 1e24 light this era | raw economy |
| **Sails of Constellation** | 9+ constellation nodes owned | the Observatory |
| **Heart of a Sun** | sacrifice 100 Suns (one-time cost) | giving something up |
| **Keel of Trials** | 4 trials completed | challenges |
| **The Archive** | Lumen agrees to come — requires an ending chosen (any) | story |

Each completed part **appears in the world canvas**, docked near the ember, being built by
wisps. The construction site is the multiverse tease — visible hours before it's usable.

### 2.2 Universes (launch roster: 3 new + home)
Each universe = a **content pack**: 12–18 generators, ~40 upgrades, its own palette, one music
re-key, one mechanic twist that changes *how you play*, and 4–6 Lumen lines + 2 echoes.

1. **U1 — The Emberlight** *(home, current game, warm amber)* — baseline rules.
2. **U2 — The Tidefall** *(teal/indigo; music in minor-7 sway)* — currency: **Glow** carried by
   waves. Twist: production oscillates on a slow visible tide (±40%, 90s period); clicking at
   high tide is worth double, and the rhythm-combo grid syncs to the tide crests. Idle players
   ride averages; active players surf. Kindlings: *Droplet, Ripple, Current, Reef Light,
   Bioluminance, Drowned Beacon, … , The Second Wave.*
3. **U3 — The Verdance** *(green/gold; music adds hand percussion)* — currency: **Sap**. Twist:
   generators **age** — each one planted grows +1%/min up to ×5, but supernova-style resets
   hurt more (age is the wealth). Prestige here instead **prunes**: cut all growth back for
   seeds. Patience universe; the anti-Tidefall. Kindlings: *Seed, Sprout, Grove, Mycelium
   Lace, Heartwood, Canopy Sun, … , The World-Tree.*
4. **U4 — The Clockwork** *(brass/silver; music quantized, metronomic)* — currency: **Ticks**.
   Twist: **no randomness at all** — no falling stars, no crits; instead visible gear-trains:
   every generator's output can be routed into another as a multiplier (a small graph the
   player rewires). The engineer universe; automation shines. Kindlings: *Cog, Escapement,
   Mainspring, Orrery, Difference Engine, … , The Great Regulator.*

(Backlog sketches: The Whisperdark — light is whispered, sound-reactive; The Mirror — costs
and production swap roles; The Garden — the true ending space.)

### 2.3 Meta-economy: Beacons & the Dark Between
- **Worldlight** (per-universe): each universe's local currency; never travels.
- **Beacons**: finishing a universe's final generator lights its Beacon — permanent **×3 all
  production in every universe**, and it visibly burns in the multiverse map sky.
- **The Dark Between** (new meta-currency): earned only by Crossings and universe milestones;
  spent on the **Wayfinder tree** (multiverse-level perks: start new universes with automation,
  carry 1% of rates across, faster vessels, echo slots). This is layer 3's stardust.
- Remembrance interaction: remembering folds only the **current universe**; Beacons and the
  Dark Between persist (memory of *worlds* is Lumen's whole job now).

### 2.4 Story: Act IV — "The Neighbors"
The Devourer reveal recontextualized: ours was not the only universe eaten. The things that ate
the others are **still sleeping** in some of them (Tidefall's deep trench, Clockwork's stopped
mainspring). Each universe ends with a choice echoing your Act III answer — warden universes
you guard, hunger universes you may consume (dark route: eat a universe for a ×10 Beacon
instead of ×3, and Lumen's trust — tracked — erodes). Final destination once all Beacons burn:
**The Garden**, where the endings reconcile.

### 2.5 Architecture (the engine is already 80% ready)
- **Content packs**: `content/universes/<id>/` exporting `{ generators, upgrades, lumen,
  echoes, palette, musicMode, twist }`. `GENERATORS` becomes `activeUniverse().generators` —
  one indirection at the ~10 import sites (compute, shop, world, sim).
- **Twists as engine hooks**: a `UniverseTwist` interface with optional hooks —
  `rateModulator(t)` (Tidefall's sine), `unitAging(placedAt)` (Verdance), `routingGraph`
  (Clockwork), `randomnessAllowed` flag. Compute consults the active twist exactly where
  challenge mods already plug in — same pattern, proven.
- **Save**: v8 — `universes: Record<id, UniverseRunState>`, `activeUniverse`, `beacons[]`,
  `darkBetween`, `wayfinder[]`, `vesselParts[]`. Per-universe run state is exactly today's
  run fields, factored into a struct (the `challengeReturn` snapshot already proved this
  factoring works).
- **Sim**: `npm run sim -- --universe=tidefall` — the bot needs a tide-aware strategy; CI runs
  all packs so no universe ships with dead zones.
- **World renderer**: palettes per universe (the ending-tint system generalizes); glimmer
  bands + music stems already data-keyed.

### 2.6 Roadmap
- **V1.1 — Seasoning** (small, ship first): Curiosities, crits, unique upgrades, Hearthkeeper.
- **V2.0 — The Crossing**: Vessel construction + cutscene + U2 Tidefall + Beacons + multiverse
  map (replaces nothing; the dock gains a 🜂 vessel button).
- **V2.1 — The Verdance** + Wayfinder tree + the Dark Between economy.
- **V2.2 — The Clockwork** + dark route (eating universes) + Lumen trust.
- **V3.0 — The Garden**: endgame, reconciliation ending, credits for real.

### Pacing guardrails
First Crossing target: **1–2 weeks of casual play** after Act III (it's the *fourth* layer).
Each new universe should feel 3–5× faster to traverse than the last thanks to
Beacons + Wayfinder + memory glow — the multiverse must accelerate, never re-grind.
The wall policy (nothing to anticipate for >10 min = bug) now applies per-universe, enforced
by the per-pack simulator in CI.

---

*Sources for the analysis: the Stimulation Clicker
[Wikipedia entry](https://en.wikipedia.org/wiki/Stimulation_Clicker),
[Fandom wiki](https://neal-fun.fandom.com/wiki/Stimulation_Clicker),
[Destructoid's completion guide](https://www.destructoid.com/can-you-win-stimulation-clicker/),
and [PopMatters' review](https://www.popmatters.com/stimulation-clicker-obsession-game-review).*
