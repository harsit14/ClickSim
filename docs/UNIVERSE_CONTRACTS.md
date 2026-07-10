# Universe V2 contract lock

Status: **F0.2 approved contract**

This record explains how the compile-only contracts in
`src/content/universes/types.ts` enter the existing Phase 5 runtime. F0 adds no content,
does not register another universe, does not change the save schema, and does not change
current rendering or economy behavior.

## 1. Migration decision: temporary explicit adapter

The current `UniversePack` is **adapted temporarily**, not migrated atomically in F0.
An all-at-once runtime migration would combine renderer, audio, accessibility, content,
numeric, and save risk in one change. The temporary bridge allows one current universe
to prove the contract while v12 saves continue to use the existing registry.

The bridge is not permission to invent defaults. A legacy pack may contribute its
existing stable ID, generator definitions, upgrade definitions, Lumen lines, Echoes,
palette, and current mechanics. An adapter must also receive an explicitly authored and
validated V2 supplement containing:

- identity and canonical/local vocabulary;
- world and Epoch currency presentation;
- four doctrines and the local Epoch Turn;
- Heart and object manifests;
- pure law hooks and randomness policy;
- at least four Omen definitions;
- twelve Archive record manifests and three shelves;
- trials, story scenes, audio cues/buses, visual grammar, Beacon, and accessibility data.

The adapter must fail closed when a required supplement or referenced source is missing.
It may not create a generic circle, motion, sound, accessible label, or economic behavior
from a legacy ID. In particular, IDs such as `spark`, `beacon`, `sun`, and `ember2` are
opaque pack-local keys.

The planned retirement sequence is:

1. F0: additive type contracts and type-only fixtures; legacy runtime unchanged.
2. F1: implement the validated bridge and run Emberlight through the normalized V2
   consumer path. Unported packs may remain on the legacy path during the bounded port.
3. F2: deliver Tidefall's complete supplement/native pack, move it to the V2 path, and
   remove any generic legacy rendering fallback.
4. F3: new universes implement `UniversePackV2` directly. They are never authored as
   legacy packs.
5. Remove the adapter after both current worlds and all shared consumers no longer need
   it. Adapter removal is an integration commit, not worker cleanup.

## 2. Frozen pack shape

`UniversePackV2` requires:

- one of the seven frozen `UniverseId` values;
- an identity and civilization question;
- one World currency presentation;
- exactly eighteen initial Kindlings;
- any number of ordinary upgrades;
- exactly four initial doctrines;
- one local Epoch Turn and Epoch Matter presentation;
- a Heart manifest and pure `UniverseLawHooks`;
- at least four Omens;
- exactly twelve Archive records in exactly three four-record shelves;
- local trials and story;
- audio, visual, Beacon, and accessibility definitions.

Tuple cardinality is a compile-time authoring constraint. Runtime validation is still
required at pack boundaries because imported JSON and migration data do not carry
TypeScript guarantees.

The seven fixtures in `src/content/universes/type-fixtures.ts` contain only exported
types. They bind every frozen ID to its World currency, Heart, Epoch Turn, Epoch Matter,
and Archive name; they create no pack object and cannot register runtime content.

## 3. Numeric boundary in the schema

Declarative costs and rates use `ContentAmount`, which accepts current finite JavaScript
numbers during the bridge and the reserved canonical scientific string form for future
content. Pure hooks receive immutable `EconomyAmount` values rather than operating on
raw save strings. F0.3 defines normalization, serialization, and the atomic v13 migration;
F0 does not instantiate `EconomyAmount` or alter arithmetic.

Multipliers, probabilities, timing values, gain ratios, and visual/audio parameters stay
finite JavaScript numbers. Currency balances, costs, rates, and awards cross the numeric
abstraction. A hook returning `NaN`, infinity, a negative elapsed time, or an unnormalized
amount is invalid.

## 4. Pure law hooks

`UniverseLawHooks` receives immutable state plus explicit time/context and returns data.
It must not:

- mutate its state or purchase input;
- read Svelte state, the DOM, Canvas, Web Audio, storage, or network state;
- call `Date.now()`, `performance.now()`, or `Math.random()`;
- dispatch UI effects or calculate layout;
- hide an unbounded or exclusive permanent reward behind randomness.

Random samples are supplied by an orchestrator only when `randomAllowed` is true.
Clockwork sets it to false. Offline hooks receive elapsed time explicitly and return the
credited interval, production, and a serializable law-state patch.

## 5. Semantic feedback and audio boundary

Economy code emits a `SemanticFeedbackEvent` describing what occurred. Render, audio,
caption, haptic, and announcement consumers decide how to present it. The event is not a
CSS class, sound filename, Canvas instruction, or toast sentence.

The tier budget is canonical:

| Tier | Meaning |
|---:|---|
| 0 | continuous/passive state |
| 1 | touch or ordinary purchase |
| 2 | skill/critical/efficient action |
| 3 | discovery |
| 4 | mastery |
| 5 | Epoch, Deep, Beacon, Remembrance, or crossing ceremony |

Bulk actions carry one aggregation record; they do not emit one ceremony per unit.
Timestamps are supplied by the caller so tests can reproduce ordering and aggregation.

Audio buses are explicit and user-controllable. Muting a bus always means
`suppress-audio-only`: it cannot suppress the semantic event, reward, timing window, or
progression. Each cue declares a mute group and a muted fallback. Milestone and timing
cues require a visual and/or caption equivalent; continuous touch cues may declare no
announcement to prevent assistive-technology spam.

## 6. Renderer boundary

A renderer consumes `HeartManifest`, `WorldObjectManifest`,
`UniverseVisualManifest`, and semantic feedback. It never reads generator IDs to choose a
shape, movement, material, screen zone, reward, or production formula.

For every object it must honor:

- phenomenon and mechanical purpose;
- screen zone, salience, overlap group, and minimum Heart distance;
- motion grammar and panel-open priority;
- all five ownership states when the object represents a Kindling;
- reduced-motion and low-quality states;
- audio/lore references when present.

Missing meaning is a pack validation error, not a request for a generic primitive.
Economy consumers likewise use definitions and pure hooks; Canvas and Svelte components
do not calculate production.

## 7. Accessibility boundary

Every pack declares Heart/currency labels, reading order, announcement policies,
non-color signals, timing equivalents, muted behavior, reduced-motion behavior, and
low-quality behavior. The three fallback modes preserve full gameplay eligibility.

The averaged rhythm range is a contract input, not a presentation multiplier chosen by a
component. F1 accessibility work must keep it within the balance target in `FUTURE.md`
and must test keyboard, muted, screen-reader, high-contrast, reduced-motion, and
low-quality paths before a consumer is accepted.

## 8. Change control

Changing any exported V2 field, tuple cardinality, hook signature, feedback meaning,
audio mute behavior, or fallback guarantee requires Agent 00 approval and a new gate
commit. New universe workers may propose a diff; they may not fork this contract locally.
