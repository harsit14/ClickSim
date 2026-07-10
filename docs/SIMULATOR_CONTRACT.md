# SIM-001 — deterministic multi-profile simulator contract

Status: **F1a pure contract proposal; no simulator replacement or balance claim**

Behavior/save impact: none. `balance/simulator-contract.ts` neither imports nor changes `balance/simulate.ts`, live compute, save code, universe content, or package scripts.

## Decision

Adopt `multi-profile-simulator-v1` as the input/output boundary for the F1b headless simulator. The contract expands FUTURE.md Section 8.6 into a deterministic 168-case minimum matrix:

```text
7 universes × 6 activity profiles × 2 visit states × 2 Archive states = 168 cases
```

The seven IDs include current worlds and F0 type-fixture worlds. F1a creates cases for all seven but does not invent future economy content or claim that unimplemented packs can already run.

## Required profile matrix

| Contract ID | Section 8.6 requirement | Deterministic definition |
|---|---|---|
| `zero-skill-idle-offline` | zero-skill idle/offline | zero clicks, no mechanic opportunities, first-affordable purchases, no rhythm reward |
| `casual-one-click-per-second` | casual one-click-per-second | one click/s, 25% mechanic use, greedy payback |
| `active-six-clicks-per-second` | active six-click-per-second | six clicks/s, 50% mechanic use, greedy payback |
| `competent-universe-mechanic` | competent universe mechanic use | two clicks/s, 80% explicit mechanic use, greedy payback |
| `highly-optimized-build` | highly optimized build | four clicks/s, full mechanic use, deterministic lookahead strategy |
| `reduced-rhythm-accessibility` | reduced-rhythm accessibility mode | one click/s, 80% mechanic use, averaged rhythm rewards, assistive input eligible |

Click rates for the mechanic-focused profiles are versioned contract inputs, not assertions that every universe's skilled play is primarily clicking. F1b may change them only by advancing the simulator contract and rebaselining evidence.

Every profile crosses these four explicit progression states:

- first visit, no Archive;
- first visit, complete Archive;
- Beacon-accelerated revisit, no Archive;
- Beacon-accelerated revisit, complete Archive.

Flags for Beacon acceleration and Archive effects are carried directly. A simulator must not infer either from a content ID, generator named `beacon`, or the presence of an arbitrary record.

## Deterministic input contract

Each `SimulatorCase` contains:

- stable case ID: universe/profile/visit/Archive;
- frozen profile and progression state;
- complete `SimulatorContractConfig`;
- unsigned 32-bit case seed derived from base seed and case identity.

The default configuration fixes:

- numeric mode `normalized-scientific-pair-v1`;
- RNG algorithm `indexed-mix32-v1`;
- base seed `0x454d4245`;
- five-year horizon;
- one-minute step;
- ten-minute established-world stall threshold;
- 1.25 dominance lead ratio;
- milestone targets through `1e309`, deliberately beyond native JavaScript range.

`simulatorRandomSample(seed, sampleIndex)` is order-independent. Event streams must assign stable sample indexes from simulation configuration, not from incidental UI or iteration order. The engine receives elapsed time, step, and samples explicitly; it may not read `Date.now()`, `performance.now()`, `Math.random()`, storage, Svelte, DOM, audio, or Canvas.

Changing seed, step, horizon, milestone set, purchase strategy, averaged-rhythm policy, content version, or law configuration creates a different recorded configuration. Results are comparable only when those values match.

## Required output contract

One `SimulationCaseResult` reports all of the following in JSON-safe data:

| Output | Required meaning |
|---|---|
| `milestones` | Every configured target exactly once, with deterministic reached time or `null` |
| `purchaseGaps` | Purchase count, longest gap, 95th percentile gap, and gaps above the configured threshold |
| `rateComposition` | Canonical amount and share for passive, click, universe mechanic, Omen, Archive, and cross-world sources; shares sum to one |
| `resetRecovery` | Both Epoch Turn and Deep Collapse prior-frontier rate, recovery time/duration, and horizon ratio |
| `buildDominance` | At least four first-class doctrine candidates, leader/runner-up, lead ratio, viability, and a cross-context dominance flag |
| `numericHealth` | Explicit exponent overflow, non-finite value, invalid canonical amount, stalled comparison, last valid amount, and diagnostics |
| `stalls` | Start/end/duration and classified reason for every detected stalled state |

Economy values use canonical strings. Times, proportions, counts, multipliers, and ratios remain finite JavaScript numbers with range checks. A case with exponent overflow, non-finite data, invalid strings, or a stalled numeric comparison must set `numericHealth.passed` to false and provide a diagnostic. It must not clamp to infinity, replace an invalid value with zero, or silently omit the case.

Ordinary design stalls are reported separately from numeric comparison failure. An unreachable milestone is represented by `null`; it is evidence for balance review, not malformed data.

## Dominance aggregation

Case-level output compares all local doctrine/build candidates under one profile and progression state. `SimulationSuiteResult` then records cross-profile findings with:

- cases led;
- profile families led;
- minimum lead ratio;
- whether one build dominates idle, active, offline, and accessibility contexts.

The suite should fail balance review when one doctrine dominates every context, while allowing a doctrine to lead the context it is designed for. Dominance thresholds are configuration, never hidden simulator constants. First/revisit and Archive results remain separately inspectable so global acceleration cannot conceal local imbalance.

## Validator behavior

`validateSimulationCaseResult` is pure and checks:

- contract version, case ID, and seed identity;
- complete milestone coverage and canonical targets;
- finite/nonnegative milestone, gap, recovery, score, and stall values;
- complete rate-source coverage and normalized shares;
- both reset boundaries;
- at least four unique build candidates and valid leader references;
- canonical numeric output;
- fail-closed numeric status and required diagnostics.

It returns serializable issues rather than throwing during a suite, allowing every failed case to appear in evidence. Invalid configuration is rejected before cases are created.

## F1b simulator responsibilities

The future implementation must consume this contract without coupling it to Svelte or the current CLI presentation:

1. adapt the pure economy engine to one `SimulatorCase` at a time;
2. supply explicit universe content/law configuration and stable event sample indexes;
3. use the approved numeric abstraction for every balance, rate, cost, award, sum, comparison, and milestone;
4. model first visits and revisits from explicit starting-benefit fixtures;
5. model no-Archive and complete-Archive effects from explicit record fixtures;
6. emit case results, validate them, and aggregate dominance;
7. render a human CLI report from the validated data as a separate concern;
8. preserve a machine-readable configuration and result artifact for gate comparison.

Online, offline, accessibility, and revisit paths must call the same economic rules. Profiles may choose different explicit inputs, but may not receive hidden multipliers from the simulator.

## Acceptance thresholds to evaluate

This contract records measurements; it does not silently encode all design judgments. F1b/F2 balance evidence should evaluate:

- active play approximately 1.5–2.5× a strong idle build over a long window;
- low-attention open play approximately 1.1–1.4× offline;
- averaged rhythm within 10–15% of competent ordinary rhythm, below exceptional execution;
- new-world common layers three to five times faster on a Beacon-accelerated revisit;
- no established active wall over ten minutes when no other meaningful opportunity exists;
- materially faster reset recovery;
- no doctrine dominating active, idle, offline, challenge, and accessibility play together;
- no invalid amount, exponent overflow, non-finite output, or stalled numeric comparison at five years.

Challenge and Atlas-route dimensions are deliberately not fabricated in F1a. When their frozen configurations exist, add them as explicit axes or separate suites without weakening the 168 base cases.

## Current evidence and limitations

`tests/simulator-contract.test.ts` proves:

- the complete 168-case matrix and stable unique case IDs/seeds;
- explicit first/revisit and no/complete Archive states;
- averaged accessibility rhythm configuration;
- repeatable indexed samples in `[0, 1)`;
- JSON round-trip of all required output families;
- valid-result acceptance;
- fail-closed overflow, malformed amount, stalled comparison, missing diagnostic, and invalid config behavior.

No current economy was retuned, no current simulator output was reinterpreted as a future-world result, and no save fixture changed. `npm run sim` remains the Phase 5 simulator and must continue to pass until F1b explicitly replaces or adapts it.

## Migration impact and stopping point

There is no serialized state and no migration impact in SIM-001. Seeds and configurations become save data only in the reserved Atlas version 22 contract; this F1a simulator evidence does not authorize that schema.

Stop here. Agent 00 should review the profile constants, five-year default horizon, indexed RNG choice, output schema, and numeric failure policy. Only after approval should F1b wire the engine, migrate the current simulator, add universe fixtures, or change `npm run sim` output.
