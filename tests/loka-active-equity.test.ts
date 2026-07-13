import assert from 'node:assert/strict'
import test from 'node:test'
import { buildLokaActiveEquity, validateLokaActiveEquity } from '../balance/loka-active-equity'
import { advanceF4LawState, completeVishnulokReturn, selectVishnulokCircuit, vishnulokCircuitStatus } from '../src/content/universes/f4-runtime'

test('active loka strategies stay inside the same long-run multiplier neighborhood', () => {
  const cases = buildLokaActiveEquity()
  assert.equal(cases.length, 12)
  assert.deepEqual(validateLokaActiveEquity(cases), [])
  assert.equal(new Set(cases.map(({ strategyId }) => strategyId)).size, 12)
})

test('Vishnulok continuity rests while a temporary return is active', () => {
  const state = {}
  const owned = Object.fromEntries(Array.from({ length: 18 }, (_, index) => [`vishnulok-kindling-${String(index + 1).padStart(2, '0')}`, 50]))
  selectVishnulokCircuit(state, 1)
  advanceF4LawState('vishnulok', state, owned, 120)
  assert.equal(completeVishnulokReturn(state), true)
  const active = vishnulokCircuitStatus(state)
  const chargeAtReturn = active.continuity
  advanceF4LawState('vishnulok', state, owned, active.durationSec / 2)
  const midway = vishnulokCircuitStatus(state)
  assert.equal(midway.continuity, chargeAtReturn)
  assert.match(midway.explanation, /temporary return/)
})
