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
  assert.ok(paths.has('rateDelta.mantissa'))
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

test('malformed boundary input and unknown kinds return issues without throwing', () => {
  assert.deepEqual(validateSemanticFeedbackEvent(null), [{
    path: 'event',
    code: 'event.invalid',
    message: 'Expected a semantic feedback event object.',
  }])
  assert.doesNotThrow(() => validateSemanticFeedbackEvent({
    id: 'unknown-event',
    occurredAtMs: 1,
    kind: 'celebration',
    tier: 3,
    source,
    aggregation: 'not-an-object',
  }))

  const issues = validateSemanticFeedbackEvent({
    id: 'unknown-event',
    occurredAtMs: 1,
    kind: 'celebration',
    tier: 3,
    source,
    aggregation: 'not-an-object',
  })
  assert.ok(issues.some((entry) => entry.path === 'kind' && entry.code === 'kind.invalid'))
  assert.ok(issues.some((entry) => (
    entry.path === 'aggregation' && entry.code === 'aggregation.invalid'
  )))
})

test('source, event, audio, timing, and touch fields are validated independently', () => {
  const missingSource = validateSemanticFeedbackEvent({
    ...touchEvent(),
    source: null,
  })
  assert.ok(missingSource.some((entry) => entry.path === 'source'))

  const issues = validateSemanticFeedbackEvent({
    ...touchEvent(),
    id: 'Bad Event ID',
    occurredAtMs: Number.POSITIVE_INFINITY,
    tier: 7,
    source: { universeId: 'unknown', kind: 'button', id: 'Bad Source' },
    audioCue: 'Bad Cue',
    critical: 'yes',
    rhythmBand: 'perfect',
  })
  const paths = new Set(issues.map((entry) => entry.path))
  assert.ok(paths.has('id'))
  assert.ok(paths.has('occurredAtMs'))
  assert.ok(paths.has('tier'))
  assert.ok(paths.has('source.universeId'))
  assert.ok(paths.has('source.kind'))
  assert.ok(paths.has('source.id'))
  assert.ok(paths.has('audioCue'))
  assert.ok(paths.has('critical'))
  assert.ok(paths.has('rhythmBand'))
})

test('every discriminant-specific ID and enum fails at its own path', () => {
  const cases = [
    {
      event: {
        id: 'skill-event', occurredAtMs: 0, kind: 'skill', tier: 2, source,
        skillId: 'Bad Skill', result: 'perfect',
      },
      paths: ['skillId', 'result'],
    },
    {
      event: {
        id: 'discovery-event', occurredAtMs: 0, kind: 'discovery', tier: 3, source,
        discoveryKind: 'secret', discoveredId: 'Bad Discovery',
      },
      paths: ['discoveryKind', 'discoveredId'],
    },
    {
      event: {
        id: 'mastery-event', occurredAtMs: 0, kind: 'mastery', tier: 4, source,
        masteryKind: 'ending', masteredId: 'Bad Mastery',
      },
      paths: ['masteryKind', 'masteredId'],
    },
    {
      event: {
        id: 'epoch-event', occurredAtMs: 0, kind: 'epoch', tier: 5, source,
        boundary: 'prestige', gained: amount(1),
      },
      paths: ['boundary'],
    },
  ] as const

  for (const entry of cases) {
    const paths = new Set(validateSemanticFeedbackEvent(entry.event).map((issue) => issue.path))
    for (const path of entry.paths) assert.ok(paths.has(path), `missing ${path}`)
  }
})

test('EconomyAmount enforces normalization, precision, negative-zero, and exponent bounds', () => {
  const eventWith = (value: unknown) => ({
    id: 'passive-event',
    occurredAtMs: 0,
    kind: 'passive',
    tier: 0,
    source,
    amount: value,
  })

  const validEdges = validateSemanticFeedbackEvent(eventWith({
    mantissa: 9.99999999999999,
    exponent: 2_147_483_647,
  }))
  assert.deepEqual(validEdges, [])

  const invalidAmounts = [
    [{ mantissa: -0, exponent: 0 }, 'amount.mantissa', 'amount.mantissa-invalid'],
    [{ mantissa: -1, exponent: 0 }, 'amount.mantissa', 'amount.not-normalized'],
    [{ mantissa: 10, exponent: 0 }, 'amount.mantissa', 'amount.not-normalized'],
    [{ mantissa: 1.234567890123456, exponent: 0 }, 'amount.mantissa', 'amount.precision-exceeded'],
    [{ mantissa: 1, exponent: 2_147_483_648 }, 'amount.exponent', 'amount.exponent-invalid'],
    [{ mantissa: 1, exponent: 1.5 }, 'amount.exponent', 'amount.exponent-invalid'],
    [{ mantissa: 1, exponent: -0 }, 'amount.exponent', 'amount.exponent-invalid'],
    [{ mantissa: '1', exponent: 0 }, 'amount.mantissa', 'amount.mantissa-invalid'],
  ] as const

  for (const [value, path, code] of invalidAmounts) {
    assert.doesNotThrow(() => validateSemanticFeedbackEvent(eventWith(value)))
    assert.ok(validateSemanticFeedbackEvent(eventWith(value)).some((entry) => (
      entry.path === path && entry.code === code
    )))
  }
})

test('purchase aggregation fails closed on invalid IDs, times, amounts, and optional IDs', () => {
  const input = {
    eventId: 'valid-purchase',
    occurredAtMs: 10,
    source,
    mode: 'one' as const,
    quantity: 1,
    totalCost: amount(1),
    totalRateDelta: amount(1),
  }

  assert.throws(
    () => aggregatePurchaseFeedback({ ...input, eventId: 'Bad Event' }),
    /id: Expected a stable lowercase hyphenated ID/,
  )
  assert.throws(
    () => aggregatePurchaseFeedback({ ...input, occurredAtMs: Number.NaN }),
    /occurredAtMs: Expected a finite caller-supplied timestamp/,
  )
  assert.throws(
    () => aggregatePurchaseFeedback({
      ...input,
      totalCost: { mantissa: -0, exponent: 0 },
    }),
    /cost\.mantissa: Mantissa must be finite, nonnegative, and cannot be negative zero/,
  )
  assert.throws(
    () => aggregatePurchaseFeedback({
      ...input,
      totalRateDelta: { mantissa: 1, exponent: 2_147_483_648 },
    }),
    /rateDelta\.exponent: Exponent must be an integer in the signed 32-bit range/,
  )
  assert.throws(
    () => aggregatePurchaseFeedback({ ...input, audioCue: 'Bad Cue' }),
    /audioCue: Expected a stable lowercase hyphenated ID/,
  )
})

function touchEvent(): SemanticFeedbackEvent {
  return {
    id: 'touch-event',
    occurredAtMs: 100,
    kind: 'touch',
    tier: 1,
    source,
    amount: amount(1),
    critical: false,
    rhythmBand: null,
  }
}
