import assert from 'node:assert/strict'
import test from 'node:test'
import { GENERATORS } from '../src/content/generators'
import { bulkCost, costOf, maxAffordable, totalRate, type EcoState } from '../src/engine/compute'

function state(): EcoState {
  return {
    activeUniverse: 'emberlight',
    light: 0,
    totalEarned: 0,
    clicks: 0,
    owned: {},
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

test('bulk cost equals the sum of individual geometric costs', () => {
  const spark = GENERATORS[0]
  const owned = 17
  const count = 25
  let sum = 0
  for (let i = 0; i < count; i++) sum += spark.baseCost * spark.costMult ** (owned + i)
  assert.equal(bulkCost(spark, owned, count), Math.ceil(sum))
})

test('max affordable never spends more than the balance', () => {
  const wisp = GENERATORS[1]
  const balance = 1_000_000
  const count = maxAffordable(wisp, 12, balance)
  assert.ok(bulkCost(wisp, 12, count) <= balance)
  assert.ok(bulkCost(wisp, 12, count + 1) > balance)
})

test('generator production and radiance remain finite', () => {
  const game = state()
  game.owned.spark = 100
  game.owned.wisp = 50
  game.achievements = ['a', 'b', 'c']
  const rate = totalRate(game)
  assert.ok(Number.isFinite(rate))
  assert.ok(rate > 0)
  assert.equal(costOf(GENERATORS[0], 0), 15)
})

test('repeatable prestige works join the production pipeline', () => {
  const game = state()
  game.owned.spark = 10
  const base = totalRate(game)
  game.stardustWorks['continuing-corona'] = 2
  assert.ok(Math.abs(totalRate(game) / base - 1.3 ** 2) < 1e-12)
  game.deepWorks['worldseed-compression'] = 3
  assert.ok(Math.abs(totalRate(game) / base - 1.3 ** 2 * 8) < 1e-12)
})
