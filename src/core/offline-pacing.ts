import type { EconomyAmount } from '../content/universes/types'
import { ZERO_AMOUNT } from './numeric/amount'

export const BASE_OFFLINE_EFFICIENCY = 0.5
export const BASE_OFFLINE_CAP_HOURS = 12

export interface OfflineProgressPlan {
  readonly elapsedSeconds: number
  readonly countedSeconds: number
  readonly efficiency: number
  readonly equivalentActiveSeconds: number
}

export interface OfflineReturnSummary extends OfflineProgressPlan {
  readonly gain: EconomyAmount
  readonly capReached: boolean
}

/** Pure return-session pacing plan shared by loading and balance studies. */
export function planOfflineProgress(
  elapsedSeconds: number,
  efficiencyBonus = 0,
  capBonusHours = 0,
): OfflineProgressPlan {
  if (![elapsedSeconds, efficiencyBonus, capBonusHours].every(Number.isFinite)) {
    throw new RangeError('Offline pacing inputs must be finite')
  }
  const elapsed = Math.max(0, elapsedSeconds)
  const efficiency = Math.max(0, Math.min(1, BASE_OFFLINE_EFFICIENCY + efficiencyBonus))
  const capSeconds = Math.max(0, BASE_OFFLINE_CAP_HOURS + capBonusHours) * 3_600
  const countedSeconds = Math.min(elapsed, capSeconds)
  return {
    elapsedSeconds: elapsed,
    countedSeconds,
    efficiency,
    equivalentActiveSeconds: countedSeconds * efficiency,
  }
}

export function summarizeOfflineReturn(
  gain: EconomyAmount,
  plan: OfflineProgressPlan,
): OfflineReturnSummary {
  return {
    ...plan,
    gain,
    capReached: plan.countedSeconds < plan.elapsedSeconds,
  }
}

export const EMPTY_OFFLINE_RETURN: OfflineReturnSummary = summarizeOfflineReturn(
  ZERO_AMOUNT,
  planOfflineProgress(0),
)
