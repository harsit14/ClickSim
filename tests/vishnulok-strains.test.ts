import assert from 'node:assert/strict'
import test from 'node:test'
import type { EconomyAmount } from '../src/content/universes/types'
import { TEMPEST_V2_PACK } from '../src/content/universes/tempest'
import {
  VISHNULOK_LAW_FACTOR_CEILING,
  VISHNULOK_STRAIN_WAIT_SECONDS,
  advanceF4LawState,
  combineVishnulokLawFactors,
  configureTempestRoute,
  dischargeTempest,
  dischargeTempestSecond,
  f4RateMultiplier,
  tempestStatus,
  vishnulokStrainStatus,
} from '../src/content/universes/f4-runtime'
import {
  REFUGE_CLEARING_RADIUS_PERCENT,
  WOVEN_ROUTE_CAP,
  planVishnulokLivingChart,
  planVishnulokReturn,
  planVishnulokShelters,
  planVishnulokStrainMarker,
} from '../src/render/tempest/world-layer'

type NumericLawState = Record<string, EconomyAmount>
const OWNED = { 'u6-kindling-08': 10 }

test('Vishnulok Strains unlock at Restoring Shoal and wait without failure', () => {
  const locked: NumericLawState = {}
  advanceF4LawState('tempest', locked, {}, VISHNULOK_STRAIN_WAIT_SECONDS)
  assert.equal(vishnulokStrainStatus(locked).phase, 'waiting')

  const state: NumericLawState = {}
  const events = advanceF4LawState('tempest', state, OWNED, VISHNULOK_STRAIN_WAIT_SECONDS)
  assert.equal(vishnulokStrainStatus(state).phase, 'present')
  assert.equal(events.announcements.length, 1)
  advanceF4LawState('tempest', state, OWNED, 60 * 60)
  assert.equal(vishnulokStrainStatus(state).phase, 'present')
})

test('a matching Strain answer requires a deliberate post-announcement edit', () => {
  const state: NumericLawState = {}
  advanceF4LawState('tempest', state, OWNED, VISHNULOK_STRAIN_WAIT_SECONDS)
  assert.equal(vishnulokStrainStatus(state).answered, false)
  configureTempestRoute(state, 6, 0)
  assert.equal(vishnulokStrainStatus(state).answered, true)
  assert.equal(dischargeTempest(state), true)
  const events = advanceF4LawState('tempest', state, OWNED, 1)
  assert.equal(events.routesEarned, 1)
  assert.equal(events.returnsCompleted, 1)
  assert.equal(vishnulokStrainStatus(state).phase, 'waiting')
})

test('two ordinary returns soothe a Strain without awarding a Woven Route', () => {
  const state: NumericLawState = {}
  advanceF4LawState('tempest', state, OWNED, VISHNULOK_STRAIN_WAIT_SECONDS)
  assert.equal(dischargeTempest(state), true)
  let events = advanceF4LawState('tempest', state, OWNED, 1)
  assert.equal(events.routesEarned, 0)
  const duration = tempestStatus(state).durationSec
  advanceF4LawState('tempest', state, OWNED, duration + 80)
  assert.equal(dischargeTempest(state), true)
  events = advanceF4LawState('tempest', state, OWNED, 1)
  assert.equal(events.routesEarned, 0)
  assert.equal(events.returnsCompleted, 1)
  assert.equal(vishnulokStrainStatus(state).phase, 'waiting')
})

test('Confluence is opt-in, staggerable, and shares one bounded realm combiner', () => {
  const state: NumericLawState = {}
  advanceF4LawState('tempest', state, OWNED, 300, { upgrades: ['u6-auroral-return'] })
  const charged = tempestStatus(state)
  assert.equal(charged.ready, true)
  assert.equal(charged.secondReady, true)
  assert.equal(dischargeTempest(state), true)
  assert.equal(dischargeTempestSecond(state), true)
  assert.equal(tempestStatus(state).confluenceActive, true)
  assert.ok(f4RateMultiplier('tempest', state, OWNED) <= VISHNULOK_LAW_FACTOR_CEILING)
  assert.equal(combineVishnulokLawFactors(5, 1.8, 1.25), VISHNULOK_LAW_FACTOR_CEILING)
})

test('the second charge track never changes untouched idle production by itself', () => {
  const state: NumericLawState = {}
  advanceF4LawState('tempest', state, OWNED, 300)
  const withoutSecond = f4RateMultiplier('tempest', state, OWNED)
  const withSecondState: NumericLawState = { ...state }
  advanceF4LawState('tempest', withSecondState, OWNED, 300, { upgrades: ['u6-auroral-return'], promptsPaused: true })
  // Normalize the pre-existing primary track so this comparison isolates only u6-charge-2.
  withSecondState['u6-charge'] = state['u6-charge']
  withSecondState['u6-boost-seconds'] = state['u6-boost-seconds']
  assert.equal(f4RateMultiplier('tempest', withSecondState, OWNED), withoutSecond)
})

test('the Living Chart stays bounded and keeps the refuge center open', () => {
  const shelters = planVishnulokShelters(TEMPEST_V2_PACK.visual.objects, Object.fromEntries(
    TEMPEST_V2_PACK.economy.generators.map(({ id }) => [id, 100]),
  ))
  assert.equal(shelters.length, 6)
  assert.ok(shelters.every(({ xPercent, yPercent }) => Math.hypot(xPercent - 50, yPercent - 60) >= REFUGE_CLEARING_RADIUS_PERCENT))
  const chart = planVishnulokLivingChart(22, 50)
  assert.equal(chart.routes.length, WOVEN_ROUTE_CAP)
  assert.equal(chart.unrenderedRoutes, 7)
  assert.equal(planVishnulokReturn({}, true).motion, 'static-numbered-path')

  const state: NumericLawState = {}
  advanceF4LawState('tempest', state, OWNED, VISHNULOK_STRAIN_WAIT_SECONDS)
  assert.equal(planVishnulokStrainMarker(state)?.name, 'Thinning Coast')
})
