import type { SemanticMessage } from '../accessibility/announcements'
import type { FocusReturnDescriptor } from '../accessibility/focus'
import type {
  ResetCategory,
  ResetComparison,
  RecoveryEstimateInputs,
} from './reset-comparison'

export interface ResetComparisonSection {
  readonly id: 'lost' | 'temporarily-replaced' | 'retained' | 'parked'
  readonly labelKey: string
  readonly items: readonly ResetCategory[]
}

export interface ResetRecoveryUiModel {
  readonly status: ResetComparison['recovery']['status']
  readonly reason: ResetComparison['recovery']['reason']
  readonly inputs: RecoveryEstimateInputs | null
}

export interface ResetComparisonCardModel {
  readonly boundary: ResetComparison['boundary']
  readonly actionLabelKey: string
  readonly resultKey: string
  readonly requiresExplicitConfirmation: boolean
  readonly sections: readonly ResetComparisonSection[]
  readonly recovery: ResetRecoveryUiModel
}

export type ResetCardAction = 'confirm' | 'cancel'

export interface ResetCardDecision {
  readonly action: ResetCardAction
  readonly boundary: ResetComparison['boundary']
  readonly focusReturn: FocusReturnDescriptor
  readonly announcement: SemanticMessage
}

export function buildResetComparisonCardModel(
  comparison: ResetComparison,
): ResetComparisonCardModel {
  return {
    boundary: comparison.boundary,
    actionLabelKey: comparison.actionLabelKey,
    resultKey: comparison.resultKey,
    requiresExplicitConfirmation: comparison.requiresExplicitConfirmation,
    sections: [
      { id: 'lost', labelKey: 'reset.section.lost', items: comparison.lost },
      {
        id: 'temporarily-replaced',
        labelKey: 'reset.section.temporarily-replaced',
        items: comparison.temporarilyReplaced,
      },
      { id: 'retained', labelKey: 'reset.section.retained', items: comparison.retained },
      { id: 'parked', labelKey: 'reset.section.parked', items: comparison.parked },
    ],
    recovery: comparison.recovery,
  }
}

/** Creates an interaction description only; confirming never performs a reset. */
export function describeResetCardDecision(
  comparison: ResetComparison,
  action: ResetCardAction,
  focusReturn: FocusReturnDescriptor,
): ResetCardDecision {
  return {
    action,
    boundary: comparison.boundary,
    focusReturn,
    announcement: {
      key: action === 'confirm'
        ? 'announcement.reset-confirm-requested'
        : 'announcement.reset-cancelled',
      parameters: { boundary: comparison.boundary },
    },
  }
}
