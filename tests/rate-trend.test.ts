import assert from 'node:assert/strict'
import test from 'node:test'
import { amountFromNumber } from '../src/core/numeric/amount'
import { fiveMinuteRateDirection, recordRateSample } from '../src/experience/rate-trend'

test('five-minute pace comparison stays universe-local and reports all directions', () => {
  const now = 600_000
  const samples = [
    { universeId: 'emberlight', capturedAtMs: now - 310_000, rate: amountFromNumber(10) },
    { universeId: 'tidefall', capturedAtMs: now - 310_000, rate: amountFromNumber(100) },
  ]
  assert.equal(fiveMinuteRateDirection(samples, 'emberlight', now, amountFromNumber(20)), 'faster')
  assert.equal(fiveMinuteRateDirection(samples, 'emberlight', now, amountFromNumber(10)), 'steady')
  assert.equal(fiveMinuteRateDirection(samples, 'emberlight', now, amountFromNumber(5)), 'slower')
  assert.equal(fiveMinuteRateDirection(samples, 'clockwork', now, amountFromNumber(5)), 'measuring')
})

test('rate samples retain only the short comparison window', () => {
  const kept = recordRateSample([
    { universeId: 'emberlight', capturedAtMs: 1, rate: amountFromNumber(1) },
    { universeId: 'emberlight', capturedAtMs: 300_000, rate: amountFromNumber(2) },
  ], {
    universeId: 'emberlight',
    capturedAtMs: 600_000,
    rate: amountFromNumber(3),
  })
  assert.deepEqual(kept.map(({ capturedAtMs }) => capturedAtMs), [300_000, 600_000])
})
