import type {
  ContentAmount,
  EconomyAmount,
  SerializedEconomyAmount,
} from '../../content/universes/types'

export type Amount = EconomyAmount
export type SerializedAmount = SerializedEconomyAmount
export type AmountInput = Amount | ContentAmount

export const MIN_AMOUNT_EXPONENT = -2_147_483_648
export const MAX_AMOUNT_EXPONENT = 2_147_483_647

const CANONICAL_PATTERN = /^(?:0|[1-9](?:\.[0-9]{1,14})?e(?:0|-?[1-9][0-9]*))$/
const ALIGNMENT_DIGITS = 16

export type AmountFailure =
  | 'invalid-mantissa'
  | 'invalid-exponent'
  | 'exponent-overflow'
  | 'noncanonical-string'
  | 'division-by-zero'
  | 'negative-result'
  | 'unsafe-number-conversion'

export class AmountError extends Error {
  constructor(readonly failure: AmountFailure, message: string) {
    super(message)
    this.name = 'AmountError'
  }
}

function fail(failure: AmountFailure, message: string): never {
  throw new AmountError(failure, message)
}

function assertExponent(exponent: number): void {
  if (!Number.isInteger(exponent)) {
    fail('invalid-exponent', `Amount exponent must be an integer; received ${String(exponent)}`)
  }
  if (exponent < MIN_AMOUNT_EXPONENT || exponent > MAX_AMOUNT_EXPONENT) {
    fail('exponent-overflow', `Amount exponent ${exponent} is outside the signed 32-bit range`)
  }
}

function createAmount(mantissa: number, exponent: number): Amount {
  return Object.freeze({ mantissa, exponent })
}

export const ZERO_AMOUNT: Amount = createAmount(0, 0)
export const ONE_AMOUNT: Amount = createAmount(1, 0)

/**
 * Trusted normalization used by arithmetic. Inputs are finite JS intermediates,
 * while the returned amount is rounded to the contract's fifteen digits.
 */
function normalize(mantissa: number, exponent: number): Amount {
  if (!Number.isFinite(mantissa) || mantissa < 0) {
    fail('invalid-mantissa', `Amount mantissa must be finite and nonnegative; received ${String(mantissa)}`)
  }
  if (!Number.isInteger(exponent)) {
    fail('invalid-exponent', `Amount exponent must be an integer; received ${String(exponent)}`)
  }
  if (mantissa === 0) return ZERO_AMOUNT

  while (mantissa >= 10) {
    mantissa /= 10
    exponent += 1
  }
  while (mantissa < 1) {
    mantissa *= 10
    exponent -= 1
  }

  mantissa = Number(mantissa.toPrecision(15))
  if (mantissa >= 10) {
    mantissa /= 10
    exponent += 1
  }
  assertExponent(exponent)
  return createAmount(mantissa, exponent)
}

export function assertAmount(value: Amount): Amount {
  assertExponent(value.exponent)
  if (!Number.isFinite(value.mantissa) || value.mantissa < 0 || Object.is(value.mantissa, -0)) {
    fail('invalid-mantissa', `Invalid amount mantissa ${String(value.mantissa)}`)
  }
  if (value.mantissa === 0) {
    if (value.exponent !== 0) fail('invalid-mantissa', 'Zero amount must use exponent zero')
    return value
  }
  if (value.mantissa < 1 || value.mantissa >= 10) {
    fail('invalid-mantissa', `Amount mantissa ${value.mantissa} is not normalized`)
  }
  const clean = normalize(value.mantissa, value.exponent)
  if (clean.mantissa !== value.mantissa || clean.exponent !== value.exponent) {
    fail('invalid-mantissa', 'Amount mantissa exceeds fifteen significant digits')
  }
  return value
}

export function amountFromNumber(value: number): Amount {
  if (!Number.isFinite(value) || value < 0) {
    fail('invalid-mantissa', `Economy number must be finite and nonnegative; received ${String(value)}`)
  }
  return normalize(value, 0)
}

export function parseAmount(serialized: string): Amount {
  if (!CANONICAL_PATTERN.test(serialized)) {
    fail('noncanonical-string', `Invalid canonical economy amount ${JSON.stringify(serialized)}`)
  }
  if (serialized === '0') return ZERO_AMOUNT
  const splitAt = serialized.indexOf('e')
  const mantissa = Number(serialized.slice(0, splitAt))
  const exponent = Number(serialized.slice(splitAt + 1))
  assertExponent(exponent)
  const result = normalize(mantissa, exponent)
  if (serializeAmount(result) !== serialized) {
    fail('noncanonical-string', `Economy amount is not in minimal canonical form: ${serialized}`)
  }
  return result
}

export function serializeAmount(value: Amount): SerializedAmount {
  const amount = assertAmount(value)
  if (amount.mantissa === 0) return '0'
  return `${String(amount.mantissa)}e${String(amount.exponent)}` as SerializedAmount
}

export function toAmount(value: AmountInput): Amount {
  if (typeof value === 'number') return amountFromNumber(value)
  if (typeof value === 'string') return parseAmount(value)
  return assertAmount(value)
}

export function isZeroAmount(value: Amount): boolean {
  return assertAmount(value).mantissa === 0
}

export function compareAmounts(left: Amount, right: Amount): -1 | 0 | 1 {
  assertAmount(left)
  assertAmount(right)
  if (left.mantissa === 0) return right.mantissa === 0 ? 0 : -1
  if (right.mantissa === 0) return 1
  if (left.exponent !== right.exponent) return left.exponent < right.exponent ? -1 : 1
  if (left.mantissa === right.mantissa) return 0
  return left.mantissa < right.mantissa ? -1 : 1
}

export const eqAmount = (left: Amount, right: Amount): boolean => compareAmounts(left, right) === 0
export const ltAmount = (left: Amount, right: Amount): boolean => compareAmounts(left, right) < 0
export const lteAmount = (left: Amount, right: Amount): boolean => compareAmounts(left, right) <= 0
export const gtAmount = (left: Amount, right: Amount): boolean => compareAmounts(left, right) > 0
export const gteAmount = (left: Amount, right: Amount): boolean => compareAmounts(left, right) >= 0

export function addAmounts(left: Amount, right: Amount): Amount {
  assertAmount(left)
  assertAmount(right)
  if (left.mantissa === 0) return right
  if (right.mantissa === 0) return left
  const larger = compareAmounts(left, right) >= 0 ? left : right
  const smaller = larger === left ? right : left
  const gap = larger.exponent - smaller.exponent
  if (gap > ALIGNMENT_DIGITS) return larger
  return normalize(larger.mantissa + smaller.mantissa * 10 ** -gap, larger.exponent)
}

export function subtractAmounts(left: Amount, right: Amount): Amount {
  const comparison = compareAmounts(left, right)
  if (comparison < 0) fail('negative-result', 'Economy amount subtraction cannot produce a negative balance')
  if (comparison === 0) return ZERO_AMOUNT
  if (right.mantissa === 0) return left
  const gap = left.exponent - right.exponent
  if (gap > ALIGNMENT_DIGITS) return left
  return normalize(left.mantissa - right.mantissa * 10 ** -gap, left.exponent)
}

export function multiplyAmounts(left: Amount, right: Amount): Amount {
  assertAmount(left)
  assertAmount(right)
  if (left.mantissa === 0 || right.mantissa === 0) return ZERO_AMOUNT
  return normalize(left.mantissa * right.mantissa, left.exponent + right.exponent)
}

export function divideAmounts(numerator: Amount, denominator: Amount): Amount {
  assertAmount(numerator)
  assertAmount(denominator)
  if (denominator.mantissa === 0) fail('division-by-zero', 'Cannot divide an economy amount by zero')
  if (numerator.mantissa === 0) return ZERO_AMOUNT
  return normalize(
    numerator.mantissa / denominator.mantissa,
    numerator.exponent - denominator.exponent,
  )
}

export function multiplyAmountByNumber(value: Amount, multiplier: number): Amount {
  return multiplyAmounts(value, amountFromNumber(multiplier))
}

export function divideAmountByNumber(value: Amount, divisor: number): Amount {
  return divideAmounts(value, amountFromNumber(divisor))
}

export function amountLog10(value: Amount): number {
  const amount = assertAmount(value)
  if (amount.mantissa === 0) fail('division-by-zero', 'The logarithm of zero is undefined')
  return amount.exponent + Math.log10(amount.mantissa)
}

export function powAmount(base: Amount, power: number): Amount {
  assertAmount(base)
  if (!Number.isFinite(power)) fail('invalid-exponent', `Amount power must be finite; received ${String(power)}`)
  if (power === 0) return ONE_AMOUNT
  if (base.mantissa === 0) {
    if (power < 0) fail('division-by-zero', 'Zero cannot be raised to a negative power')
    return ZERO_AMOUNT
  }
  const logarithm = amountLog10(base) * power
  if (!Number.isFinite(logarithm)) fail('exponent-overflow', 'Amount power exceeds the supported exponent range')
  const exponent = Math.floor(logarithm)
  return normalize(10 ** (logarithm - exponent), exponent)
}

export const sqrtAmount = (value: Amount): Amount => powAmount(value, 0.5)

export function floorAmount(value: Amount): Amount {
  const amount = assertAmount(value)
  if (amount.mantissa === 0 || amount.exponent < 0) return ZERO_AMOUNT
  if (amount.exponent >= 15) return amount
  return amountFromNumber(Math.floor(amount.mantissa * 10 ** amount.exponent))
}

export function ceilAmount(value: Amount): Amount {
  const amount = assertAmount(value)
  if (amount.mantissa === 0 || amount.exponent >= 15) return amount
  if (amount.exponent < 0) return ONE_AMOUNT
  return amountFromNumber(Math.ceil(amount.mantissa * 10 ** amount.exponent))
}

export function minAmount(left: Amount, right: Amount): Amount {
  return compareAmounts(left, right) <= 0 ? left : right
}

export function maxAmount(left: Amount, right: Amount): Amount {
  return compareAmounts(left, right) >= 0 ? left : right
}

export function sumAmounts(values: Iterable<Amount>): Amount {
  let total = ZERO_AMOUNT
  for (const value of values) total = addAmounts(total, value)
  return total
}

/** Strict conversion for proven bounded numeric/UI parameters only. */
export function amountToNumber(value: Amount): number {
  const amount = assertAmount(value)
  if (amount.mantissa === 0) return 0
  const result = amount.mantissa * 10 ** amount.exponent
  if (!Number.isFinite(result) || result === 0) {
    fail('unsafe-number-conversion', `Amount ${serializeAmount(amount)} cannot be represented as a finite number`)
  }
  return result
}

/** Saturating conversion reserved for visual layout, never economy arithmetic. */
export function amountToBoundedNumber(value: Amount): number {
  const amount = assertAmount(value)
  if (amount.mantissa === 0) return 0
  if (amount.exponent > 308) return Number.MAX_VALUE
  if (amount.exponent < -324) return 0
  const result = amount.mantissa * 10 ** amount.exponent
  return Number.isFinite(result) ? result : Number.MAX_VALUE
}
