import assert from 'node:assert/strict'
import test from 'node:test'
import type { GameState } from '../src/engine/game.svelte'
import {
  VESSEL_PARTS,
  vesselPartCurrent,
  vesselPartReady,
  vesselProgress,
} from '../src/content/vessel'
import { parseAmount, serializeAmount } from '../src/core/numeric/amount'

function vesselState(): GameState {
  return {
    vesselParts: [],
    eraEarned: parseAmount('1e309'),
    allTimeEarned: parseAmount('1e309'),
    constellation: Array.from({ length: 9 }, (_, index) => `node-${index}`),
    owned: { sun: 100 },
    challengesDone: ['a', 'b', 'c', 'd'],
    ending: 'warden',
  } as unknown as GameState
}

test('Vessel count requirements remain JavaScript counts', () => {
  const state = vesselState()
  const countParts = VESSEL_PARTS.filter((part) => part.progressKind === 'count')
  assert.equal(countParts.length, 4)
  for (const part of countParts) {
    assert.equal(typeof part.target, 'number')
    assert.equal(typeof part.current(state), 'number')
    assert.equal(typeof vesselPartCurrent(state, part), 'number')
    assert.equal(vesselPartReady(state, part), true)
    assert.equal(vesselProgress(state, part), 1)
  }
})

test('Vessel era-Light progress stays an amount beyond native magnitude', () => {
  const state = vesselState()
  const hull = VESSEL_PARTS.find((part) => part.id === 'hull-hearths')!
  assert.equal(hull.progressKind, 'amount')
  if (hull.progressKind !== 'amount') throw new Error('Hull must be amount-valued')
  assert.equal(serializeAmount(hull.current(state)), '1e309')
  assert.equal(serializeAmount(vesselPartCurrent(state, hull) as ReturnType<typeof hull.current>), '1e24')
  assert.equal(vesselPartReady(state, hull), true)
  assert.equal(vesselProgress(state, hull), 1)
})
