import type {
  ArchiveRecordDef,
  MotionGrammar,
  UniversePackV2,
  VisualState,
} from '../content/universes/types'

export type ArchiveLandmarkMode = 'standard' | 'reduced-motion' | 'low-quality'

export type ArchiveLandmarkSlotId =
  | 'far-upper-left'
  | 'far-upper-right'
  | 'near-lower-left'
  | 'near-lower-right'

export interface ArchiveLandmarkSlot {
  readonly id: ArchiveLandmarkSlotId
  readonly screenZone: 'near' | 'far'
  /** Normalized desktop-stage coordinate, independent of viewport pixels. */
  readonly x: number
  /** Normalized desktop-stage coordinate, independent of viewport pixels. */
  readonly y: number
  /** Clearance from the Heart expressed in the same Heart-radius unit as the manifest. */
  readonly heartClearanceRadii: number
  readonly avoids: readonly ['heart', 'top-ui', 'left-ui', 'right-ui', 'bottom-ui']
}

/**
 * Four authored placement slots outside the central Heart target and common desktop UI
 * rails. A plan uses at most three of them so an archive reveal never fills the stage.
 */
export const ARCHIVE_LANDMARK_SLOTS: readonly ArchiveLandmarkSlot[] = [
  {
    id: 'far-upper-left',
    screenZone: 'far',
    x: 0.26,
    y: 0.24,
    heartClearanceRadii: 1.75,
    avoids: ['heart', 'top-ui', 'left-ui', 'right-ui', 'bottom-ui'],
  },
  {
    id: 'far-upper-right',
    screenZone: 'far',
    x: 0.74,
    y: 0.24,
    heartClearanceRadii: 1.75,
    avoids: ['heart', 'top-ui', 'left-ui', 'right-ui', 'bottom-ui'],
  },
  {
    id: 'near-lower-left',
    screenZone: 'near',
    x: 0.26,
    y: 0.73,
    heartClearanceRadii: 1.75,
    avoids: ['heart', 'top-ui', 'left-ui', 'right-ui', 'bottom-ui'],
  },
  {
    id: 'near-lower-right',
    screenZone: 'near',
    x: 0.74,
    y: 0.73,
    heartClearanceRadii: 1.75,
    avoids: ['heart', 'top-ui', 'left-ui', 'right-ui', 'bottom-ui'],
  },
]

export interface ArchiveLandmarkPresentationDescriptor {
  readonly recordId: string
  /** Higher values receive attention first; ties are broken by stable IDs. */
  readonly priority: number
  /** Universe-authored prefix for pointer/focus hover copy. */
  readonly hoverTheme: string
  /** Universe-authored prefix for screen-reader copy. */
  readonly accessibleTheme: string
  /**
   * Records with one fallback group ID collapse into one landmark in reduced-motion
   * and low-quality modes. Standard mode always presents records individually.
   */
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

function candidateUnits(candidates: readonly Candidate[], mode: ArchiveLandmarkMode): CandidateUnit[] {
  if (mode === 'standard') {
    return candidates.map((candidate) => ({
      id: `archive-record:${candidate.record.id}`,
      label: candidate.record.name,
      priority: candidate.descriptor.priority,
      candidates: [candidate],
    }))
  }

  const groups = new Map<string, Candidate[]>()
  for (const candidate of candidates) {
    const group = groups.get(candidate.descriptor.fallbackGroupId) ?? []
    group.push(candidate)
    groups.set(candidate.descriptor.fallbackGroupId, group)
  }

  return [...groups.entries()].map(([groupId, members]) => {
    members.sort(compareCandidates)
    const label = members[0].descriptor.fallbackGroupLabel
    if (members.some(({ descriptor }) => descriptor.fallbackGroupLabel !== label)) {
      throw new TypeError(`Fallback group ${groupId} has conflicting labels.`)
    }
    return {
      id: `archive-group:${groupId}`,
      label,
      priority: members[0].descriptor.priority,
      candidates: members,
    }
  })
}

function stableHash(value: string): number {
  let hash = 2_166_136_261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return hash >>> 0
}

function slotFor(
  unit: CandidateUnit,
  pack: UniversePackV2,
  usedSlotIds: ReadonlySet<ArchiveLandmarkSlotId>,
  zoneCounts: ReadonlyMap<'near' | 'far', number>,
): ArchiveLandmarkSlot | null {
  const maximumRequiredClearance = Math.max(
    ...unit.candidates.map(({ record }) => record.object.minimumHeartDistance),
  )
  const offset = stableHash(unit.id) % ARCHIVE_LANDMARK_SLOTS.length
  for (let step = 0; step < ARCHIVE_LANDMARK_SLOTS.length; step += 1) {
    const slot = ARCHIVE_LANDMARK_SLOTS[(offset + step) % ARCHIVE_LANDMARK_SLOTS.length]
    if (usedSlotIds.has(slot.id)) continue
    if (slot.heartClearanceRadii < maximumRequiredClearance) continue
    if ((zoneCounts.get(slot.screenZone) ?? 0) >= pack.visual.zones[slot.screenZone].maximumInteractiveObjects) continue
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

  const units = candidateUnits(candidates, mode).sort((left, right) => (
    right.priority - left.priority || compareText(left.id, right.id)
  ))
  const attentionLimit = Math.min(
    3,
    Math.max(0, Math.floor(pack.visual.attentionBudget.secondaryInteractiveObjects)),
  )
  const usedSlotIds = new Set<ArchiveLandmarkSlotId>()
  const zoneCounts = new Map<'near' | 'far', number>()
  const landmarks: VisibleArchiveLandmark[] = []
  const hidden: HiddenArchiveLandmark[] = []

  for (const unit of units) {
    const recordIds = unit.candidates.map(({ record }) => record.id)
    if (landmarks.length >= attentionLimit) {
      hidden.push({ id: unit.id, recordIds, reason: 'attention-budget' })
      continue
    }
    const slot = slotFor(unit, pack, usedSlotIds, zoneCounts)
    if (!slot) {
      hidden.push({ id: unit.id, recordIds, reason: 'placement-budget' })
      continue
    }
    const records = unit.candidates.map((candidate) => recordPresentation(candidate, mode))
    const representative = records[0]
    usedSlotIds.add(slot.id)
    zoneCounts.set(slot.screenZone, (zoneCounts.get(slot.screenZone) ?? 0) + 1)
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
