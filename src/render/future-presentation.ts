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
const FROZEN_LEGACY_USERS = new Set(['prismata', 'tempest', 'canticle'])

export interface FuturePresentationGrammar {
  readonly palette: UniversePresentation['palette']
  readonly objectPrimitives: readonly [PresentationPrimitive, PresentationPrimitive, PresentationPrimitive]
  readonly heartPrimitives: readonly [PresentationPrimitive, PresentationPrimitive, PresentationPrimitive]
  readonly pattern: string
  readonly heartPattern: string
}

function layers(
  id: string,
  primitives: readonly [PresentationPrimitive, PresentationPrimitive, PresentationPrimitive],
  scale: number,
): readonly PresentationLayer[] {
  return [
    { id: `${id}-body`, primitive: primitives[0], insetPercent: 5, scaleX: scale, scaleY: scale * 0.9, rotationDegrees: -7, fill: 'primary', opacity: 0.76, stroke: 'strong' },
    { id: `${id}-relation`, primitive: primitives[1], insetPercent: 14, scaleX: scale * 0.86, scaleY: scale * 0.8, rotationDegrees: 9, fill: 'highlight', opacity: 0.72, stroke: 'thin' },
    { id: `${id}-state`, primitive: primitives[2], insetPercent: 1, scaleX: scale * 1.08, scaleY: scale * 0.96, rotationDegrees: 21, fill: 'secondary', opacity: 0.46, stroke: 'dashed' },
  ]
}

function objectState(
  object: WorldObjectManifest,
  visual: Pick<VisualState, 'silhouette'> | null,
  grammar: FuturePresentationGrammar,
  suffix: string,
  scale: number,
): PresentationState {
  return {
    geometryLabel: visual?.silhouette ?? object.silhouette,
    pattern: `${object.phenomenon}; ${grammar.pattern}`,
    layers: layers(`${object.id}-${suffix}`, grammar.objectPrimitives, scale),
  }
}

function descriptor(object: WorldObjectManifest, grammar: FuturePresentationGrammar): ObjectPresentation {
  const states = {
    base: objectState(object, null, grammar, 'base', 0.82),
    ...Object.fromEntries(THRESHOLDS.map((threshold, index) => [
      String(threshold),
      objectState(object, object.ownershipStates?.[threshold] ?? null, grammar, `owned-${threshold}`, 0.72 + index * 0.1),
    ])),
    'reduced-motion': objectState(object, object.reducedMotionState, grammar, 'reduced', 1),
    'low-quality': {
      geometryLabel: object.lowQualityState.silhouette,
      pattern: `${object.phenomenon}; one high-contrast ${grammar.pattern}`,
      layers: layers(`${object.id}-low`, grammar.objectPrimitives, 0.92).slice(0, 2),
    },
  } as unknown as Readonly<Record<PresentationObjectStateKey, PresentationState>>
  return {
    id: object.id,
    depth: object.screenZone === 'horizon' ? 'back' : object.screenZone === 'near' ? 'front' : 'middle',
    occlusion: `${object.screenZone} object preserves ${object.minimumHeartDistance} Heart radii and the authored central clearing`,
    states,
  }
}

/** @deprecated Frozen compatibility bridge for the three existing F4 chamber pieces. */
export function createFuturePresentation(
  pack: UniversePackV2,
  grammar: FuturePresentationGrammar,
): UniversePresentation {
  if (!FROZEN_LEGACY_USERS.has(pack.id)) {
    throw new TypeError(`${pack.id} must register authored set-piece paths; generic primitive stacking is frozen.`)
  }
  return {
    universeId: pack.id,
    palette: grammar.palette,
    heart: {
      id: pack.heart.id,
      depth: 'front',
      occlusion: `${pack.heart.localName} remains the sole central focus target inside a clear law-inspection field.`,
      states: {
        base: { geometryLabel: pack.heart.silhouette, pattern: grammar.heartPattern, layers: layers(`${pack.id}-heart-base`, grammar.heartPrimitives, 1) },
        'reduced-motion': { geometryLabel: pack.heart.reducedMotionState.silhouette, pattern: `${grammar.heartPattern}; fixed labeled state`, layers: layers(`${pack.id}-heart-reduced`, grammar.heartPrimitives, 0.98).slice(0, 2) },
        'low-quality': { geometryLabel: pack.heart.lowQualityState.silhouette, pattern: `${grammar.heartPattern}; one stable high-contrast contour`, layers: layers(`${pack.id}-heart-low`, grammar.heartPrimitives, 0.94).slice(0, 2) },
      },
    },
    objects: Object.fromEntries(pack.visual.objects.map((object) => [object.id, descriptor(object, grammar)])),
    worldStates: {},
  }
}
