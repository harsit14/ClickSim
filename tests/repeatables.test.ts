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
import { serializeAmount } from '../src/core/numeric/amount'

test('repeatable market costs rise predictably', () => {
  assert.deepEqual([0, 1, 2].map((rank) => serializeAmount(workCost(STARDUST_WORKS[0], rank)!)), ['4e0', '7e0', '1.2e1'])
  assert.deepEqual([0, 1, 2].map((rank) => serializeAmount(workCost(DEEP_WORKS[0], rank)!)), ['4e0', '8e0', '1.6e1'])
  assert.deepEqual([0, 1, 2].map((rank) => serializeAmount(workCost(DEEP_WORKS[1], rank)!)), ['6e0', '1.4e1', '3.1e1'])
  assert.equal(workCost(STARDUST_WORKS[0], STARDUST_WORKS[0].maxRank), null)
})

test('high repeatable ranks preserve their true cost above MAX_SAFE_INTEGER', () => {
  const highRank = workCost(STARDUST_WORKS[0], 99)
  assert.ok(highRank)
  assert.equal(serializeAmount(highRank), '2.6091749947783e23')
  assert.notEqual(serializeAmount(highRank), `${Number.MAX_SAFE_INTEGER}e0`)
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
