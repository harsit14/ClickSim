import assert from 'node:assert/strict'
import test from 'node:test'
import { ACHIEVEMENTS } from '../src/content/achievements'
import { curiosityProductionMult } from '../src/content/curiosities'
import { DEEP_UPGRADE_BY_ID, SINGULARITY_COST, SINGULARITY_COST_STEPS, singularityCostForCount } from '../src/content/deep'
import {
  ACHIEVEMENT_POWER_TIERS,
  CABINET_COSTS,
  DAWN_MEMORY_FIRST_KINDLINGS,
  DAWN_MEMORY_SECOND_KINDLINGS,
  EVENT_HORIZON_STARDUST_MULTIPLIER,
  KINDLING_MIN_COST_PER_RATE_SECONDS,
  LIFETIME_SINGULARITY_PRODUCTION_BONUS,
  LIFETIME_SINGULARITY_STARDUST_BONUS,
  STARDUST_PIVOT,
  STARDUST_PRODUCTION_BONUS_PER_POINT,
  universeKindlingFloorMultiplier,
  achievementPointPercent,
  achievementPowerPercent,
  achievementProductionMult,
} from '../src/content/economy-balance'
import { UNIVERSES } from '../src/content/universes'

test('every runtime Kindling respects the shared mature-efficiency floor', () => {
  for (const universe of UNIVERSES) {
    assert.equal(universe.generators.length, KINDLING_MIN_COST_PER_RATE_SECONDS.length)
    for (const generator of universe.generators) {
      const floor = KINDLING_MIN_COST_PER_RATE_SECONDS[generator.tier - 1]
      assert.ok(
        generator.baseCost / generator.baseRate + 1e-9 >= floor,
        `${universe.id} tier ${generator.tier} is below the ${floor}s floor`,
      )
      const realmFloorMultiplier = universeKindlingFloorMultiplier(universe.id)
      assert.ok(generator.baseCost / generator.baseRate + 1e-9 >= floor * realmFloorMultiplier)
    }
  }
})

test('Cabinets share one price cadence and bounded complete-production power', () => {
  const expected = {
    emberlight: 1.232,
    tidefall: 1.288,
    verdance: 1.232,
    clockwork: 1.232,
    brahmalok: 1.306368,
    vishnulok: 1.306368,
    kailash: 1.306368,
  }
  for (const universe of UNIVERSES) {
    assert.deepEqual(universe.cabinet.items.map(({ cost }) => cost), [...CABINET_COSTS], universe.id)
    const complete = curiosityProductionMult(universe.cabinet.items.map(({ id }) => id), universe.cabinet)
    assert.ok(Math.abs(complete - expected[universe.id]) < 1e-12, universe.id)
    assert.ok(complete >= 1.23 && complete <= 1.32, universe.id)
  }
})

test('achievement power is front-loaded and bounded', () => {
  assert.deepEqual(ACHIEVEMENT_POWER_TIERS, [
    { through: 20, bonusPerPoint: 0.01 },
    { through: 50, bonusPerPoint: 0.005 },
    { through: Number.POSITIVE_INFINITY, bonusPerPoint: 0.0025 },
  ])
  assert.equal(achievementPowerPercent(0), 0)
  assert.equal(achievementPowerPercent(20), 20)
  assert.equal(achievementPowerPercent(21), 20.5)
  assert.equal(achievementPowerPercent(44), 32)
  assert.equal(achievementPowerPercent(50), 35)
  assert.equal(achievementPowerPercent(51), 35.25)
  assert.equal(achievementPowerPercent(ACHIEVEMENTS.length), 48.25)
  assert.equal(achievementPointPercent(1), 1)
  assert.equal(achievementPointPercent(21), 0.5)
  assert.equal(achievementPointPercent(51), 0.25)
  assert.equal(achievementProductionMult(103), 1.4825)
})

test('Supernova and Deep values expose the planned recovery choices', () => {
  assert.equal(STARDUST_PIVOT, 1.8e18)
  assert.equal(STARDUST_PRODUCTION_BONUS_PER_POINT, 0.03)
  assert.equal(SINGULARITY_COST, 12)
  assert.deepEqual(SINGULARITY_COST_STEPS, [12, 8, 6])
  assert.deepEqual([0, 1, 2, 20].map(singularityCostForCount), [12, 8, 6, 6])
  assert.equal(LIFETIME_SINGULARITY_STARDUST_BONUS, 2)
  assert.equal(LIFETIME_SINGULARITY_PRODUCTION_BONUS, 1)
  assert.equal(EVENT_HORIZON_STARDUST_MULTIPLIER, 1.75)
  assert.equal(DAWN_MEMORY_FIRST_KINDLINGS, 30)
  assert.equal(DAWN_MEMORY_SECOND_KINDLINGS, 3)
  assert.equal(DEEP_UPGRADE_BY_ID.get('auto-kindler')?.cost, 1)
  assert.equal(DEEP_UPGRADE_BY_ID.get('dawn-memory')?.cost, 1)
  assert.equal(DEEP_UPGRADE_BY_ID.get('deep-resonance')?.cost, 1)
  assert.equal(DEEP_UPGRADE_BY_ID.get('auto-stoker')?.cost, 2)
  assert.equal(DEEP_UPGRADE_BY_ID.get('event-horizon')?.cost, 3)
  assert.equal(DEEP_UPGRADE_BY_ID.get('nova-engine')?.cost, 3)
})

test('Impatience is opening-only and cannot fire across prestige resets', () => {
  const impatience = ACHIEVEMENTS.find(({ id }) => id === 'impatience')!
  const opening = { challenge: null, supernovae: 0, collapses: 0, clicks: 100, owned: {} }
  assert.equal(impatience.when(opening as never, 0 as never), true)
  assert.equal(impatience.when({ ...opening, supernovae: 1 } as never, 0 as never), false)
  assert.equal(impatience.when({ ...opening, collapses: 1 } as never, 0 as never), false)
  assert.equal(impatience.when({ ...opening, owned: { spark: 1 } } as never, 0 as never), false)
})
