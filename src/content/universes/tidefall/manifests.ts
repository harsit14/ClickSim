import {
  TIDEFALL_CURIOSITIES,
  TIDEFALL_CURIOSITY_SHELVES,
} from '../../curiosities'
import type {
  ArchiveDef,
  ArchiveRecordDef,
  ArchiveShelfDef,
  AtLeastFour,
  BeaconDef,
  EighteenTuple,
  FourTuple,
  MotionGrammar,
  MotionKind,
  ObjectSalience,
  OmenDef,
  ScreenZone,
  ThreeTuple,
  TwelveTuple,
  VisualState,
  WorldObjectManifest,
} from '../types'

type FiveForms = readonly [string, string, string, string, string]

interface KindlingManifestSpec {
  readonly sourceId: string
  readonly objectId: string
  readonly name: string
  readonly phenomenon: string
  readonly purpose: string
  readonly zone: ScreenZone
  readonly salience: ObjectSalience
  readonly material: readonly string[]
  readonly motionKind: MotionKind
  readonly motionDescription: string
  readonly forms: FiveForms
  readonly reducedSilhouette: string
  readonly lowQualitySilhouette: string
  readonly minimumHeartDistance: number
}

const KINDLING_SPECS: EighteenTuple<KindlingManifestSpec> = [
  {
    sourceId: 'tidefall-droplet', objectId: 'tide-kindling-droplet', name: 'Droplet',
    phenomenon: 'A buoyant bead of Glow held by surface tension in weightless water.',
    purpose: 'Shows the first passive production as discrete luminous water.',
    zone: 'near', salience: 'supporting', material: ['luminous water', 'nacre glint'],
    motionKind: 'tidal', motionDescription: 'Bobs vertically with the ninety-second tide without orbiting the Heart.',
    forms: ['one suspended bead', 'a rosary of ten droplets', 'a capillary braid feeding nearby ripples', 'a curtain of rain flowing upward', 'the named First Reservoir'],
    reducedSilhouette: 'one bead above five fixed ascending contour marks',
    lowQualitySilhouette: 'one teardrop with a grouped-count notch', minimumHeartDistance: 1.1,
  },
  {
    sourceId: 'tidefall-ripple', objectId: 'tide-kindling-ripple', name: 'Ripple',
    phenomenon: 'A pressure circle traveling through cosmic seawater without a surface.',
    purpose: 'Makes early rate growth visible as widening pressure transmission.',
    zone: 'near', salience: 'supporting', material: ['pressure membrane', 'bioluminescent edge'],
    motionKind: 'tidal', motionDescription: 'Expands and fades in phase with the current, never as an arbitrary pulse.',
    forms: ['one pressure ring', 'ten interlocking rings', 'a ripple lattice touching Tidepools', 'a basin-wide interference field', 'the Great Circular Current'],
    reducedSilhouette: 'three fixed concentric rings with a phase tick',
    lowQualitySilhouette: 'two concentric arcs', minimumHeartDistance: 1.2,
  },
  {
    sourceId: 'tidefall-tidepool', objectId: 'tide-kindling-tidepool', name: 'Tidepool',
    phenomenon: 'A shallow self-contained sea preserving the shape of an absent moon.',
    purpose: 'Anchors early civilization and the memory theme beside the Heart.',
    zone: 'near', salience: 'supporting', material: ['salt glass', 'shallow luminous water', 'shell'],
    motionKind: 'tidal', motionDescription: 'Waterline rises and falls while a crescent basin remains fixed.',
    forms: ['one crescent basin', 'a chain of linked pools', 'pools exchanging capillary currents', 'a shoreless lagoon network', 'the Memory Littoral'],
    reducedSilhouette: 'crescent basin with four labeled waterline ticks',
    lowQualitySilhouette: 'one basin and waterline', minimumHeartDistance: 1.25,
  },
  {
    sourceId: 'tidefall-current', objectId: 'tide-kindling-current', name: 'Current',
    phenomenon: 'Glow choosing a continuous direction through the world-water.',
    purpose: 'Connects small surface Kindlings into a readable production route.',
    zone: 'near', salience: 'supporting', material: ['stream ribbon', 'suspended silt'],
    motionKind: 'tidal', motionDescription: 'A ribbon advances along a fixed authored channel and reverses only during Undertow.',
    forms: ['one directed ribbon', 'a braided current', 'a current carrying luminous silt between pools', 'a mapped circulation gyre', 'the First World Current'],
    reducedSilhouette: 'fixed ribbon with repeated direction chevrons',
    lowQualitySilhouette: 'single tapered ribbon', minimumHeartDistance: 1.35,
  },
  {
    sourceId: 'tidefall-reef-light', objectId: 'tide-kindling-reef-light', name: 'Reef Light',
    phenomenon: 'A branching reef city built from small bioluminescent organisms.',
    purpose: 'Makes the first organized Tidefall civilization visible.',
    zone: 'near', salience: 'supporting', material: ['coral lattice', 'bioluminescent tissue', 'shell'],
    motionKind: 'tidal', motionDescription: 'Polyps open toward the rising current and close into readable branches at low tide.',
    forms: ['one coral lantern', 'a branching reef cluster', 'a reef exchanging light with Tidepools', 'a city-scale reef shelf', 'the Lantern Commonwealth'],
    reducedSilhouette: 'branching reef with open and closed polyp markers',
    lowQualitySilhouette: 'three-pronged reef lantern', minimumHeartDistance: 1.4,
  },
  {
    sourceId: 'tidefall-moonwake', objectId: 'tide-kindling-moonwake', name: 'Moonwake',
    phenomenon: 'A silver path left by a moon that is absent from every sky.',
    purpose: 'Shows that Tidefall follows remembered gravity rather than a visible body.',
    zone: 'near', salience: 'interactive', material: ['silver pressure film', 'moonless water'],
    motionKind: 'tidal', motionDescription: 'A wake traverses one predictable path at each tide phase.',
    forms: ['one silver wake', 'ten parallel wake lines', 'a wake bending nearby currents', 'a horizon-length moon road', 'the Absent Moon Causeway'],
    reducedSilhouette: 'silver path with four phase stations',
    lowQualitySilhouette: 'one crescent-ended path', minimumHeartDistance: 1.5,
  },
  {
    sourceId: 'tidefall-kelp-cathedral', objectId: 'tide-kindling-kelp-cathedral', name: 'Kelp Cathedral',
    phenomenon: 'A forest of tensioned kelp fibers forming inhabited vaulted chambers.',
    purpose: 'Frames reef civilization without blocking the Tideheart.',
    zone: 'far', salience: 'supporting', material: ['kelp fiber', 'pressure bell membrane', 'shell stone'],
    motionKind: 'tidal', motionDescription: 'Long fronds bow together under the current; bell roots pulse only at crest.',
    forms: ['one vaulted frond', 'a kelp chapel grove', 'root bells resonating with Reef Lights', 'a pelagic cathedral district', 'the Rootbell Basilica'],
    reducedSilhouette: 'vaulted kelp ribs with a crest bell marker',
    lowQualitySilhouette: 'three kelp arches', minimumHeartDistance: 1.6,
  },
  {
    sourceId: 'tidefall-pearl-seed', objectId: 'tide-kindling-pearl-seed', name: 'Pearl Seed',
    phenomenon: 'A living irritation wrapped in nacre until it can seed a world.',
    purpose: 'Makes stored potential and patient growth legible in the pelagic field.',
    zone: 'far', salience: 'supporting', material: ['nacre', 'living membrane', 'salt crystal'],
    motionKind: 'tidal', motionDescription: 'Nacre layers close during falling tide and reveal their core while rising.',
    forms: ['one layered pearl', 'a nursery string of pearls', 'pearls feeding luminous tissue', 'a moon-pearl spawning bed', 'the Nacre Seedbank'],
    reducedSilhouette: 'concentric pearl layers with an exposed-core notch',
    lowQualitySilhouette: 'ringed pearl', minimumHeartDistance: 1.65,
  },
  {
    sourceId: 'tidefall-bioluminance', objectId: 'tide-kindling-bioluminance', name: 'Bioluminance',
    phenomenon: 'Living light passed between organisms across otherwise black water.',
    purpose: 'Shows production as an ecosystem signal rather than generic particles.',
    zone: 'far', salience: 'supporting', material: ['bioluminescent tissue', 'translucent membrane'],
    motionKind: 'tidal', motionDescription: 'Light organs answer one another in a slow call-and-response tied to tide state.',
    forms: ['one living lantern', 'a pulsing colony', 'a signal web crossing nearby shoals', 'a pelagic aurora layer', 'the Living Lantern Sea'],
    reducedSilhouette: 'alternating lantern shapes labeled call and response',
    lowQualitySilhouette: 'paired luminous ovals', minimumHeartDistance: 1.7,
  },
  {
    sourceId: 'tidefall-drowned-beacon', objectId: 'tide-kindling-drowned-beacon', name: 'Drowned Beacon',
    phenomenon: 'A pressure-sealed lighthouse calling from beneath cosmic water.',
    purpose: 'Provides a visible navigational source for later shoals and currents.',
    zone: 'far', salience: 'interactive', material: ['salted brass', 'pressure glass', 'focused Glow'],
    motionKind: 'tidal', motionDescription: 'Its beam refracts through water in a measured sweep that slows at low tide.',
    forms: ['one submerged tower', 'a line of beacon pylons', 'crossing beams mapping safe water', 'a drowned lighthouse city', 'the Keeper Meridian'],
    reducedSilhouette: 'tower with three fixed beam sectors',
    lowQualitySilhouette: 'tower and wedge beam', minimumHeartDistance: 1.75,
  },
  {
    sourceId: 'tidefall-twin-tides', objectId: 'tide-kindling-twin-tides', name: 'Twin Tides',
    phenomenon: 'Two opposed water masses exchanging height without a moon.',
    purpose: 'Shows paired production and the tension between memory and control.',
    zone: 'far', salience: 'supporting', material: ['paired pressure volumes', 'salt foam'],
    motionKind: 'tidal', motionDescription: 'One crescent rises exactly as its counterpart falls, preserving their shared midpoint.',
    forms: ['one opposed crescent pair', 'ten linked tide pairs', 'paired tides driving local currents', 'a double-ocean circulation', 'the Countersea Engine'],
    reducedSilhouette: 'opposed crescents with rise and fall arrows',
    lowQualitySilhouette: 'yin-yang tide crescents', minimumHeartDistance: 1.8,
  },
  {
    sourceId: 'tidefall-shoal-constellation', objectId: 'tide-kindling-shoal-constellation', name: 'Shoal Constellation',
    phenomenon: 'Bioluminescent creatures schooling into navigational star patterns.',
    purpose: 'Turns producer density into an authored social formation.',
    zone: 'far', salience: 'supporting', material: ['living lights', 'translucent fins', 'current traces'],
    motionKind: 'tidal', motionDescription: 'The shoal changes formation at tide boundaries while each creature keeps its route.',
    forms: ['one four-light shoal', 'a named school pattern', 'a shoal steering around beacons', 'a migration spanning the far field', 'the Pelagic Star Census'],
    reducedSilhouette: 'four formation diagrams joined by phase ticks',
    lowQualitySilhouette: 'diamond shoal cluster', minimumHeartDistance: 1.85,
  },
  {
    sourceId: 'tidefall-abyssal-garden', objectId: 'tide-kindling-abyssal-garden', name: 'Abyssal Garden',
    phenomenon: 'Pressure-fed flowers opening upward from a trench where light should fail.',
    purpose: 'Reveals that the abyss can generate life and Omens rather than only consume.',
    zone: 'horizon', salience: 'supporting', material: ['vent mineral', 'translucent petals', 'bioluminescent spores'],
    motionKind: 'tidal', motionDescription: 'Petals unfold during low tide and release spores toward the surface at crest.',
    forms: ['one vent flower', 'a trench flowerbed', 'gardens feeding visible spore currents', 'a horizon-scale abyssal bloom', 'the Hadal Conservatory'],
    reducedSilhouette: 'vent flowers with low and high tide petal poses',
    lowQualitySilhouette: 'three-petal vent flower', minimumHeartDistance: 1.9,
  },
  {
    sourceId: 'tidefall-living-sea', objectId: 'tide-kindling-living-sea', name: 'The Living Sea',
    phenomenon: 'An ocean-scale organism whose currents carry distinct names and memories.',
    purpose: 'Merges repeated life into one readable ecosystem landmark.',
    zone: 'horizon', salience: 'milestone', material: ['living water', 'reef tissue', 'memory silt'],
    motionKind: 'tidal', motionDescription: 'Ecosystem layers breathe at different tide phases without random drift.',
    forms: ['one coherent ecosystem basin', 'ten named current regions', 'the sea coordinating migrations', 'a world-organism changing the horizon', 'the Living Sea Polity'],
    reducedSilhouette: 'layered ecosystem cross-section with phase labels',
    lowQualitySilhouette: 'three-layer ocean cross-section', minimumHeartDistance: 2,
  },
  {
    sourceId: 'tidefall-ocean-of-moons', objectId: 'tide-kindling-ocean-of-moons', name: 'Ocean of Moons',
    phenomenon: 'A million remembered lunar pulls embodied as silver pressure lenses.',
    purpose: 'Makes late-game multiplicity visible without scattering literal moons.',
    zone: 'horizon', salience: 'supporting', material: ['silver pressure lens', 'salt-glass halo'],
    motionKind: 'tidal', motionDescription: 'Pressure lenses align into one combined pull at each predicted crest.',
    forms: ['one moon-pressure lens', 'a lunar lens cluster', 'lenses steering world currents', 'a silver pull spanning the horizon', 'the Parliament of Absent Moons'],
    reducedSilhouette: 'nested lens arcs with a shared crest marker',
    lowQualitySilhouette: 'three nested silver crescents', minimumHeartDistance: 2.05,
  },
  {
    sourceId: 'tidefall-world-current', objectId: 'tide-kindling-world-current', name: 'World Current',
    phenomenon: 'The route all water takes between local beginnings and the horizon.',
    purpose: 'Connects the complete Tidefall composition into one directional system.',
    zone: 'horizon', salience: 'milestone', material: ['planetary current ribbon', 'suspended archive silt'],
    motionKind: 'tidal', motionDescription: 'A world-spanning flow follows authored channels and visibly includes each active depth.',
    forms: ['one horizon current', 'ten tributary routes', 'a chart joining all depth bands', 'planetary circulation infrastructure', 'the World Current Compact'],
    reducedSilhouette: 'complete route chart with directional hatching',
    lowQualitySilhouette: 'one world-spanning S-curve', minimumHeartDistance: 2.1,
  },
  {
    sourceId: 'tidefall-deep-trench', objectId: 'tide-kindling-deep-trench', name: 'The Deep Trench',
    phenomenon: 'A descending pressure aperture whose floor dreams upward.',
    purpose: 'Provides the unresolved Hadal threat and Deep transition at the horizon.',
    zone: 'horizon', salience: 'milestone', material: ['black water', 'pressure contour', 'vent glow'],
    motionKind: 'tidal', motionDescription: 'Depth contours tighten as tide falls; nothing bounces or orbits within the trench.',
    forms: ['one mapped trench lip', 'a chain of sounding stations', 'pressure contours affecting nearby currents', 'a horizon-deep hadal system', 'the Trench That Answers'],
    reducedSilhouette: 'descending contour stack with a closed pressure door',
    lowQualitySilhouette: 'dark wedge with three depth lines', minimumHeartDistance: 2.2,
  },
  {
    sourceId: 'tidefall-second-wave', objectId: 'tide-kindling-second-wave', name: 'The Second Wave',
    phenomenon: 'A shoreless wave rising by collective memory rather than wind or moon.',
    purpose: 'Serves as Tidefall’s final Kindling and explicit Beacon prerequisite.',
    zone: 'horizon', salience: 'milestone', material: ['world water', 'nacre foam', 'memory light'],
    motionKind: 'tidal', motionDescription: 'The wave gathers the silhouettes of every earlier depth before holding at the horizon.',
    forms: ['one impossible wave front', 'a procession of rising fronts', 'the wave carrying archive silhouettes', 'a horizon permanently reshaped by water', 'the Second Wave Civilization'],
    reducedSilhouette: 'one high wave containing eighteen labeled depth marks',
    lowQualitySilhouette: 'single shoreless wave crest', minimumHeartDistance: 2.3,
  },
]

function motion(kind: MotionKind, description: string, periodMs = 6_000): MotionGrammar {
  return { kind, description, periodMs, preservesTimingInformation: true }
}

function ownershipState(
  spec: KindlingManifestSpec,
  threshold: 1 | 10 | 25 | 50 | 100,
  silhouette: string,
): VisualState {
  return {
    label: `${spec.name} ownership ${threshold}: ${silhouette}`,
    silhouette,
    material: spec.material,
    motion: motion(spec.motionKind, spec.motionDescription),
    countPresentation: threshold === 1 ? 'single' : threshold === 100 ? 'infrastructure' : 'group',
  }
}

function kindlingObject(spec: KindlingManifestSpec): WorldObjectManifest {
  return {
    id: spec.objectId,
    sourceKind: 'generator',
    sourceId: spec.sourceId,
    phenomenon: spec.phenomenon,
    purpose: spec.purpose,
    screenZone: spec.zone,
    salience: spec.salience,
    material: spec.material,
    silhouette: spec.forms[0],
    motion: motion(spec.motionKind, spec.motionDescription),
    ownershipStates: {
      1: ownershipState(spec, 1, spec.forms[0]),
      10: ownershipState(spec, 10, spec.forms[1]),
      25: ownershipState(spec, 25, spec.forms[2]),
      50: ownershipState(spec, 50, spec.forms[3]),
      100: ownershipState(spec, 100, spec.forms[4]),
    },
    reducedMotionState: {
      label: `${spec.name} reduced-motion tide state`,
      silhouette: spec.reducedSilhouette,
      material: spec.material,
      motion: motion('still', `Static ${spec.name} phase poses preserve the same tide information.`),
      countPresentation: 'group',
    },
    lowQualityState: {
      label: `${spec.name} low-quality state`,
      silhouette: spec.lowQualitySilhouette,
      material: [spec.material[0]],
      motion: motion(spec.motionKind, `One simplified ${spec.name} cycle follows the authored tide.`, 9_000),
      countPresentation: 'infrastructure',
    },
    overlapGroup: 'tide-kindlings',
    canOverlapWith: ['tide-currents'],
    minimumHeartDistance: spec.minimumHeartDistance,
    priorityWhilePanelOpen: spec.salience === 'milestone' ? 'hold' : 'dim',
    audioCue: 'tide-purchase-rise',
  }
}

export const TIDEFALL_KINDLING_OBJECTS = KINDLING_SPECS.map(kindlingObject) as unknown as EighteenTuple<WorldObjectManifest>

interface ArchiveObjectSpec {
  readonly sourceId: string
  readonly objectId: string
  readonly material: readonly string[]
  readonly silhouette: string
  readonly motionKind: MotionKind
  readonly motionDescription: string
  readonly zone: ScreenZone
}

const ARCHIVE_OBJECT_SPECS: TwelveTuple<ArchiveObjectSpec> = [
  { sourceId: 'moth', objectId: 'tide-archive-phantom-moon', material: ['reflected moonlight', 'black water'], silhouette: 'broken crescent reflected below an absent disk', motionKind: 'tidal', motionDescription: 'The reflection waxes opposite the real tide.', zone: 'far' },
  { sourceId: 'chimes', objectId: 'tide-archive-pressure-bell', material: ['water membrane', 'pressure ring'], silhouette: 'seven nested horizontal bell rings', motionKind: 'waveform', motionDescription: 'Rings contract in a seven-step sounding sequence.', zone: 'near' },
  { sourceId: 'hearthkeeper', objectId: 'tide-archive-pearl-nursery', material: ['nacre', 'living membrane'], silhouette: 'clustered pearls around one shared luminous irritant', motionKind: 'tidal', motionDescription: 'Nursery membranes open toward the current while fueled.', zone: 'near' },
  { sourceId: 'glass-garden', objectId: 'tide-archive-kelp-nebula', material: ['glass kelp', 'bioluminescent spores'], silhouette: 'inverted kelp canopy rooted above a star-like bloom', motionKind: 'tidal', motionDescription: 'Fronds bow downward while spores drift upward.', zone: 'far' },
  { sourceId: 'second-cursor', objectId: 'tide-archive-quasar-sounding', material: ['focused Glow', 'depth line'], silhouette: 'narrow beam ending in a weighted sounding hook', motionKind: 'waveform', motionDescription: 'One measured pulse descends and returns before the next beat.', zone: 'far' },
  { sourceId: 'snail', objectId: 'tide-archive-century-leviathan', material: ['pelagic hide', 'salt constellation', 'wake foam'], silhouette: 'vast whale-like shadow with a continent-length wake', motionKind: 'authored', motionDescription: 'The Leviathan crosses in three forecast surfacings, never a generic falling path.', zone: 'horizon' },
  { sourceId: 'aurora', objectId: 'tide-archive-blooming-trench', material: ['vent mineral', 'bioluminescent plume'], silhouette: 'dark trench split by an upward flowering plume', motionKind: 'tidal', motionDescription: 'The bloom climbs against pressure in one slow vertical column.', zone: 'horizon' },
  { sourceId: 'door', objectId: 'tide-archive-black-mouth', material: ['pressure void', 'inward current'], silhouette: 'black aperture surrounded by inward contour teeth', motionKind: 'tidal', motionDescription: 'Contours move inward without implying an arbitrary spinning hole.', zone: 'horizon' },
  { sourceId: 'star-jar', objectId: 'tide-archive-moon-pearl', material: ['layered nacre', 'compressed tide'], silhouette: 'pearl cross-section containing a crescent pressure lens', motionKind: 'optical', motionDescription: 'Nacre layers reveal stored tide marks in sequence.', zone: 'near' },
  { sourceId: 'metronome-heart', objectId: 'tide-archive-tideclock', material: ['salt glass', 'water escapement'], silhouette: 'four-lobed tide dial with an advancing waterline hand', motionKind: 'mechanical', motionDescription: 'The waterline hand predicts crest without relying on color.', zone: 'near' },
  { sourceId: 'letter', objectId: 'tide-archive-red-tide-beacon', material: ['warning bloom tissue', 'keeper lens'], silhouette: 'red flower beacon enclosing a folded record strip', motionKind: 'tidal', motionDescription: 'Petal flashes spell the keeper record in a repeatable pattern.', zone: 'far' },
  { sourceId: 'orrery', objectId: 'tide-archive-world-current-eye', material: ['oceanic lens', 'world current'], silhouette: 'elliptical eye crossed by four universe-current paths', motionKind: 'optical', motionDescription: 'The pupil lenses explicit currents between archived worlds.', zone: 'horizon' },
]

function simpleState(
  label: string,
  silhouette: string,
  material: readonly string[],
  motionGrammar: MotionGrammar,
  quality: 'reduced' | 'low',
): VisualState {
  return {
    label,
    silhouette,
    material: quality === 'low' ? [material[0]] : material,
    motion: quality === 'reduced'
      ? motion('still', `${label} uses fixed phase shapes and text.`)
      : motionGrammar,
    countPresentation: 'single',
  }
}

function archiveObject(spec: ArchiveObjectSpec): WorldObjectManifest {
  const item = TIDEFALL_CURIOSITIES.find((candidate) => candidate.id === spec.sourceId)
  if (!item) throw new Error(`Missing legacy Tidefall Archive item ${spec.sourceId}.`)
  const authoredMotion = motion(spec.motionKind, spec.motionDescription, 8_000)
  return {
    id: spec.objectId,
    sourceKind: 'archive',
    sourceId: spec.sourceId,
    phenomenon: item.flavor,
    purpose: item.desc,
    screenZone: spec.zone,
    salience: 'interactive',
    material: spec.material,
    silhouette: spec.silhouette,
    motion: authoredMotion,
    reducedMotionState: simpleState(`${item.name} reduced-motion record`, `${spec.silhouette} with fixed phase markers`, spec.material, authoredMotion, 'reduced'),
    lowQualityState: simpleState(`${item.name} simplified record`, spec.silhouette, spec.material, authoredMotion, 'low'),
    overlapGroup: 'tide-archive',
    canOverlapWith: [],
    minimumHeartDistance: 1.5,
    priorityWhilePanelOpen: 'hold',
    audioCue: 'tide-archive-sounding',
    loreRecord: spec.sourceId,
  }
}

export const TIDEFALL_ARCHIVE_OBJECTS = ARCHIVE_OBJECT_SPECS.map(archiveObject) as unknown as TwelveTuple<WorldObjectManifest>

export const TIDEFALL_ARCHIVE_RECORDS = TIDEFALL_ARCHIVE_OBJECTS.map((object, index) => {
  const item = TIDEFALL_CURIOSITIES[index]
  return {
    id: item.id,
    name: item.name,
    observation: item.flavor,
    implication: item.record,
    effectDescription: item.desc,
    object,
  }
}) as unknown as TwelveTuple<ArchiveRecordDef>

function shelf(id: string): ArchiveShelfDef {
  const legacy = TIDEFALL_CURIOSITY_SHELVES.find((candidate) => candidate.id === id)
  if (!legacy) throw new Error(`Missing legacy Tidefall Archive shelf ${id}.`)
  return {
    id: legacy.id,
    name: legacy.name,
    recordIds: [...legacy.ids] as unknown as FourTuple<string>,
    rewardDescription: `${legacy.rewardName}: ${legacy.reward}`,
  }
}

export const TIDEFALL_ARCHIVE_SHELVES: ThreeTuple<ArchiveShelfDef> = [
  shelf('hearthside'),
  shelf('pilgrims'),
  shelf('portents'),
]

export const TIDEFALL_ARCHIVE: ArchiveDef = {
  id: 'pelagic-archive',
  canonicalName: 'Field Archive',
  localName: 'The Pelagic Archive',
  records: TIDEFALL_ARCHIVE_RECORDS,
  shelves: TIDEFALL_ARCHIVE_SHELVES,
}

interface OmenSpec {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly silhouette: string
  readonly movement: string
  readonly material: readonly string[]
  readonly cue: string
  readonly effects: OmenDef['rewards'][number]['effects']
  readonly accessibilityLabel: string
}

const OMEN_SPECS: AtLeastFour<OmenSpec> = [
  {
    id: 'spring-tide', name: 'Spring Tide',
    description: 'A broad pressure bubble rises in three readable bands and empowers the whole sea.',
    silhouette: 'three nested crest bubbles joined by an upward current',
    movement: 'Rises vertically, widens at the predicted crest, and never follows a meteor path.',
    material: ['luminous water', 'crest foam'], cue: 'tide-omen-spring-call',
    effects: [{ kind: 'globalMult', value: 9 }, { kind: 'clickMult', value: 3 }],
    accessibilityLabel: 'Spring Tide Omen: three rising arcs, production and touch opportunity.',
  },
  {
    id: 'undertow', name: 'Undertow',
    description: 'An inward pressure aperture briefly makes deliberate touches carry the lower current.',
    silhouette: 'inverted bubble with inward-pointing contour teeth',
    movement: 'Contracts toward its center along a forecast inward current.',
    material: ['dark water', 'pressure contour'], cue: 'tide-omen-undertow-call',
    effects: [{ kind: 'globalMult', value: 2 }, { kind: 'clickMult', value: 333 }],
    accessibilityLabel: 'Undertow Omen: inward arrows and a short high-touch window.',
  },
  {
    id: 'moon-pearl', name: 'Moon Pearl',
    description: 'A layered pearl opens to release stored Glow and a long gentle current.',
    silhouette: 'ringed pearl enclosing a crescent pressure lens',
    movement: 'Drifts on a shallow S-current while nacre layers open in order.',
    material: ['nacre', 'compressed tide'], cue: 'tide-omen-pearl-call',
    effects: [{ kind: 'globalMult', value: 2 }],
    accessibilityLabel: 'Moon Pearl Omen: layered pearl, stored production opportunity.',
  },
  {
    id: 'abyssal-bloom', name: 'Abyssal Bloom',
    description: 'A trench flower erupts upward in a short symmetric production and touch event.',
    silhouette: 'six-petal hadal flower around a vent line',
    movement: 'Opens radially from a fixed vent, then sends one plume upward.',
    material: ['vent mineral', 'bioluminescent petal'], cue: 'tide-omen-bloom-call',
    effects: [{ kind: 'globalMult', value: 25 }, { kind: 'clickMult', value: 25 }],
    accessibilityLabel: 'Abyssal Bloom Omen: six petals and a twelve-second symmetric burst.',
  },
  {
    id: 'leviathan-passage', name: 'Century Leviathan',
    description: 'A rare migratory shadow surfaces three times and reveals an Archive variant when followed.',
    silhouette: 'continent-scale whale shadow with salt constellations and three wake notches',
    movement: 'Crosses the horizon in three forecast surfacings along one pelagic migration.',
    material: ['pelagic hide', 'salt constellation', 'wake foam'], cue: 'tide-omen-leviathan-call',
    effects: [],
    accessibilityLabel: 'Century Leviathan Omen: three numbered surfacings across the horizon.',
  },
]

function omenObject(spec: OmenSpec): WorldObjectManifest {
  const omenMotion = motion('authored', spec.movement, 12_000)
  return {
    id: `tide-omen-object-${spec.id}`,
    sourceKind: 'omen',
    sourceId: spec.id,
    phenomenon: spec.description,
    purpose: `Presents the ${spec.name} reward window with a Tidefall-specific path and shape.`,
    screenZone: spec.id === 'leviathan-passage' ? 'horizon' : 'near',
    salience: spec.id === 'leviathan-passage' ? 'milestone' : 'interactive',
    material: spec.material,
    silhouette: spec.silhouette,
    motion: omenMotion,
    reducedMotionState: simpleState(`${spec.name} reduced-motion target`, `${spec.silhouette} with numbered phase markers`, spec.material, omenMotion, 'reduced'),
    lowQualityState: simpleState(`${spec.name} simplified target`, spec.silhouette, spec.material, omenMotion, 'low'),
    overlapGroup: 'tide-omens',
    canOverlapWith: [],
    minimumHeartDistance: 1.4,
    priorityWhilePanelOpen: 'emphasize',
    audioCue: spec.cue,
  }
}

export const TIDEFALL_OMEN_OBJECTS = OMEN_SPECS.map(omenObject) as unknown as AtLeastFour<WorldObjectManifest>

export const TIDEFALL_OMENS = OMEN_SPECS.map((spec, index) => ({
  id: spec.id,
  name: spec.name,
  description: spec.description,
  spawn: {
    mode: 'random' as const,
    baseChance: spec.id === 'leviathan-passage' ? 0.002 : 0.02,
    pityThreshold: spec.id === 'leviathan-passage' ? 120 : 30,
    oddsVisibleAfterDiscovery: true,
  },
  rewards: [{
    id: `${spec.id}-reward`,
    description: spec.id === 'leviathan-passage'
      ? 'Follow all three surfacings to reveal the Century Leviathan Archive variant.'
      : `Receive the existing ${spec.name} bounded acceleration profile.`,
    exclusivePermanentPower: false as const,
    effects: spec.effects,
  }],
  object: TIDEFALL_OMEN_OBJECTS[index],
  accessibilityLabel: spec.accessibilityLabel,
})) as unknown as AtLeastFour<OmenDef>

export const TIDEFALL_BEACON_OBJECT: WorldObjectManifest = {
  id: 'tide-beacon-world-current-column',
  sourceKind: 'beacon',
  sourceId: 'tidefall-beacon',
  phenomenon: 'A stable auroral current rising through the former eye of the moonless sea.',
  purpose: 'Shows that Tidefall can sustain its world-current and contribute between universes.',
  screenZone: 'horizon',
  salience: 'milestone',
  material: ['auroral water', 'salt-glass lighthouse', 'world-current ribbon'],
  silhouette: 'lighthouse column crossed by a shoreless wave and three depth bands',
  motion: motion('tidal', 'The Beacon holds position while three depth bands circulate through it.', 15_000),
  reducedMotionState: simpleState('Tidefall Beacon reduced-motion state', 'lighthouse column with three fixed depth bands', ['auroral water', 'salt-glass lighthouse'], motion('still', 'Fixed bands preserve each depth contribution.'), 'reduced'),
  lowQualityState: simpleState('Tidefall Beacon low-quality state', 'single lighthouse column and wave crest', ['auroral water'], motion('tidal', 'One slow brightness cycle follows the tide.', 18_000), 'low'),
  overlapGroup: 'tide-beacon',
  canOverlapWith: ['tide-currents'],
  minimumHeartDistance: 2.4,
  priorityWhilePanelOpen: 'hold',
  audioCue: 'tide-beacon-answer',
}

export const TIDEFALL_BEACON: BeaconDef = {
  id: 'tidefall-beacon',
  canonicalName: 'Beacon',
  localName: 'The Shoreless Lighthouse',
  requirement: {
    sourceKind: 'generator',
    sourceId: 'tidefall-second-wave',
    target: 1,
    description: 'Kindle The Second Wave once; the final Kindling is not consumed.',
  },
  darkBetweenReward: 2,
  object: TIDEFALL_BEACON_OBJECT,
  mapSilhouette: 'auroral lighthouse column rising through a shoreless wave',
}
