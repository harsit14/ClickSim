import type { EconomyAmount, WorldObjectManifest } from '../../content/universes/types'
import {
  verdanceGeneratorCohortStatus,
} from '../../content/universes/verdance/runtime'
import type { VerdanceCohortStageId } from '../../content/universes/verdance/cohorts'

export type VerdanceOwnershipThreshold = 0 | 1 | 10 | 25 | 50 | 100

export interface VerdanceGrovePlan {
  readonly objectId: string
  readonly sourceId: string
  readonly name: string
  readonly stageId: VerdanceCohortStageId
  readonly stageLabel: string
  readonly threshold: VerdanceOwnershipThreshold
  readonly owned: number
  readonly xPercent: number
  readonly groundPercent: number
  readonly side: 'left' | 'right'
}

const GROVE_SEATS = [
  { index: 0, xPercent: 8, groundPercent: 72 },
  { index: 3, xPercent: 25, groundPercent: 64 },
  { index: 6, xPercent: 39, groundPercent: 70 },
  { index: 9, xPercent: 61, groundPercent: 68 },
  { index: 12, xPercent: 75, groundPercent: 61 },
  { index: 15, xPercent: 92, groundPercent: 72 },
] as const

export function verdanceOwnershipThreshold(count: number): VerdanceOwnershipThreshold {
  if (count >= 100) return 100
  if (count >= 50) return 50
  if (count >= 25) return 25
  if (count >= 10) return 10
  return count >= 1 ? 1 : 0
}

function specimenName(object: WorldObjectManifest): string {
  return object.phenomenon.split(' growing as part of ')[0] ?? object.sourceId
}

/**
 * The density governor gives Verdance six grove seats. Each seat represents a
 * three-Kindling band while retaining the real cohort stage of its lead plant.
 */
export function planVerdanceGroves(
  objects: readonly WorldObjectManifest[],
  owned: Readonly<Record<string, number>>,
  numericLawState?: Readonly<Record<string, EconomyAmount>>,
): readonly VerdanceGrovePlan[] {
  const generators = objects.filter(({ sourceKind }) => sourceKind === 'generator')
  return GROVE_SEATS.flatMap((seat): VerdanceGrovePlan[] => {
    const object = generators[seat.index]
    if (!object) return []
    const count = Math.max(0, Math.floor(owned[object.sourceId] ?? 0))
    if (count < 1) return []
    const cohort = verdanceGeneratorCohortStatus(object.sourceId, count, numericLawState)
    return [{
      objectId: object.id,
      sourceId: object.sourceId,
      name: specimenName(object),
      stageId: cohort.stageId,
      stageLabel: cohort.stageLabel,
      threshold: verdanceOwnershipThreshold(count),
      owned: count,
      xPercent: seat.xPercent,
      groundPercent: seat.groundPercent,
      side: seat.xPercent < 50 ? 'left' : 'right',
    }]
  })
}
