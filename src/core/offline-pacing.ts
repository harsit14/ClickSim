export const BASE_OFFLINE_EFFICIENCY = 0.5
export const BASE_OFFLINE_CAP_HOURS = 6

export interface OfflineProgressPlan {
  readonly elapsedSeconds: number
  readonly countedSeconds: number
  readonly efficiency: number
  readonly equivalentActiveSeconds: number
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
