import type { EconomyAmount } from '../content/universes/types'
import { compareAmounts } from '../core/numeric/amount'

export interface RateSample {
  readonly universeId: string
  readonly capturedAtMs: number
  readonly rate: EconomyAmount
}

export type FiveMinuteRateDirection = 'faster' | 'steady' | 'slower' | 'measuring'

const FIVE_MINUTES_MS = 5 * 60_000
const HISTORY_WINDOW_MS = 7 * 60_000

export function recordRateSample(
  samples: readonly RateSample[],
  sample: RateSample,
): readonly RateSample[] {
  if (!Number.isFinite(sample.capturedAtMs)) return samples
  const cutoff = sample.capturedAtMs - HISTORY_WINDOW_MS
  return [...samples.filter(({ capturedAtMs }) => capturedAtMs >= cutoff), sample]
}

export function fiveMinuteRateDirection(
  samples: readonly RateSample[],
  universeId: string,
  nowMs: number,
  currentRate: EconomyAmount,
): FiveMinuteRateDirection {
  const targetMs = nowMs - FIVE_MINUTES_MS
  const baseline = samples
    .filter((sample) => sample.universeId === universeId && sample.capturedAtMs <= targetMs)
    .sort((left, right) => right.capturedAtMs - left.capturedAtMs)[0]
  if (!baseline) return 'measuring'
  const comparison = compareAmounts(currentRate, baseline.rate)
  return comparison > 0 ? 'faster' : comparison < 0 ? 'slower' : 'steady'
}
