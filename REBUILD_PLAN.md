# EMBER — Rebuild Plan

> Step-by-step execution plan derived from [TEARDOWN.md](TEARDOWN.md). Ordered so that
> every phase ships a visibly better game, saves are never broken, and the 280-test
> suite stays green throughout. Estimated at ~16 working weeks for one focused
> developer; phases 5–7 can parallelize if there are more hands.

## Ground rules (apply to every phase)

1. **Never break a save.** Generator/upgrade/achievement IDs are immutable. All visual
   work happens in `src/render/` + manifests; the economy is untouched unless a phase
   says otherwise.
2. **Silhouette gate.** No world object merges without passing the flat-black-at-32px
   silhouette test (Phase 1 builds the harness). This replaces the honor-system
   "no naked primitives" rule with a build gate.
3. **`npm run verify` green at every merge.** Add new visual tests; delete none.
4. **One universe proves a pattern before it propagates.** Emberlight is always first.

### Recurring universe revisit — Field Archive resonance identity

Whenever a universe is revisited, retheme all twelve Field Archive resonance items as
world-native objects. Names, silhouettes, materials, motion, shelf language, and the
in-world landmark marks must belong to that universe; the generic celestial
core-and-orbit fallback does not count as finished art.

- [x] **Emberlight — Astral Cabinet:** audit the twelve records against the rebuilt
      flagship material language.
- [x] **Tidefall — Pelagic Archive:** replace remaining inherited celestial marks with
      native soundings, organisms, pressure relics, and currents.
- [x] **Verdance — Impossible Herbarium:** author twelve specimen marks from leaves,
      roots, spores, amber, and grafts.
- [x] **Clockwork — Patent Ledger:** twelve distinct drafted mechanisms across the
      Transmission, Prediction, and Exception drawers.
- [x] **Prismata — Spectrum Vault:** author twelve optical instruments and spectral
      records during Phase 6.
- [x] **Tempest — Storm Almanac:** author twelve weather instruments, discharge paths,
      and aftermath specimens during Phase 6.
- [x] **Canticle — Resonant Memory:** author twelve chambers, voices, rests, and standing
      wave records during Phase 6.

---

## Phase 0 — The Week of the Floor (1 week) ✦ smallest change, biggest impact

Goal: kill the scatter-plot feeling without touching a single asset.

- [x] **0.1 Ash dune-line.** Add a ground silhouette layer to `src/render/world.ts`:
      a static 2-segment dune curve at y≈78%, `#221A24` against `#0A0714` void, per-universe
      ground color from the TEARDOWN §9 table. Parallax anchor layer (1.0×).
- [x] **0.2 Re-address ground tiers.** In the Emberlight manifests, move tier 1–6 object
      addresses onto the dune-line (`screenZone: near` → concrete ground anchors in
      `manifest-layout.ts`). Sky tiers keep their bands but get the 3-band parallax
      coefficients (0.6 / 0.35 / 0.15).
- [x] **0.3 One bloom pass.** Remove per-object radial-gradient halos; add a single
      screen-space bloom (canvas: downsample → blur → additive composite, quality-tiered
      through the existing canvas-budget governor).
- [x] **0.4 Void budget.** Teach `salience-governor.ts` the ≥35% void rule: when
      luminous coverage exceeds 65%, force density merges before allowing new spawns.
- [x] **0.5 Fix the sacred opening.** Virgin save renders: void + dune-line + coal only.
      Delete the pre-purchase Ember Compass card ("No useful recommendation…"), the
      decorative orbital rings, and move the first-purchase pill off the Heart's
      clearance zone.
- [x] **0.6 Quick collisions.** Fix the Atlas law-card label run-ons
      ("environmentShared Horizon") and cap toast stacking at 2 with queue.

**Gate:** side-by-side screenshots (before/after) at `?scenario=midgame` — the after
must read as a *place* to a stranger. All tests green.

**Implementation status (2026-07-10):** 0.1–0.6 are complete. Automated verification
and desktop/narrow visual QA pass; the blind stranger screenshot check remains.

## Phase 1 — Art infrastructure & the Ember (2 weeks)

Goal: the tools that make good art enforceable, plus the game's face.

- [x] **1.1 Silhouette test harness.** A dev route that renders any manifest object
      flat-black at 32/64/128px on white, and a screenshot snapshot test per object.
      Failing = not identifiable by filename in a blind review. Wire into `verify`.
- [x] **1.2 Deprecate primitive-stacking.** Freeze `future-presentation.ts`'s
      three-rotated-primitives generator (rule 9/10 violations). New contract: each set
      piece is a hand-authored draw function (or layered path asset) registered in
      `presentation-registry.ts`. Primitives remain construction geometry only.
- [x] **1.3 The Coal.** Rebuild the Ember per TEARDOWN §2: lobed core, crust, crack
      lighting, 4s breath, directional click squash (6%/40ms/180ms overshoot), spark
      exhale. Six accretion stages keyed to deepest-tier-owned.
- [x] **1.4 Particle recipes.** Implement the six recipes (§10) in the pooled system:
      click / on-beat / crit / purchase-mote / achievement-line / omen-shatter. Purchase
      ceremony re-targets `purchase-ceremony.ts` to fly the mote to the object's world
      address.
- [x] **1.5 Kill fade-in.** Entrance animations per motion grammar (§11): kindle, build,
      condense, draw. One shared "enter" driver with per-family curves.

**Gate:** clicking the coal for 60 seconds with nothing else on screen feels good enough
to screen-record. (This is the original M0 gate; it has to pass again.)

**Implementation status (2026-07-10):** 1.1–1.5 are complete. The silhouette contact
sheet, opening Coal, staged midgame Coal, and live entrance layer pass browser QA with no
warnings; the final human 60-second screen-record judgment remains.

## Phase 2 — Emberlight flagship art (3 weeks)

Goal: one universe at shipped-commercial quality, proving the full pattern.

- [x] **2.1 The nine set pieces** (§4 table): Sparks-as-rate, Wisps, Hearth→Kiln→Forge
      settlement family, Beacon pylon, Titan horizon, Seed→Protostar→Sun metamorphosis,
      Binary Pair, authored Constellation figures (12 line-drawings), Nebula/Galaxy/
      Filament/Web deep-sky family, Deep Loom absence, Second Ember blink.
      Order of construction: Hearth first (it teaches the material language), Sun second
      (it teaches the sky), Constellation third (it teaches relationships).
- [x] **2.2 Ownership grammar.** Implement 1/10/25/50/100 as *structural* states per
      §4: organization → neighbor effects → lighting change → named landmark. Landmark
      merges get designed silhouettes (the Terraces, the Ecliptic, the Web).
- [x] **2.3 Occlusion & depth.** Painter-order by band, dust-lane occlusion, wisps
      passing behind the coal.
- [x] **2.4 The Kindled Sky.** Reserve the upper-left sky band; each achievement = a
      named star with a travel-line ignition; category constellations; hover naming.
      Radiance math unchanged — presentation only.
- [x] **2.5 Remnants channel, v1.** Six ash-buried remnant objects that tier purchases
      progressively uncover/complete. Two Lumen conditional lines each.
- [x] **2.6 Shop rows & upgrade bar.** Silhouette icons in kindling rows (row glints
      when its set piece changes state); replace roman-numeral chips with 20px artifact
      icons (§8).

**Gate:** the six progression moments (§3) each screenshot-match their written
description in a blind check by someone who hasn't read TEARDOWN.md. Manifest planner
tests updated and green.

**Implementation status (2026-07-10):** 2.1–2.6 are complete. All nine lifecycle
families retain visible authored landmarks through endgame, share the 1/10/25/50/100
structural grammar, and obey the ground/horizon/deep-sky painter order. The Kindled Sky,
six progressively uncovered Remnants with twelve Lumen lines, and matching shop/upgrade
silhouettes are live. Six deterministic review presets pass browser QA with a clean
console; the final blind human screenshot judgment remains an external art-direction gate.

## Phase 3 — The Supernova (1.5 weeks)

Goal: the shareable 32 seconds.

- [x] **3.1 Held-press trigger** (3 beats, dim + stem-drop per beat, release cancels).
- [x] **3.2 Infall choreography:** stem-silencing order, object lean, ribbon unravel
      (settlement bottom-up → suns → constellation snap → galaxy unwind), **HUD
      detach-and-fall** (panels tilt into scene perspective — the money shot).
- [x] **3.3 The beat of black** (1.2s), heartbeat at 12.6s, palette-ring blast, the
      developing-photograph shockwave reveal.
- [x] **3.4 Stardust rain** with per-mote chord notes; **UI rebuild replay** in original
      purchase order with original chimes.
- [x] **3.5 Post-prestige world state:** persistent stone ring, glittering ash,
      60s scorch-ghosts of the largest lost structures.
- [x] **3.6 Reduced-motion + skip variants** (same information, luminance-only).

**Gate:** watch it with sound, once, cold. If it doesn't raise arm-hair, iterate before
proceeding. (Also: post one clip; this is the marketing asset.)

**Implementation status (2026-07-10):** 3.1–3.6 are implemented against one contiguous
32-second timing contract. The normal reset requires a cancellable three-beat hold; a
development-only preview bypass exists for choreography review. Automated timing,
accessibility, persistence, and build checks pass. The sound-on cold-watch gate and clip
remain human judgments, so Phase 3 is not considered creatively signed off yet.

## Phase 4 — UI chrome, type & Lumen (1.5 weeks)

- [x] **4.1 Type system:** Fraunces + Inter tnum stack, sizes/weights per §8; audit
      every panel against it.
- [x] **4.2 Glass & bezel-tick panel language;** kill remaining borders/ornament.
- [x] **4.3 Affordability-as-light** across shop, upgrades, works: warm interior glow
      vs cold-coal states. No disabled-gray anywhere.
- [x] **4.4 Lumen ticker rebuild:** vignette-on-world, word-fade entrance, importance
      protocol (world dims 4%, particles pause), 5-line history quill, act temperature
      drift.
- [x] **4.5 Narrow-layout stacking rules:** compass/popovers/first-use cards get a
      single stacking context and collision test at 380/650/800px (extends
      `notification-layout.test.ts`). Mobile is still deferred — but nothing may
      *overlap illegibly* at any width.

**Gate:** rule-12 sweep — zero text-over-world without vignette/glass at three widths.

**Implementation status (2026-07-10):** 4.1–4.5 are complete. Local offline
Fraunces/Inter variable fonts, global tnum/type tokens, the HUD hierarchy, and the shared
glass/bezel language now cover every primary interactive surface. Shop, upgrade,
Observatory, and Deep purchases express affordability as warm interior light versus a
legible cold-coal texture without disabled gray. Lumen speaks through a world vignette
with word-by-word entrance, importance-driven 4% dim and particle pause, five-line quill
history, and act temperature drift. A deterministic chrome planner and CSS stacking
contract pass at 380/650/800px; opening history suppresses competing guidance/toasts.
The rule-12 sweep, browser review, 353-test suite, offline build, and bundle budget pass.

## Phase 5 — Tidefall & Clockwork to flagship (3 weeks, parallelizable)

- [x] **5.1 Tidefall:** inverted landscape (surface shimmer above, abyss below,
      trench at the horizon-role), nine pelagic set pieces on the same skeleton,
      tide expressed in the WORLD (waterline breathes across the composition, not just
      a meter), Leviathan passage as the flagship omen-scene.
- [x] **5.2 Clockwork:** machine-floor ground, escapement tower sky, routing drawn as
      physical linkages with torque direction legible by motion (stepped indexing,
      never eased), maintenance signals on a printed schedule card.
- [x] **5.3 Crossing ceremony v2:** 20s arrival sequence; one deliberate wrong-footing
      beat per world (first click makes the "wrong" sound once; Lumen's vocabulary
      stumbles); first-10-minutes habit-break moments.

**Gate:** blind screenshot test (labels stripped) across the three flagships — 5/5
strangers name the universe. (The F2 comparative QA protocol already exists; reuse it.)

**Implementation status (2026-07-11):** Phase 5 is complete. Tidefall's flagship
flagship slice replaces the inherited orbital-current scaffolding with an inverted ocean:
surface shimmer and open wave crests above, a pressure-darkened water column, and a closed
trench silhouette below. All 18 Kindlings now resolve through nine paired pelagic set-piece
families on the shared 1/10/25/50/100 structural-growth skeleton, and the 90-second tide
moves the surface and the inhabited field together. A Century Leviathan horizon passage,
three forecast wake marks, and a reduced-motion hold are available through the authored
Omen state and development preview. Runtime Omen scheduling now uses the same authored
route, forecast, hit-target, miss-bank, and accessibility contracts as the other worlds.

Clockwork's first flagship slice now replaces the decorative concentric gear field with a
machine-floor city and central escapement tower. All 18 stable Kindlings have fixed,
Heart-clear machine addresses; the real Civic Chain DAG becomes physical elbowed linkages
whose power, cadence, and efficiency paths use distinct shapes, arrowheads, and stepped
torque indexing. The four deterministic Maintenance Signals print from their actual live
schedules onto a protected paper card. Heart feedback remains visible through the
transparent machine layers.

Phase 5.2 received human visual sign-off after the printed schedule was moved beneath the
achievement-notification lane. Phase 5.3 is now implemented as a contiguous 20-second
first-arrival ceremony with a six-beat progress rail; remembered routes retain a shorter
6.8-second return. Every first world arrival carries one deliberate old-law beat: the first
manual touch uses the departed world's click material once, Lumen corrects its inherited
verb before normal commentary, and three world-specific habit-break lines arrive at 75
seconds, 4.5 minutes, and 9 minutes. The deterministic timing review reaches the
wrong-foot and ready boundaries exactly; the three flagship compositions also passed the
Phase 8.4 label-independent identity sweep. Broader stranger-panel validation remains a
release-observation item rather than unfinished implementation.

## Phase 6 — The chamber pieces (2 weeks)

Reframe Verdance, Prismata, Tempest, Canticle as deliberate 3–6 hour movements.

- [x] **6.1 Distill one real mechanic each:** Prismata band-per-kindling recipes with
      visible light routing; Tempest player-drawn discharge paths (length = risk);
      Canticle true slot-sequencing where rests amplify neighbors; Verdance keeps
      cohorts (already real) and gains grafting.
- [x] **6.2 Replace templated Lumen lines** (~10 per world) with authored ones; give
      each Epoch ceremony a bespoke line and cadence. Kill the shared
      "{Epoch} ended the current form…" template in `future-pack.ts`.
- [x] **6.3 One signature vista each** — a single authored set-piece moment (canopy
      dawn, first full discharge, white synthesis, the standing-wave cathedral) —
      instead of full 18-tier art. Shared set-piece skeletons with world materials are
      acceptable here by design.
- [x] **6.4 Fill the empty `effects: []`** on F4 doctrines/trials/omen rewards so the
      v2 layer carries the strategy it claims.
- [x] **6.5 Pacing pass:** chamber pieces target 3–6 hours to Beacon in the simulator's
      competent profile; adjust curves accordingly (their own `BASE_COSTS`, no longer
      shared).

**Gate:** `npm run sim` green with per-world curves; the contrast-matrix test — no two
worlds interchangeable in verb/time-behavior/skill columns.

**Implementation status (2026-07-11):** Phase 6.1 is complete. Prismata retains free
per-Kindling routing across six labeled wavelength bands and four recipes; Tempest owns
declared leader length, ground risk, accumulated potential, and deliberate Discharge;
Canticle owns an editable sixteen-slot score whose rests, role variety, and transitions
change production. Verdance now adds one reversible living graft: an older rootstock
lends 55% of its maturity lead to a younger scion while retaining 92% of its own output.
The pair is player-selected, dormant when its biological conditions are not met, visible
in a dedicated Grafting Bench, and retained as configuration through Pruning.

Phase 6.2 confirms ten authored, trigger-specific Lumen observations in each chamber
world and removes the final shared decision scaffold from the three generated worlds.
Pruning speaks in cut, ring, and seed; Refraction closes an aperture and keeps named
angles; Grounding completes a declared leader into glass; Refrain lets the final bar
resolve into an open rest. Their semantic prestige cadences now name those same physical
acts and remain fully captioned when muted.

Phase 6.3 adds one law-gated, authored vista to each chamber world: ancient Verdance
cohorts part the canopy at dawn, six named Prismata bands resolve through White
Synthesis, Tempest holds the completed discharge while its boost propagates, and a
six-role Canticle score with deliberate rests raises the standing-wave cathedral after
Cathedral Wave is owned. Each vista has a static reduced-motion state, a lower-detail
quality state, and a semantic description independent of animation and color.

Phase 6.4 completes the chamber strategy surface. Verdance's Canopy now strengthens
upper living infrastructure, Rhizome strengthens foundational Kindlings and their
resonances, Bloom rewards touch rhythm and critical pollination, and Seedbank supports
stable production and early-run touch share. Its four ecological Omens and four local
trial rewards now carry bounded, distinct effects as well. Together with the existing
Prismata, Tempest, and Canticle definitions, every chamber doctrine, Omen reward, and
trial reward is nonempty, locally referenced, numerically finite, and contrast-tested.

Phase 6.5 replaces the shared future-world cost scaffold with four authored chamber
curves and teaches the actual-compute audit to advance cohort age, charge/discharge,
and the saved chamber law state while timing the real tier-18 Beacon requirement. The
competent profile reaches Verdance in 3.60h, Tempest in 4.10h, Prismata in 4.70h, and
Canticle in 5.55h. All remain below the six-hour ceiling, above the three-hour floor,
and keep pre-Epoch purchase gaps below ten minutes.

## Phase 7 — The Garden & the endings (1.5 weeks)

- [x] **7.1 The numberless scene:** full-screen quiet field replacing the Garden tab’s
      cards; seven beacon-presences with per-world materials; zero numerals rendered.
- [x] **7.2 Endings as verbs:** tend each (Warden) / long uncomfortable held-press
      consumption (Hunger) / step back and wait, no input, they link (Companion).
      "Continue" after all three lived, per FUTURE.md.
- [x] **7.3 The infall rhyme:** retro-fit Act III echo imagery so the Devourer's feeding
      is described in the supernova's exact visual grammar; one Lumen line lampshades it
      on Remembrance replays.
- [x] **7.4 Lumen's complicity arc:** 6–8 new Act III/VII lines aiming the second half
      of the reveal at Lumen's choice of which worlds were archived and which woke.

**Gate:** one full cold playthrough of Question → Garden → one ending by someone who
hasn't seen the code. They must be able to say what they chose *without naming a menu*.

Phase 7.1 removes the Legacy panel chrome when the Garden opens and gives the ending
its own full-viewport field. The restored worlds are no longer cards: coal and
hearthstone, returning water, a living canopy, an open escapement, labeled glass,
grounded stormglass, and standing air occupy an irregular shared landscape. Their
relations remain visible as quiet paths and available to assistive technology, all
motion has a static reduced-motion state, and both the choice field and its closure
render without numeric characters.

Phase 7.2 replaces direct ending confirmation with three embodied rituals. Warden asks
the player to visit and tend every world-presence without absorbing it. Hunger requires
one uninterrupted, deliberately long pointer or keyboard hold; release returns the
field to its untouched state. Companion arms only after the player steps back, resets
on pointer, keyboard, or wheel input, and completes as the world-relations brighten and
the presences move toward one another. “Continue” remains the reconciled path after all
three answers have been lived, and every ritual preserves the numberless and
reduced-motion contracts.

Phase 7.3 gives Supernova, the final Emberlight Echo, and The Question one authoritative
infall sequence: settlements unravel bottom-up into warm ribbons, suns leave hollow
ecliptic seats, constellation routes snap inward from their outer joints, then galaxies
unwind while the instruments detach, tilt, and fall into the same point. The Question
stages those beats with the ceremony's timing and convergence grammar, with a static
reduced-motion account. After a Remembrance and another Supernova, Lumen finally names
the repeated image as a confession rather than a metaphor.

Phase 7.4 layers eight event-gated meta-lines over the unchanged ten-line universe
arcs. In Act III, Lumen claims the retained/lost ledger, admits other worlds were left
unwoken, names the Echo-and-trial sequence as a test arranged without consent, and
acknowledges that the player's answer leaves the archivist's own choice unanswered. In
Act VII, Tempest turns “inevitable awakening” back into selection, while Canticle's
rests hold the voices curation excluded. The final Beacon admission carries Lumen's
debt—not merely the player's guilt—into the Garden.

## Phase 8 — Systems pruning & release (1 week)

- [x] **8.1 Rhythm rebalance:** combo cap ×1.5, ±90ms window, sensory payoff per §10;
      streaks charge omen attraction. Averaged mode untouched. Re-run economy sims.
- [x] **8.2 Omens v2:** 5s world-announcement, slow arcs, 44px+ hitboxes, 25% miss-bank.
- [x] **8.3 Meta-shop consolidation:** permanent upgrades live in exactly three homes
      (Observatory / Deep / Vessel-Wayfinder); archive bonuses fold into the archive UI.
      Pure reorganization — no effect changes.
- [x] **8.4 The polish net:** re-run all acceptance gates from FUTURE.md §14 plus the
      twelve anti-ugliness laws as a manual checklist; fix stragglers.
- [ ] **8.5 The human gate:** one real five-hour session and one returning-player
      session (RELEASE_HARDENING's outstanding items). Ship only after.

Phase 8.1 demotes rhythm from an exponential output ladder to expressive texture. The
performed base window is ±90ms; the click ladder rises gently from ×1.1 to a hard ×1.5
cap, and the former production/click blessings are gone. Milestones now fill a bounded
Omen-attraction cycle, reaching one full call by a sixty-four-beat streak while longer
streaks keep charging without raising output. Accepted beat clicks retain the same
particle count but receive double-length tails, the eight-beat braid, one local ring,
and a quiet universe-tuned harmonic interval. Averaged accessibility keeps its existing
85–90% competent-reward policy and remains independent of audio, motion, and quality.
The rerun completed twenty-one actual-compute curves, 168 five-year profile cases, and
1,680 law-interaction cases with no numeric failures, design stalls, matrix issues, or
all-context dominant builds.

Phase 8.2 turns the shared Omen heartbeat from a reflex test into an anticipated world
event. Every random Omen now marks its safe arrival lane for five seconds with a quiet
universe-tuned shimmer before becoming interactive. Routes remain fully inside a 24px
viewport gutter, bow away from protected HUD and Heart space, and traverse at only
28–38px/s vertically or 32–42px/s laterally; the shared target retains a formal 44px
minimum in both dimensions. A passed Omen banks exactly 25% of its stored-rate reward
or full-strength buff duration, shatters glints onto the ground, and leaves a persistent
ember marker there. Catch rewards, universe identities, rhythm attraction, star-pair
behavior, accessibility labels, and randomness-forbidden laws remain unchanged.

Phase 8.3 removes Concordance as a fourth meta-shop and returns every permanent purchase
to its authored context. The Observatory keeps its constellation works and the three
Vault vestments; the Deep keeps fixed and recursive works plus the Lumen Distillery;
and the completed Vessel-Wayfinder keeps its laws, all six Succession Relays, and the
Relay Lens. The four Lumen lore entries and Archive Resonator now live directly in
Resonant Memory. Existing item IDs, prices, effects, ownership fields, and save data are
unchanged. The Legacy of Light is consequently a record-and-planning surface only:
Chronicle, Law loadouts, Atlas, and Garden.

Phase 8.4 records the full FUTURE.md §14 and twelve-law audit in
`docs/POLISH_AUDIT.md`. The live desktop sweep covered the opening, every authored
universe, the crossing, and the Garden; deterministic tests cover the supported narrow
layout matrix. Two stragglers were corrected: notifications now stay below top-world
instruments without escaping the mobile viewport, and the opt-in Ember Compass now
recommends an explicit stopping point as clearly as its next goal. Subjective listening,
comprehension, long-session, return-session, and emotional-closure judgments remain the
human Phase 8.5 gate.

## Phase 9 — Clockwork revelation and the Three Lokas

Reframe the last act so Clockwork is the final universe restored by Lumen. The existing
`prismata`, `tempest`, and `canticle` runtime identities remain as save-stable `u5/u6/u7`
slots while their complete public replacements are built as Brahmalok, Vishnulok, and
Kailash. No live name changes until a replacement passes its full content and art gate.

- [x] **9.0 Canon and cultural contract:** record the story distinction between restored
      universes and lokas, environment-first deity presence, sacred-content prohibitions,
      naming review, and the required Hindu cultural/iconographic review in
      `TRIMURTI_REFRAME.md`.
- [x] **9.1 Save-safe route registry:** add the dormant public realm identities, their
      existing save slots, inherited mechanic foundations, route order, central
      non-deity interfaces, and completion rites without changing v23 saves.
- [x] **9.2 Clockwork revelation contract:** author the 54-second Unscheduled Interval,
      pure completion predicate, full/reduced/muted semantic plan, Witness boundary, old
      forecast reclassification, and three-loka seal reveal.
- [x] **9.3 Revelation scene:** implement the one-time post-Beacon Clockwork ceremony,
      replay entry, Forecast Chamber transition, route-seal art, captions, and persisted
      claim. Keep the four recurring Maintenance Signals unchanged.
- [x] **9.4 Brahmalok:** replace the `u5` destination completely—18 Kindlings, creation
      mandala, Lotus of Becoming, 12 records, story, trials, crossing, audio, five-state
      objects, Cabinet, vistas, fallbacks, and internal cultural-guardrail review—before
      enabling its name. External Hindu cultural and South Asian art/iconography review
      remains a public-release gate under `TRIMURTI_REFRAME.md`.
- [x] **9.5 Vishnulok:** replace the `u6` destination completely with the Endless Circuit,
      responsive preservation, calm cosmic-ocean composition, 18 Kindlings, 12 records,
      story, trials, crossing, audio, fallbacks, and internal cultural-guardrail review.
      External Hindu cultural and South Asian art/iconography review remains a
      public-release gate under `TRIMURTI_REFRAME.md`.
- [x] **9.6 Kailash:** replace the `u7` destination completely with the Still Point,
      five-act cosmic rhythm, mountain-to-dance-ring progression, 18 Kindlings, 12
      records, story, trials, audio, and a consent-gated dissolution ceremony.
      External Hindu cultural and South Asian art/iconography review remains a
      public-release gate under `TRIMURTI_REFRAME.md`.
- [x] **9.7 Endgame reconciliation:** rewrite Lumen's late admissions, The Question,
      Garden presences, Chronicle, Atlas, Succession Relays, achievements, guide,
      localization, simulations, and migration fixtures around the completed cycle of
      creation, preservation, dissolution, choice, and renewal.

---

## Sequence summary

| Phase | Weeks | Ships |
|---|---|---|
| 0 — Floor | 1 | Composition fixed everywhere; sacred opening restored |
| 1 — Infra + Ember | 2 | The coal; silhouette gate; particle language |
| 2 — Emberlight | 3 | One flagship at commercial quality; Kindled Sky; remnants |
| 3 — Supernova | 1.5 | The shareable 32 seconds |
| 4 — Chrome & Lumen | 1.5 | Type, glass, light-as-affordance, ticker |
| 5 — Tidefall + Clockwork | 3 | Three flagships; crossing ceremony |
| 6 — Chamber pieces | 2 | Four honest movements; templates retired |
| 7 — Garden | 1.5 | The numberless ending |
| 8 — Pruning & release | 1 | Rhythm/omen/meta cleanup; human playtests |
| 9 — Three Lokas | TBD after cultural review | Clockwork revelation; Brahmalok, Vishnulok, Kailash; renewed ending |

**Total: ~16.5 weeks.** After Phase 0 the game already looks meaningfully better; after
Phase 3 it is marketable; after Phase 7 it is finished in the sense that matters.

## What we are explicitly NOT doing

- Not rewriting the engine, the economy, the save chain, or the simulator (they're the
  best part).
- Not renumbering or removing generator tiers (IDs immutable).
- Not adding an eighth universe, new currencies, new panels, or new prestige layers.
- Not building mobile-first — but Phase 4.5's "nothing overlaps illegibly" floor applies
  at all widths.
- Not shipping any manifest object that fails the silhouette gate, ever again.
