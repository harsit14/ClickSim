# Save compatibility, stable ID, and numeric migration plan

Status: **F0.3 approved decision record**

The Phase 5 baseline reads and writes save version 12 and uses JavaScript `number` for
all economy values. F0 does not change that runtime behavior. This document reserves the
next versions and IDs, and defines the numeric project that must land before multi-year
or Atlas progression.

## 1. Compatibility policy

- Save versions are positive integers. Missing, fractional, non-numeric, and future
  versions are rejected.
- A save is migrated one explicit, idempotent step at a time. A version is emitted only
  after its complete migration, sanitizer, fixtures, and rollback behavior ship together.
- First-party fixtures from every historical version remain loadable. The current suite
  already proves a v1-to-v12 chain and keeps v11/v12 preference cases.
- Forward compatibility is not guessed. An older client must reject a future version
  rather than strip fields and overwrite it.
- Stable IDs are never reused, including after content removal. Known removals migrate
  explicitly before unknown IDs are sanitized.
- Major migrations keep their inbound aliases and fixtures permanently. A dedicated raw
  rollback snapshot is retained for at least two shipped save versions and at least
  ninety days after the v13 release, whichever is longer.

The **next save version is 13**. Version 13 is reserved for the atomic economy-number
migration and may not be consumed by an unrelated settings or presentation change.

## 2. Reserved migration versions

Reservations prevent parallel lanes from choosing conflicting versions. A reservation
does not authorize a worker to edit `src/core/save-data.ts` or emit the version early.

| Version | Owner/stage | Reserved serialized change |
|---:|---|---|
| 12 | Phase 5 baseline | Current finite JavaScript-number save and presentation preferences |
| 13 | F1 numeric integration | Canonical scientific-string economy amounts, numeric law-state envelope, and pre-v13 rollback snapshot |
| 14 | F1 cohesion integration | Persisted Goal Lens/accessibility preferences if required; otherwise an explicit no-op bridge before v15 |
| 15 | F3 Verdance | `verdance` parked run, cohort/age state, graft/loadout state, local Archive/Beacon data |
| 16 | F3 Clockwork | `clockwork` parked run, routing graph, scheduled-signal state, route loadouts |
| 17 | F4 Prismata | `prismata` parked run, spectrum routes/recipes, optical loadouts |
| 18 | F4 Tempest | `tempest` parked run, charge cells, saved discharge paths |
| 19 | F4 Canticle | `canticle` parked run, sequence slots/presets, silent-equivalence state |
| 20 | F5 Chronicle/loadouts | Chronicle records, personal bests, Beacon names, validated build-code metadata |
| 21 | F5 Garden | Garden state graph, doctrine reconciliation, authored closure and transition state |
| 22 | F5 Atlas | Atlas law library/version, seeded route state, deterministic replay data, permanent Convergence archive |

If a reserved feature needs no serialized data, its migration is an explicit no-op that
advances the chain and is covered by a fixture. Version numbers are not reassigned.
Schema changes discovered within one feature use that feature's reserved version when
they can migrate atomically; otherwise Agent 00 reserves the next unclaimed integer.

## 3. Stable ID scope and grammar

The persisted identifier remains a lowercase hyphenated string matching
`^[a-z0-9][a-z0-9-]{0,63}$`. The numeric bands below are registry ordinals used for
review, fixtures, and collision prevention; saves persist the string, not the ordinal.

Pack-local IDs are addressed by the composite key
`<universe-id>/<source-kind>/<content-id>`. Legacy U1/U2 IDs such as `spark`, `sun`, and
`beacon` are grandfathered and remain scoped by universe. They do not describe semantic
meaning and are never interpreted by a renderer.

All newly persisted definitions use a namespace prefix even when stored inside a parked
run. Recommended form: `<prefix><kind>-<two-or-three-digit-slot>`, for example
`u3-kindling-01` or `atlas-law-economy-04`. User-visible names are separate fields and may
change without changing IDs.

### 3.1 Reserved bands

| Scope | Frozen ID/prefix | Registry ordinals | Save version |
|---|---|---:|---:|
| U3 Verdance | universe `verdance`; content `u3-` | 3000–3999 | 15 |
| U4 Clockwork | universe `clockwork`; content `u4-` | 4000–4999 | 16 |
| U5 Prismata | universe `prismata`; content `u5-` | 5000–5999 | 17 |
| U6 Tempest | universe `tempest`; content `u6-` | 6000–6999 | 18 |
| U7 Canticle | universe `canticle`; content `u7-` | 7000–7999 | 19 |
| Garden | content `garden-` | 8000–8199 | 21 |
| Chronicle/loadouts | content `chronicle-` / `loadout-` | 8200–8399 | 20 |
| Atlas/Convergences | content `atlas-` / `convergence-` | 8400–8999 | 22 |

Ordinals 1000–1999 and 2000–2999 are reserved for future V2 identifiers belonging to
Emberlight and Tidefall respectively. Existing legacy strings are not rewritten merely
to occupy those bands.

### 3.2 Universe subranges

For each 1000-ID universe band, replace `x` with the universe number:

| Ordinals | Definition family |
|---:|---|
| x000–x019 | pack, Heart, currencies, Epoch Turn, Deep face, Beacon |
| x020–x099 | eighteen Kindlings and producer support definitions |
| x100–x299 | upgrades, doctrines, declarative effects, local projects |
| x300–x349 | Omens and reward tables |
| x350–x449 | Archive records, shelves, and Archive interactions |
| x450–x549 | Deep and Mastery Trials |
| x550–x699 | Lumen lines, Echoes, scenes, transmissions |
| x700–x849 | visual objects, audio cues/stems, accessibility signals |
| x850–x899 | Beacon routes and cross-world project integration |
| x900–x999 | reserved for that universe; never borrowed by another scope |

### 3.3 Garden, Chronicle, and Atlas subranges

| Ordinals | Definition family |
|---:|---|
| 8000–8049 | Garden state graph and seven-Beacon synthesis nodes |
| 8050–8099 | doctrine reconciliation and closure choices |
| 8100–8149 | Garden story, scene, visual, audio, and accessibility IDs |
| 8150–8199 | Garden reserve |
| 8200–8249 | Chronicle universe and event records |
| 8250–8299 | personal bests and annotations |
| 8300–8349 | loadout schema, code metadata, Beacon names |
| 8350–8399 | Chronicle/loadout reserve |
| 8400–8499 | Atlas route/configuration core |
| 8500–8599 | environmental laws |
| 8600–8699 | economic laws |
| 8700–8799 | interaction laws |
| 8800–8899 | narrative fragments and mastery constraints |
| 8900–8999 | Convergences and Atlas reserve |

## 4. Removed-ID mapping policy

Every removed or replaced persisted ID gets a scoped migration entry before the content
registry stops recognizing it. The migration record includes the old composite ID, new
target or tombstone, introduced save version, combination rule, and a fixture.

Allowed mappings are:

- **rename:** one old ID becomes one new ID with identical state;
- **merge:** multiple old IDs become one new ID using an explicit sum, max, union, or
  precedence rule;
- **split:** one old ID becomes several new IDs with explicit amounts/defaults;
- **tombstone:** active behavior disappears but a completion/history marker remains;
- **refund:** a removed purchase converts to an explicitly named currency at a fixed,
  tested rate.

Silent deletion and positional remapping are forbidden. A removed ID is never assigned to
new content. Unknown IDs that have no registered migration are excluded from active state
after migration and reported to diagnostics; they do not become arbitrary replacement
content. Migration functions must be idempotent so recovery and import cannot duplicate a
refund, Beacon, Archive record, or Chronicle event.

## 5. Chosen big-number representation

F0 approves a dependency-free, normalized base-10 scientific value for economy amounts:

```ts
interface EconomyAmount {
  readonly mantissa: number
  readonly exponent: number
}
```

The invariants are:

- zero is exactly `{ mantissa: 0, exponent: 0 }`;
- a positive nonzero value has `1 <= mantissa < 10`;
- the mantissa is finite and rounded to at most fifteen significant decimal digits;
- the exponent is a signed 32-bit integer;
- saved economy amounts are nonnegative; negative deltas are represented as operations,
  not negative balances;
- no instance may contain `NaN`, infinity, negative zero, a fractional exponent, or an
  unnormalized mantissa.

The representation extends magnitude rather than promising arbitrary decimal precision.
Fifteen significant digits preserve the useful precision of the current economy while
making exponent growth explicit and bounded. NUM-001 must benchmark and test this choice
against alternatives. A different representation requires a contract-change proposal;
it is not a worker-local substitution.

### 5.1 JSON wire format

Economy amounts serialize as canonical JSON strings:

```text
"0"
"1e0"
"1.25e6"
"9.99999999999999e2147483647"
"1e-12"
```

Rules:

- use lowercase `e`;
- never write a leading plus sign;
- never write exponent leading zeroes;
- never write a decimal point for an integer mantissa;
- never write trailing fractional zeroes;
- write at most fourteen fractional digits (fifteen significant digits total);
- reject exponents outside the signed 32-bit range.

The canonical lexical shape is
`^(?:0|[1-9](?:\.[0-9]{1,14})?e(?:0|-?[1-9][0-9]*))$`, followed by numeric
normalization checks. `ContentAmount` may accept a broader TypeScript template for author
convenience, but pack/save validators enforce this canonical form.

JSON never contains the runtime `{ mantissa, exponent }` object, `Infinity`, `NaN`, or a
bare number for a v13 economy field. Invalid required amount strings invalidate that save
candidate so recovery can try a backup; imports reject them. They are not silently changed
to zero.

### 5.2 Atomic migration boundary

Version 13 converts the entire economy pipeline in one numeric migration. It is not a
formatting threshold applied only after a value becomes large. Mixed raw-number and
`EconomyAmount` arithmetic is forbidden after the v13 gate.

The migrated save fields include every active and parked equivalent of:

- World, Epoch, Deep, and Between currency balances and lifetime totals;
- run, era, all-time, offline, and stored-production earnings;
- best/largest award values and automatic prestige gain thresholds;
- temporary trial snapshot balances and totals;
- universe-law numeric state that represents a balance, stored production, or cost.

Generator ownership counts, reset counts, clicks, ranks, timestamps, durations, indexes,
probabilities, finite multipliers, volume, and visual/audio settings remain JavaScript
numbers with explicit integer/range validation. Declarative content costs/rates enter the
numeric helper at the content boundary; current finite number literals remain valid input,
while future large constants use canonical strings.

All addition, subtraction, multiplication, division, powers, comparisons, sums, and
formatting of migrated fields go through the numeric module. Converting an amount back to
a JavaScript number is allowed only for a proven bounded UI/layout parameter, never for a
saved balance or production calculation.

An operation that would leave the normalized range fails without committing state and
produces a diagnostic. It never clamps to infinity. Simulators must treat any invalid
amount, stalled comparison, or exponent overflow as a failing profile.

## 6. Rollback strategy

F0 leaves every v12 save byte-compatible. The v13 implementation must:

1. validate the v12 candidate completely;
2. copy its original raw JSON once to `ember.save.rollback.v12` before overwriting the
   primary key;
3. migrate in memory and validate every normalized amount;
4. write v13 only after the whole snapshot succeeds;
5. leave the v12 primary and rollback snapshot untouched if any step fails;
6. show a concise recovery/export notice after a successful first migration.

There is no lossy automatic v13-to-v12 down-conversion. A rollback build restores the
dedicated raw snapshot and may lose only progress made after the migration; it does not
guess at values the v12 client cannot represent. Rolling backups created after migration
remain v13. The dedicated v12 rollback key is not rotated with them.

Numeric-core, v13 migration, and presentation refactors land as separate reviewable
commits. A failed numeric rollout reverts the v13 writer/reader commits without mixing in
renderer or broad UI changes.

## 7. Fixture and verification strategy

Permanent migration fixtures must cover:

- minimal and progressed saves from every historical version;
- v11 and v12 preference preservation;
- active and parked Emberlight/Tidefall runs, including independent local IDs;
- temporary trial return snapshots;
- every reset scope and retained collection;
- zero, one, fractional scientific values, fifteen-digit mantissas, large positive and
  negative exponents, and signed-32-bit exponent edges;
- malformed strings, noncanonical strings, `NaN`/infinity legacy inputs, negative
  balances, future versions, and unknown IDs;
- each U3–U7 first-visit/parked-run migration as its reserved version lands;
- rename, merge, split, tombstone, and refund ID mappings before any such mapping ships;
- Chronicle/loadout validation, Garden closure state, Atlas seed/config replay, and
  Convergence permanence at v20–v22.

Required properties:

- migration is idempotent at the current version;
- serialize → parse → serialize yields the same canonical JSON amount strings;
- active and parked worlds do not exchange local balances or IDs;
- a failed primary candidate can recover from the newest valid backup;
- no valid old fixture loses a known ID without its approved mapping;
- multi-year projections never produce an invalid amount.

Run `npm run verify` after each accepted migration commit. Run `npm run sim` for numeric,
economy, offline, routing, Atlas, or long-horizon changes. The v13 gate additionally
requires boundary/property tests and a recorded comparison of bundle cost, arithmetic
throughput, serialization size, formatting, rollback, and migration risk.

## 8. F1 numeric stopping points

NUM-001 begins as a proposal/spike from the F0 gate SHA. It may add isolated benchmarks
and test fixtures, but it may not change live save representation. Its handoff must compare
the approved scientific pair with credible alternatives and either validate it or submit
the exact contract diff required to replace it.

After Agent 00 approval, the implementation proceeds in this order:

1. pure normalized numeric module and tests;
2. declarative content conversion helpers and formatters;
3. v13 sanitizer/migration plus dedicated rollback snapshot;
4. compute and simulator migration;
5. save/app wiring and old-fixture verification;
6. formula inspection consumers.

The numeric lane stops after its assigned sub-wave and handoff. It does not combine the
migration with renderer, purchase ceremony, Goal Lens, or accessibility refactors.
