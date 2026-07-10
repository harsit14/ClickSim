# EMBER multi-agent runbook

This directory contains the four prompts for implementing `FUTURE.md` with Codex App chats.

## Recommended roster

Use **four chats total**:

1. one lead/integrator chat;
2. three delegated worker chats.

The six F1 lanes in `FUTURE.md` are bounded work lanes, not a requirement for six permanent workers. In the current repository, those lanes still overlap several shared hotspots: `src/App.svelte`, `src/engine/game.svelte.ts`, `src/engine/compute.ts`, `src/core/save-data.ts`, `src/content/universes/types.ts`, `src/render/world.ts`, and the audio/UI entry points. Three reusable workers reduce integration churn and exactly match the three parallel teams in F2, F3, and F4.

Do not add more workers until F0 has produced modular, frozen contracts and a later stage has at least four genuinely disjoint tickets ready. F5 has four lanes, but Endless Balance should follow the first Atlas integration, so it does not justify another permanent chat.

## Repository readiness at the time of this plan

F0 is not complete yet:

- the code has `UniversePack`, not `UniversePackV2`;
- only Emberlight and Tidefall are registered;
- there are no seven type-only universe fixtures;
- object, audio, physics, and accessibility contracts are not frozen;
- saves are at version 12 with no recorded U3-U7/Atlas ID ranges;
- numbers are plain JavaScript `number` values;
- Goal Lens, semantic feedback events, formula inspection, and averaged rhythm mode do not exist.

The current code is a useful foundation, but no new-universe content agent should begin before the F0 gate.

## Worktrees and branches

Every concurrent writer must use a separate Git worktree and branch. A branch alone is not isolation: two Codex chats using the same directory can overwrite one another's files and Git index.

Keep one clean integration worktree on `codex/future-integration`. At the time this runbook was created, `main` had uncommitted UI/progression work. Preserve and intentionally commit that work before choosing the baseline; do not automatically stash, discard, or overwrite it.

After F0 is approved, record its commit as `F0_GATE_SHA` and create worker worktrees from that exact commit. Example pattern:

```sh
git worktree add ../ClickSim-agent-01 -b codex/f1-experience F0_GATE_SHA
git worktree add ../ClickSim-agent-02 -b codex/f1-presentation F0_GATE_SHA
git worktree add ../ClickSim-agent-03 -b codex/f1-systems F0_GATE_SHA
```

For each later stage, create fresh stage branches from the latest approved gate commit. Do not carry long-diverged F1 branches into F2 or later.

Only the lead/integrator may:

- merge or cherry-pick worker commits;
- resolve cross-lane conflicts;
- update a worker branch from the integration branch;
- approve a shared-contract change;
- declare an integration gate complete.

Workers never merge one another's branches and never advance to the next stage without an explicit assignment.

## Execution order

### Baseline preparation

1. Preserve and review the current dirty worktree.
2. Commit the intended Phase 5 state on the integration branch.
3. Run `npm run verify`.
4. Record the clean baseline commit.

### F0 — lead only, sequential

1. F0.1: canonical vocabulary and reset/progression boundaries.
2. F0.2: `UniversePackV2`, object, physics, audio, and accessibility contracts plus seven type-only fixtures.
3. F0.3: save ranges, migration policy, and big-number decision record.
4. Run `npm run verify`, review the documents and fixtures, then record `F0_GATE_SHA`.

No worker implements F1 or universe content before this gate.

### F1 — three parallel workers, two sub-waves

Sub-wave F1a starts from `F0_GATE_SHA`:

| Worker | Work |
|---|---|
| Agent 01 | `UX-001`, `A11Y-001`, pure Goal Lens and accessibility contracts |
| Agent 02 | `VIS-001`, `FEEL-001`, `AUDIO-001`, presentation contracts and registries |
| Agent 03 | `NUM-001`, `SIM-001`, numeric/migration proposal and simulator contract |

Integrate and approve the contracts before F1b. Prefer the dependency order: visual/numeric/accessibility/audio contracts, semantic feedback events, then their consumers.

Sub-wave F1b uses fresh branches or lead-approved rebases from the F1a integration commit:

| Worker | Work |
|---|---|
| Agent 01 | `UX-002`, `A11Y-002`, Goal Lens UI, reset comparison, contextual prompts, rhythm equivalence |
| Agent 02 | `FEEL-002`, manifest renderer, purchase ceremony, audio implementation |
| Agent 03 | approved numeric migration, serialization, formula inspector, simulator profiles |

The lead performs shared wiring and ports Emberlight to the frozen contracts. F1 ends only when Emberlight runs on those contracts and `npm run verify` passes.

### F2 — three-way parallel split

| Agent | Assignment |
|---|---|
| Agent 01 | Team E1: Emberlight coherence (`EMB-001` through `EMB-003`) |
| Agent 02 | Team T1: Tidefall coherence (`TIDE-001` through `TIDE-003`) |
| Agent 03 | Team Q1: comparative visual/audio/accessibility QA |

The QA agent reports defects to the owning content agent and does not silently edit either pack.

### F3 — three-way parallel split

| Agent | Assignment |
|---|---|
| Agent 01 | Team V: Verdance vertical slice |
| Agent 02 | Team C: Clockwork vertical slice |
| Agent 03 | Team S3: crossing, simulator, mobile, save, and performance QA |

Integrate at three checkpoints: six-Kindling/pure-engine slice, complete economy/content, then story/audio/accessibility/Beacon.

### F4 — three-way parallel split

| Agent | Assignment |
|---|---|
| Agent 01 | Team P: Prismata |
| Agent 02 | Team W: Tempest |
| Agent 03 | Team K: Canticle |

Pack agents may propose a shared hook change but may not edit the frozen hook contract directly.

### F5 — three parallel lanes, then balance

| Agent | Assignment |
|---|---|
| Agent 01 | Lane G: Garden |
| Agent 02 | Lane A5: Atlas engine |
| Agent 03 | Lane L5: Chronicle and loadouts |

After Atlas and loadout contracts are integrated, Agent 02 runs Lane B5 Endless Balance. This ordering makes balance consume real law compatibility and route data.

### F6 — hardening

- Agent 01: new-player, returning-player, narrative, content, and accessibility playtests.
- Agent 02: render/mobile performance, object-purpose, audio fatigue, and offline/static-build checks.
- Agent 03: save migration, deterministic simulation, crash/recovery, and long-horizon regression.
- Lead: final integration, release checklist, and acceptance decision.

## Gate rules

At every handoff, the worker must report:

- base and head commit SHAs;
- commits to integrate, in order;
- files changed;
- tests and evidence produced;
- migration/save impact;
- any proposed contract change;
- known risks and unfinished work;
- recommended merge order.

The lead runs `npm run verify` after every accepted merge and `npm run sim` for economy, route, or long-horizon changes. Visual/audio work must include the evidence required by `FUTURE.md`; accessibility is an acceptance constraint, not a cleanup pass.

## Prompt files

- `00-lead-integrator.md`
- `01-experience-and-world-alpha.md`
- `02-presentation-and-world-beta.md`
- `03-systems-qa-and-world-gamma.md`

Give each chat `FUTURE.md`, this runbook, and only its own prompt file. Also tell it the current stage, exact ticket(s), base commit SHA, branch name, and worktree path.
