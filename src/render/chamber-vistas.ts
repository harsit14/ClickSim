import type { EconomyAmount } from '../content/universes/types'
import { kailashStatus, brahmalokStatus, vishnulokCircuitStatus } from '../content/universes/f4-runtime'
import {
  verdanceCohortRuntimeSummary,
  verdanceGraftingStatus,
} from '../content/universes/verdance/runtime'

export type ChamberVistaId =
  | 'canopy-dawn'
  | 'lotus-unfolding'
  | 'circuit-return'
  | 'open-summit-ring'

export interface ChamberVistaPlan {
  readonly id: ChamberVistaId
  readonly universeId: 'verdance' | 'brahmalok' | 'vishnulok' | 'kailash'
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
    if (cohort.stageQuantities['verdance-cohort-ancient'] < 1) return null
    const graft = verdanceGraftingStatus(generatorIds, owned, numericLawState)
    return {
      id: 'canopy-dawn',
      universeId,
      label: graft.active
        ? 'Canopy dawn: ancient crowns carry the active graft into first light.'
        : 'Canopy dawn: an ancient crown opens above the germination clearing.',
      intensity: clampUnit(0.58 + cohort.stageQuantities['verdance-cohort-ancient'] / Math.max(1, cohort.totalQuantity)),
      detail: graft.active ? 1 : 0.72,
    }
  }

  if (universeId === 'brahmalok') {
    const status = brahmalokStatus(numericLawState, owned)
    if (status.mode.id !== 'mandala' || status.activeDirections < 4) return null
    return {
      id: 'lotus-unfolding',
      universeId,
      label: `Lotus unfolding: seed, measure, name, and form surround an open center at ${Math.round(status.balance * 100)}% balance.`,
      intensity: clampUnit(0.7 + status.balance * 0.3),
      detail: status.balance,
    }
  }

  if (universeId === 'vishnulok') {
    const status = vishnulokCircuitStatus(numericLawState)
    if (status.returnRemainingSec <= 0) return null
    return {
      id: 'circuit-return',
      universeId,
      label: `Circuit return: ${status.circuit.name} travels through ${status.length} shelters with a ${status.burden.name.toLowerCase()} burden.`,
      intensity: clampUnit(0.68 + status.burdenIndex * 0.09),
      detail: clampUnit(status.length / 8),
    }
  }

  if (universeId === 'kailash') {
    const status = kailashStatus(numericLawState, owned, nowMs)
    const ringOwned = (owned['kailash-kindling-17'] ?? 0) > 0
    if (!ringOwned || status.distinctRoles < 6 || status.restCount < 3) return null
    return {
      id: 'open-summit-ring',
      universeId,
      label: `Open summit: all five acts and ${status.restCount} deliberate rests reveal an incomplete copper ring and the path downward.`,
      intensity: clampUnit(0.72 + status.restCount / 48),
      detail: clampUnit(status.patternBonus - 1),
    }
  }

  return null
}
