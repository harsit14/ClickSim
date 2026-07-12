# EMBER UI/UX audit plan

## Executive summary

EMBER's core presentation is unusually strong for an incremental game: the Heart is immediately legible, the world visibly accumulates authored objects, each universe has a distinct instrument, the Field Guide is genuinely useful, semantic labels are extensive, and reset flows are deliberately cautious. The largest risks are not a lack of craft but failures at the seams between otherwise good systems. The first-run fiction hides accessibility/help until purchased; late-universe instruments and crossing chrome use text far below a readable desktop floor; persistent explanatory UI can sit above and physically cover major panels; and the dense endgame lets Omens, story, shop, HUD, landmarks, and temporary feedback compete at once. No Blocker was found, but the seven Major findings below violate FUTURE.md or WCAG 2.2 AA and should ship before further content-density work. This was an audit-only pass: no game code was changed.

## Coverage actually completed

Legend: `✓` visually inspected and captured; `◐` interacted with or inspected in the accessibility tree without complete screenshot coverage; `E` captured during the entrance transition as well as steady state; `—` not reached in this pass. Mobile/touch was intentionally excluded.

| State | 1440×900 | 1280×800 | Reduced motion | High contrast | Large text | Muted audio | Vestments |
|---|---:|---:|---:|---:|---:|---:|---|
| Fresh opening; Heart → counter → shop | ✓ | ✓ | — | — | — | — | Default |
| Emberlight camp / early / mid / cosmic / post-Nova | ✓ E | ✓ E | — | — | — | — | Default steady state |
| Dense Emberlight (`Unlock Everything`) | ✓ | ✓ | ◐ | ✓ | ◐ | — | Default, Vellum, Voidglass |
| Tidefall | ✓ E | ✓ E | — | — | — | — | Vellum at 1280; Voidglass at 1440; CSS variables and live screen checked after each selection |
| Verdance + Pruning-ready | ✓ E | ✓ E | — | — | — | — | Vellum at 1280; Voidglass at 1440 |
| Clockwork | ✓ E | ✓ E | — | — | — | — | Vellum at 1280; Voidglass at 1440 |
| Brahmalok | ✓ E | ✓ E | — | — | — | — | Vellum at 1280; Voidglass at 1440 |
| Vishnulok | ✓ E | ✓ E | — | — | — | — | Vellum at 1280; Voidglass at 1440 |
| Kailash | ✓ E | ✓ E | — | — | — | — | Vellum at 1280; Voidglass at 1440 |
| Repeatable markets / dense permanent economies | ✓ | ✓ | — | — | — | — | Default |
| Field Guide, run records, Options, Cabinet, Vessel, Observatory, Deep | ◐ | ✓ | Options only | Options only | Options only | — | Default/Voidglass |
| Story Archive, explicit trial launch/completion, Lumen Vault purchase | — | — | — | — | — | — | Not reached |
| The Question | ◐ | ✓ | — | — | — | — | Default |
| First Beacon + crossing prelude | ◐ | ✓ | — | — | — | — | Default |
| Supernova preview/comparison | ◐ | ✓ | — | — | — | — | Default |
| Deep Collapse ceremony, Remembrance, Clockwork revelation | — | — | — | — | — | — | Not reached |
| Garden | ✓ | ✓ / DOM | — | — | — | — | Garden dialog reached; screenshot capture did not complete |
| Welcome-back | ◐ | — | — | — | — | — | Existing late Brahmalok save only |

Notes:

- The Vellum/Voidglass live pass confirmed that universe accents continue to adapt rather than flattening to one palette. Representative steady-state contrast ratios for `--amber` against the corresponding opaque panel color were 9.75:1 (Tidefall/Vellum), 7.24:1 (Tidefall/Voidglass), 7.01:1 (Verdance/Voidglass), 6.27:1 (Clockwork/Voidglass), 6.87:1 (Brahmalok/Voidglass), 4.89:1 (Vishnulok/Voidglass), and 4.87:1 (Kailash/Voidglass). Those sampled accent pairs pass AA for ordinary text; the failures below come from opacity, size, and stacking rather than the base theme variables.
- Prepared scenarios restore their own saved preferences. Accessibility settings therefore have to be reapplied after every scenario load; early-transition screenshots are marked `E` and were not treated as evidence of steady-state theme contrast.
- Muted audio could not be reliably established through the range controls in this browser pass, so it is explicitly untested rather than inferred.

## Major findings

### UI-001 · Major · The opening hides accessibility and help until they are purchased

- **Where:** `src/App.svelte`, `src/ui/UiChips.svelte`, `src/ui/GameGuide.svelte`; fresh first-run, both desktop viewports, all themes.
- **Screenshot:** `docs/qa/ui-audit/01-opening-heart-1440x900.png`, `docs/qa/ui-audit/21-opening-standard-entrance-transition-1280x800.png`.
- **Player experience:** “I can activate the Ember, but if I need reduced motion, contrast, larger text, save recovery, or basic controls, there is nowhere to go.”
- **Rule violated:** FUTURE.md §4.5 (“The opening mystery must not hide Options, pause, save recovery, or the Field Guide”) and §14.1 (“Options, saves, accessibility, and guide are always reachable”). In `App.svelte`, Guide is gated by `hasUi('counter')` and Options by `hasUi('options')`.
- **Proposed fix:** Add a system-level `OpeningAccessMenu.svelte` reachable from the first frame by `Esc`/`F1` and a restrained corner affordance. It must not expose the purchased Guide or Options panels; it should reuse only the accessibility controls, save recovery/export, controls summary, and “First light” help content from `OptionsPanel.svelte`/`GameGuide.svelte`. When counter/options unlock, route the same affordance to the full purchased panels. Keep the in-world dock and every economy panel locked exactly as today.
- **Acceptance criterion:** On `?scenario=opening`, keyboard and pointer users can reach motion, contrast, text size, audio, recovery, and first-light instructions before touching the Heart; neither the Guide dock icon nor full Options panel appears before its existing unlock.
- **Risk notes:** Do not reveal currency, Kindlings, upgrades, story, future systems, or any requirement before its unlock; do not weaken the one-Heart composition.

### UI-002 · Major · Critical instructions and controls render below WCAG/readability floors

- **Where:** `src/ui/NumberSuffixHint.svelte`, `src/ui/UniverseLawPanel.svelte`, `src/ui/ShopPanel.svelte`; Brahmalok/Vishnulok/Kailash signature instruments and all shops at 1280×800; all tested vestments.
- **Screenshot:** `docs/qa/ui-audit/15-prismata-standard-entrance-transition-1280x800.png`, `docs/qa/ui-audit/17-tempest-standard-entrance-transition-1280x800.png`, `docs/qa/ui-audit/19-canticle-standard-entrance-transition-1280x800.png`.
- **Player experience:** “The game is explaining a new universe, but the labels, steps, route choices, and dismiss buttons are too small to read or reliably click.”
- **Rule violated:** WCAG 2.2 AA 2.5.8 target size and the project’s readable-type heuristic. Measured at 1280×800: number-hint heading 6.72px, dismiss text 6.88px with a 25×7px box; universe primer/status text 5.76–9.12px; instrument toggles 22×22px; shop bulk buttons 20px high. `UniverseLawPanel.svelte` explicitly drops some text to `.25rem`–`.44rem` in its short-height media query.
- **Proposed fix:** In `UniverseLawPanel.svelte`, replace sub-`.6875rem` body/label sizes with `clamp(.6875rem, …, .8rem)`, allow wrapping instead of ellipsis for essential instructions, and give every instrument button `min-inline-size/min-block-size: 1.5rem`. In `NumberSuffixHint.svelte`, raise supporting copy to at least `.6875rem`, make “got it” a 24×24 minimum target, and retain `--panel`, `--amber`, `--gold`, and `--dim`. In `ShopPanel.svelte`, make `.amt` at least 24px high with unchanged selected-state styling.
- **Acceptance criterion:** At both desktop viewports, browser-computed essential text is ≥11px, every non-exempt control is at least 24×24px, and all primer/route text is readable at 100% zoom without truncating meaning.
- **Risk notes:** Do not increase the overall instrument height; recover room by reducing decorative gaps, shortening nonessential eyebrow copy, and collapsing secondary diagrams—not by hiding instructions or state.

### UI-003 · Major · The number-shorthand explainer sits above major panels and covers their close controls

- **Where:** `src/ui/NumberSuffixHint.svelte`, `src/ui/Observatory.svelte`, `src/ui/TheDeep.svelte`, `src/App.svelte`; late Emberlight, 1280×800, default/Vellum.
- **Screenshot:** `docs/qa/ui-audit/63-observatory-1280x800.png`, `docs/qa/ui-audit/64-deep-1280x800.png`.
- **Player experience:** “I opened Observatory/Deep, but a notation tip is sitting on top of the panel header and its close button.”
- **Rule violated:** FUTURE.md §5.5 attention budget and standard visibility/operability heuristics. The hint uses `z-index:18`; Observatory/Deep use `z-index:9`, so the helper wins even while a major panel is active.
- **Proposed fix:** Pass `suppressed={utilityPanelOpen || resetPreviewOpen || cutsceneActive || questionOpen || remembering || crossingPrelude}` to `NumberSuffixHint.svelte` from `App.svelte`. Preserve the pending explanation and show it again after the major surface closes. As a defensive fallback, place helper toasts below modal z-layers using the existing panel hierarchy rather than adding a new visual token.
- **Acceptance criterion:** Opening any utility panel, dialog, reset comparison, or cutscene hides/queues the suffix hint; closing the surface restores it once if still relevant. No modal header or close target is covered at 1280×800 or 1440×900.
- **Risk notes:** Do not permanently discard first-use number education and do not suppress semantic announcements.

### UI-004 · Major · Omens can cross into the shop and intercept a purchase row

- **Where:** `src/ui/FallingStar.svelte`, `src/ui/ShopPanel.svelte`, `src/App.svelte`, and the existing salience-governor/panel-open contract; dense Emberlight endgame, 1280×800.
- **Screenshot:** `docs/qa/ui-audit/05-emberlight-unlock-everything-1280x800.png`.
- **Player experience:** “The `+15m Gift` lands on top of the Hearth row, so the event and the purchase fight for the same click.”
- **Rule violated:** FUTURE.md §5.5 semantic zones and §5.6 density governor; standard error prevention and Fitts’s law. A temporary reward effect must not occupy a persistent purchase target.
- **Proposed fix:** Give `FallingStar.svelte` the live right-rail reserved rectangle whenever `ShopPanel` is expanded; clamp paths and banked-Gift resting positions to the Heart/near-system area. Use the existing `priorityWhilePanelOpen`/salience concepts so Omens dim or reroute when a panel opens, and keep the current `--amber`/universe accent treatment.
- **Acceptance criterion:** With Unlock Everything and the shop open at both viewports, summon/cycle at least 20 Omens: no Omen hitbox or label intersects the shop, dock, Goal Lens, or active major panel, and every Omen remains catchable.
- **Risk notes:** Do not change Omen timing, reward, odds, or accessibility announcement; do not move the event outside normal pointer reach.

### UI-005 · Major · The final reset comparison omits the reward being confirmed

- **Where:** `src/experience/reset-comparison.ts`, `src/experience/reset-comparison-ui.ts`, `src/ui/ResetComparisonCard.svelte`, `src/App.svelte`; Supernova-ready Emberlight, 1280×800 and 1440×900.
- **Screenshot:** `docs/qa/ui-audit/67-supernova-reset-comparison-1280x800.png`.
- **Player experience:** “I can see what resets and how fast I recover, but I no longer see the 1.10T Stardust I am about to gain.”
- **Rule violated:** FUTURE.md §4.4 reset comparison contract and recognition over recall. The pending gain is shown on the Observatory button, then disappears from both confirmation layers; `ResetComparison` has no reward-preview field.
- **Proposed fix:** Extend `ResetComparisonInput`/`ResetComparison` with a structured reward preview (`currency local/canonical names`, glyph, formatted current, formatted gain, formatted after). Surface it in `ResetComparisonCardModel` and the card header/recovery row. Populate it for every Epoch Turn and Deep Collapse from `App.svelte`; use local universe nouns plus canonical function in accessible copy.
- **Acceptance criterion:** The final confirmation for every universe shows exact gain and post-reset total beside the action, and a reviewer can verify the same numeric value on the initiating button and final card. Existing Returns/Remains and recovery estimates remain present.
- **Risk notes:** This is display-only: do not change reward math, rounding rules, reset scope, or save data.

### UI-006 · Major · Crossing and finale progress chrome is sub-AA and unreadably small

- **Where:** `src/ui/CrossingPrelude.svelte`, `src/ui/TheQuestion.svelte`; first crossing and The Question, 1280×800.
- **Screenshot:** `docs/qa/ui-audit/70-crossing-prelude-1280x800.png`, `docs/qa/ui-audit/56-the-question-overlay-1280x800.png`.
- **Player experience:** “I can read the main story line, but I cannot read where I am in the ceremony or what the other steps are.”
- **Rule violated:** WCAG 2.2 AA 1.4.3 and the project’s ~11px readability floor. Crossing phase labels are `.42rem`–`.45rem` (about 6.7–7.2px); incomplete steps use 28% opacity on black (roughly 1.8:1). The Question sequence label is 9.44px at 72% opacity.
- **Proposed fix:** In `CrossingPrelude.svelte`, render phase names at ≥11px, allow two-line wrapping, use `--dim` only at an AA-compliant opacity, and distinguish complete/current/future with shape plus weight/border. In `TheQuestion.svelte`, raise sequence/progress copy to ≥11px and reuse the established `--panel`/`--gold` contrast. Keep the central narrative line and universe-specific crossing hues unchanged.
- **Acceptance criterion:** At both desktop viewports and in all contrast/motion modes, every progress label is ≥11px and ≥4.5:1 over its actual background; current/completed/future states remain distinguishable in grayscale.
- **Risk notes:** Do not accelerate, shorten, spoil, or add controls to the authored ceremony; reduced motion must retain the same phase information.

### UI-007 · Major · Dense endgame exceeds the screen’s attention budget

- **Where:** `src/ui/ManifestWorldLayer.svelte`, `src/ui/EmberlightFlagshipLayer.svelte`, `src/ui/KindledSky.svelte`, `src/ui/LumenTicker.svelte`, `src/ui/ShopPanel.svelte`, `src/ui/FallingStar.svelte`, salience governor; Unlock Everything + all Kindlings/upgrades, both desktop viewports.
- **Screenshot:** `docs/qa/ui-audit/04-emberlight-unlock-everything-1440x900.png`, `docs/qa/ui-audit/05-emberlight-unlock-everything-1280x800.png`.
- **Player experience:** “The Heart, floating gains, Gift, story line, shop, achievement sky, named landmarks, HUD hint, and dock all ask me to look at them at once.”
- **Rule violated:** FUTURE.md §5.5 (one primary target, three secondary objects, two temporary rewards, one subtitle, one major panel) and §5.6 density governor. The 1280 view also clips the lower shop row and places several world labels under the shop edge.
- **Proposed fix:** Make the existing salience governor account for DOM systems as well as manifest objects. When the shop is open or a story subtitle is active: merge repeated stars/Kindlings into infrastructure, hide or dim supporting archive landmarks, cap floating gains to one merged value per Heart beat, reserve the bottom subtitle lane, and suppress nonessential named labels. Use existing salience, `screenZone`, `priorityWhilePanelOpen`, `--panel`, and per-universe grouping metaphors.
- **Acceptance criterion:** In Unlock Everything at both viewports, the screen never exceeds the §5.5 budget; the Heart hit area, full visible shop row, dock, and subtitle lane do not overlap; the same production/state information remains available through shop, records, or accessible summaries.
- **Risk notes:** Do not reduce economy information, object ownership thresholds, archive access, or universe identity; density reduction is visual grouping, not content removal.

## Minor findings

### UI-008 · Minor · Upgrade tiles require hover/recall instead of recognition

- **Where:** upgrade bar rendered in `src/App.svelte`/upgrade UI; Emberlight midgame and dense endgame, both viewports.
- **Screenshot:** `docs/qa/ui-audit/55-ember-midgame-standard-settled-1280x800.png`.
- **Player experience:** “I see a row of repeated glyph tiles, but I have to inspect each one to remember which upgrade it is or why I can buy it.”
- **Rule violated:** Recognition over recall and FUTURE.md §5.4’s requirement that a purchase communicates what changes.
- **Proposed fix:** Preserve compact glyphs but add a persistent short category cue (Touch, Spark, Wisp, Global) and an affordability/proposed-delta line in the existing tooltip/focus card; ensure keyboard focus opens the same information. Reuse `--amber`, `--gold`, and `--panel`.
- **Acceptance criterion:** A player can identify each visible upgrade’s target and effect without memorizing its glyph; hover and keyboard focus expose identical text.
- **Risk notes:** Do not turn the bar into a second shop rail or reveal locked upgrade content.

### UI-009 · Minor · Verdance’s first confirmation shifts the reset context out of view

- **Where:** Verdance Epoch section in `src/ui/Observatory.svelte`/universe-specific epoch presentation; Pruning-ready, 1280×800.
- **Screenshot:** `docs/qa/ui-audit/57-verdance-growth-rings-reset-ready-1280x800.png`, `docs/qa/ui-audit/58-verdance-pruning-comparison-1280x800.png`.
- **Player experience:** “After I choose Pruning, the panel jumps so the title and reward context are no longer visible while I decide whether to continue.”
- **Rule violated:** visibility of system status and spatial stability.
- **Proposed fix:** Make the epoch header sticky within the panel and reset/preserve the panel scroll position when the inline confirmation row replaces the action row. Keep the existing two-step safety and poetic copy.
- **Acceptance criterion:** Clicking Pruning at 1280×800 leaves the title, current Memory Seeds, pending gain, and both inline actions visible without manual scrolling.
- **Risk notes:** Do not remove the final `ResetComparisonCard` or reduce the number of confirmations.

### UI-010 · Minor · Utility-panel entrance animations delay settled readability

- **Where:** `src/ui/ShopPanel.svelte`, `src/ui/GameGuide.svelte`, `src/ui/OptionsPanel.svelte`, other panel-specific `*-in` keyframes; scenario/world arrival and panel open.
- **Screenshot:** entrance/steady comparison `docs/qa/ui-audit/25-ember-midgame-standard-entrance-transition-1280x800.png` and `docs/qa/ui-audit/55-ember-midgame-standard-settled-1280x800.png`.
- **Player experience:** “For the first second after arrival, the shop and HUD are present but too faded to read.”
- **Rule violated:** visibility of system status; FUTURE.md §5.1 proportional feedback. `ShopPanel.svelte` uses a 1.4s opacity entrance for an ordinary persistent panel.
- **Proposed fix:** Shorten routine panel/HUD opacity entrances to 180–280ms and never animate essential text below 60% opacity. Reserve multi-second reveals for T4/T5 ceremonies. The existing global `html[data-motion='reduced']` rule should continue to collapse all transitions.
- **Acceptance criterion:** Essential HUD/shop text reaches AA contrast within 300ms of load/open in standard motion and immediately in reduced motion.
- **Risk notes:** Preserve the authored world-arrival feeling; change only persistent UI, not universe crossings or epoch ceremonies.

## Suggested implementation order

1. **Accessibility floor (independently shippable):** UI-001, UI-002, UI-006. Add the pre-unlock access shell, type/target tokens, and ceremony progress fixes. Verify keyboard-only opening, computed type/target measurements, WCAG contrast, and `npm run verify`.
2. **Layering and reserved regions:** UI-003 and UI-004. Introduce suppression/queue behavior for helper hints and reserve the right rail for Shop. Verify all panels plus 20 forced Omens at both viewports.
3. **Reset comprehension:** UI-005 and UI-009. Add structured reward previews and stabilize inline epoch confirmations for all seven local names. Verify every Epoch Turn and Deep Collapse against the same displayed gain and reset scope.
4. **Density governor expansion:** UI-007 and UI-008. Bring DOM feedback, subtitles, upgrade affordances, and shop state under the existing attention budget without changing information or identity. Verify Unlock Everything in every universe.
5. **Motion/polish and regression pass:** UI-010, then rerun the full matrix including the states not reached here (muted audio, Story Archive, trial launch/completion, Deep Collapse, Remembrance, Clockwork revelation, Lumen Vault, Garden capture). Require steady-state screenshots in Vellum and Voidglass plus reduced/high/large modes at both desktop sizes and keep `npm run verify` green.

## Good qualities that must not regress

- The first frame’s one-Heart composition is confident, understandable without instructional text, and true to the fiction.
- Space/Enter activation of the Heart works from the opening; the click response and accessible status line are immediate.
- World objects, Cabinet landmarks, shop rows, and most icon-only controls have unusually descriptive accessible names using local nouns.
- The seven universes remain visually and mechanically distinct; Vellum/Voidglass accent samples preserved local identity and passed the sampled steady-panel contrast checks.
- Shop rows pair a bespoke silhouette with name, price, rate delta, and owned count; keep that information density.
- The searchable Field Guide is comprehensive, pauses the universe, identifies the player’s current stage, and does not visually spoil future systems.
- Reset safety is fundamentally sound: initiation is not destructive, Returns/Remains are explicit, recovery time is estimated, Escape/cancel paths exist, and confirmation is separate.
- Major panels use a coherent `--panel`/`--amber`/`--gold` language while still adapting to each universe.
- Crossing and The Question correctly reduce the ordinary world to supporting context and give story lines strong central hierarchy.
- The screen-as-inventory idea works: purchases visibly populate and reorganize the world instead of existing only as numbers.
