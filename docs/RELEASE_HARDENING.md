# F6 release hardening record

Status: **technical release candidate complete; Phase 8.5 human sign-off pending**

This record distinguishes automated evidence from checks that can only happen after the
user approves a merge/deployment. Mobile layout work is intentionally deferred by user
direction; the release gate below is desktop-first.

## Automated acceptance evidence

| F6 area | Evidence |
|---|---|
| Desktop performance matrix | Every universe manifest is planned deterministically at 1280×720, 1440×900, 1920×1080, and 2560×1440 in high, balanced/panel-open, and reduced-motion low-quality profiles. Heart clearance, viewport bounds, salience, and attention budgets must remain clean. |
| Save migrations | Every historical version 1–12 migrates idempotently to v23; canonical v13 numeric and v22 F5 saves migrate to v23; corrupt required amounts and future versions fail closed. |
| Keyboard and screen reader | The Legacy dialog compiles with zero Svelte accessibility warnings, receives programmatic focus, uses labeled tabs/dialogs/status regions, and exposes keyboard shortcut L. Existing global keyboard/focus-flow suites remain required. |
| Reduced motion, contrast, and color vision | All seven pack contracts require complete muted, reduced-motion, low-quality, and non-color equivalents. High contrast remains an independent root preference. |
| Translation extraction | The build emits `dist/i18n/en.json` from live content definitions. The current catalog contains at least 2,438 stable keys spanning every universe, Guide, Atlas, Garden, and release shell. |
| Content proofreading | CI rejects control characters, repeated adjacent words, unfinished markers, repeated inline whitespace, and unexpectedly incomplete catalogs. |
| Audio fatigue | Each universe runs a deterministic 30-minute abstract click/Omen stress session. Peak, concurrency, attenuation, and suppression policies must remain within the semantic audio contract. This is policy evidence, not a substitute for subjective listening. |
| Five-hour / fifty-hour / returning-player | Every applicable simulator case must retain valid numbers, usable purchase decisions, and non-stalled comparisons at both horizons; Beacon-accelerated return states are included. |
| Five-year balance | `npm run sim` executes 168 five-year cases, the actual seven-pack compute audit, numeric overflow checks, and the 1,680-case doctrine/Wayfinder/Archive interaction matrix. |
| Offline/static build | Production uses relative asset URLs. A versioned service worker precaches every hashed chunk, stylesheet, `index.html`, and localization catalog. The offline audit fails if any generated release file is absent. |
| Crash and recovery | Tests reject a corrupt primary and future-version candidate, then recover the newest valid historical candidate into v23. Existing atomic v13 rollback and write-failure restoration drills remain required. |
| Object-purpose audit | Every Heart, 126 Kindling manifests, 84 Archive records/objects, and seven Beacons must declare a phenomenon, purpose, silhouette, material, fallbacks, and visible manifest binding. |
| CI/deployment | GitHub Pages build now runs `npm run verify` and `npm run sim` before artifact upload. No unverified build can reach the deploy job. |

## Commands

```bash
npm run verify
npm run sim
```

`npm run verify` includes TypeScript, the complete test suite, content proofreading,
production build, bundle budgets, localization extraction, service-worker generation,
and offline/static inspection.

## Manual evidence and intentional limits

- Desktop in-app Chromium QA covered the three F4 universe screens, their visible Archive
  objects, selectable mechanics, Tempest discharge, Canticle strategic rest, and themed
  reset warning at 1280×720.
- Phase 8.4 expanded the 1280×720 pass to the untouched opening, dense Emberlight,
  Tidefall, Verdance, Clockwork, Prismata, Tempest, Canticle, crossing-ready state, and
  the Garden. The detailed acceptance and anti-ugliness evidence lives in
  `docs/POLISH_AUDIT.md`.
- Mobile composition and mobile real-device profiling are deferred by explicit user
  direction. Existing mobile safety tests remain, but F6 does not claim new mobile design.
- A true deployed-offline navigation drill requires the approved branch to be merged and
  published. The local artifact is ready and structurally verified; no deployment is
  performed before user approval.
- Subjective long-session listening and human five-/fifty-hour play are not fabricated.
  The automated policy/simulator evidence is complete; human sessions remain release
  candidate observation work rather than a code blocker.

## Phase 8.5 sign-off protocol

The pushed rebuild branch is the release candidate. Final ship sign-off requires two
observations that must be performed by a person rather than inferred from accelerated
fixtures:

1. Play one continuous five-hour session from a fresh opening. Record any unexplained
   wall longer than ten minutes, unclear reset preview, goal that cannot be recalled,
   tiring repeated sound, unreadable dense composition, or interaction that feels
   mandatory despite passive progress.
2. Leave that save inactive, then return in a later session. Confirm that Welcome Back,
   the next useful action, the long-term mystery, and the recommended stopping point are
   understandable without reconstructing the previous session from memory.

If neither session produces a release-blocking observation, check Phase 8.5 in
`REBUILD_PLAN.md` and ship the exact verified commit. If an issue is found, record the
universe, save/scenario, viewport, action, expected result, and observed result before
changing the candidate.
