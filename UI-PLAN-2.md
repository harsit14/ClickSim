# EMBER UI/UX audit plan — second pass

## Executive summary

This pass closes nearly all of the first audit's reachable gaps and applies five-second comprehension, keyboard traversal, transient-collision, edge-state, number-glanceability, and cross-universe consistency lenses. The strongest parts remain strong: Story Archive is immediately understandable; the Lumen Vault communicates ownership and cost well; the opening now exposes a restrained accessibility/recovery surface without breaking the purchased-UI fiction; and all seven universes retain distinct visual identities under the accessibility modes.

The largest remaining risks are comprehension and containment. A live trial does not state its rule or unit; the Deep Collapse is delivered as an immediate panel update rather than a T5 ceremony; Remembrance's last confirmation describes neither its actual scope nor its benefit; modal Cabinet/Garden surfaces do not contain keyboard focus; the Garden hides its central questions behind hover and very small translucent text; and a hard reset leaves the erased run's toasts over the new first frame. The glyph-only dock also fails the five-second test, including one same-dock glyph collision in Brahmalok. No Blocker was found. Eight Major and five Minor findings are added below, beginning at UI-020. This was an audit-only pass: no game code was changed.

## Method and evidence rule

- Priority order was FUTURE.md §4–5, then WCAG 2.2 AA, then standard usability heuristics.
- Desktop-only viewports were 1280×800 and 1440×900 at 100% zoom and ordinary viewing distance.
- Every new finding below cites at least one captured screenshot. DOM/accessibility-tree and source inspection were used only to explain or verify what a screenshot demonstrates.
- `✓` means reached, interacted with, and captured; `◐` means partially forced or source/DOM-verified but not fully reproducible; `—` means not reached. `A` means reduced motion + high contrast + large text were reapplied after the scenario load. `M` means both audio volumes were confirmed at zero.
- Scenario preference restoration was accounted for: the three accessibility preferences were reapplied after every `?scenario=` navigation.

## Completed coverage matrix

| State / sweep | 1280×800 | 1440×900 | A | M | Evidence / result |
|---|---:|---:|---:|---:|---|
| Fresh opening and pre-unlock access | ✓ | ◐ | ✓ | — | `71-pass2-opening-access-1280x800.png`, `135-pass2-opening-access-panel-1280x800.png`; access/recovery surface is available before purchase |
| Story Archive | ✓ | ◐ | — | — | `73-pass2-story-archive-1280x800.png`; passes the five-second test |
| Trial launch / list | ✓ | ◐ | ✓ | — | `76-pass2-trial-actions-tidefall-1280x800.png`, `144-pass2-trial-launch-reduced-high-large-1280x800.png` |
| In-trial UI | ✓ | ◐ | ✓ | — | `77-pass2-trial-live-tidefall-1280x800.png`, `145-pass2-trial-live-reduced-high-large-1280x800.png`; failures in UI-020/UI-029/UI-031 |
| Trial completion | ✓ | ◐ | ✓ | — | `78-pass2-trial-complete-tidefall-1280x800.png`, `146-pass2-trial-complete-reduced-high-large-1280x800.png` |
| Full Lumen Vault purchase | ✓ | ◐ | ✓ | — | `79-pass2-lumen-vault-before-1280x800.png`, `80-pass2-lumen-vault-purchased-1280x800.png`, `147-pass2-lumen-vault-reduced-high-large-before-1280x800.png`, `148-pass2-lumen-vault-reduced-high-large-purchased-1280x800.png` |
| Deep Collapse confirmation / completion | ✓ | ◐ | ✓ | — | `81-pass2-deep-collapse-confirm-1280x800.png`, `82-pass2-deep-collapse-complete-1280x800.png`, `142-pass2-deep-collapse-confirm-reduced-high-large-1280x800.png`, `143-pass2-deep-collapse-complete-reduced-high-large-1280x800.png` |
| The Question / epilogue | ✓ | ◐ | ✓ | — | `136-pass2-ending-pointer-skips-first-epilogue-1280x800.png`; UI-021 |
| Remembrance offer / confirmation / memory | ✓ | ◐ | ✓ | — | `91-pass2-remembrance-offer-clean-1280x800.png`, `137-pass2-remembrance-confirm-clean-1280x800.png`, `138-pass2-remembrance-confirm-reduced-high-large-1280x800.png`, `139-pass2-remembrance-overlay-reduced-high-large-1280x800.png`, `140-pass2-remembrance-memory-reduced-high-large-1280x800.png` |
| Clockwork revelation | ✓ | ◐ | ✓ | ✓ | `103-pass2-clockwork-revelation-final-1280x800.png`, `104-pass2-clockwork-revelation-reduced-high-large-muted-1280x800.png`; audio sliders and muted-equivalent state confirmed |
| Garden | ✓ | ◐ | ✓ | — | `100-pass2-garden-1280x800.png`, `102-pass2-garden-reduced-high-large-clean-1280x800.png`; UI-025/UI-026 |
| Welcome-back on fresh long-absence save | — | — | — | — | No scenario or Dev Playtest control establishes an old `savedAt`; listed under remaining gaps |
| Emberlight signature instrument | ✓ | — | ✓ | — | `105-pass2-emberlight-instrument-reduced-high-large-1280x800.png` |
| Tidefall signature instrument | ✓ | — | ✓ | — | `106-pass2-tidefall-instrument-reduced-high-large-1280x800.png` |
| Verdance signature instrument | ✓ | — | ✓ | — | `107-pass2-verdance-instrument-reduced-high-large-1280x800.png` |
| Clockwork signature instrument | ✓ | — | ✓ | — | `108-pass2-clockwork-instrument-reduced-high-large-1280x800.png` |
| Brahmalok signature instrument | ✓ | — | ✓ | — | `109-pass2-brahmalok-instrument-reduced-high-large-1280x800.png` |
| Vishnulok signature instrument | ✓ | — | ✓ | — | `110-pass2-vishnulok-instrument-reduced-high-large-1280x800.png` |
| Kailash signature instrument | ✓ | — | ✓ | — | `111-pass2-kailash-instrument-reduced-high-large-1280x800.png` |
| All current vestments in Emberlight | ✓ | — | n/a | n/a | `114`–`120-pass2-vestment-*-on-emberlight-1280x800.png` |
| All current vestments in Tidefall | ✓ | — | n/a | n/a | `121`–`127-pass2-vestment-*-on-tidefall-1280x800.png` |
| Five-second test: every reached panel, overlay, instrument | ✓ | ✓ | n/a | n/a | Failures are UI-020, UI-025, UI-027, UI-029, UI-030 and UI-031 |
| Keyboard-only traversal: every reached panel | ✓ | ✓ | n/a | n/a | Appendix A; UI-026 is the modal-containment failure |
| Transient collision: achievement + Lumen + buff + suffix + panel / stacked toasts | ✓ | ✓ | ✓ | n/a | `78-pass2-trial-complete-tidefall-1280x800.png`, `113-pass2-brahmalok-collision-reduced-high-large-1440x900.png`; amendment to UI-007 |
| Toast during cutscene / Omen during The Question / 20 forced Omens | ◐ | ◐ | ◐ | n/a | Exact combinations lacked a deterministic Dev Playtest trigger; no inferred finding |
| Empty Cabinet | ✓ | ✓ | n/a | n/a | `132-pass2-empty-cabinet-1280x800.png`; pass |
| Empty Story Archive | — | — | n/a | n/a | The Story control is absent before the first entry; Show All Panels seeds story content |
| Zero-affordable shop | ✓ | ✓ | ✓ | n/a | `77-pass2-trial-live-tidefall-1280x800.png`, `145-pass2-trial-live-reduced-high-large-1280x800.png`; UI-029 |
| Invalid save import | ✓ | ✓ | n/a | n/a | `128-pass2-invalid-save-import-1280x800.png`; UI-028 |
| Immediately after hard reset | ✓ | ✓ | n/a | n/a | `131-pass2-hard-reset-production-aftermath-1280x800.png`; UI-024 |
| Trivial offline report | — | — | n/a | n/a | Same long-absence setup limitation as Welcome-back |
| Panel during opening before systems exist | ✓ | ✓ | ✓ | ✓ | `135-pass2-opening-access-panel-1280x800.png`; only the safe pre-unlock surface is exposed |
| Number glanceability: early / mid / end | ✓ | ✓ | n/a | n/a | `71-pass2-opening-access-1280x800.png`, `133-pass2-midgame-goal-lens-1280x800.png`, `134-pass2-midgame-goal-lens-expanded-1280x800.png`, `72-pass2-endgame-baseline-1280x800.png`; UI-030 |
| Cross-universe consistency | ✓ | ✓ | n/a | n/a | Appendix B; UI-027/UI-032 |

### Vestment coverage and contrast measurements

The current build exposes seven vestments, not nine. Since Default, Vellum, and Voidglass were already sampled in the first pass, only four current entries were actually untested: Dawnforge and the three Lumen Vault skins (Aurora, Eclipse, Chorusglass). To avoid relying on that discrepancy, all seven were sampled in both Emberlight and Tidefall. Representative evidence spans `114-pass2-vestment-emberlight-on-emberlight-1280x800.png` through `127-pass2-vestment-chorusglass-on-tidefall-1280x800.png`.

Accent-on-panel contrast was calculated from the rendered CSS colors after compositing the translucent panel over black, using WCAG relative luminance. Every pairing that looked marginal was measured:

| Pair | Ratio | Result |
|---|---:|---|
| Default vestment × Vishnulok/Tempest accent on panel | 4.48:1 | Fails AA for ordinary text by 0.02; amendment to UI-002 |
| Dawnforge × Kailash/Canticle accent on panel | 4.95:1 | Pass, narrow margin |
| Voidglass × Vishnulok/Tempest accent on panel | 4.97:1 | Pass, narrow margin |
| Voidglass × Kailash/Canticle accent on panel | 4.99:1 | Pass, narrow margin |
| All other measured theme/universe accent pairs | >5.0:1 | Pass |

## Verification of UI-001…UI-010

| ID | Status | Acceptance-criterion check |
|---|---|---|
| UI-001 | **Fixed** | `71` and `135` show `Access · F1` on the untouched opening and access to motion, contrast, text size, audio, recovery and first-light help without exposing the purchased Guide or full Options. Keyboard access also works. |
| UI-002 | **Not fixed** | Computed standard-mode instrument copy remains below 11px and some controls remain below 24×24px. The Default × Vishnulok accent also measures 4.48:1 (`110`), so the criterion fails on text, targets and one theme/world contrast pair. |
| UI-003 | **Partially fixed** | The suffix hint is now suppressed for utility panels, reset preview and story modal states, so the cited Observatory/Deep overlap is fixed. It remains present over an active signature instrument and joins transient stacks (`113`), so the broader “no major surface covered” criterion is not yet met. |
| UI-004 | **Partially fixed** | Omens receive a reserved-shop position and observed Omens no longer occupied the shop row. The required 20-Omen force test at both viewports was not available through current Dev Playtest controls, so full acceptance cannot be signed off. |
| UI-005 | **Partially fixed** | Epoch Turn comparison now receives a structured reward, but Deep Collapse's final confirmation still shows no exact gain or post-reset total (`81`, `142`). |
| UI-006 | **Not fixed** | Small/low-opacity ceremony chrome remains, and Clockwork revelation adds 0.46rem progress text and 0.62rem descriptive copy (`103`, `104`). The ≥11px/4.5:1 criterion is not met. |
| UI-007 | **Not fixed** | At 1440×900, an open instrument, suffix helper, achievement, Lumen line and multiple Echo/buff toasts compete and overlap (`113`). The §5.5 budget is still exceeded. |
| UI-008 | **Not fixed** | Midgame/endgame upgrade tiles still present repeated glyphs without persistent target/effect labels (`72`, `133`). |
| UI-009 | **Not fixed** | Observatory still does not preserve/reset the Verdance confirmation scroll context or provide a sticky pending-gain header. |
| UI-010 | **Fixed** | Routine panel entrances are now approximately 240–280ms, with reduced motion collapsing them. Essential UI settles within the 300ms criterion. |

## Amendments to existing findings

### UI-002 amendment

- **New evidence:** `docs/qa/ui-audit/110-pass2-vishnulok-instrument-reduced-high-large-1280x800.png` and the vestment screenshots `114`–`127`.
- **Amendment:** In addition to the previously reported size/target failures, the Default vestment's Vishnulok/Tempest accent composites to 4.48:1 over its panel. The acceptance criterion should explicitly require computed *composited* contrast for every vestment/universe pair, not just raw CSS color values.

### UI-003 amendment

- **New evidence:** `docs/qa/ui-audit/113-pass2-brahmalok-collision-reduced-high-large-1440x900.png`.
- **Amendment:** Utility-panel suppression is implemented, but an active signature instrument is not treated as a suppressing major surface. Extend the same queued-hint contract to open signature instruments and to the transient density governor.

### UI-005 amendment

- **New evidence:** `docs/qa/ui-audit/81-pass2-deep-collapse-confirm-1280x800.png`, `docs/qa/ui-audit/142-pass2-deep-collapse-confirm-reduced-high-large-1280x800.png`.
- **Amendment:** Epoch Turns now surface their pending reward, but the Deep Collapse still reaches its final destructive confirmation with no exact gain or post-reset total. UI-005 remains open for Deep.

### UI-006 amendment

- **New evidence:** `docs/qa/ui-audit/103-pass2-clockwork-revelation-final-1280x800.png`, `docs/qa/ui-audit/104-pass2-clockwork-revelation-reduced-high-large-muted-1280x800.png`.
- **Amendment:** Add Clockwork revelation progress and supporting description to the affected ceremony chrome. Large text improves the central line, but does not lift all progress/supporting copy to the 11px floor.

### UI-007 amendment

- **New evidence:** `docs/qa/ui-audit/78-pass2-trial-complete-tidefall-1280x800.png`, `docs/qa/ui-audit/113-pass2-brahmalok-collision-reduced-high-large-1440x900.png`.
- **Amendment:** The collision is not confined to dense Emberlight. Stacked Echo/buff toasts, achievement, Lumen ticker, suffix education and an open signature instrument exceed the same attention budget in Brahmalok, including at 1440×900. Make the governor cross-universe and include every transient layer.

## Major findings

### UI-020 · Major · A live trial does not state its rule, unit, or next useful action

- **Where:** Tidefall trial list and live trial banner; equivalent trial state in all universes; standard and accessibility modes.
- **Screenshot:** `docs/qa/ui-audit/77-pass2-trial-live-tidefall-1280x800.png`, `docs/qa/ui-audit/145-pass2-trial-live-reduced-high-large-1280x800.png`.
- **Player experience:** “The Surface Seal is at 0/1, but I cannot tell what must become one, what rule changed, or what action advances it.”
- **Rule violated:** FUTURE.md §4.1/§5.4 action clarity, visibility of system status, and the five-second test. A name plus an unlabeled fraction requires remembered trial/lore knowledge.
- **Fix steps:** Keep the trial name, then add a plain-language one-line rule and a labeled target, for example “Reach 1 Current while the surface is sealed” and “Current: 0 / 1.” Add one context-sensitive next action (“Use the Heart,” “Buy a current source,” or “No affordable source—wait for …”). Reuse the existing panel, accent and status tokens; do not add a second tutorial overlay.
- **Acceptance criterion:** From a cold live-trial screenshot, a new player can say what changed, what quantity is being pursued, current progress, and the first useful action without opening another panel or hovering.
- **Risk notes:** Do not reveal optimal strategy, later trial rules, hidden rewards, or change trial math.

### UI-021 · Major · A pointer choice in The Question skips the first epilogue entry

- **Where:** The Question choice → ending epilogue transition, pointer activation.
- **Screenshot:** `docs/qa/ui-audit/136-pass2-ending-pointer-skips-first-epilogue-1280x800.png`.
- **Player experience:** “I chose the Warden, and the ending immediately says `final entry 2 / 4`; an authored part of the finale appears to have been skipped.”
- **Rule violated:** FUTURE.md §4.3 and §5.1 authored-sequence integrity; visibility of system status. The progress label itself proves the player entered mid-sequence.
- **Fix steps:** Make pointer and keyboard activation call the same idempotent transition once. Initialize the epilogue index before advancing it, ignore the choice event's bubbling/repeated activation during the transition frame, and add a regression test for both pointer and Enter/Space paths.
- **Acceptance criterion:** Each answer choice begins at `final entry 1 / 4` exactly once with pointer, Enter and Space; rapid double activation cannot advance or skip a line.
- **Risk notes:** Preserve choice text, timing, reduced-motion behavior and save compatibility; do not alter the ending branch.

### UI-022 · Major · Deep Collapse completes as an ordinary panel update instead of a T5 ceremony

- **Where:** The Deep, final confirmation through completed state; standard and reduced/high/large modes.
- **Screenshot:** `docs/qa/ui-audit/81-pass2-deep-collapse-confirm-1280x800.png`, `docs/qa/ui-audit/82-pass2-deep-collapse-complete-1280x800.png`, `docs/qa/ui-audit/142-pass2-deep-collapse-confirm-reduced-high-large-1280x800.png`, `docs/qa/ui-audit/143-pass2-deep-collapse-complete-reduced-high-large-1280x800.png`.
- **Player experience:** “I confirmed the most consequential collapse in the game; the same panel immediately changed state and a normal toast appeared. It felt like buying an upgrade.”
- **Rule violated:** FUTURE.md §5.1 T5 authored-sequence requirement and §4.4 reset ceremony. Consequence, transition and result are not spatially or temporally distinguished.
- **Fix steps:** Route final confirmation into a dedicated Deep Collapse sequence: quiet normal transients, establish the Deep as the primary semantic zone, show consequence → irreversible crossing → result, then return control. Reduced motion should replace travel/scale with cuts and opacity while preserving all beats. Reuse the existing Deep palette and ceremony primitives; do not add generic modal chrome.
- **Acceptance criterion:** Standard and reduced-motion recordings both contain distinct consequence, transition and result beats; the player sees what changed before ordinary panels/toasts resume, and no routine transient competes during the sequence.
- **Risk notes:** Display/pacing only. Do not change reward, reset scope, save timing or universe identity.

### UI-023 · Major · Remembrance's last confirmation misstates what will be lost and what will remain

- **Where:** Final Remembrance confirmation after the offer; standard and accessibility modes.
- **Screenshot:** `docs/qa/ui-audit/137-pass2-remembrance-confirm-clean-1280x800.png`, `docs/qa/ui-audit/138-pass2-remembrance-confirm-reduced-high-large-1280x800.png`.
- **Player experience:** “It says everything returns and only memory survives. I cannot tell whether other universes, settings, the Archive, the Between, or my unlocked structure are being erased—or what Remembrance gives me.”
- **Rule violated:** FUTURE.md §4.4 reset contract, error prevention, and match between wording and actual system scope. The poetic absolute is not a safe destructive-action summary.
- **Fix steps:** Keep the poetic line as the header, then add structured `Returns`, `Remains`, and `You receive` rows. Explicitly name the active universe/run scope, other universes, preferences/save shell, Story Archive/Between state, and the Remembrance benefit/multiplier. Use the same reset-comparison model as Epoch/Deep so wording and values cannot drift.
- **Acceptance criterion:** Before confirming, a player can enumerate the exact reset scope, persistent systems, and immediate benefit without recalling prior screens; the text matches an automated state-diff fixture.
- **Risk notes:** Do not turn the finale into a spreadsheet; keep three short grouped rows and local/canonical nouns.

### UI-024 · Major · Hard reset leaves the erased run's transient messages over the fresh opening

- **Where:** Options → hard reset → immediate production-style first frame.
- **Screenshot:** `docs/qa/ui-audit/131-pass2-hard-reset-production-aftermath-1280x800.png`.
- **Player experience:** “The world has reset to one Heart, but Tidefall achievements and Echo rewards from the deleted run are still announcing themselves. I cannot tell whether the reset worked.”
- **Rule violated:** visibility of system status, consistency, and destructive-action trust. Transient UI is part of the visible state and contradicts the completed reset.
- **Fix steps:** On successful wipe, atomically clear toast queues, floating gains, combo/buff pills, Omen state, suffix education, Lumen line and pending announcements before rendering the new opening. Then enqueue only one explicit “save erased / first light restored” confirmation outside the playfield, if confirmation is needed.
- **Acceptance criterion:** The first rendered frame after hard reset contains only valid fresh-save UI; no text, reward, universe noun, timer or accessibility announcement from the previous save remains.
- **Risk notes:** Preserve the user's accessibility/audio preferences if that is the documented contract; clear transient content, not platform recovery data needed to undo an accidental wipe.

### UI-025 · Major · The Garden hides its core questions behind hover and below readable contrast/size floors

- **Where:** Garden constellation, relation labels and figure captions; standard and reduced-motion/high-contrast/large-text modes.
- **Screenshot:** `docs/qa/ui-audit/100-pass2-garden-1280x800.png`, `docs/qa/ui-audit/102-pass2-garden-reduced-high-large-clean-1280x800.png`.
- **Player experience:** “I see a beautiful constellation, but the relationship names are microscopic and the questions under each memory only appear when I hover. I cannot tell what I am meant to reflect on.”
- **Rule violated:** WCAG 2.2 AA 1.4.3, keyboard equivalence, and FUTURE.md §4.3/§5.4. Essential prompts use transparency/hover as their primary disclosure and remain too small even in Large Text + High Contrast.
- **Fix steps:** Make the selected memory's question persistently visible in a dedicated reading region; reveal the same region on keyboard focus. Raise relation/material/supporting text to ≥11px and ≥4.5:1 on the actual background, using existing Garden tokens. Let labels wrap or reduce decorative spread rather than shrinking them. Keep the constellation overview visually quiet until selection.
- **Acceptance criterion:** At both desktop sizes, standard and all three accessibility modes, every selectable memory has a visible focus indicator and an identical pointer/keyboard question; the selected question and all required relationship labels are ≥11px and ≥4.5:1.
- **Risk notes:** Preserve the contemplative pacing and spatial memory map; do not expose all long-form questions simultaneously.

### UI-026 · Major · Cabinet and Garden dialogs claim modality but allow keyboard focus into the world behind them

- **Where:** Curiosity Cabinet and Legacy/Garden hub surfaces; all universes.
- **Screenshot:** `docs/qa/ui-audit/132-pass2-empty-cabinet-1280x800.png`, `docs/qa/ui-audit/100-pass2-garden-1280x800.png`.
- **Player experience:** “The full-screen collection is open, but Tab eventually leaves it and walks through invisible/obscured world controls. I lose where I am.”
- **Rule violated:** WCAG 2.2 AA 2.4.3 focus order and ARIA dialog modal pattern. These surfaces declare `aria-modal="true"` while the game shell remains interactive and no focus loop contains traversal.
- **Fix steps:** Include Cabinet and Legacy/Garden in the same modal-state contract used by Guide/Question/reset comparison: inert the world shell, move focus to the panel heading or first action, trap Tab/Shift+Tab, close on Escape, and restore focus to the invoking dock control. If they are intentionally nonmodal, remove `aria-modal` and visually expose the world; the current hybrid is invalid.
- **Acceptance criterion:** With Cabinet or Garden open, repeated Tab and Shift+Tab never reach a background control; Escape closes; focus returns to the correct dock button; screen-reader browse mode does not expose actionable world controls as available.
- **Risk notes:** Reuse the existing modal/focus helper rather than introducing per-panel keyboard behavior.

### UI-027 · Major · The glyph-only dock has poor information scent and contains a same-dock collision

- **Where:** Bottom dock across all seven universes; especially Brahmalok.
- **Screenshot:** `docs/qa/ui-audit/133-pass2-midgame-goal-lens-1280x800.png`, `docs/qa/ui-audit/109-pass2-brahmalok-instrument-reduced-high-large-1280x800.png`, `docs/qa/ui-audit/113-pass2-brahmalok-collision-reduced-high-large-1440x900.png`.
- **Player experience:** “I see `?`, `▤`, `⚙`, `⌁`, `⌑`, `▤`, `⌘`, `◉`, `❖`. Without hovering, I do not know which opens records, the court, the vessel or the story—and two Brahmalok destinations use the same symbol.”
- **Rule violated:** five-second test, recognition over recall, and WCAG 2.2 AA 1.3.3 (instructions/identity cannot rely only on sensory shape). Hover labels are not persistent information scent.
- **Fix steps:** Add a short persistent text label to the active/most recently unlocked dock item and expose labels for all items in a compact dock-expanded state reachable by pointer and keyboard. Give Recomposition Court a glyph distinct from Run records. Keep universe-specific glyphs and purchased reveal order; use existing dock typography/tokens.
- **Acceptance criterion:** From a cold screenshot in every universe, a new player can name every currently available destination without hover; no two destinations in the same dock share a glyph; focus and hover show identical names.
- **Risk notes:** Do not turn the dock into a generic OS toolbar or reveal locked systems.

## Minor findings

### UI-028 · Minor · Failed save import copy is poetic but does not tell the player how to recover

- **Where:** Access & Recovery / Options save import, garbage input.
- **Screenshot:** `docs/qa/ui-audit/128-pass2-invalid-save-import-1280x800.png`.
- **Player experience:** “`That code isn't light. Check it and try again.` I still do not know whether the code is truncated, from a different version, corrupted, or pasted with extra characters.”
- **Rule violated:** error recovery and plain-language error messaging.
- **Fix steps:** Retain the short fiction line, add a plain cause class and next step: invalid format, checksum/corruption, unsupported version, or empty input. Preserve the pasted text and offer Select all/Clear only when useful; link recovery guidance without exposing save internals.
- **Acceptance criterion:** For empty, malformed, checksum-failed and unsupported-version inputs, the message distinguishes the condition and provides one concrete corrective action; no failed import mutates the current save.
- **Risk notes:** Do not echo raw save contents or internal stack errors.

### UI-029 · Minor · A zero-affordable shop becomes unexplained blank chrome

- **Where:** Shop during a restrictive/live trial and any zero-affordable state.
- **Screenshot:** `docs/qa/ui-audit/77-pass2-trial-live-tidefall-1280x800.png`, `docs/qa/ui-audit/145-pass2-trial-live-reduced-high-large-1280x800.png`.
- **Player experience:** “The Shop panel is open but contains no rows or explanation. I cannot tell whether it is loading, broken, or intentionally unavailable.”
- **Rule violated:** empty-state visibility and the five-second test.
- **Fix steps:** Render a one-line contextual empty state inside the existing shop rail: why no rows are shown and the nearest action that can change it. If a trial intentionally seals purchases, say so with the trial's plain-language rule.
- **Acceptance criterion:** Every empty shop state names the reason and one next action; it never resembles an unloaded panel.
- **Risk notes:** Do not reveal hidden rows, future prices or optimal progression.

### UI-030 · Minor · The expanded Ember Compass spends most of its space on dead bearings

- **Where:** Midgame Goal Lens / Ember Compass, collapsed and expanded.
- **Screenshot:** `docs/qa/ui-audit/133-pass2-midgame-goal-lens-1280x800.png`, `docs/qa/ui-audit/134-pass2-midgame-goal-lens-expanded-1280x800.png`.
- **Player experience:** “Two of three large sections say `Nothing useful here yet`; the remaining Spark card gives a rate but not whether I am accelerating, what I am saving for overall, or how long it will take.”
- **Rule violated:** FUTURE.md §4.2 Goal Lens contract and glanceability. Screen space is not earning a decision.
- **Fix steps:** Collapse absent bearings instead of rendering equal empty cards. Use the saved space for current rate trend versus five minutes ago, target cost, current/required quantity and time-to-target, with an explicit “steady / faster / slower” text cue. Only pin a goal that currently exists.
- **Acceptance criterion:** At early, mid and endgame, a five-second glance answers current direction, whether earnings are accelerating, the active target, current/required progress and estimated time; unavailable bearings occupy no card-sized region.
- **Risk notes:** Use existing economy history/estimates and tokens; avoid false precision and do not add another permanent HUD panel.

### UI-031 · Minor · Repeated trial and Vault actions have indistinguishable accessible names

- **Where:** Trial cards, abandon control and Lumen Vault purchase rows.
- **Screenshot:** `docs/qa/ui-audit/76-pass2-trial-actions-tidefall-1280x800.png`, `docs/qa/ui-audit/77-pass2-trial-live-tidefall-1280x800.png`, `docs/qa/ui-audit/79-pass2-lumen-vault-before-1280x800.png`.
- **Player experience:** “A keyboard or screen-reader list contains several `begin` buttons and several `2 unlock` buttons; taken out of visual context, I cannot tell which trial or Vault item they activate. The live-trial `✕` does not say abandon.”
- **Rule violated:** WCAG 2.2 AA 2.4.6 headings/labels and 4.1.2 name, role, value.
- **Fix steps:** Give each action a contextual accessible name (`Begin The Surface Seal`, `Unlock Aurora for 2 Lumen`, `Abandon The Surface Seal`) while retaining compact visible copy. Associate cards with headings via `aria-labelledby`/`aria-describedby`.
- **Acceptance criterion:** A controls-only accessibility listing uniquely identifies every trial/Vault action and its cost/consequence; focus exposes the same supporting description as hover.
- **Risk notes:** Do not lengthen every visible button if the accessible name can carry context.

### UI-032 · Minor · Destructive confirmation actions reverse their confirm/cancel order

- **Where:** ResetComparisonCard versus Deep Collapse and Remembrance final confirmations.
- **Screenshot:** `docs/qa/ui-audit/67-supernova-reset-comparison-1280x800.png`, `docs/qa/ui-audit/81-pass2-deep-collapse-confirm-1280x800.png`, `docs/qa/ui-audit/137-pass2-remembrance-confirm-clean-1280x800.png`.
- **Player experience:** “One reset puts cancel on the left and confirm on the right; the next ceremonies put confirm on the left and `Not yet` on the right. Muscle memory becomes dangerous at the most irreversible moments.”
- **Rule violated:** consistency and error prevention.
- **Fix steps:** Adopt one destructive-action order across all reset/ending confirmations. Keep the safe action first in DOM/focus order and visually consistent; distinguish destructive confirm with text and treatment, not position changes. Reuse the shared reset confirmation component where possible.
- **Acceptance criterion:** Epoch, Deep and Remembrance use the same DOM, visual and keyboard order for safe/destructive actions; Enter never defaults to the destructive action and Escape always chooses the safe exit.
- **Risk notes:** Validate with both left-to-right pointer scanning and keyboard order; do not silently change a default action.

## Appendix A — keyboard-only traversal checklist

Legend: `✓` pass; `—` not applicable; `F` failure linked to a finding. “Contained” means focus is trapped only when the surface claims modality; nonmodal instruments/rails correctly use `—`.

| Panel / interface | Visible focus | Logical order | Escape | Contained / world inert | Hover = focus info | Result / evidence |
|---|---:|---:|---:|---:|---:|---|
| Opening Heart | ✓ | ✓ | — | — | ✓ | Pass; `71` |
| Access & Recovery | ✓ | ✓ | ✓ | ✓ | ✓ | Pass; `135` |
| Field Guide | ✓ | ✓ | ✓ | ✓ | ✓ | Pass |
| Story Archive | ✓ | ✓ | ✓ | — | ✓ | Pass; `73` |
| Run records / Stats | ✓ | ✓ | ✓ | — | ✓ | Pass |
| Options | ✓ | ✓ | ✓ | — | ✓ | Pass |
| Curiosity Cabinet | ✓ | ✓ | ✓ | **F** | ✓ | Focus can leave an `aria-modal` surface; UI-026; `132` |
| Vessel | ✓ | ✓ | ✓ | — | ✓ | Pass |
| Observatory | ✓ | ✓ | ✓ | — | ✓ | Pass |
| Deep | ✓ | ✓ | ✓ | — | ✓ | Pass; destructive-order inconsistency UI-032 |
| Story/ending overlay | ✓ | ✓ | ✓ | ✓ | ✓ | Pass |
| The Question | ✓ | ✓ | ✓ | ✓ | ✓ | Trap and restoration pass; pointer sequence fails separately in UI-021 |
| ResetComparisonCard | ✓ | ✓ | ✓ | ✓ | ✓ | Pass |
| Remembrance confirmation | ✓ | ✓ | ✓ | ✓ | ✓ | Pass except order inconsistency UI-032 |
| Garden / Legacy hub | ✓ | ✓ | ✓ | **F** | **F** | Focus can reach world; prompts are hover-primary; UI-025/UI-026; `100`, `102` |
| Trial list/cards | ✓ | ✓ | ✓ | — | **F** | Repeated actions lack contextual names; UI-031; `76` |
| Live trial banner | ✓ | ✓ | — | — | **F** | `✕` lacks contextual action name; UI-031; `77` |
| Lumen Vault | ✓ | ✓ | ✓ | — | **F** | Repeated purchase names; UI-031; `79` |
| Shop rail | ✓ | ✓ | — | — | ✓ | Pass; empty-state failure is UI-029 |
| Upgrade strip | ✓ | ✓ | — | — | ✓ | Keyboard exposes the tooltip, but persistent recognition remains UI-008 |
| Emberlight instrument | ✓ | ✓ | — | — | ✓ | Pass; `105` |
| Tidefall instrument | ✓ | ✓ | — | — | ✓ | Pass; `106` |
| Verdance instrument | ✓ | ✓ | — | — | ✓ | Pass; `107` |
| Clockwork instrument | ✓ | ✓ | — | — | ✓ | Pass; `108` |
| Brahmalok instrument | ✓ | ✓ | — | — | ✓ | Pass; `109` |
| Vishnulok instrument | ✓ | ✓ | — | — | ✓ | Pass; `110` |
| Kailash instrument | ✓ | ✓ | — | — | ✓ | Pass; `111` |
| Bottom dock | ✓ | ✓ | — | — | ✓ | Focus labels work, but cold-screen scent fails in UI-027 |

Global focus uses a visible 2px gold outline. Global Escape closes reached utility panels. Welcome-back could not be instantiated, so its traversal remains unverified rather than inferred from source.

## Appendix B — seven-universe consistency table

| Universe | Universe dock destinations (glyph) | Shared dock glyphs | Panel title / close | Confirm → cancel order | Currency glyphs |
|---|---|---|---|---|---|
| Emberlight | Cabinet `◎`; Observatory `✧` | Guide `?`; records `▤`; options `⚙`; Vessel `⌁`; Deep `◉`; Story `❖` | Title left; `×` top-right | Reset: cancel → confirm; Deep: confirm → `Not yet` | Light `✦`; Stardust `✧` |
| Tidefall | Cabinet `≋`; Moonless Chart `◇`; Legacy `⌘` | Same | Title left; `×` top-right | Reset: cancel → confirm; Remembrance: confirm → `Not yet` | Glow `≈`; Moon Salt `◇` |
| Verdance | Cabinet `❧`; Growth Rings `◇`; Legacy `⌘` | Same | Title left; `×` top-right | Reset: cancel → confirm; Remembrance: confirm → `Not yet` | Sap `❧`; Memory Seeds `◇` |
| Clockwork | Cabinet `⌑`; Regulator Hall `◒`; Legacy `⌘` | Same | Title left; `×` top-right | Reset: cancel → confirm; Remembrance: confirm → `Not yet` | Ticks `⌑`; Mainsprings `◒` |
| Brahmalok | Cabinet `⌑`; Recomposition Court `▤`; Legacy `⌘` | Same; **Court `▤` duplicates records `▤`** | Title left; `×` top-right | Reset: cancel → confirm; Remembrance: confirm → `Not yet` | Possibility `✦`; Folios `▤` |
| Vishnulok | Cabinet `≋`; Renewal Harbor `↶`; Legacy `⌘` | Same | Title left; `×` top-right | Reset: cancel → confirm; Remembrance: confirm → `Not yet` | Continuity `≈`; Returns `↶` |
| Kailash | Cabinet `⌃`; Open Summit `▽`; Legacy `⌘` | Same | Title left; `×` top-right | Reset: cancel → confirm; Remembrance: confirm → `Not yet` | Cadence `△`; Traces `▽` |

Exceptions worth fixing are the Brahmalok glyph collision (UI-027), destructive-action order reversal (UI-032), and Garden's text `Close` plus separate `Return` placement instead of the normal top-right `×`. The Garden difference is not independently filed because its spatial/ceremonial identity makes it a defensible exception and both exits are visible in `100-pass2-garden-1280x800.png`.

## Updated combined implementation order

The original five phases still fit; no phase 6 is necessary.

1. **Accessibility floor and basic comprehension:** keep UI-001 (verified fixed), UI-002 and UI-006; add UI-020, UI-025, UI-026, UI-027 and UI-031. Ship readable text/targets/contrast, trial rule labeling, modal keyboard containment, Garden focus parity and dock/action naming together. Verify all seven instruments, all vestments, every ceremony and `npm run verify`.
2. **Layering, reset cleanup and reserved regions:** keep UI-003 and UI-004; add UI-024 and the UI-007 transient amendment. Centralize major-surface suppression, reserved rectangles, transient queue limits and atomic wipe cleanup. Repeat both collision viewports and the first post-wipe frame.
3. **Reset and finale comprehension:** keep UI-005 and UI-009; add UI-021, UI-022, UI-023 and UI-032. Use shared structured Returns/Remains/Receives data, repair epilogue initialization, give Deep its authored ceremony, and standardize safe/destructive ordering.
4. **Density, navigation and goal glanceability:** keep UI-007 and UI-008; add UI-029 and UI-030. Extend the cross-universe governor, provide meaningful empty states, and make the Compass answer rate trend/target/progress without adding another permanent surface.
5. **Motion, error copy and full regression:** keep UI-010 (verified fixed); add UI-028. Re-run the full matrix with steady-state screenshots, import error classes, pointer/keyboard finale paths, hard reset, and every accessibility/vestment combination. Keep existing CSS variables and `npm run verify` green.

## Good qualities that must not regress

- Opening accessibility/recovery now works without exposing purchased game systems.
- Story Archive has strong title, chronology, readable entry hierarchy and an obvious first action.
- Lumen Vault clearly separates locked, affordable and purchased state while preserving the fiction.
- Universe-specific instruments remain visually distinct in reduced motion, high contrast and large text.
- Cabinet's empty shelf communicates `0 / 12` and visible requirements without pretending content exists.
- Trial completion feedback is celebratory and announces reward; retain it after collision governance.
- The Question and Remembrance retain a strong central narrative hierarchy.

## Still not reached

- A genuine Welcome-back surface on a fresh save with a long absence.
- A trivial-gain offline report.
- A truly empty Story Archive, because its control is absent before the first entry and the panel-unlock cheat seeds content.
- The exact forced combinations of a toast during a cutscene, an Omen during The Question, and 20 Omens with the shop open at both viewports. The current Dev Playtest panel exposes no deterministic trigger for these states; nearby collision states were captured, but they are not substitutes for sign-off.
- The requested “six untested vestments” do not exist in the current build as six distinct untested entries. Seven total vestments are exposed; all seven were sampled in two universes, and all four that were genuinely untested in the first pass were covered.
