import assert from 'node:assert/strict'
import test from 'node:test'
import {
  addScientificPairsSpike,
  assertNormalizedScientificPairSpike,
  fromFiniteV12NumberSpike,
  MAX_SCIENTIFIC_EXPONENT,
  MIN_SCIENTIFIC_EXPONENT,
  multiplyScientificPairsSpike,
  normalizeScientificPairSpike,
  NumericSpikeError,
  parseScientificPairSpike,
  serializeScientificPairSpike,
  subtractScientificPairsSpike,
} from '../src/core/numeric/scientific-pair-spike'
import {
  type FormulaBreakdownPrototype,
  validateFormulaBreakdownPrototype,
} from '../src/core/numeric/formula-breakdown-prototype'

function expectFailure(failure: NumericSpikeError['failure'], action: () => unknown): void {
  assert.throws(action, (error) => error instanceof NumericSpikeError && error.failure === failure)
}

test('canonical scientific strings round-trip exactly, including exponent edges', () => {
  const canonical = [
    '0',
    '1e0',
    '1.25e6',
    '1.23456789012345e6',
    '9.99999999999999e2147483647',
    '1e-12',
    '1e-2147483648',
  ]

  for (const serialized of canonical) {
    const parsed = parseScientificPairSpike(serialized)
    assert.equal(serializeScientificPairSpike(parsed), serialized)
    const json = JSON.stringify({ amount: serializeScientificPairSpike(parsed) })
    assert.equal(serializeScientificPairSpike(parseScientificPairSpike(JSON.parse(json).amount)), serialized)
  }
})

test('normalization is nonnegative, fifteen-digit, and canonical', () => {
  assert.deepEqual(normalizeScientificPairSpike(0, 700), { mantissa: 0, exponent: 0 })
  assert.deepEqual(normalizeScientificPairSpike(12.5, 5), { mantissa: 1.25, exponent: 6 })
  assert.deepEqual(normalizeScientificPairSpike(0.0125, 5), { mantissa: 1.25, exponent: 3 })
  assert.deepEqual(
    normalizeScientificPairSpike(12.34567890123456, 5),
    { mantissa: 1.23456789012346, exponent: 6 },
  )
  assert.equal(
    serializeScientificPairSpike(normalizeScientificPairSpike(1.23456789012345, 6)),
    '1.23456789012345e6',
  )
})

test('signed 32-bit exponent boundaries fail instead of clamping to infinity', () => {
  assert.equal(
    serializeScientificPairSpike(normalizeScientificPairSpike(1, MAX_SCIENTIFIC_EXPONENT)),
    '1e2147483647',
  )
  assert.equal(
    serializeScientificPairSpike(normalizeScientificPairSpike(1, MIN_SCIENTIFIC_EXPONENT)),
    '1e-2147483648',
  )
  expectFailure('exponent-overflow', () => normalizeScientificPairSpike(10, MAX_SCIENTIFIC_EXPONENT))
  expectFailure('exponent-overflow', () => normalizeScientificPairSpike(0.1, MIN_SCIENTIFIC_EXPONENT))
  expectFailure('invalid-exponent', () => normalizeScientificPairSpike(1, 0.5))
})

test('malformed and merely parseable forms are rejected', () => {
  const malformed = [
    '', ' 1e0', '1e0 ', '0e0', '+1e0', '-1e0', '01e0', '1.e0', '1.0e0',
    '1.230e4', '1E0', '1e+0', '1e00', '1e-0', '1e0.5', 'NaN', 'Infinity',
    '1e2147483648', '1e-2147483649', '1.234567890123456e0',
  ]
  for (const serialized of malformed) {
    assert.throws(() => parseScientificPairSpike(serialized), NumericSpikeError, serialized)
  }
})

test('untrusted runtime pairs reject finite and normalization violations', () => {
  const invalidPairs = [
    { mantissa: Number.NaN, exponent: 0 },
    { mantissa: Number.POSITIVE_INFINITY, exponent: 0 },
    { mantissa: -1, exponent: 0 },
    { mantissa: -0, exponent: 0 },
    { mantissa: 0, exponent: 1 },
    { mantissa: 0.5, exponent: 1 },
    { mantissa: 10, exponent: 1 },
    { mantissa: 1, exponent: 1.5 },
    { mantissa: 1.234567890123456, exponent: 0 },
  ]
  for (const amount of invalidPairs) {
    assert.throws(() => assertNormalizedScientificPairSpike(amount), NumericSpikeError)
  }
})

test('representative finite v12 economy numbers convert without mutating saves', () => {
  const representatives = new Map<number, string>([
    [0, '0'],
    [0.1, '1e-1'],
    [15, '1.5e1'],
    [123_456_789.012345, '1.23456789012345e8'],
    [999_999_999_999_999, '9.99999999999999e14'],
    [Number.MAX_VALUE, '1.79769313486232e308'],
    [Number.MIN_VALUE, '4.94065645841247e-324'],
  ])
  for (const [legacy, expected] of representatives) {
    assert.equal(serializeScientificPairSpike(fromFiniteV12NumberSpike(legacy)), expected)
  }
  expectFailure('invalid-mantissa', () => fromFiniteV12NumberSpike(Number.NaN))
  expectFailure('invalid-mantissa', () => fromFiniteV12NumberSpike(Number.POSITIVE_INFINITY))
  expectFailure('negative-v12-balance', () => fromFiniteV12NumberSpike(-1))
})

test('spike arithmetic remains normalized beyond Number.MAX_VALUE and reports failures', () => {
  const huge = multiplyScientificPairsSpike(
    parseScientificPairSpike('9e300'),
    parseScientificPairSpike('9e300'),
  )
  assert.equal(serializeScientificPairSpike(huge), '8.1e601')
  assert.equal(
    serializeScientificPairSpike(addScientificPairsSpike(huge, parseScientificPairSpike('1e500'))),
    '8.1e601',
  )
  assert.equal(
    serializeScientificPairSpike(subtractScientificPairsSpike(parseScientificPairSpike('5e10'), parseScientificPairSpike('2e10'))),
    '3e10',
  )
  expectFailure('negative-result', () => subtractScientificPairsSpike(
    parseScientificPairSpike('1e0'),
    parseScientificPairSpike('2e0'),
  ))
  expectFailure('exponent-overflow', () => multiplyScientificPairsSpike(
    parseScientificPairSpike('1e2147483647'),
    parseScientificPairSpike('1e1'),
  ))
})

test('formula breakdown prototype is serializable, sourced, and finite', () => {
  const breakdown: FormulaBreakdownPrototype = {
    contractVersion: 'formula-breakdown-prototype-v1',
    formulaId: 'emberlight-total-rate',
    universeId: 'emberlight',
    subject: { kind: 'rate', sourceId: 'world-total' },
    evaluatedAtMs: 1_000,
    root: {
      kind: 'operation',
      id: 'total-product',
      label: 'Total production',
      operator: 'product',
      result: { kind: 'economy-amount', value: '3e6' },
      inputs: [
        {
          kind: 'term',
          id: 'base-rate',
          source: { kind: 'base', id: 'kindling-base-rate', label: 'Kindling base rate' },
          value: { kind: 'economy-amount', value: '1e6' },
        },
        {
          kind: 'term',
          id: 'doctrine-multiplier',
          source: {
            kind: 'doctrine',
            id: 'the-forge',
            universeId: 'emberlight',
            label: 'The Forge',
          },
          value: { kind: 'finite-scalar', role: 'multiplier', value: 3 },
        },
      ],
    },
    result: { kind: 'economy-amount', value: '3e6' },
  }
  assert.deepEqual(validateFormulaBreakdownPrototype(breakdown), [])
  assert.deepEqual(JSON.parse(JSON.stringify(breakdown)), breakdown)

  const invalid = {
    ...breakdown,
    evaluatedAtMs: Number.POSITIVE_INFINITY,
    result: { kind: 'finite-scalar', role: 'multiplier', value: Number.NaN },
  } as unknown as FormulaBreakdownPrototype
  assert.ok(validateFormulaBreakdownPrototype(invalid).length >= 2)
})
