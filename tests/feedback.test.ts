import assert from 'node:assert/strict'
import test from 'node:test'
import type {
  EconomyAmount,
  FeedbackSource,
  PurchaseFeedbackEvent,
} from '../src/content/universes/types'
import {
  SEMANTIC_FEEDBACK_REGISTRY,
  aggregatePurchaseFeedback,
  describeSemanticFeedback,
  validateSemanticFeedbackEvent,
} from '../src/feedback'

const source: FeedbackSource = {
  universeId: 'emberlight',
  kind: 'generator',
  id: 'kindling-01',
}

const amount = (mantissa: number, exponent = 0): EconomyAmount => ({ mantissa, exponent })

function purchase(mode: 'one' | 'ten' | 'max', quantity: number): readonly [PurchaseFeedbackEvent] {
  return aggregatePurchaseFeedback({
    eventId: `buy-kindling-${mode}`,
    occurredAtMs: 12_345,
    source,
    mode,
    quantity,
    totalCost: amount(1.5, 3),
    totalRateDelta: amount(2.5, 2),
    audioCue: 'buy-kindling-cue',
  })
}

test('semantic registry exhaustively assigns tier, magnitude, and aggregation meaning', () => {
  assert.deepEqual(Object.keys(SEMANTIC_FEEDBACK_REGISTRY).sort(), [
    'discovery',
    'epoch',
    'mastery',
    'passive',
    'purchase',
    'skill',
    'touch',
  ])

  const [event] = purchase('ten', 10)
  const description = describeSemanticFeedback(event)
  assert.deepEqual(description.source, source)
  assert.equal(description.tier, 1)
  assert.deepEqual(description.magnitude, {
    kind: 'purchase-delta',
    quantity: 10,
    cost: amount(1.5, 3),
    rateDelta: amount(2.5, 2),
  })
  assert.equal(description.aggregation?.count, 10)
})

test('one, ten, and max purchase actions each emit exactly one deterministic event', () => {
  const modes = [
    ['one', 1],
    ['ten', 10],
    ['max', 37],
  ] as const

  for (const [mode, quantity] of modes) {
    const first = purchase(mode, quantity)
    const second = purchase(mode, quantity)
    assert.equal(first.length, 1)
    assert.deepEqual(first, second)
    assert.equal(first[0].quantity, quantity)
    assert.deepEqual(validateSemanticFeedbackEvent(first[0]), [])

    if (mode === 'one') {
      assert.equal(first[0].aggregation, undefined)
    } else {
      assert.deepEqual(first[0].aggregation, {
        key: `purchase:emberlight:generator:kindling-01:${mode}`,
        count: quantity,
        windowMs: 0,
      })
    }
  }
})

test('bulk helper refuses ambiguous quantities and non-purchase sources', () => {
  assert.throws(() => purchase('one', 2), /requires quantity 1/)
  assert.throws(() => purchase('ten', 9), /requires quantity 10/)
  assert.throws(() => aggregatePurchaseFeedback({
    eventId: 'bad-source',
    occurredAtMs: 0,
    source: { universeId: 'emberlight', kind: 'system', id: 'shop' },
    mode: 'one',
    quantity: 1,
    totalCost: amount(1),
    totalRateDelta: amount(1),
  }), /cannot use source kind "system"/)
})

test('semantic validation reports actionable tier, amount, and aggregation paths', () => {
  const [valid] = purchase('ten', 10)
  const invalid = {
    ...valid,
    tier: 5,
    rateDelta: { mantissa: Number.NaN, exponent: 0 },
    aggregation: { key: '', count: 9, windowMs: -1 },
  } as unknown as PurchaseFeedbackEvent

  const issues = validateSemanticFeedbackEvent(invalid)
  const paths = new Set(issues.map((entry) => entry.path))
  assert.ok(paths.has('tier'))
  assert.ok(paths.has('rateDelta'))
  assert.ok(paths.has('aggregation.key'))
  assert.ok(paths.has('aggregation.count'))
  assert.ok(paths.has('aggregation.windowMs'))
})

test('authored discovery and mastery events cannot be collapsed into a bulk ceremony', () => {
  const issues = validateSemanticFeedbackEvent({
    id: 'first-archive',
    occurredAtMs: 100,
    kind: 'discovery',
    tier: 3,
    source: { universeId: 'emberlight', kind: 'archive', id: 'archive-1' },
    aggregation: { key: 'archive', count: 2, windowMs: 100 },
    discoveryKind: 'archive',
    discoveredId: 'archive-1',
  })

  assert.ok(issues.some((entry) => (
    entry.path === 'aggregation' && entry.code === 'aggregation.forbidden'
  )))
})
