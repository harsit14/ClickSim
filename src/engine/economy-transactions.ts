import type { EconomyAmount } from '../content/universes/types'
import {
  addAmounts,
  maxAmount,
} from '../core/numeric/amount'

export interface EarningBalances {
  readonly light: EconomyAmount
  readonly totalEarned: EconomyAmount
  readonly allTimeEarned: EconomyAmount
  readonly eraEarned: EconomyAmount
}

export interface PrestigeBalances {
  readonly balance: EconomyAmount
  readonly total: EconomyAmount
  readonly resetCount: number
}

export interface ClickCommit extends EarningBalances {
  readonly clicks: number
  readonly crits: number
  readonly bestCrit: EconomyAmount
}

function incrementSafeCounter(value: number, label: string): number {
  const next = value + 1
  if (!Number.isSafeInteger(next) || next < 0) {
    throw new RangeError(`${label} counter exceeds the safe integer range`)
  }
  return next
}

/** Calculate every fallible earning result before a caller commits any field. */
export function prepareEarnings(
  current: EarningBalances,
  amount: EconomyAmount,
  earnsEra: boolean,
): EarningBalances {
  return {
    light: addAmounts(current.light, amount),
    totalEarned: addAmounts(current.totalEarned, amount),
    allTimeEarned: addAmounts(current.allTimeEarned, amount),
    eraEarned: earnsEra ? addAmounts(current.eraEarned, amount) : current.eraEarned,
  }
}

/** Calculate both prestige balances and the reset counter atomically. */
export function preparePrestigeAward(
  balance: EconomyAmount,
  total: EconomyAmount,
  resetCount: number,
  gain: EconomyAmount,
): PrestigeBalances {
  return {
    balance: addAmounts(balance, gain),
    total: addAmounts(total, gain),
    resetCount: incrementSafeCounter(resetCount, 'prestige'),
  }
}

/** Calculate a single balance award before its related collection marker is changed. */
export function prepareBalanceAward(
  balance: EconomyAmount,
  award: EconomyAmount,
): EconomyAmount {
  return addAmounts(balance, award)
}

/** Calculate click earnings, counters, and best award before changing live state. */
export function prepareClickCommit(
  current: EarningBalances & {
    readonly clicks: number
    readonly crits: number
    readonly bestCrit: EconomyAmount
  },
  power: EconomyAmount,
  crit: boolean,
  earnsEra: boolean,
): ClickCommit {
  const earnings = prepareEarnings(current, power, earnsEra)
  return {
    ...earnings,
    clicks: incrementSafeCounter(current.clicks, 'click'),
    crits: crit ? incrementSafeCounter(current.crits, 'critical click') : current.crits,
    bestCrit: crit ? maxAmount(current.bestCrit, power) : current.bestCrit,
  }
}
