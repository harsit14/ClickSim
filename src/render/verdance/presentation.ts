import { VERDANCE_V2_PACK } from '../../content/universes/verdance'
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

function primitiveFor(object: WorldObjectManifest): PresentationPrimitive {
  if (object.sourceKind === 'archive') return 'ellipse'
  if (object.sourceKind === 'omen') return 'cloud'
  if (object.sourceKind === 'beacon') return 'branch'
  return object.screenZone === 'near' ? 'ellipse' : 'branch'
}

function layers(object: WorldObjectManifest, suffix: string, scale = 1): readonly PresentationLayer[] {
  const primary = primitiveFor(object)
  return [
    { id: `living-body-${suffix}`, primitive: primary, insetPercent: 5, scaleX: scale, scaleY: scale * 0.88, rotationDegrees: -4, fill: 'primary', opacity: 0.78, stroke: 'thin' },
    { id: `vascular-route-${suffix}`, primitive: 'branch', insetPercent: 13, scaleX: scale * 0.82, scaleY: scale * 0.78, rotationDegrees: 6, fill: 'highlight', opacity: 0.72, stroke: 'strong' },
    { id: `growth-ring-${suffix}`, primitive: 'arc', insetPercent: 2, scaleX: scale * 1.04, scaleY: scale * 0.92, rotationDegrees: 18, fill: 'secondary', opacity: 0.46, stroke: 'dashed' },
  ]
}

function state(object: WorldObjectManifest, visual: Pick<VisualState, 'silhouette'> | null, suffix: string, scale = 1): PresentationState {
  return {
    geometryLabel: visual?.silhouette ?? object.silhouette,
    pattern: `${object.phenomenon}; vascular route, growth rings, and preserved negative space`,
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
      pattern: `${object.phenomenon}; one high-contrast living contour`,
      layers: layers(object, 'low', 0.92).slice(0, 2),
    },
  } as unknown as Readonly<Record<PresentationObjectStateKey, PresentationState>>
  return {
    id: object.id,
    depth: object.screenZone === 'horizon' ? 'back' : object.screenZone === 'near' ? 'front' : 'middle',
    occlusion: `${object.screenZone} specimen preserves ${object.minimumHeartDistance} Heart radii and open root clearings`,
    states,
  }
}

const objects = Object.fromEntries(VERDANCE_V2_PACK.visual.objects.map((object) => [object.id, descriptor(object)]))

export const VERDANCE_PRESENTATION: UniversePresentation = {
  universeId: 'verdance',
  palette: {
    primary: '#75c989',
    secondary: '#a8d279',
    highlight: '#e6f7b2',
    shadow: '#173525',
    void: '#07100b',
  },
  heart: {
    id: VERDANCE_V2_PACK.heart.id,
    depth: 'front',
    occlusion: 'The First Seed remains the sole central focus target inside an open root clearing.',
    states: {
      base: {
        geometryLabel: VERDANCE_V2_PACK.heart.silhouette,
        pattern: 'split seed coat, cotyledon, three root points, and one open growth ring',
        layers: [
          { id: 'seed-shell', primitive: 'ellipse', insetPercent: 5, scaleX: 0.86, scaleY: 1, rotationDegrees: -12, fill: 'primary', opacity: 0.74, stroke: 'strong' },
          { id: 'seed-opening', primitive: 'branch', insetPercent: 20, scaleX: 0.62, scaleY: 0.84, rotationDegrees: 4, fill: 'highlight', opacity: 0.92, stroke: 'strong' },
          { id: 'first-growth-ring', primitive: 'arc', insetPercent: 0, scaleX: 1.12, scaleY: 0.96, rotationDegrees: 20, fill: 'secondary', opacity: 0.56, stroke: 'thin' },
        ],
      },
      'reduced-motion': {
        geometryLabel: VERDANCE_V2_PACK.heart.reducedMotionState.silhouette,
        pattern: 'fixed seed coat, three root points, and labeled contrast vein',
        layers: [
          { id: 'seed-reduced-shell', primitive: 'ellipse', insetPercent: 5, scaleX: 0.86, scaleY: 1, rotationDegrees: 0, fill: 'primary', opacity: 0.82, stroke: 'strong' },
          { id: 'seed-reduced-root', primitive: 'branch', insetPercent: 20, scaleX: 0.62, scaleY: 0.84, rotationDegrees: 0, fill: 'highlight', opacity: 1, stroke: 'strong' },
        ],
      },
      'low-quality': {
        geometryLabel: VERDANCE_V2_PACK.heart.lowQualityState.silhouette,
        pattern: 'one seed contour and one root fork',
        layers: [
          { id: 'seed-low-shell', primitive: 'ellipse', insetPercent: 7, scaleX: 0.84, scaleY: 1, rotationDegrees: 0, fill: 'primary', opacity: 0.88, stroke: 'strong' },
          { id: 'seed-low-root', primitive: 'branch', insetPercent: 23, scaleX: 0.58, scaleY: 0.8, rotationDegrees: 0, fill: 'highlight', opacity: 1, stroke: 'strong' },
        ],
      },
    },
  },
  objects,
  worldStates: {},
}
