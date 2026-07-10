import type { EconomyAmount } from '../content/universes/types'
import { ONE_AMOUNT, gteAmount } from '../core/numeric/amount'

export function welcomeBackEligible(amount: EconomyAmount): boolean {
  return gteAmount(amount, ONE_AMOUNT)
}
