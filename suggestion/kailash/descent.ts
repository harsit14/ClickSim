/**
 * REFERENCE IMPLEMENTATION — Kailash world accumulation: the Inhabited Descent.
 * See suggestion/README.md and LOKA_DEPTH_PLAN.md §5.3.
 *
 * Pure planning functions in the style of src/render/verdance/world-layer.ts:
 * they map progression facts (Descent Traces, Kindling ownership, Release
 * count, front status) to authored render plans. No canvas code here — the
 * integrated version feeds these plans to the same drawing layer the other
 * universes use.
 *
 * The one hard rule: the world fills DOWNWARD and OUTWARD. The summit and the
 * still point stay unoccupied in every state, at every quality tier, forever.
 * Nothing in these plans may place geometry above SUMMIT_CLEARANCE_Y_PERCENT
 * or inside the central heart clearing.
 */
import {
  KAILASH_FRONTS,
  kailashFrontStatus,
  type KailashFrontPhase,
} from './fronts'
import type { EconomyAmount } from '../../src/content/universes/types'

type NumericLawState = Record<string, EconomyAmount>

/** No descent station or weather band may render above this line (summit stays empty). */
export const SUMMIT_CLEARANCE_Y_PERCENT = 30
/** Rendered station cap; the trace counter keeps counting past it (§6, no silent caps: the overflow is reported in the plan). */
export const DESCENT_STATION_CAP = 18
/** Rendered ash-band cap for epoch Releases. */
export const ASH_BAND_CAP = 8

export type DescentStationKind = 'cairn' | 'lamp' | 'rope-line' | 'way-shelter' | 'spring' | 'grove'

export interface DescentStationDef {
  readonly kind: DescentStationKind
  readonly name: string
  readonly silhouette: string
  readonly xPercent: number
  readonly yPercent: number
}

/**
 * Authored switchback: stations appear in this fixed order as traces accrue,
 * descending from just below the summit clearance to the valley floor. The
 * lamp stations face the path down (Night Refuge Lamp archive), never up.
 */
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
  /** Newest station renders slightly brighter; older ones settle into 'kept'. */
  readonly stage: 'fresh' | 'kept'
}

export interface DescentPlan {
  readonly stations: readonly DescentStationPlan[]
  /** Traces beyond the rendered cap, surfaced in the world tooltip ("…and N more, kept along the way"). */
  readonly unrenderedTraces: number
}

export function planKailashDescent(traces: number): DescentPlan {
  const count = Math.max(0, Math.floor(Number.isFinite(traces) ? traces : 0))
  const visible = Math.min(DESCENT_STATION_CAP, count)
  const stations = DESCENT_STATIONS.slice(0, visible).map((station, index): DescentStationPlan => ({
    ...station,
    stage: index === visible - 1 ? 'fresh' : 'kept',
  }))
  return { stations, unrenderedTraces: Math.max(0, count - DESCENT_STATION_CAP) }
}

// --- Valley staging from Kindling ownership ---------------------------------

export type KailashOwnershipThreshold = 0 | 1 | 10 | 25 | 50 | 100

export function kailashOwnershipThreshold(count: number): KailashOwnershipThreshold {
  if (count >= 100) return 100
  if (count >= 50) return 50
  if (count >= 25) return 25
  if (count >= 10) return 10
  return count >= 1 ? 1 : 0
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

/**
 * Valley features keyed to specific Kindlings, staged by the standard
 * 1/10/25/50/100 thresholds. All sit in the valley band, well below the
 * summit clearance and outside the heart clearing.
 */
const VALLEY_SEATS = [
  { sourceId: 'kailash-kindling-04', name: 'River Braid', xPercent: 70, yPercent: 74, stages: ['single silver thread', 'thread with one visible pool', 'two braided threads', 'braid feeding terrace channels', 'full braid with stepped pools'] },
  { sourceId: 'kailash-kindling-05', name: 'Cedar Stand', xPercent: 22, yPercent: 76, stages: ['one cedar profile', 'three cedar profiles', 'staggered grove edge', 'deep grove with open paths', 'grove sheltering four rooflines'] },
  { sourceId: 'kailash-kindling-07', name: 'Ash Meadow Recovery', xPercent: 80, yPercent: 78, stages: ['dark meadow seam', 'pale shoots along the seam', 'shoots crossing the seam', 'young growth over old ash', 'meadow in flower, seam still visible'] },
  { sourceId: 'kailash-kindling-11', name: 'Valley Shelters', xPercent: 30, yPercent: 79, stages: ['one unlit dwelling', 'one lit dwelling', 'three dwellings, two lit', 'four dwellings lit with walk paths', 'lit settlement with an open commons'] },
  { sourceId: 'kailash-kindling-12', name: 'High Lake Shore', xPercent: 12, yPercent: 71, stages: ['dark oval lake', 'lake with one reflection mark', 'lake reflecting three horizon marks', 'lake reflecting five horizon marks', 'still lake with a small pier'] },
] as const

export function planKailashValley(owned: Readonly<Record<string, number>>): readonly ValleyFeaturePlan[] {
  return VALLEY_SEATS.flatMap((seat): ValleyFeaturePlan[] => {
    const count = Math.max(0, Math.floor(owned[seat.sourceId] ?? 0))
    const threshold = kailashOwnershipThreshold(count)
    if (threshold === 0) return []
    const stageIndex = threshold >= 100 ? 4 : threshold >= 50 ? 3 : threshold >= 25 ? 2 : threshold >= 10 ? 1 : 0
    return [{
      id: `${seat.sourceId}-valley`,
      sourceId: seat.sourceId,
      name: seat.name,
      threshold,
      silhouette: seat.stages[stageIndex],
      xPercent: seat.xPercent,
      yPercent: seat.yPercent,
    }]
  })
}

// --- Ash bands from epoch Releases -------------------------------------------

export interface AshBandPlan {
  readonly index: number
  readonly layer: 'snow' | 'ash' | 'soil' | 'shoot'
  readonly silhouette: string
}

/** Snow-Ash Core made visible: one band per completed Release, capped, losses kept legible under renewal. */
export function planKailashAshBands(releaseCount: number): readonly AshBandPlan[] {
  const layers = ['snow', 'ash', 'soil', 'shoot'] as const
  const count = Math.min(ASH_BAND_CAP, Math.max(0, Math.floor(Number.isFinite(releaseCount) ? releaseCount : 0)))
  return Array.from({ length: count }, (_, index) => ({
    index,
    layer: layers[index % layers.length],
    silhouette: `${layers[index % layers.length]} band ${index + 1} held in the slope core`,
  }))
}

// --- Weather rendering plan ---------------------------------------------------

export interface FrontWeatherPlan {
  readonly frontId: string
  readonly phase: KailashFrontPhase
  readonly silhouette: string
  readonly motion: 'drift' | 'still'
  readonly reducedMotionState: string
  readonly caption: string
}

/**
 * What the sky shows for the current front state. The approach warning is a
 * turned weather vane plus label — never a flashing alert (§6.4). Reduced
 * motion always receives the front's static composition.
 */
export function planKailashFrontWeather(
  state: Readonly<NumericLawState> | undefined,
  owned: Readonly<Record<string, number>>,
): FrontWeatherPlan | null {
  const status = kailashFrontStatus(state, owned)
  if (status.phase === 'calm') return null
  const front = KAILASH_FRONTS.find(({ id }) => id === status.front.id) ?? status.front
  return {
    frontId: front.id,
    phase: status.phase,
    silhouette: status.phase === 'approaching'
      ? `copper weather vane turned toward ${front.name.toLowerCase()}, above the ridge line`
      : front.silhouette,
    motion: status.phase === 'active' ? 'drift' : 'still',
    reducedMotionState: front.reducedMotionState,
    caption: status.explanation,
  }
}
