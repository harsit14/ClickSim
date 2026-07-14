import type { UniverseId } from '../src/content/universes/types'
export { FIRST_EPOCH_APPROACH_RATIO } from '../src/content/economy-balance'

/** Phase 0 contracts for the retention work. These are intentionally player outcomes, not tuning knobs. */
export const FIRST_EPOCH_FUNNEL_STEPS = [
  'approach-seen',
  'observatory-opened',
  'comparison-opened',
  'collapse-confirmed',
  'epoch-completed',
  'constellation-purchased',
] as const

export type FirstEpochFunnelStep = typeof FIRST_EPOCH_FUNNEL_STEPS[number]

export const COMPETENT_IDLE_TARGET = {
  beaconCalendarHours: [72, 168],
  maximumDecisionGapHours: 24,
} as const

export interface CompetentIdlePacingResult {
  readonly universeId: UniverseId
  readonly beaconCalendarHours: number | null
  readonly longestDecisionGapHours: number
}

export interface CompetentIdlePacingFinding extends CompetentIdlePacingResult {
  readonly issues: readonly string[]
}

export function evaluateCompetentIdlePacing(
  result: CompetentIdlePacingResult,
): CompetentIdlePacingFinding {
  const issues: string[] = []
  const [minimumHours, maximumHours] = COMPETENT_IDLE_TARGET.beaconCalendarHours

  if (result.beaconCalendarHours === null) {
    issues.push('Beacon was not reached by the competent-idle route')
  } else if (
    !Number.isFinite(result.beaconCalendarHours)
    || result.beaconCalendarHours < minimumHours
    || result.beaconCalendarHours > maximumHours
  ) {
    issues.push('competent-idle completion fell outside the three-to-seven-day target')
  }

  if (
    !Number.isFinite(result.longestDecisionGapHours)
    || result.longestDecisionGapHours > COMPETENT_IDLE_TARGET.maximumDecisionGapHours
  ) {
    issues.push('manager-loop decision gap exceeded one day')
  }

  return { ...result, issues }
}
