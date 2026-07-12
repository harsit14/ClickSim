import type { SemanticMessage } from '../accessibility/announcements'
import type { FocusReturnDescriptor } from '../accessibility/focus'
import type {
  ResetCategory,
  ResetComparison,
  RecoveryEstimateInputs,
  ResetScope,
} from './reset-comparison'

export interface ResetComparisonScopeGroup {
  readonly scope: ResetScope
  readonly labelKey: string
  readonly items: readonly ResetCategory[]
}

export interface ResetComparisonSection {
  readonly id: 'lost' | 'temporarily-replaced' | 'retained' | 'parked'
  readonly labelKey: string
  readonly items: readonly ResetCategory[]
  readonly groups: readonly ResetComparisonScopeGroup[]
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
  readonly reward: ResetComparison['reward']
}

export type ResetCardAction = 'confirm' | 'cancel'

const SCOPE_ORDER: readonly ResetScope[] = ['world', 'epoch', 'deep-history', 'between', 'external']

function groupByScope(items: readonly ResetCategory[]): readonly ResetComparisonScopeGroup[] {
  return SCOPE_ORDER.flatMap((scope) => {
    const scoped = items.filter((item) => item.scope === scope)
    return scoped.length > 0 ? [{ scope, labelKey: `reset.scope.${scope}`, items: scoped }] : []
  })
}

function section(
  id: ResetComparisonSection['id'],
  labelKey: string,
  items: readonly ResetCategory[],
): ResetComparisonSection {
  return { id, labelKey, items, groups: groupByScope(items) }
}

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
      section('lost', 'reset.section.lost', comparison.lost),
      section(
        'temporarily-replaced',
        'reset.section.temporarily-replaced',
        comparison.temporarilyReplaced,
      ),
      section('retained', 'reset.section.retained', comparison.retained),
      section('parked', 'reset.section.parked', comparison.parked),
    ],
    recovery: comparison.recovery,
    reward: comparison.reward,
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
