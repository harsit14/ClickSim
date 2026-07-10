# EMBER canonical systems and progression contract

Status: **F0.1 approved contract**

Applies from: the Phase 5 baseline recorded by Agent 00

Behavior impact: none; this document records vocabulary and state boundaries before F0 schemas are wired

This document resolves the shared vocabulary and progression boundaries required by
`FUTURE.md`. Local fiction leads in player-facing copy. Canonical terms explain function,
make reset previews comparable, and give code and tests a stable vocabulary.

## 1. Naming rule

Use the local noun as the visible title. Put the canonical function in supporting copy,
the first-use explanation, the Field Guide, accessible labels, and reset previews. Do not
replace a universe's local nouns with generic labels, and do not require a player to infer
that two differently named systems have the same reset scope.

Example: **Supernova** is the visible action in Emberlight; its description says
"Emberlight's Epoch Turn." A screen-reader label for the clickable center says
"Last Ember, Heart of Emberlight."

Legacy Phase 5 copy may still use earlier local terms such as Tidefall's `Tidewell`.
Those strings are compatibility debt, not alternate canonical vocabulary. The frozen
Tidefall Heart name is **Tideheart**; player-facing copy changes belong to F2, not F0.

## 2. Canonical vocabulary

| Canonical function | Meaning | Local expression | Where the canonical term appears |
|---|---|---|---|
| **Heart** | The central, focusable input object and material source of the world's touch response. It is never merely a button or decorative primitive. | Last Ember; Tideheart; First Seed; Escapement Heart; White Lens; Storm Eye; First Chord | First-use help, accessible name, manifest role, controls, and formula/source inspection. The local name is the visible title. |
| **Kindling** | One of the eighteen base producer tiers in a universe. Kindlings turn the Heart's world currency into passive production and visible infrastructure. | Sparks/stars; currents/reefs; roots/groves; gears/engines; rays/lenses; clouds/cells; pulses/choirs | Shop introduction, generator manifests, reset previews, simulation reports, and cross-world comparison. Local tier names lead everywhere else. |
| **Omen** | A bounded active opportunity whose motion, reward table, sound, and lore belong to its universe. Missing one never removes progress. | Falling Star; Tidefall bubbles/Leviathan; pollinators; Maintenance Signals; optical flares; lightning phenomena; refrains | First-use explanation, accessibility alternatives, manifest source kind, odds/pity disclosure, and Atlas law descriptions. |
| **Field Archive** (short: **Archive**) | The universe-local collection of twelve purposeful records, grouped into three shelves. Each record has a mechanical source, world object, lore, and retained-state rule. | Astral Cabinet; Pelagic Archive; Impossible Herbarium; Patent Ledger; Spectrum Vault; Storm Almanac; Resonant Memory | Guide, completion summaries, Chronicle, reset previews, and screen-reader context. Local collection names lead in navigation. |
| **Epoch Turn** | The universe-local first prestige. It exchanges the current World run for Epoch Matter and a faster restart. | Supernova; Undertow; Pruning; Rewinding; Refraction; Discharge/Grounding ceremony; Refrain | Reset comparison, save/migration descriptions, simulator output, and the local action's supporting label. |
| **Epoch Matter** | The persistent local currency earned by an Epoch Turn and spent on the local doctrine/project layer. | Stardust; Moon Salt; Memory Seeds; Mainsprings; Facets; Fulgurites; Overtones | Currency tooltip, reset preview, formulas, saves, and simulations. The local currency name leads in the HUD. |
| **Deep** | The shared design layer reached after local Epoch mastery. Its presentation, trials, and balances are universe-local and parked with that universe. **Deep Collapse** is the second prestige boundary. | Emberlight's Deep; Tidefall's Hadal Archive; later pack-defined local faces | Guide, reset preview, save scope, formulas, trials, and cross-world summaries. Local names lead in world UI. |
| **Beacon** | A permanent, non-spendable proof that one restored universe can continue and contribute across worlds. It is not the tier-six legacy generator ID named `beacon`. | Each world's final Beacon silhouette and player-authored name where supported | Vessel/Wayfinder UI, multiverse map, Chronicle, Garden requirements, accessibility labels, and save records. |
| **Garden** | The seven-Beacon synthesis and authored closure space. It reconstructs relationships and doctrine choices; it is not an eighth normal economy. | The Garden | Story, Chronicle, and post-saga navigation. It must never be presented as Universe Eight. |
| **Atlas** | The deterministic post-saga route system that combines compatible, authored World Laws. It continues mastery after the Garden without extending the authored ending indefinitely. | Atlas of Possible Worlds; named routes and permanent Convergences | Route builder, seed/replay data, Chronicle, simulator, and compatibility diagnostics. |

The term **Deep Collapse** names an action. The term **Deep** names the layer. The term
**Archive** alone means Field Archive unless a local title is present. The legacy UI name
"Resonance Atlas" is an inspector inside the current Deep; it must be renamed before the
post-saga Atlas ships so that **Atlas** has one unambiguous canonical meaning.

## 3. Frozen universe terms

| Universe ID | World currency | Heart | Epoch Turn | Epoch Matter | Field Archive | Primary verb | Randomness |
|---|---|---|---|---|---|---|---|
| `emberlight` | Light | Last Ember | Supernova | Stardust | Astral Cabinet | kindle | Bounded random Omens and criticals allowed |
| `tidefall` | Glow | Tideheart | Undertow | Moon Salt | Pelagic Archive | surf | Bounded random Omens and criticals allowed; tide itself is deterministic |
| `verdance` | Sap | First Seed | Pruning | Memory Seeds | Impossible Herbarium | cultivate | Bounded random Omens allowed; age and harvest previews are deterministic |
| `clockwork` | Ticks | Escapement Heart | Rewinding | Mainsprings | Patent Ledger | route | Random economic outcomes are forbidden; Maintenance Signals are scheduled |
| `prismata` | Chroma | White Lens | Refraction | Facets | Spectrum Vault | focus | Bounded random Omens allowed; recipes and optical routes are deterministic |
| `tempest` | Charge | Storm Eye | Grounding | Fulgurites | Storm Almanac | discharge | Bounded random Omens allowed; charge and chosen paths are deterministic |
| `canticle` | Resonance | First Chord | Refrain | Overtones | Resonant Memory | compose | Bounded random Omens allowed; sequences and silent-mode results are deterministic |

`Discharge` is Tempest's primary verb. **Grounding** is its Epoch Turn. Do not use the
same noun for both the ordinary action and the reset.

## 4. State ownership

State has four scopes. A feature must declare one before it can add a save field.

### 4.1 World scope — local, current run

- spendable world currency;
- run earnings;
- owned Kindlings;
- ordinary upgrades;
- the current bulk-buy setting;
- a temporary trial run snapshot.

World state is lost at an Epoch Turn and above. A crossing parks it instead of resetting
it.

### 4.2 Epoch scope — local, across Epoch Turns

- unspent and lifetime Epoch Matter for the current local Deep era;
- local doctrine/constellation choices;
- local recurring Epoch works;
- the era earnings used to calculate Epoch Matter;

Epoch state is lost at a Deep Collapse and above. It is parked on crossing.

### 4.3 Deep and world-history scope — local, across Deep Collapses

- unspent/lifetime Singularities and purchased Deep laws;
- recurring Deep works;
- completed local trials and automation state;
- local Echoes, Archive records, event/click records, and story state;
- the local answer to the Question until Remembrance;
- local Epoch Turn and Deep Collapse counts.

"Shared Deep layer" means the seven packs implement the same canonical layer and hook
contract. It does **not** mean one shared Singularity wallet. Deep balances and trials are
parked with their universe so one world's mastery cannot complete another world's local
failure trials.

### 4.4 Between scope — shared across all universes

- Beacons already lit;
- Dark Between;
- Wayfinder laws;
- Vessel construction;
- global achievements and presentation preferences;
- playtime, all-world earnings, historical ending answers, and Remembrance count;
- future Chronicle records, Garden completion, and Atlas unlocks.

Dark Between is the shared spendable currency. Beacons are shared completion proofs, not
a wallet. No other minigame or world may create a new shared currency without a contract
review.

## 5. Reset and transition matrix

"Retained" includes parked state that is temporarily inactive. Every player-facing reset
must preview these boundaries in local language and must require explicit confirmation.

| Boundary | Lost or temporarily replaced | Retained | Result |
|---|---|---|---|
| **Enter a trial** | The active World wallet, Kindlings, normal upgrades, and buy mode are replaced by a temporary clean run. Trial earnings cannot produce Epoch Matter. | All Epoch, Deep, Archive/story, and Between state; local record counters. The exact pre-trial World snapshot is held for return. | Complete or abandon the trial to restore the stored World snapshot. Completion adds the local trial record. |
| **Epoch Turn** | Active World currency, run earnings, Kindlings, ordinary upgrades, buy mode, and any temporary trial return snapshot. | Epoch Matter and choices; Deep state; local reset counts; Archive/Echo/story; records; automation; all Between state. | Award local Epoch Matter, increment the local Epoch count, and apply earned starting Kindlings. |
| **Deep Collapse** | Everything lost by an Epoch Turn, plus unspent/lifetime Epoch Matter for the era, local doctrine/constellation choices, local recurring Epoch works, and era earnings. | Singularities, Deep laws/works, local Epoch Turn history, completed local trials, Archive/Echo/story, records, automation, and all Between state. | Award Singularities, increment the local Deep count, and apply earned starting Kindlings. |
| **Remembrance** | In the active universe: World, Epoch, and Deep balances/upgrades/works, local Epoch Turn and Deep Collapse counts, local trial completion, local story-seen sequence, automation configuration, and the current answer. The progressive UI is re-earned. | Active universe Echoes, Archive, achievement and performance records, presentation settings, theme, all-time/playtime records, historical answers, and all Between state. Other parked universe runs remain parked unchanged for v12 compatibility. | Append the answer to history, increment the shared Remembrance count, clear the active answer, and replay that universe's opening with the permanent memory multiplier. |
| **Crossing** | Nothing. Crossing is not a reset. Temporary trials block departure. | The entire departing local run is parked; all Between state remains active. A visited destination is restored exactly. | A first visit starts from the destination's opening state plus explicit Wayfinder starting benefits. |
| **Light a Beacon** | Nothing. Lighting is not a reset and never consumes the final Kindling. | All local and shared state. | Record the universe ID once, award its deterministic Dark Between amount once, and expose its global contribution. |
| **Atlas route (planned)** | Nothing in the source universe. Route-only state is discarded or archived when the route ends. | Source universe parking, Between state, Chronicle, and permanent route unlocks. | Run a seeded sandbox from an explicit route configuration. No route may mutate a source run through hidden side effects. |
| **Full wipe** | Every local, parked, historical, preference, recovery, and Between value. | Only an external export the player made before confirmation. | Return to a new v-current save. This is the only boundary that extinguishes Beacons or deletes parked worlds. |

The v12 Remembrance rule is intentionally explicit: it resets only the active local run
and leaves other parked runs intact. Changing that behavior would require a new save
version, a migration and rollback plan, reset-preview changes, and separate approval.

## 6. Crossing, parking, and Beacons

1. The save owns one active universe ID and a map of parked `UniverseRunState` values.
2. A crossing snapshots the departing universe before switching the active ID.
3. A known destination restores its parked snapshot; a first visit constructs only the
   pack's declared opening state and shared Wayfinder starting benefits.
4. Pack-local IDs are resolved with the universe ID as part of their identity. A renderer
   must consume the destination's manifest; it may not treat a legacy ID such as `spark`
   or `beacon` as semantic information.
5. Offline progress applies to the active universe under the current v12 behavior. Parked
   universes do not silently simulate unless a future saved, deterministic project says so.
6. A Beacon can be lit only once per universe, outside a trial, after that universe's
   local Vessel and the pack's declared requirement are complete. Vessel parts are
   recorded per universe; completing Emberlight's Vessel never activates a later world.
7. A lit Beacon survives Epoch Turns, Deep Collapses, Remembrances, and crossings. It is
   visible at the horizon/map, contributes its declared global law, and can participate
   in Garden and cross-world projects.
8. A Beacon must never be inferred from a generator ID. Its requirement and visual object
   are explicit pack data.

## 7. Determinism and bounded randomness

The following are deterministic and previewable from explicit state:

- purchases, costs, rates, upgrades, doctrines, and reset gains;
- tide/age/schedule/recipe/charge/sequence mechanics at a supplied time or seed;
- offline calculations and recovery caps;
- crossings, parking, Beacon rewards, and Atlas route generation/replay;
- accessibility alternatives, including averaged rhythm rewards.

Randomness is allowed only when the pack contract permits it and only for bounded surprise:

- critical clicks, Omen arrival/variant selection, and cosmetic variants;
- rewards whose odds are disclosed after first discovery and that have a declared pity
  threshold when rare;
- acceleration or alternate presentation, never exclusive permanent power.

Physics hooks are pure. They receive time, context, and any seed/random sample as input;
they do not call `Date.now()`, `Math.random()`, storage, audio, Canvas, or Svelte state.
Clockwork sets `randomAllowed: false` for economic behavior. Muting audio, reducing motion,
choosing low quality, or using a non-rhythm mode never changes deterministic economic
eligibility.

## 8. Contract-change rule

Any proposal that changes a noun, reset boundary, currency scope, parking rule, Beacon
retention, or randomness policy must include:

1. the exact old and new contract;
2. save and migration impact;
3. player-facing reset-preview impact;
4. deterministic and accessibility tests;
5. rollback behavior and rejected alternatives.

Until Agent 00 approves and lands that change at a new gate, this document is the source
of truth.
