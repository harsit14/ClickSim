import assert from 'node:assert/strict'
import test from 'node:test'
import { criticalCadenceForChance, criticalClickOccurs } from '../src/systems/critical-click'

test('random realms retain their ordinary critical roll', () => {
  assert.equal(criticalClickOccurs({ completedClicks: 0, chance: 0.03, randomnessAllowed: true, randomRoll: 0.029 }), true)
  assert.equal(criticalClickOccurs({ completedClicks: 0, chance: 0.03, randomnessAllowed: true, randomRoll: 0.03 }), false)
})

test('deterministic realms convert displayed critical chance into a guaranteed cadence', () => {
  assert.equal(criticalCadenceForChance(0.03), 33)
  assert.equal(criticalCadenceForChance(0.1), 10)
  const firstCycle = Array.from({ length: 33 }, (_, completedClicks) => criticalClickOccurs({
    completedClicks,
    chance: 0.03,
    randomnessAllowed: false,
  }))
  assert.deepEqual(firstCycle.slice(0, 32), Array.from({ length: 32 }, () => false))
  assert.equal(firstCycle[32], true)
  assert.equal(criticalClickOccurs({ completedClicks: 9, chance: 0.1, randomnessAllowed: false }), true)
})

test('invalid critical inputs fail closed', () => {
  assert.equal(criticalCadenceForChance(Number.NaN), null)
  assert.equal(criticalClickOccurs({ completedClicks: -1, chance: 0.03, randomnessAllowed: false }), false)
  assert.equal(criticalClickOccurs({ completedClicks: 0, chance: Number.NaN, randomnessAllowed: false }), false)
  assert.equal(criticalClickOccurs({ completedClicks: 0, chance: 0.03, randomnessAllowed: true }), false)
})
