import assert from 'node:assert/strict'
import test from 'node:test'
import type { EconomyAmount } from '../../src/content/universes/types'
import { selectKailashCycle } from '../../src/content/universes/f4-runtime'
import {
  KAILASH_FRONT_ACTIVE_SECONDS,
  KAILASH_FRONT_APPROACH_SECONDS,
  KAILASH_FRONT_CALM_SECONDS,
  KAILASH_FRONTS,
  KAILASH_GRACE_BONUS_MAX,
  KAILASH_GRACE_BONUS_WINDOW_SECONDS,
  KAILASH_GRACE_RESERVE_CAP_SECONDS,
  KAILASH_LAW_FACTOR_CEILING,
  advanceKailashFronts,
  combineKailashLawFactors,
  enterKailashLongRest,
  exitKailashLongRest,
  kailashFrontMultiplier,
  kailashFrontStatus,
  kailashLongRestStatus,
  markKailashCycleEdited,
} from './fronts'
import {
  DESCENT_STATION_CAP,
  DESCENT_STATIONS,
  SUMMIT_CLEARANCE_Y_PERCENT,
  planKailashAshBands,
  planKailashDescent,
  planKailashValley,
} from './descent'

type NumericLawState = Record<string, EconomyAmount>

const NO_KINDLINGS: Readonly<Record<string, number>> = {}

test('the front timeline is deterministic: calm, approach, active, then the next front', () => {
  const state: NumericLawState = {}
  assert.equal(kailashFrontStatus(state, NO_KINDLINGS).phase, 'calm')

  const toApproach = advanceKailashFronts(state, NO_KINDLINGS, KAILASH_FRONT_CALM_SECONDS)
  assert.equal(kailashFrontStatus(state, NO_KINDLINGS).phase, 'approaching')
  assert.equal(toApproach.announcements.length, 1)
  assert.match(toApproach.announcements[0].text, /approaches the ridge/)

  advanceKailashFronts(state, NO_KINDLINGS, KAILASH_FRONT_APPROACH_SECONDS)
  assert.equal(kailashFrontStatus(state, NO_KINDLINGS).phase, 'active')

  const toNext = advanceKailashFronts(state, NO_KINDLINGS, KAILASH_FRONT_ACTIVE_SECONDS)
  const after = kailashFrontStatus(state, NO_KINDLINGS)
  assert.equal(after.phase, 'calm')
  assert.equal(after.front.id, KAILASH_FRONTS[1].id)
  assert.equal(toNext.tracesEarned, 0)
})

test('an idle player who never edits earns no traces and keeps a ×1 law factor', () => {
  const state: NumericLawState = {}
  let traces = 0
  // Two full front cycles of pure idling, stepped in tick-sized slices.
  const fullCycle = KAILASH_FRONT_CALM_SECONDS + KAILASH_FRONT_APPROACH_SECONDS + KAILASH_FRONT_ACTIVE_SECONDS
  for (let second = 0; second < fullCycle * 2; second += 5) {
    traces += advanceKailashFronts(state, NO_KINDLINGS, 5).tracesEarned
    assert.equal(kailashFrontMultiplier(state, NO_KINDLINGS, second * 1_000), 1)
  }
  assert.equal(traces, 0)
})

test('answering Passing Snow with an edited, rest-heavy cycle earns a Descent Trace', () => {
  const state: NumericLawState = {}
  // The Open Ring cycle holds 9 rests and 2 grace acts — it satisfies the
  // Passing Snow predicate (rest >= 3, grace >= 2) once the player commits it.
  advanceKailashFronts(state, NO_KINDLINGS, KAILASH_FRONT_CALM_SECONDS)
  assert.equal(kailashFrontStatus(state, NO_KINDLINGS).front.id, 'passing-snow')
  selectKailashCycle(state, 3)
  markKailashCycleEdited(state)
  advanceKailashFronts(state, NO_KINDLINGS, KAILASH_FRONT_APPROACH_SECONDS)

  const active = kailashFrontStatus(state, NO_KINDLINGS)
  assert.equal(active.phase, 'active')
  assert.equal(active.answered, true)
  assert.ok(kailashFrontMultiplier(state, NO_KINDLINGS) > 1)

  const events = advanceKailashFronts(state, NO_KINDLINGS, KAILASH_FRONT_ACTIVE_SECONDS)
  assert.equal(events.tracesEarned, 1)
  assert.ok(events.announcements.some(({ text }) => /gains a new trace/.test(text)))
  // The answered front leaves a carry window into the calm.
  assert.ok(kailashFrontStatus(state, NO_KINDLINGS).carrySecondsRemaining > 0)
  assert.ok(kailashFrontMultiplier(state, NO_KINDLINGS) > 1)
})

test('the combined law factor never exceeds the ceiling', () => {
  assert.equal(combineKailashLawFactors(1.5, 1.2, 1.4), KAILASH_LAW_FACTOR_CEILING)
  assert.equal(combineKailashLawFactors(1, 1, 1), 1)
  assert.ok(combineKailashLawFactors(1.5, 1, 1) <= KAILASH_LAW_FACTOR_CEILING)
  // Degenerate inputs are clamped, never amplified.
  assert.equal(combineKailashLawFactors(0, 0.5, Number.NaN), 1)
})

test('the Long Rest banks a capped grace reserve, holds the fronts, and decays after exit', () => {
  const state: NumericLawState = {}
  assert.equal(enterKailashLongRest(state), true)
  assert.equal(enterKailashLongRest(state), false)

  const events = advanceKailashFronts(state, NO_KINDLINGS, 4_000)
  assert.equal(events.announcements.length, 0)
  assert.equal(kailashFrontStatus(state, NO_KINDLINGS).phase, 'calm')
  const resting = kailashLongRestStatus(state)
  assert.equal(resting.resting, true)
  assert.equal(resting.reserveSeconds, KAILASH_GRACE_RESERVE_CAP_SECONDS)

  assert.equal(exitKailashLongRest(state), true)
  const after = kailashLongRestStatus(state)
  assert.equal(after.resting, false)
  assert.equal(after.bonusStrength, KAILASH_GRACE_BONUS_MAX)
  assert.equal(after.bonusSecondsRemaining, KAILASH_GRACE_BONUS_WINDOW_SECONDS)
  assert.ok(kailashFrontMultiplier(state, NO_KINDLINGS) > 1)
  assert.ok(kailashFrontMultiplier(state, NO_KINDLINGS) <= KAILASH_LAW_FACTOR_CEILING)

  advanceKailashFronts(state, NO_KINDLINGS, KAILASH_GRACE_BONUS_WINDOW_SECONDS + 1)
  assert.equal(kailashLongRestStatus(state).bonusSecondsRemaining, 0)
})

test('an offline gap settles to calm instead of replaying a backlog of fronts', () => {
  const state: NumericLawState = {}
  const events = advanceKailashFronts(state, NO_KINDLINGS, 8 * 60 * 60)
  assert.equal(events.announcements.length, 0)
  assert.equal(events.tracesEarned, 0)
  assert.equal(kailashFrontStatus(state, NO_KINDLINGS).phase, 'calm')
})

test('the descent renders below the summit clearance and reports overflow instead of hiding it', () => {
  assert.equal(DESCENT_STATIONS.length, DESCENT_STATION_CAP)
  assert.ok(DESCENT_STATIONS.every(({ yPercent }) => yPercent >= SUMMIT_CLEARANCE_Y_PERCENT))

  assert.equal(planKailashDescent(0).stations.length, 0)
  const partial = planKailashDescent(5)
  assert.equal(partial.stations.length, 5)
  assert.equal(partial.stations[4].stage, 'fresh')
  assert.equal(partial.stations[0].stage, 'kept')

  const overflowing = planKailashDescent(25)
  assert.equal(overflowing.stations.length, DESCENT_STATION_CAP)
  assert.equal(overflowing.unrenderedTraces, 25 - DESCENT_STATION_CAP)
})

test('valley features stage with ownership and ash bands stay bounded', () => {
  assert.equal(planKailashValley({}).length, 0)
  const valley = planKailashValley({ 'kailash-kindling-05': 60, 'kailash-kindling-11': 3 })
  assert.equal(valley.length, 2)
  assert.equal(valley.find(({ sourceId }) => sourceId === 'kailash-kindling-05')?.threshold, 50)
  assert.equal(valley.find(({ sourceId }) => sourceId === 'kailash-kindling-11')?.threshold, 1)

  assert.equal(planKailashAshBands(3).length, 3)
  assert.equal(planKailashAshBands(40).length, 8)
})
