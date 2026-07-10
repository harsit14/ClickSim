import assert from 'node:assert/strict'
import test from 'node:test'
import type { SemanticFeedbackEvent } from '../src/content/universes/types'
import {
  aggregatePurchaseFeedback,
  dispatchSemanticFeedback,
} from '../src/feedback'

const purchase = aggregatePurchaseFeedback({
  eventId: 'purchase-event',
  occurredAtMs: 100,
  source: { universeId: 'emberlight', kind: 'generator', id: 'kindling-01' },
  mode: 'ten',
  quantity: 10,
  totalCost: { mantissa: 1, exponent: 3 },
  totalRateDelta: { mantissa: 1, exponent: 2 },
})[0]

const discovery: SemanticFeedbackEvent = {
  id: 'discovery-event',
  occurredAtMs: 110,
  kind: 'discovery',
  tier: 3,
  source: { universeId: 'emberlight', kind: 'archive', id: 'archive-01' },
  discoveryKind: 'archive',
  discoveredId: 'archive-01',
}

test('fan-out delivers every event by original reference to every consumer', () => {
  const visual: SemanticFeedbackEvent[] = []
  const audio: SemanticFeedbackEvent[] = []
  const captions: SemanticFeedbackEvent[] = []
  const events = [purchase, discovery]
  const result = dispatchSemanticFeedback(events, [
    { id: 'visual', consume: (event) => visual.push(event) },
    { id: 'audio', consume: (event) => audio.push(event) },
    { id: 'captions', consume: (event) => captions.push(event) },
  ])

  assert.deepEqual(result.events, events)
  assert.strictEqual(result.events[0], purchase)
  assert.strictEqual(result.events[1], discovery)
  assert.deepEqual(visual, events)
  assert.deepEqual(audio, events)
  assert.deepEqual(captions, events)
  assert.equal(result.receipts.length, events.length * 3)
  assert.ok(result.receipts.every((receipt) => receipt.delivered))
})

test('one failing consumer cannot prevent later consumers or later events', () => {
  const delivered: string[] = []
  const result = dispatchSemanticFeedback([purchase, discovery], [
    {
      id: 'fragile',
      consume: (event) => {
        if (event.id === purchase.id) throw new Error('sink unavailable')
        delivered.push(`fragile:${event.id}`)
      },
    },
    { id: 'durable', consume: (event) => delivered.push(`durable:${event.id}`) },
  ])

  assert.deepEqual(delivered, [
    `durable:${purchase.id}`,
    `fragile:${discovery.id}`,
    `durable:${discovery.id}`,
  ])
  assert.deepEqual(result.receipts[0], {
    eventId: purchase.id,
    consumerId: 'fragile',
    delivered: false,
    error: 'sink unavailable',
  })
  assert.deepEqual(result.events, [purchase, discovery])
})

test('invalid batches fail before any consumer receives a partial delivery', () => {
  const delivered: SemanticFeedbackEvent[] = []
  const invalid = { ...discovery, discoveredId: 'Bad ID' } as SemanticFeedbackEvent
  assert.throws(() => dispatchSemanticFeedback([purchase, invalid], [
    { id: 'visual', consume: (event) => delivered.push(event) },
  ]), /Invalid semantic feedback event at index 1/)
  assert.deepEqual(delivered, [])
})

test('duplicate consumer IDs fail closed', () => {
  assert.throws(() => dispatchSemanticFeedback([purchase], [
    { id: 'visual', consume: () => undefined },
    { id: 'visual', consume: () => undefined },
  ]), /Duplicate feedback consumer ID/)
})
