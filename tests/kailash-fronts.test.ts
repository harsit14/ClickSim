import assert from 'node:assert/strict'
import test from 'node:test'
import type { EconomyAmount } from '../src/content/universes/types'
import {
  KAILASH_FRONT_ACTIVE_SECONDS,
  KAILASH_FRONT_APPROACH_SECONDS,
  KAILASH_FRONT_CALM_SECONDS,
  KAILASH_FRONTS,
  KAILASH_GRACE_BONUS_MAX,
  KAILASH_GRACE_BONUS_WINDOW_SECONDS,
  KAILASH_GRACE_RESERVE_CAP_SECONDS,
  KAILASH_LAW_FACTOR_CEILING,
  advanceF4LawState,
  advanceKailashFronts,
  combineKailashLawFactors,
  enterKailashLongRest,
  exitKailashLongRest,
  f4RateMultiplier,
  kailashFrontMultiplier,
  kailashFrontStatus,
  kailashLongRestStatus,
  selectCanticleMeasure,
} from '../src/content/universes/f4-runtime'
import {
  DESCENT_STATION_CAP,
  DESCENT_STATIONS,
  SUMMIT_CLEARANCE_Y_PERCENT,
  planKailashAshBands,
  planKailashDescent,
  planKailashValley,
} from '../src/render/canticle/world-layer'

type NumericLawState = Record<string, EconomyAmount>
const NO_KINDLINGS: Readonly<Record<string, number>> = {}

test('Kailash front timeline is deterministic and gated by Cloud Stair ownership', () => {
  const state: NumericLawState = {}
  assert.equal(kailashFrontStatus(state, NO_KINDLINGS).phase, 'calm')
  assert.equal(advanceF4LawState('canticle', state, NO_KINDLINGS, KAILASH_FRONT_CALM_SECONDS).announcements.length, 0)
  assert.equal(kailashFrontStatus(state, NO_KINDLINGS).phase, 'calm')

  const toApproach = advanceF4LawState('canticle', state, { 'u7-kindling-09': 1 }, KAILASH_FRONT_CALM_SECONDS)
  assert.equal(kailashFrontStatus(state, NO_KINDLINGS).phase, 'approaching')
  assert.equal(toApproach.announcements.length, 1)
  advanceKailashFronts(state, NO_KINDLINGS, KAILASH_FRONT_APPROACH_SECONDS)
  assert.equal(kailashFrontStatus(state, NO_KINDLINGS).phase, 'active')
  const toNext = advanceKailashFronts(state, NO_KINDLINGS, KAILASH_FRONT_ACTIVE_SECONDS)
  assert.equal(toNext.tracesEarned, 0)
  assert.equal(kailashFrontStatus(state, NO_KINDLINGS).front.id, KAILASH_FRONTS[1].id)
})

test('Kailash idle neutrality requires a deliberate post-announcement edit', () => {
  const state: NumericLawState = {}
  const owned = { 'u7-kindling-09': 1 }
  let traces = 0
  const fullCycle = KAILASH_FRONT_CALM_SECONDS + KAILASH_FRONT_APPROACH_SECONDS + KAILASH_FRONT_ACTIVE_SECONDS
  for (let second = 0; second < fullCycle * 2; second += 5) {
    traces += advanceF4LawState('canticle', state, owned, 5).tracesEarned
    assert.equal(kailashFrontMultiplier(state, owned, second * 1_000), 1)
  }
  assert.equal(traces, 0)
})

test('answering Passing Snow earns one persistent trace event', () => {
  const state: NumericLawState = {}
  const owned = { 'u7-kindling-09': 1 }
  advanceF4LawState('canticle', state, owned, KAILASH_FRONT_CALM_SECONDS)
  selectCanticleMeasure(state, 3)
  advanceF4LawState('canticle', state, owned, KAILASH_FRONT_APPROACH_SECONDS)
  assert.equal(kailashFrontStatus(state, owned).answered, true)
  const events = advanceF4LawState('canticle', state, owned, KAILASH_FRONT_ACTIVE_SECONDS)
  assert.equal(events.tracesEarned, 1)
  assert.ok(events.announcements.some(({ text }) => /new trace/.test(text)))
})

test('Kailash uses one combiner for the existing cycle and all new factors', () => {
  assert.equal(combineKailashLawFactors(4, 1.5, 1.2, 1.4), KAILASH_LAW_FACTOR_CEILING)
  assert.equal(combineKailashLawFactors(1, 1, 1, 1), 1)
  assert.equal(combineKailashLawFactors(0, 0.5, Number.NaN, 0), 1)
  const state: NumericLawState = {}
  assert.ok(f4RateMultiplier('canticle', state, { 'u7-kindling-09': 100 }, 0) <= KAILASH_LAW_FACTOR_CEILING)
})

test('the Long Rest banks a capped reserve, holds fronts, and decays after exit', () => {
  const state: NumericLawState = {}
  assert.equal(enterKailashLongRest(state), true)
  const events = advanceKailashFronts(state, NO_KINDLINGS, 4_000)
  assert.equal(events.announcements.length, 0)
  assert.equal(kailashLongRestStatus(state).reserveSeconds, KAILASH_GRACE_RESERVE_CAP_SECONDS)
  assert.equal(exitKailashLongRest(state), true)
  assert.equal(kailashLongRestStatus(state).bonusStrength, KAILASH_GRACE_BONUS_MAX)
  assert.equal(kailashLongRestStatus(state).bonusSecondsRemaining, KAILASH_GRACE_BONUS_WINDOW_SECONDS)
  advanceKailashFronts(state, NO_KINDLINGS, KAILASH_GRACE_BONUS_WINDOW_SECONDS + 1)
  assert.equal(kailashLongRestStatus(state).bonusSecondsRemaining, 0)
})

test('offline Kailash settling never replays a prompt backlog', () => {
  const state: NumericLawState = {}
  const events = advanceKailashFronts(state, NO_KINDLINGS, 8 * 60 * 60)
  assert.equal(events.announcements.length, 0)
  assert.equal(events.tracesEarned, 0)
  assert.equal(kailashFrontStatus(state, NO_KINDLINGS).phase, 'calm')
})

test('the inhabited descent preserves summit clearance and reports overflow', () => {
  assert.equal(DESCENT_STATIONS.length, DESCENT_STATION_CAP)
  assert.ok(DESCENT_STATIONS.every(({ yPercent }) => yPercent >= SUMMIT_CLEARANCE_Y_PERCENT))
  const overflowing = planKailashDescent(25)
  assert.equal(overflowing.stations.length, DESCENT_STATION_CAP)
  assert.equal(overflowing.unrenderedTraces, 7)
  assert.equal(planKailashValley({ 'u7-kindling-05': 60 })[0]?.threshold, 50)
  assert.equal(planKailashAshBands(40).length, 8)
})
