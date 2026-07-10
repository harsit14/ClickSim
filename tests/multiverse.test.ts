import assert from 'node:assert/strict'
import test from 'node:test'
import { tidefallRateMultiplier } from '../src/content/universes/tidefall'
import { universeById } from '../src/content/universes'
import {
  wayfinderNodeAvailable,
  wayfinderProductionMult,
  wayfinderStartingKindlings,
  wayfinderTideAmplitude,
  WAYFINDER_NODES,
} from '../src/content/wayfinder'
import { totalRate, universeRateMult, type EcoState } from '../src/engine/compute'

function tideState(): EcoState {
  return {
    activeUniverse: 'tidefall',
    light: 0,
    totalEarned: 1_000,
    clicks: 0,
    owned: { spark: 1 },
    upgrades: [],
    achievements: [],
    stardustTotal: 0,
    constellation: [],
    stardustWorks: {},
    singUpgrades: [],
    deepWorks: {},
    challenge: null,
    challengesDone: [],
    ending: null,
    remembrances: 0,
    curiosities: [],
    keeperFedUntil: 0,
    beacons: [],
    darkBetween: 0,
    wayfinder: [],
    vesselParts: [],
  }
}

test('Tidefall ships a complete economy with a distinct identity', () => {
  const tidefall = universeById('tidefall')
  assert.equal(tidefall.generators.length, 18)
  assert.ok(tidefall.upgrades.length >= 60)
  assert.equal(tidefall.generators[0].name, 'Droplet')
  assert.equal(tidefall.generators[17].name, 'The Second Wave')
  assert.equal(tidefall.currency, 'Glow')
})

test('the living tide averages around one and reaches its stated extrema', () => {
  assert.ok(Math.abs(tidefallRateMultiplier(0) - 1) < 1e-12)
  assert.ok(Math.abs(tidefallRateMultiplier(22_500) - 1.4) < 1e-12)
  assert.ok(Math.abs(tidefallRateMultiplier(67_500) - 0.6) < 1e-12)

  const state = tideState()
  assert.ok(totalRate(state, 22_500) > totalRate(state, 67_500))
})

test('Steady Keel narrows Tidefall without changing its midpoint', () => {
  const state = tideState()
  assert.equal(universeRateMult(state, 0), 1)
  state.wayfinder = ['steady-keel']
  assert.ok(Math.abs(universeRateMult(state, 22_500) - 1.28) < 1e-12)
  assert.ok(Math.abs(universeRateMult(state, 67_500) - 0.72) < 1e-12)
  assert.equal(wayfinderTideAmplitude(state.wayfinder), 0.7)
})

test('Wayfinder nodes form an ordered, persistent progression', () => {
  assert.equal(wayfinderNodeAvailable([], WAYFINDER_NODES[0]), true)
  assert.equal(wayfinderNodeAvailable([], WAYFINDER_NODES[1]), false)
  assert.equal(wayfinderNodeAvailable(['between-cargo'], WAYFINDER_NODES[1]), true)
  assert.equal(wayfinderProductionMult(['between-cargo']), 1.25)
  assert.equal(wayfinderStartingKindlings(['remembered-kindling']), 25)
})
