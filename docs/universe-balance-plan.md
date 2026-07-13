# Universe Balance Plan

Status: implemented and validated

Source: `outputs/universe-balance-audit-2026-07-13/universe-balance-audit.md` and its current-engine CSV evidence
Scope: seven universe economies, Kindling prices, Supernova pacing and power, Deep Collapse pacing and upgrades, Cabinets, and achievement power/timing

## 1. Audit conclusions

The current first-Supernova curve is close to healthy: casual and competent fresh runs are inside the authored 1.5–5 hour window, with only active Emberlight at 1.40 hours. The large imbalance begins after repeated resets.

| Signal | Current result | Balance interpretation |
| --- | ---: | --- |
| Fresh SN1 | 1.40–4.05h | Preserve the shape; add a small amount of room at the fastest edge. |
| Casual SN10 | 18.67–64.42h | The 3.45× realm spread is too large for a shared prestige layer. |
| Deep 1 | 25.33–129.33h | The 5.1× spread makes the same Singularity prices mean radically different things. |
| Deep 3 | 52.42h–unreached at 168h | Three of seven realms fail the seven-day lifecycle target. |
| Achievements at SN1 | 44–47 before, 47–50 after | Linear +1% power makes nearly half the catalogue an oversized first-era multiplier. |
| Reset award | `nova-1`, `first-node`, and hidden `impatience` | `impatience` is a false positive caused by the empty post-reset run. |

The dominant numerical cause is mature Kindling efficiency. Emberlight's cost per unit of base rate rises from roughly 50 seconds at tier 1 to 650,000 seconds at tier 18. Several later worlds fall to a few seconds or remain near 2,400 seconds at high tiers. Realm mechanics should create the differences between worlds; raw late-tier prices should not bypass the shared prestige economy.

## 2. Acceptance targets

The implementation is accepted only when the current-engine audits and tests establish all of the following:

1. Fresh SN1 remains 1.5–5.0 hours for casual, active, and competent profiles in all seven universes.
2. The five-minute casual lifecycle lands in these deliberately broad identity-preserving bands:
   - SN1: 3–6.5 cumulative hours.
   - SN3: 8–20 cumulative hours.
   - SN10: 25–75 cumulative hours.
   - Deep 1: 40–110 cumulative hours.
   - Deep 3: reached in every universe by 168 hours, with no realm earlier than 80 hours.
3. No runtime Kindling may be cheaper than the shared mature-efficiency floor for its tier. Authored prices above the floor remain unchanged.
4. Cabinet shelves arrive on the same 12-step price cadence in every realm, completing at `1e15` world currency. A complete Cabinet contributes about ×1.23–×1.32 passive production before temporary fuel, rather than varying because a duplicate production shelf was ignored.
5. Achievement power is front-loaded but bounded: +1% for points 1–20, +0.5% for points 21–50, and +0.25% thereafter. Forty-four first-era achievements therefore grant +32%, not +44%; all 103 grant +48.25%, not +103%.
6. The first Supernova may award its prestige achievement and a purchased first Constellation node, but never `impatience`. A real 100-click no-Kindling opening must still award `impatience`.
7. The first Deep Collapse presents a real one-Singularity choice between automation and recovery, and later permanent upgrades arrive soon enough to affect the three-collapse lifecycle.
8. Kindling normalization deliberately moves mature-world Beacons out of the former 3–6 hour burst: Verdance's competent Beacon lands in 6–10 hours, while restored realms and Lokas retain an 8–20 hour completion band and at least their existing post-Epoch signature runway.

The fresh simulator is deterministic and quantized to one-minute steps; the lifecycle simulator uses five-minute steps. A result on a band edge is treated with one simulator step of tolerance.

## 3. Planned tuning

### 3.1 Kindling cost normalization

Add a single runtime guardrail used by every universe constructor. For each tier, the authored `baseCost` remains authoritative unless its cost/base-rate ratio is below 4% of Emberlight's established ratio at that tier. The initial 10% candidate made Verdance miss the fresh-run band (casual unreached at six hours; competent 5.95 hours), and the 6% follow-up still landed at 5.43/5.23 hours, so the floor was relaxed again before prestige validation. The implemented floor ratios in seconds are:

`[2, 2.5714, 3.6667, 5.2, 7.5294, 11.4286, 17, 26, 38.1395, 58.3333, 104.9180, 207.6923, 409.0909, 864.8649, 1935.4839, 4444.4444, 10434.7826, 26000]`

This leaves Emberlight, Tidefall, and Clockwork effectively unchanged. It raises only underpriced tiers in Verdance, Brahmalok, Vishnulok, and Kailash. The floor intentionally remains twenty-five times more generous than Emberlight at the mature end, leaving room for later-world identity and active mechanics.

The first lifecycle candidate still put Brahmalok at SN10 in 23.67 hours and Deep 1 in 33.58 hours, so its initial realm floor was raised to 10% of Emberlight efficiency. After the stepped Deep exchange, the full sweep put Brahmalok Deep 3 at 63.17 hours and Vishnulok at 71 hours. Intermediate 16%/6% floors reached only 68.42/76.75 hours. The final realm floors are therefore 40% for Brahmalok (10× the shared floor) and 7.6% for Vishnulok (1.9×); the other five use the shared 4% floor. Vishnulok was trimmed from 8% after its fresh casual audit landed two minutes over five hours.

Generated ordinary refinement prices continue to derive from the normalized base price, so the 10/25/50-owned upgrades cannot reintroduce the same bargain.

Because a Beacon requires the final Kindling, the efficiency guardrail intentionally replaces the older chamber-only 3–6 hour Beacon contract. The measured competent curve is now 7.92–17.20 hours across the chamber worlds; the shared pacing contract allows Verdance 6–10 hours and the other restored/Loka realms 8–20 hours. Each realm still leaves at least its authored post-Epoch mechanic runway before completion.

### 3.2 Supernova cost and permanent value

- Raise the one-Stardust pivot from `1e18` to `1.8e18`. A `1.1e18` candidate moved active Emberlight only from 1.40 to 1.42 hours, and `1.5e18` reached 1.47 hours. The final pivot clears the 1.5-hour edge while the looser mature-cost floor keeps Verdance near the upper edge.
- Raise permanent Stardust production power from +2% to +3% per lifetime Stardust. The stronger mid-era ramp compensates for bounded achievement power and makes every Supernova visibly useful.
- Keep the square-root Stardust formula and current Constellation prices. They already create a one-node first choice and prevent completing the whole constellation before the first Deep Collapse.
- Keep Constellation branch multipliers unchanged for this pass. Changing prices, achievement power, Cabinets, and branch power simultaneously would make attribution impossible.

### 3.3 Deep Collapse cost, recovery, and upgrades

- Use a descending Singularity exchange: 12 gathered Stardust before the first lifetime Singularity, 8 after the first, and a floor of 6 after the second. The 15-Stardust candidate left Tidefall at exactly 12 Stardust at 165.58 hours; a flat 12 moved Deep 1 to 81.92 hours and Deep 2 to 145.33 hours but left only 5/12 toward Deep 3. The stepped exchange preserves the first-Deep cost while giving the erased-Constellation rebuild enough room to complete three Collapses.
- Give each lifetime Singularity two inherent recovery effects: +100% all production and +200% Stardust scale. Yield-only candidates from +75% through +400% still left Tidefall unable to rebuild its erased Constellation quickly enough. Splitting the buff accelerates both the world rebuild and the next Stardust era, while leaving Deep 1 unchanged because lifetime Singularities are zero before it.
- Make the first one-Singularity decision meaningful:
  - Auto-Kindler: cost 1, unchanged.
  - Dawn Memory: cost 1; begin with 30 first-tier and 3 second-tier Kindlings (currently cost 2 and grants 40/5).
- Bring the economy upgrades forward without making automation mandatory:
  - Deep Resonance: cost 1, all production ×2. This makes it a second-Collapse recovery purchase after a first-Collapse Dawn Memory choice.
  - Auto-Stoker: cost 2, unchanged.
  - Event Horizon: cost 3, Stardust gain ×1.75.
  - Nova Engine: cost 3, unchanged.
- Keep post-market repeatable Deep Works unchanged. The audit horizon is primarily testing access to the permanent market, not an already completed market.

### 3.4 Cabinet costs and buffs

Use one exported Cabinet cost ladder in all seven universes:

`[1e6, 5e6, 25e6, 1e8, 5e8, 2e9, 1e10, 1e11, 1e12, 1e13, 1e14, 1e15]`

This changes Verdance's anomalous ×5 ladder; the other six already use the target cadence. The three shelf-completion gates therefore occur at `1e8`, `1e11`, and `1e15`.

- Reduce individual record resonance from +2% to +1%, for +12% at completion.
- Preserve Emberlight, Verdance, and Clockwork's ×1.10 production shelf.
- Set Tidefall's production shelf to ×1.15.
- In the three Lokas, honor both authored production shelves but set each to ×1.08; the combined shelf effect is ×1.1664 and the complete passive Cabinet is ×1.3064.
- Update production calculation to multiply every completed production shelf. The current `find` behavior silently ignores the second Loka production shelf.
- Keep click, Omen frequency, fuel, and timing utilities realm-specific; they express identity without destabilizing the passive prestige curve.

### 3.5 Achievement power and timing

Create one pure achievement-power function shared by production formulas and UI:

- achievements 1–20: +1 percentage point each;
- achievements 21–50: +0.5 percentage point each;
- achievements 51+: +0.25 percentage point each.

Show the actual cumulative percentage in Stats and the Kindled Sky. Achievement rows describe a "world power point" because the marginal value depends on when that point was earned; unlock toasts show the actual marginal increase.

Gate `impatience` to the initial pre-prestige run (`supernovae === 0` and `collapses === 0`) in addition to its existing no-trial, 100-click, and zero-Kindling conditions. Add regression coverage for both the intended opening award and the post-Supernova non-award.

Prestige achievements remain history markers rather than exceptional multipliers. `nova-1`, `first-node`, and `deep-1` use the same bounded point schedule as the rest of the catalogue.

## 4. Implementation order

- [x] Step 1 — Add shared balance constants/functions and regression tests for Kindling floors, achievement tiers, Cabinet cadence, and prestige values.
- [x] Step 2 — Apply the Kindling floor to all universe constructors and re-run fresh current-engine pacing.
- [x] Step 3 — Apply Supernova and Deep values, reset recovery, descriptions, formula inspection, guide copy, and UI readouts.
- [x] Step 4 — Standardize Cabinet prices, rebalance permanent Cabinet power, and correctly combine multiple production shelves.
- [x] Step 5 — Apply bounded achievement power everywhere and fix `impatience` timing.
- [x] Step 6 — Run targeted tests, TypeScript, the full suite, production build/budget/offline checks, and the deterministic balance audits.
- [x] Step 7 — Record the final measured timings below, freeze the accepted values, and prepare the balance-only commit for `main`.

## 5. As-built measurements

This section will be filled from the post-change current-engine audit before the implementation is committed.

| Universe | Fresh casual SN1 | Fresh active SN1 | Fresh competent SN1 | Competent Beacon | Casual SN10 | Deep 1 | Deep 3 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Emberlight | 2.08h | 1.48h | 1.90h | 9.40h | 60.42h | 72.75h | 135.17h |
| Tidefall | 4.07h | 3.20h | 3.85h | 16.20h | 68.50h | 81.92h | 150.00h |
| Verdance | 4.97h | 3.93h | 4.83h | 7.92h | 52.75h | 63.50h | 106.92h |
| Clockwork | 4.03h | 3.12h | 3.82h | 16.70h | 50.33h | 60.08h | 109.58h |
| Brahmalok | 4.57h | 3.57h | 4.25h | 17.20h | 42.75h | 50.58h | 80.50h |
| Vishnulok | 5.00h | 3.60h | 4.50h | 12.12h | 39.17h | 47.08h | 80.67h |
| Kailash | 3.97h | 2.83h | 3.68h | 8.37h | 38.75h | 46.67h | 84.25h |

Fresh values use the real current-engine audit at one-minute resolution. Repeated-prestige values use the real economy, deterministic achievements, five-minute purchasing, Supernovas at any positive gain, and Deep Collapses at the available stepped exchange. Cabinets, chance events, trials, Beacons, endings, Remembrances, Vault items, and Relays remain excluded from the lifecycle comparison so every realm is measured under the same native policy.

The first-Supernova reset now adds only `nova-1` and `first-node` in the deterministic lifecycle. `impatience` remains available in a true 100-click, zero-Kindling opening and is explicitly covered against post-prestige false awards.

Final verification: 548/548 tests, TypeScript, content proofread, production build, payload budget, offline/static checks, the 21-profile current-pack curve audit, and all 168 long-horizon simulator cases pass. The official player-pacing report records zero issues in all seven realms.

## 6. Rollback boundaries

Each system has an independent constant/function boundary. If validation exposes a miss, adjust only the smallest responsible layer:

- Fresh SN1 miss: Stardust pivot or the affected early Kindling authoring, not Deep values.
- SN3/SN10 realm spread: mature Kindling floor, not Cabinet or achievement rewards.
- Deep 1 global miss: Singularity exchange cost.
- Deep 2/3 recovery miss: lifetime-Singularity scale or Deep upgrade price/effect.
- Cabinet-aware miss: Cabinet price/power only.
- Excess long-run permanent power: achievement tier rates, not achievement unlock conditions.

This preserves causal evidence and prevents a successful first-run curve from being accidentally retuned while fixing late progression.
