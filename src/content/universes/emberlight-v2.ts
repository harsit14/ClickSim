import { CHALLENGES } from '../challenges'
import { CURIOSITIES, CURIOSITY_SHELVES } from '../curiosities'
import { EMBERLIGHT } from './emberlight'
import { adaptLegacyUniversePack, type UniversePackV2Supplement } from './legacy-v2-adapter'
import type {
  ArchiveRecordDef,
  AtLeastFour,
  AudioBusDef,
  AudioCueDef,
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

const AUDIO_BUSES: readonly AudioBusDef[] = [
  { id: 'master', parent: null, defaultGain: 0.82, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'music', parent: 'master', defaultGain: 0.64, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'ambient', parent: 'master', defaultGain: 0.42, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'interface', parent: 'master', defaultGain: 0.56, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'touch', parent: 'master', defaultGain: 0.58, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'purchase', parent: 'master', defaultGain: 0.56, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'omen', parent: 'master', defaultGain: 0.62, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'story', parent: 'master', defaultGain: 0.58, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'ceremony', parent: 'master', defaultGain: 0.7, userControllable: true, muteBehavior: 'suppress-audio-only' },
]

const cue = (
  id: string,
  bus: AudioCueDef['bus'],
  family: string,
  synthesisKey: string,
  priority: AudioCueDef['priority'],
  mutedFallback: AudioCueDef['mutedFallback'],
  minimumIntervalMs: number,
  targetPeakDb: number,
): AudioCueDef => ({
  id,
  bus,
  family,
  synthesisKey,
  targetPeakDb,
  maximumPeakDb: -3,
  minimumIntervalMs,
  maximumConcurrentInstances: priority === 'ambient' ? 1 : 2,
  priority,
  muteGroup: `emberlight-${bus}`,
  mutedFallback,
})

const AUDIO_CUES: readonly AudioCueDef[] = [
  cue('ember-touch', 'touch', 'woody-plasma', 'ember-touch-impact', 'normal', 'none', 45, -15),
  cue('ember-purchase', 'purchase', 'forged-interval', 'ember-purchase-interval', 'normal', 'visual', 90, -13),
  cue('ember-critical', 'touch', 'magnetic-accent', 'ember-critical-tail', 'important', 'visual', 120, -10),
  cue('ember-omen', 'omen', 'falling-sky-call', 'ember-omen-descent', 'important', 'visual-and-caption', 600, -9),
  cue('ember-supernova', 'ceremony', 'subtractive-cadence', 'ember-supernova-cadence', 'ceremony', 'visual-and-caption', 2_000, -7),
  cue('ember-archive', 'story', 'spectral-record', 'ember-archive-resolve', 'important', 'caption', 500, -12),
  cue('ember-beacon', 'ceremony', 'answered-light', 'ember-beacon-light', 'ceremony', 'visual-and-caption', 2_000, -7),
]

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
    screenZone: 'heart', salience: 'interactive', material: ['iron-dark anvil', 'gold plasma spray'],
    silhouette: 'a broad anvil beneath a bipolar flame', objectMotion: motion('authored', 'Each strike sends a paired plasma fan away from the Heart', 3_200),
    ownershipSilhouettes: ['one stellar anvil', 'a ten-forge crescent', 'a twenty-five-forge industrial arc', 'a fifty-forge star foundry', 'a hundred-forge cosmic manufactory'],
  },
  {
    sourceId: 'beacon', phenomenon: 'A tower of Light calling into an unanswered sky',
    purpose: 'Foreshadows inter-world contact without representing the final Beacon system',
    screenZone: 'heart', salience: 'interactive', material: ['spectral glass', 'focused plasma'],
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
    audioCue: 'ember-purchase',
  }
}

const KINDLING_OBJECTS = KINDLING_SPECS.map(kindlingObject) as unknown as EighteenTuple<WorldObjectManifest>

interface StandaloneObjectSpec {
  readonly id: string
  readonly sourceKind: 'archive' | 'omen' | 'beacon'
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
  { id: 'ember-archive-hearthkeeper', sourceKind: 'archive', sourceId: 'hearthkeeper', phenomenon: 'A fuelable Protostar awaiting ignition', purpose: 'Shows the archive incubation bonus and its remaining warmth', screenZone: 'near', salience: 'interactive', material: ['infrared cloud', 'fuel-bright core'], silhouette: 'a soft cloud around an unopened stellar seed', objectMotion: motion('growth', 'The core brightens locally as stored fuel remains', 5_400), audioCue: 'ember-archive', loreRecord: 'hearthkeeper' },
  { id: 'ember-archive-glass-garden', sourceKind: 'archive', sourceId: 'glass-garden', phenomenon: 'An Emission Nebula flowering around unborn suns', purpose: 'Makes the archive collection alter the world edge', screenZone: 'horizon', salience: 'ambient', material: ['hydrogen emission', 'dark dust pillar'], silhouette: 'a wide scalloped cloud divided by a black pillar', objectMotion: motion('atmospheric', 'Gas folds expand without crossing the Heart', 12_000), audioCue: 'ember-archive', loreRecord: 'glass-garden' },
  { id: 'ember-archive-second-cursor', sourceKind: 'archive', sourceId: 'second-cursor', phenomenon: 'A Quasar sending a second clean pulse', purpose: 'Names the archive source of the automatic rhythmic touch', screenZone: 'horizon', salience: 'interactive', material: ['accretion disk', 'relativistic jet'], silhouette: 'a narrow bipolar jet piercing a dark disk', objectMotion: motion('optical', 'The jet resolves once per musical beat', 833), audioCue: 'ember-archive', loreRecord: 'second-cursor' },
  { id: 'ember-archive-snail', sourceKind: 'archive', sourceId: 'snail', phenomenon: 'A Long-Period Comet keeping an enormous promise', purpose: 'Shows the predictable stored-production return path', screenZone: 'horizon', salience: 'supporting', material: ['ancient ice', 'ion tail'], silhouette: 'a small nucleus with a long bent double tail', objectMotion: motion('orbital', 'The authored return arc remains slow and predictable', 24_000), audioCue: 'ember-archive', loreRecord: 'snail' },
  { id: 'ember-archive-aurora', sourceKind: 'archive', sourceId: 'aurora', phenomenon: 'A Supernova Remnant still carrying its last decision', purpose: 'Makes an expanding archival event visible without creating urgency', screenZone: 'horizon', salience: 'ambient', material: ['shock-front ribbon', 'stellar ejecta'], silhouette: 'a broken expanding shell with an empty center', objectMotion: motion('atmospheric', 'The shell expands and fades in a repeatable authored loop', 16_000), audioCue: 'ember-archive', loreRecord: 'aurora' },
  { id: 'ember-archive-door', sourceKind: 'archive', sourceId: 'door', phenomenon: 'A Black Hole whose horizon has become readable', purpose: 'Names stored production and the route mystery at the event horizon', screenZone: 'far', salience: 'milestone', material: ['event-horizon shadow', 'hot accretion crescent'], silhouette: 'a black center wrapped by one bright asymmetric crescent', objectMotion: motion('optical', 'Background light lenses around the fixed horizon', 10_000), audioCue: 'ember-archive', loreRecord: 'door' },
  { id: 'ember-archive-star-jar', sourceKind: 'archive', sourceId: 'star-jar', phenomenon: 'A Neutron Star preserving every touch as density', purpose: 'Shows the archive source of increased Omen attraction', screenZone: 'far', salience: 'supporting', material: ['neutron crust', 'blue-white polar cap'], silhouette: 'a compact oval with two short polar cones', objectMotion: motion('waveform', 'Polar cones pulse without sweeping the screen', 2_400), audioCue: 'ember-archive', loreRecord: 'star-jar' },
  { id: 'ember-archive-metronome-heart', sourceKind: 'archive', sourceId: 'metronome-heart', phenomenon: 'A Pulsar keeping time before the score existed', purpose: 'Shows the widened rhythm window with shape and phase', screenZone: 'far', salience: 'interactive', material: ['radio beam', 'neutron core'], silhouette: 'a tilted lighthouse axis through a compact star', objectMotion: motion('waveform', 'Two opposed beams mark the timing window', 1_667), audioCue: 'ember-archive', loreRecord: 'metronome-heart' },
  { id: 'ember-archive-letter', sourceKind: 'archive', sourceId: 'letter', phenomenon: 'A Red Giant carrying a final transmission', purpose: 'Makes the readable archival message a persistent world source', screenZone: 'horizon', salience: 'milestone', material: ['red stellar atmosphere', 'spectral message bands'], silhouette: 'a swollen star crossed by three spectral bands', objectMotion: motion('waveform', 'Atmospheric bands breathe around a stable readable signal', 7_500), audioCue: 'ember-archive', loreRecord: 'letter' },
  { id: 'ember-archive-orrery', sourceKind: 'archive', sourceId: 'orrery', phenomenon: 'A Supermassive Black Hole mapping other skies', purpose: 'Anchors the completed Archive and reveals the multiverse route', screenZone: 'horizon', salience: 'milestone', material: ['galactic accretion disk', 'gravitational lens'], silhouette: 'a broad dark eye holding multiple lensed sky fragments', objectMotion: motion('optical', 'Lensed fragments align into a map without random motion', 18_000), audioCue: 'ember-archive', loreRecord: 'orrery' },
]

const ARCHIVE_OBJECTS = ARCHIVE_OBJECT_SPECS.map(standaloneObject) as unknown as TwelveTuple<WorldObjectManifest>

const OMEN_OBJECTS = [
  standaloneObject({ id: 'ember-omen-falling-star', sourceKind: 'omen', sourceId: 'falling-star', phenomenon: 'A Falling Star crossing the reachable sky', purpose: 'Offers an optional production frenzy without loss on a miss', screenZone: 'heart', salience: 'interactive', material: ['meteor plasma', 'gold dust tail'], silhouette: 'a sharp descending point with a tapered tail', objectMotion: motion('authored', 'A readable diagonal path approaches but never obstructs the Heart', 4_500), audioCue: 'ember-omen' }),
  standaloneObject({ id: 'ember-omen-pulsar-sweep', sourceKind: 'omen', sourceId: 'pulsar-sweep', phenomenon: 'A Pulsar Sweep opening three timed touch windows', purpose: 'Offers an optional three-window rhythm expression', screenZone: 'far', salience: 'interactive', material: ['radio beam', 'magnetic blue plasma'], silhouette: 'a rotating three-notch beam around a compact core', objectMotion: motion('waveform', 'Three shaped beam windows cross a fixed local arc', 3_000), audioCue: 'ember-omen' }),
  standaloneObject({ id: 'ember-omen-comet-return', sourceKind: 'omen', sourceId: 'comet-return', phenomenon: 'A Comet returning with production stored along its route', purpose: 'Offers a predictable delayed return rather than a disappearing reward', screenZone: 'horizon', salience: 'supporting', material: ['old ice', 'double ion tail'], silhouette: 'a long curved orbit ending in a bright returning nucleus', objectMotion: motion('orbital', 'The complete return path remains visible and predictable', 20_000), audioCue: 'ember-omen' }),
  standaloneObject({ id: 'ember-omen-microlensing', sourceKind: 'omen', sourceId: 'microlensing-event', phenomenon: 'A Microlensing Event briefly aligning hidden structure', purpose: 'Reveals occluded records and marks the most efficient Kindling', screenZone: 'far', salience: 'interactive', material: ['lensing arc', 'spectral bloom'], silhouette: 'two bright arcs closing around an off-center star', objectMotion: motion('optical', 'Arcs converge, hold, and separate on an authored cycle', 5_500), audioCue: 'ember-omen' }),
] as const satisfies AtLeastFour<WorldObjectManifest>

const OMENS: AtLeastFour<OmenDef> = [
  { id: 'falling-star', name: 'Falling Star', description: 'Catch a descending fragment for a bounded production frenzy.', spawn: { mode: 'random', baseChance: 0.03, pityThreshold: 40, oddsVisibleAfterDiscovery: true }, rewards: [{ id: 'falling-star-frenzy', description: 'Production and touch output surge together for the authored frenzy window.', exclusivePermanentPower: false, effects: [{ kind: 'globalMult', value: 7 }, { kind: 'clickMult', value: 7 }] }], object: OMEN_OBJECTS[0], accessibilityLabel: 'Falling Star Omen, optional moving reward; a shaped path and caption mark its approach' },
  { id: 'pulsar-sweep', name: 'Pulsar Sweep', description: 'A rotating beam offers three optional timed touch windows.', spawn: { mode: 'random', baseChance: 0.018, pityThreshold: 55, oddsVisibleAfterDiscovery: true }, rewards: [{ id: 'pulsar-sweep-cadence', description: 'Successful windows add a bounded touch cadence; missing one never removes progress.', exclusivePermanentPower: false, effects: [{ kind: 'clickMult', value: 3 }] }], object: OMEN_OBJECTS[1], accessibilityLabel: 'Pulsar Sweep Omen, three numbered timing windows with audio, shape, and contrast equivalents' },
  { id: 'comet-return', name: 'Comet Return', description: 'A long-period path stores production and returns on a visible schedule.', spawn: { mode: 'scheduled', scheduleMs: 5_400_000, oddsVisibleAfterDiscovery: true }, rewards: [{ id: 'comet-stored-return', description: 'The returning comet awards its explicitly displayed stored production.', exclusivePermanentPower: false, effects: [] }], object: OMEN_OBJECTS[2], accessibilityLabel: 'Comet Return Omen, predictable route with remaining-time text and no missed-day penalty' },
  { id: 'microlensing-event', name: 'Microlensing Event', description: 'A brief alignment reveals hidden records and emphasizes the most efficient Kindling.', spawn: { mode: 'random', baseChance: 0.012, pityThreshold: 70, oddsVisibleAfterDiscovery: true }, rewards: [{ id: 'microlensing-efficiency', description: 'The currently identified efficient Kindling receives the displayed temporary emphasis.', exclusivePermanentPower: false, effects: [] }], object: OMEN_OBJECTS[3], accessibilityLabel: 'Microlensing Event Omen, lens shape and text reveal the selected Kindling without relying on color' },
]

const ARCHIVE_RECORDS = CURIOSITIES.map((item, index): ArchiveRecordDef => ({
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
  historicalFailure: `${challenge.flavor} ${challenge.rules}`,
  rules: Object.fromEntries(Object.entries(challenge.mods)),
  goal: TRIAL_TARGETS[challenge.id],
  rewardEffects: challenge.rewardEffects,
  accessibilityDescription: `${challenge.rules} Goal: ${challenge.goalText}. Reward: ${challenge.rewardDesc}.`,
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
  audioCue: 'ember-beacon',
})

const ARCHIVE_SHELVES = CURIOSITY_SHELVES.map((shelf) => ({
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
    civilizationQuestion: 'Is creation an act of care, or only hunger delayed?',
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
      { id: 'ember-doctrine-forge', name: 'The Forge', description: 'Favors stable passive production and high-tier infrastructure.', favoredMotivations: ['restorer', 'optimizer'], effects: [], visualSignature: 'an anvil-shaped stellar foundry beneath the Heart' },
      { id: 'ember-doctrine-hand', name: 'The Hand', description: 'Favors touch share, critical mass, and rhythm timing.', favoredMotivations: ['performer', 'optimizer'], effects: [], visualSignature: 'a five-point magnetic touch trace around the Heart' },
      { id: 'ember-doctrine-sky', name: 'The Sky', description: 'Favors Omens, rare phenomena, and active chaining.', favoredMotivations: ['performer', 'archivist'], effects: [], visualSignature: 'three descending spectral paths across the far field' },
      { id: 'ember-doctrine-root', name: 'The Root', description: 'Favors patient returns, head starts, and lower-tier resonance.', favoredMotivations: ['restorer', 'archivist'], effects: [], visualSignature: 'banked cosmic filaments joining the nursery to the Heart' },
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
    touchCue: 'ember-touch',
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
    civilizationQuestion: 'Is creation an act of care, or only hunger delayed?',
    scenes: [
      { id: 'emberlight-arrival', kind: 'arrival', skippableAfterFirstView: true, replayable: true },
      { id: 'emberlight-supernova-scene', kind: 'epoch', skippableAfterFirstView: true, replayable: true },
      { id: 'emberlight-deep-scene', kind: 'deep', skippableAfterFirstView: true, replayable: true },
      { id: 'emberlight-beacon-scene', kind: 'beacon', skippableAfterFirstView: true, replayable: true },
      { id: 'emberlight-last-gardeners', kind: 'transmission', skippableAfterFirstView: true, replayable: true },
    ],
  },
  audio: {
    tempoBpm: 72,
    meter: '4/4',
    buses: AUDIO_BUSES,
    cues: AUDIO_CUES,
    clickMaterialCue: 'ember-touch',
    purchaseIntervalCue: 'ember-purchase',
    criticalAccentCue: 'ember-critical',
    omenCallCue: 'ember-omen',
    prestigeCadenceCue: 'ember-supernova',
    stems: [
      { id: 'ember-stem-mallets', kindlingFamily: 'spark-through-forge', bus: 'music', description: 'Warm mallets voice the nursery and early craft tiers.' },
      { id: 'ember-stem-forge', kindlingFamily: 'beacon-through-starseed', bus: 'music', description: 'Forge percussion enters with civilizational infrastructure.' },
      { id: 'ember-stem-strings', kindlingFamily: 'protostar-through-constellation', bus: 'music', description: 'Strings widen as mature stars establish an ecliptic.' },
      { id: 'ember-stem-choir', kindlingFamily: 'nebula-through-second-ember', bus: 'music', description: 'Choir resolves the cosmic hierarchy and subtracts before Supernova.' },
    ],
    silenceState: 'One intentional beat of silence preserves timing through a visible corona contraction and caption.',
    fatiguePolicy: 'Bound pitch variation, rate-limit repeated material cues, duck touch under Omens, and retain at least one decibel of master headroom.',
  },
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
    objects: [...KINDLING_OBJECTS, ...OMEN_OBJECTS, ...ARCHIVE_OBJECTS, BEACON_OBJECT],
    densityMerges: [],
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
      'emberlight-archive',
      'emberlight-beacon',
    ],
    announcements: [
      { messageKey: 'emberlight.announcement.purchase', politeness: 'polite', dedupeKey: 'emberlight-purchase', minimumIntervalMs: 700 },
      { messageKey: 'emberlight.announcement.omen', politeness: 'assertive', dedupeKey: 'emberlight-omen', minimumIntervalMs: 1_000 },
      { messageKey: 'emberlight.announcement.archive', politeness: 'polite', dedupeKey: 'emberlight-archive', minimumIntervalMs: 1_000 },
      { messageKey: 'emberlight.announcement.supernova', politeness: 'polite', dedupeKey: 'emberlight-supernova', minimumIntervalMs: 3_000 },
    ],
    nonColorSignals: [
      { stateId: 'emberlight-rhythm-on-beat', text: 'On beat', shape: 'three concentric notches', pattern: 'short-short-long', highContrastTreatment: 'white notched ring on black' },
      { stateId: 'emberlight-critical', text: 'Critical kindle', shape: 'five-point burst', pattern: 'solid center with broken rays', highContrastTreatment: 'double white burst outline' },
      { stateId: 'emberlight-omen-ready', text: 'Omen reachable', shape: 'descending chevron path', pattern: 'three spaced chevrons', highContrastTreatment: 'white chevrons with black inset' },
      { stateId: 'emberlight-owned', text: 'Owned Kindling state', shape: 'threshold badge', pattern: 'one, ten, twenty-five, fifty, or one hundred marks', highContrastTreatment: 'number and silhouette shown together' },
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
      captions: ['Omen approach and remaining path', 'Rhythm timing band', 'Archive discovery', 'Supernova cadence and completion'],
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
