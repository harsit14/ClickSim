import type { UniversePackV2, VisualState, WorldObjectManifest } from '../content/universes/types'
import type {
  ObjectPresentation,
  PresentationLayer,
  PresentationObjectStateKey,
  PresentationPrimitive,
  PresentationState,
  UniversePresentation,
} from './presentation-contract'

const THRESHOLDS = [1, 10, 25, 50, 100] as const

export interface AuthoredLokaPresentationConfig {
  readonly palette: UniversePresentation['palette']
  readonly generatorMotifs: readonly string[]
  readonly primitives: readonly [PresentationPrimitive, PresentationPrimitive, PresentationPrimitive]
  readonly heartPrimitives: readonly [PresentationPrimitive, PresentationPrimitive, PresentationPrimitive]
  readonly heartPattern: string
  readonly centralClearing: string
}

function authoredLayers(
  id: string,
  primitives: readonly [PresentationPrimitive, PresentationPrimitive, PresentationPrimitive],
  scale: number,
): readonly PresentationLayer[] {
  return [
    { id: `${id}-ground`, primitive: primitives[0], insetPercent: 8, scaleX: scale, scaleY: scale * 0.78, rotationDegrees: 0, fill: 'primary', opacity: 0.78, stroke: 'strong' },
    { id: `${id}-structure`, primitive: primitives[1], insetPercent: 18, scaleX: scale * 0.76, scaleY: scale * 0.92, rotationDegrees: 0, fill: 'highlight', opacity: 0.68, stroke: 'thin' },
    { id: `${id}-relation`, primitive: primitives[2], insetPercent: 5, scaleX: scale * 1.02, scaleY: scale * 0.86, rotationDegrees: 0, fill: 'secondary', opacity: 0.5, stroke: 'dashed' },
  ]
}

function state(
  object: WorldObjectManifest,
  visual: Pick<VisualState, 'silhouette'> | null,
  motif: string,
  config: AuthoredLokaPresentationConfig,
  suffix: string,
  scale: number,
): PresentationState {
  return {
    geometryLabel: visual?.silhouette ?? object.silhouette,
    pattern: `${motif}; ${visual?.silhouette ?? object.silhouette}`,
    layers: authoredLayers(`${object.id}-${suffix}`, config.primitives, scale),
  }
}

function descriptor(
  object: WorldObjectManifest,
  motif: string,
  config: AuthoredLokaPresentationConfig,
): ObjectPresentation {
  const states = {
    base: state(object, null, motif, config, 'base', 0.82),
    ...Object.fromEntries(THRESHOLDS.map((threshold, index) => [String(threshold), state(object, object.ownershipStates?.[threshold] ?? null, motif, config, `form-${threshold}`, 0.72 + index * 0.09)])),
    'reduced-motion': state(object, object.reducedMotionState, `${motif}; fixed authored position`, config, 'reduced', 0.96),
    'low-quality': {
      ...state(object, object.lowQualityState, `${motif}; single high-contrast contour`, config, 'low', 0.9),
      layers: authoredLayers(`${object.id}-low`, config.primitives, 0.9).slice(0, 2),
    },
  } as unknown as Readonly<Record<PresentationObjectStateKey, PresentationState>>
  return {
    id: object.id,
    depth: object.screenZone === 'horizon' ? 'back' : object.screenZone === 'near' ? 'front' : 'middle',
    occlusion: `${object.screenZone} authored set piece; ${config.centralClearing}`,
    states,
  }
}

/** Builds manifest presentation metadata from a realm's explicit eighteen-motif registry. */
export function createAuthoredLokaPresentation(
  pack: UniversePackV2,
  config: AuthoredLokaPresentationConfig,
): UniversePresentation {
  const generatorObjects = pack.visual.objects.filter(({ sourceKind }) => sourceKind === 'generator')
  if (generatorObjects.length !== 18 || config.generatorMotifs.length !== 18) {
    throw new TypeError(`${pack.id} authored presentation requires exactly eighteen generator motifs`)
  }
  const generatorMotifByObjectId = new Map(generatorObjects.map((object, index) => [object.id, config.generatorMotifs[index]]))
  return {
    universeId: pack.id,
    palette: config.palette,
    heart: {
      id: pack.heart.id,
      depth: 'front',
      occlusion: config.centralClearing,
      states: {
        base: { geometryLabel: pack.heart.silhouette, pattern: config.heartPattern, layers: authoredLayers(`${pack.id}-heart-base`, config.heartPrimitives, 1) },
        'reduced-motion': { geometryLabel: pack.heart.reducedMotionState.silhouette, pattern: `${config.heartPattern}; fixed labeled response`, layers: authoredLayers(`${pack.id}-heart-reduced`, config.heartPrimitives, 0.96).slice(0, 2) },
        'low-quality': { geometryLabel: pack.heart.lowQualityState.silhouette, pattern: `${config.heartPattern}; stable high-contrast contour`, layers: authoredLayers(`${pack.id}-heart-low`, config.heartPrimitives, 0.92).slice(0, 2) },
      },
    },
    objects: Object.fromEntries(pack.visual.objects.map((object) => [object.id, descriptor(
      object,
      generatorMotifByObjectId.get(object.id) ?? `${object.sourceKind} authored landmark: ${object.phenomenon}`,
      config,
    )])),
    worldStates: {},
  }
}
