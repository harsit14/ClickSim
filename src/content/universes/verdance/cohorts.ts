import type { CohortRules } from '../types'

export type VerdanceCohortStageId = 'u3-cohort-new' | 'u3-cohort-rooted' | 'u3-cohort-mature' | 'u3-cohort-ancient'

export interface VerdanceCohort {
  readonly stageId: VerdanceCohortStageId
  readonly quantity: number
  readonly ageMs: number
}

export interface VerdancePruningPreview {
  readonly maturityPoints: number
  readonly memorySeeds: number
  readonly prunableQuantity: number
}

export const VERDANCE_COHORT_RULES: CohortRules = {
  stages: [
    { id: 'u3-cohort-new', minimumAgeMs: 0, multiplier: 1 },
    { id: 'u3-cohort-rooted', minimumAgeMs: 5 * 60_000, multiplier: 1.35 },
    { id: 'u3-cohort-mature', minimumAgeMs: 60 * 60_000, multiplier: 2 },
    { id: 'u3-cohort-ancient', minimumAgeMs: 8 * 60 * 60_000, multiplier: 3.5 },
  ],
  mergeByStage: true,
  witheringAllowed: false,
}

const STAGES = VERDANCE_COHORT_RULES.stages

function finiteNonNegative(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${label} must be finite and nonnegative.`)
  return value
}

function positiveQuantity(value: number): number {
  if (!Number.isSafeInteger(value) || value <= 0) throw new RangeError('Cohort quantity must be a positive safe integer.')
  return value
}

export function verdanceStageForAge(ageMs: number): VerdanceCohortStageId {
  finiteNonNegative(ageMs, 'Cohort age')
  let result = STAGES[0].id as VerdanceCohortStageId
  for (const stage of STAGES) if (ageMs >= stage.minimumAgeMs) result = stage.id as VerdanceCohortStageId
  return result
}

export function plantVerdanceCohort(quantity: number): VerdanceCohort {
  return { stageId: 'u3-cohort-new', quantity: positiveQuantity(quantity), ageMs: 0 }
}

export function compactVerdanceCohorts(rows: readonly VerdanceCohort[]): readonly VerdanceCohort[] {
  const grouped = new Map<VerdanceCohortStageId, { quantity: number; weightedAge: number }>()
  for (const row of rows) {
    const quantity = positiveQuantity(row.quantity)
    const ageMs = finiteNonNegative(row.ageMs, 'Cohort age')
    const stageId = verdanceStageForAge(ageMs)
    const current = grouped.get(stageId) ?? { quantity: 0, weightedAge: 0 }
    const nextQuantity = current.quantity + quantity
    if (!Number.isSafeInteger(nextQuantity)) throw new RangeError('Compacted cohort quantity exceeds the safe integer range.')
    grouped.set(stageId, { quantity: nextQuantity, weightedAge: current.weightedAge + ageMs * quantity })
  }
  return STAGES.flatMap((stage): VerdanceCohort[] => {
    const group = grouped.get(stage.id as VerdanceCohortStageId)
    if (!group) return []
    return [{
      stageId: stage.id as VerdanceCohortStageId,
      quantity: group.quantity,
      ageMs: group.weightedAge / group.quantity,
    }]
  })
}

export function advanceVerdanceCohorts(
  rows: readonly VerdanceCohort[],
  elapsedMs: number,
  offlineCapMs = elapsedMs,
): readonly VerdanceCohort[] {
  const elapsed = finiteNonNegative(elapsedMs, 'Elapsed time')
  const cap = finiteNonNegative(offlineCapMs, 'Offline cap')
  const credited = Math.min(elapsed, cap)
  return compactVerdanceCohorts(rows.map((row) => ({ ...row, ageMs: row.ageMs + credited })))
}

export function verdanceCohortProductionMultiplier(rows: readonly VerdanceCohort[]): number {
  if (rows.length === 0) return 1
  let quantity = 0
  let weighted = 0
  for (const row of compactVerdanceCohorts(rows)) {
    const multiplier = STAGES.find((stage) => stage.id === row.stageId)?.multiplier ?? 1
    quantity += row.quantity
    weighted += row.quantity * multiplier
  }
  return quantity === 0 ? 1 : weighted / quantity
}

export function previewVerdancePruning(rows: readonly VerdanceCohort[]): VerdancePruningPreview {
  let maturityPoints = 0
  let prunableQuantity = 0
  for (const row of compactVerdanceCohorts(rows)) {
    if (row.stageId === 'u3-cohort-mature') {
      maturityPoints += row.quantity
      prunableQuantity += row.quantity
    } else if (row.stageId === 'u3-cohort-ancient') {
      maturityPoints += row.quantity * 3
      prunableQuantity += row.quantity
    }
  }
  return { maturityPoints, memorySeeds: Math.floor(maturityPoints / 5), prunableQuantity }
}
