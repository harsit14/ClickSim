import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEEP_WORKS,
  STARDUST_WORKS,
  deepProductionMult,
  singularityYieldMult,
  stardustProductionMult,
  stardustYieldMult,
  workCost,
} from '../src/content/repeatables'

test('repeatable market costs rise predictably', () => {
  assert.deepEqual([0, 1, 2].map((rank) => workCost(STARDUST_WORKS[0], rank)), [4, 7, 12])
  assert.deepEqual([0, 1, 2].map((rank) => workCost(DEEP_WORKS[0], rank)), [4, 8, 16])
  assert.deepEqual([0, 1, 2].map((rank) => workCost(DEEP_WORKS[1], rank)), [6, 14, 31])
})

test('production ranks compound while prestige-yield ranks grow linearly', () => {
  assert.equal(stardustProductionMult({ 'continuing-corona': 3 }), 1.3 ** 3)
  assert.equal(stardustYieldMult({ 'parallax-engine': 4 }), 1.6)
  assert.equal(deepProductionMult({ 'worldseed-compression': 3 }), 8)
  assert.equal(singularityYieldMult({ 'recursive-abyss': 4 }), 2)
})

test('unknown and negative ranks never create bonuses', () => {
  assert.equal(stardustProductionMult({ exploit: 99 }), 1)
  assert.equal(stardustYieldMult({ 'parallax-engine': -5 }), 1)
  assert.equal(deepProductionMult({}), 1)
})
