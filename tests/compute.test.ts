import assert from 'node:assert/strict'
import test from 'node:test'
import { GENERATORS } from '../src/content/generators'
import { bulkCost, costOf, maxAffordable, totalRate, type EcoState } from '../src/engine/compute'
import {
  ZERO_AMOUNT,
  amountFromNumber,
  amountToNumber,
  divideAmounts,
  eqAmount,
  gtAmount,
  lteAmount,
} from '../src/core/numeric/amount'

function state(): EcoState {
  return {
    activeUniverse: 'emberlight',
    light: ZERO_AMOUNT,
    totalEarned: ZERO_AMOUNT,
    clicks: 0,
    owned: {},
    upgrades: [],
    achievements: [],
    stardustTotal: ZERO_AMOUNT,
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
    darkBetween: ZERO_AMOUNT,
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
  assert.ok(eqAmount(bulkCost(spark, owned, count), amountFromNumber(Math.ceil(sum))))
})

test('max affordable never spends more than the balance', () => {
  const wisp = GENERATORS[1]
  const balance = amountFromNumber(1_000_000)
  const count = maxAffordable(wisp, 12, balance)
  assert.ok(lteAmount(bulkCost(wisp, 12, count), balance))
  assert.ok(gtAmount(bulkCost(wisp, 12, count + 1), balance))
})

test('generator production and radiance remain finite', () => {
  const game = state()
  game.owned.spark = 100
  game.owned.wisp = 50
  game.achievements = ['a', 'b', 'c']
  const rate = totalRate(game)
  assert.ok(gtAmount(rate, ZERO_AMOUNT))
  assert.ok(eqAmount(costOf(GENERATORS[0], 0), amountFromNumber(15)))
})

test('repeatable prestige works join the production pipeline', () => {
  const game = state()
  game.owned.spark = 10
  const base = totalRate(game)
  game.stardustWorks['continuing-corona'] = 2
  assert.ok(Math.abs(amountToNumber(divideAmounts(totalRate(game), base)) - 1.3 ** 2) < 1e-12)
  game.deepWorks['worldseed-compression'] = 3
  assert.ok(Math.abs(amountToNumber(divideAmounts(totalRate(game), base)) - 1.3 ** 2 * 8) < 1e-12)
})
