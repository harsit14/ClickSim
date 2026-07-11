import type { EconomyAmount } from '../types'
import {
  amountFromNumber,
  amountToNumber,
} from '../../../core/numeric/amount'
import {
  VERDANCE_COHORT_RULES,
  previewVerdancePruning,
  verdanceStageForAge,
  type VerdanceCohort,
  type VerdanceCohortStageId,
} from './cohorts'

export const VERDANCE_COHORT_LABELS: Readonly<Record<VerdanceCohortStageId, string>> = {
  'u3-cohort-new': 'new',
  'u3-cohort-rooted': 'rooted',
  'u3-cohort-mature': 'mature',
  'u3-cohort-ancient': 'ancient',
}

const STAGES = VERDANCE_COHORT_RULES.stages.map((stage) => ({
  ...stage,
  id: stage.id as VerdanceCohortStageId,
}))

export interface VerdanceGeneratorCohortStatus {
  readonly generatorId: string
  readonly quantity: number
  readonly averageAgeMs: number
  readonly stageId: VerdanceCohortStageId
  readonly stageLabel: string
  readonly multiplier: number
  readonly nextStageInMs: number | null
  readonly rows: readonly VerdanceCohort[]
}

export interface VerdanceCohortRuntimeSummary {
  readonly totalQuantity: number
  readonly multiplier: number
  readonly dominantStageId: VerdanceCohortStageId
  readonly dominantStageLabel: string
  readonly stageQuantities: Readonly<Record<VerdanceCohortStageId, number>>
  readonly memorySeedBonus: number
  readonly prunableQuantity: number
}

export const VERDANCE_GRAFT_RULES = {
  inheritedMaturityShare: 0.55,
  rootstockProductionFactor: 0.92,
} as const

export interface VerdanceGraftingStatus {
  readonly configured: boolean
  readonly active: boolean
  readonly rootstockIndex: number
  readonly scionIndex: number
  readonly rootstockId: string
  readonly scionId: string
  readonly rootstockStageLabel: string
  readonly scionStageLabel: string
  readonly rootstockCohortMultiplier: number
  readonly scionCohortMultiplier: number
  readonly scionGraftedMultiplier: number
  readonly rootstockProductionFactor: number
  readonly scionProductionFactor: number
  readonly explanation: string
}

function quantityKey(generatorId: string): string {
  return `${generatorId}-cohort-quantity`
}

function ageKey(generatorId: string): string {
  return `${generatorId}-cohort-age`
}

function boundedStateNumber(value: EconomyAmount | undefined, fallback = 0): number {
  if (!value) return fallback
  try {
    const result = amountToNumber(value)
    return Number.isFinite(result) && result >= 0 ? result : fallback
  } catch {
    return fallback
  }
}

function graftIndex(
  state: Readonly<Record<string, EconomyAmount>> | undefined,
  key: string,
  fallback: number,
  generatorCount: number,
): number {
  return Math.min(generatorCount - 1, Math.floor(boundedStateNumber(state?.[key], fallback)))
}

function ownedQuantity(value: number | undefined): number {
  if (!Number.isFinite(value) || !value || value <= 0) return 0
  return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value))
}

function stageMultiplier(stageId: VerdanceCohortStageId): number {
  return STAGES.find((stage) => stage.id === stageId)?.multiplier ?? 1
}

function nextStageDelay(ageMs: number): number | null {
  const next = STAGES.find((stage) => stage.minimumAgeMs > ageMs)
  return next ? Math.max(0, next.minimumAgeMs - ageMs) : null
}

/**
 * Advances Verdance's saved, per-Kindling merged cohorts. New purchases join at
 * age zero and dilute that Kindling's average age instead of inheriting maturity.
 */
export function advanceVerdanceCohortLawState(
  state: Record<string, EconomyAmount>,
  owned: Readonly<Record<string, number>>,
  generatorIds: readonly string[],
  elapsedMs: number,
): void {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new RangeError('Verdance cohort elapsed time must be finite and nonnegative.')
  }
  for (const generatorId of generatorIds) {
    const quantity = ownedQuantity(owned[generatorId])
    const quantityStateKey = quantityKey(generatorId)
    const ageStateKey = ageKey(generatorId)
    if (quantity === 0) {
      delete state[quantityStateKey]
      delete state[ageStateKey]
      continue
    }
    const trackedQuantity = Math.min(quantity, Math.floor(boundedStateNumber(state[quantityStateKey])))
    const priorAverageAge = boundedStateNumber(state[ageStateKey])
    const nextAverageAge = priorAverageAge * (trackedQuantity / quantity) + elapsedMs
    state[quantityStateKey] = amountFromNumber(quantity)
    state[ageStateKey] = amountFromNumber(nextAverageAge)
  }
}

export function verdanceGeneratorCohortStatus(
  generatorId: string,
  quantityInput: number,
  state: Readonly<Record<string, EconomyAmount>> | undefined,
): VerdanceGeneratorCohortStatus {
  const quantity = ownedQuantity(quantityInput)
  if (quantity === 0) {
    return {
      generatorId,
      quantity: 0,
      averageAgeMs: 0,
      stageId: 'u3-cohort-new',
      stageLabel: VERDANCE_COHORT_LABELS['u3-cohort-new'],
      multiplier: 1,
      nextStageInMs: STAGES[1].minimumAgeMs,
      rows: [],
    }
  }
  const trackedQuantity = Math.min(quantity, Math.floor(boundedStateNumber(state?.[quantityKey(generatorId)])))
  const newQuantity = quantity - trackedQuantity
  const averageAgeMs = boundedStateNumber(state?.[ageKey(generatorId)])
  const trackedStageId = verdanceStageForAge(averageAgeMs)
  const rows: VerdanceCohort[] = []
  if (newQuantity > 0) rows.push({ stageId: 'u3-cohort-new', quantity: newQuantity, ageMs: 0 })
  if (trackedQuantity > 0) rows.push({ stageId: trackedStageId, quantity: trackedQuantity, ageMs: averageAgeMs })
  const trackedMultiplier = stageMultiplier(trackedStageId)
  const multiplier = (newQuantity + trackedQuantity * trackedMultiplier) / quantity
  const stageId = trackedQuantity >= newQuantity ? trackedStageId : 'u3-cohort-new'
  return {
    generatorId,
    quantity,
    averageAgeMs,
    stageId,
    stageLabel: VERDANCE_COHORT_LABELS[stageId],
    multiplier,
    nextStageInMs: nextStageDelay(averageAgeMs),
    rows,
  }
}

export function verdanceCohortRuntimeSummary(
  generatorIds: readonly string[],
  owned: Readonly<Record<string, number>>,
  state: Readonly<Record<string, EconomyAmount>> | undefined,
): VerdanceCohortRuntimeSummary {
  const stageQuantities: Record<VerdanceCohortStageId, number> = {
    'u3-cohort-new': 0,
    'u3-cohort-rooted': 0,
    'u3-cohort-mature': 0,
    'u3-cohort-ancient': 0,
  }
  const rows: VerdanceCohort[] = []
  let totalQuantity = 0
  let weightedMultiplier = 0
  for (const generatorId of generatorIds) {
    const status = verdanceGeneratorCohortStatus(generatorId, owned[generatorId] ?? 0, state)
    totalQuantity += status.quantity
    weightedMultiplier += status.quantity * status.multiplier
    for (const row of status.rows) {
      stageQuantities[row.stageId] += row.quantity
      rows.push(row)
    }
  }
  const dominantStageId = STAGES.reduce((best, stage) => (
    stageQuantities[stage.id] > stageQuantities[best] ? stage.id : best
  ), 'u3-cohort-new' as VerdanceCohortStageId)
  const pruning = previewVerdancePruning(rows)
  return {
    totalQuantity,
    multiplier: totalQuantity > 0 ? weightedMultiplier / totalQuantity : 1,
    dominantStageId,
    dominantStageLabel: VERDANCE_COHORT_LABELS[dominantStageId],
    stageQuantities,
    memorySeedBonus: pruning.memorySeeds,
    prunableQuantity: pruning.prunableQuantity,
  }
}

/**
 * Bind one older Kindling cohort to one younger cohort. Configuration is free,
 * deterministic, and retained through Pruning; the graft only wakes while both
 * cohorts exist and the chosen rootstock is actually more mature.
 */
export function configureVerdanceGraft(
  state: Record<string, EconomyAmount>,
  rootstockIndex: number,
  scionIndex: number,
  generatorCount = 18,
): boolean {
  if (!Number.isSafeInteger(generatorCount) || generatorCount < 2) return false
  if (!Number.isInteger(rootstockIndex) || rootstockIndex < 0 || rootstockIndex >= generatorCount) return false
  if (!Number.isInteger(scionIndex) || scionIndex < 0 || scionIndex >= generatorCount) return false
  if (rootstockIndex === scionIndex) return false
  state['u3-graft-rootstock'] = amountFromNumber(rootstockIndex)
  state['u3-graft-scion'] = amountFromNumber(scionIndex)
  state['u3-graft-active'] = amountFromNumber(1)
  return true
}

export function clearVerdanceGraft(state: Record<string, EconomyAmount>): boolean {
  const configured = boundedStateNumber(state['u3-graft-active']) >= 1
  delete state['u3-graft-active']
  delete state['u3-graft-rootstock']
  delete state['u3-graft-scion']
  return configured
}

export function verdanceGraftingStatus(
  generatorIds: readonly string[],
  owned: Readonly<Record<string, number>>,
  state: Readonly<Record<string, EconomyAmount>> | undefined,
): VerdanceGraftingStatus {
  const generatorCount = generatorIds.length
  if (generatorCount < 2) throw new RangeError('Verdance grafting requires at least two Kindlings.')
  const rootstockIndex = graftIndex(state, 'u3-graft-rootstock', 0, generatorCount)
  const defaultScionIndex = rootstockIndex === 0 ? 1 : 0
  const scionIndex = graftIndex(state, 'u3-graft-scion', defaultScionIndex, generatorCount)
  const rootstockId = generatorIds[rootstockIndex]
  const scionId = generatorIds[scionIndex]
  const configured = boundedStateNumber(state?.['u3-graft-active']) >= 1 && rootstockIndex !== scionIndex
  const rootstock = verdanceGeneratorCohortStatus(rootstockId, owned[rootstockId] ?? 0, state)
  const scion = verdanceGeneratorCohortStatus(scionId, owned[scionId] ?? 0, state)
  const maturityLead = Math.max(0, rootstock.multiplier - scion.multiplier)
  const active = configured && rootstock.quantity > 0 && scion.quantity > 0 && maturityLead > 0
  const inheritedMaturity = active ? maturityLead * VERDANCE_GRAFT_RULES.inheritedMaturityShare : 0
  const scionGraftedMultiplier = scion.multiplier + inheritedMaturity
  const rootstockProductionFactor = active ? VERDANCE_GRAFT_RULES.rootstockProductionFactor : 1
  const scionProductionFactor = active && scion.multiplier > 0 ? scionGraftedMultiplier / scion.multiplier : 1
  const explanation = !configured
    ? 'Choose an older rootstock and a younger scion to bind one living graft.'
    : rootstock.quantity <= 0 || scion.quantity <= 0
      ? 'The graft is tied, but both selected Kindlings must be planted before sap can cross.'
      : maturityLead <= 0
        ? 'The graft is resting: the selected rootstock is not older than its scion.'
        : `${Math.round(VERDANCE_GRAFT_RULES.inheritedMaturityShare * 100)}% of the rootstock maturity lead crosses the graft; the donor retains ${Math.round(VERDANCE_GRAFT_RULES.rootstockProductionFactor * 100)}% output.`
  return {
    configured,
    active,
    rootstockIndex,
    scionIndex,
    rootstockId,
    scionId,
    rootstockStageLabel: rootstock.stageLabel,
    scionStageLabel: scion.stageLabel,
    rootstockCohortMultiplier: rootstock.multiplier,
    scionCohortMultiplier: scion.multiplier,
    scionGraftedMultiplier,
    rootstockProductionFactor,
    scionProductionFactor,
    explanation,
  }
}

export function verdanceGraftProductionMultiplier(
  generatorId: string,
  generatorIds: readonly string[],
  owned: Readonly<Record<string, number>>,
  state: Readonly<Record<string, EconomyAmount>> | undefined,
): number {
  const graft = verdanceGraftingStatus(generatorIds, owned, state)
  if (!graft.active) return 1
  if (generatorId === graft.rootstockId) return graft.rootstockProductionFactor
  if (generatorId === graft.scionId) return graft.scionProductionFactor
  return 1
}
