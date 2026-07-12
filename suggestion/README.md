# Suggestion — Reference Implementation of the Kailash Depth Design

This folder is a **working reference**, not shipping code. It implements step 1
of `LOKA_DEPTH_PLAN.md` (§5 — Kailash weather fronts, the Long Rest, and the
Inhabited Descent) so the implementing agent can see the intended shapes,
bounds, and idioms in runnable form. Nothing in `src/` imports this folder;
`npm run verify`, the build, and the test glob never touch it.

## Files

| File | What it demonstrates |
|---|---|
| `kailash/fronts.ts` | The weather-front state machine, composition predicates, Descent Trace accrual, the Long Rest, and the bounded law-factor combiner. Written in the exact style of `src/content/universes/f4-runtime.ts` (numeric law state, `readNumber`/`writeNumber`, pure status functions). |
| `kailash/descent.ts` | The world-accumulation planners in the style of `src/render/verdance/world-layer.ts`: descent stations from traces, valley staging from ownership thresholds, ash bands from Releases, and the front weather render plan. |
| `kailash/fronts.test.ts` | The behaviors that matter: timeline determinism, **idle neutrality** (never editing ⇒ ×1 factor, zero traces), trace earning, the multiplier ceiling, Long Rest banking/decay, offline settling, and the summit-clearance / bounded-cap render rules. |

## Verify this folder standalone

```sh
npx tsc -p suggestion --noEmit
node --import tsx --test suggestion/kailash/*.test.ts
```

## Design decisions worth keeping (the "why", in priority order)

1. **Answered = predicate AND a deliberate edit.** A front only counts as
   answered if its composition predicate holds *and* the player touched the
   cycle since the front was announced (`markKailashCycleEdited`). Without the
   edit requirement, default cycle presets accidentally satisfy some
   predicates and idle players would drift off the ±5% pacing budget. This is
   the mechanism that guarantees LOKA_DEPTH_PLAN §8's idle-neutrality
   acceptance criterion — do not drop it.
2. **One bounded combiner.** All three new factors (front answer, carry
   window, grace bonus) meet in exactly one place,
   `combineKailashLawFactors`, which clamps to ×1.8 so the realm's total law
   multiplier stays under the ×5.0 budget. New bonuses must go through it.
3. **Fronts never punish.** Unanswered fronts clear silently; there is no
   damage, no decay, no missed-window penalty. The mountain is patient.
4. **Offline settles, never replays.** Gaps longer than two front cycles fold
   to a fresh calm phase with zero queued announcements. A returning player
   must never face a backlog.
5. **Deterministic rotation, no RNG.** Fronts rotate in fixed order. If the
   integrated version wants variety, use the realm's seeded rng — never
   `Math.random()` in law state.
6. **Traces are Chronicle data, not law state.** `advanceKailashFronts`
   *returns* `tracesEarned`; the caller persists the lifetime counter next to
   the realm's other lifetime stats so it survives Release. Law-state keys
   (`u7-front-*`, `u7-long-rest`, `u7-grace-*`) are all deliberately
   epoch-resettable — `retainedF4LawConfiguration` needs **no change**.
7. **The summit stays empty.** Every descent station sits at or below
   `SUMMIT_CLEARANCE_Y_PERCENT`; accumulation builds downward and outward
   only. The test suite enforces this — keep that test.
8. **No silent caps.** The descent renders at most 18 stations, but the plan
   reports `unrenderedTraces` so the UI can say "…and N more, kept along the
   way" instead of pretending the cap is the total.
9. **Cultural guardrails are inherited, not re-argued.** Fire season is a far
   ridge boundary whose only mechanical face is "shelter beside release";
   weather copy names no sacred presence; all copy joins the existing
   consultant review queue per `TRIMURTI_REFRAME.md`.

## Integration map (where each piece actually lands)

- `fronts.ts` state machine → merge into `src/content/universes/f4-runtime.ts`;
  reuse its private `readNumber`/`writeNumber`; extend `advanceF4LawState`
  (canticle currently doesn't tick there) and multiply
  `kailashFrontMultiplier` into `f4RateMultiplier('canticle', …)`.
- `markKailashCycleEdited` → call from `selectCanticleMeasure`,
  `setCanticleSlotRole`, and `cycleCanticleSlot`.
- Front/rest copy, `KAILASH_FRONT_SIGNALS`, and `KAILASH_FRONT_LUMEN` → into
  `KAILASH_SPEC` in `src/content/universes/canticle/index.ts` (signals append
  to `nonColorSignals`; announcements go through the existing per-universe
  announcement policy with dedupe keys).
- `descent.ts` planners → `src/render/canticle/world-layer.ts`, feeding the
  same drawing layer Verdance uses; respect the density governor and the
  heart's central clearing.
- Long Rest entry/exit UI → the Still Point panel; the shelf-completion gate
  and trial/ceremony/consent-flow exclusions live in the caller (see the
  docstring on `enterKailashLongRest`).
- Unlock gates: fronts activate on first purchase of Kindling 9 (Cloud Stair);
  the Long Rest on completing all three Mountain Witness shelves. Gate checks
  belong to the calling system, not the state machine.
- Tests → port to `tests/kailash-fronts.test.ts` unchanged in spirit; then run
  `npm run sim` and compare idle-only pacing (±5% budget).

Brahmalok (Folio Commissions) and Vishnulok (Strains) follow the same
skeleton: a prompt state machine over numeric law state, an answered-by-the-
existing-verb predicate, a returned lifetime counter, a bounded factor through
one combiner, and world planners that turn the counter into authored geometry.
See LOKA_DEPTH_PLAN.md §3–§4 for their specifics.
