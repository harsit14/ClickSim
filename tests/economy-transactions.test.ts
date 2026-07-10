import assert from 'node:assert/strict'
import test from 'node:test'
import {
  prepareBalanceAward,
  prepareClickCommit,
  prepareEarnings,
  preparePrestigeAward,
} from '../src/engine/economy-transactions'
import {
  ZERO_AMOUNT,
  parseAmount,
  serializeAmount,
} from '../src/core/numeric/amount'

const MAX_AMOUNT = parseAmount('9.99999999999999e2147483647')
const LARGE_AWARD = parseAmount('1e2147483647')

const snapshot = (value: {
  light: typeof ZERO_AMOUNT
  totalEarned: typeof ZERO_AMOUNT
  allTimeEarned: typeof ZERO_AMOUNT
  eraEarned: typeof ZERO_AMOUNT
}) => ({
  light: serializeAmount(value.light),
  totalEarned: serializeAmount(value.totalEarned),
  allTimeEarned: serializeAmount(value.allTimeEarned),
  eraEarned: serializeAmount(value.eraEarned),
})

test('earn precomputes every balance before a late signed-32 overflow can commit', () => {
  const current = {
    light: ZERO_AMOUNT,
    totalEarned: ZERO_AMOUNT,
    allTimeEarned: MAX_AMOUNT,
    eraEarned: ZERO_AMOUNT,
  }
  const before = snapshot(current)
  assert.throws(() => prepareEarnings(current, LARGE_AWARD, true), /signed 32-bit range/)
  assert.deepEqual(snapshot(current), before)
})

test('Supernova and Deep prestige awards do not partially commit either balance or counter', () => {
  const supernova = { balance: MAX_AMOUNT, total: ZERO_AMOUNT, resetCount: 12 }
  assert.throws(
    () => preparePrestigeAward(supernova.balance, supernova.total, supernova.resetCount, LARGE_AWARD),
    /signed 32-bit range/,
  )
  assert.equal(serializeAmount(supernova.balance), serializeAmount(MAX_AMOUNT))
  assert.equal(serializeAmount(supernova.total), '0')
  assert.equal(supernova.resetCount, 12)

  const deep = { balance: ZERO_AMOUNT, total: MAX_AMOUNT, resetCount: 8 }
  assert.throws(
    () => preparePrestigeAward(deep.balance, deep.total, deep.resetCount, LARGE_AWARD),
    /signed 32-bit range/,
  )
  assert.equal(serializeAmount(deep.balance), '0')
  assert.equal(serializeAmount(deep.total), serializeAmount(MAX_AMOUNT))
  assert.equal(deep.resetCount, 8)
})

test('Beacon award overflow leaves its balance and collection marker untouched', () => {
  const state = { darkBetween: MAX_AMOUNT, beacons: [] as string[] }
  assert.throws(() => {
    const next = prepareBalanceAward(state.darkBetween, LARGE_AWARD)
    state.beacons.push('emberlight')
    state.darkBetween = next
  }, /signed 32-bit range/)
  assert.equal(serializeAmount(state.darkBetween), serializeAmount(MAX_AMOUNT))
  assert.deepEqual(state.beacons, [])
})

test('click award overflow leaves earnings, counters, and best critical unchanged', () => {
  const current = {
    light: ZERO_AMOUNT,
    totalEarned: ZERO_AMOUNT,
    allTimeEarned: MAX_AMOUNT,
    eraEarned: ZERO_AMOUNT,
    clicks: 7,
    crits: 3,
    bestCrit: ZERO_AMOUNT,
  }
  const before = { ...snapshot(current), clicks: current.clicks, crits: current.crits, bestCrit: serializeAmount(current.bestCrit) }
  assert.throws(() => prepareClickCommit(current, LARGE_AWARD, true, true), /signed 32-bit range/)
  assert.deepEqual(
    { ...snapshot(current), clicks: current.clicks, crits: current.crits, bestCrit: serializeAmount(current.bestCrit) },
    before,
  )
})

test('click counter overflow fails after calculation without mutating source balances', () => {
  const current = {
    light: ZERO_AMOUNT,
    totalEarned: ZERO_AMOUNT,
    allTimeEarned: ZERO_AMOUNT,
    eraEarned: ZERO_AMOUNT,
    clicks: Number.MAX_SAFE_INTEGER,
    crits: 0,
    bestCrit: ZERO_AMOUNT,
  }
  assert.throws(() => prepareClickCommit(current, LARGE_AWARD, false, true), /safe integer range/)
  assert.deepEqual(snapshot(current), {
    light: '0',
    totalEarned: '0',
    allTimeEarned: '0',
    eraEarned: '0',
  })
  assert.equal(current.clicks, Number.MAX_SAFE_INTEGER)
})
