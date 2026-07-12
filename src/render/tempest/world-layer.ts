import type { EconomyAmount, WorldObjectManifest } from '../../content/universes/types'
import { tempestStatus, vishnulokStrainStatus } from '../../content/universes/f4-runtime'

export type VishnulokOwnershipThreshold = 0 | 1 | 10 | 25 | 50 | 100
export const WOVEN_ROUTE_CAP = 20
export const REFUGE_CLEARING_RADIUS_PERCENT = 16

export function vishnulokOwnershipThreshold(count: number): VishnulokOwnershipThreshold {
  if (count >= 100) return 100
  if (count >= 50) return 50
  if (count >= 25) return 25
  if (count >= 10) return 10
  return count >= 1 ? 1 : 0
}

export interface VishnulokShelterPlan {
  readonly id: string
  readonly sourceIds: readonly string[]
  readonly kind: 'harbor' | 'reef' | 'lamp' | 'arch' | 'shoal' | 'ferry'
  readonly threshold: VishnulokOwnershipThreshold
  readonly xPercent: number
  readonly yPercent: number
  readonly silhouette: string
}

const SHELTER_SEATS = [
  { index: 0, kind: 'harbor', xPercent: 18, yPercent: 57 },
  { index: 3, kind: 'reef', xPercent: 28, yPercent: 75 },
  { index: 6, kind: 'lamp', xPercent: 45, yPercent: 82 },
  { index: 9, kind: 'arch', xPercent: 62, yPercent: 80 },
  { index: 12, kind: 'shoal', xPercent: 78, yPercent: 68 },
  { index: 15, kind: 'ferry', xPercent: 82, yPercent: 48 },
] as const

export function planVishnulokShelters(
  objects: readonly WorldObjectManifest[],
  owned: Readonly<Record<string, number>>,
  quality: 'low' | 'balanced' | 'high' = 'high',
): readonly VishnulokShelterPlan[] {
  const generators = objects.filter(({ sourceKind }) => sourceKind === 'generator')
  const plans = SHELTER_SEATS.flatMap((seat): VishnulokShelterPlan[] => {
    const band = generators.slice(seat.index, seat.index + 3)
    const count = Math.max(0, ...band.map(({ sourceId }) => owned[sourceId] ?? 0))
    const threshold = vishnulokOwnershipThreshold(count)
    if (threshold === 0 || band.length === 0) return []
    return [{
      id: `vishnulok-shelter-${seat.kind}`,
      sourceIds: band.map(({ sourceId }) => sourceId),
      kind: seat.kind,
      threshold,
      xPercent: seat.xPercent,
      yPercent: seat.yPercent,
      silhouette: `${seat.kind} shelter at ownership form ${threshold}, with an open threshold facing the refuge`,
    }]
  })
  return quality === 'low' ? plans.filter((_, index) => index % 2 === 0) : plans
}

export interface WovenRoutePlan {
  readonly id: string
  readonly from: number
  readonly to: number
  readonly age: 'old' | 'kept' | 'fresh'
  readonly numberedPath: string
}

export interface LivingChartPlan {
  readonly routes: readonly WovenRoutePlan[]
  readonly totalRoutes: number
  readonly unrenderedRoutes: number
}

export function planVishnulokLivingChart(wovenRoutes: number, completedReturns: number): LivingChartPlan {
  const totalRoutes = Math.max(0, Math.floor(wovenRoutes)) + Math.floor(Math.max(0, completedReturns) / 10)
  const visible = Math.min(WOVEN_ROUTE_CAP, totalRoutes)
  return {
    routes: Array.from({ length: visible }, (_, index) => {
      const from = index % SHELTER_SEATS.length
      const to = (index * 2 + 3) % SHELTER_SEATS.length
      return {
        id: `woven-route-${index + 1}`,
        from,
        to,
        age: index === visible - 1 ? 'fresh' : index < Math.max(0, visible - 12) ? 'old' : 'kept',
        numberedPath: `${from + 1} → ${to + 1} → refuge → ${from + 1}`,
      }
    }),
    totalRoutes,
    unrenderedRoutes: Math.max(0, totalRoutes - WOVEN_ROUTE_CAP),
  }
}

export interface VishnulokReturnPlan {
  readonly active: boolean
  readonly confluence: boolean
  readonly routeLength: number
  readonly progressLabel: string
  readonly motion: 'travel' | 'static-numbered-path'
}

export function planVishnulokReturn(
  state: Readonly<Record<string, EconomyAmount>> | undefined,
  reducedMotion: boolean,
): VishnulokReturnPlan {
  const status = tempestStatus(state)
  const active = status.boostRemainingSec > 0 || status.secondBoostRemainingSec > 0
  return {
    active,
    confluence: status.confluenceActive,
    routeLength: status.length,
    progressLabel: active
      ? `${status.path.name}, ${status.length} numbered shelters, ${Math.ceil(Math.max(status.boostRemainingSec, status.secondBoostRemainingSec))} seconds returning`
      : `${status.path.name}, still water, ${Math.round(status.charge)} percent continuity`,
    motion: reducedMotion ? 'static-numbered-path' : 'travel',
  }
}

export interface VishnulokStrainMarkerPlan {
  readonly id: string
  readonly name: string
  readonly glyph: string
  readonly label: string
  readonly silhouette: string
  readonly pattern: string
  readonly xPercent: number
  readonly yPercent: number
}

export function planVishnulokStrainMarker(
  state: Readonly<Record<string, EconomyAmount>> | undefined,
): VishnulokStrainMarkerPlan | null {
  const status = vishnulokStrainStatus(state)
  if (status.phase !== 'present') return null
  const index = ['thinning-coast', 'scattered-school', 'crowded-shelter', 'divided-currents'].indexOf(status.strain.id)
  return {
    id: status.strain.id,
    name: status.strain.name,
    glyph: status.strain.glyph,
    label: status.explanation,
    silhouette: status.strain.silhouette,
    pattern: status.strain.pattern,
    xPercent: [24, 70, 35, 73][index] ?? 70,
    yPercent: [48, 55, 68, 72][index] ?? 55,
  }
}
