import { EMBERLIGHT_V2 } from '../../content/universes/emberlight-v2'
import type {
  HeartManifest,
  OwnershipThreshold,
  WorldObjectManifest,
} from '../../content/universes/types'

export type EmberlightDepth = 'back' | 'middle' | 'front'
export type EmberlightFill = 'primary' | 'secondary' | 'highlight' | 'shadow' | 'void'
export type EmberlightPrimitive = 'ellipse' | 'polygon' | 'ribbon' | 'arc' | 'branch' | 'frame' | 'cloud'
export type EmberlightStroke = 'none' | 'thin' | 'strong' | 'dashed'
export type EmberlightObjectStateKey =
  | 'base'
  | '1'
  | '10'
  | '25'
  | '50'
  | '100'
  | 'reduced-motion'
  | 'low-quality'
export type EmberlightHeartStateKey = 'base' | 'reduced-motion' | 'low-quality'

export interface EmberlightPresentationLayer {
  readonly id: string
  readonly primitive: EmberlightPrimitive
  readonly insetPercent: number
  readonly scaleX: number
  readonly scaleY: number
  readonly rotationDegrees: number
  readonly fill: EmberlightFill
  readonly opacity: number
  readonly clipPath?: string
  readonly stroke?: EmberlightStroke
}

export interface EmberlightPresentationState {
  readonly geometryLabel: string
  readonly pattern: string
  readonly layers: readonly EmberlightPresentationLayer[]
}

export interface EmberlightObjectPresentation {
  readonly id: string
  readonly depth: EmberlightDepth
  readonly occlusion: string
  readonly states: Readonly<Record<EmberlightObjectStateKey, EmberlightPresentationState>>
}

export interface EmberlightHeartPresentation {
  readonly id: string
  readonly depth: EmberlightDepth
  readonly occlusion: string
  readonly states: Readonly<Record<EmberlightHeartStateKey, EmberlightPresentationState>>
}

interface PresentationSeed {
  readonly depth: EmberlightDepth
  readonly geometryLabel: string
  readonly pattern: string
  readonly occlusion: string
  readonly layers: readonly EmberlightPresentationLayer[]
}

const layer = (
  id: string,
  primitive: EmberlightPrimitive,
  fill: EmberlightFill,
  scaleX: number,
  scaleY: number,
  rotationDegrees = 0,
  insetPercent = 0,
  opacity = 1,
  stroke: EmberlightStroke = 'none',
  clipPath?: string,
): EmberlightPresentationLayer => ({
  id,
  primitive,
  insetPercent,
  scaleX,
  scaleY,
  rotationDegrees,
  fill,
  opacity,
  stroke,
  ...(clipPath ? { clipPath } : {}),
})

const seed = (
  depth: EmberlightDepth,
  geometryLabel: string,
  pattern: string,
  occlusion: string,
  primary: EmberlightPrimitive,
  secondary: EmberlightPrimitive,
  rotationDegrees = 0,
): PresentationSeed => ({
  depth,
  geometryLabel,
  pattern,
  occlusion,
  layers: [
    layer('material-body', primary, 'primary', 1, 0.82, rotationDegrees, 0, 0.94, 'thin'),
    layer('semantic-structure', secondary, 'highlight', 0.74, 0.66, rotationDegrees + 18, 12, 0.86, 'strong'),
    layer('depth-shadow', 'arc', 'shadow', 0.92, 0.78, rotationDegrees - 14, 4, 0.58, 'dashed', 'lower-material-half'),
  ],
})

/** Every manifest ID is listed explicitly. No presentation behavior is inferred from an ID. */
const OBJECT_SEEDS: Readonly<Record<string, PresentationSeed>> = {
  'ember-kindling-spark': seed('middle', 'ragged four-point plasma ember', 'broken corona with a braided tail', 'ash notch at lower point', 'polygon', 'arc'),
  'ember-kindling-wisp': seed('middle', 'hooked ion filament with leading knot', 'single flowing hook crossed by field bars', 'transparent tail overlap', 'ribbon', 'ellipse', 28),
  'ember-kindling-hearth': seed('middle', 'banked stellar bowl around a steady core', 'nested bowl and heat notches', 'dark coal rim beneath core', 'frame', 'ellipse'),
  'ember-kindling-kiln': seed('middle', 'vented furnace arch with white core', 'alternating vents around a making chamber', 'ceramic arch masks lower plasma', 'frame', 'polygon'),
  'ember-kindling-forge': seed('front', 'stellar anvil beneath bipolar flame', 'wide foundation with paired plasma fans', 'iron anvil cuts the flame base', 'frame', 'ribbon'),
  'ember-kindling-beacon': seed('front', 'searching tower with a sweeping lens', 'vertical signal frame and one open beam', 'tower masks rear lens arc', 'frame', 'arc'),
  'ember-kindling-titan': seed('front', 'armored furnace titan with vertical core', 'plate stack around a contained burn', 'basalt plates overlap core edges', 'polygon', 'frame'),
  'ember-kindling-starseed': seed('front', 'ovoid stellar seed with one bright seam', 'split shell around accreting center', 'dust shell crosses the seam ends', 'ellipse', 'arc', 12),
  'ember-kindling-protostar': seed('middle', 'accreting core bisected by dust disk', 'wide disk with opposed polar jets', 'dust lane crosses the bright center', 'ellipse', 'ribbon'),
  'ember-kindling-sun': seed('middle', 'granulated star with broken flare crown', 'uneven radial crown and ecliptic notch', 'photosphere masks rear flares', 'ellipse', 'polygon'),
  'ember-kindling-binary': seed('middle', 'unequal binary stars joined by plasma bridge', 'paired lobes around an open barycenter', 'near star masks bridge midpoint', 'ellipse', 'ribbon', -16),
  'ember-kindling-constellation': seed('middle', 'asymmetric remembered star figure', 'open branching route with unequal nodes', 'no closed fill; background remains visible', 'branch', 'arc'),
  'ember-kindling-nebula': seed('back', 'irregular emission cloud cut by dark pillar', 'scalloped gas folds around one void branch', 'central dust pillar masks emission', 'cloud', 'branch', 20),
  'ember-kindling-galaxy': seed('back', 'barred spiral with uneven arms', 'two asymmetric arms around a bright bar', 'dust lane crosses galactic core', 'ellipse', 'arc', 32),
  'ember-kindling-supercluster': seed('back', 'three galaxy knots joined by lensing arcs', 'unequal knot triangle with open basin', 'void gaps separate every knot', 'cloud', 'branch'),
  'ember-kindling-web': seed('back', 'branching cosmic web with luminous junctions', 'forked filaments around preserved voids', 'void cells remain unfilled', 'branch', 'ellipse'),
  'ember-kindling-loom': seed('back', 'open gravitational loom crossed by spacetime thread', 'vertical frame with nonparallel luminous warps', 'frame uprights mask rear threads', 'frame', 'ribbon'),
  'ember-kindling-ember2': seed('back', 'answering ember with inward-facing corona', 'paired outward and inward broken crowns', 'mirror-dark corona separates both crowns', 'polygon', 'arc', 36),

  'ember-omen-falling-star': seed('front', 'descending meteor point with tapered plasma tail', 'three chevrons followed by a narrowing trail', 'bright head masks tail origin', 'polygon', 'ribbon', 38),
  'ember-omen-pulsar-sweep': seed('middle', 'compact pulsar with three numbered beam windows', 'three notched sectors around fixed core', 'core masks beam crossing', 'ellipse', 'arc'),
  'ember-omen-comet-return': seed('back', 'returning comet on a complete curved route', 'double tail and visible open orbit', 'nucleus masks tail split', 'ellipse', 'ribbon', -24),
  'ember-omen-microlensing': seed('middle', 'off-center source enclosed by two lensing arcs', 'paired arcs converge around displaced star', 'lens gap preserves source offset', 'arc', 'ellipse'),

  'ember-archive-moth': seed('middle', 'white dwarf inside broad gravity ring', 'compressed center and oversized lens', 'lensing ring passes behind remnant', 'ellipse', 'arc'),
  'ember-archive-chimes': seed('middle', 'magnetar crossed by four rigid field arcs', 'four symmetric magnetic gates', 'neutron core masks inner arcs', 'ellipse', 'arc', 45),
  'ember-archive-hearthkeeper': seed('middle', 'protostellar nursery around unopened seeds', 'cloud chambers with multiple bright seams', 'dust folds cross seed edges', 'cloud', 'ellipse'),
  'ember-archive-glass-garden': seed('back', 'crescent Aurora World beneath folded curtains', 'three curtain bands over one planetary crescent', 'world horizon masks lower curtains', 'ellipse', 'ribbon', 16),
  'ember-archive-second-cursor': seed('back', 'quasar disk pierced by bipolar jet', 'narrow opposed beams through dark disk', 'accretion disk masks jet center', 'ellipse', 'ribbon', 90),
  'ember-archive-snail': seed('back', 'rogue world split by warm tectonic seam', 'dark globe with one wandering route arc', 'night hemisphere masks subsurface glow', 'ellipse', 'arc', -20),
  'ember-archive-aurora': seed('back', 'supermassive horizon crossed by barred galaxy disk', 'broad disk with unequal lensing arcs', 'dark core masks all rear light', 'ellipse', 'arc', 22),
  'ember-archive-door': seed('middle', 'stellar black hole wrapped by asymmetric crescent', 'single hot crescent around fixed void', 'event horizon masks background and disk', 'ellipse', 'arc', -28),
  'ember-archive-star-jar': seed('middle', 'microwave sky fragment with ember-shaped cold gap', 'uneven temperature cells around one void', 'cold gap cuts every heat band', 'frame', 'cloud'),
  'ember-archive-metronome-heart': seed('middle', 'three interlocked gravitational wave loops', 'numbered braided phases around empty crossing', 'central crossing remains void', 'ribbon', 'arc', 30),
  'ember-archive-letter': seed('back', 'red giant crossed by spectral message bands', 'three readable bands across swollen atmosphere', 'stellar limb masks band ends', 'ellipse', 'ribbon'),
  'ember-archive-orrery': seed('back', 'five-arm Orrery of the Local Sky', 'nested open orbits linking five cosmic scales', 'dark brass arms mask rear spectra', 'frame', 'arc', 12),

  'ember-density-stellar-nursery': seed('middle', 'branching nursery city beneath stellar seed towers', 'eight unequal towers joined by banked routes', 'city base masks route origins', 'branch', 'frame'),
  'ember-density-stellar-civilization': seed('back', 'four stellar districts around open navigation center', 'shared ecliptic with distinct district marks', 'near district masks one ecliptic segment', 'arc', 'branch', 18),
  'ember-density-cosmic-hierarchy': seed('back', 'barred galaxy nested in web ending at answering ember', 'scale ladder from cloud to filament to crown', 'void cells separate hierarchy levels', 'branch', 'ellipse'),
  'emberlight-beacon-object': seed('back', 'Answering Star inside open Wayfinder frame', 'broken starburst and four open navigation arms', 'frame never covers the central Heart', 'frame', 'polygon', 45),
}

const OWNERSHIP_KEYS = ['1', '10', '25', '50', '100'] as const

function scaledLayers(
  layers: readonly EmberlightPresentationLayer[],
  scale: number,
  suffix: string,
): readonly EmberlightPresentationLayer[] {
  return layers.map((entry) => ({
    ...entry,
    id: `${entry.id}-${suffix}`,
    scaleX: entry.scaleX * scale,
    scaleY: entry.scaleY * scale,
  }))
}

function ownershipLayers(
  seedValue: PresentationSeed,
  threshold: OwnershipThreshold,
): readonly EmberlightPresentationLayer[] {
  if (threshold === 1) return scaledLayers(seedValue.layers, 0.72, 'single')
  if (threshold === 10) {
    return [
      ...scaledLayers(seedValue.layers, 0.8, 'group-a'),
      { ...seedValue.layers[0], id: 'organized-companion', insetPercent: 18, scaleX: 0.54, scaleY: 0.54, rotationDegrees: 72, opacity: 0.72 },
    ]
  }
  if (threshold === 25) {
    return [
      ...scaledLayers(seedValue.layers, 0.9, 'resonant-group'),
      layer('resonance-route', 'arc', 'secondary', 1.08, 0.88, 24, 0, 0.72, 'dashed'),
    ]
  }
  if (threshold === 50) {
    return [
      ...seedValue.layers,
      layer('district-foundation', 'frame', 'secondary', 1.16, 0.94, 0, 0, 0.76, 'strong'),
      layer('district-route', 'branch', 'highlight', 1.1, 0.82, 0, 4, 0.68, 'thin'),
    ]
  }
  return [
    ...seedValue.layers,
    layer('named-infrastructure', 'frame', 'secondary', 1.28, 1.02, 0, 0, 0.82, 'strong'),
    layer('civilization-network', 'branch', 'highlight', 1.22, 0.94, 0, 2, 0.76, 'strong'),
    layer('topology-anchor', 'arc', 'primary', 1.34, 1.08, 0, 0, 0.64, 'dashed'),
  ]
}

function state(
  geometryLabel: string,
  pattern: string,
  layers: readonly EmberlightPresentationLayer[],
): EmberlightPresentationState {
  return { geometryLabel, pattern, layers }
}

function objectStates(
  manifest: WorldObjectManifest,
  seedValue: PresentationSeed,
): Readonly<Record<EmberlightObjectStateKey, EmberlightPresentationState>> {
  const base = state(seedValue.geometryLabel, seedValue.pattern, seedValue.layers)
  const owned = manifest.ownershipStates
  const numeric = Object.fromEntries(OWNERSHIP_KEYS.map((key) => {
    const threshold = Number(key) as OwnershipThreshold
    const authored = owned?.[threshold]
    return [key, authored
      ? state(authored.silhouette, `${seedValue.pattern}; authored ${key}-unit organization`, ownershipLayers(seedValue, threshold))
      : base]
  })) as Record<(typeof OWNERSHIP_KEYS)[number], EmberlightPresentationState>
  return {
    base,
    ...numeric,
    'reduced-motion': state(
      manifest.reducedMotionState.silhouette,
      `${seedValue.pattern}; stationary contrast steps`,
      scaledLayers(seedValue.layers, 1, 'reduced-motion').map((entry) => ({ ...entry, rotationDegrees: 0 })),
    ),
    'low-quality': state(
      manifest.lowQualityState.silhouette,
      `${seedValue.pattern}; simplified authored silhouette`,
      scaledLayers(seedValue.layers.slice(0, 2), 1, 'low-quality'),
    ),
  }
}

function descriptorFor(manifest: WorldObjectManifest): EmberlightObjectPresentation {
  const seedValue = OBJECT_SEEDS[manifest.id]
  if (!seedValue) throw new TypeError(`Missing Emberlight presentation seed for ${manifest.id}.`)
  return {
    id: manifest.id,
    depth: seedValue.depth,
    occlusion: seedValue.occlusion,
    states: objectStates(manifest, seedValue),
  }
}

const HEART_SEED = seed(
  'front',
  'irregular Last Ember with broken five-point corona',
  'five interrupted rays around a banked plasma core',
  'ash fissure cuts the lower-left corona point',
  'polygon',
  'arc',
  18,
)

function heartDescriptor(heart: HeartManifest): EmberlightHeartPresentation {
  return {
    id: heart.id,
    depth: HEART_SEED.depth,
    occlusion: HEART_SEED.occlusion,
    states: {
      base: state(HEART_SEED.geometryLabel, HEART_SEED.pattern, HEART_SEED.layers),
      'reduced-motion': state(
        heart.reducedMotionState.silhouette,
        'stationary broken-corona contrast steps',
        scaledLayers(HEART_SEED.layers, 1, 'heart-reduced').map((entry) => ({ ...entry, rotationDegrees: 0 })),
      ),
      'low-quality': state(
        heart.lowQualityState.silhouette,
        'high-contrast five-point focus target',
        scaledLayers(HEART_SEED.layers.slice(0, 2), 1, 'heart-low'),
      ),
    },
  }
}

const objects = Object.fromEntries(
  EMBERLIGHT_V2.visual.objects.map((manifest) => [manifest.id, descriptorFor(manifest)]),
) as Readonly<Record<string, EmberlightObjectPresentation>>

export const EMBERLIGHT_PRESENTATION = {
  universeId: 'emberlight',
  palette: {
    primary: '#ffb35c',
    secondary: '#7fdcff',
    highlight: '#fff4c7',
    shadow: '#3a214d',
    void: '#07070d',
  },
  heart: heartDescriptor(EMBERLIGHT_V2.heart),
  objects,
  worldStates: {},
} as const
