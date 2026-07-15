import type {
  ArchiveRecordDef,
  MotionGrammar,
  UniversePackV2,
  VisualState,
} from '../content/universes/types'
import {
  hudClearanceRect,
  rectIntersectsHudClearance,
  rectsIntersect,
  type HudClearanceRect,
  type HudClearanceViewport,
} from './hud-clearance'
import { rectIntersectsHeartTarget } from './heart-target'

export type ArchiveLandmarkMode = 'standard' | 'reduced-motion' | 'low-quality'
export type ArchiveHintPlacement = 'above' | 'below'

const ARCHIVE_HINT_HEIGHT_PX = 7.2 * 16
const ARCHIVE_HINT_ANCHOR_OFFSET_PX = (3.15 * 16) / 2 + 0.75 * 16
const BOTTOM_UI_CLEARANCE_PX = 4 * 16

/**
 * Places landmark copy on the side of its anchor with enough unobstructed room.
 * The centered HUD is the upper boundary and the dock/Lumen lane is the lower
 * boundary, so the same rule works for every universe and viewport.
 */
export function archiveHintPlacement(
  slot: Pick<ArchiveLandmarkSlot, 'y'>,
  viewport: HudClearanceViewport,
  topUiBottom = hudClearanceRect(viewport).height,
): ArchiveHintPlacement {
  const anchorY = slot.y * viewport.height
  const roomAbove = anchorY - ARCHIVE_HINT_ANCHOR_OFFSET_PX - topUiBottom
  const roomBelow = viewport.height - BOTTOM_UI_CLEARANCE_PX - anchorY - ARCHIVE_HINT_ANCHOR_OFFSET_PX
  if (roomAbove >= ARCHIVE_HINT_HEIGHT_PX) return 'above'
  if (roomBelow >= ARCHIVE_HINT_HEIGHT_PX) return 'below'
  return roomBelow >= roomAbove ? 'below' : 'above'
}

export type ArchiveLandmarkSlotId =
  | 'scatter-01' | 'scatter-02' | 'scatter-03' | 'scatter-04' | 'scatter-05' | 'scatter-06'
  | 'scatter-07' | 'scatter-08' | 'scatter-09' | 'scatter-10' | 'scatter-11' | 'scatter-12'
  | 'scatter-13' | 'scatter-14' | 'scatter-15' | 'scatter-16' | 'scatter-17' | 'scatter-18'
  | 'scatter-19' | 'scatter-20' | 'scatter-21' | 'scatter-22' | 'scatter-23' | 'scatter-24'

export interface ArchiveLandmarkSlot {
  readonly id: ArchiveLandmarkSlotId
  readonly screenZone: 'near' | 'far'
  /** Normalized desktop-stage coordinate, independent of viewport pixels. */
  readonly x: number
  /** Normalized desktop-stage coordinate, independent of viewport pixels. */
  readonly y: number
  /** Clearance from the Heart expressed in the same Heart-radius unit as the manifest. */
  readonly heartClearanceRadii: number
  readonly avoids: readonly ['heart', 'top-ui', 'left-ui', 'bottom-ui']
}

/**
 * An oversized, mirrored pool of irregular stage positions. Each universe
 * deterministically selects twelve across the complete stage. Reversible opaque
 * side panels mask the world instead of permanently shrinking its composition.
 */
export const ARCHIVE_LANDMARK_SLOTS: readonly ArchiveLandmarkSlot[] = [
  ...([
    ['scatter-01', 'far', 0.20, 0.27],
    ['scatter-02', 'near', 0.80, 0.31],
    ['scatter-03', 'far', 0.36, 0.26],
    ['scatter-04', 'near', 0.64, 0.34],
    ['scatter-05', 'far', 0.28, 0.41],
    ['scatter-06', 'near', 0.72, 0.46],
    ['scatter-07', 'far', 0.10, 0.52],
    ['scatter-08', 'near', 0.90, 0.57],
    ['scatter-09', 'far', 0.18, 0.61],
    ['scatter-10', 'near', 0.82, 0.69],
    ['scatter-11', 'far', 0.26, 0.76],
    ['scatter-12', 'near', 0.74, 0.72],
    ['scatter-13', 'far', 0.34, 0.82],
    ['scatter-14', 'near', 0.66, 0.74],
    ['scatter-15', 'far', 0.06, 0.83],
    ['scatter-16', 'near', 0.94, 0.59],
    ['scatter-17', 'far', 0.42, 0.24],
    ['scatter-18', 'near', 0.58, 0.38],
    ['scatter-19', 'far', 0.14, 0.55],
    ['scatter-20', 'near', 0.86, 0.56],
    ['scatter-21', 'far', 0.30, 0.58],
    ['scatter-22', 'near', 0.70, 0.60],
    ['scatter-23', 'far', 0.38, 0.63],
    ['scatter-24', 'near', 0.62, 0.65],
  ] as const).map(([id, screenZone, x, y]) => ({
    id,
    screenZone,
    x,
    y,
    heartClearanceRadii: 1.75,
    avoids: ['heart', 'top-ui', 'left-ui', 'bottom-ui'] as const,
  })),
]

export interface ArchiveLandmarkPresentationDescriptor {
  readonly recordId: string
  /** Higher values receive attention first; ties are broken by stable IDs. */
  readonly priority: number
  /** Universe-authored prefix for pointer/focus hover copy. */
  readonly hoverTheme: string
  /** Universe-authored prefix for screen-reader copy. */
  readonly accessibleTheme: string
  /** Records keep their shelf relationship without collapsing their visible identity. */
  readonly fallbackGroupId: string
  readonly fallbackGroupLabel: string
}

export interface ResolvedArchiveLandmarkVisual {
  readonly source: ArchiveLandmarkMode
  readonly material: readonly string[]
  readonly silhouette: string
  readonly motion: MotionGrammar
  /** The exact authored fallback object, or null when the base manifest is used. */
  readonly fallbackState: VisualState | null
}

export interface ArchiveLandmarkRecordPresentation {
  readonly id: string
  readonly name: string
  readonly observation: string
  readonly implication: string
  readonly effectDescription: string
  /** Base identity is retained even while a fallback visual is active. */
  readonly baseMaterial: readonly string[]
  readonly baseSilhouette: string
  readonly visual: ResolvedArchiveLandmarkVisual
  readonly hoverDescription: string
  readonly accessibleDescription: string
}

export interface VisibleArchiveLandmark {
  readonly id: string
  readonly interactive: true
  readonly grouped: boolean
  readonly groupLabel: string
  readonly representativeRecordId: string
  readonly recordIds: readonly string[]
  readonly records: readonly ArchiveLandmarkRecordPresentation[]
  readonly priority: number
  readonly slot: ArchiveLandmarkSlot
  readonly visual: ResolvedArchiveLandmarkVisual
  readonly hoverDescription: string
  readonly accessibleDescription: string
}

export type HiddenArchiveLandmarkReason = 'attention-budget' | 'placement-budget'

export interface HiddenArchiveLandmark {
  readonly id: string
  readonly recordIds: readonly string[]
  readonly reason: HiddenArchiveLandmarkReason
}

export interface ArchiveLandmarkPlan {
  readonly universeId: UniversePackV2['id']
  readonly mode: ArchiveLandmarkMode
  readonly attentionLimit: number
  readonly visibleInteractiveCount: number
  readonly landmarks: readonly VisibleArchiveLandmark[]
  readonly hidden: readonly HiddenArchiveLandmark[]
  readonly unknownRecordIds: readonly string[]
  readonly missingDescriptorRecordIds: readonly string[]
  readonly unknownDescriptorRecordIds: readonly string[]
}

interface Candidate {
  readonly record: ArchiveRecordDef
  readonly descriptor: ArchiveLandmarkPresentationDescriptor
}

interface CandidateUnit {
  readonly id: string
  readonly label: string
  readonly priority: number
  readonly candidates: readonly Candidate[]
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function compareCandidates(left: Candidate, right: Candidate): number {
  return right.descriptor.priority - left.descriptor.priority
    || compareText(left.record.id, right.record.id)
}

function assertDescriptor(
  descriptor: ArchiveLandmarkPresentationDescriptor,
  index: number,
): void {
  const path = `descriptors[${index}]`
  if (!descriptor.recordId.trim()) throw new TypeError(`${path}.recordId must not be empty.`)
  if (!Number.isFinite(descriptor.priority)) throw new TypeError(`${path}.priority must be finite.`)
  if (!descriptor.hoverTheme.trim()) throw new TypeError(`${path}.hoverTheme must not be empty.`)
  if (!descriptor.accessibleTheme.trim()) throw new TypeError(`${path}.accessibleTheme must not be empty.`)
  if (!descriptor.fallbackGroupId.trim()) throw new TypeError(`${path}.fallbackGroupId must not be empty.`)
  if (!descriptor.fallbackGroupLabel.trim()) throw new TypeError(`${path}.fallbackGroupLabel must not be empty.`)
}

function descriptorMap(
  descriptors: readonly ArchiveLandmarkPresentationDescriptor[],
): ReadonlyMap<string, ArchiveLandmarkPresentationDescriptor> {
  const result = new Map<string, ArchiveLandmarkPresentationDescriptor>()
  descriptors.forEach((descriptor, index) => {
    assertDescriptor(descriptor, index)
    if (result.has(descriptor.recordId)) {
      throw new TypeError(`Duplicate archive landmark descriptor for ${descriptor.recordId}.`)
    }
    result.set(descriptor.recordId, descriptor)
  })
  return result
}

function fallbackFor(record: ArchiveRecordDef, mode: ArchiveLandmarkMode): VisualState | null {
  if (mode === 'reduced-motion') return record.object.reducedMotionState
  if (mode === 'low-quality') return record.object.lowQualityState
  return null
}

function resolveVisual(
  record: ArchiveRecordDef,
  mode: ArchiveLandmarkMode,
): ResolvedArchiveLandmarkVisual {
  const fallbackState = fallbackFor(record, mode)
  return {
    source: mode,
    material: fallbackState?.material ?? record.object.material,
    silhouette: fallbackState?.silhouette ?? record.object.silhouette,
    motion: fallbackState?.motion ?? record.object.motion,
    fallbackState,
  }
}

function recordPresentation(
  candidate: Candidate,
  mode: ArchiveLandmarkMode,
): ArchiveLandmarkRecordPresentation {
  const { descriptor, record } = candidate
  return {
    id: record.id,
    name: record.name,
    observation: record.observation,
    implication: record.implication,
    effectDescription: record.effectDescription,
    baseMaterial: record.object.material,
    baseSilhouette: record.object.silhouette,
    visual: resolveVisual(record, mode),
    hoverDescription: `${descriptor.hoverTheme} — ${record.name}. Observation: ${record.observation} Implication: ${record.implication} Effect: ${record.effectDescription}`,
    accessibleDescription: `${descriptor.accessibleTheme}. ${record.name}. Observation: ${record.observation} Implication: ${record.implication} Effect: ${record.effectDescription}`,
  }
}

function candidateUnits(candidates: readonly Candidate[]): CandidateUnit[] {
  return candidates.map((candidate) => ({
    id: `archive-record:${candidate.record.id}`,
    label: candidate.record.name,
    priority: candidate.descriptor.priority,
    candidates: [candidate],
  }))
}

function stableHash(value: string): number {
  let hash = 2_166_136_261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return hash >>> 0
}

function stageBandForX(x: number): 0 | 1 | 2 | 3 {
  if (x <= 0.26) return 0
  if (x < 0.5) return 1
  if (x < 0.74) return 2
  return 3
}

function slotFor(
  unit: CandidateUnit,
  universeId: UniversePackV2['id'],
  usedSlotIds: ReadonlySet<ArchiveLandmarkSlotId>,
  viewport: HudClearanceViewport,
  topUiClearance?: HudClearanceRect,
): ArchiveLandmarkSlot | null {
  const maximumRequiredClearance = Math.max(
    ...unit.candidates.map(({ record }) => record.object.minimumHeartDistance),
  )
  const usedBandCounts = [0, 0, 0, 0]
  for (const slot of ARCHIVE_LANDMARK_SLOTS) {
    if (usedSlotIds.has(slot.id)) usedBandCounts[stageBandForX(slot.x)] += 1
  }
  const leastUsed = Math.min(...usedBandCounts)
  const preferredBands = usedBandCounts.flatMap((count, band) => count === leastUsed ? [band] : [])
  const bandOffset = stableHash(`${universeId}:${unit.id}:band`) % preferredBands.length
  const preferredBand = preferredBands[bandOffset]
  const offset = stableHash(`${universeId}:${unit.id}`) % ARCHIVE_LANDMARK_SLOTS.length
  const rotatedSlots = ARCHIVE_LANDMARK_SLOTS.map((_, step) => (
    ARCHIVE_LANDMARK_SLOTS[(offset + step) % ARCHIVE_LANDMARK_SLOTS.length]
  ))
  const orderedSlots = [
    ...rotatedSlots.filter((slot) => stageBandForX(slot.x) === preferredBand),
    ...rotatedSlots.filter((slot) => stageBandForX(slot.x) !== preferredBand),
  ]
  for (const slot of orderedSlots) {
    if (usedSlotIds.has(slot.id)) continue
    if (slot.heartClearanceRadii < maximumRequiredClearance) continue
    const landmarkSize = 3.5 * 16
    const landmarkRect = {
      x: slot.x * viewport.width - landmarkSize / 2,
      y: slot.y * viewport.height - landmarkSize / 2,
      width: landmarkSize,
      height: landmarkSize,
    }
    if (topUiClearance
      ? rectsIntersect(landmarkRect, topUiClearance)
      : rectIntersectsHudClearance(landmarkRect, viewport)) continue
    if (rectIntersectsHeartTarget(landmarkRect, viewport)) continue
    const topUiBottom = topUiClearance
      ? topUiClearance.y + topUiClearance.height
      : hudClearanceRect(viewport).height
    const hintPlacement = archiveHintPlacement(slot, viewport, topUiBottom)
    const anchorY = slot.y * viewport.height
    const hintTop = hintPlacement === 'above'
      ? anchorY - ARCHIVE_HINT_ANCHOR_OFFSET_PX - ARCHIVE_HINT_HEIGHT_PX
      : anchorY + ARCHIVE_HINT_ANCHOR_OFFSET_PX
    if (hintTop < topUiBottom) continue
    return slot
  }
  return null
}

/**
 * Produces a pure archive-landmark render plan. Input ordering never affects ranking,
 * grouping, placement, fallbacks, or diagnostics.
 */
export function planArchiveLandmarks(
  pack: UniversePackV2,
  unlockedRecordIds: readonly string[],
  descriptors: readonly ArchiveLandmarkPresentationDescriptor[],
  mode: ArchiveLandmarkMode = 'standard',
  viewport: HudClearanceViewport = { width: 1280, height: 720 },
  topUiClearance?: HudClearanceRect,
): ArchiveLandmarkPlan {
  const descriptorByRecord = descriptorMap(descriptors)
  const recordById = new Map(pack.archive.records.map((record) => [record.id, record]))
  const unlockedIds = [...new Set(unlockedRecordIds)].sort(compareText)
  const unknownRecordIds = unlockedIds.filter((id) => !recordById.has(id))
  const missingDescriptorRecordIds = unlockedIds.filter((id) => recordById.has(id) && !descriptorByRecord.has(id))
  const unknownDescriptorRecordIds = [...descriptorByRecord.keys()]
    .filter((id) => !recordById.has(id))
    .sort(compareText)

  const candidates = unlockedIds.flatMap((id): Candidate[] => {
    const record = recordById.get(id)
    const descriptor = descriptorByRecord.get(id)
    return record && descriptor ? [{ record, descriptor }] : []
  }).sort(compareCandidates)

  const units = candidateUnits(candidates).sort((left, right) => (
    right.priority - left.priority || compareText(left.id, right.id)
  ))
  const attentionLimit = Math.min(12, ARCHIVE_LANDMARK_SLOTS.length)
  const usedSlotIds = new Set<ArchiveLandmarkSlotId>()
  const landmarks: VisibleArchiveLandmark[] = []
  const hidden: HiddenArchiveLandmark[] = []

  for (const unit of units) {
    const recordIds = unit.candidates.map(({ record }) => record.id)
    if (landmarks.length >= attentionLimit) {
      hidden.push({ id: unit.id, recordIds, reason: 'attention-budget' })
      continue
    }
    const slot = slotFor(unit, pack.id, usedSlotIds, viewport, topUiClearance)
    if (!slot) {
      hidden.push({ id: unit.id, recordIds, reason: 'placement-budget' })
      continue
    }
    const records = unit.candidates.map((candidate) => recordPresentation(candidate, mode))
    const representative = records[0]
    usedSlotIds.add(slot.id)
    landmarks.push({
      id: unit.id,
      interactive: true,
      grouped: records.length > 1,
      groupLabel: unit.label,
      representativeRecordId: representative.id,
      recordIds,
      records,
      priority: unit.priority,
      slot,
      visual: representative.visual,
      hoverDescription: records.map(({ hoverDescription }) => hoverDescription).join(' | '),
      accessibleDescription: `${unit.label}. ${records.map(({ accessibleDescription }) => accessibleDescription).join(' ')}`,
    })
  }

  return {
    universeId: pack.id,
    mode,
    attentionLimit,
    visibleInteractiveCount: landmarks.length,
    landmarks,
    hidden,
    unknownRecordIds,
    missingDescriptorRecordIds,
    unknownDescriptorRecordIds,
  }
}
