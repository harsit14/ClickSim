import type {
  ArchiveDef,
  AtLeastFour,
  AudioBusDef,
  AudioBusId,
  AudioCueDef,
  FourTuple,
  MotionGrammar,
  OmenDef,
  TwelveTuple,
  UniverseAudioDef,
  VisualState,
  WorldObjectManifest,
} from '../types'
import { adaptLegacyUniversePack, type UniversePackV2Supplement } from '../legacy-v2-adapter'
import { VERDANCE_COHORT_RULES } from './cohorts'
import type { Effect } from '../../upgrades'
import {
  VERDANCE,
  VERDANCE_CURIOSITIES,
  VERDANCE_GENERATORS,
} from './legacy'

const motion = (kind: MotionGrammar['kind'], description: string, periodMs?: number): MotionGrammar => ({
  kind,
  description,
  ...(periodMs ? { periodMs } : {}),
  preservesTimingInformation: true,
})

const state = (
  label: string,
  silhouette: string,
  material: readonly string[],
  stateMotion: MotionGrammar,
  countPresentation: VisualState['countPresentation'] = 'single',
): VisualState => ({ label, silhouette, material, motion: stateMotion, countPresentation })

const OWNERSHIP_LABELS = ['single specimen', 'organized grove', 'connected habitat', 'biome district', 'named living infrastructure'] as const

function generatorObject(index: number): WorldObjectManifest {
  const generator = VERDANCE_GENERATORS[index]
  const materials = index < 5 ? ['seed shell', 'root fiber', 'dew']
    : index < 12 ? ['bark', 'leaf cuticle', 'mycelium']
      : ['continental root', 'amber light', 'living atmosphere']
  const baseSilhouette = [
    'split seed with one visible growth ring', 'three root hairs around a water bead', 'two cotyledons above a pale stem',
    'low moss cushion with capillary channels', 'branching fungal thread joining two nodes', 'uneven grove canopy above shared roots',
    'three wing paths around a flower spiral', 'branching orchard holding amber fruit', 'trunk cross-section with four memory rings',
    'layered canopy catching five rain threads', 'walking root arches carrying a small canopy', 'seven canopy gaps joined as a remembered constellation',
    'continental root fan with luminous junctions', 'flowering sphere around a photosynthetic corona', 'planetary canopy crown with open atmosphere',
    'world-spanning root fork preserving open basins', 'forest horizon crossed by visible memory rings', 'world-tree crown and root system framing an open Heart',
  ][index]
  const objectId = `verdance-object-kindling-${String(index + 1).padStart(2, '0')}`
  const ownershipStates = Object.fromEntries(([1, 10, 25, 50, 100] as const).map((threshold, thresholdIndex) => [
    threshold,
    state(
      `${generator.name}: ${OWNERSHIP_LABELS[thresholdIndex]}`,
      `${baseSilhouette}; ${OWNERSHIP_LABELS[thresholdIndex]}`,
      materials,
      motion('growth', `Growth rings and vascular flow resolve as ${OWNERSHIP_LABELS[thresholdIndex]}.`, 4_800 + index * 160),
      threshold < 10 ? 'single' : threshold < 50 ? 'group' : 'infrastructure',
    ),
  ])) as Record<1 | 10 | 25 | 50 | 100, VisualState>
  return {
    id: objectId,
    sourceKind: 'generator',
    sourceId: generator.id,
    phenomenon: `${generator.name} growing as part of Verdance's living planetary network`,
    purpose: `Shows ${generator.name} ownership, maturity, and its place in the shared root system.`,
    screenZone: index < 5 ? 'near' : index < 13 ? 'far' : 'horizon',
    salience: index === 17 ? 'milestone' : index < 6 ? 'supporting' : 'ambient',
    material: materials,
    silhouette: baseSilhouette,
    motion: motion('growth', 'The organism unfurls, exchanges Sap, and records age through local growth rings.', 5_400 + index * 180),
    ownershipStates,
    reducedMotionState: state(`${generator.name} growth-ring state`, `${baseSilhouette} with four fixed labeled age rings`, materials, motion('still', 'Fixed ring count and local contrast preserve maturity information.'), 'infrastructure'),
    lowQualityState: state(`${generator.name} simplified state`, `high-contrast ${baseSilhouette}`, materials.slice(0, 2), motion('still', 'One stable contour preserves identity and ownership label.'), 'single'),
    overlapGroup: index < 5 ? 'verdance-roots' : index < 13 ? 'verdance-canopy' : 'verdance-horizon',
    canOverlapWith: [],
    minimumHeartDistance: 1.5,
    priorityWhilePanelOpen: index === 17 ? 'hold' : 'dim',
    audioCue: 'verdance-purchase-root',
  }
}

export const VERDANCE_KINDLING_OBJECTS = VERDANCE_GENERATORS.map((_entry, index) => generatorObject(index))

const ARCHIVE_SILHOUETTES = [
  'folded fern frond inside a drought ring', 'five-petal orchid turning toward an absent moon', 'walking mangrove on three root arches',
  'transparent lichen scales bridging two stones', 'amber drop containing three seasonal layers', 'fan fungus crossed by waveform gills',
  'vine fork pointing toward three futures', 'oak ring split by a silver lightning branch', 'pollen star with six hooked grains',
  'seed shell containing a tidepool crescent', 'fossil root preserving one deliberate break', 'living cutting opening as a seven-point gate',
] as const

export const VERDANCE_ARCHIVE_OBJECTS: WorldObjectManifest[] = VERDANCE_CURIOSITIES.map((item, index) => {
  const materials = index < 4 ? ['leaf cuticle', 'dew', 'root fiber'] : index < 8 ? ['amber', 'mycelium', 'living sap'] : ['seed shell', 'fossil cambium', 'star pollen']
  return {
    id: `verdance-object-archive-${String(index + 1).padStart(2, '0')}`,
    sourceKind: 'archive',
    sourceId: item.id,
    phenomenon: `${item.name}, a living record in the Impossible Herbarium`,
    purpose: `Makes the ${item.name} Archive effect and story visible in the world.`,
    screenZone: index % 3 === 0 ? 'near' : 'far',
    salience: 'interactive',
    material: materials,
    silhouette: ARCHIVE_SILHOUETTES[index],
    motion: motion('growth', 'The specimen opens toward nearby roots without leaving its herbarium locus.', 6_000 + index * 220),
    reducedMotionState: state(`${item.name} fixed specimen`, `${ARCHIVE_SILHOUETTES[index]} with numbered growth stages`, materials, motion('still', 'A fixed before-and-after pose preserves the specimen effect.'), 'single'),
    lowQualityState: state(`${item.name} simplified specimen`, `one high-contrast ${ARCHIVE_SILHOUETTES[index]}`, materials.slice(0, 2), motion('still', 'One stable contour and text preserve the record.'), 'single'),
    overlapGroup: 'verdance-archive',
    canOverlapWith: [],
    minimumHeartDistance: 1.75,
    priorityWhilePanelOpen: 'hide',
    audioCue: 'verdance-archive-reveal',
    loreRecord: item.id,
  }
})

const OMEN_DATA = [
  ['verdance-omen-golden-pollinator', 'Golden Pollinator', 'a four-winged pollinator tracing a phyllotaxis route', 'Follow its flower route to multiply Sap.'],
  ['verdance-omen-spore-rain', 'Spore Rain', 'a slanting veil of spores rooting wherever it settles', 'Plants young cohorts and accelerates root connections.'],
  ['verdance-omen-sunbreak', 'Sunbreak', 'a narrow moving shaft of light crossing the canopy', 'Empowers each Kindling crossed by the light.'],
  ['verdance-omen-amber-fruit', 'Amber Fruit', 'a layered fruit holding visible age rings', 'Harvest stored age now or let it ripen deterministically.'],
] as const

const VERDANCE_OMEN_EFFECTS: FourTuple<readonly Effect[]> = [
  [{ kind: 'clickMult', value: 1.3 }, { kind: 'critChance', value: 0.015 }],
  [{ kind: 'synergyMult', value: 1.12 }, { kind: 'globalMult', value: 1.06 }],
  [{ kind: 'globalMult', value: 1.16 }],
  [{ kind: 'clickShare', value: 0.006 }, { kind: 'critMult', value: 1.35 }],
]

export const VERDANCE_OMEN_OBJECTS: WorldObjectManifest[] = OMEN_DATA.map(([id, name, silhouette], index) => ({
  id: `verdance-object-omen-${String(index + 1).padStart(2, '0')}`,
  sourceKind: 'omen',
  sourceId: id,
  phenomenon: `${name} crossing Verdance's living network`,
  purpose: `Presents the ${name} opportunity through a unique route and silhouette.`,
  screenZone: index < 2 ? 'near' : 'far',
  salience: 'interactive',
  material: index === 3 ? ['amber skin', 'stored age'] : ['pollen light', 'leaf shadow', 'living air'],
  silhouette,
  motion: motion(index === 2 ? 'optical' : index === 1 ? 'atmospheric' : 'growth', `${name} follows its authored ecological route.`, 4_200 + index * 600),
  reducedMotionState: state(`${name} fixed route`, `${silhouette} beside three numbered route stations`, ['pollen light', 'leaf outline'], motion('still', 'Three fixed stations and a countdown preserve opportunity timing.'), 'single'),
  lowQualityState: state(`${name} simplified route`, `high-contrast ${silhouette}`, ['pollen light', 'leaf outline'], motion('still', 'One stable target and countdown preserve full interaction.'), 'single'),
  overlapGroup: 'verdance-omen',
  canOverlapWith: [],
  minimumHeartDistance: 1.6,
  priorityWhilePanelOpen: 'hide',
  audioCue: 'verdance-omen-call',
}))

export const VERDANCE_OMENS = OMEN_DATA.map(([id, name, _silhouette, description], index) => ({
  id,
  name,
  description,
  spawn: { mode: 'random' as const, baseChance: 0.04 - index * 0.006, pityThreshold: 16 + index * 4, oddsVisibleAfterDiscovery: true },
  rewards: [{ id: `${id}-reward`, description, exclusivePermanentPower: false as const, effects: VERDANCE_OMEN_EFFECTS[index] }],
  object: VERDANCE_OMEN_OBJECTS[index],
  accessibilityLabel: `${name} available. ${description}`,
})) as unknown as AtLeastFour<OmenDef>

export const VERDANCE_ARCHIVE: ArchiveDef = {
  id: 'verdance-impossible-herbarium',
  canonicalName: 'Field Archive',
  localName: 'Impossible Herbarium',
  records: VERDANCE_CURIOSITIES.map((item, index) => ({
    id: item.id,
    name: item.name,
    observation: item.flavor,
    implication: item.record,
    effectDescription: item.desc,
    object: VERDANCE_ARCHIVE_OBJECTS[index],
  })) as unknown as TwelveTuple<ArchiveDef['records'][number]>,
  shelves: [
    { id: 'verdance-shelf-survival', name: 'Survival', recordIds: VERDANCE_CURIOSITIES.slice(0, 4).map(({ id }) => id) as unknown as FourTuple<string>, rewardDescription: 'Offline aging keeps full speed to the declared cap.' },
    { id: 'verdance-shelf-communication', name: 'Communication', recordIds: VERDANCE_CURIOSITIES.slice(4, 8).map(({ id }) => id) as unknown as FourTuple<string>, rewardDescription: 'Grafts transmit one visible trait farther through the root network.' },
    { id: 'verdance-shelf-inheritance', name: 'Inheritance', recordIds: VERDANCE_CURIOSITIES.slice(8, 12).map(({ id }) => id) as unknown as FourTuple<string>, rewardDescription: 'Mature and ancient cohorts yield stronger Memory Seed inheritance.' },
  ],
}

const bus = (id: AudioBusId, parent: AudioBusId | null, defaultGain: number): AudioBusDef => ({ id, parent, defaultGain, userControllable: true, muteBehavior: 'suppress-audio-only' })
const cue = (id: string, cueBus: AudioBusId, family: string, priority: AudioCueDef['priority'], mutedFallback: AudioCueDef['mutedFallback'], minimumIntervalMs = 100): AudioCueDef => ({
  id, bus: cueBus, family, synthesisKey: `${id}-synthesis`, targetPeakDb: priority === 'ceremony' ? -8 : -14, maximumPeakDb: -6,
  minimumIntervalMs, maximumConcurrentInstances: priority === 'normal' ? 2 : 1, priority, muteGroup: `verdance-${cueBus}`, mutedFallback,
})

export const VERDANCE_AUDIO: UniverseAudioDef = {
  tempoBpm: 84,
  meter: '6/8 asymmetrical growth pulse',
  buses: [bus('master', null, 0.82), bus('music', 'master', 0.58), bus('ambient', 'master', 0.42), bus('interface', 'master', 0.62), bus('touch', 'master', 0.68), bus('purchase', 'interface', 0.64), bus('omen', 'master', 0.72), bus('story', 'master', 0.54), bus('ceremony', 'master', 0.76)],
  cues: [
    cue('verdance-click-seedcoat', 'touch', 'seedcoat-and-root', 'normal', 'none', 80),
    cue('verdance-purchase-root', 'purchase', 'wooden-sixth-rise', 'normal', 'visual', 120),
    cue('verdance-critical-bloom', 'touch', 'flowering-accent', 'important', 'visual', 180),
    cue('verdance-omen-call', 'omen', 'pollinator-and-leaf-call', 'important', 'visual-and-caption', 500),
    cue('verdance-pruning-cadence', 'ceremony', 'tender-pruning-cadence', 'ceremony', 'visual-and-caption', 2_500),
    cue('verdance-archive-reveal', 'story', 'herbarium-page-and-breath', 'important', 'caption', 500),
    cue('verdance-beacon-flower', 'ceremony', 'world-tree-beacon-flower', 'ceremony', 'visual-and-caption', 2_500),
  ],
  clickMaterialCue: 'verdance-click-seedcoat',
  purchaseIntervalCue: 'verdance-purchase-root',
  criticalAccentCue: 'verdance-critical-bloom',
  omenCallCue: 'verdance-omen-call',
  prestigeCadenceCue: 'verdance-pruning-cadence',
  stems: [
    { id: 'verdance-stem-roots', kindlingFamily: 'verdance-kindling-01', bus: 'music', description: 'Root-bass pulses and seed-shell percussion.' },
    { id: 'verdance-stem-groves', kindlingFamily: 'verdance-kindling-06', bus: 'music', description: 'Wooden hand percussion and leaf-noise rhythm.' },
    { id: 'verdance-stem-pollinators', kindlingFamily: 'verdance-kindling-07', bus: 'music', description: 'Breathy flute synthesis following pollination routes.' },
    { id: 'verdance-stem-world-root', kindlingFamily: 'verdance-kindling-16', bus: 'music', description: 'Deep vascular pulse and canopy harmony.' },
  ],
  silenceState: 'Growth rings, route stations, and captions preserve every timing and maturity cue.',
  fatiguePolicy: 'Seedcoat transients soften after four touches per second; Omens duck leaf noise; Pruning subtracts the canopy before introducing Memory Seed resonance.',
}

const VERDANCE_BEACON_OBJECT: WorldObjectManifest = {
  id: 'verdance-object-beacon-world-tree',
  sourceKind: 'beacon',
  sourceId: 'verdance-beacon-world-tree',
  phenomenon: 'The World-Tree opening one seven-point Beacon flower into the Dark Between',
  purpose: 'Shows that Verdance can adapt and continue without the player tending every branch.',
  screenZone: 'horizon',
  salience: 'milestone',
  material: ['ancient heartwood', 'star pollen', 'living amber'],
  silhouette: 'open world-tree crown with one seven-point Beacon flower and visible root ring',
  motion: motion('growth', 'The Beacon flower opens once, then exchanges slow pollen signals with neighboring worlds.', 12_000),
  reducedMotionState: state('World-Tree Beacon fixed answer', 'world-tree crown with seven numbered petals and one root ring', ['ancient heartwood', 'star pollen'], motion('still', 'Petal numbers and a local contrast step preserve the Beacon answer.'), 'infrastructure'),
  lowQualityState: state('World-Tree Beacon simplified answer', 'high-contrast tree crown and seven-point flower', ['heartwood', 'pollen light'], motion('still', 'One stable silhouette and text preserve Beacon state.'), 'infrastructure'),
  overlapGroup: 'verdance-beacon',
  canOverlapWith: [],
  minimumHeartDistance: 2,
  priorityWhilePanelOpen: 'hold',
  audioCue: 'verdance-beacon-flower',
  loreRecord: 'verdance-echo-10',
}

export const VERDANCE_V2_SUPPLEMENT: UniversePackV2Supplement = {
  id: 'verdance',
  identity: {
    name: VERDANCE.name,
    shortName: VERDANCE.shortName,
    epithet: 'The Patient World',
    premise: 'Grow a dead seed into a planetary organism whose networks remember every careful pruning.',
    primaryVerb: 'cultivate',
    civilizationQuestion: 'Is preservation still life if nothing is allowed to change?',
  },
  economy: {
    currency: { id: 'verdance-sap', canonicalName: 'World Currency', localName: 'Sap', singular: 'Sap', plural: 'Sap', glyph: '❧', material: 'luminous living sap carried through a vascular network', scope: 'world' },
    doctrines: [
      {
        id: 'verdance-doctrine-canopy', name: 'Canopy', description: 'Favors mature high tiers and long growth cycles.', favoredMotivations: ['restorer', 'optimizer'],
        effects: VERDANCE_GENERATORS.slice(12).map(({ id }) => ({ kind: 'genMult' as const, gen: id, value: 1.18 })),
        visualSignature: 'a broad open canopy whose rings brighten with cohort age',
      },
      {
        id: 'verdance-doctrine-rhizome', name: 'Rhizome', description: 'Favors broad lower tiers and root-network resonance.', favoredMotivations: ['optimizer', 'restorer'],
        effects: [
          ...VERDANCE_GENERATORS.slice(0, 6).map(({ id }) => ({ kind: 'genMult' as const, gen: id, value: 1.08 })),
          { kind: 'synergyMult', value: 1.22 },
        ],
        visualSignature: 'forked root routes joining every foundational Kindling',
      },
      { id: 'verdance-doctrine-bloom', name: 'Bloom', description: 'Favors active pollination, rhythm, and Omens.', favoredMotivations: ['performer', 'archivist'], effects: [{ kind: 'clickMult', value: 1.28 }, { kind: 'critChance', value: 0.02 }], visualSignature: 'a phyllotaxis bloom with four reachable pollination stations' },
      { id: 'verdance-doctrine-seedbank', name: 'Seedbank', description: 'Favors rapid Pruning, offline aging, and strong starts.', favoredMotivations: ['restorer', 'wayfinder'], effects: [{ kind: 'globalMult', value: 1.12 }, { kind: 'clickShare', value: 0.006 }], visualSignature: 'four nested seed shells preserving visible growth rings' },
    ],
    localPrestige: {
      id: 'verdance-pruning', canonicalName: 'Epoch Turn', localName: 'Pruning',
      rewardCurrency: { id: 'verdance-memory-seeds', canonicalName: 'Epoch Matter', localName: 'Memory Seeds', singular: 'Memory Seed', plural: 'Memory Seeds', glyph: '◇', material: 'living seed shells inscribed with mature growth rings', scope: 'epoch' },
      gainFormulaId: 'verdance-pruning-maturity-gain',
      loses: ['world-currency', 'run-earnings', 'kindlings', 'ordinary-upgrades', 'buy-mode'],
      retains: ['epoch-matter', 'epoch-doctrines', 'epoch-works', 'era-earnings', 'deep-currency', 'deep-laws', 'deep-works', 'trials', 'archive', 'story', 'beacons', 'between-currency', 'wayfinder'],
      ceremonyFeedbackId: 'verdance-pruning-cadence',
    },
  },
  heart: {
    id: 'verdance-first-seed', canonicalName: 'Heart', localName: 'First Seed',
    phenomenon: 'A planetary seed whose coat holds the first dormant root network.',
    purpose: 'Primary focusable input and the germination center of Verdance.',
    material: ['seed shell', 'luminous cambium', 'root fiber'],
    silhouette: 'split seed coat around one bright cotyledon and three root points',
    idleMotion: motion('growth', 'The seed coat breathes locally while one root point tests the soil.', 4_800),
    touchMotion: motion('authored', 'The coat compresses, a vein flashes through nearby roots, and the cotyledon rebounds.', 360),
    reducedMotionState: state('First Seed reduced-motion state', 'split seed with three fixed root points and one contrast vein', ['seed shell', 'luminous cambium'], motion('still', 'A local contrast vein and fixed root marks preserve touch timing.'), 'single'),
    lowQualityState: state('First Seed low-quality state', 'high-contrast split seed and one root fork', ['seed shell', 'cambium'], motion('still', 'The full focus target and one stable contour remain.'), 'single'),
    touchCue: 'verdance-click-seedcoat',
    focusLabel: 'First Seed, Heart of Verdance; cultivate Sap',
  },
  physics: { randomAllowed: true, cohorts: VERDANCE_COHORT_RULES },
  omens: VERDANCE_OMENS,
  archive: VERDANCE_ARCHIVE,
  trials: [
    { id: 'verdance-trial-scarcity', name: 'Scarcity', historicalFailure: 'The old groves eliminated scarcity and lost the need to adapt.', rules: { sapCap: 100000 }, goal: { metricId: 'mature-cohorts', target: 12, description: 'Mature twelve cohorts under a bounded Sap reserve.' }, rewardEffects: [{ kind: 'globalMult', value: 1.04 }], accessibilityDescription: 'Resource cap and maturity are shown through text, ring count, and shape.' },
    { id: 'verdance-trial-mutation', name: 'Mutation', historicalFailure: 'Unapproved variation was pruned before it could teach the forest.', rules: { fixedGrafts: false }, goal: { metricId: 'distinct-grafts', target: 4, description: 'Complete four useful grafts without repeating a trait.' }, rewardEffects: [{ kind: 'synergyMult', value: 1.06 }], accessibilityDescription: 'Every graft uses a named trait, branch shape, and text label.' },
    { id: 'verdance-trial-shade', name: 'Shade', historicalFailure: 'Perfect canopies denied every young grove a clearing.', rules: { canopyProduction: 0 }, goal: { metricId: 'root-production', target: 1e9, description: 'Reach the target through roots and understory organisms.' }, rewardEffects: VERDANCE_GENERATORS.slice(0, 6).map(({ id }) => ({ kind: 'genMult' as const, gen: id, value: 1.06 })), accessibilityDescription: 'Disabled canopy tiers remain labeled and the active root route is high contrast.' },
    { id: 'verdance-trial-deliberate-loss', name: 'Deliberate Loss', historicalFailure: 'The civilization confused every ending with harm.', rules: { pruningRequired: true }, goal: { metricId: 'memory-seeds', target: 20, description: 'Prune mature growth deliberately and recover twenty Memory Seeds.' }, rewardEffects: [{ kind: 'globalMult', value: 1.08 }], accessibilityDescription: 'The exact pruned and retained categories are previewed before every action.' },
  ],
  story: {
    civilizationQuestion: 'Is preservation still life if nothing is allowed to change?',
    scenes: [
      { id: 'verdance-scene-arrival', kind: 'arrival', skippableAfterFirstView: true, replayable: true },
      { id: 'verdance-scene-pruning', kind: 'epoch', skippableAfterFirstView: true, replayable: true },
      { id: 'verdance-scene-deep-roots', kind: 'deep', skippableAfterFirstView: true, replayable: true },
      { id: 'verdance-scene-world-tree-beacon', kind: 'beacon', skippableAfterFirstView: true, replayable: true },
      { id: 'verdance-scene-amber-transmission', kind: 'transmission', skippableAfterFirstView: true, replayable: true },
    ],
  },
  audio: VERDANCE_AUDIO,
  visual: {
    materials: ['bark', 'cambium', 'leaf cuticle', 'mycelium', 'pollen', 'amber', 'dew', 'seed shell', 'root fiber'],
    primarySilhouettes: ['branching root', 'phyllotaxis spiral', 'fungal fan', 'open canopy', 'fruiting body', 'vascular network'],
    motionGrammar: ['still', 'growth', 'atmospheric', 'optical', 'authored'],
    zones: {
      heart: { purpose: 'The First Seed and its immediate germination veins remain clear.', maximumInteractiveObjects: 2, motionFrequency: 'medium' },
      near: { purpose: 'Roots, understory, reachable pollinators, and living specimens occupy open ground.', maximumInteractiveObjects: 3, motionFrequency: 'medium' },
      far: { purpose: 'Groves, canopy networks, and Herbarium signals share the middle distance.', maximumInteractiveObjects: 3, motionFrequency: 'low' },
      horizon: { purpose: 'The Biosphere Crown, World Root, World-Tree, and Beacon frame the sky without covering the Heart.', maximumInteractiveObjects: 2, motionFrequency: 'low' },
    },
    objects: [...VERDANCE_KINDLING_OBJECTS, ...VERDANCE_ARCHIVE_OBJECTS, ...VERDANCE_OMEN_OBJECTS, VERDANCE_BEACON_OBJECT],
    densityMerges: [
      { sourceIds: VERDANCE_KINDLING_OBJECTS.slice(0, 5).map(({ id }) => id), threshold: 25, resultObjectId: VERDANCE_KINDLING_OBJECTS[5].id, description: 'Seedlings and roots become one Young Grove instead of scattered copies.' },
      { sourceIds: VERDANCE_KINDLING_OBJECTS.slice(5, 12).map(({ id }) => id), threshold: 50, resultObjectId: VERDANCE_KINDLING_OBJECTS[12].id, description: 'Groves and canopy systems become the Continental Rhizome network.' },
      { sourceIds: VERDANCE_KINDLING_OBJECTS.slice(12, 18).map(({ id }) => id), threshold: 100, resultObjectId: VERDANCE_KINDLING_OBJECTS[17].id, description: 'Planetary growth becomes the named World-Tree infrastructure.' },
    ],
    attentionBudget: { primaryTargets: 1, secondaryInteractiveObjects: 3, temporaryRewardEffects: 2, storySubtitles: 1, majorPanels: 1 },
  },
  beacon: {
    id: 'verdance-beacon-world-tree', canonicalName: 'Beacon', localName: 'The Garden Flower',
    requirement: { sourceKind: 'generator', sourceId: 'verdance-kindling-18', target: 1, description: 'Grow one World-Tree capable of opening beyond its native sky.' },
    darkBetweenReward: 3,
    object: VERDANCE_BEACON_OBJECT,
    mapSilhouette: 'world-tree crown opening one seven-point flower above a visible root ring',
  },
  accessibility: {
    heartLabel: 'First Seed, Heart of Verdance; cultivate Sap',
    currencyLabel: 'Sap, Verdance World currency',
    screenReaderOrder: ['verdance-first-seed', ...VERDANCE_KINDLING_OBJECTS.map(({ id }) => id), 'verdance-impossible-herbarium', 'verdance-beacon-world-tree'],
    announcements: [
      { messageKey: 'verdance.announcement.cohort', politeness: 'polite', dedupeKey: 'verdance-cohort', minimumIntervalMs: 4_000 },
      { messageKey: 'verdance.announcement.omen', politeness: 'assertive', dedupeKey: 'verdance-omen', minimumIntervalMs: 1_000 },
      { messageKey: 'verdance.announcement.pruning', politeness: 'polite', dedupeKey: 'verdance-pruning', minimumIntervalMs: 3_000 },
    ],
    nonColorSignals: [
      { stateId: 'verdance-cohort-new', text: 'New cohort', shape: 'closed seed', pattern: 'one ring', highContrastTreatment: 'solid white seed outline and NEW label' },
      { stateId: 'verdance-cohort-rooted', text: 'Rooted cohort', shape: 'seed with one root fork', pattern: 'two rings', highContrastTreatment: 'white root fork and ROOTED label' },
      { stateId: 'verdance-cohort-mature', text: 'Mature cohort', shape: 'open canopy', pattern: 'three rings', highContrastTreatment: 'open crown and MATURE label' },
      { stateId: 'verdance-cohort-ancient', text: 'Ancient cohort', shape: 'broad crown and root ring', pattern: 'four rings', highContrastTreatment: 'double crown, root ring, and ANCIENT label' },
    ],
    timing: { visualCue: 'Growth rings and vascular flashes identify cohort and pollination timing.', audioCue: 'Root pulses and leaf calls provide optional timing without exclusive rewards.', shapeCue: 'Closed seed, root fork, open canopy, and broad crown identify cohort stages.', averagedModeAvailable: true, averagedRewardRatio: [0.85, 0.9] },
    muted: { fullGameplayEquivalent: true, captions: ['Cohort stage and age', 'Omen route and remaining window', 'Pruning return and retained growth memory'] },
    reducedMotion: { fullGameplayEquivalent: true, replacementStrategy: 'static-pose', timingInformationPreserved: true },
    lowQuality: { fullGameplayEquivalent: true, preservesHitTargets: true, preservesStateLabels: true },
  },
}

export const VERDANCE_V2_PACK = adaptLegacyUniversePack(VERDANCE, VERDANCE_V2_SUPPLEMENT)
