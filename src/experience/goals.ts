export type GoalSlot = 'now' | 'soon'
export type GoalCandidateState = 'available' | 'blocked' | 'complete'
export type GoalEstimateBasis = 'declared' | 'simulation' | 'history' | 'unavailable'

export interface GoalTimeEstimate {
  /** Supplied by the caller's economy/simulation layer. This model never calculates production. */
  readonly estimatedSeconds: number | null
  readonly basis: GoalEstimateBasis
  readonly detailKey: string
}

export interface GoalCandidate {
  readonly id: string
  /** Translation/message key; presentation resolves it to player-facing copy. */
  readonly labelKey: string
  readonly eligibleSlots: readonly GoalSlot[]
  readonly state: GoalCandidateState
  readonly meaningful: boolean
  readonly priority: number
  readonly estimate: GoalTimeEstimate
  readonly reasonKey: string
  readonly reasonParameters?: Readonly<Record<string, string | number | boolean>>
  /** Exact caller-formatted distance data for the glanceable progress readout. */
  readonly progress?: {
    readonly current: string
    readonly target: string
    readonly ratio: number
  }
}

export interface GoalLensInput {
  readonly enabled: boolean
  readonly candidates: readonly GoalCandidate[]
  readonly pinnedGoalId?: string | null
  /** The canonical useful-action window is roughly two minutes. */
  readonly nowHorizonSeconds?: number
  /** The canonical current-session window is at most forty-five minutes. */
  readonly soonHorizonSeconds?: number
}

export type GoalRecommendationReason =
  | 'ready-now'
  | 'reachable-now'
  | 'nearest-session-goal'
  | 'player-pinned'
  | 'pinned-blocked'
  | 'pinned-complete'
  | 'pinned-unavailable'

export interface GoalRecommendation {
  readonly goalId: string
  readonly labelKey: string | null
  readonly slot: GoalSlot | 'pinned'
  readonly state: GoalCandidateState | 'unavailable'
  readonly reason: GoalRecommendationReason
  readonly candidateReasonKey: string | null
  readonly reasonParameters: Readonly<Record<string, string | number | boolean>>
  readonly estimate: GoalTimeEstimate | null
  readonly progress: GoalCandidate['progress'] | null
}

export interface GoalLensResult {
  readonly status: 'disabled' | 'empty' | 'ready'
  readonly now: GoalRecommendation | null
  readonly soon: GoalRecommendation | null
  readonly pinned: GoalRecommendation | null
}

const DEFAULT_NOW_HORIZON_SECONDS = 120
const DEFAULT_SOON_HORIZON_SECONDS = 45 * 60

function validHorizon(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) && value >= 0 ? value : fallback
}

function normalizedSeconds(estimate: GoalTimeEstimate): number | null {
  const seconds = estimate.estimatedSeconds
  if (estimate.basis === 'unavailable' || seconds === null || !Number.isFinite(seconds) || seconds < 0) {
    return null
  }
  return seconds
}

function normalizedPriority(priority: number): number {
  return Number.isFinite(priority) ? priority : 0
}

function candidateOrder(left: GoalCandidate, right: GoalCandidate): number {
  const leftSeconds = normalizedSeconds(left.estimate) ?? Number.POSITIVE_INFINITY
  const rightSeconds = normalizedSeconds(right.estimate) ?? Number.POSITIVE_INFINITY
  if (leftSeconds !== rightSeconds) return leftSeconds - rightSeconds

  const priorityDifference = normalizedPriority(right.priority) - normalizedPriority(left.priority)
  if (priorityDifference !== 0) return priorityDifference
  if (left.id < right.id) return -1
  if (left.id > right.id) return 1
  return 0
}

function eligibleCandidates(
  candidates: readonly GoalCandidate[],
  slot: GoalSlot,
  horizonSeconds: number,
  excludedIds: readonly string[] = [],
): GoalCandidate[] {
  return candidates
    .filter((candidate) => (
      !excludedIds.includes(candidate.id)
      && candidate.state === 'available'
      && candidate.meaningful
      && candidate.eligibleSlots.includes(slot)
      && (normalizedSeconds(candidate.estimate) ?? Number.POSITIVE_INFINITY) <= horizonSeconds
    ))
    .sort(candidateOrder)
}

function recommend(candidate: GoalCandidate, slot: GoalSlot): GoalRecommendation {
  const seconds = normalizedSeconds(candidate.estimate)
  const reason: GoalRecommendationReason = slot === 'soon'
    ? 'nearest-session-goal'
    : seconds === 0
      ? 'ready-now'
      : 'reachable-now'

  return {
    goalId: candidate.id,
    labelKey: candidate.labelKey,
    slot,
    state: candidate.state,
    reason,
    candidateReasonKey: candidate.reasonKey,
    reasonParameters: candidate.reasonParameters ?? {},
    estimate: candidate.estimate,
    progress: candidate.progress ?? null,
  }
}

function pinnedRecommendation(
  candidates: readonly GoalCandidate[],
  pinnedGoalId: string | null | undefined,
): GoalRecommendation | null {
  if (!pinnedGoalId) return null

  const candidate = candidates.find(({ id }) => id === pinnedGoalId)
  if (!candidate) {
    return {
      goalId: pinnedGoalId,
      labelKey: null,
      slot: 'pinned',
      state: 'unavailable',
      reason: 'pinned-unavailable',
      candidateReasonKey: null,
      reasonParameters: {},
      estimate: null,
      progress: null,
    }
  }

  const reason: GoalRecommendationReason = candidate.state === 'blocked'
    ? 'pinned-blocked'
    : candidate.state === 'complete'
      ? 'pinned-complete'
      : 'player-pinned'

  return {
    goalId: candidate.id,
    labelKey: candidate.labelKey,
    slot: 'pinned',
    state: candidate.state,
    reason,
    candidateReasonKey: candidate.reasonKey,
    reasonParameters: candidate.reasonParameters ?? {},
    estimate: candidate.estimate,
    progress: candidate.progress ?? null,
  }
}

/**
 * Selects deterministic Goal Lens recommendations from caller-supplied candidates.
 * Economy, wall-clock time, persistence, and presentation remain outside this model.
 */
export function recommendGoals(input: GoalLensInput): GoalLensResult {
  if (!input.enabled) {
    return { status: 'disabled', now: null, soon: null, pinned: null }
  }

  const nowHorizon = validHorizon(input.nowHorizonSeconds, DEFAULT_NOW_HORIZON_SECONDS)
  const soonHorizon = Math.max(
    nowHorizon,
    validHorizon(input.soonHorizonSeconds, DEFAULT_SOON_HORIZON_SECONDS),
  )
  const pinnedId = input.pinnedGoalId || null
  const nowCandidate = eligibleCandidates(
    input.candidates,
    'now',
    nowHorizon,
    pinnedId ? [pinnedId] : [],
  )[0]
  const excludedFromSoon = [pinnedId, nowCandidate?.id]
    .filter((id): id is string => id !== null && id !== undefined)
  const soonCandidate = eligibleCandidates(
    input.candidates,
    'soon',
    soonHorizon,
    excludedFromSoon,
  )[0]
  const pinned = pinnedRecommendation(input.candidates, input.pinnedGoalId)
  const now = nowCandidate ? recommend(nowCandidate, 'now') : null
  const soon = soonCandidate ? recommend(soonCandidate, 'soon') : null

  return {
    status: now || soon || pinned ? 'ready' : 'empty',
    now,
    soon,
    pinned,
  }
}

/** Selecting an already pinned goal toggles it off; selecting another goal replaces it. */
export function togglePinnedGoal(currentGoalId: string | null, selectedGoalId: string): string | null {
  return currentGoalId === selectedGoalId ? null : selectedGoalId
}
