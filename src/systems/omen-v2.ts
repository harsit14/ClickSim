import type { UniversePowerUp } from '../content/universes'

export const OMEN_ANNOUNCEMENT_MS = 5_000
export const OMEN_MIN_HIT_SIZE_PX = 44
export const OMEN_MISS_BANK_RATIO = 0.25

export interface OmenRewardPlan {
  readonly durationSeconds: number
  readonly rateSeconds: number
  readonly rewardRatio: number
}

/**
 * One reward contract serves catches and misses. Buff strength never changes;
 * the banked quarter is expressed as quarter-duration and quarter stored rate.
 */
export function planOmenReward(
  power: Pick<UniversePowerUp, 'durationSec' | 'rateSeconds'>,
  durationScale = 1,
  rewardRatio = 1,
): OmenRewardPlan {
  const ratio = Number.isFinite(rewardRatio) ? Math.max(0, Math.min(1, rewardRatio)) : 0
  const scaledDuration = Math.max(0, power.durationSec ?? 0) * Math.max(0, durationScale)
  return {
    durationSeconds: scaledDuration > 0 && ratio > 0
      ? Math.max(1, Math.round(scaledDuration * ratio))
      : 0,
    rateSeconds: Math.max(0, power.rateSeconds ?? 0) * ratio,
    rewardRatio: ratio,
  }
}

/** Position along the authored slow arc; clamped so routes cannot overshoot. */
export function positionOnOmenArc(
  route: Readonly<Pick<import('./power-up-spawn').PowerUpSpawnPlan, 'x' | 'y' | 'endX' | 'endY' | 'arcX' | 'arcY'>>,
  rawProgress: number,
): { readonly x: number; readonly y: number; readonly progress: number } {
  const progress = Number.isFinite(rawProgress) ? Math.max(0, Math.min(1, rawProgress)) : 0
  const bow = Math.sin(progress * Math.PI)
  return {
    x: route.x + (route.endX - route.x) * progress + route.arcX * bow,
    y: route.y + (route.endY - route.y) * progress + route.arcY * bow,
    progress,
  }
}
