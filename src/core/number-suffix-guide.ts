import type { EconomyAmount } from '../content/universes/types'

export interface NumberSuffixGuide {
  readonly symbol: string
  readonly name: string
  readonly power: number
  readonly explanation: string
}

const LARGE_SUFFIXES: Readonly<Record<number, readonly [string, string]>> = {
  7: ['Sx', 'sextillion'],
  8: ['Sp', 'septillion'],
  9: ['Oc', 'octillion'],
  10: ['No', 'nonillion'],
  11: ['Dc', 'decillion'],
}

/** Returns the shorthand lesson that matches the amount currently on screen. */
export function numberSuffixGuide(amount: EconomyAmount): NumberSuffixGuide | null {
  if (amount.mantissa === 0 || amount.exponent < 21) return null
  const suffixTier = Math.floor(amount.exponent / 3)
  const suffix = LARGE_SUFFIXES[suffixTier]
  if (suffix) {
    const power = suffixTier * 3
    return {
      symbol: suffix[0],
      name: suffix[1],
      power,
      explanation: `${suffix[0]} means ${suffix[1]}, or ten to the power of ${power}. Each new suffix is one thousand times the last.`,
    }
  }
  if (amount.exponent >= 36) {
    return {
      symbol: `e${amount.exponent}`,
      name: 'scientific notation',
      power: amount.exponent,
      explanation: `e${amount.exponent} means multiplied by ten to the power of ${amount.exponent}.`,
    }
  }
  return null
}

