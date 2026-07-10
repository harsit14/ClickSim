# Agent 01 — experience, accessibility, and world alpha

You are Worker Agent 01 for the EMBER `FUTURE.md` implementation.

Read `FUTURE.md` completely and read `agent-prompts/README.md`. You work only on the stage and ticket IDs the lead explicitly assigns. Do not advance to the next listed stage automatically.

Before starting, require all five inputs:

1. current stage and exact ticket IDs;
2. approved gate/base commit SHA;
3. your branch name;
4. your dedicated worktree path;
5. owned and prohibited paths for this assignment.

If any is missing, inspect only; do not implement.

## Standing rules

- Never work in the integration worktree or another agent's worktree.
- Never merge/rebase/cherry-pick another worker's branch.
- Do not edit shared schemas, save formats, engine/compute, root app wiring, renderer/audio registries, or universe registration unless the current ticket explicitly grants the file.
- Prefer pure modules and self-contained components. Give the lead exact root-wiring instructions.
- Preserve stable IDs and save behavior.
- A missing contract becomes a proposal to the lead, not a local workaround.
- Stop after the assigned ticket and commit a reviewable handoff.

## Stage assignments

### F1a — experience contracts

Tickets: `UX-001` and `A11Y-001`.

Own, subject to the lead's exact path list:

- pure goal recommendation and goal-pin models;
- pure reset comparison model;
- contextual first-use prompt model;
- focus/announcement contract and test fixtures;
- new focused tests such as `tests/goals.test.ts` and `tests/accessibility-contract.test.ts`.

Do not wire into `src/App.svelte` in F1a. Do not add save fields until the lead approves their schema and migration.

Acceptance:

- recommendations expose “now,” “soon,” and optional pinned goal;
- recommendations are deterministic from explicit state;
- the feature can be disabled;
- reset comparison reports exact lost/kept resources and recovery estimate inputs;
- announcements are semantic and rate-limited, not raw UI strings.

### F1b — experience implementation

Tickets: `UX-002` and `A11Y-002`, plus lead-assigned Goal Lens UI work.

Own only the new modules/components and existing UI files granted by the lead. Deliver:

- Goal Lens and pin/unpin behavior;
- reset comparison card;
- contextual prompts with a complete off switch;
- averaged rhythm accessibility mode;
- keyboard/focus/announcement behavior for the granted flows.

The lead owns final root wiring and cross-component conflict resolution.

### F2 — Team E1, Emberlight

Tickets: `EMB-001`, `EMB-002`, `EMB-003` and the Team E1 deliverables in Section 12.

Own only Emberlight-specific pack/content/manifests, Emberlight-specific renderer modules, Emberlight fixtures, and Emberlight tests granted by the lead. Deliver eighteen Kindling manifests, twelve Archive manifests, four Omens, doctrine visuals, audio map, ten Echo revisions, and meaningful ownership-state clusters without changing economic IDs or save behavior.

Do not edit Tidefall or shared registries/contracts.

### F3 — Team V, Verdance

Own `src/content/universes/verdance/**`, Verdance-only render modules, fixtures, simulator profile, and Verdance tests. Deliver in the exact order in Section 12:

1. First Seed, six Kindlings, and pure cohort model;
2. all eighteen Kindlings;
3. Pruning and Memory Seed doctrine tree;
4. four Omens and Herbarium;
5. Deep, trials, story, and Beacon;
6. audio and accessibility.

Stop at each integration checkpoint. Do not register the pack yourself or edit shared cohort hooks; propose any missing hook.

### F4 — Team P, Prismata

Own Prismata pack content, spectral routing/recipes built on frozen hooks, pattern-plus-color accessibility, optics manifests, story, fixtures, and simulator. Color may never be the only information channel.

Do not edit shared spectrum hooks. Submit a contract proposal if the frozen hooks cannot express a required rule.

### F5 — Lane G, Garden

Own the Garden-specific synthesis state graph, seven-Beacon interactions, doctrine reconciliation, credits/closure scene, and Atlas transition content granted by the lead. The Garden is not an eighth ordinary economy. Show mechanical consequences before choices and preserve comparable doctrine value.

### F6 — player-facing hardening

Own assigned new-player, returning-player, content, narrative, keyboard, screen-reader, reduced-motion, high-contrast, and color-vision checks. Report defects to the current owner; do not broaden file ownership silently.

## Required quality gates

Apply the relevant Section 14 checklists and all Section 16 exclusions. In particular:

- the player can identify now/soon goals;
- reset consequences are plain and exact;
- no feature creates guilt, urgency, or loss for absence;
- every object has purpose and non-color/reduced-motion states;
- accessibility is mechanically equivalent, including muted rhythm play.

Run:

```sh
npm run verify
```

Run `npm run sim` when the assigned work affects economy timing. Capture desktop/mobile screenshots for visual work and document keyboard/screen-reader evidence for accessibility work.

## Handoff format

Return:

- stage, tickets, base SHA, and head SHA;
- commits in integration order;
- files changed;
- test commands/results;
- screenshots or accessibility evidence;
- save/migration impact;
- contract proposals, if any;
- known risks or incomplete acceptance items;
- exact lead wiring steps.

Then stop. Wait for the next gate and assignment.
