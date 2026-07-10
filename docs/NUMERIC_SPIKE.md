# NUM-001 — normalized scientific-pair spike

Status: **F1a proposal validated; no live migration authorized**

Base contract: `docs/SAVE_COMPATIBILITY.md` at F0 gate `ced11d733db24cbe8431e48e09d13a18b77ed346`

Behavior/save impact: none. The spike is not imported by the game, does not read or write a save, and does not consume save version 13.

## Recommendation

Keep the F0-approved runtime pair and canonical scientific-string wire format unchanged:

```ts
interface EconomyAmount {
  readonly mantissa: number
  readonly exponent: number
}
```

The boundary tests validate the stated invariants, including zero, fifteen significant digits, signed-32-bit exponent edges, fail-closed malformed input, representative v12 values, arithmetic beyond `Number.MAX_VALUE`, and exponent overflow. The choice has the best compatibility and rollback properties for the existing number-based economy, provided F1b separates trusted arithmetic from boundary validation and benchmarks the complete engine before wiring saves.

**Contract-change proposal: none.** Old contract and proposed contract are identical. There is no save-version, reset-preview, JSON, or rollback diff to approve in F1a.

## Representation comparison

The alternatives are credible but solve different problems. `big.js` offers arbitrary-precision decimal arithmetic in a 6 KB minified, dependency-free package and stores coefficient/exponent/sign. `decimal.js` is broader, configurable by significant-digit precision, and treats `NaN`/infinity as representable values that EMBER would still need to reject. `break_infinity.js` is explicitly designed for incremental games and prioritizes speed over accuracy at magnitudes beyond native numbers. Native `BigInt` provides arbitrary-size integers but cannot mix directly with `number` arithmetic or serialize through `JSON.stringify` without an explicit adapter. These statements come from the projects' own documentation: [big.js](https://github.com/MikeMcl/big.js), [decimal.js](https://github.com/MikeMcl/decimal.js), [break_infinity.js](https://github.com/Patashu/break_infinity.js), and [MDN BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt).

| Criterion | F0 normalized pair | `big.js` / `decimal.js` | `break_infinity.js` | custom `BigInt` coefficient + exponent |
|---|---|---|---|---|
| Existing compatibility | Direct, deliberate reduction of current finite numbers to fifteen significant digits | Constructor/string adapter at every current boundary; precision policy must be globally configured | Similar scientific arithmetic, but library semantics and accepted forms would need an EMBER adapter | Full custom conversion and normalization; cannot mix with current number formulas |
| Magnitude | Signed-32-bit base-10 exponent | Large decimal exponents; more precision than the design requires | Far beyond native range and explicitly aimed at incrementals | Custom exponent can match F0; coefficient length/precision must be bounded manually |
| Bundle cost | Zero production cost in F1a because the spike is not imported; F1b adds only local helpers and no third-party payload | `big.js` documents 6 KB minified; `decimal.js` documents that it is significantly larger than `big.js` | Non-zero third-party module; exact tree-shaken cost was not measured because dependencies may not be installed in this ticket | No dependency, but serializer, rounding, power, formatting, and test code become owned maintenance cost |
| Performance | Constant-size number fields and O(1) magnitude comparison; validation-heavy spike measured about 1.53 million primitive arithmetic operations/s | Arbitrary-precision work grows with digit count; precision exceeds EMBER's fifteen-digit requirement | Upstream publishes higher throughput than `decimal.js` and explicitly trades accuracy for speed | Fixed fifteen-digit coefficient was fast in the local micro-benchmark, but division, powers, formatting, and exponent normalization remain custom |
| JSON form | Exact frozen strings such as `"1.25e6"`; runtime object never crosses JSON | Library default strings are not automatically EMBER-canonical; adapter still required | `toJSON` exists, but EMBER must still reject all noncanonical accepted forms and exponent overflow | Native BigInt JSON throws by default; a field-aware string adapter is mandatory |
| Formatting | Mantissa/exponent directly support scientific, engineering, and logarithmic notation | Rich built-in formatting, but outputs must be re-canonicalized for saves | Rich incremental-game methods; UI notation still needs separation from save form | Every notation and rounding behavior is custom |
| Arithmetic ergonomics | Explicit helpers (`add`, `multiply`, `compare`) prevent mixed raw-number use; small API surface | Mature immutable/chained arithmetic APIs | Mature incremental-game arithmetic API | Operators work only on coefficient integers; scale/exponent alignment and fractional powers require helpers |
| Rollback | Perfect fit with the F0 raw-v12 snapshot plan; no library object can leak into JSON | Rollback still works, but a package/config rollback becomes part of the release risk | Same, plus dependency/API version risk | Rollback still works, but more bespoke conversion code must be reverted together |
| Migration risk | Lowest: every valid v12 economy number has a direct fifteen-digit form | Medium: global precision/configuration and permissive parsing are additional failure surfaces | Medium: permissive input/library semantics must be narrowed to F0 | Highest implementation risk despite exact decimal coefficient: custom arithmetic surface is larger |

JavaScript values above `Number.MAX_VALUE` become infinity and lose their value, which is the concrete reason the existing representation cannot support the intended horizon ([MDN `Number.MAX_VALUE`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_VALUE)). The F0 pair removes that magnitude limit without claiming arbitrary decimal precision.

## Local throughput evidence

`src/core/numeric/representation-benchmark-spike.ts` runs equivalent multiply-then-add work near fifteen digits. On the current arm64 development machine with Node v25.9.0, one million iterations produced:

| Representation | Primitive operations | Operations/second | Notes |
|---|---:|---:|---|
| native `number` | 2,000,000 | ~1.37 billion | JIT baseline; cannot survive long-horizon magnitude |
| normalized scientific-pair spike | 2,000,000 | ~1.53 million | Includes invariant checks, `toExponential`, and allocation on every helper call |
| fixed-scale `BigInt` coefficient | 2,000,000 | ~82.8 million | Near-one-scale comparison only; does not implement the required exponent or formatting surface |

This is a micro-benchmark, not a cross-library claim. It intentionally exposes the spike's main performance risk: boundary-grade regex/rounding validation cannot run unchanged inside every economy hot loop. F1b should normalize with a trusted internal fast path, validate at construction/serialization boundaries, and then run full simulator throughput and build-budget measurements. The result does not justify changing the representation; it defines the next performance gate.

Reproduction:

```sh
node --import /path/to/tsx/dist/loader.mjs --input-type=module -e "import('./src/core/numeric/representation-benchmark-spike.ts').then(({runRepresentationBenchmarkSpike}) => console.log(runRepresentationBenchmarkSpike(1000000)))"
```

The upstream `break_infinity.js` README also publishes its own benchmarks against `decimal.js`; those numbers are useful directional evidence but were not copied into EMBER acceptance because hardware, versions, and workloads differ.

## Executable contract findings

The isolated prototype establishes these behaviors:

- zero always becomes `{ mantissa: 0, exponent: 0 }`, including a legacy negative-zero bit pattern;
- positive amounts normalize to `1 <= mantissa < 10` and round once to fifteen significant digits;
- untrusted runtime objects containing negative zero, extra mantissa precision, fractional exponents, `NaN`, infinity, or unnormalized values are rejected rather than repaired;
- parsing accepts only the F0 lexical grammar and then requires serialize/parse identity, which rejects trailing zeroes and other merely parseable variants;
- exponent carry beyond either signed-32-bit boundary reports `exponent-overflow`; it never clamps;
- representative finite v12 balances, including `Number.MIN_VALUE` and `Number.MAX_VALUE`, convert to canonical strings without opening or mutating a save;
- arithmetic demonstration helpers produce normalized pairs beyond native magnitude and reject negative balance results.

The conversion is a precision-preserving migration relative to the approved fifteen-significant-digit contract, not a promise to reconstruct decimal digits that v12 JavaScript numbers had already lost.

## Formula-breakdown proposal

`src/core/numeric/formula-breakdown-prototype.ts` proposes a pure, JSON-safe explanation tree:

- the top level names a stable `formulaId`, universe, subject, explicit evaluation time, root, and exact result;
- a term contains one stable source reference and either a canonical economy amount or a finite scalar with a semantic role;
- an operation names its operator, input nodes, and computed result;
- sources distinguish Heart, Kindling, upgrade, doctrine, Archive, Omen, Epoch, Deep, Between, law, accessibility, and system contributions;
- economy amounts never become bare JSON numbers, while multipliers, probabilities, counts, durations, and ratios remain finite numbers as required by F0;
- node IDs are unique and the top-level result must exactly equal the root result.

Arithmetic remains in pure compute/numeric code. The UI receives this tree and formats it; it does not reconstruct formulas, infer sources from IDs, or recalculate production. F1b may rename the `Prototype` types only when the numeric module and formula producers are approved together.

## v13 migration and rollback impact

There is no migration in this branch. A later authorized F1b implementation must preserve the existing F0 sequence exactly:

1. validate the complete v12 candidate;
2. copy its untouched raw JSON to `ember.save.rollback.v12` once;
3. convert all economy fields in memory, using the approved field inventory;
4. validate canonical strings and normalized runtime values;
5. write version 13 only after the complete snapshot succeeds;
6. leave the v12 primary and rollback data untouched on any failure.

No lossy v13-to-v12 conversion is proposed. The dedicated raw snapshot remains the rollback boundary.

## F1b acceptance and stopping point

Proceed only after Agent 00 approves the F1a contracts. The numeric implementation should stop again after:

- trusted and checked arithmetic paths are separately benchmarked;
- standard/scientific/engineering/logarithmic formatters are tested without entering save JSON;
- every migrated active, parked, trial, offline, and law-state field has a named fixture;
- the atomic writer and raw rollback snapshot pass crash/recovery tests;
- multi-year simulator profiles report no invalid amount, exponent overflow, or stalled comparison.

Do not combine that work with Goal Lens, presentation, renderer, audio, or universe content.
