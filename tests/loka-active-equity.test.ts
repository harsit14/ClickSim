import assert from 'node:assert/strict'
import test from 'node:test'
import { buildLokaActiveEquity, validateLokaActiveEquity } from '../balance/loka-active-equity'
import { advanceF4LawState, completeVishnulokReturn, selectTempestPath, tempestStatus } from '../src/content/universes/f4-runtime'

test('active loka strategies stay inside the same long-run multiplier neighborhood', () => {
  const cases = buildLokaActiveEquity()
  assert.equal(cases.length, 12)
  assert.deepEqual(validateLokaActiveEquity(cases), [])
  assert.equal(new Set(cases.map(({ strategyId }) => strategyId)).size, 12)
})

test('Vishnulok continuity rests while a temporary return is active', () => {
  const state = {}
  const owned = Object.fromEntries(Array.from({ length: 18 }, (_, index) => [`u6-kindling-${String(index + 1).padStart(2, '0')}`, 50]))
  selectTempestPath(state, 1)
  advanceF4LawState('tempest', state, owned, 120)
  assert.equal(completeVishnulokReturn(state), true)
  const active = tempestStatus(state)
  const chargeAtReturn = active.charge
  advanceF4LawState('tempest', state, owned, active.durationSec / 2)
  const midway = tempestStatus(state)
  assert.equal(midway.charge, chargeAtReturn)
  assert.match(midway.explanation, /temporary return/)
})
