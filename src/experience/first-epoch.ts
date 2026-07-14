import { FIRST_EPOCH_APPROACH_RATIO } from '../content/economy-balance'
import type { EconomyAmount, UniverseId } from '../content/universes/types'
import {
  amountToBoundedNumber,
  divideAmounts,
  gteAmount,
  isZeroAmount,
  multiplyAmountByNumber,
} from '../core/numeric/amount'

export type FirstEpochCeremonyStage = 'prepare' | 'compare' | 'collapse' | 'complete'
export type FirstEpochStepStatus = 'complete' | 'current' | 'upcoming'

export interface FirstEpochCeremonyInput {
  readonly universeId: UniverseId
  readonly remembrances: number
  readonly epochTurns: number
  readonly currentEraEarnings: EconomyAmount
  readonly firstEpochTarget: EconomyAmount
  readonly epochReady: boolean
  readonly comparisonSeen: boolean
}

export interface FirstEpochCeremonyStep {
  readonly id: Exclude<FirstEpochCeremonyStage, 'complete'>
  readonly label: string
  readonly status: FirstEpochStepStatus
}

export interface FirstEpochCeremonyModel {
  readonly visible: boolean
  readonly stage: FirstEpochCeremonyStage
  readonly progressRatio: number
  readonly steps: readonly FirstEpochCeremonyStep[]
  readonly actionLabel: string | null
}

const STEP_LABELS = {
  prepare: 'Prepare the Observatory',
  compare: 'Compare what returns and remains',
  collapse: 'Collapse when you are ready',
} as const

function progressRatio(current: EconomyAmount, target: EconomyAmount): number {
  if (isZeroAmount(target)) return 0
  const ratio = amountToBoundedNumber(divideAmounts(current, target))
  return Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0
}

export function firstEpochApproachReached(
  current: EconomyAmount,
  target: EconomyAmount,
): boolean {
  if (isZeroAmount(target)) return false
  return gteAmount(current, multiplyAmountByNumber(target, FIRST_EPOCH_APPROACH_RATIO))
}

/**
 * The first global Epoch is mandatory onboarding, so it is independent of the
 * optional Goal Lens preference. Later Epochs return to normal player control.
 */
export function buildFirstEpochCeremony(
  input: FirstEpochCeremonyInput,
): FirstEpochCeremonyModel {
  const progress = progressRatio(input.currentEraEarnings, input.firstEpochTarget)
  const firstPlaythrough = input.universeId === 'emberlight'
    && input.remembrances === 0
    && input.epochTurns === 0
  const visible = firstPlaythrough
    && firstEpochApproachReached(input.currentEraEarnings, input.firstEpochTarget)

  const stage: FirstEpochCeremonyStage = !visible
    ? 'complete'
    : !input.epochReady
      ? 'prepare'
      : !input.comparisonSeen
        ? 'compare'
        : 'collapse'
  const currentIndex = stage === 'prepare' ? 0 : stage === 'compare' ? 1 : stage === 'collapse' ? 2 : 3
  const ids = ['prepare', 'compare', 'collapse'] as const
  const steps = ids.map((id, index): FirstEpochCeremonyStep => ({
    id,
    label: STEP_LABELS[id],
    status: index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming',
  }))
  const actionLabel = stage === 'prepare'
    ? 'Open the Observatory'
    : stage === 'compare'
      ? 'Prepare the comparison'
      : stage === 'collapse'
        ? 'Review and collapse'
        : null

  return { visible, stage, progressRatio: progress, steps, actionLabel }
}
