import { TIDEFALL_AUDIO } from '../../audio/tidefall/semantic-map'
import { TIDEFALL } from './tidefall'
import {
  TIDEFALL_ARCHIVE,
  TIDEFALL_ARCHIVE_OBJECTS,
  TIDEFALL_BEACON,
  TIDEFALL_BEACON_OBJECT,
  TIDEFALL_KINDLING_OBJECTS,
  TIDEFALL_OMEN_OBJECTS,
  TIDEFALL_OMENS,
} from './tidefall/manifests'
import {
  TIDEFALL_CANONICAL_IDENTITY,
} from './tidefall/identity'
import {
  TIDEFALL_TIDE_SIGNALS,
  tidefallTideMultiplier,
} from './tidefall/tide-state'
import { TIDEFALL_STORY_SCENES, TIDEFALL_TRIALS } from './tidefall/story'
import {
  adaptLegacyUniversePack,
  type UniversePackV2Supplement,
} from './legacy-v2-adapter'
import type {
  FourTuple,
  MotionGrammar,
  VisualState,
} from './types'

const motion = (
  kind: MotionGrammar['kind'],
  description: string,
  periodMs?: number,
): MotionGrammar => ({
  kind,
  description,
  ...(periodMs === undefined ? {} : { periodMs }),
  preservesTimingInformation: true,
})

const heartState = (
  label: string,
  silhouette: string,
  material: readonly string[],
  stateMotion: MotionGrammar,
): VisualState => ({
  label,
  silhouette,
  material,
  motion: stateMotion,
  countPresentation: 'single',
})

const TIDEFALL_DOCTRINES: FourTuple<{
  readonly id: string
  readonly name: string
  readonly description: string
  readonly favoredMotivations: readonly ('restorer' | 'optimizer' | 'performer' | 'archivist')[]
  readonly effects: readonly []
  readonly visualSignature: string
}> = [
  {
    id: 'tide-doctrine-crest-rider',
    name: 'Crest Rider',
    description: 'Favors high-tide active bursts and chains of forecast Omens.',
    favoredMotivations: ['performer', 'optimizer'],
    effects: [],
    visualSignature: 'a tall three-banded crest passing behind the Tideheart with ascending pressure notches',
  },
  {
    id: 'tide-doctrine-steady-keel',
    name: 'Steady Keel',
    description: 'Favors narrower tide variance and reliable idle and offline output.',
    favoredMotivations: ['restorer', 'optimizer'],
    effects: [],
    visualSignature: 'a horizontal salt-glass keel holding four evenly spaced waterline marks beneath the Tideheart',
  },
  {
    id: 'tide-doctrine-reef-builder',
    name: 'Reef Builder',
    description: 'Favors lower-tier resonance and persistent pelagic infrastructure.',
    favoredMotivations: ['restorer', 'archivist'],
    effects: [],
    visualSignature: 'a branching coral city joining Droplets, Tidepools, and Reef Lights around the Tideheart',
  },
  {
    id: 'tide-doctrine-abyss-listener',
    name: 'Abyss Listener',
    description: 'Favors low-tide preparation, Archive records, and Hadal rewards.',
    favoredMotivations: ['performer', 'archivist'],
    effects: [],
    visualSignature: 'a descending pressure aperture with four sounding contours and one upward answer beneath the Tideheart',
  },
]

export const TIDEFALL_V2_SUPPLEMENT: UniversePackV2Supplement = {
  id: 'tidefall',
  identity: {
    name: TIDEFALL_CANONICAL_IDENTITY.universeName,
    shortName: TIDEFALL_CANONICAL_IDENTITY.shortName,
    epithet: 'The Moonless Sea',
    premise: 'Restore a universe whose vacuum behaves like an ocean under the pull of an absent moon.',
    primaryVerb: TIDEFALL_CANONICAL_IDENTITY.primaryVerb,
    civilizationQuestion: TIDEFALL_CANONICAL_IDENTITY.civilizationQuestion,
  },
  economy: {
    currency: {
      id: 'tidefall-glow',
      canonicalName: 'World Currency',
      localName: TIDEFALL_CANONICAL_IDENTITY.currencyName,
      singular: 'Glow',
      plural: 'Glow',
      glyph: '◉',
      material: 'bioluminescent water held under pressure',
      scope: 'world',
    },
    doctrines: TIDEFALL_DOCTRINES,
    localPrestige: {
      id: 'tidefall-undertow',
      canonicalName: 'Epoch Turn',
      localName: TIDEFALL_CANONICAL_IDENTITY.epochTurnName,
      rewardCurrency: {
        id: 'tidefall-moon-salt',
        canonicalName: 'Epoch Matter',
        localName: TIDEFALL_CANONICAL_IDENTITY.epochMatterName,
        singular: 'Moon Salt',
        plural: 'Moon Salt',
        glyph: '◇',
        material: 'nacreous salt crystallized from a reversed world-current',
        scope: 'epoch',
      },
      gainFormulaId: 'tidefall-undertow-gain',
      loses: ['world-currency', 'run-earnings', 'kindlings', 'ordinary-upgrades', 'buy-mode'],
      retains: ['epoch-matter', 'epoch-doctrines', 'epoch-works', 'era-earnings', 'deep-currency', 'deep-laws', 'deep-works', 'trials', 'archive', 'story', 'beacons', 'between-currency', 'wayfinder'],
      ceremonyFeedbackId: 'tidefall-undertow-feedback',
    },
  },
  heart: {
    id: 'tidefall-tideheart',
    canonicalName: 'Heart',
    localName: TIDEFALL_CANONICAL_IDENTITY.heartName,
    phenomenon: 'A dense bioluminescent pearl enclosing a pressure void.',
    purpose: 'Primary focusable input and the source from which every remembered current receives Glow.',
    material: ['layered nacre', 'compressed bioluminescent water', 'pressure void'],
    silhouette: 'an asymmetric pearl enclosing a dark crescent and three pressure rings',
    idleMotion: motion('tidal', 'Nacre layers compress locally and release one pressure ring on the visible tide.', 6_000),
    touchMotion: motion('authored', 'The pearl compresses inward, releases a nacre ring, and rebounds along the current.', 420),
    reducedMotionState: heartState(
      'Tideheart reduced-motion touch state',
      'asymmetric pearl with three fixed pressure-ring positions',
      ['layered nacre', 'pressure void'],
      motion('still', 'A local contrast step and fixed pressure-ring sequence preserve touch and tide timing.'),
    ),
    lowQualityState: heartState(
      'Tideheart low-quality focus state',
      'high-contrast pearl enclosing a dark crescent',
      ['layered nacre', 'pressure void'],
      motion('still', 'The full focus target and named crescent silhouette remain stable.'),
    ),
    touchCue: 'tide-click-pressure',
    focusLabel: 'Tideheart, Heart of Tidefall; surf Glow',
  },
  physics: {
    randomAllowed: true,
    rateMultiplier: (_state, nowMs) => tidefallTideMultiplier(nowMs),
  },
  omens: TIDEFALL_OMENS,
  archive: TIDEFALL_ARCHIVE,
  trials: TIDEFALL_TRIALS,
  story: {
    civilizationQuestion: TIDEFALL_CANONICAL_IDENTITY.civilizationQuestion,
    scenes: TIDEFALL_STORY_SCENES,
  },
  audio: TIDEFALL_AUDIO,
  visual: {
    materials: ['luminous water', 'bioluminescent tissue', 'nacre', 'suspended silt', 'translucent membrane', 'kelp fiber', 'pressure distortion'],
    primarySilhouettes: ['pressure ripple', 'braided current', 'branching reef', 'nacre pearl', 'whale-like migration', 'hadal trench', 'moon wake'],
    motionGrammar: ['still', 'tidal', 'growth', 'optical', 'waveform', 'authored'],
    zones: {
      heart: { purpose: 'The Tideheart remains clear while local pressure rings and touch feedback resolve around it.', maximumInteractiveObjects: 2, motionFrequency: 'medium' },
      near: { purpose: 'Surface water, Tidepools, reef settlement, and reachable Omens establish the active current.', maximumInteractiveObjects: 3, motionFrequency: 'high' },
      far: { purpose: 'Pelagic migrations, moon wakes, beacons, and Archive soundings cross one readable mid-depth.', maximumInteractiveObjects: 3, motionFrequency: 'medium' },
      horizon: { purpose: 'The absent moon, Living Sea, unresolved trench, Leviathan, and final Beacon define the world edge.', maximumInteractiveObjects: 2, motionFrequency: 'low' },
    },
    objects: [
      ...TIDEFALL_KINDLING_OBJECTS,
      ...TIDEFALL_ARCHIVE_OBJECTS,
      ...TIDEFALL_OMEN_OBJECTS,
      TIDEFALL_BEACON_OBJECT,
    ],
    densityMerges: [
      {
        sourceIds: ['tide-kindling-droplet', 'tide-kindling-ripple', 'tide-kindling-tidepool'],
        threshold: 25,
        resultObjectId: 'tide-kindling-current',
        description: 'Droplets, Ripples, and Tidepools become one authored Current instead of repeated particles.',
      },
      {
        sourceIds: ['tide-kindling-reef-light', 'tide-kindling-kelp-cathedral', 'tide-kindling-bioluminance'],
        threshold: 50,
        resultObjectId: 'tide-kindling-living-sea',
        description: 'Reef lights and kelp settlements merge into the named Living Sea civilization.',
      },
      {
        sourceIds: ['tide-kindling-shoal-constellation', 'tide-archive-century-leviathan', 'tide-omen-object-leviathan-passage'],
        threshold: 10,
        resultObjectId: 'tide-kindling-ocean-of-moons',
        description: 'Pelagic creatures read as one migration beneath the pressure lenses of the Ocean of Moons.',
      },
      {
        sourceIds: ['tide-kindling-current', 'tide-kindling-twin-tides', 'tide-kindling-world-current'],
        threshold: 100,
        resultObjectId: 'tide-kindling-world-current',
        description: 'Local currents join the explicit World Current route rather than obscuring the Heart.',
      },
    ],
    attentionBudget: {
      primaryTargets: 1,
      secondaryInteractiveObjects: 3,
      temporaryRewardEffects: 2,
      storySubtitles: 1,
      majorPanels: 1,
    },
  },
  beacon: TIDEFALL_BEACON,
  accessibility: {
    heartLabel: 'Tideheart, Heart of Tidefall; surf Glow',
    currencyLabel: 'Glow, Tidefall World currency',
    screenReaderOrder: [
      'tidefall-tideheart',
      'tidefall-tide-state',
      ...TIDEFALL_KINDLING_OBJECTS.map((object) => object.id),
      ...TIDEFALL_OMEN_OBJECTS.map((object) => object.id),
      'pelagic-archive',
      'tidefall-beacon',
    ],
    announcements: [
      { messageKey: 'tidefall.announcement.tide-state', politeness: 'polite', dedupeKey: 'tidefall-tide-state', minimumIntervalMs: 4_000 },
      { messageKey: 'tidefall.announcement.omen', politeness: 'assertive', dedupeKey: 'tidefall-omen', minimumIntervalMs: 1_000 },
      { messageKey: 'tidefall.announcement.archive', politeness: 'polite', dedupeKey: 'tidefall-archive', minimumIntervalMs: 1_000 },
      { messageKey: 'tidefall.announcement.undertow', politeness: 'polite', dedupeKey: 'tidefall-undertow', minimumIntervalMs: 3_000 },
    ],
    nonColorSignals: [
      TIDEFALL_TIDE_SIGNALS.rising,
      TIDEFALL_TIDE_SIGNALS.high,
      TIDEFALL_TIDE_SIGNALS.falling,
      TIDEFALL_TIDE_SIGNALS.low,
      { stateId: 'tidefall-omen-spring-tide', text: 'Spring Tide reachable', shape: 'three ascending crest arcs', pattern: 'wide-wide-crest', highContrastTreatment: 'numbered white arcs with black inset' },
      { stateId: 'tidefall-omen-undertow', text: 'Undertow reachable', shape: 'inward pressure teeth', pattern: 'outside-in arrows', highContrastTreatment: 'double inward outline and countdown text' },
      { stateId: 'tidefall-omen-moon-pearl', text: 'Moon Pearl reachable', shape: 'layered crescent pearl', pattern: 'three nacre rings', highContrastTreatment: 'black crescent inside three white rings' },
      { stateId: 'tidefall-omen-abyssal-bloom', text: 'Abyssal Bloom reachable', shape: 'six-petal vent flower', pattern: 'paired opening petals', highContrastTreatment: 'six outlined petals and remaining-time text' },
      { stateId: 'tidefall-omen-leviathan', text: 'Century Leviathan surfacing', shape: 'whale shadow with three wake notches', pattern: 'surfacing one, two, three', highContrastTreatment: 'numbered wake marks on a solid silhouette' },
    ],
    timing: {
      visualCue: 'The Tideheart waterline and pressure ring settle into one of four labeled tide shapes.',
      audioCue: 'Pressure-drop pitch and the Tideclock cadence rise, crest, fall, and deepen without carrying exclusive information.',
      shapeCue: 'Ascending arcs, a broad crest, descending arcs, and a basin crescent identify every tide phase.',
      averagedModeAvailable: true,
      averagedRewardRatio: [0.85, 0.9],
    },
    muted: {
      fullGameplayEquivalent: true,
      captions: ['Tide state and multiplier', 'Omen identity, path, and remaining window', 'Century Leviathan surfacing count', 'Undertow phase and Moon Salt return'],
    },
    reducedMotion: {
      fullGameplayEquivalent: true,
      replacementStrategy: 'crossfade',
      timingInformationPreserved: true,
    },
    lowQuality: {
      fullGameplayEquivalent: true,
      preservesHitTargets: true,
      preservesStateLabels: true,
    },
  },
}

export const TIDEFALL_V2_PACK = adaptLegacyUniversePack(TIDEFALL, TIDEFALL_V2_SUPPLEMENT)
