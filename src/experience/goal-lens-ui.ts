import {
  recommendGoals,
  togglePinnedGoal,
  type GoalLensInput,
  type GoalLensResult,
  type GoalRecommendation,
} from './goals'

export type GoalLensPresentationMode = 'standard' | 'active-rhythm' | 'minimalist'

export interface GoalLensUiInput {
  readonly goals: GoalLensInput
  readonly presentationMode: GoalLensPresentationMode
}

export interface GoalLensUiSlot {
  readonly id: 'now' | 'soon' | 'pinned'
  readonly labelKey: string
  readonly recommendation: GoalRecommendation | null
}

export interface GoalLensUiModel {
  readonly visibility: 'hidden' | 'collapsed' | 'expanded'
  readonly hiddenReason: 'feature-off' | 'minimalist' | null
  readonly result: GoalLensResult
  readonly slots: readonly GoalLensUiSlot[]
}

/** Adapts the pure recommendation result to the three stable UI slots. */
export function buildGoalLensUiModel(input: GoalLensUiInput): GoalLensUiModel {
  const result = recommendGoals(input.goals)
  const slots: readonly GoalLensUiSlot[] = [
    { id: 'now', labelKey: 'goal-lens.slot.now', recommendation: result.now },
    { id: 'soon', labelKey: 'goal-lens.slot.soon', recommendation: result.soon },
    { id: 'pinned', labelKey: 'goal-lens.slot.pinned', recommendation: result.pinned },
  ]

  if (!input.goals.enabled) {
    return { visibility: 'hidden', hiddenReason: 'feature-off', result, slots }
  }
  if (input.presentationMode === 'minimalist') {
    return { visibility: 'hidden', hiddenReason: 'minimalist', result, slots }
  }
  if (input.presentationMode === 'active-rhythm') {
    return { visibility: 'collapsed', hiddenReason: null, result, slots }
  }
  return { visibility: 'expanded', hiddenReason: null, result, slots }
}

/** Returns caller-owned pin state; it never writes a preference or save. */
export function nextGoalPin(currentGoalId: string | null, selectedGoalId: string): string | null {
  return togglePinnedGoal(currentGoalId, selectedGoalId)
}
