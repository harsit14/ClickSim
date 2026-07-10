import type { EconomyAmount } from '../content/universes/types'
import {
  amountFromNumber,
  amountLog10,
  amountToNumber,
  assertAmount,
  isZeroAmount,
} from './numeric/amount'

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']

export type AmountNotation = 'standard' | 'scientific' | 'engineering' | 'logarithmic'

export interface AmountFormatOptions {
  readonly notation?: AmountNotation
  readonly significantDigits?: number
}

function displayDigits(significantDigits: number): number {
  if (!Number.isInteger(significantDigits) || significantDigits < 1 || significantDigits > 15) {
    throw new RangeError('significantDigits must be an integer from 1 through 15')
  }
  return significantDigits
}

function trimCoefficient(value: number, significantDigits: number): string {
  return Number(value.toPrecision(significantDigits)).toString()
}

function scientific(amount: EconomyAmount, significantDigits: number): string {
  let mantissa = amount.mantissa
  let exponent = amount.exponent
  mantissa = Number(mantissa.toPrecision(significantDigits))
  if (mantissa >= 10) {
    mantissa /= 10
    exponent += 1
  }
  return `${String(mantissa)}e${String(exponent)}`
}

function engineering(amount: EconomyAmount, significantDigits: number): string {
  let exponent = Math.floor(amount.exponent / 3) * 3
  let coefficient = amount.mantissa * 10 ** (amount.exponent - exponent)
  coefficient = Number(coefficient.toPrecision(significantDigits))
  if (coefficient >= 1_000) {
    coefficient /= 1_000
    exponent += 3
  }
  return `${String(coefficient)}e${String(exponent)}`
}

function standard(amount: EconomyAmount): string {
  if (amount.exponent < 3) {
    if (amount.exponent < -323) return scientific(amount, 3)
    const value = amountToNumber(amount)
    if (Number.isInteger(value)) return value.toString()
    return value < 10 ? value.toFixed(1) : Math.floor(value).toString()
  }
  if (amount.exponent >= 36) return scientific(amount, 3)

  let suffixTier = Math.floor(amount.exponent / 3)
  let coefficient = amount.mantissa * 10 ** (amount.exponent - suffixTier * 3)
  const decimals = coefficient >= 100 ? 0 : coefficient >= 10 ? 1 : 2
  coefficient = Number(coefficient.toFixed(decimals))
  if (coefficient >= 1_000) {
    coefficient /= 1_000
    suffixTier += 1
  }
  if (suffixTier >= SUFFIXES.length) return scientific(amount, 3)
  return `${coefficient.toFixed(coefficient >= 100 ? 0 : coefficient >= 10 ? 1 : 2)}${SUFFIXES[suffixTier]}`
}

export function formatAmount(
  value: EconomyAmount,
  options: AmountFormatOptions = {},
): string {
  const amount = assertAmount(value)
  if (isZeroAmount(amount)) return '0'
  const notation = options.notation ?? 'standard'
  const significantDigits = displayDigits(options.significantDigits ?? 3)
  if (notation === 'scientific') return scientific(amount, significantDigits)
  if (notation === 'engineering') return engineering(amount, significantDigits)
  if (notation === 'logarithmic') {
    return `10^${trimCoefficient(amountLog10(amount), Math.min(15, significantDigits + 1))}`
  }
  return standard(amount)
}

/** Existing UI entry point; finite numbers are converted at the display boundary. */
export function format(value: number | EconomyAmount): string {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '∞'
    if (value < 0) return `-${formatAmount(amountFromNumber(-value))}`
    return formatAmount(amountFromNumber(value))
  }
  return formatAmount(value)
}
