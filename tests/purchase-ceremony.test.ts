import assert from 'node:assert/strict'
import test from 'node:test'
import type {
  EconomyAmount,
  PurchaseFeedbackEvent,
} from '../src/content/universes/types'
import {
  INITIAL_PURCHASE_CEREMONY_TIMELINE,
  aggregatePurchaseFeedback,
  schedulePurchaseCeremony,
  schedulePurchaseCeremonyBatch,
} from '../src/feedback'

const amount = (mantissa: number, exponent = 0): EconomyAmount => ({ mantissa, exponent })

function purchase(
  mode: 'one' | 'ten' | 'max',
  quantity: number,
  occurredAtMs: number,
  deltaExponent: number,
): PurchaseFeedbackEvent {
  return aggregatePurchaseFeedback({
    eventId: `purchase-${mode}-${occurredAtMs}`,
    occurredAtMs,
    source: { universeId: 'emberlight', kind: 'generator', id: 'kindling-01' },
    mode,
    quantity,
    totalCost: amount(1.25, deltaExponent + 1),
    totalRateDelta: amount(1.5, deltaExponent),
    audioCue: 'purchase-cue',
  })[0]
}

const options = {
  destination: { kind: 'world-object' as const, id: 'kindling-object-01' },
  reducedMotion: false,
  quality: 'high' as const,
}

test('one, ten, and max each produce exactly one proportional ceremony', () => {
  const events = [
    purchase('one', 1, 100, 0),
    purchase('ten', 10, 100, 3),
    purchase('max', 100, 100, 6),
  ]
  const ceremonies = events.map((event) => (
    schedulePurchaseCeremony(event, INITIAL_PURCHASE_CEREMONY_TIMELINE, options).ceremony
  ))

  assert.equal(ceremonies.length, 3)
  ceremonies.forEach((ceremony, index) => {
    assert.strictEqual(ceremony.event, events[index])
    assert.strictEqual(ceremony.exactCost, events[index].cost)
    assert.strictEqual(ceremony.exactRateDelta, events[index].rateDelta)
    assert.equal(ceremony.phases.length, 5)
    assert.equal(ceremony.phases[0].startsAtMs, ceremony.startsAtMs)
    assert.equal(ceremony.phases.at(-1)?.endsAtMs, ceremony.endsAtMs)
    ceremony.phases.slice(1).forEach((phase, phaseIndex) => {
      assert.equal(phase.startsAtMs, ceremony.phases[phaseIndex].endsAtMs)
    })
    assert.ok(ceremony.endsAtMs - ceremony.startsAtMs < 1_000)
  })
  assert.ok(ceremonies[0].intensity < ceremonies[1].intensity)
  assert.ok(ceremonies[1].intensity < ceremonies[2].intensity)
})

test('rapid bulk actions queue without ceremony overlap', () => {
  const events = [
    purchase('ten', 10, 1_000, 1),
    purchase('max', 50, 1_000, 2),
    purchase('ten', 10, 1_050, 3),
  ]
  const result = schedulePurchaseCeremonyBatch(
    events,
    INITIAL_PURCHASE_CEREMONY_TIMELINE,
    () => options,
  )

  assert.equal(result.ceremonies.length, events.length)
  result.ceremonies.slice(1).forEach((ceremony, index) => {
    assert.ok(ceremony.startsAtMs >= result.ceremonies[index].endsAtMs)
  })
  assert.equal(result.nextState.sequence, 3)
  assert.equal(result.nextState.nextAvailableAtMs, result.ceremonies.at(-1)?.endsAtMs)
})

test('reduced-motion and low-quality ceremonies retain all semantic phases', () => {
  const event = purchase('max', 25, 500, 2)
  const reduced = schedulePurchaseCeremony(event, INITIAL_PURCHASE_CEREMONY_TIMELINE, {
    ...options,
    reducedMotion: true,
    quality: 'low',
  }).ceremony
  const low = schedulePurchaseCeremony(event, INITIAL_PURCHASE_CEREMONY_TIMELINE, {
    ...options,
    quality: 'low',
  }).ceremony

  assert.deepEqual(reduced.phases.map((phase) => phase.kind), [
    'price-contract',
    'destination-emphasis',
    'world-transition',
    'rate-delta',
    'next-signal',
  ])
  assert.ok(reduced.phases.every((phase) => phase.presentation === 'crossfade'))
  assert.ok(low.phases.every((phase) => phase.presentation === 'local-pulse'))
})

test('ceremony creation is deterministic and rejects invalid destinations', () => {
  const event = purchase('one', 1, 250, 0)
  assert.deepEqual(
    schedulePurchaseCeremony(event, INITIAL_PURCHASE_CEREMONY_TIMELINE, options),
    schedulePurchaseCeremony(event, INITIAL_PURCHASE_CEREMONY_TIMELINE, options),
  )
  assert.throws(() => schedulePurchaseCeremony(event, INITIAL_PURCHASE_CEREMONY_TIMELINE, {
    ...options,
    destination: { kind: 'world-object', id: 'Bad Destination' },
  }), /destination ID/)
})
