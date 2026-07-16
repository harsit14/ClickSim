import { CHALLENGES } from '../challenges'
import { localizeChallengeText } from '../challenge-language'
import {
  EMBERLIGHT_AUDIO_DEF,
  EMBERLIGHT_AUDIO_EVENT_MAP,
} from '../../audio/emberlight/identity'
import { EMBERLIGHT } from './emberlight'
import { EMBERLIGHT_ASTRAL_CABINET } from './emberlight/archive'
import { EMBERLIGHT_DOCTRINE_VISUALS } from '../../render/emberlight/doctrines'
import { adaptLegacyUniversePack, type UniversePackV2Supplement } from './legacy-v2-adapter'
import type {
  ArchiveRecordDef,
  AtLeastFour,
  DensityMergeRule,
  EighteenTuple,
  FourTuple,
  MotionGrammar,
  OmenDef,
  ScreenZone,
  ThreeTuple,
  TrialDef,
  TwelveTuple,
  VisualState,
  WorldObjectManifest,
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

const still = (description: string) => motion('still', description)

function state(
  label: string,
  silhouette: string,
  material: readonly string[],
  objectMotion: MotionGrammar,
  countPresentation: VisualState['countPresentation'],
): VisualState {
  return { label, silhouette, material, motion: objectMotion, countPresentation }
}

interface KindlingVisualSpec {
  readonly sourceId: string
  readonly phenomenon: string
  readonly purpose: string
  readonly screenZone: ScreenZone
  readonly salience: WorldObjectManifest['salience']
  readonly material: readonly string[]
  readonly silhouette: string
  readonly objectMotion: MotionGrammar
  readonly ownershipSilhouettes: readonly [string, string, string, string, string]
}

const KINDLING_SPECS: EighteenTuple<KindlingVisualSpec> = [
  {
    sourceId: 'spark', phenomenon: 'A fleck of plasma repeatedly dividing',
    purpose: 'Shows the first passive Light source and its growing reliability',
    screenZone: 'near', salience: 'supporting', material: ['incandescent plasma', 'carbon ash'],
    silhouette: 'a four-point ember with a ragged corona', objectMotion: motion('orbital', 'Short arcs circle the nursery floor', 3_600),
    ownershipSilhouettes: ['one four-point ember', 'a ten-spark braid', 'a twenty-five-spark lantern cluster', 'a fifty-spark river', 'a hundred-spark ignition causeway'],
  },
  {
    sourceId: 'wisp', phenomenon: 'Ionized filaments learning to dance',
    purpose: 'Makes tier-two production and Spark resonance visible',
    screenZone: 'near', salience: 'supporting', material: ['ionized filament', 'blue plasma tail'],
    silhouette: 'a hooked ribbon with a bright leading knot', objectMotion: motion('orbital', 'Filaments weave around one another without bouncing', 4_200),
    ownershipSilhouettes: ['one hooked filament', 'a ten-wisp helix', 'a twenty-five-wisp veil', 'a fifty-wisp magnetic braid', 'a hundred-wisp auroral river'],
  },
  {
    sourceId: 'hearth', phenomenon: 'A stable pocket where warmth can remain',
    purpose: 'Marks the first durable settlement of Light',
    screenZone: 'near', salience: 'interactive', material: ['banked coals', 'plasma shell'],
    silhouette: 'a low bowl surrounding a steady star', objectMotion: motion('authored', 'The bowl banks and releases heat on a slow breath', 5_000),
    ownershipSilhouettes: ['one ember bowl', 'a ring of ten hearths', 'a twenty-five-hearth quarter', 'a fifty-hearth warm city', 'a hundred-hearth stellar commons'],
  },
  {
    sourceId: 'kiln', phenomenon: 'Light concentrated into a making chamber',
    purpose: 'Shows production becoming deliberate craft',
    screenZone: 'near', salience: 'supporting', material: ['ceramic star-shell', 'forge plasma'],
    silhouette: 'a vented furnace arch with a white core', objectMotion: motion('authored', 'Heat vents in alternating measured pulses', 4_800),
    ownershipSilhouettes: ['one vented kiln', 'a ten-kiln work ring', 'a twenty-five-kiln foundry row', 'a fifty-kiln luminous district', 'a hundred-kiln making engine'],
  },
  {
    sourceId: 'forge', phenomenon: 'A stellar anvil teaching Light to work',
    purpose: 'Signals mature passive infrastructure and Forge doctrine affinity',
    screenZone: 'near', salience: 'interactive', material: ['iron-dark anvil', 'gold plasma spray'],
    silhouette: 'a broad anvil beneath a bipolar flame', objectMotion: motion('authored', 'Each strike sends a paired plasma fan away from the Heart', 3_200),
    ownershipSilhouettes: ['one stellar anvil', 'a ten-forge crescent', 'a twenty-five-forge industrial arc', 'a fifty-forge star foundry', 'a hundred-forge cosmic manufactory'],
  },
  {
    sourceId: 'beacon', phenomenon: 'A tower of Light calling into an unanswered sky',
    purpose: 'Foreshadows inter-world contact without representing the final Beacon system',
    screenZone: 'near', salience: 'interactive', material: ['spectral glass', 'focused plasma'],
    silhouette: 'a narrow tower with a sweeping lens', objectMotion: motion('optical', 'A focused beam searches the ecliptic', 6_000),
    ownershipSilhouettes: ['one searching tower', 'a ten-beacon watch ring', 'a twenty-five-beacon signal lattice', 'a fifty-beacon horizon array', 'a hundred-beacon listening civilization'],
  },
  {
    sourceId: 'titan', phenomenon: 'A furnace Heart large enough to walk',
    purpose: 'Introduces civilizational-scale production',
    screenZone: 'heart', salience: 'supporting', material: ['basalt armor', 'contained stellar core'],
    silhouette: 'a hill-sized torso around a vertical furnace', objectMotion: motion('authored', 'Armor plates settle as its core completes each burn', 6_400),
    ownershipSilhouettes: ['one furnace titan', 'a ten-titan procession', 'a twenty-five-titan labor host', 'a fifty-titan moving range', 'a hundred-titan stellar foundation'],
  },
  {
    sourceId: 'starseed', phenomenon: 'A compact seed holding the plan of a star',
    purpose: 'Shows delayed celestial growth entering the economy',
    screenZone: 'heart', salience: 'supporting', material: ['dust shell', 'hydrogen glow'],
    silhouette: 'an ovoid seed split by one bright seam', objectMotion: motion('growth', 'The seam opens and closes as mass accretes', 5_600),
    ownershipSilhouettes: ['one luminous seed', 'a ten-seed nursery', 'a twenty-five-seed germination field', 'a fifty-seed stellar orchard', 'a hundred-seed nursery infrastructure'],
  },
  {
    sourceId: 'protostar', phenomenon: 'A star before ignition, drawing matter inward',
    purpose: 'Makes accretion and imminent stellar production legible',
    screenZone: 'far', salience: 'interactive', material: ['accretion dust', 'infrared plasma'],
    silhouette: 'a bright core bisected by a thick dust disk', objectMotion: motion('orbital', 'Dust spirals inward while polar jets remain clear', 7_200),
    ownershipSilhouettes: ['one accreting protostar', 'a ten-protostar ecliptic', 'a twenty-five-protostar nursery cloud', 'a fifty-protostar ignition front', 'a hundred-protostar stellar generation'],
  },
  {
    sourceId: 'sun', phenomenon: 'A stable star illuminating the restored hierarchy',
    purpose: 'Marks the first mature stellar tier and its resonances',
    screenZone: 'far', salience: 'interactive', material: ['gold plasma', 'granulated photosphere'],
    silhouette: 'a round star with a broken flare crown', objectMotion: motion('orbital', 'Stars establish a readable ecliptic around the Heart', 8_000),
    ownershipSilhouettes: ['one crowned sun', 'a ten-sun ecliptic', 'a twenty-five-sun lensing arc', 'a fifty-sun illuminated nebula', 'a hundred-sun named stellar civilization'],
  },
  {
    sourceId: 'binary', phenomenon: 'Two stars keeping one shared orbit',
    purpose: 'Shows pair resonance and mature orbital structure',
    screenZone: 'far', salience: 'supporting', material: ['paired photospheres', 'shared plasma bridge'],
    silhouette: 'two unequal stars joined by a teardrop bridge', objectMotion: motion('orbital', 'The pair turns around a visible common center', 6_800),
    ownershipSilhouettes: ['one binary pair', 'ten paired orbits', 'a twenty-five-pair rosette', 'a fifty-pair orbital choir', 'a hundred-pair stellar clockwork'],
  },
  {
    sourceId: 'constellation', phenomenon: 'Stars connected into a remembered figure',
    purpose: 'Makes ownership organization and route drawing visible',
    screenZone: 'far', salience: 'interactive', material: ['stellar points', 'spectral guide lines'],
    silhouette: 'an asymmetric many-star figure with open edges', objectMotion: motion('optical', 'Lines resolve only after their stars settle', 8_400),
    ownershipSilhouettes: ['one sparse figure', 'ten linked figures', 'a twenty-five-figure atlas', 'a fifty-figure navigable sky', 'a hundred-figure living star map'],
  },
  {
    sourceId: 'nebula', phenomenon: 'A cloud where new stars are cultivated',
    purpose: 'Shows high-tier production feeding lower stellar scales',
    screenZone: 'far', salience: 'supporting', material: ['emission gas', 'occluding dust lane'],
    silhouette: 'an irregular cloud cut by one dark pillar', objectMotion: motion('atmospheric', 'Ionized folds expand while dust remains coherent', 9_600),
    ownershipSilhouettes: ['one pillar nebula', 'a ten-cloud garden', 'a twenty-five-cloud nursery belt', 'a fifty-cloud starbirth weather', 'a hundred-cloud galactic nursery'],
  },
  {
    sourceId: 'galaxy', phenomenon: 'A hundred billion lights sharing one gravity well',
    purpose: 'Establishes galaxy-scale production and archive context',
    screenZone: 'horizon', salience: 'interactive', material: ['spiral star field', 'dust occlusion', 'lensing core'],
    silhouette: 'a barred spiral with two uneven arms', objectMotion: motion('orbital', 'Arms rotate slowly behind fixed dust lanes', 14_000),
    ownershipSilhouettes: ['one barred spiral', 'a ten-galaxy group', 'a twenty-five-galaxy sheet', 'a fifty-galaxy lensing field', 'a hundred-galaxy named superstructure'],
  },
  {
    sourceId: 'supercluster', phenomenon: 'Galaxy groups bound across impossible distance',
    purpose: 'Shows cosmic-scale density merging',
    screenZone: 'horizon', salience: 'supporting', material: ['galaxy knots', 'dark-matter lensing'],
    silhouette: 'three dense knots joined by faint arcs', objectMotion: motion('optical', 'Lensing arcs breathe as distant knots align', 16_000),
    ownershipSilhouettes: ['one triple knot', 'a ten-knot chain', 'a twenty-five-knot wall', 'a fifty-knot cosmic basin', 'a hundred-knot supercluster continent'],
  },
  {
    sourceId: 'web', phenomenon: 'Branching filaments connecting the visible universe',
    purpose: 'Makes the large-scale resonance graph readable',
    screenZone: 'horizon', salience: 'milestone', material: ['ionized filament', 'galaxy nodes', 'void shadow'],
    silhouette: 'a branching web with luminous junctions', objectMotion: motion('authored', 'Filaments brighten only along connected routes', 12_000),
    ownershipSilhouettes: ['one branching filament', 'a ten-route web', 'a twenty-five-junction mesh', 'a fifty-route cosmic scaffold', 'a hundred-route universal infrastructure'],
  },
  {
    sourceId: 'loom', phenomenon: 'A machine-like place where reality is woven',
    purpose: 'Foreshadows the Deep and exposes transcendent production',
    screenZone: 'horizon', salience: 'milestone', material: ['violet spacetime thread', 'gravitational frame'],
    silhouette: 'a tall open frame crossed by luminous threads', objectMotion: motion('authored', 'Threads cross, hold, and resolve into stable topology', 10_400),
    ownershipSilhouettes: ['one deep frame', 'a ten-frame weaving hall', 'a twenty-five-frame reality mill', 'a fifty-frame topology engine', 'a hundred-frame law-making infrastructure'],
  },
  {
    sourceId: 'ember2', phenomenon: 'A second self-sustaining ember looking back',
    purpose: 'Completes the Kindling ladder and unlocks the Beacon requirement',
    screenZone: 'horizon', salience: 'milestone', material: ['white-gold plasma', 'mirror-dark corona'],
    silhouette: 'a small star with a second inward-facing corona', objectMotion: motion('authored', 'Its pulse answers the Last Ember instead of copying it', 5_200),
    ownershipSilhouettes: ['one answering ember', 'a ten-ember council', 'a twenty-five-ember mirrored sky', 'a fifty-ember responsive horizon', 'a hundred-ember independent stellar civilization'],
  },
]

function kindlingObject(spec: KindlingVisualSpec): WorldObjectManifest {
  const thresholds = [1, 10, 25, 50, 100] as const
  const presentations = ['single', 'group', 'group', 'infrastructure', 'infrastructure'] as const
  const ownershipStates = Object.fromEntries(thresholds.map((threshold, index) => [
    threshold,
    state(
      `${spec.phenomenon} at ${threshold} owned`,
      spec.ownershipSilhouettes[index],
      spec.material,
      spec.objectMotion,
      presentations[index],
    ),
  ])) as WorldObjectManifest['ownershipStates']
  return {
    id: `ember-kindling-${spec.sourceId}`,
    sourceKind: 'generator',
    sourceId: spec.sourceId,
    phenomenon: spec.phenomenon,
    purpose: spec.purpose,
    screenZone: spec.screenZone,
    salience: spec.salience,
    material: spec.material,
    silhouette: spec.silhouette,
    motion: spec.objectMotion,
    ownershipStates,
    reducedMotionState: state(
      `${spec.phenomenon}; ownership shown without travel`,
      spec.ownershipSilhouettes[4],
      spec.material,
      still('A local brightness step preserves ownership and timing without travel'),
      'infrastructure',
    ),
    lowQualityState: state(
      `${spec.phenomenon}; simplified but named`,
      spec.ownershipSilhouettes[2],
      spec.material.slice(0, 1),
      still('A static authored silhouette preserves identity and state'),
      'group',
    ),
    overlapGroup: `ember-kindling-${spec.screenZone}`,
    canOverlapWith: [],
    minimumHeartDistance: 1.15,
    priorityWhilePanelOpen: spec.salience === 'milestone'
      ? 'emphasize'
      : spec.salience === 'interactive'
        ? 'hold'
        : 'dim',
    audioCue: EMBERLIGHT_AUDIO_EVENT_MAP.purchase,
  }
}

const KINDLING_OBJECTS = KINDLING_SPECS.map(kindlingObject) as unknown as EighteenTuple<WorldObjectManifest>

interface StandaloneObjectSpec {
  readonly id: string
  readonly sourceKind: 'archive' | 'omen' | 'story' | 'beacon'
  readonly sourceId: string
  readonly phenomenon: string
  readonly purpose: string
  readonly screenZone: ScreenZone
  readonly salience: WorldObjectManifest['salience']
  readonly material: readonly string[]
  readonly silhouette: string
  readonly objectMotion: MotionGrammar
  readonly audioCue: string
  readonly loreRecord?: string
}

function standaloneObject(spec: StandaloneObjectSpec): WorldObjectManifest {
  const { objectMotion, ...authored } = spec
  return {
    ...authored,
    motion: objectMotion,
    reducedMotionState: state(
      `${spec.phenomenon}; reduced-motion state`,
      spec.silhouette,
      spec.material,
      still('A local contrast change preserves the event and state without travel'),
      'single',
    ),
    lowQualityState: state(
      `${spec.phenomenon}; low-quality state`,
      spec.silhouette,
      spec.material.slice(0, 1),
      still('The named authored silhouette remains visible without particles'),
      'single',
    ),
    overlapGroup: `ember-${spec.sourceKind}-${spec.screenZone}`,
    canOverlapWith: [],
    minimumHeartDistance: spec.salience === 'milestone' ? 1.4 : 1.15,
    priorityWhilePanelOpen: spec.salience === 'milestone'
      ? 'emphasize'
      : spec.salience === 'interactive'
        ? 'hold'
        : 'dim',
  }
}

const ARCHIVE_OBJECT_SPECS: TwelveTuple<StandaloneObjectSpec> = [
  { id: 'ember-archive-moth', sourceKind: 'archive', sourceId: 'moth', phenomenon: 'A White Dwarf refusing final darkness', purpose: 'Records compressed persistence and lends clicks a gravitational accent', screenZone: 'far', salience: 'supporting', material: ['degenerate white plasma', 'gravity lens'], silhouette: 'a tiny white star inside a broad lensing ring', objectMotion: motion('orbital', 'The remnant traces a close stable orbit', 8_000), audioCue: 'ember-archive', loreRecord: 'moth' },
  { id: 'ember-archive-chimes', sourceKind: 'archive', sourceId: 'chimes', phenomenon: 'A Magnetar ringing the dark', purpose: 'Makes magnetic rhythm distortion and critical resonance visible', screenZone: 'far', salience: 'interactive', material: ['neutron crust', 'magnetic field lines'], silhouette: 'a compact star crossed by four rigid field arcs', objectMotion: motion('waveform', 'Field arcs pulse in a measured glass-like rhythm', 3_333), audioCue: 'ember-archive', loreRecord: 'chimes' },
  { id: 'ember-archive-hearthkeeper', sourceKind: 'archive', sourceId: 'hearthkeeper', phenomenon: 'A fuelable Protostellar Nursery awaiting ignition', purpose: 'Shows the archive incubation bonus and its remaining warmth', screenZone: 'near', salience: 'interactive', material: ['infrared cloud', 'fuel-bright core'], silhouette: 'a soft cloud around several unopened stellar seeds', objectMotion: motion('growth', 'The nursery brightens locally as stored fuel remains', 5_400), audioCue: 'ember-archive', loreRecord: 'hearthkeeper' },
  { id: 'ember-archive-glass-garden', sourceKind: 'archive', sourceId: 'glass-garden', phenomenon: 'An Aurora World forecasting the sky through light', purpose: 'Makes Omen weather readable at the world edge without relying on color', screenZone: 'horizon', salience: 'ambient', material: ['magnetized atmosphere', 'spectral curtain'], silhouette: 'a crescent world beneath three folded auroral curtains', objectMotion: motion('atmospheric', 'Curtains fold locally without crossing the Heart', 12_000), audioCue: 'ember-archive', loreRecord: 'glass-garden' },
  { id: 'ember-archive-second-cursor', sourceKind: 'archive', sourceId: 'second-cursor', phenomenon: 'A Quasar sending a second clean pulse', purpose: 'Names the archive source of the automatic rhythmic touch', screenZone: 'horizon', salience: 'interactive', material: ['accretion disk', 'relativistic jet'], silhouette: 'a narrow bipolar jet piercing a dark disk', objectMotion: motion('optical', 'The jet resolves once per musical beat', 833), audioCue: 'ember-archive', loreRecord: 'second-cursor' },
  { id: 'ember-archive-snail', sourceKind: 'archive', sourceId: 'snail', phenomenon: 'A Rogue Planet keeping warmth without a sun', purpose: 'Shows the predictable stored-production return path', screenZone: 'horizon', salience: 'supporting', material: ['ancient ice', 'subsurface ember glow'], silhouette: 'a dark wandering world split by one warm tectonic seam', objectMotion: motion('orbital', 'The complete unbound passage remains slow and predictable', 24_000), audioCue: 'ember-archive', loreRecord: 'snail' },
  { id: 'ember-archive-aurora', sourceKind: 'archive', sourceId: 'aurora', phenomenon: 'A Supermassive Black Hole organizing a galactic civilization', purpose: 'Makes galaxy-scale archive resonance visible without creating urgency', screenZone: 'horizon', salience: 'ambient', material: ['galactic accretion disk', 'lensed star field'], silhouette: 'a broad dark core crossed by a barred disk and two lensing arcs', objectMotion: motion('optical', 'Galaxy lights shear slowly around the fixed horizon', 16_000), audioCue: 'ember-archive', loreRecord: 'aurora' },
  { id: 'ember-archive-door', sourceKind: 'archive', sourceId: 'door', phenomenon: 'A Black Hole whose horizon has become readable', purpose: 'Names stored production and the route mystery at the event horizon', screenZone: 'far', salience: 'milestone', material: ['event-horizon shadow', 'hot accretion crescent'], silhouette: 'a black center wrapped by one bright asymmetric crescent', objectMotion: motion('optical', 'Background light lenses around the fixed horizon', 10_000), audioCue: 'ember-archive', loreRecord: 'door' },
  { id: 'ember-archive-star-jar', sourceKind: 'archive', sourceId: 'star-jar', phenomenon: 'A Cosmic Microwave Fragment preserving the oldest light', purpose: 'Shows the archive source of increased Omen attraction', screenZone: 'far', salience: 'supporting', material: ['microwave afterglow', 'primordial temperature grid'], silhouette: 'an uneven square sky-fragment with one ember-shaped cold gap', objectMotion: motion('waveform', 'A bounded noise pattern resolves around the fixed cold gap', 2_400), audioCue: 'ember-archive', loreRecord: 'star-jar' },
  { id: 'ember-archive-metronome-heart', sourceKind: 'archive', sourceId: 'metronome-heart', phenomenon: 'A Gravitational-Wave Knot keeping three histories in phase', purpose: 'Shows the widened rhythm window with shape and phase', screenZone: 'far', salience: 'interactive', material: ['spacetime braid', 'lensing ripple'], silhouette: 'three interlocked wave loops around an empty crossing', objectMotion: motion('waveform', 'Three loops tighten in numbered timing phases', 1_667), audioCue: 'ember-archive', loreRecord: 'metronome-heart' },
  { id: 'ember-archive-letter', sourceKind: 'archive', sourceId: 'letter', phenomenon: 'A Red Giant carrying a final transmission', purpose: 'Makes the readable archival message a persistent world source', screenZone: 'horizon', salience: 'milestone', material: ['red stellar atmosphere', 'spectral message bands'], silhouette: 'a swollen star crossed by three spectral bands', objectMotion: motion('waveform', 'Atmospheric bands breathe around a stable readable signal', 7_500), audioCue: 'ember-archive', loreRecord: 'letter' },
  { id: 'ember-archive-orrery', sourceKind: 'archive', sourceId: 'orrery', phenomenon: 'The Orrery of the Local Sky mapping every restored scale', purpose: 'Anchors the completed Astral Cabinet and reveals the multiverse route', screenZone: 'horizon', salience: 'milestone', material: ['engraved dark brass', 'spectral orbit bands'], silhouette: 'five nested open orbit arms linking nursery, stars, galaxies, web, and Beacon', objectMotion: motion('mechanical', 'Orbit arms align into a map without random motion', 18_000), audioCue: 'ember-archive', loreRecord: 'orrery' },
]

const ARCHIVE_OBJECTS = ARCHIVE_OBJECT_SPECS.map(standaloneObject) as unknown as TwelveTuple<WorldObjectManifest>

const OMEN_OBJECTS = [
  standaloneObject({ id: 'ember-omen-falling-star', sourceKind: 'omen', sourceId: 'falling-star', phenomenon: 'A Falling Star crossing the reachable sky', purpose: 'Offers an optional production frenzy without loss on a miss', screenZone: 'heart', salience: 'interactive', material: ['meteor plasma', 'gold dust tail'], silhouette: 'a sharp descending point with a tapered tail', objectMotion: motion('authored', 'A readable diagonal path approaches but never obstructs the Heart', 4_500), audioCue: EMBERLIGHT_AUDIO_EVENT_MAP.omens['falling-star'] }),
  standaloneObject({ id: 'ember-omen-pulsar-sweep', sourceKind: 'omen', sourceId: 'pulsar-sweep', phenomenon: 'A Pulsar Sweep opening three timed touch windows', purpose: 'Offers an optional three-window rhythm expression', screenZone: 'far', salience: 'interactive', material: ['radio beam', 'magnetic blue plasma'], silhouette: 'a rotating three-notch beam around a compact core', objectMotion: motion('waveform', 'Three shaped beam windows cross a fixed local arc', 3_000), audioCue: EMBERLIGHT_AUDIO_EVENT_MAP.omens['pulsar-sweep'] }),
  standaloneObject({ id: 'ember-omen-comet-return', sourceKind: 'omen', sourceId: 'comet-return', phenomenon: 'A Comet returning with production stored along its route', purpose: 'Offers a predictable delayed return rather than a disappearing reward', screenZone: 'horizon', salience: 'supporting', material: ['old ice', 'double ion tail'], silhouette: 'a long curved orbit ending in a bright returning nucleus', objectMotion: motion('orbital', 'The complete return path remains visible and predictable', 20_000), audioCue: EMBERLIGHT_AUDIO_EVENT_MAP.omens['comet-return'] }),
  standaloneObject({ id: 'ember-omen-microlensing', sourceKind: 'omen', sourceId: 'microlensing-event', phenomenon: 'A Microlensing Event briefly aligning hidden structure', purpose: 'Reveals occluded records and marks the most efficient Kindling', screenZone: 'far', salience: 'interactive', material: ['lensing arc', 'spectral bloom'], silhouette: 'two bright arcs closing around an off-center star', objectMotion: motion('optical', 'Arcs converge, hold, and separate on an authored cycle', 5_500), audioCue: EMBERLIGHT_AUDIO_EVENT_MAP.omens['microlensing-event'] }),
] as const satisfies AtLeastFour<WorldObjectManifest>

const OMENS: AtLeastFour<OmenDef> = [
  { id: 'falling-star', name: 'Falling Star', description: 'Catch a descending fragment for a bounded production frenzy.', spawn: { mode: 'random', baseChance: 0.03, pityThreshold: 40, oddsVisibleAfterDiscovery: true }, rewards: [{ id: 'falling-star-frenzy', description: 'Production and touch output surge together for the authored frenzy window.', exclusivePermanentPower: false, effects: [{ kind: 'globalMult', value: 7 }, { kind: 'clickMult', value: 7 }] }], object: OMEN_OBJECTS[0], accessibilityLabel: 'Falling Star Omen, optional moving reward; a shaped path and caption mark its approach' },
  { id: 'pulsar-sweep', name: 'Pulsar Sweep', description: 'A rotating beam offers three optional timed touch windows.', spawn: { mode: 'random', baseChance: 0.018, pityThreshold: 55, oddsVisibleAfterDiscovery: true }, rewards: [{ id: 'pulsar-sweep-cadence', description: 'Successful windows add a bounded touch cadence; missing one never removes progress.', exclusivePermanentPower: false, effects: [{ kind: 'clickMult', value: 3 }] }], object: OMEN_OBJECTS[1], accessibilityLabel: 'Pulsar Sweep Omen, three numbered timing windows with audio, shape, and contrast equivalents' },
  { id: 'comet-return', name: 'Comet Return', description: 'A long-period path stores production and returns on a visible schedule.', spawn: { mode: 'scheduled', scheduleMs: 5_400_000, oddsVisibleAfterDiscovery: true }, rewards: [{ id: 'comet-stored-return', description: 'The returning comet awards its explicitly displayed stored production.', exclusivePermanentPower: false, effects: [] }], object: OMEN_OBJECTS[2], accessibilityLabel: 'Comet Return Omen, predictable route with remaining-time text and no missed-day penalty' },
  { id: 'microlensing-event', name: 'Microlensing Event', description: 'A brief alignment reveals hidden records and emphasizes the most efficient Kindling.', spawn: { mode: 'random', baseChance: 0.012, pityThreshold: 70, oddsVisibleAfterDiscovery: true }, rewards: [{ id: 'microlensing-efficiency', description: 'The currently identified efficient Kindling receives the displayed temporary emphasis.', exclusivePermanentPower: false, effects: [] }], object: OMEN_OBJECTS[3], accessibilityLabel: 'Microlensing Event Omen, lens shape and text reveal the selected Kindling without relying on color' },
]

const DENSITY_LANDMARKS = [
  standaloneObject({
    id: 'ember-density-stellar-nursery',
    sourceKind: 'story',
    sourceId: 'emberlight-arrival',
    phenomenon: 'The Foundational Nursery organizing early Kindlings into one living district',
    purpose: 'Compresses dense Spark-through-Star-Seed ownership into legible authored infrastructure',
    screenZone: 'near',
    salience: 'milestone',
    material: ['banked ember avenues', 'ionized nursery canopy'],
    silhouette: 'a low branching city beneath eight unequal stellar seed towers',
    objectMotion: motion('authored', 'District routes brighten in sequence without scattering copies', 8_000),
    audioCue: EMBERLIGHT_AUDIO_EVENT_MAP.purchase,
  }),
  standaloneObject({
    id: 'ember-density-stellar-civilization',
    sourceKind: 'story',
    sourceId: 'emberlight-supernova-scene',
    phenomenon: 'The Ecliptic Commonwealth organizing mature stars into one navigable sky',
    purpose: 'Compresses dense Protostar-through-Constellation ownership into a named stellar civilization',
    screenZone: 'far',
    salience: 'milestone',
    material: ['granulated photospheres', 'shared lensing routes'],
    silhouette: 'four unequal stellar districts linked around one open navigation center',
    objectMotion: motion('orbital', 'Districts keep one slow common ecliptic while local paths remain fixed', 14_000),
    audioCue: EMBERLIGHT_AUDIO_EVENT_MAP.archive,
  }),
  standaloneObject({
    id: 'ember-density-cosmic-hierarchy',
    sourceKind: 'story',
    sourceId: 'emberlight-beacon-scene',
    phenomenon: 'The Known Sky resolving nebulae, galaxies, web, Loom, and Second Ember into one hierarchy',
    purpose: 'Compresses dense cosmic Kindlings into a readable completed-universe landmark',
    screenZone: 'horizon',
    salience: 'milestone',
    material: ['dust-laned galaxies', 'branching cosmic filament', 'white-gold answer light'],
    silhouette: 'a barred galaxy nested inside a branching web that terminates at an answering ember',
    objectMotion: motion('optical', 'Lensing travels only along the hierarchy from nursery to Answering Star', 18_000),
    audioCue: EMBERLIGHT_AUDIO_EVENT_MAP.beacon,
  }),
] as const

const DENSITY_MERGES: readonly DensityMergeRule[] = [
  {
    sourceIds: KINDLING_OBJECTS.slice(0, 8).map(({ id }) => id),
    threshold: 100,
    resultObjectId: DENSITY_LANDMARKS[0].id,
    description: 'Foundational Kindlings become the Foundational Nursery instead of repeated glimmers.',
  },
  {
    sourceIds: KINDLING_OBJECTS.slice(8, 12).map(({ id }) => id),
    threshold: 100,
    resultObjectId: DENSITY_LANDMARKS[1].id,
    description: 'Mature stellar Kindlings become the named Ecliptic Commonwealth.',
  },
  {
    sourceIds: KINDLING_OBJECTS.slice(12).map(({ id }) => id),
    threshold: 100,
    resultObjectId: DENSITY_LANDMARKS[2].id,
    description: 'Cosmic-scale Kindlings become one legible hierarchy ending at the Second Ember.',
  },
]

const ARCHIVE_RECORDS = EMBERLIGHT_ASTRAL_CABINET.items.map((item, index): ArchiveRecordDef => ({
  id: item.id,
  name: item.name,
  observation: item.flavor,
  implication: item.record,
  effectDescription: item.desc,
  object: ARCHIVE_OBJECTS[index],
})) as unknown as TwelveTuple<ArchiveRecordDef>

const TRIAL_TARGETS: Readonly<Record<string, TrialDef['goal']>> = {
  silence: { metricId: 'run-light', target: 1e9, description: 'Earn one billion Light in the silent run.' },
  entropy: { metricId: 'sun-owned', target: 1, description: 'Kindle one Sun under accelerated cost growth.' },
  'bare-hands': { metricId: 'run-light', target: 1e6, description: 'Earn one million Light without Kindling production.' },
  drought: { metricId: 'run-light', target: 1e12, description: 'Earn one trillion Light without Falling Stars.' },
  'half-light': { metricId: 'run-light', target: 1e10, description: 'Earn ten billion Light at one-tenth production.' },
  swarm: { metricId: 'run-light', target: 1e9, description: 'Earn one billion Light using only the first three Kindlings.' },
  'glass-ceiling': { metricId: 'sun-owned', target: 1, description: 'Kindle one Sun with every Kindling capped at fifteen.' },
  'ashen-touch': { metricId: 'run-light', target: 1e12, description: 'Earn one trillion Light with weakened touch output.' },
  unwritten: { metricId: 'sun-owned', target: 1, description: 'Kindle one Sun without ordinary upgrades.' },
  'broken-ladder': { metricId: 'run-light', target: 1e13, description: 'Earn ten trillion Light while even tiers are silent.' },
  'single-voice': { metricId: 'run-light', target: 1e15, description: 'Earn one quadrillion Light with only the highest tier producing.' },
  'small-vessels': { metricId: 'second-ember-owned', target: 1, description: 'Kindle the Second Ember with every tier capped at ten.' },
}

const TRIALS: readonly TrialDef[] = CHALLENGES.map((challenge) => ({
  id: challenge.id,
  name: challenge.name,
  historicalFailure: `${challenge.flavor} ${localizeChallengeText(challenge.rules, EMBERLIGHT)}`,
  rules: Object.fromEntries(Object.entries(challenge.mods)),
  goal: TRIAL_TARGETS[challenge.id],
  rewardEffects: challenge.rewardEffects,
  accessibilityDescription: `${localizeChallengeText(challenge.rules, EMBERLIGHT)} Goal: ${localizeChallengeText(challenge.goalText, EMBERLIGHT)}. Reward: ${localizeChallengeText(challenge.rewardDesc, EMBERLIGHT)}.`,
}))

const BEACON_OBJECT = standaloneObject({
  id: 'emberlight-beacon-object',
  sourceKind: 'beacon',
  sourceId: 'emberlight-beacon',
  phenomenon: 'A restored universe answering the Dark Between',
  purpose: 'Proves Emberlight can continue independently and grants Dark Between once',
  screenZone: 'horizon',
  salience: 'milestone',
  material: ['white-gold stellar core', 'Wayfinder lens'],
  silhouette: 'a stellar Heart inside an open four-point navigation frame',
  objectMotion: motion('optical', 'One steady beam points toward the next reachable world', 12_000),
  audioCue: EMBERLIGHT_AUDIO_EVENT_MAP.beacon,
})

const ARCHIVE_SHELVES = EMBERLIGHT_ASTRAL_CABINET.shelves.map((shelf) => ({
  id: shelf.id,
  name: shelf.name,
  recordIds: [...shelf.ids] as unknown as FourTuple<string>,
  rewardDescription: `${shelf.rewardName}: ${shelf.reward}`,
})) as unknown as ThreeTuple<{
  readonly id: string
  readonly name: string
  readonly recordIds: FourTuple<string>
  readonly rewardDescription: string
}>

export const EMBERLIGHT_V2_SUPPLEMENT: UniversePackV2Supplement = {
  id: 'emberlight',
  identity: {
    name: 'The Emberlight',
    shortName: 'Emberlight',
    epithet: 'The Known Sky',
    premise: 'Rebuild a universe from plasma, dust, gravity, stars, galaxies, and the cosmic web.',
    primaryVerb: 'kindle',
    civilizationQuestion: 'What does a beginning owe the dark it spends?',
  },
  economy: {
    currency: {
      id: 'emberlight-light',
      canonicalName: 'World Currency',
      localName: 'Light',
      singular: 'Light',
      plural: 'Light',
      glyph: '✦',
      material: 'incandescent plasma',
      scope: 'world',
    },
    doctrines: [
      { id: 'ember-doctrine-forge', name: 'The Forge', description: 'Favors stable passive production and high-tier infrastructure.', favoredMotivations: ['restorer', 'optimizer'], effects: [], visualSignature: EMBERLIGHT_DOCTRINE_VISUALS.forge.visualSignature },
      { id: 'ember-doctrine-hand', name: 'The Hand', description: 'Favors touch share, critical mass, and rhythm timing.', favoredMotivations: ['performer', 'optimizer'], effects: [], visualSignature: EMBERLIGHT_DOCTRINE_VISUALS.hand.visualSignature },
      { id: 'ember-doctrine-sky', name: 'The Sky', description: 'Favors Omens, rare phenomena, and active chaining.', favoredMotivations: ['performer', 'archivist'], effects: [], visualSignature: EMBERLIGHT_DOCTRINE_VISUALS.sky.visualSignature },
      { id: 'ember-doctrine-root', name: 'The Root', description: 'Favors patient returns, head starts, and lower-tier resonance.', favoredMotivations: ['restorer', 'archivist'], effects: [], visualSignature: EMBERLIGHT_DOCTRINE_VISUALS.root.visualSignature },
    ],
    localPrestige: {
      id: 'emberlight-supernova',
      canonicalName: 'Epoch Turn',
      localName: 'Supernova',
      rewardCurrency: {
        id: 'emberlight-stardust',
        canonicalName: 'Epoch Matter',
        localName: 'Stardust',
        singular: 'Stardust',
        plural: 'Stardust',
        glyph: '✧',
        material: 'cooled stellar remnant',
        scope: 'epoch',
      },
      gainFormulaId: 'emberlight-supernova-gain',
      loses: ['world-currency', 'run-earnings', 'kindlings', 'ordinary-upgrades', 'buy-mode'],
      retains: ['epoch-matter', 'epoch-doctrines', 'epoch-works', 'era-earnings', 'deep-currency', 'deep-laws', 'deep-works', 'trials', 'archive', 'story', 'beacons', 'between-currency', 'wayfinder'],
      ceremonyFeedbackId: 'emberlight-supernova-feedback',
    },
  },
  heart: {
    id: 'emberlight-last-ember',
    canonicalName: 'Heart',
    localName: 'Last Ember',
    phenomenon: 'The final warm plasma left after the old universe ended',
    purpose: 'Primary focusable input and the visible origin of all restored Light',
    material: ['incandescent plasma', 'magnetic gold tail', 'banked ash'],
    silhouette: 'an irregular ember core with a broken five-point corona',
    idleMotion: motion('authored', 'The corona breathes locally while the core remains centered', 1_800),
    touchMotion: motion('authored', 'The core compresses, brightens, and returns with a bounded overshoot', 350),
    reducedMotionState: state('Last Ember; touch shown by local contrast', 'an irregular ember core with a stepped corona', ['incandescent plasma', 'banked ash'], still('A local contrast step marks input and timing without scale travel'), 'single'),
    lowQualityState: state('Last Ember; simplified focus target', 'a high-contrast broken five-point ember', ['incandescent plasma'], still('The stable silhouette and full hit target remain visible'), 'single'),
    touchCue: EMBERLIGHT_AUDIO_EVENT_MAP.click,
    focusLabel: 'Last Ember, Heart of Emberlight; kindle Light',
  },
  physics: {
    randomAllowed: true,
  },
  omens: OMENS,
  archive: {
    id: 'emberlight-archive',
    canonicalName: 'Field Archive',
    localName: 'Astral Cabinet',
    records: ARCHIVE_RECORDS,
    shelves: ARCHIVE_SHELVES,
  },
  trials: TRIALS,
  story: {
    civilizationQuestion: 'What does a beginning owe the dark it spends?',
    scenes: [
      { id: 'emberlight-arrival', kind: 'arrival', skippableAfterFirstView: true, replayable: true },
      { id: 'emberlight-supernova-scene', kind: 'epoch', skippableAfterFirstView: true, replayable: true },
      { id: 'emberlight-deep-scene', kind: 'deep', skippableAfterFirstView: true, replayable: true },
      { id: 'emberlight-beacon-scene', kind: 'beacon', skippableAfterFirstView: true, replayable: true },
      { id: 'emberlight-last-gardeners', kind: 'transmission', skippableAfterFirstView: true, replayable: true },
    ],
  },
  audio: EMBERLIGHT_AUDIO_DEF,
  visual: {
    materials: ['incandescent plasma', 'ionized filament', 'dust lane', 'accretion disk', 'gravitational lens', 'spectral bloom'],
    primarySilhouettes: ['broken starburst', 'crescent accretion disk', 'bipolar jet', 'irregular nebula cloud', 'barred spiral galaxy', 'branching cosmic filament'],
    motionGrammar: ['still', 'orbital', 'growth', 'optical', 'atmospheric', 'waveform', 'authored'],
    zones: {
      heart: { purpose: 'Mature stars and interactive infrastructure orbit without obstructing the Last Ember.', maximumInteractiveObjects: 3, motionFrequency: 'high' },
      near: { purpose: 'The stellar nursery and foundational Kindlings establish visible early progress.', maximumInteractiveObjects: 2, motionFrequency: 'medium' },
      far: { purpose: 'Mature stars, archive phenomena, and galaxies form a legible ecliptic.', maximumInteractiveObjects: 3, motionFrequency: 'medium' },
      horizon: { purpose: 'Cosmic structure, the Deep, and the final Beacon define the restored universe.', maximumInteractiveObjects: 2, motionFrequency: 'low' },
    },
    objects: [
      ...KINDLING_OBJECTS,
      ...OMEN_OBJECTS,
      ...ARCHIVE_OBJECTS,
      ...DENSITY_LANDMARKS,
      BEACON_OBJECT,
    ],
    densityMerges: DENSITY_MERGES,
    attentionBudget: {
      primaryTargets: 1,
      secondaryInteractiveObjects: 3,
      temporaryRewardEffects: 2,
      storySubtitles: 1,
      majorPanels: 1,
    },
  },
  beacon: {
    id: 'emberlight-beacon',
    canonicalName: 'Beacon',
    localName: 'The Answering Star',
    requirement: {
      sourceKind: 'generator',
      sourceId: 'ember2',
      target: 1,
      description: 'Kindle the Second Ember once so Emberlight can answer without the player sustaining it.',
    },
    darkBetweenReward: 3,
    object: BEACON_OBJECT,
    mapSilhouette: 'a broken starburst enclosed by an open Wayfinder frame',
  },
  accessibility: {
    heartLabel: 'Last Ember, Heart of Emberlight; kindle Light',
    currencyLabel: 'Light, Emberlight World currency',
    screenReaderOrder: [
      'emberlight-last-ember',
      'emberlight-goal-lens',
      ...KINDLING_OBJECTS.map((object) => object.id),
      ...OMEN_OBJECTS.map((object) => object.id),
      ...ARCHIVE_OBJECTS.map((object) => object.id),
      ...DENSITY_LANDMARKS.map((object) => object.id),
      BEACON_OBJECT.id,
    ],
    announcements: [
      { messageKey: 'emberlight.announcement.purchase', politeness: 'polite', dedupeKey: 'emberlight-purchase', minimumIntervalMs: 700 },
      { messageKey: 'emberlight.announcement.falling-star', politeness: 'assertive', dedupeKey: 'emberlight-falling-star', minimumIntervalMs: 1_000 },
      { messageKey: 'emberlight.announcement.pulsar-sweep', politeness: 'assertive', dedupeKey: 'emberlight-pulsar-sweep', minimumIntervalMs: 1_000 },
      { messageKey: 'emberlight.announcement.comet-return', politeness: 'polite', dedupeKey: 'emberlight-comet-return', minimumIntervalMs: 1_000 },
      { messageKey: 'emberlight.announcement.microlensing', politeness: 'polite', dedupeKey: 'emberlight-microlensing', minimumIntervalMs: 1_000 },
      { messageKey: 'emberlight.announcement.archive', politeness: 'polite', dedupeKey: 'emberlight-archive', minimumIntervalMs: 1_000 },
      { messageKey: 'emberlight.announcement.supernova', politeness: 'polite', dedupeKey: 'emberlight-supernova', minimumIntervalMs: 3_000 },
    ],
    nonColorSignals: [
      { stateId: 'emberlight-rhythm-on-beat', text: 'On beat', shape: 'three concentric notches', pattern: 'short-short-long', highContrastTreatment: 'white notched ring on black' },
      { stateId: 'emberlight-critical', text: 'Critical kindle', shape: 'five-point burst', pattern: 'solid center with broken rays', highContrastTreatment: 'double white burst outline' },
      { stateId: 'emberlight-falling-star-ready', text: 'Falling Star reachable', shape: 'descending chevron path', pattern: 'three spaced chevrons', highContrastTreatment: 'white chevrons with black inset' },
      { stateId: 'emberlight-pulsar-window', text: 'Pulsar window one, two, or three', shape: 'numbered notched sector', pattern: 'one, two, or three solid notches', highContrastTreatment: 'white numbered sector on black' },
      { stateId: 'emberlight-comet-return', text: 'Comet return route and remaining time', shape: 'open curved route ending in diamond', pattern: 'dashed outbound and solid inbound route', highContrastTreatment: 'white route with labeled return endpoint' },
      { stateId: 'emberlight-microlensing', text: 'Microlensing target aligned', shape: 'paired arcs around off-center star', pattern: 'double arc and target label', highContrastTreatment: 'white double arc with black target inset' },
      { stateId: 'emberlight-owned', text: 'Owned Kindling state', shape: 'threshold badge', pattern: 'one, ten, twenty-five, fifty, or one hundred marks', highContrastTreatment: 'number and silhouette shown together' },
      { stateId: 'emberlight-supernova-phase', text: 'Supernova phase and retained state', shape: 'five-phase corona changing into Stardust facets', pattern: 'numbered phase notches and retained labels', highContrastTreatment: 'white phase geometry with black facet numerals' },
    ],
    timing: {
      visualCue: 'A notched ring closes around the Last Ember on the beat.',
      audioCue: 'The woody-plasma impact receives a bounded magnetic accent.',
      shapeCue: 'One of three fixed notch shapes marks near, on-beat, and exceptional timing.',
      averagedModeAvailable: true,
      averagedRewardRatio: [0.85, 0.9],
    },
    muted: {
      fullGameplayEquivalent: true,
      captions: [
        'Falling Star approach, path, and remaining reach time',
        'Pulsar Sweep window number and timing band',
        'Comet Return route and remaining schedule',
        'Microlensing selected Kindling and alignment duration',
        'Rhythm timing band and critical state',
        'Astral Cabinet discovery name, implication, and effect',
        'Supernova phase, silent beat progress, retained categories, and completion',
      ],
    },
    reducedMotion: {
      fullGameplayEquivalent: true,
      replacementStrategy: 'local-pulse',
      timingInformationPreserved: true,
    },
    lowQuality: {
      fullGameplayEquivalent: true,
      preservesHitTargets: true,
      preservesStateLabels: true,
    },
  },
}

/** Emberlight is the sole F1 universe registered through the temporary V2 bridge. */
export const EMBERLIGHT_V2 = adaptLegacyUniversePack(EMBERLIGHT, EMBERLIGHT_V2_SUPPLEMENT)
