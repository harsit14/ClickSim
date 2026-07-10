import assert from 'node:assert/strict'
import test from 'node:test'
import { amountFromNumber } from '../src/core/numeric/amount'
import { secondsToAmountTarget } from '../src/experience/ember-cohesion'

test('Goal Lens time estimates use exact amounts and expose unavailable zero-rate targets', () => {
  assert.equal(secondsToAmountTarget(amountFromNumber(20), amountFromNumber(20), amountFromNumber(0)), 0)
  assert.equal(secondsToAmountTarget(amountFromNumber(10), amountFromNumber(20), amountFromNumber(2)), 5)
  assert.equal(secondsToAmountTarget(amountFromNumber(10), amountFromNumber(20), amountFromNumber(0)), null)
})

test('Goal Lens estimates remain finite beyond native-number balances', () => {
  assert.equal(
    secondsToAmountTarget({ mantissa: 1, exponent: 309 }, { mantissa: 2, exponent: 309 }, { mantissa: 5, exponent: 307 }),
    20,
  )
})
