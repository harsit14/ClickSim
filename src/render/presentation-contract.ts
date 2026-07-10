import type { UniversePackV2 } from '../content/universes/types'
import type { ResolvedManifestVisualState } from './manifest-layout'

export const PRESENTATION_OBJECT_STATE_KEYS = [
  'base',
  '1',
  '10',
  '25',
  '50',
  '100',
  'reduced-motion',
  'low-quality',
] as const

export const PRESENTATION_HEART_STATE_KEYS = [
  'base',
  'reduced-motion',
  'low-quality',
] as const

export type PresentationObjectStateKey = (typeof PRESENTATION_OBJECT_STATE_KEYS)[number]
export type PresentationHeartStateKey = (typeof PRESENTATION_HEART_STATE_KEYS)[number]
export type PresentationDepth = 'back' | 'middle' | 'front'
export type PresentationFill = 'primary' | 'secondary' | 'highlight' | 'shadow' | 'void'
export type PresentationPrimitive = 'ellipse' | 'polygon' | 'ribbon' | 'arc' | 'branch' | 'frame' | 'cloud'
export type PresentationStroke = 'none' | 'thin' | 'strong' | 'dashed'

export interface PresentationLayer {
  readonly id: string
  readonly primitive: PresentationPrimitive
  readonly insetPercent: number
  readonly scaleX: number
  readonly scaleY: number
  readonly rotationDegrees: number
  readonly fill: PresentationFill
  readonly opacity: number
  readonly clipPath?: string
  readonly stroke?: PresentationStroke
}

export interface PresentationState {
  readonly geometryLabel: string
  readonly pattern: string
  readonly layers: readonly PresentationLayer[]
}

export interface ObjectPresentation {
  readonly id: string
  readonly depth: PresentationDepth
  readonly occlusion: string
  readonly states: Readonly<Record<PresentationObjectStateKey, PresentationState>>
}

export interface HeartPresentation {
  readonly id: string
  readonly depth: PresentationDepth
  readonly occlusion: string
  readonly states: Readonly<Record<PresentationHeartStateKey, PresentationState>>
}

export interface WorldStatePresentation extends PresentationState {
  readonly id: string
  readonly depth: PresentationDepth
  readonly occlusion: string
}

export interface UniversePresentation {
  readonly universeId: string
  readonly palette: Readonly<Record<PresentationFill, string>>
  readonly heart: HeartPresentation
  readonly objects: Readonly<Record<string, ObjectPresentation>>
  readonly worldStates: Readonly<Record<string, WorldStatePresentation>>
}

export interface PresentationContractIssue {
  readonly path: string
  readonly message: string
}

const DEPTHS = new Set<PresentationDepth>(['back', 'middle', 'front'])
const PRIMITIVES = new Set<PresentationPrimitive>(['ellipse', 'polygon', 'ribbon', 'arc', 'branch', 'frame', 'cloud'])
const FILLS = new Set<PresentationFill>(['primary', 'secondary', 'highlight', 'shadow', 'void'])
const STROKES = new Set<PresentationStroke>(['none', 'thin', 'strong', 'dashed'])

function sameKeys(actual: readonly string[], expected: readonly string[]): boolean {
  if (actual.length !== expected.length) return false
  const values = new Set(actual)
  return expected.every((key) => values.has(key))
}

function validateState(
  state: PresentationState | undefined,
  path: string,
  issues: PresentationContractIssue[],
) {
  if (!state) {
    issues.push({ path, message: 'Missing authored presentation state.' })
    return
  }
  if (!state.geometryLabel.trim()) issues.push({ path: `${path}.geometryLabel`, message: 'Geometry label must not be empty.' })
  if (!state.pattern.trim()) issues.push({ path: `${path}.pattern`, message: 'Pattern must not be empty.' })
  if (state.layers.length === 0) issues.push({ path: `${path}.layers`, message: 'At least one authored layer is required.' })
  const layerIds = new Set<string>()
  state.layers.forEach((layer, index) => {
    const layerPath = `${path}.layers[${index}]`
    if (!layer.id.trim()) issues.push({ path: `${layerPath}.id`, message: 'Layer ID must not be empty.' })
    else if (layerIds.has(layer.id)) issues.push({ path: `${layerPath}.id`, message: `Duplicate layer ID ${layer.id}.` })
    else layerIds.add(layer.id)
    if (!PRIMITIVES.has(layer.primitive)) issues.push({ path: `${layerPath}.primitive`, message: 'Unknown presentation primitive.' })
    if (!FILLS.has(layer.fill)) issues.push({ path: `${layerPath}.fill`, message: 'Unknown presentation fill token.' })
    if (layer.stroke !== undefined && !STROKES.has(layer.stroke)) issues.push({ path: `${layerPath}.stroke`, message: 'Unknown presentation stroke token.' })
    if (!Number.isFinite(layer.insetPercent) || layer.insetPercent < 0 || layer.insetPercent >= 50) {
      issues.push({ path: `${layerPath}.insetPercent`, message: 'Inset must be finite and between 0 (inclusive) and 50 (exclusive).' })
    }
    if (!Number.isFinite(layer.scaleX) || layer.scaleX <= 0 || !Number.isFinite(layer.scaleY) || layer.scaleY <= 0) {
      issues.push({ path: layerPath, message: 'Layer scales must be finite positive numbers.' })
    }
    if (!Number.isFinite(layer.rotationDegrees)) issues.push({ path: `${layerPath}.rotationDegrees`, message: 'Rotation must be finite.' })
    if (!Number.isFinite(layer.opacity) || layer.opacity < 0 || layer.opacity > 1) {
      issues.push({ path: `${layerPath}.opacity`, message: 'Opacity must be finite and between 0 and 1.' })
    }
  })
}

function validateDescriptor(
  descriptor: ObjectPresentation | HeartPresentation,
  path: string,
  expectedId: string,
  expectedStateKeys: readonly string[],
  issues: PresentationContractIssue[],
) {
  if (descriptor.id !== expectedId) issues.push({ path: `${path}.id`, message: `Expected descriptor ID ${expectedId}.` })
  if (!DEPTHS.has(descriptor.depth)) issues.push({ path: `${path}.depth`, message: 'Unknown presentation depth.' })
  if (!descriptor.occlusion.trim()) issues.push({ path: `${path}.occlusion`, message: 'Occlusion rule must not be empty.' })
  const stateKeys = Object.keys(descriptor.states)
  if (!sameKeys(stateKeys, expectedStateKeys)) {
    issues.push({ path: `${path}.states`, message: `Expected exact states: ${expectedStateKeys.join(', ')}.` })
  }
  for (const key of expectedStateKeys) validateState(descriptor.states[key as keyof typeof descriptor.states], `${path}.states.${key}`, issues)
}

/** Validates the pure authored geometry registry against one validated universe pack. */
export function validateUniversePresentation(
  pack: UniversePackV2,
  presentation: UniversePresentation,
): readonly PresentationContractIssue[] {
  const issues: PresentationContractIssue[] = []
  if (presentation.universeId !== pack.id) {
    issues.push({ path: 'universeId', message: `Expected ${pack.id}; received ${presentation.universeId}.` })
  }
  for (const fill of FILLS) {
    if (!presentation.palette[fill]?.trim()) issues.push({ path: `palette.${fill}`, message: 'Palette token must not be empty.' })
  }
  validateDescriptor(presentation.heart, 'heart', pack.heart.id, PRESENTATION_HEART_STATE_KEYS, issues)

  const manifestIds = new Set(pack.visual.objects.map((object) => object.id))
  for (const object of pack.visual.objects) {
    const descriptor = presentation.objects[object.id]
    if (!descriptor) {
      issues.push({ path: `objects.${object.id}`, message: 'Manifest object has no authored presentation descriptor.' })
      continue
    }
    validateDescriptor(descriptor, `objects.${object.id}`, object.id, PRESENTATION_OBJECT_STATE_KEYS, issues)
  }
  for (const descriptorId of Object.keys(presentation.objects)) {
    if (!manifestIds.has(descriptorId)) issues.push({ path: `objects.${descriptorId}`, message: 'Presentation descriptor does not belong to the pack manifest.' })
  }
  for (const [stateId, state] of Object.entries(presentation.worldStates)) {
    if (state.id !== stateId) issues.push({ path: `worldStates.${stateId}.id`, message: `Expected world-state ID ${stateId}.` })
    if (!DEPTHS.has(state.depth)) issues.push({ path: `worldStates.${stateId}.depth`, message: 'Unknown presentation depth.' })
    if (!state.occlusion.trim()) issues.push({ path: `worldStates.${stateId}.occlusion`, message: 'Occlusion rule must not be empty.' })
    validateState(state, `worldStates.${stateId}`, issues)
  }
  return issues
}

export function objectPresentationStateKey(
  state: Pick<ResolvedManifestVisualState, 'source' | 'ownershipThreshold'>,
): PresentationObjectStateKey {
  if (state.source === 'reduced-motion') return 'reduced-motion'
  if (state.source === 'low-quality') return 'low-quality'
  return state.ownershipThreshold === null ? 'base' : String(state.ownershipThreshold) as PresentationObjectStateKey
}

export function heartPresentationStateKey(
  state: Pick<ResolvedManifestVisualState, 'source'>,
): PresentationHeartStateKey {
  if (state.source === 'reduced-motion') return 'reduced-motion'
  if (state.source === 'low-quality') return 'low-quality'
  return 'base'
}
