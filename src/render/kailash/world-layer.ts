import type { EconomyAmount, WorldObjectManifest } from '../../content/universes/types'
import { KAILASH_FRONTS, kailashFrontStatus, type KailashFrontPhase } from '../../content/universes/f4-runtime'

export type KailashOwnershipThreshold = 0 | 1 | 10 | 25 | 50 | 100
export type KailashFormationKind = 'snowfield' | 'river' | 'ash-grove' | 'open-pass' | 'cairn' | 'horizon'

export interface KailashFormationPlan {
  readonly id: string
  readonly kind: KailashFormationKind
  readonly sourceIds: readonly string[]
  readonly threshold: KailashOwnershipThreshold
  readonly owned: number
  readonly xPercent: number
  readonly bottomPercent: number
  readonly scale: number
  readonly basePath: string
  readonly detailPath: string
  readonly routePath: string
}

const FORMATION_SEATS = [
  {
    index: 0, kind: 'snowfield', xPercent: 6, bottomPercent: 17, scale: 0.88,
    basePath: 'M2 42L12 31L19 34L31 12L39 26L47 20L58 42Z',
    detailPath: 'M12 31L19 34L31 12L39 26M25 22L31 12L35 20',
    routePath: 'M31 20C28 27 34 30 29 39',
  },
  {
    index: 3, kind: 'river', xPercent: 24, bottomPercent: 8, scale: 1.02,
    basePath: 'M1 43L10 32L18 35L28 16L36 29L45 24L59 43Z',
    detailPath: 'M10 32L18 35L28 16L36 29L45 24',
    routePath: 'M29 19C21 25 36 29 27 34C21 38 31 40 26 45',
  },
  {
    index: 6, kind: 'ash-grove', xPercent: 39, bottomPercent: 19, scale: 0.82,
    basePath: 'M2 43L2 37L13 31L22 34L33 26L42 31L58 24L58 43Z',
    detailPath: 'M4 37L14 32L22 35L33 27L42 32L56 25',
    routePath: 'M17 39V29M13 33L17 29L21 33M39 40V31M35 35L39 31L43 35',
  },
  {
    index: 9, kind: 'open-pass', xPercent: 61, bottomPercent: 15, scale: 0.98,
    basePath: 'M1 43L17 14L25 34L31 34L42 11L59 43H39L31 37L23 37L17 43Z',
    detailPath: 'M1 43L17 14L25 34M31 34L42 11L59 43',
    routePath: 'M27 43C27 39 31 39 31 34',
  },
  {
    index: 12, kind: 'cairn', xPercent: 76, bottomPercent: 20, scale: 0.8,
    basePath: 'M4 43L12 37L19 39L26 31L34 34L42 24L51 30L58 43Z',
    detailPath: 'M20 39L25 34H35L39 39M25 34L28 28H34L35 34M28 28L31 23L34 28',
    routePath: 'M8 40C20 35 43 42 55 35',
  },
  {
    index: 15, kind: 'horizon', xPercent: 94, bottomPercent: 9, scale: 1.06,
    basePath: 'M1 43L9 34L17 37L27 24L36 33L46 21L59 43Z',
    detailPath: 'M4 36C15 29 23 34 31 28C39 22 48 27 56 20',
    routePath: 'M5 39C16 34 25 40 35 34C44 29 50 32 57 28',
  },
] as const satisfies readonly {
  index: number
  kind: KailashFormationKind
  xPercent: number
  bottomPercent: number
  scale: number
  basePath: string
  detailPath: string
  routePath: string
}[]

export function kailashOwnershipThreshold(count: number): KailashOwnershipThreshold {
  if (count >= 100) return 100
  if (count >= 50) return 50
  if (count >= 25) return 25
  if (count >= 10) return 10
  return count >= 1 ? 1 : 0
}

/**
 * Six landform seats represent the eighteen stable Kindlings in ordered bands.
 * Ownership changes each landform's structure; it never increases object count.
 */
export function planKailashFormations(
  objects: readonly WorldObjectManifest[],
  owned: Readonly<Record<string, number>>,
  quality: 'low' | 'balanced' | 'high' = 'high',
): readonly KailashFormationPlan[] {
  const generators = objects.filter(({ sourceKind }) => sourceKind === 'generator')
  const planned = FORMATION_SEATS.flatMap((seat): KailashFormationPlan[] => {
    const band = generators.slice(seat.index, seat.index + 3)
    if (band.length === 0) return []
    const count = Math.max(...band.map(({ sourceId }) => Math.max(0, Math.floor(owned[sourceId] ?? 0))))
    const threshold = kailashOwnershipThreshold(count)
    if (threshold === 0) return []
    return [{
      id: `kailash-formation-${seat.kind}`,
      kind: seat.kind,
      sourceIds: band.map(({ sourceId }) => sourceId),
      threshold,
      owned: count,
      xPercent: seat.xPercent,
      bottomPercent: seat.bottomPercent,
      scale: seat.scale,
      basePath: seat.basePath,
      detailPath: seat.detailPath,
      routePath: seat.routePath,
    }]
  })
  return quality === 'low'
    ? planned.filter(({ kind }) => kind === 'snowfield' || kind === 'river' || kind === 'open-pass' || kind === 'horizon')
    : planned
}

export const SUMMIT_CLEARANCE_Y_PERCENT = 30
export const DESCENT_STATION_CAP = 18
export const ASH_BAND_CAP = 8

export type DescentStationKind = 'cairn' | 'lamp' | 'rope-line' | 'way-shelter' | 'spring' | 'grove'

export interface DescentStationDef {
  readonly kind: DescentStationKind
  readonly name: string
  readonly silhouette: string
  readonly xPercent: number
  readonly yPercent: number
}

export const DESCENT_STATIONS: readonly DescentStationDef[] = [
  { kind: 'cairn', name: 'First Cairn', silhouette: 'three unequal stones beside an open trail notch', xPercent: 55, yPercent: 34 },
  { kind: 'rope-line', name: 'High Traverse', silhouette: 'single rope line between two anchor stones', xPercent: 47, yPercent: 38 },
  { kind: 'cairn', name: 'Wind Shoulder Cairn', silhouette: 'flat-capped stones leaning from the prevailing wind', xPercent: 39, yPercent: 42 },
  { kind: 'lamp', name: 'Upper Lamp', silhouette: 'shielded lamp facing the descending switchback', xPercent: 45, yPercent: 46 },
  { kind: 'way-shelter', name: 'Stone Ledge Shelter', silhouette: 'low roof set into the slope with an open threshold', xPercent: 53, yPercent: 49 },
  { kind: 'rope-line', name: 'Cloud Stair Rope', silhouette: 'rope stitched down five offset ledges', xPercent: 60, yPercent: 53 },
  { kind: 'cairn', name: 'Midway Cairn', silhouette: 'stacked stones beside a route fork, both paths open', xPercent: 52, yPercent: 56 },
  { kind: 'spring', name: 'Meltwater Spring', silhouette: 'small pool where the silver thread widens', xPercent: 43, yPercent: 59 },
  { kind: 'lamp', name: 'Middle Lamp', silhouette: 'lamp under an open roof beside the trail', xPercent: 36, yPercent: 62 },
  { kind: 'way-shelter', name: 'Cedar Way-Shelter', silhouette: 'three cedar profiles around a resting bench', xPercent: 44, yPercent: 65 },
  { kind: 'rope-line', name: 'Lower Traverse', silhouette: 'hand line crossing a scree field', xPercent: 54, yPercent: 67 },
  { kind: 'cairn', name: 'Ash Meadow Cairn', silhouette: 'dark-banded stones at the meadow edge', xPercent: 63, yPercent: 70 },
  { kind: 'spring', name: 'Braided Spring', silhouette: 'two silver threads rejoining below a stone', xPercent: 57, yPercent: 72 },
  { kind: 'grove', name: 'Shelter Grove Gate', silhouette: 'open grove canopy above distinct root gaps', xPercent: 47, yPercent: 74 },
  { kind: 'lamp', name: 'Valley Lamp', silhouette: 'lamp at a low wall, lighting the last turn', xPercent: 39, yPercent: 76 },
  { kind: 'way-shelter', name: 'Valley Threshold', silhouette: 'nested valley walls around an open doorway', xPercent: 48, yPercent: 78 },
  { kind: 'cairn', name: 'Last Cairn', silhouette: 'small stones beside level ground', xPercent: 56, yPercent: 79 },
  { kind: 'lamp', name: 'The Lowest Lamp', silhouette: 'warm lamp beside a cup left out for the next traveler', xPercent: 61, yPercent: 80 },
]

export interface DescentStationPlan extends DescentStationDef {
  readonly stage: 'fresh' | 'kept'
}

export interface DescentPlan {
  readonly stations: readonly DescentStationPlan[]
  readonly unrenderedTraces: number
}

export function planKailashDescent(traces: number): DescentPlan {
  const count = Math.max(0, Math.floor(Number.isFinite(traces) ? traces : 0))
  const visible = Math.min(DESCENT_STATION_CAP, count)
  return {
    stations: DESCENT_STATIONS.slice(0, visible).map((station, index) => ({
      ...station,
      stage: index === visible - 1 ? 'fresh' : 'kept',
    })),
    unrenderedTraces: Math.max(0, count - DESCENT_STATION_CAP),
  }
}

export interface ValleyFeaturePlan {
  readonly id: string
  readonly sourceId: string
  readonly name: string
  readonly threshold: KailashOwnershipThreshold
  readonly silhouette: string
  readonly xPercent: number
  readonly yPercent: number
}

const VALLEY_SEATS = [
  { sourceId: 'kailash-kindling-04', name: 'River Braid', xPercent: 70, yPercent: 74, stages: ['single silver thread', 'thread with one visible pool', 'two braided threads', 'braid feeding terrace channels', 'full braid with stepped pools'] },
  { sourceId: 'kailash-kindling-05', name: 'Cedar Stand', xPercent: 22, yPercent: 76, stages: ['one cedar profile', 'three cedar profiles', 'staggered grove edge', 'deep grove with open paths', 'grove sheltering four rooflines'] },
  { sourceId: 'kailash-kindling-07', name: 'Ash Meadow Recovery', xPercent: 80, yPercent: 78, stages: ['dark meadow seam', 'pale shoots along the seam', 'shoots crossing the seam', 'young growth over old ash', 'meadow in flower, seam still visible'] },
  { sourceId: 'kailash-kindling-11', name: 'Valley Shelters', xPercent: 30, yPercent: 79, stages: ['one unlit dwelling', 'one lit dwelling', 'three dwellings, two lit', 'four dwellings lit with walk paths', 'lit settlement with an open commons'] },
  { sourceId: 'kailash-kindling-12', name: 'High Lake Shore', xPercent: 12, yPercent: 71, stages: ['dark oval lake', 'lake with one reflection mark', 'lake reflecting three horizon marks', 'lake reflecting five horizon marks', 'still lake with a small pier'] },
] as const

export function planKailashValley(owned: Readonly<Record<string, number>>): readonly ValleyFeaturePlan[] {
  return VALLEY_SEATS.flatMap((seat): ValleyFeaturePlan[] => {
    const threshold = kailashOwnershipThreshold(Math.max(0, Math.floor(owned[seat.sourceId] ?? 0)))
    if (threshold === 0) return []
    const stageIndex = threshold >= 100 ? 4 : threshold >= 50 ? 3 : threshold >= 25 ? 2 : threshold >= 10 ? 1 : 0
    return [{ id: `${seat.sourceId}-valley`, sourceId: seat.sourceId, name: seat.name, threshold, silhouette: seat.stages[stageIndex], xPercent: seat.xPercent, yPercent: seat.yPercent }]
  })
}

export interface AshBandPlan {
  readonly index: number
  readonly layer: 'snow' | 'ash' | 'soil' | 'shoot'
  readonly silhouette: string
}

export function planKailashAshBands(releaseCount: number): readonly AshBandPlan[] {
  const layers = ['snow', 'ash', 'soil', 'shoot'] as const
  const count = Math.min(ASH_BAND_CAP, Math.max(0, Math.floor(Number.isFinite(releaseCount) ? releaseCount : 0)))
  return Array.from({ length: count }, (_, index) => ({ index, layer: layers[index % layers.length], silhouette: `${layers[index % layers.length]} band ${index + 1} held in the slope core` }))
}

export interface FrontWeatherPlan {
  readonly frontId: string
  readonly phase: KailashFrontPhase
  readonly silhouette: string
  readonly motion: 'drift' | 'still'
  readonly reducedMotionState: string
  readonly caption: string
}

export function planKailashFrontWeather(
  state: Readonly<Record<string, EconomyAmount>> | undefined,
  owned: Readonly<Record<string, number>>,
): FrontWeatherPlan | null {
  const status = kailashFrontStatus(state, owned)
  if (status.phase === 'calm') return null
  const front = KAILASH_FRONTS.find(({ id }) => id === status.front.id) ?? status.front
  return {
    frontId: front.id,
    phase: status.phase,
    silhouette: status.phase === 'approaching' ? `copper weather vane turned toward ${front.name.toLowerCase()}, above the ridge line` : front.silhouette,
    motion: status.phase === 'active' ? 'drift' : 'still',
    reducedMotionState: front.reducedMotionState,
    caption: status.explanation,
  }
}
