# Loka Depth Plan — Filling the Mid/End Game of Brahmalok, Vishnulok, and Kailash

Status: design proposal, not yet implemented.
Scope: the three loka realms in save slots `prismata`/`u5`, `tempest`/`u6`, `canticle`/`u7`.
Authority: subordinate to `TRIMURTI_REFRAME.md`. Every cultural guardrail there applies
verbatim to everything below; where this document and the reframe conflict, the reframe wins.

---

## 1. Diagnosis — why the last three realms feel vacant

The three lokas are structurally complete (18 Kindlings, 12 Archives, omens, doctrines,
trials, an epoch, a Beacon) but they share four root causes of mid/end-game emptiness that
the four earlier universes do not have:

1. **The law never deepens.** Each realm's signature mechanic (`f4-runtime.ts`) is fully
   available the moment the player arrives — Brahmalok's four modes and routing, Vishnulok's
   circuit configuration, Kailash's 16-slot cycle editor. Each has one optimal configuration
   that is solved in the first session. Kindlings 7–18 — the entire middle and end of the
   realm — introduce no new verb, no new decision, and no reason to touch the instrument
   again. The player's remaining interaction is buy-max on the Kindling rail.

2. **The multipliers plateau exactly when numbers get big.** Brahmalok's balanced mandala
   caps near ×2.7, Vishnulok's discharge loop repeats identically forever, Kailash's pattern
   bonus caps at +0.36 and the cycle runs on wall-clock with zero required input. Mastery
   has nowhere to go.

3. **The world does not accumulate.** The three realms still render through the frozen
   `createFuturePresentation` bridge — three generic primitive layers per object.
   `future-presentation.ts` itself says authored set-piece paths are required and generic
   stacking is frozen; the three lokas are the grandfathered exceptions. The endgame
   screenshots (`docs/screenshots/endgame/{brahmalok,vishnulok,kailash}.png`) show 1e80
   currency and ~1,200 owned Kindlings rendered as: one glowing heart, floating labeled
   Archive icons, bokeh dots, and an empty ground plane. Compare Verdance (root network,
   canopy, cohort-staged groves) and Tidefall (populated middle band). The game's first
   design pillar is "the screen IS the progression" — these three realms break it after
   the first hour.

4. **The law lives only in the HUD.** All three screenshots show the realm mechanic as a
   text strip at the top of the screen. The heart — the supposed central instrument — does
   not visibly change with mandala balance, circuit charge, or cycle position. Tidefall has
   `heart-response.ts`; the lokas have nothing equivalent.

The fix is therefore the same shape in all three realms: **give the signature law a
mid-game escalation that makes the player re-engage the instrument, and make every act of
mastery leave a permanent visible trace in the world.**

---

## 2. Design principles

- **The realm asks; the player answers.** All three new mid-game systems are framed as the
  realm itself changing (a question posed, a strain appearing, weather crossing the ridge)
  and the player responding with the verb they already know (unfold / sustain / release).
  The player never gains command over anything sacred; they get better at *listening*.
  This is both the retention fix and the cultural-guardrail fix in one move.
- **Mastery paints the screen.** Every well-answered prompt leaves a permanent, bounded,
  authored world element. Endgame vacancy is solved by accumulation of these traces, not by
  particle spam.
- **Idle players lose nothing.** Every new system is an overlay on the existing baseline.
  Ignoring it entirely leaves current behavior intact (same floors, same idle rates). The
  new multipliers are bounded and additive-then-capped so the balance simulator stays sane.
- **Full accessibility parity.** Every new signal ships with a non-color signal entry
  (text + shape + pattern), a reduced-motion static equivalent, and a muted-play caption,
  exactly as the existing `nonColorSignals` / `silenceState` contract requires.
- **Save-stable.** No new universe IDs, no renamed keys. All new state lives in the
  existing numeric-law-state maps under `u5-`/`u6-`/`u7-` prefixed keys. Old saves load
  with the new systems at zero progress and no migration required.

---

## 3. Brahmalok — the realm that keeps asking

Fiction anchor: *"Creation continues only while revision remains possible."* Brahmalok's
current failure is ironic — the realm about refusing final answers is solved with one
final answer (route everything, pick Fourfold Mandala, never touch it again).

### 3.1 Mid-game system: Folio Commissions

**Unlocks:** first purchase of Kindling 7, the Fourfold Loom ("seed, measure, name, and
form begin weaving reciprocal obligations").

Every few minutes (suggested 4–7 min, pausing while a trial is active), one of the four
directions poses a **Commission**: a request for a specific, *deliberately imbalanced*
mandala profile, held for a bounded window. Examples:

- *Seed asks:* "What waits when nothing is finished?" → hold Form at zero and Seed
  strongest for 60s.
- *Measure asks:* "What did your strongest direction exclude?" → bring the weakest
  direction within 20% of the strongest.
- *Name asks:* "Which record has no title yet?" → hold Name strongest while at least
  three directions stay active.
- *Form asks:* "Can a body remain revisable?" → change at least four Kindling routes
  during the window.

The commission is answered by doing what the realm already teaches: re-routing Kindlings
and switching modes. Answering within the window yields:

- a temporary buff (suggested ×1.5–×2.0 production for 90–150s, never stacking above one
  active commission), and
- one permanent **Folio Sketch** — a lifetime counter (`u5-folios`) that drives world
  accumulation (§3.3).

Missing or ignoring a commission has **no penalty**; the question simply closes unanswered
("the margin stays blank") and another arrives later. Commissions never demand clicking
speed — every profile is reachable through routing, which is free and instant by design.

Direction of escalation: commission profiles draw from a fixed authored pool (~16 entries,
4 per direction), tiered so later entries only appear after more Archives are found. Late
commissions ask for compound profiles ("Name strongest *and* five routes changed"). All
copy is game-fiction voice, English working names, no invented Sanskrit (guardrail 5),
and questions come from the *directions*, never from Brahma or Saraswati.

### 3.2 Endgame system: the Fifth Reading (mode conversation)

**Unlocks:** all 12 Archive records found (the Unclosed Folio completes the set).

The player may set a **margin mode** beside the primary mode: a second mode of the four,
applied at 40% strength. Fiction: the finished page keeps a ruled margin for a second
hand. This is not a fifth mode and not a power spike — it is a build-crafting layer for
optimizers (Germination + Memory margin for active play, Mandala + Proliferation margin
for breadth, etc.). Suggested cap: total law multiplier ≤ ×4.2 with a perfect margin
pairing, up from today's ~×2.7 ceiling.

State: `u5-margin-mode` (0–4, 0 = none). Retained across Recomposition (add to
`retainedF4LawConfiguration`), consistent with routes and mode already being retained.

### 3.3 World accumulation: the Four Courts and the Thousand-Petal Sky

Replace the generic presentation with an authored `src/render/prismata/world-layer.ts`
(pattern: `src/render/verdance/world-layer.ts`):

1. **Four direction courts.** The ground plane divides into four quarters around the
   heart — seed gardens, measure halls, name terraces, form workshops. Each quarter's
   density and silhouette stage is driven by *routed ownership* in that direction at the
   existing 1/10/25/50/100 thresholds. Re-routing a Kindling visibly moves structures
   between quarters. This makes the routing verb — the realm's whole mechanic — legible
   in the world for the first time.
2. **Folio shelf-line.** Each answered Commission adds one folio to a low horizon shelf
   behind the courts (capped at ~24 rendered folios; the counter keeps counting and the
   cap is logged in the world tooltip: "…and N more, kept in the margins").
3. **Thousand-petal convergence.** As the coalescence thresholds (25/50/100) fire, petal
   whorls accumulate in the sky, one contour family per Kindling group, converging on the
   existing `primarySilhouettes[2]` ("a thousand-petal horizon whose center remains
   unclaimed"). The center square of the sky must always remain empty — that is the
   authored point.
4. **Heart response.** The Lotus of Becoming renders current balance directly: four petal
   arcs whose lengths are the four direction totals, an open center square, and the
   active mode as a pattern (dot / ruled line / hatch / blocks — reuse the existing
   `nonColorSignals` patterns). During a commission, the asking direction's arc carries a
   slow attention pulse (static highlight ring under reduced motion).

Reduced motion: all growth states render at fixed authored positions; commission attention
becomes a labeled static ring. Muted: commission arrival/answer announced through the
existing polite announcement lane with text.

---

## 4. Vishnulok — the ocean that needs you

Fiction anchor: *"Preservation means noticing imbalance, offering refuge, and returning
every correction to the living whole."* Currently nothing ever *needs* noticing — charge
fills, the player discharges, forever.

### 4.1 Mid-game system: Strains

**Unlocks:** first purchase of Kindling 8, the Restoring Shoal ("damage becomes a shared
route for repair").

The ocean develops slow, visible, named **Strains** — environmental imbalances, never
enemies and never combat (guardrail 8): a coast thinning, a school scattering, a shelter
crowded past its threshold, two currents running too far apart. One strain is present at
most at a time; each announces itself in the world (a labeled marker with shape + pattern)
and in text, and *waits* — strains never expire in under 10 minutes and carry no fail
state or damage. An untreated strain simply persists; the ocean is patient.

Each strain type **prefers a circuit shape**:

| Strain | Preferred correction |
|---|---|
| Thinning coast | long route (6+ shelters), sheltered burden |
| Scattered school | short route, far-reaching burden |
| Crowded shelter | medium route through that shelter, strained burden |
| Divided currents | Ocean Balance circuit at any length |

Completing a return whose configuration matches the strain's preference:

- resolves the strain with an elevated return (suggested +60–100% on that discharge's
  boost, applied once), and
- adds one permanent **Woven Route** (`u6-routes`, lifetime counter) to the living chart
  (§4.3).

A non-matching discharge still works exactly as today and *also* soothes the strain
partially (two generic returns resolve it). Idle players who never reconfigure lose only
the elevated bonus. This converts "configure once, discharge on cooldown" into
"read the ocean, answer with the right route" — which is precisely the realm's stated
mechanic ("a selected correction route restores imbalance and returns").

### 4.2 Endgame system: Confluence Returns

**Unlocks:** the existing Horizon Return signature upgrade (`u6-auroral-return`).

The circuit gains a second, independent charge track at half fill rate. Two returns may
run staggered; if their active windows overlap, the overlap seconds gain a bounded
confluence bonus (suggested ×1.25 on top, capped). Fiction: two currents exchange warmth
without merging (the Twin Current Chart archive made mechanical). Active players get an
overlap-timing minigame; idle players simply have a second slow circuit.

State: `u6-charge-2`, `u6-boost-seconds-2`. Nothing retained across Renewal beyond the
existing path config keys.

### 4.3 World accumulation: the Living Chart

New authored `src/render/tempest/world-layer.ts` (the existing `traffic.ts` stays):

1. **Shelter ring.** The realm's shelters (drawn from Kindling ownership groups) sit as
   actual world objects on the ocean around the open refuge — arches, reefs, lamp posts —
   staged by the 1/10/25/50/100 thresholds. Routes have somewhere real to travel.
2. **Woven routes.** Every resolved strain and every N completed returns (suggest N = 10)
   draws one faint permanent gold route line between the shelters it touched, capped at
   ~20 rendered lines with the oldest fading to thread-weight. Endgame ocean = a woven
   navigation chart converging on `primarySilhouettes[2]` ("a horizon-scale circuit that
   closes without enclosing the sea"). The refuge at the center **stays unoccupied**.
3. **Return in motion.** During an active boost, the discharge renders as a single gold
   pulse traveling the selected route shelter-by-shelter and *returning* — the mechanic's
   most important word, currently invisible. Reduced motion: the full route renders as a
   static numbered path with a progress fraction.
4. **Heart response.** The Endless Circuit's rings fill with charge (segmented, numbered,
   matching the existing `u6-building` non-color signal), show the configured route length
   as notches, and settle to the still-water state between returns.
5. **Strain markers** use shape + pattern + label (never color alone), sit in the middle
   band, and leave a small restored feature behind when resolved (repaired reef seam, lit
   lamp, ferry line) — bounded to the same ~20-element cap.

Cultural note: strains are weather-of-the-ocean, not attacks; corrections restore rather
than destroy; the chakra remains absent (the correction wheel stays the abstract seasonal
wheel per the existing story); Ananta is never rendered as the circuit (already enforced
by the spec, preserved here).

---

## 5. Kailash — the mountain that leads

Fiction anchor: *"Read the routes of snow, shelter, ash, cloud, and return."* The current
sequencer runs on wall-clock with no input; the realm about deliberate rhythm is the one
realm the player never touches.

Kailash is the most culturally sensitive realm, so its escalation deliberately inverts
agency: **the mountain sets the rhythm; the player recomposes to answer it.** The player
never commands dissolution — they prepare for it, shelter through it, and walk back down.

### 5.1 Mid-game system: Weather Fronts

**Unlocks:** first purchase of Kindling 9, the Cloud Stair ("concealment can protect a
passage without denying it exists").

Slow, readable **fronts** cross the ridge, one at a time, each lasting 3–5 minutes with a
long visible approach (a front is announced ~45s before it arrives — the Copper Weather
Vane archive made mechanical: "attention moved before force did"). Each front changes
which cycle compositions the mountain currently favors:

| Front | The mountain favors | Composition answer |
|---|---|---|
| Passing snow | grace and rest slots | add rests; grace multiplier +50% during front |
| Fire season (far ridge, never spectacle) | release **only when adjacent to shelter** | sheltered releases pay double; unsheltered releases pay the normal rate (never a penalty) |
| Cloud bank | veil and concealment | veil slots +50%; a hidden pass bonus if ≥2 veils |
| Clearing | emergence and transitions | transition-count portion of the pattern bonus doubles |

The player answers by editing the cycle — the existing, currently-ignored verb. A cycle
that answers the front well (measured by a simple authored predicate per front) accrues
**Descent Traces** (`u7-traces`, lifetime counter) at front's end, plus a modest carry-over
bonus into the next front (suggested ×1.2 for its first minute). A player who never edits
keeps today's exact behavior — fronts only ever *add*.

All front effects are strictly bounded, fire is one late boundary among snow/water/cloud
(guardrail: never spectacle, never gore), and the required grammar (shelter before
release) is the realm's own stated ethic turned into play.

### 5.2 Endgame system: the Long Rest

**Unlocks:** all three Mountain Witness shelves complete.

An opt-in stillness state, entered from the Still Point: the cycle pauses on an open rest
interval, clicking is disabled by choice, and a bounded **grace reserve** fills over real
time (suggested cap: 30 minutes of accrual). Leaving the Long Rest converts the reserve
into an elevated pattern bonus for the next cycles (suggested up to +0.4 pattern bonus,
decaying over 10 minutes). Mechanically it is an *active decision to stop* — the only
idle mechanic in the game that is chosen rather than incidental, which is exactly this
realm's thesis ("a bounded pause keeps release from becoming compulsion"). It also gives
the "Meaningful Rest" trial a permanent home in ordinary play.

State: `u7-grace-reserve`, `u7-long-rest` (0/1). Neither is retained through Release
(a Release ends the rest, by definition).

### 5.3 World accumulation: the Inhabited Descent

The one place the world must **not** fill is the summit — the still point stays
unoccupied forever. Kailash's accumulation therefore builds *downward and outward*:

New authored `src/render/canticle/world-layer.ts` (the existing quiet wind/snow stays):

1. **The path downward.** Descent Traces build a switchback trail from below the summit
   to the valley: cairns, lamp posts, rope lines, way-shelters, appearing in authored
   order (capped at ~18 rendered stations; the Path Downward archive made visible). This
   is the realm's endgame portrait: a fully inhabited descent under an untouched peak.
2. **Valley life.** Kindling ownership thresholds stage the valley band: shelters lit,
   cedar groves, terraced meadows, the river thread braiding as River Thread /
   High Lake / Valley Shelter counts grow — using the coalescence merges already in data.
3. **Ash-and-renewal bands.** Each epoch-scale Release adds one snow/ash/soil/shoot band
   to a slope core (the Snow-Ash Core archive), capped at ~8 visible bands — losses stay
   visible while renewal accumulates over them.
4. **Weather in the world.** Fronts render as what they are — a snow veil, a copper
   horizon glow on the far ridge, a cloud bank crossing the pass — each with a static
   reduced-motion composition and a text announcement. The approach warning is a turned
   weather vane plus label, not a flashing alert.
5. **Heart response.** The Still Point shows the 16 slots as a physical ring of notches
   around the empty center with the live position marked, the current act named, and the
   incomplete copper ring appearing only late (as the spec already promises). During the
   Long Rest the ring holds still and the reserve renders as a slowly filling lamp at the
   lowest shelter — light facing the path down, per the Night Refuge Lamp archive.

---

## 6. Cross-cutting requirements

1. **Retire the frozen bridge for these realms.** Each realm gets an authored world layer
   and set-piece registry equivalent to Verdance/Tidefall
   (`src/render/{prismata,tempest,canticle}/world-layer.ts` + set-piece registry entries),
   after which the `FROZEN_LEGACY_USERS` exemption in `future-presentation.ts` can shrink
   and eventually disappear.
2. **Shelf completions become set pieces.** Each realm's three Curiosity shelves currently
   pay out invisible text. Each completion should trigger a small in-world moment
   (10–15s, skippable, reduced-motion equivalent): Brahmalok — a court illuminates;
   Vishnulok — a harbor lights and a route draws itself; Kailash — a way-shelter opens on
   the descent. Nine authored moments total, spread through exactly the mid-game stretch
   that is currently silent.
3. **Balance discipline.** All new multipliers are bounded and multiplicative with
   existing law multipliers only through the single f4 pipeline. Suggested realm-law
   ceilings after this work: Brahmalok ≤ ×4.2, Vishnulok ≤ ×5.5 transient / ×1.1 baseline,
   Kailash ≤ ×5.0 transient. Run `balance/simulate.ts` profiles (idle-only, active,
   optimal) before and after; idle-only must be within ±5% of current pacing, and the
   wall policy (§12 of `GAME_DESIGN.md`) must hold with the new prompt cadence counted as
   events.
4. **Prompt cadence discipline.** Commissions, strains, and fronts are the same species
   of heartbeat as falling-star events. At most one law prompt active per realm at a time;
   none may demand response in under 45 seconds; all are ignorable without penalty; all
   pause during trials, ceremonies, and consent dialogs (Kailash's dissolution consent
   flow especially must never race a weather front).
5. **Accessibility contract.** Every new state adds entries to the realm's
   `nonColorSignals`, a caption line to `silenceState` handling, static reduced-motion
   compositions, and announcement-lane messages with dedupe keys — matching the existing
   per-universe announcement policy.
6. **Cultural review remains the gate.** Everything above is game-fiction built from each
   realm's existing approved vocabulary (folios, currents, weather). No new sacred names,
   no deity depiction, no sacred objects as mechanics. All new public copy joins the
   existing external-consultant review queue before release; technical activation is not
   a substitute (per `TRIMURTI_REFRAME.md`).

---

## 7. Implementation map

| Area | Files | Work |
|---|---|---|
| Law state & math | `src/content/universes/f4-runtime.ts` | Commission/strain/front state machines as pure functions over the numeric law state; new keys `u5-commission*`, `u5-folios`, `u5-margin-mode`, `u6-strain*`, `u6-routes`, `u6-charge-2`, `u6-boost-seconds-2`, `u7-front*`, `u7-traces`, `u7-grace-reserve`, `u7-long-rest`. Extend `advanceF4LawState` (all three realms need ticking now, including `canticle`), `f4RateMultiplier`, `retainedF4LawConfiguration` (retain `u5-margin-mode`; nothing else new survives an epoch — lifetime trace counters live outside law state, see below). |
| Trace counters | wherever lifetime stats already persist per universe (Chronicle keys) | `folios`, `routes`, `traces` must survive epochs *and* be save-stable — store them alongside existing lifetime counters, not in resettable law state. |
| Content | `src/content/universes/{prismata,tempest,canticle}/index.ts` | Commission pool, strain table, front table, new copy, new non-color signal entries, Lumen lines for first commission/strain/front. |
| Render | `src/render/{prismata,tempest,canticle}/world-layer.ts` (+ set-piece registries) | Authored world layers per §3.3/§4.3/§5.3, heart responses, shelf set pieces. Follow `src/render/verdance/world-layer.ts` and `src/render/tidefall/heart-response.ts` as patterns. Respect the existing density caps and central-clearing rules. |
| UI | law panel components for the three realms | Surface the active prompt (question/strain/front) in the settled instrument strip; the world remains the primary display, panel is confirmation. |
| Tests | `tests/` | Pure-function tests for every state machine (prompt scheduling determinism, bounded multipliers, retention across epoch, old-save load at zero progress); simulator regression run. |
| QA | `docs/qa` | Re-capture the endgame gallery for the three realms; the acceptance test is visual (§8). |

Suggested build order (each step ships independently):
1. Kailash weather fronts + descent traces (highest vacancy, clearest fiction fit).
2. Vishnulok strains + living chart.
3. Brahmalok commissions + four courts.
4. Endgame layers (Fifth Reading, Confluence, Long Rest).
5. Shelf set pieces + heart responses polish pass.

---

## 8. Acceptance criteria

- A player idling in each realm's mid-game sees a realm-authored prompt at least every
  ~7 minutes and can answer it using only the realm's existing verb.
- Ignoring every prompt forever produces production within ±5% of today's build.
- The endgame screenshot of each realm is visibly *earned*: direction courts / woven
  chart / inhabited descent are present, distinct at 1280×800, and absent in a
  fresh-arrival screenshot of the same realm.
- The summit stays empty, the refuge stays open, the lotus center stays unclaimed —
  in every ownership state, at every quality tier, in reduced motion, and after 100%
  completion.
- All 481+ existing tests stay green; `npm run verify` passes; initial-payload budget
  holds; old saves load with all new counters at zero and no console warnings.
