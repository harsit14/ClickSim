import assert from 'node:assert/strict'
import test from 'node:test'
import {
  addAmounts,
  amountFromNumber,
  amountLog10,
  amountToBoundedNumber,
  amountToNumber,
  ceilAmount,
  compareAmounts,
  divideAmounts,
  floorAmount,
  MAX_AMOUNT_EXPONENT,
  MIN_AMOUNT_EXPONENT,
  multiplyAmounts,
  parseAmount,
  powAmount,
  serializeAmount,
  sqrtAmount,
  subtractAmounts,
  ZERO_AMOUNT,
} from '../src/core/numeric/amount'
import { formatAmount } from '../src/core/format'

test('production amounts preserve the approved canonical boundary', () => {
  const values = [
    '0',
    '1e0',
    '1.23456789012345e6',
    `9.99999999999999e${MAX_AMOUNT_EXPONENT}`,
    `1e${MIN_AMOUNT_EXPONENT}`,
  ]
  for (const value of values) {
    assert.equal(serializeAmount(parseAmount(value)), value)
  }
  assert.throws(() => parseAmount('1.0e0'))
  assert.throws(() => parseAmount('1e2147483648'))
  assert.throws(() => amountFromNumber(Number.POSITIVE_INFINITY))
  assert.throws(() => amountFromNumber(-1))
})

test('all arithmetic stays normalized beyond native number range', () => {
  const left = parseAmount('9e400')
  const right = parseAmount('2e400')
  assert.equal(serializeAmount(addAmounts(left, right)), '1.1e401')
  assert.equal(serializeAmount(subtractAmounts(left, right)), '7e400')
  assert.equal(serializeAmount(multiplyAmounts(left, right)), '1.8e801')
  assert.equal(serializeAmount(divideAmounts(left, right)), '4.5e0')
  assert.equal(serializeAmount(powAmount(parseAmount('1e400'), 2)), '1e800')
  assert.equal(serializeAmount(sqrtAmount(parseAmount('1e800'))), '1e400')
  assert.equal(amountLog10(parseAmount('1e309')), 309)
  assert.equal(compareAmounts(parseAmount('1e309'), parseAmount('9e308')), 1)
})

test('integer operations and conversions fail closed', () => {
  assert.equal(serializeAmount(floorAmount(parseAmount('1.999e2'))), '1.99e2')
  assert.equal(serializeAmount(ceilAmount(parseAmount('1.001e2'))), '1.01e2')
  assert.equal(floorAmount(parseAmount('1e-3')), ZERO_AMOUNT)
  assert.equal(serializeAmount(ceilAmount(parseAmount('1e-3'))), '1e0')
  assert.equal(amountToNumber(parseAmount('1.25e6')), 1_250_000)
  assert.throws(() => amountToNumber(parseAmount('1e309')))
  assert.equal(amountToBoundedNumber(parseAmount('1e309')), Number.MAX_VALUE)
  assert.throws(() => subtractAmounts(parseAmount('1e0'), parseAmount('2e0')))
  assert.throws(() => divideAmounts(parseAmount('1e0'), ZERO_AMOUNT))
})

test('standard, scientific, engineering, and logarithmic notation are deterministic', () => {
  assert.equal(formatAmount(parseAmount('1.25e2')), '125')
  assert.equal(formatAmount(parseAmount('1.25e6')), '1.25M')
  assert.equal(formatAmount(parseAmount('1.2345e309')), '1.23e309')
  assert.equal(formatAmount(parseAmount('1.2345e309'), { notation: 'scientific', significantDigits: 4 }), '1.234e309')
  assert.equal(formatAmount(parseAmount('1.2345e7'), { notation: 'engineering', significantDigits: 3 }), '12.3e6')
  assert.equal(formatAmount(parseAmount('1e309'), { notation: 'logarithmic' }), '10^309')
  assert.equal(formatAmount(ZERO_AMOUNT, { notation: 'logarithmic' }), '0')
})
