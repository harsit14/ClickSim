import assert from 'node:assert/strict'
import test from 'node:test'
import { amountFromNumber } from '../src/core/numeric/amount'
import { welcomeBackEligible } from '../src/ui/welcome-back-model'

test('fractional offline earnings do not open Welcome Back', () => {
  assert.equal(welcomeBackEligible(amountFromNumber(0.999999)), false)
  assert.equal(welcomeBackEligible(amountFromNumber(1)), true)
  assert.equal(welcomeBackEligible(amountFromNumber(1.000001)), true)
})
