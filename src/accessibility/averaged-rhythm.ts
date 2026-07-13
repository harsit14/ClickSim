export const MIN_AVERAGED_COMPETENT_RATIO = 0.85
export const MAX_AVERAGED_COMPETENT_RATIO = 0.90
export const DEFAULT_AVERAGED_COMPETENT_RATIO = 0.875
/** Competent performed rhythm fills one Omen cycle by its 64-click checkpoint. */
export const AVERAGED_OMEN_ATTRACTION_PER_CLICK = 100 / 64

export interface RhythmPresentationContext {
  readonly audio: 'audible' | 'muted'
  readonly motion: 'full' | 'reduced'
  readonly quality: 'high' | 'balanced' | 'low'
}

export interface AveragedRhythmInput {
  /** Multiplier earned by ordinary competent timing, supplied by balance/engine code. */
  readonly competentMultiplier: number
  /** Multiplier reserved for exceptional timing, supplied by balance/engine code. */
  readonly exceptionalMultiplier: number
  readonly targetCompetentRatio?: number
  /** Presentation context is reported for audit only and never changes eligibility or reward. */
  readonly presentation: RhythmPresentationContext
}

export interface AveragedRhythmResult {
  readonly status: 'ready' | 'invalid-profile'
  readonly rewardMultiplier: number | null
  readonly competentRatio: number | null
  readonly competentGapRatio: number | null
  readonly belowExceptional: boolean
  readonly omenAttractionCharge: number | null
  readonly presentation: RhythmPresentationContext
}

function targetRatio(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return DEFAULT_AVERAGED_COMPETENT_RATIO
  return Math.min(MAX_AVERAGED_COMPETENT_RATIO, Math.max(MIN_AVERAGED_COMPETENT_RATIO, value))
}

/**
 * Produces the non-rhythm accessibility reward from explicit balance multipliers.
 * It never reads input timing, audio, motion, quality, game state, or wall-clock time.
 */
export function averagedRhythmReward(input: AveragedRhythmInput): AveragedRhythmResult {
  const validProfile = Number.isFinite(input.competentMultiplier)
    && input.competentMultiplier > 0
    && Number.isFinite(input.exceptionalMultiplier)
    && input.exceptionalMultiplier > input.competentMultiplier

  if (!validProfile) {
    return {
      status: 'invalid-profile',
      rewardMultiplier: null,
      competentRatio: null,
      competentGapRatio: null,
      belowExceptional: false,
      omenAttractionCharge: null,
      presentation: input.presentation,
    }
  }

  const ratio = targetRatio(input.targetCompetentRatio)
  const rewardMultiplier = input.competentMultiplier * ratio
  return {
    status: 'ready',
    rewardMultiplier,
    competentRatio: ratio,
    competentGapRatio: 1 - ratio,
    belowExceptional: rewardMultiplier < input.exceptionalMultiplier,
    omenAttractionCharge: AVERAGED_OMEN_ATTRACTION_PER_CLICK,
    presentation: input.presentation,
  }
}
