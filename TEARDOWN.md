# EMBER — The Teardown

> A ruthless art-direction and design audit, written against the actual running game
> (all seven universes inspected in-browser, dev scenarios `midgame` through `garden`),
> the actual renderer (`src/render/`), and the design docs (GAME_DESIGN.md, FUTURE.md,
> MULTIVERSE_PLAN.md). Companion document: [REBUILD_PLAN.md](REBUILD_PLAN.md).

---

## 0. The verdict

EMBER is an engineering triumph wearing a placeholder's clothes.

The save system, the migration chain, the simulator, the accessibility contracts, the
manifest validators — these exceed shipped commercial incrementals. And the *writing* is
genuinely good: "I mistook being visible for being alone" is a better line than anything
in Cookie Clicker's twenty years.

But the screen — the thing the entire design hangs on ("the screen IS the progression") —
does not deliver, and the reason is structural, not effort:

**The game renders *descriptions of objects* instead of objects.** Look at
`src/render/future-presentation.ts:27-29`. Every world object in three entire universes
is literally this:

```ts
{ primitive: primitives[0], rotationDegrees: -7,  opacity: 0.76 },
{ primitive: primitives[1], rotationDegrees: 9,   opacity: 0.72 },
{ primitive: primitives[2], rotationDegrees: 21,  opacity: 0.46 },
```

Three stock primitives, stacked at arbitrary rotations, at half opacity. That is not a
Galaxy or a Bell Garden or a Supercell. That is a *diagram of the idea of an object*. The
manifests describe silhouettes in beautiful prose ("crescent lattice moon with hexagonal
fault cells") and the renderer answers with three translucent polygons at a slight tilt.
Prose and pixels have diverged completely, and the pixels lost.

The second structural failure: **there is no space.** Objects are placed by a layout
engine into zones, but zones are not a *place*. Nothing has a floor. Nothing rests on
anything, occludes anything, or casts light on anything. Everything floats at equal
weight in an undifferentiated void, so the composition reads as a scatter plot regardless
of how carefully the salience governor budgets attention. A salience governor cannot save
a scene that has no gravity.

Everything below is in service of fixing those two things.

---

# PART I — ART DIRECTION

## 1. The organizing principle: it is a LANDSCAPE, not a particle field

Commit to this one sentence and every other visual decision falls out of it:

**The screen is a vertical slice of a universe being reborn: the corpse of the old
universe below, the new sky above, and the Ember at the seam where they meet.**

- **The Ash** (bottom ~22% of the screen): a dark dune-line silhouette — the compressed
  remains of the consumed universe. This is not decoration; it is the lore made literal.
  Everything the player builds in tiers 1–6 sits ON this ground: fires, kilns, forges, a
  settlement of kept light. The ground is why the early game feels intimate.
- **The Ember** sits at the seam, at the golden-section point (x: 50%, y: 62%). It is the
  hinge between the dead ground and the living sky.
- **The Sky** (the upper ~70%): fills from nothing to a structured cosmos as tiers 7–18
  are purchased. Depth via three parallax bands (near sky 0.6×, deep sky 0.35×, horizon
  0.15× relative to a ±6px mouse-drift on the ground plane at 1.0×).
- **The Horizon** (a thin band at the very top): where the endgame objects live — the
  Cosmic Web's lattice, the Deep Loom's dark absence, and eventually the Second Ember,
  a pinprick that looks back.

At hour 50, a spouse walking past the monitor sees: *a dark illuminated painting — a
terraced village of fires on ash dunes, under a sky dense with suns, drawn constellations,
and slow galaxies, all of it converging on one bright breathing point.* That is the
screenshot. That is the poster. Nothing about the current renderer prevents this; it
just has never been asked to draw a floor.

Every universe keeps the same skeleton (ground / heart-seam / sky / horizon) with its own
materials: Tidefall inverts it (the "sky" is deep water below, the surface shimmer above);
Verdance's ground is loam and the sky is canopy; Clockwork's ground is the machine floor
and the sky is the escapement tower. Inversion is fine. *Absence of a floor is not.*

## 2. The Ember (the Heart)

**Silhouette:** not a sphere, not a flame icon — **a coal**. A slightly irregular molten
core (roughly a 1.15:1 horizontal ellipse with three asymmetric lobes) wrapped in a darker
crust, with visible cracks. Light comes *through the cracks*, not from a radial-gradient
halo. It should look like something that survived, not something rendered.

**Idle motion:** breathing, 4-second period (independent of music BPM — the heartbeat is
yours; the music is the world's). On the inhale the cracks brighten and widen ~8%; on the
exhale a single mote of light escapes upward and dies after ~2s. The Ember is never
static, and its idle animation quietly seeds the visual grammar of the Spark (tier 1).

**Click feel:** heavy, consequential — you are pressing a living coal, not tapping a toy.
- 0ms: crust compresses inward 6% toward the click point (directional squash, not uniform).
- 40ms: cracks flash white-hot along the compression axis.
- 50ms: sound attack (already correct: never wait for the economy tick).
- 180ms: release with 2% overshoot, one shower of sparks (see §10) rises from the crack
  nearest the cursor, and the `+N` separates.
- On-beat click: the whole crack network flashes in sync and a single thin ring
  (28px→64px, 220ms, 1.5px stroke) expands — the ONLY ring in the game's vocabulary,
  reserved for rhythm.

**Growth:** the Ember itself grows at most +40% across the entire game. Progress is shown
by what accretes AROUND it, in fixed stages tied to deepest tier owned:
1. **Coal** (start): bare, cracks, ash beneath it.
2. **Kept fire** (Hearth+): a ring of small stones appears at its base — someone is
   tending it now.
3. **Molten heart** (Furnace Titan+): the crust opens permanently at the top; three
   slow motes orbit it (5s period, elliptical, occluded when they pass behind).
4. **Proto-star** (Sun+): a faint coronal loop arcs off one side; the ground beneath it
   begins to glow through the ash cracks.
5. **The hinge of the sky** (Galaxy+): thin light-threads connect it upward to the
   nearest constellation — it is visibly holding the sky up.
6. **Post-Question:** the core permanently takes the ending's color at its center —
   a warden's steady white, a hunger's deep red, a companion's braided two-tone.

## 3. The living background at six moments

**Moment 1 — First click (nothing owned).** Pure void `#0A0714`, one coal at the seam
point, and — barely perceptible, 4% above black — the ash dune-line. No stars. No rings.
No UI. (The current build breaks this: the Ember Compass renders immediately with
placeholder text, and decorative orbital rings exist before anything is bought. Both are
regressions against the game's own founding rule. Delete them from the virgin state.)

**Moment 2 — Spark, Wisp, Hearth owned.** The coal now exhales sparks at a rate the
player can see (their Spark count made visible). Two or three wisps — teardrop flames
with ribbon tails — wander the ground near the Ember, curving back toward it like moths.
On the dune-line, one hearth: a low stone ring with a real fire, casting a pool of warm
light that reveals the ground texture beneath it for ~80px. The screen is 90% dark. The
composition is: one bright point, three small lives, one lit home. It should feel like a
campsite at the end of the universe.

**Moment 3 — Mid-tier (through Forge/Beacon).** The dune-line now carries a *settlement*:
hearths clustered into a hamlet arc, two kilns (beehive domes, glowing mouths), a forge
whose bellows-glow pulses on the music's anvil stem. The first Beacon stands at the
settlement's edge — a tall pylon sweeping a slow lance of light across the sky, and where
the lance passes, the player glimpses faint dust in the upper void (foreshadowing the sky
to come). Ground light now dominates; the sky is still almost empty. One buried Star Seed
glows through a crack in the ash like a hot coal underground.

**Moment 4 — Cosmic scale (Suns, Galaxies).** The sky has arrived. Suns hang on a shallow
ecliptic arc above the settlement — proper disks with limb darkening, two coronal loops
each. Binary pairs waltz. Purchased Constellations have *drawn actual line-figures*
between stars (authored shapes, see §4). Behind them, the first galaxy sits angled in the
deep-sky band, rotating once per 90 seconds, its dust lanes occluding stars behind it.
The settlement below is now infrastructure — terraced, permanent, self-lit. Vertical
composition finally in balance: warm civilization below, cool cosmos above, Ember at the
hinge.

**Moment 5 — Post-Supernova.** Black, then: the ash dunes remain (the ground survives —
this matters: prestige takes the sky, not the graves), dusted with fresh stardust that
glitters faintly for the first 60 seconds of the new run. The coal is bare again but its
stone ring persists. The sky is empty but *not* virgin — extremely faint scorch-ghosts
of the largest structures you owned remain for the first minutes, fading as the new run's
real objects replace them. Loss with memory, not deletion.

**Moment 6 — Endgame (all 18).** The full painting: settlement → sky farm → ecliptic of
suns → drawn constellations → nebula banks churning with newborn stars → angled galaxies →
a filament knot in the far field → and across the very top, the Cosmic Web's lattice
threading everything together. At the horizon's left edge, the Deep Loom: a rectangular
*absence* where all the lattice threads converge and vanish. And at the top-right corner,
one pinprick that is not one of yours: the Second Ember. When you click, it blinks —
one frame, easy to miss, deeply unsettling once noticed.

## 4. The eighteen generators — concrete visual identities

**The structural fix first:** eighteen independent objects per universe is why the art
collapsed into primitives (18 × 7 universes × 5 ownership states = 630 bespoke visuals —
impossible). Keep all eighteen tiers in the *economy* (never break saves), but render
them as **nine set pieces that metamorphose**, pairing adjacent tiers into lifecycle
stages. Tier relationships become visible transformation — which is the actual lore: you
are re-teaching the universe its own lifecycle.

| # | Tier | Set piece & silhouette | Motion | Placement |
|---|---|---|---|---|
| 1 | **Spark** | Not an object — a *rate*. Rising motes exhaled by the Ember, 1.5px heads with 6px tapering tails, living ~4s. Count = spawn frequency. | rise, slow, curve, die | Ember's crack vents |
| 2 | **Wisp** | Teardrop flame, 10–14px, with a ribbon tail that lags its motion by 200ms. It *shouldn't* dance; it does. | wandering arcs that always bend back toward the Ember | ground band, near Ember |
| 3 | **Hearth** | Low stone ring (5–6 visible stones) holding a fire; casts a real light pool that reveals ground texture. First PERMANENT object. | fire flicker (convection, not sine) | ON the dune-line |
| 4 | **Kiln** | Beehive dome with a glowing arched mouth; heat shimmer rises from a top vent. Hearth's grown-up sibling — same material family. | mouth-glow swells when production ticks | settlement, beside hearths |
| 5 | **Forge** | Angular gabled structure, chimney, interior glow that pulses with the anvil stem of the music; occasional spark burst from the chimney ON the beat. | rhythmic (the first music-coupled object) | settlement edge |
| 6 | **Beacon** | Tall tapering pylon (5:1 aspect) with a slow rotating lance of light (12s period). The transition object: the first thing that points UP. | rotation; lance reveals sky dust | settlement's highest dune |
| 7 | **Furnace Titan** | A mountain on the horizon-line with magma veins in its flanks. You don't own ten mountains: count deepens the vein network and glow. | near-still; veins pulse slowly | horizon, one silhouette |
| 8 | **Star Seed** | Buried glow cracking the ash open from beneath — an underground coal field. At 10+: a sown field of cracks. | subterranean pulse | ground, beyond the settlement |
| 9 | **Protostar** | The seeds SPROUT: a dusty cocoon lifts off the field and hangs low, swelling, lit from within. Star Seed→Protostar→Sun is ONE object across three life stages — the metamorphosis is watchable. | slow rise + swell | low sky |
| 10 | **Sun** | A disk with limb darkening (edge 30% darker than center), two coronal loops, faint chromosphere fringe. Suns take assigned seats on an ecliptic arc. | 8s corona sway; loops occasionally reconnect | ecliptic band |
| 11 | **Binary Pair** | Two unequal suns waltzing about a shared barycenter (20s period) exchanging a thin plasma bridge. | orbital, with visible exchange | ecliptic band |
| 12 | **Constellation** | LINES. Each purchase draws one authored figure (the Keeper, the Vessel, the Moth…) between existing suns — 1px lines at 40% opacity with 2px joints. The player watches the sky get *drawn*. | line-draw animation on purchase (2s) | between owned suns |
| 13 | **Nebula Garden** | A churning cloud bank (3 overlapping soft masses, 60s cycle) with 2–3 embedded newborn glows. Sits BEHIND the ecliptic; suns occlude it. | volumetric churn | deep sky |
| 14 | **Galaxy** | Angled spiral (55° inclination — never face-on, face-on reads as decal), two arms, a dust lane that occludes its own core on one side, 90s rotation. | rotation with parallax | deep sky |
| 15 | **Supercluster** | Not more spirals — a *filament knot*: 5–9 galaxy motes strung on faint threads, the threads brighter where they cross. | threads shimmer along their length | far field |
| 16 | **Cosmic Web** | The lattice: threads that connect everything already in the sky, completing the composition. At 50+, the whole sky gains visible structure — this is the "topology change" threshold made real. | near-still; slow luminance travel along threads | topmost band |
| 17 | **Deep Loom** | A dark rectangle of ABSENCE at the horizon where lattice threads converge and stop. It does not glow. It is the only object that eats light. Act III's dread, ambient on screen. | none — stillness is the effect | horizon, left edge |
| 18 | **The Second Ember** | A pinprick at the top-right that is not part of your web. Blinks one frame when you click. At 1 owned it exists; it never multiplies visually. | answering blink | horizon, far corner |

**The ownership grammar (uniform across all universes):**
- **1:** a single specimen, placed with intent (never centered, never symmetric).
- **10:** specimens organize — hearths arc into a hamlet, suns fill their ecliptic seats,
  seeds become a sown field. Organization, not duplication.
- **25:** the group affects *neighbors* — hearth-light pools merge and reveal a path
  between them; suns cast rim-light on the nebula behind.
- **50:** lighting/topology changes — settlement glow tints the lower sky; the ecliptic
  arc becomes a visible band of zodiacal light.
- **100:** infrastructure — the group collapses into ONE named landmark (the hamlet
  becomes "the Terraces," one silhouette, its count shown in the panel). Never 100
  sprites. The renderer's density-merge system already models this; the merge *result*
  needs to be a designed landmark, not a bigger blob.

## 5. Spatial organization — the rules

1. **Everything has an address.** Ground / seam / near sky / ecliptic / deep sky /
   horizon. An object without an address does not render.
2. **The composition is a triangle:** heavy warm base (settlement), bright apex (Ember),
   broad cool canopy (sky). At every progression stage this triangle must survive a
   squint test.
3. **Occlusion exists.** Suns pass in front of nebulae; galaxy dust lanes hide stars;
   wisps pass behind the Ember. Three depth layers minimum, with parallax. Occlusion is
   the cheapest possible signal that this is a *place*.
4. **Clustering is familial.** Fire-family objects cluster in the settlement; stellar
   family on the ecliptic. No object ever spawns equidistant from everything.
5. **Negative space is content.** ≥35% of the screen stays void at ALL times, at every
   stage — enforced by the salience governor (it already has the budget machinery; give
   it this rule). The void is the antagonist; it must remain visible to stay defeated.
6. **The Heart's clearance zone is sacred** (already in the manifests — but the *first
   purchase pill currently overlaps the Ember's hit target*; fix it).

## 6. The Supernova, frame by frame

Total: ~32 seconds. Skippable after first viewing. The single most important asset in
the game. The emotional key: **the player's own UI is part of the universe, and it gets
consumed too.**

- **T-3s — The held choice.** The Supernova button cannot be clicked; it must be HELD
  for three beats. Each beat, the world dims 10% and one music stem drops. Releasing
  early cancels harmlessly. (Consent, made physical. Also kills accidental prestige.)
- **T0–6s — The stems fall silent.** Remaining stems drop one per 1.5s in reverse
  order of acquisition — the choir first, the heartbeat pad last. As each stem dies,
  its associated objects stop moving and *lean toward the Ember* (2–3° rotation, slow).
  The world is listening.
- **T6–12s — The infall.** Every object unravels into a ribbon of its own palette and
  streams into the Ember: hearth-fires first (the settlement goes dark house by house,
  bottom-up), then the suns leave their seats, then the constellation lines snap free
  from their joints and whip inward, then the galaxies spiral open like unwound thread.
  THEN — the HUD panels detach from the screen edges, tilt into the scene's perspective,
  and fall in too. Counter, shop, upgrade bar: consumed. The player watches the interface
  they bought at minute 5 die. The Ember overbrightens to `#FFF6E8`, then past it.
- **T12–13.2s — Nothing.** Pure black. Total silence for 1.2 seconds. At 12.6s: one
  heartbeat — the very first sound the game ever played.
- **T13.2s — The blast.** Not a white flash. A thin ring of the universe's palette
  expands from center at 2000px/s, leaving behind a slower luminous shockwave that
  *reveals* the stardust field as it passes — as if the light is developing a photograph.
- **T14–22s — Stardust rain.** Motes fall UP-lit (lit from below, by the afterglow),
  drifting like snow, each landing adding +1 to the Stardust counter with a soft mallet
  note (notes chosen from the current act's chord). The ash dunes glitter.
- **T22–32s — The rebuild.** The UI reassembles piece by piece IN THE ORDER THE PLAYER
  ORIGINALLY BOUGHT IT — counter first, then shop, then the gear, each with its original
  purchase chime, compressed into 8 seconds. The game replays the player's own awakening
  back to them. The coal breathes. Lumen: *"Again."*

## 7. The Lumen ticker

- **Position/form:** bottom-center, max-width 46ch, no container — text sits directly on
  the world with a 40% vignette behind it. No portrait ever; Lumen is a presence, not a
  face. The moment Lumen has a face, the mystery dies.
- **Type:** Fraunces italic, 17px/1.5, `#EFE6D8` at 85% opacity.
- **Entrance:** word-by-word fade (60ms/word stagger, 300ms per-word fade) — reading
  pace, not typewriter clatter. Holds 8s, exits by dimming to 40% then out.
- **Important lines** (act transitions, revelations): the world dims 4%, all particle
  spawns pause for the line's duration, and the line gets +1px size and full opacity.
  The world literally holds its breath. No pulse, no shake — restraint IS the emphasis.
- **History:** a small quill glyph at the ticker's right recalls the last five lines on
  hover. Story must never be missable because you looked away.
- **Act drift:** Act I `#EFE6D8` (warm parchment) → Act II `#D8D4CC` (cooling) →
  Act III `#C4C8D4` (cold, faintly blue). The player should *feel* the temperature drop
  without being able to say when it happened.

## 8. UI chrome & typography

**Doctrine: the UI is an instrument, not a website.** Dark glass, hairline structure,
light as the only ornament.

- **Panels:** `rgba(10, 8, 18, 0.82)`, `backdrop-filter: blur(12px)`, 1px border
  `rgba(242, 216, 167, 0.14)`, radius 10px. Corner ticks (4px L-shapes at each corner,
  same border color) are the ONLY ornament — they read as instrument bezels.
- **Type stack:**
  - Fraunces (optical size axis on): Lumen, echo cards, universe names, ceremony text.
  - Inter with `font-feature-settings: "tnum"`: every number in the game. Numbers must
    never jitter as widths change.
  - Labels: Inter 12px, uppercase, tracking 0.14em, 55% opacity.
  - Counter: Inter 44px/700 tnum. Rate line: 15px/500 at 70%.
- **The affordability language — light = purchasable.** Affordable items carry a warm
  interior glow (soft inner shadow, `#FFB454` at 12%) and full-opacity text; unaffordable
  items are *cold coals* — desaturated, 45% text, with a barely-visible crack texture.
  No red, no lock icons, no disabled-gray. The shop teaches the game's metaphor.
- **Tooltips:** same glass, 280px max, structure: name (Fraunces 15) / one-line flavor
  (italic, 60%) / hairline / numbers (tnum grid: cost, rate, payback). Payback time in
  plain words ("pays for itself in 3m 12s") — already specced, keep it.
- **The upgrade bar:** the current row of roman-numeral chips is the single most
  spreadsheet-looking element in the game (confirmed on-screen in every universe).
  Replace chip glyphs with 20px silhouette icons of the affected set piece, drawn in the
  same line-language as the world objects. The bar should read as a shelf of small
  artifacts, not a tab strip.

## 9. Color palettes (6 per universe)

Rule: every universe keeps ONE warm accent reserved for affordability/reward (the "gold
role") no matter its temperature, so purchase-glow reads identically everywhere.

| Universe | Void/bg | Ground | Primary | Highlight | Cool accent | Text |
|---|---|---|---|---|---|---|
| **Emberlight** | `#0A0714` | `#221A24` | `#FFB454` | `#FFF3DC` | `#2E7F7A` | `#EFE6D8` |
| **Tidefall** | `#04101A` | `#0A2432` | `#59E0C8` | `#F0FAF4` | `#9FB8CC` | `#D8E9E4` |
| **Verdance** | `#0A1208` | `#1C2415` | `#A8D45A` | `#F4E9B0` | `#D89A3D`* | `#E4EDD6` |
| **Clockwork** | `#100E0A` | `#262019` | `#D9A441` | `#F2E8D4` | `#4A6E8C` | `#E8DFC8` |
| **Prismata** | `#070812` | `#191627` | `#B49BFF` | `#FFFFFF` | `#64D8D0` | `#E6E0F5` |
| **Tempest** | `#0A0E16` | `#1C2633` | `#7DD3F5` | `#F2FAFF` | `#9D7BE8` | `#D9E5EE` |
| **Canticle** | `#120A12` | `#241826` | `#E895B4` | `#FDF0F2` | `#D8B36A` | `#EFDDE4` |

*Verdance's "cool accent" is amber — its warmth inverts because its primary is already
alive; danger/decay in Verdance is `#C4573A` rust.

Danger/negative role (rare — reset warnings, trial failure): Emberlight `#D9543F`,
Tidefall `#E0685A`, Clockwork `#B33C2E`, Prismata `#E05577`, Tempest `#E8A03C`
(amber storm-warning), Canticle `#B84A5E`.

The screenshot test: convert any screenshot to a 6-swatch palette and it must name its
universe. Emberlight = amber-on-indigo; Tidefall = glow-cyan-on-abyss; Clockwork =
brass-on-oil; Prismata = violet-white-on-ink; Tempest = ion-blue-on-slate; Canticle =
rose-on-plum; Verdance = chlorophyll-on-loam.

## 10. Particles & micro-feedback

One pooled system, six DISTINCT recipes. Difference comes from *behavior*, never just count.

| Event | Recipe |
|---|---|
| **Click** | 5–9 sparks from the nearest crack. 260px/s cone (70°, up-biased), NEGATIVE gravity −120px/s² for 300ms then +60 (they leap, hang, settle). 700ms life. Color ramp `#FFF6E8→#FFB454→#7A3B2E`. Additive. |
| **On-beat click** | Same sparks with 2× tail length, plus the single expanding ring (§2). At combo 8+: sparks curve into a brief braid before dispersing. More *organized*, not more numerous. |
| **Critical** | Three clean 24px lines flash outward at 120° spacing (a struck-flint mark), 150ms, plus one deep spark that arcs to the ground and bounces once. |
| **Purchase** | NO confetti. The price text collapses into a mote; the mote flies a bezier to the object's world address (400ms); the object ignites/evolves on arrival; a `+18%/s` delta floats at the destination. The eye is *taught where the thing lives*. |
| **Achievement** | One star ignites in the Kindled Sky (§14) with a 4-frame twinkle and a chime harmonized to the current chord. A single line of light travels from the achievement's cause (the ember, the shop) up to the new star. |
| **Star catch (omen)** | The star shatters into 12–16 glints with REAL gravity that land on the ground/settlement and glow there for the buff's duration — the reward physically inhabits the world until it expires. |

Global rules: everything pooled; per-frame particle budget from the existing quality
governor; all glow through ONE screen-space bloom pass (kill every per-object
radial-gradient halo — stacked halos are why current scenes look foggy instead of
luminous).

## 11. Motion grammar

- Motion follows material physics: fire flickers (noise), stars sway (slow sine), orbits
  orbit (Kepler-ish, faster near center), wisps wander (Perlin drift with Ember bias),
  clockwork indexes (stepped, never eased), water breathes (long swells).
- **Two motion frequencies per zone, maximum.** The settlement may flicker + shimmer;
  the deep sky may rotate + twinkle. Never five kinds of motion in one band — that is
  the "scatter plot" feeling in motion form.
- **Enter:** every purchase arrives as the §10 purchase-mote landing and *growing the
  object from its own logic* — fires kindle from a spark, domes build course by course
  (3 quick masonry steps), suns condense from an inward dust swirl, constellation lines
  draw joint to joint. 400–900ms by tier. Never fade-in. Fade-in is how UI enters, not
  how matter enters.
- **Leave (prestige):** the §6 unravel — objects become ribbons, ribbons fall inward.
- **Parallax:** ±6px total on pointer drift, distributed by band (§1). Subtle enough to
  miss, missed enough to feel.
- Reduced-motion: all of the above collapse to opacity/luminance states — the manifests
  already carry `reducedMotionState`; honor them with the same *compositions*, frozen.

## 12. Anti-ugliness rules (the twelve laws)

1. **Silhouette first.** Every object must read as its named thing rendered flat black
   on white at 32px. If it needs color or motion to be identifiable, it fails.
2. **No unresolved geometry.** Nothing ships that could be mistaken for "partially
   loaded": no open arcs that imply a missing circle, no polygon with an apparently
   absent face, no line that terminates in空 nothing. Every shape COMMITS.
3. **No naked primitive reaches the screen.** (The rule exists in FUTURE.md §5.7; the
   renderer violates it wholesale. It becomes a build gate, not a guideline: see plan.)
4. **The 2-second test:** any player can point at any object and say what it is and why
   it's there. If the answer requires the manifest's prose, delete or redraw.
5. **One bloom to rule them all.** All glow via a single post pass. No stacked halos.
6. **Adjacent sizes differ by ≥1.3× or are exactly equal** (deliberate grid). The
   in-between reads as error.
7. **Nothing floats without an address** (§5). No equidistant scatter.
8. **≥35% void at all times.** Density is defeated by merging, never by shrinking.
9. **Rotation means something.** No arbitrary "-7°, 9°, 21°" tilts to fake organic
   randomness. If it's tilted, it's tilted because its physics tilt it.
10. **Opacity is not a style.** Translucency is reserved for gas, water, ghosts, and
    reduced states. Solid things are solid. A 0.46-opacity "state ring" is a diagram.
11. **Count changes structure, never just quantity** (§4 grammar). 100 of a thing is
    ONE landmark.
12. **Text never fights the world.** Any label over the canvas gets the vignette
    treatment (§7) or moves to glass. (The current narrow-layout collisions —
    "GROWTH COMPASS" z-fighting the chip row, popovers overlapping FIRST-USE cards —
    are automatic failures of this law.)

---

# PART II — SYSTEM-BY-SYSTEM AUDIT

### Rhythm combos — KEEP, but demote from ladder to texture
The mechanic is your freshest idea and the ×2/×4/×8 ladder is its worst expression: at ×8
it stops being flavor and becomes mandatory homework for optimizers, and a punishment
wall for everyone else. Cap the combo bonus at **×1.5**, wide beat window (±90ms), and
move the *reward into the senses*: on-beat clicks get the braid particles, the harmonized
note, the ring — playing the ember like an instrument should feel physically better, not
just pay better. Long streaks charge omen attraction (already partially true) rather than
raw output. Keep averaged-mode accessibility exactly as is. Optimizers get their
expression in per-universe mechanics, where mastery belongs.

### Falling stars — KEEP the heartbeat, kill the twitch
The anti-AFK pulse is sound; chasing a fast mote is not. Three changes: (1) the world
*announces* arrivals 5s early — wisps turn to look, the music adds a shimmer, Tidefall's
fish school toward the entry point; anticipation is the fun part. (2) Slow arcs, generous
hitboxes (44px+), never near screen edges. (3) A missed star banks 25% of its reward as
"embers on the ground" — missing is a shrug, never a sting. The per-universe omen
identities (pulsar sweep, leviathan passage, maintenance windows) are the right
direction: an omen should be a small *scene*, not a moving button.

### 18 generator tiers — KEEP the economy, halve the visual vocabulary
Eighteen price points create good purchase cadence; eighteen *visual identities* per
universe destroyed the art. Nine metamorphosing set pieces (§4) preserve both. Do not
renumber tiers — save compatibility is sacred and the code agrees.

### Prestige layers — the layers are fine; the SHOPS are bloat
Supernova (emotional core), Deep/Collapse (automation + trials), crossings (travel, not
reset), Remembrance (NG+). Four kinds of "again" across a month-long game is correct.
What's bloated is the *parallel bonus shops*: constellation tree + stardust works + deep
works + doctrine tree + wayfinder tree + archive shelves + loadouts ≈ seven places where
"+X%" lives. Consolidate presentation: the Observatory (skill expression), the Deep
(automation/trials), the Vessel/Wayfinder (travel). Archive shelf bonuses fold INTO the
archive itself. Rule: a new player asked "where do permanent upgrades live?" should have
at most three answers.

### Achievements & Radiance — KEEP the number, replace the metaphor
+1%/achievement is fine math and dead poetry. Rebuild as **the Kindled Sky**: a reserved
band of sky (upper-left) where every achievement ignites a NAMED star; categories form
authored constellations; hover names them ("Night Reader," 3 AM, still there). Radiance
% becomes the measured brightness of that region. Same numbers, but now the reward is
*a place in the sky you built by playing*, visible every session, screenshottable. A
handful of achievements should award curiosities/vestments instead of stars — variety in
kind beats variety in count.

### Lore delivery — the ticker+codex spine is right, but the WORLD isn't talking yet
Add the three environmental channels the twist deserves:
1. **The Ash is the corpse.** The ground IS the old universe. Rare purchases uncover
   *remnants* in it — a doorframe, half a bridge, a child's orrery — and your new
   buildings sometimes complete them, fitting suspiciously well. The player who wonders
   "why does my kiln fit that ruin exactly?" is being told the truth at hour 4.
2. **The infall rhyme.** The supernova's consumption animation is, frame for frame, the
   same grammar as the Devourer's feeding described in Act III echoes. On a second
   playthrough the player realizes the game showed them the confession all along.
3. **Lumen reacts to the world, not just milestones** — comment when the player hoards
   without spending, when a settlement burns bright, when the Deep Loom first renders.
   A dozen conditional lines per act buys more presence than a hundred milestone lines.

### Universe travel — real physics, but arrival is a fade; make it a LANDING
Mechanically the universes are not palette swaps (tide, cohorts, routing are real).
What's missing is ceremony and *foreignness*: arrival should be a 20s authored sequence
— the Vessel crossing silent black, then the new world's physics visibly wrong-footing
you (your click makes the wrong sound for one press; Lumen's vocabulary stumbles). And
the first 10 minutes in a new universe should break one habit loudly (Tidefall: your
production meter SWAYS; Clockwork: your first omen arrives on a printed schedule).
Discovery = the moment your habits betray you, made delightful.

### The F4 trio (Prismata/Tempest/Canticle) — beautiful prose, templated soul
All three share one economy skeleton, one upgrade generator, templated Lumen lines
(Canticle and Prismata literally speak the same sentence with nouns swapped), and
preset-picker mechanics (choose 1-of-4 recipe/path/measure → multiplier). The archive
writing is the best in the game and the mechanics beneath it are the shallowest. Either
give each its distilled real mechanic (Prismata: band-per-kindling recipes with visible
light routing; Tempest: discharge PATH drawn across the storm map, length = risk;
Canticle: actual slot-sequencing where rests matter) — or honestly reframe them as
shorter "chamber pieces" (see Part III, universe count).

### The Garden — currently a menu; must become the first NUMBERLESS place
What ships today is a modal with seven cards (confirmed on-screen). The ending of a
40-hour game cannot be a settings panel. Rebuild as a playable quiet scene: a dark
field; the seven Beacons' lights arrive as living presences; **no counter, no rate, no
panel — the first screen in the entire game with no numbers on it.** The ending is
chosen by *doing*: keep tending them one by one (Warden); draw them into yourself with a
long, deliberately uncomfortable held press — the game makes your hand perform the
hunger (Hunger); or step back, wait, do nothing, and watch them find each other
(Companion — the ending you choose by finally NOT clicking, in a clicker; that's the
thesis of the whole game in one interaction). "Continue" appears only after living all
three across Remembrances, as designed.

---

# PART III — THE HARD QUESTIONS

**The screenshot moment.** The Supernova infall at T6–12s — specifically the frame where
*the player's own HUD tears off the screen edges and falls into the star.* No game eats
its own interface. It is the premise (everything you built, you can lose), the twist
(you are the eater), and the opening hook (you bought that UI) in one image. Secondary:
the hour-50 landscape (§3, moment 6).

**The most forgettable part.** The upgrade chip row of roman-numeral ×2s — pure
spreadsheet, visible in every screenshot, indistinguishable from every idle game since
2013. Second place: Radiance-as-milk and the falling star in its generic form. All three
are Cookie Clicker organs transplanted without new blood; all three have fixes above.

**How many universes?** Keep seven in the fiction; build **three flagships + four
chamber pieces**. Emberlight, Tidefall, Clockwork get the full treatment (they have the
most distinct physics AND palettes: warm/cool/mechanical). Verdance, Prismata, Tempest,
Canticle become deliberate 3–6 hour movements: one distilled mechanic each, one
signature vista each (Verdance's canopy dawn, Tempest's first full discharge, Canticle's
cathedral of standing waves, Prismata's white synthesis), full palette + audio identity,
HALF the tier-art (they can share the set-piece skeleton with re-skinned materials
without shame — a chamber piece admits its scale). Seven equal universes at current
polish = seven adequate things. Three cathedrals and four chapels = a place worth a
pilgrimage. The Garden still gets seven beacons.

**Hour 50, the spouse test.** Answered in §3 moment 6. Today's honest answer: a glowing
ball in fog with confetti and beautifully-typeset panels. After the rebuild: an
illuminated dark painting that happens to have numbers in the corner.

**The ONE system to keep.** The awakening — buy-your-own-UI. It is the only mechanic in
the genre's history that makes the interface itself diegetic, and everything above
generalizes it: the UI is matter (so the supernova can eat it), light is affordance (so
the shop glows), the screen is the save file. If everything else burned, rebuild around
"the game assembles itself from your hands."

**Tropes being blindly copied.** (1) The 1.15^n eighteen-row shop *presentation* —
keep the math, but rows must show the world (silhouette icons, state-change glints).
(2) Roman-numeral upgrade walls — killed above. (3) Milk — rebuilt as the Kindled Sky.
(4) Golden cookie — rebuilt as announced omens. (5) "You were the villain all along" is
ALSO a trope now (Undertale, NieR, Paperclips adjacency) — the fresh angle you already
own but underplay: **Lumen chose which universes to wake, and archived the rest.** The
archivist's complicity is a rarer story than the player's guilt. Aim Act III's second
half at Lumen.

**The emotional journey, mapped.**
- *Curiosity* — 0:00–2:00. Black screen, one coal. (Works today. Protect it: the compass
  regression and pre-drawn rings currently leak UI into the sacred void.)
- *Delight* — 5:00. Music purchase. (Works. The single best minute in the game.)
- *Investment* — hour 1–3. Settlement rises, first wall, first plans. (Adequate; the
  landscape rebuild is what makes investment *visible*.)
- *Wonder* — hour 3–5. First Supernova. (The current cutscene is a fade; §6 is the fix.)
- *Tension* — day 3–7. Echoes darken, the Deep, the Deep Loom renders. (UNDERSERVED
  today: this is where the remnants-in-the-ash channel and Loom stillness carry it.)
- *Revelation* — week 2–3. The Question. (Written; needs the infall-rhyme so the reveal
  is *recognized*, not just read.)
- *Resolution* — week 3+. The Garden. (Currently a menu; the numberless scene is the fix.)
- The sag: **hours 5–15** (mid-Act II) is upgrades-only today, and **the F4 stretch**
  flattens into sameness. The chamber-piece restructure and curiosity/remnant density
  are aimed exactly there.

**The smallest change with the biggest impact (one week):** *Give the world a floor.*
(1) Draw the ash dune-line and re-address existing tier-1–6 objects onto it. (2) Replace
all per-object radial halos with one screen-space bloom. (3) Enforce the ≥35% void rule
in the salience governor. (4) Delete the virgin-state compass card and decorative rings.
Four renderer-scoped changes, no economy or save impact, and every screenshot in the
game improves simultaneously — because composition, not asset quality, is the current
bottleneck.
