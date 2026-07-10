export type ProgressionBoundary =
  | 'enter-trial'
  | 'epoch-turn'
  | 'deep-collapse'
  | 'remembrance'
  | 'crossing'
  | 'light-beacon'
  | 'atlas-route'
  | 'full-wipe'

export type ResetScope = 'world' | 'epoch' | 'deep-history' | 'between' | 'external'

export type ResetCategoryId =
  | 'world-currency'
  | 'run-earnings'
  | 'kindlings'
  | 'ordinary-upgrades'
  | 'buy-mode'
  | 'trial-return-snapshot'
  | 'epoch-matter'
  | 'epoch-doctrines'
  | 'epoch-works'
  | 'era-earnings'
  | 'epoch-turn-count'
  | 'deep-currency'
  | 'deep-laws'
  | 'deep-works'
  | 'local-trials'
  | 'local-automation'
  | 'local-echoes'
  | 'local-archive'
  | 'local-story-seen-sequence'
  | 'local-records'
  | 'current-answer'
  | 'deep-collapse-count'
  | 'progressive-ui'
  | 'beacons'
  | 'dark-between'
  | 'wayfinder-laws'
  | 'vessel'
  | 'global-achievements'
  | 'presentation-preferences'
  | 'playtime-and-all-world-earnings'
  | 'historical-answers'
  | 'remembrance-count'
  | 'chronicle'
  | 'garden'
  | 'atlas-unlocks'
  | 'other-parked-universe-runs'
  | 'atlas-route-state'
  | 'atlas-route-record'
  | 'external-export'

export interface ResetCategory {
  readonly id: ResetCategoryId
  readonly scope: ResetScope
  readonly labelKey: string
}

export interface RecoveryEstimateInputs {
  readonly currentFrontierRate: string
  readonly postBoundaryStartingRate: string
  readonly projectedRecoveredRate: string
  readonly estimatedRecoveryMs: number | null
  readonly basis: 'simulation' | 'history' | 'unavailable'
  readonly detailKey: string
}

export interface RecoveryEstimateReport {
  readonly status: 'estimated' | 'unavailable' | 'not-applicable'
  readonly reason: 'caller-estimate' | 'missing-estimate' | 'invalid-estimate' | 'boundary-does-not-reset-run'
  readonly inputs: RecoveryEstimateInputs | null
}

export interface ResetComparisonInput {
  readonly boundary: ProgressionBoundary
  readonly recovery?: RecoveryEstimateInputs | null
  /** Atlas route-only state is either discarded or archived; the source run is never changed. */
  readonly atlasRouteDisposition?: 'discard' | 'archive'
  /** A full wipe retains only an export made outside the save before confirmation. */
  readonly externalExportAvailable?: boolean
}

export interface ResetComparison {
  readonly boundary: ProgressionBoundary
  readonly kind: 'temporary-run' | 'reset' | 'transition' | 'completion' | 'sandbox' | 'destructive'
  readonly actionLabelKey: string
  readonly requiresExplicitConfirmation: boolean
  /** Permanently cleared by this boundary. */
  readonly lost: readonly ResetCategory[]
  /** Survives this boundary, including categories that are parked or temporarily snapshotted. */
  readonly retained: readonly ResetCategory[]
  /** Retained in an exact return snapshot while a clean trial run is active. */
  readonly temporarilyReplaced: readonly ResetCategory[]
  /** Retained but inactive while another universe is active. */
  readonly parked: readonly ResetCategory[]
  readonly recovery: RecoveryEstimateReport
  readonly resultKey: string
}

function category(id: ResetCategoryId, scope: ResetScope): ResetCategory {
  return { id, scope, labelKey: `reset.category.${id}` }
}

const WORLD = [
  category('world-currency', 'world'),
  category('run-earnings', 'world'),
  category('kindlings', 'world'),
  category('ordinary-upgrades', 'world'),
  category('buy-mode', 'world'),
  category('trial-return-snapshot', 'world'),
] as const

const TRIAL_REPLACED = WORLD.filter(({ id }) => id !== 'trial-return-snapshot')

const EPOCH = [
  category('epoch-matter', 'epoch'),
  category('epoch-doctrines', 'epoch'),
  category('epoch-works', 'epoch'),
  category('era-earnings', 'epoch'),
  category('epoch-turn-count', 'epoch'),
] as const

const DEEP_HISTORY = [
  category('deep-currency', 'deep-history'),
  category('deep-laws', 'deep-history'),
  category('deep-works', 'deep-history'),
  category('local-trials', 'deep-history'),
  category('local-automation', 'deep-history'),
  category('local-echoes', 'deep-history'),
  category('local-archive', 'deep-history'),
  category('local-story-seen-sequence', 'deep-history'),
  category('local-records', 'deep-history'),
  category('current-answer', 'deep-history'),
  category('deep-collapse-count', 'deep-history'),
  category('progressive-ui', 'deep-history'),
] as const

const BETWEEN = [
  category('beacons', 'between'),
  category('dark-between', 'between'),
  category('wayfinder-laws', 'between'),
  category('vessel', 'between'),
  category('global-achievements', 'between'),
  category('presentation-preferences', 'between'),
  category('playtime-and-all-world-earnings', 'between'),
  category('historical-answers', 'between'),
  category('remembrance-count', 'between'),
  category('chronicle', 'between'),
  category('garden', 'between'),
  category('atlas-unlocks', 'between'),
] as const

const OTHER_PARKED = category('other-parked-universe-runs', 'between')
const ACTIVE_LOCAL = [...WORLD, ...EPOCH, ...DEEP_HISTORY] as const
const EVERYTHING_IN_SAVE = [...ACTIVE_LOCAL, ...BETWEEN, OTHER_PARKED] as const

const RECOVERY_BOUNDARIES: readonly ProgressionBoundary[] = [
  'epoch-turn',
  'deep-collapse',
  'remembrance',
]

function recoveryReport(
  boundary: ProgressionBoundary,
  inputs: RecoveryEstimateInputs | null | undefined,
): RecoveryEstimateReport {
  if (!RECOVERY_BOUNDARIES.includes(boundary)) {
    return {
      status: 'not-applicable',
      reason: 'boundary-does-not-reset-run',
      inputs: null,
    }
  }

  if (!inputs) return { status: 'unavailable', reason: 'missing-estimate', inputs: null }
  const duration = inputs.estimatedRecoveryMs
  const valid = inputs.basis !== 'unavailable'
    && duration !== null
    && Number.isFinite(duration)
    && duration >= 0

  return {
    status: valid ? 'estimated' : 'unavailable',
    reason: valid ? 'caller-estimate' : 'invalid-estimate',
    inputs,
  }
}

function base(
  input: ResetComparisonInput,
  comparison: Omit<ResetComparison, 'boundary' | 'recovery'>,
): ResetComparison {
  return {
    boundary: input.boundary,
    ...comparison,
    recovery: recoveryReport(input.boundary, input.recovery),
  }
}

/**
 * Describes the F0-approved progression boundary without mutating a run or calculating economy.
 * Recovery numbers are supplied by a simulator and are returned verbatim for explainability.
 */
export function compareProgressionBoundary(input: ResetComparisonInput): ResetComparison {
  switch (input.boundary) {
    case 'enter-trial':
      return base(input, {
        kind: 'temporary-run',
        actionLabelKey: 'reset.action.enter-trial',
        requiresExplicitConfirmation: true,
        lost: [],
        retained: [...EVERYTHING_IN_SAVE],
        temporarilyReplaced: [...TRIAL_REPLACED],
        parked: [],
        resultKey: 'reset.result.trial-snapshot-restored-on-exit',
      })
    case 'epoch-turn':
      return base(input, {
        kind: 'reset',
        actionLabelKey: 'reset.action.epoch-turn',
        requiresExplicitConfirmation: true,
        lost: [...WORLD],
        retained: [...EPOCH, ...DEEP_HISTORY, ...BETWEEN, OTHER_PARKED],
        temporarilyReplaced: [],
        parked: [],
        resultKey: 'reset.result.epoch-matter-and-starting-kindlings',
      })
    case 'deep-collapse':
      return base(input, {
        kind: 'reset',
        actionLabelKey: 'reset.action.deep-collapse',
        requiresExplicitConfirmation: true,
        lost: [...WORLD, ...EPOCH],
        retained: [...DEEP_HISTORY, ...BETWEEN, OTHER_PARKED],
        temporarilyReplaced: [],
        parked: [],
        resultKey: 'reset.result.singularities-and-starting-kindlings',
      })
    case 'remembrance': {
      const retainedDeepIds: readonly ResetCategoryId[] = [
        'local-echoes',
        'local-archive',
        'local-records',
        'deep-collapse-count',
      ]
      const retainedDeep = DEEP_HISTORY.filter(({ id }) => retainedDeepIds.includes(id))
      const lostDeep = DEEP_HISTORY.filter(({ id }) => !retainedDeepIds.includes(id))
      return base(input, {
        kind: 'reset',
        actionLabelKey: 'reset.action.remembrance',
        requiresExplicitConfirmation: true,
        lost: [...WORLD, ...EPOCH, ...lostDeep],
        retained: [...retainedDeep, ...BETWEEN, OTHER_PARKED],
        temporarilyReplaced: [],
        parked: [OTHER_PARKED],
        resultKey: 'reset.result.active-universe-opening-with-memory-multiplier',
      })
    }
    case 'crossing':
      return base(input, {
        kind: 'transition',
        actionLabelKey: 'reset.action.crossing',
        requiresExplicitConfirmation: false,
        lost: [],
        retained: [...EVERYTHING_IN_SAVE],
        temporarilyReplaced: [],
        parked: [...ACTIVE_LOCAL],
        resultKey: 'reset.result.departing-run-parked-destination-restored',
      })
    case 'light-beacon':
      return base(input, {
        kind: 'completion',
        actionLabelKey: 'reset.action.light-beacon',
        requiresExplicitConfirmation: false,
        lost: [],
        retained: [...EVERYTHING_IN_SAVE],
        temporarilyReplaced: [],
        parked: [],
        resultKey: 'reset.result.beacon-and-dark-between-awarded-once',
      })
    case 'atlas-route': {
      const archiveRoute = input.atlasRouteDisposition === 'archive'
      return base(input, {
        kind: 'sandbox',
        actionLabelKey: 'reset.action.atlas-route',
        requiresExplicitConfirmation: false,
        lost: archiveRoute ? [] : [category('atlas-route-state', 'between')],
        retained: archiveRoute
          ? [...EVERYTHING_IN_SAVE, category('atlas-route-record', 'between')]
          : [...EVERYTHING_IN_SAVE],
        temporarilyReplaced: [],
        parked: [...ACTIVE_LOCAL],
        resultKey: archiveRoute
          ? 'reset.result.atlas-route-archived-source-unchanged'
          : 'reset.result.atlas-route-discarded-source-unchanged',
      })
    }
    case 'full-wipe': {
      const retained = input.externalExportAvailable
        ? [category('external-export', 'external')]
        : []
      return base(input, {
        kind: 'destructive',
        actionLabelKey: 'reset.action.full-wipe',
        requiresExplicitConfirmation: true,
        lost: [
          ...EVERYTHING_IN_SAVE,
          category('atlas-route-state', 'between'),
          category('atlas-route-record', 'between'),
        ],
        retained,
        temporarilyReplaced: [],
        parked: [],
        resultKey: 'reset.result.new-current-version-save',
      })
    }
  }
}
