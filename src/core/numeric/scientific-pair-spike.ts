/**
 * NUM-001 isolated spike for the F0-approved scientific-pair contract.
 *
 * This module is intentionally not wired into saves, formatting, compute, or the
 * live game. It exists only to make the proposed v13 boundary executable in
 * tests before that migration is authorized.
 */
import type { EconomyAmount } from '../../content/universes/types'

export type ScientificPairSpike = EconomyAmount
export type CanonicalScientificStringSpike = '0' | `${number}e${number}`

export const MIN_SCIENTIFIC_EXPONENT = -2_147_483_648
export const MAX_SCIENTIFIC_EXPONENT = 2_147_483_647

const CANONICAL_AMOUNT_PATTERN = /^(?:0|[1-9](?:\.[0-9]{1,14})?e(?:0|-?[1-9][0-9]*))$/
const ALIGNMENT_PRECISION_DIGITS = 15

export type NumericSpikeFailure =
  | 'invalid-mantissa'
  | 'invalid-exponent'
  | 'exponent-overflow'
  | 'noncanonical-string'
  | 'negative-v12-balance'
  | 'negative-result'

export class NumericSpikeError extends Error {
  constructor(readonly failure: NumericSpikeFailure, message: string) {
    super(message)
    this.name = 'NumericSpikeError'
  }
}

function fail(failure: NumericSpikeFailure, message: string): never {
  throw new NumericSpikeError(failure, message)
}

function assertInt32Exponent(exponent: number): void {
  if (!Number.isInteger(exponent)) {
    fail('invalid-exponent', `Exponent must be an integer; received ${String(exponent)}`)
  }
  if (exponent < MIN_SCIENTIFIC_EXPONENT || exponent > MAX_SCIENTIFIC_EXPONENT) {
    fail('exponent-overflow', `Exponent ${exponent} is outside the signed 32-bit range`)
  }
}

function pair(mantissa: number, exponent: number): ScientificPairSpike {
  return Object.freeze({ mantissa, exponent })
}

/** Normalize and round a nonnegative amount to fifteen significant digits. */
export function normalizeScientificPairSpike(
  mantissa: number,
  exponent: number,
): ScientificPairSpike {
  assertInt32Exponent(exponent)
  if (!Number.isFinite(mantissa) || mantissa < 0) {
    fail('invalid-mantissa', `Mantissa must be finite and nonnegative; received ${String(mantissa)}`)
  }
  if (mantissa === 0) return pair(0, 0)

  // Number#toExponential performs the one deliberate precision reduction in
  // this spike: one leading digit plus fourteen fractional digits.
  const rounded = mantissa.toExponential(14)
  const match = /^([0-9](?:\.[0-9]+)?)e([+-][0-9]+)$/.exec(rounded)
  if (!match) fail('invalid-mantissa', `Could not normalize mantissa ${mantissa}`)

  const normalizedMantissa = Number(match[1])
  const normalizedExponent = exponent + Number(match[2])
  assertInt32Exponent(normalizedExponent)
  if (
    !Number.isFinite(normalizedMantissa)
    || normalizedMantissa < 1
    || normalizedMantissa >= 10
  ) {
    fail('invalid-mantissa', `Normalization produced invalid mantissa ${normalizedMantissa}`)
  }
  return pair(normalizedMantissa, normalizedExponent)
}

/** Reject rather than silently repair an unnormalized runtime pair. */
export function assertNormalizedScientificPairSpike(
  amount: ScientificPairSpike,
): ScientificPairSpike {
  assertInt32Exponent(amount.exponent)
  if (!Number.isFinite(amount.mantissa) || amount.mantissa < 0 || Object.is(amount.mantissa, -0)) {
    fail('invalid-mantissa', `Invalid runtime mantissa ${String(amount.mantissa)}`)
  }
  if (amount.mantissa === 0) {
    if (amount.exponent !== 0) fail('invalid-mantissa', 'Zero must use exponent zero')
    return amount
  }
  if (amount.mantissa < 1 || amount.mantissa >= 10) {
    fail('invalid-mantissa', `Mantissa ${amount.mantissa} is not normalized`)
  }
  const normalized = normalizeScientificPairSpike(amount.mantissa, amount.exponent)
  if (normalized.mantissa !== amount.mantissa || normalized.exponent !== amount.exponent) {
    fail('invalid-mantissa', 'Mantissa contains more than fifteen significant digits')
  }
  return amount
}

export function serializeScientificPairSpike(
  amount: ScientificPairSpike,
): CanonicalScientificStringSpike {
  const normalized = assertNormalizedScientificPairSpike(amount)
  if (normalized.mantissa === 0) return '0'
  return `${String(normalized.mantissa)}e${String(normalized.exponent)}` as CanonicalScientificStringSpike
}

export function parseScientificPairSpike(serialized: string): ScientificPairSpike {
  if (!CANONICAL_AMOUNT_PATTERN.test(serialized)) {
    fail('noncanonical-string', `Invalid canonical economy amount ${JSON.stringify(serialized)}`)
  }
  if (serialized === '0') return pair(0, 0)

  const separator = serialized.indexOf('e')
  const mantissa = Number(serialized.slice(0, separator))
  const exponent = Number(serialized.slice(separator + 1))
  assertInt32Exponent(exponent)
  const amount = normalizeScientificPairSpike(mantissa, exponent)
  if (serializeScientificPairSpike(amount) !== serialized) {
    fail('noncanonical-string', `Economy amount is not in minimal canonical form: ${serialized}`)
  }
  return amount
}

/** Convert one already-validated v12 economy balance without touching a save. */
export function fromFiniteV12NumberSpike(value: number): ScientificPairSpike {
  if (!Number.isFinite(value)) {
    fail('invalid-mantissa', `v12 economy value must be finite; received ${String(value)}`)
  }
  if (value < 0) {
    fail('negative-v12-balance', `v12 economy balance must be nonnegative; received ${value}`)
  }
  return normalizeScientificPairSpike(value, 0)
}

export function compareScientificPairsSpike(
  left: ScientificPairSpike,
  right: ScientificPairSpike,
): -1 | 0 | 1 {
  assertNormalizedScientificPairSpike(left)
  assertNormalizedScientificPairSpike(right)
  if (left.mantissa === 0) return right.mantissa === 0 ? 0 : -1
  if (right.mantissa === 0) return 1
  if (left.exponent !== right.exponent) return left.exponent < right.exponent ? -1 : 1
  if (left.mantissa === right.mantissa) return 0
  return left.mantissa < right.mantissa ? -1 : 1
}

/** Demonstrates pair arithmetic ergonomics; this is not the F1b numeric API. */
export function addScientificPairsSpike(
  left: ScientificPairSpike,
  right: ScientificPairSpike,
): ScientificPairSpike {
  assertNormalizedScientificPairSpike(left)
  assertNormalizedScientificPairSpike(right)
  if (left.mantissa === 0) return pair(right.mantissa, right.exponent)
  if (right.mantissa === 0) return pair(left.mantissa, left.exponent)

  const larger = compareScientificPairsSpike(left, right) >= 0 ? left : right
  const smaller = larger === left ? right : left
  const exponentGap = larger.exponent - smaller.exponent
  if (exponentGap >= ALIGNMENT_PRECISION_DIGITS) {
    return pair(larger.mantissa, larger.exponent)
  }
  const alignedMantissa = larger.mantissa + smaller.mantissa * 10 ** -exponentGap
  return normalizeScientificPairSpike(alignedMantissa, larger.exponent)
}

/** Demonstrates an operation that can report the contract's exponent failure. */
export function multiplyScientificPairsSpike(
  left: ScientificPairSpike,
  right: ScientificPairSpike,
): ScientificPairSpike {
  assertNormalizedScientificPairSpike(left)
  assertNormalizedScientificPairSpike(right)
  if (left.mantissa === 0 || right.mantissa === 0) return pair(0, 0)
  return normalizeScientificPairSpike(
    left.mantissa * right.mantissa,
    left.exponent + right.exponent,
  )
}

export function subtractScientificPairsSpike(
  left: ScientificPairSpike,
  right: ScientificPairSpike,
): ScientificPairSpike {
  const comparison = compareScientificPairsSpike(left, right)
  if (comparison < 0) fail('negative-result', 'Economy balances cannot become negative')
  if (comparison === 0) return pair(0, 0)
  if (right.mantissa === 0) return pair(left.mantissa, left.exponent)

  const exponentGap = left.exponent - right.exponent
  if (exponentGap >= ALIGNMENT_PRECISION_DIGITS) return pair(left.mantissa, left.exponent)
  return normalizeScientificPairSpike(
    left.mantissa - right.mantissa * 10 ** -exponentGap,
    left.exponent,
  )
}
