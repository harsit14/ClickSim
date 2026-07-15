import type { EconomyAmount, WorldObjectManifest } from '../../content/universes/types'
import {
  BRAHMALOK_DIRECTIONS,
  brahmalokCommissionStatus,
  brahmalokMarginModeIndex,
  brahmalokStatus,
} from '../../content/universes/f4-runtime'

export type BrahmalokOwnershipThreshold = 0 | 1 | 10 | 25 | 50 | 100
export const FOLIO_RENDER_CAP = 24
export const LOTUS_CENTER_CLEARANCE_PERCENT = 15

export function brahmalokOwnershipThreshold(count: number): BrahmalokOwnershipThreshold {
  if (count >= 100) return 100
  if (count >= 50) return 50
  if (count >= 25) return 25
  if (count >= 10) return 10
  return count >= 1 ? 1 : 0
}

export interface BrahmalokCourtPlan {
  readonly id: string
  readonly direction: (typeof BRAHMALOK_DIRECTIONS)[number]
  readonly routedOwnership: number
  readonly threshold: BrahmalokOwnershipThreshold
  readonly xPercent: number
  readonly yPercent: number
  readonly silhouette: string
  readonly pattern: string
}

const COURT_SEATS = [
  { xPercent: 10, yPercent: 65, silhouette: 'seed gardens in low stepped beds', pattern: 'dot and rising contour' },
  { xPercent: 34, yPercent: 79, silhouette: 'measure halls with open ruled colonnades', pattern: 'parallel ruled lines' },
  { xPercent: 66, yPercent: 79, silhouette: 'name terraces carrying distinct blank title stones', pattern: 'diagonal hatch' },
  { xPercent: 90, yPercent: 64, silhouette: 'form workshops with unclosed clay frames', pattern: 'offset blocks' },
] as const

export function planBrahmalokCourts(
  state: Readonly<Record<string, EconomyAmount>> | undefined,
  owned: Readonly<Record<string, number>>,
): readonly BrahmalokCourtPlan[] {
  const status = brahmalokStatus(state, owned)
  return BRAHMALOK_DIRECTIONS.map((direction, index) => {
    const seat = COURT_SEATS[index]
    const routedOwnership = status.directions[index]
    const threshold = brahmalokOwnershipThreshold(routedOwnership)
    return {
      id: `brahmalok-court-${direction.id}`,
      direction,
      routedOwnership,
      threshold,
      xPercent: seat.xPercent,
      yPercent: seat.yPercent,
      silhouette: `${seat.silhouette}, ownership form ${threshold}`,
      pattern: seat.pattern,
    }
  })
}

export interface FolioShelfPlan {
  readonly folios: readonly { readonly index: number; readonly stage: 'kept' | 'fresh' }[]
  readonly unrenderedFolios: number
}

export function planBrahmalokFolioShelf(folios: number): FolioShelfPlan {
  const count = Math.max(0, Math.floor(Number.isFinite(folios) ? folios : 0))
  const visible = Math.min(FOLIO_RENDER_CAP, count)
  return {
    folios: Array.from({ length: visible }, (_, index) => ({ index, stage: index === visible - 1 ? 'fresh' : 'kept' })),
    unrenderedFolios: Math.max(0, count - FOLIO_RENDER_CAP),
  }
}

export interface PetalWhorlPlan {
  readonly id: string
  readonly familyIndex: number
  readonly threshold: 25 | 50 | 100
  readonly rotationDegrees: number
  readonly radiusPercent: number
}

export function planBrahmalokPetalWhorls(
  objects: readonly WorldObjectManifest[],
  owned: Readonly<Record<string, number>>,
): readonly PetalWhorlPlan[] {
  const generators = objects.filter(({ sourceKind }) => sourceKind === 'generator')
  return Array.from({ length: 6 }, (_, familyIndex) => {
    const band = generators.slice(familyIndex * 3, familyIndex * 3 + 3)
    const maximum = Math.max(0, ...band.map(({ sourceId }) => owned[sourceId] ?? 0))
    return ([25, 50, 100] as const).flatMap((threshold): PetalWhorlPlan[] => maximum >= threshold ? [{
      id: `petal-whorl-${familyIndex}-${threshold}`,
      familyIndex,
      threshold,
      rotationDegrees: familyIndex * 29 + threshold,
      radiusPercent: 18 + familyIndex * 2.1 + (threshold === 100 ? 4 : threshold === 50 ? 2 : 0),
    }] : [])
  }).flat()
}

export interface BrahmalokHeartResponsePlan {
  readonly directionFractions: readonly number[]
  readonly modePattern: string
  readonly marginPattern: string | null
  readonly askingDirection: string | null
  readonly attention: 'none' | 'pulse' | 'static-ring'
  readonly center: 'open-square'
  readonly label: string
}

const MODE_PATTERNS = ['solid seed dots', 'four ruled quarters', 'offset manuscript folios', 'numbered outward whorls'] as const

export function planBrahmalokHeartResponse(
  state: Readonly<Record<string, EconomyAmount>> | undefined,
  owned: Readonly<Record<string, number>>,
  archiveCount: number,
  reducedMotion: boolean,
): BrahmalokHeartResponsePlan {
  const status = brahmalokStatus(state, owned)
  const maximum = Math.max(1, ...status.directions)
  const commission = brahmalokCommissionStatus(state, owned, archiveCount)
  const margin = brahmalokMarginModeIndex(state)
  const askingDirection = commission.phase === 'active' ? commission.commission.direction : null
  return {
    directionFractions: status.directions.map((value) => value / maximum),
    modePattern: MODE_PATTERNS[status.modeIndex],
    marginPattern: margin === null ? null : MODE_PATTERNS[margin],
    askingDirection,
    attention: askingDirection === null ? 'none' : reducedMotion ? 'static-ring' : 'pulse',
    center: 'open-square',
    label: `${status.mode.name}; ${status.activeDirections} of four directions active; open center; ${askingDirection ? `${askingDirection} Commission asking` : 'quiet margins'}`,
  }
}
