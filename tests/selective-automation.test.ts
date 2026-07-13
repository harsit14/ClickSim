import assert from 'node:assert/strict'
import test from 'node:test'
import { simulateAutoKindlerStrategy } from '../balance/automation-strategy'
import { autoKindlerFamilyForTier } from '../src/core/automation-preferences'
import { migrateAndSanitizeSave, serializeSaveDataV23 } from '../src/core/save-data'
import { universeById } from '../src/content/universes'
import { parseAmount, ZERO_AMOUNT } from '../src/core/numeric/amount'
import type { EcoState } from '../src/engine/compute'

function state(owned: Record<string, number> = {}): EcoState {
  return {
    activeUniverse: 'emberlight', light: parseAmount('1e30'), totalEarned: parseAmount('1e30'), clicks: 0,
    owned, upgrades: [], achievements: [], stardustTotal: ZERO_AMOUNT, constellation: [], stardustWorks: {},
    singUpgrades: [], deepWorks: {}, challenge: null, challengesDone: [], ending: null, remembrances: 0,
    curiosities: [], keeperFedUntil: 0, beacons: [], darkBetween: ZERO_AMOUNT, wayfinder: [], vesselParts: [],
    numericLawState: {},
  }
}

test('family routing constrains every simulated automatic purchase', () => {
  const result = simulateAutoKindlerStrategy(state(), { families: [2], priority: 'efficiency' }, 40)
  assert.equal(result.purchasedGeneratorIds.length, 40)
  for (const id of result.purchasedGeneratorIds) {
    const generator = universeById('emberlight').generatorById.get(id)!
    assert.equal(autoKindlerFamilyForTier(generator.tier), 2)
  }
})

test('priority choices preserve distinct manager strategies', () => {
  const cheapest = simulateAutoKindlerStrategy(state(), { families: [0, 1, 2, 3, 4, 5], priority: 'cheapest' }, 1)
  const highest = simulateAutoKindlerStrategy(state(), { families: [0, 1, 2, 3, 4, 5], priority: 'highest-tier' }, 1)
  const leastOwned = simulateAutoKindlerStrategy(state({ spark: 100 }), { families: [0], priority: 'least-owned' }, 1)
  assert.deepEqual(cheapest.purchasedGeneratorIds, ['spark'])
  assert.deepEqual(highest.purchasedGeneratorIds, ['ember2'])
  assert.notDeepEqual(leastOwned.purchasedGeneratorIds, ['spark'])
})

test('selective automation fields are additive, sanitized, and wire-stable', () => {
  const old = migrateAndSanitizeSave({ version: 12 })!
  assert.deepEqual(old.autoKindlerFamilies, [0, 1, 2, 3, 4, 5])
  assert.equal(old.autoKindlerPriority, 'efficiency')
  const wire = serializeSaveDataV23(old)
  const clean = migrateAndSanitizeSave({
    ...wire,
    autoKindlerFamilies: [5, 2, 2, -1, 99],
    autoKindlerPriority: 'highest-tier',
  })!
  assert.deepEqual(clean.autoKindlerFamilies, [2, 5])
  assert.equal(clean.autoKindlerPriority, 'highest-tier')
  assert.deepEqual(serializeSaveDataV23(migrateAndSanitizeSave(serializeSaveDataV23(clean))!), serializeSaveDataV23(clean))
})
