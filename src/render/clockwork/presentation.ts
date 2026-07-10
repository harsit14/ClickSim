import { CLOCKWORK_V2_PACK } from '../../content/universes/clockwork'
import type { VisualState, WorldObjectManifest } from '../../content/universes/types'
import type {
  ObjectPresentation,
  PresentationLayer,
  PresentationObjectStateKey,
  PresentationPrimitive,
  PresentationState,
  UniversePresentation,
} from '../presentation-contract'

const THRESHOLDS = [1, 10, 25, 50, 100] as const

function primaryPrimitive(object: WorldObjectManifest): PresentationPrimitive {
  if (object.sourceKind === 'archive') return 'frame'
  if (object.sourceKind === 'omen') return 'ribbon'
  if (object.sourceKind === 'beacon') return 'arc'
  if (object.screenZone === 'horizon') return 'polygon'
  return object.screenZone === 'near' ? 'ellipse' : 'frame'
}

function layers(object: WorldObjectManifest, suffix: string, scale = 1): readonly PresentationLayer[] {
  return [
    { id: `mechanism-${suffix}`, primitive: primaryPrimitive(object), insetPercent: 5, scaleX: scale, scaleY: scale * 0.86, rotationDegrees: 0, fill: 'primary', opacity: 0.72, stroke: 'strong' },
    { id: `chapter-ring-${suffix}`, primitive: 'arc', insetPercent: 12, scaleX: scale * 0.82, scaleY: scale * 0.82, rotationDegrees: 15, fill: 'secondary', opacity: 0.62, stroke: 'dashed' },
    { id: `output-shaft-${suffix}`, primitive: 'branch', insetPercent: 19, scaleX: scale * 0.72, scaleY: scale * 0.54, rotationDegrees: -6, fill: 'highlight', opacity: 0.86, stroke: 'strong' },
  ]
}

function state(
  object: WorldObjectManifest,
  visual: Pick<VisualState, 'silhouette'> | null,
  suffix: string,
  scale = 1,
): PresentationState {
  return {
    geometryLabel: visual?.silhouette ?? object.silhouette,
    pattern: `${object.phenomenon}; indexed chapter ring, declared input, and one visible output route`,
    layers: layers(object, suffix, scale),
  }
}

function descriptor(object: WorldObjectManifest): ObjectPresentation {
  const states = {
    base: state(object, null, 'base', 0.82),
    ...Object.fromEntries(THRESHOLDS.map((threshold) => [
      String(threshold),
      state(object, object.ownershipStates?.[threshold] ?? null, `owned-${threshold}`, 0.72 + THRESHOLDS.indexOf(threshold) * 0.1),
    ])),
    'reduced-motion': state(object, object.reducedMotionState, 'reduced', 1),
    'low-quality': {
      geometryLabel: object.lowQualityState.silhouette,
      pattern: `${object.phenomenon}; one high-contrast mechanism and one route arrow`,
      layers: layers(object, 'low', 0.92).slice(0, 2),
    },
  } as unknown as Readonly<Record<PresentationObjectStateKey, PresentationState>>
  return {
    id: object.id,
    depth: object.screenZone === 'horizon' ? 'back' : object.screenZone === 'near' ? 'front' : 'middle',
    occlusion: `${object.screenZone} mechanism keeps ${object.minimumHeartDistance} Heart radii clear and joins the shared civic train.`,
    states,
  }
}

const objects = Object.fromEntries(CLOCKWORK_V2_PACK.visual.objects.map((object) => [object.id, descriptor(object)]))

export const CLOCKWORK_PRESENTATION: UniversePresentation = {
  universeId: 'clockwork',
  palette: {
    primary: '#d8a84e',
    secondary: '#7b9db4',
    highlight: '#ffe1a3',
    shadow: '#262c34',
    void: '#0b0d10',
  },
  heart: {
    id: CLOCKWORK_V2_PACK.heart.id,
    depth: 'front',
    occlusion: 'The Escapement Heart remains the sole central focus target inside an open chapter ring.',
    states: {
      base: {
        geometryLabel: CLOCKWORK_V2_PACK.heart.silhouette,
        pattern: 'fifteen indexed teeth, ruby pallet, meridian mark, and one forward output shaft',
        layers: [
          { id: 'escape-wheel', primitive: 'ellipse', insetPercent: 4, scaleX: 0.94, scaleY: 0.94, rotationDegrees: 0, fill: 'primary', opacity: 0.76, stroke: 'strong' },
          { id: 'anchor-pallet', primitive: 'branch', insetPercent: 18, scaleX: 0.76, scaleY: 0.62, rotationDegrees: 24, fill: 'highlight', opacity: 0.94, stroke: 'strong' },
          { id: 'heart-chapter-ring', primitive: 'arc', insetPercent: 0, scaleX: 1.12, scaleY: 1.12, rotationDegrees: 15, fill: 'secondary', opacity: 0.58, stroke: 'dashed' },
        ],
      },
      'reduced-motion': {
        geometryLabel: CLOCKWORK_V2_PACK.heart.reducedMotionState.silhouette,
        pattern: 'fixed engage, release, and transmit positions with numbered route marks',
        layers: [
          { id: 'escape-wheel-reduced', primitive: 'ellipse', insetPercent: 5, scaleX: 0.92, scaleY: 0.92, rotationDegrees: 0, fill: 'primary', opacity: 0.82, stroke: 'strong' },
          { id: 'route-reduced', primitive: 'branch', insetPercent: 19, scaleX: 0.74, scaleY: 0.58, rotationDegrees: 0, fill: 'highlight', opacity: 1, stroke: 'strong' },
        ],
      },
      'low-quality': {
        geometryLabel: CLOCKWORK_V2_PACK.heart.lowQualityState.silhouette,
        pattern: 'one escape-wheel contour, anchor pallet, and output arrow',
        layers: [
          { id: 'escape-wheel-low', primitive: 'ellipse', insetPercent: 7, scaleX: 0.88, scaleY: 0.88, rotationDegrees: 0, fill: 'primary', opacity: 0.9, stroke: 'strong' },
          { id: 'output-low', primitive: 'branch', insetPercent: 22, scaleX: 0.66, scaleY: 0.5, rotationDegrees: 0, fill: 'highlight', opacity: 1, stroke: 'strong' },
        ],
      },
    },
  },
  objects,
  worldStates: {},
}
