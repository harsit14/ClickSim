import type { EconomyAmount } from '../content/universes/types'
import { canticleStatus, prismataStatus, tempestStatus } from '../content/universes/f4-runtime'
import {
  verdanceCohortRuntimeSummary,
  verdanceGraftingStatus,
} from '../content/universes/verdance/runtime'

export type ChamberVistaId =
  | 'canopy-dawn'
  | 'lotus-unfolding'
  | 'full-discharge'
  | 'standing-wave-cathedral'

export interface ChamberVistaPlan {
  readonly id: ChamberVistaId
  readonly universeId: 'verdance' | 'prismata' | 'tempest' | 'canticle'
  readonly label: string
  readonly intensity: number
  readonly detail: number
}

interface ChamberVistaInput {
  readonly universeId: string
  readonly generatorIds: readonly string[]
  readonly owned: Readonly<Record<string, number>>
  readonly numericLawState?: Readonly<Record<string, EconomyAmount>>
  readonly nowMs?: number
}

function clampUnit(value: number): number {
  return Math.max(0, Math.min(1, value))
}

/**
 * Resolves the four chamber-world set pieces from their real laws. These are
 * milestone states, not tier art: when a law stops satisfying its contract the
 * vista recedes and leaves the ambient world composition behind.
 */
export function planChamberVista({
  universeId,
  generatorIds,
  owned,
  numericLawState,
  nowMs = Date.now(),
}: ChamberVistaInput): ChamberVistaPlan | null {
  if (universeId === 'verdance') {
    const cohort = verdanceCohortRuntimeSummary(generatorIds, owned, numericLawState)
    if (cohort.stageQuantities['u3-cohort-ancient'] < 1) return null
    const graft = verdanceGraftingStatus(generatorIds, owned, numericLawState)
    return {
      id: 'canopy-dawn',
      universeId,
      label: graft.active
        ? 'Canopy dawn: ancient crowns carry the active graft into first light.'
        : 'Canopy dawn: an ancient crown opens above the germination clearing.',
      intensity: clampUnit(0.58 + cohort.stageQuantities['u3-cohort-ancient'] / Math.max(1, cohort.totalQuantity)),
      detail: graft.active ? 1 : 0.72,
    }
  }

  if (universeId === 'prismata') {
    const status = prismataStatus(numericLawState, owned)
    if (status.recipe.id !== 'mandala' || status.activeBands < 4) return null
    return {
      id: 'lotus-unfolding',
      universeId,
      label: `Lotus unfolding: seed, measure, name, and form surround an open center at ${Math.round(status.balance * 100)}% balance.`,
      intensity: clampUnit(0.7 + status.balance * 0.3),
      detail: status.balance,
    }
  }

  if (universeId === 'tempest') {
    const status = tempestStatus(numericLawState)
    if (status.boostRemainingSec <= 0) return null
    return {
      id: 'full-discharge',
      universeId,
      label: `Full discharge: ${status.path.name} propagates through ${status.length} storm cells at ${status.risk.name.toLowerCase()} risk.`,
      intensity: clampUnit(0.68 + status.riskIndex * 0.09),
      detail: clampUnit(status.length / 8),
    }
  }

  if (universeId === 'canticle') {
    const status = canticleStatus(numericLawState, owned, nowMs)
    const cathedralWaveOwned = (owned['u7-kindling-13'] ?? 0) > 0
    if (!cathedralWaveOwned || status.distinctRoles < 6 || status.restCount < 4) return null
    return {
      id: 'standing-wave-cathedral',
      universeId,
      label: `Standing-wave cathedral: six roles and ${status.restCount} deliberate rests hold one resonant architecture.`,
      intensity: clampUnit(0.72 + status.restCount / 48),
      detail: clampUnit(status.patternBonus - 1),
    }
  }

  return null
}
