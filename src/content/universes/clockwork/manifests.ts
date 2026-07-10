import type {
  ArchiveDef,
  ArchiveRecordDef,
  ArchiveShelfDef,
  AtLeastFour,
  BeaconDef,
  EighteenTuple,
  FourTuple,
  MotionGrammar,
  OmenDef,
  ScreenZone,
  ThreeTuple,
  TwelveTuple,
  VisualState,
  WorldObjectManifest,
} from '../types'
import { CLOCKWORK_PATENT_ITEMS, CLOCKWORK_PATENT_SHELVES } from './archive'
import { CLOCKWORK_MAINTENANCE_SIGNALS } from './maintenance'

const motion = (
  kind: MotionGrammar['kind'],
  description: string,
  periodMs = 6_000,
): MotionGrammar => ({ kind, description, periodMs, preservesTimingInformation: true })

const visualState = (
  label: string,
  silhouette: string,
  material: readonly string[],
  stateMotion: MotionGrammar,
  countPresentation: VisualState['countPresentation'],
): VisualState => ({ label, silhouette, material, motion: stateMotion, countPresentation })

interface ClockworkKindlingSpec {
  readonly sourceId: string
  readonly objectId: string
  readonly phenomenon: string
  readonly purpose: string
  readonly zone: ScreenZone
  readonly material: readonly string[]
  readonly silhouette: string
  readonly movement: string
  readonly forms: readonly [string, string, string, string, string]
}

const KINDLING_SPECS: EighteenTuple<ClockworkKindlingSpec> = [
  { sourceId: 'u4-tooth', objectId: 'u4-object-tooth', phenomenon: 'One brass tooth converting Heart engagement into transmissible torque.', purpose: 'Shows the smallest source and its one explicit output socket.', zone: 'near', material: ['brass', 'blued-steel pin'], silhouette: 'single broad tooth on a marked axle', movement: 'Indexes one visible step only when its output linkage accepts work.', forms: ['one indexed tooth', 'a ten-tooth sector gear', 'a twenty-five-tooth power wheel', 'a fifty-tooth civic drive', 'the named First Transmission'],
  },
  { sourceId: 'u4-cog', objectId: 'u4-object-cog', phenomenon: 'A small meshing wheel translating torque into direction.', purpose: 'Introduces visible input and output socket alignment.', zone: 'near', material: ['brass', 'ceramic bearing'], silhouette: 'eight-tooth cog with one dark input tooth', movement: 'Meshes against its authored neighbor and stops if that route is inactive.', forms: ['one eight-tooth cog', 'a ten-cog reduction train', 'a twenty-five-cog transfer frame', 'a fifty-cog workshop line', 'the Direction Works'],
  },
  { sourceId: 'u4-ratchet', objectId: 'u4-object-ratchet', phenomenon: 'A directional wheel retaining every completed forward index.', purpose: 'Makes stored progress and one-way transmission visible.', zone: 'near', material: ['blued steel', 'ivory-substitute pawl'], silhouette: 'saw-tooth wheel held by one angled pawl', movement: 'Advances in discrete steps while the pawl visibly blocks reverse travel.', forms: ['one ratchet and pawl', 'a ten-ratchet memory bank', 'a twenty-five-step indexed register', 'a fifty-ratchet civic archive', 'the Forward Memory Office'],
  },
  { sourceId: 'u4-escapement', objectId: 'u4-object-escapement', phenomenon: 'A pallet dividing continuous tension into useful Ticks.', purpose: 'Establishes cadence routing and the Heart’s mechanical grammar.', zone: 'heart', material: ['blued steel', 'ruby bearing', 'brass escape wheel'], silhouette: 'anchor pallet across a fifteen-tooth escape wheel', movement: 'Reciprocates only as the escape wheel releases one counted interval.', forms: ['one anchor escapement', 'a ten-escapement timing rack', 'a twenty-five-clock cadence hall', 'a fifty-clock public standard', 'the Civic Second'],
  },
  { sourceId: 'u4-mainspring', objectId: 'u4-object-mainspring', phenomenon: 'A tensioned spiral storing work for controlled release.', purpose: 'Makes potential energy and the future Epoch Matter metaphor legible.', zone: 'near', material: ['tempered spring steel', 'brass barrel'], silhouette: 'tight spiral spring inside an open barrel', movement: 'Winds under incoming power and releases along its sole output route.', forms: ['one open spring barrel', 'a ten-spring reserve rack', 'a twenty-five-barrel tension bank', 'a fifty-spring municipal reserve', 'the Stored Interval Vault'],
  },
  { sourceId: 'u4-flywheel', objectId: 'u4-object-flywheel', phenomenon: 'A balanced wheel smoothing discrete Ticks into civic momentum.', purpose: 'Completes the recommended first six-Kindling route.', zone: 'near', material: ['cast brass rim', 'ceramic bearing', 'steel spokes'], silhouette: 'heavy six-spoke wheel with one timing mark', movement: 'Turns only while connected torque enters and visibly coasts to rest.', forms: ['one six-spoke flywheel', 'a ten-wheel momentum line', 'a twenty-five-wheel power gallery', 'a fifty-wheel district stabilizer', 'the Constant-Motion Commons'],
  },
  { sourceId: 'u4-governor', objectId: 'u4-object-governor', phenomenon: 'A centrifugal regulator correcting dangerous excess.', purpose: 'Shows load, bottleneck, and stability as a readable mechanism.', zone: 'near', material: ['blued steel', 'brass weights'], silhouette: 'paired governor weights around a vertical shaft', movement: 'Weights rise with transmitted load and close the throttle at the marked limit.', forms: ['one twin-weight governor', 'a ten-governor safety row', 'a twenty-five-shaft correction lattice', 'a fifty-governor standards office', 'the Compassion Regulator'],
  },
  { sourceId: 'u4-clockmaker-automaton', objectId: 'u4-object-clockmaker-automaton', phenomenon: 'An articulated civic machine repairing other machines.', purpose: 'Turns automation into visible maintenance rather than invisible production.', zone: 'near', material: ['engraved brass', 'ivory substitute', 'oil glass'], silhouette: 'seated automaton with caliper hand and open chest clock', movement: 'Reaches only toward the exact linkage scheduled for service.', forms: ['one clockmaker automaton', 'a ten-automaton repair bench', 'a twenty-five-hand service hall', 'a fifty-automaton maintenance corps', 'the Guild That Repairs Itself'],
  },
  { sourceId: 'u4-orrery', objectId: 'u4-object-orrery', phenomenon: 'An astronomical model forecasting fixed alignments.', purpose: 'Makes Noon Alignment and scheduled events inspectable at a glance.', zone: 'far', material: ['brass orbital rings', 'clock glass', 'blued-steel axles'], silhouette: 'three off-center orbital rings around an empty axle', movement: 'Rings advance by geared ratios toward a labeled meridian, never arbitrary orbit.', forms: ['one three-ring Orrery', 'a ten-model forecast gallery', 'a twenty-five-ring meridian array', 'a fifty-Orrery civic sky', 'the Moonless Planetarium'],
  },
  { sourceId: 'u4-difference-engine', objectId: 'u4-object-difference-engine', phenomenon: 'A column engine carrying exact differences through decimal wheels.', purpose: 'Makes computation and formula inspection part of the world.', zone: 'far', material: ['brass columns', 'steel carry arms', 'punched numeral drums'], silhouette: 'three stepped number columns beneath a carry carriage', movement: 'Columns index in deterministic carry order from right to left.', forms: ['one three-column Difference Engine', 'a ten-engine calculation office', 'a twenty-five-column analysis floor', 'a fifty-engine prediction bureau', 'the Brass Analysis Ministry'],
  },
  { sourceId: 'u4-relay-foundry', objectId: 'u4-object-relay-foundry', phenomenon: 'A foundry manufacturing repeatable transmission instructions.', purpose: 'Shows route infrastructure growing from components into civic systems.', zone: 'far', material: ['dark iron frame', 'brass relay leaves', 'ceramic insulator'], silhouette: 'arched foundry frame holding paired relay leaves', movement: 'Relay leaves close in the route’s topological order when a train completes.', forms: ['one relay casting frame', 'a ten-relay foundry row', 'a twenty-five-line instruction works', 'a fifty-foundry civic network', 'the Transmission Foundry District'],
  },
  { sourceId: 'u4-meridian-clock', objectId: 'u4-object-meridian-clock', phenomenon: 'A public clock synchronizing districts to one declared now.', purpose: 'Anchors the city horizon and non-color schedule reading.', zone: 'far', material: ['clock glass', 'brass chapter ring', 'blued-steel hands'], silhouette: 'tall clock face crossed by one meridian line', movement: 'Hands advance in fixed steps and meet the meridian on a forecast interval.', forms: ['one Meridian Clock', 'a ten-clock public arcade', 'a twenty-five-tower time district', 'a fifty-clock synchronization grid', 'the Common Now'],
  },
  { sourceId: 'u4-prediction-mill', objectId: 'u4-object-prediction-mill', phenomenon: 'A computation mill translating future routes into punched paper.', purpose: 'Makes scheduled automation visible and reviewable before execution.', zone: 'far', material: ['punched paper', 'brass feed rollers', 'inked steel type'], silhouette: 'roller frame feeding a long punched forecast strip', movement: 'Paper advances one printed route at each declared schedule boundary.', forms: ['one forecast paper mill', 'a ten-strip schedule desk', 'a twenty-five-roll planning floor', 'a fifty-mill forecast ministry', 'the Tomorrow Printing Office'],
  },
  { sourceId: 'u4-city-of-hours', objectId: 'u4-object-city-of-hours', phenomenon: 'A complete civic machine built from schedules, routes, and public clocks.', purpose: 'Merges engines into an inhabited city rather than a pile of gears.', zone: 'horizon', material: ['brass architecture', 'clock glass roofs', 'steel route bridges'], silhouette: 'stepped clock-tower skyline joined by visible shafts', movement: 'District mechanisms complete one staggered civic cycle in route order.', forms: ['one clockwork civic block', 'a ten-district time city', 'a twenty-five-route municipal grid', 'a fifty-district metropolitan machine', 'the City of Hours Assembly'],
  },
  { sourceId: 'u4-causal-engine', objectId: 'u4-object-causal-engine', phenomenon: 'An engine transmitting the declared reason one event follows another.', purpose: 'Introduces the philosophical danger of perfect prediction.', zone: 'horizon', material: ['blackened brass', 'glass logic gates', 'tensioned causal wire'], silhouette: 'two unequal frames joined by a one-way linkage', movement: 'The cause frame locks before the effect frame moves, with the interval labeled.', forms: ['one cause-and-effect linkage', 'a ten-engine causal chain', 'a twenty-five-gate consequence hall', 'a fifty-engine future lattice', 'the Ministry of Necessary Events'],
  },
  { sourceId: 'u4-world-gear', objectId: 'u4-object-world-gear', phenomenon: 'A continent-scale gear transmitting the city’s work through the world.', purpose: 'Defines the restored universe as one functioning machine.', zone: 'horizon', material: ['brass continent plate', 'blued-steel world axle'], silhouette: 'vast partial gear crossing the horizon with one engraved degree', movement: 'Advances one degree only when the complete upstream civic train resolves.', forms: ['one horizon World Gear', 'a ten-sector planetary train', 'a twenty-five-degree world drive', 'a fifty-sector causal globe', 'the One-Degree World'],
  },
  { sourceId: 'u4-last-calendar', objectId: 'u4-object-last-calendar', phenomenon: 'A complete calendar surrounding one deliberately blank date.', purpose: 'Makes preserved uncertainty visible before the final machine.', zone: 'horizon', material: ['engraved ivory substitute', 'red index enamel', 'brass binding'], silhouette: 'stack of dated leaves around one empty square', movement: 'Leaves index in order and stop before the protected blank date.', forms: ['one blank-dated calendar leaf', 'a ten-leaf civic almanac', 'a twenty-five-volume date archive', 'a fifty-calendar horizon library', 'the Calendar With One Tomorrow'],
  },
  { sourceId: 'u4-great-regulator', objectId: 'u4-object-great-regulator', phenomenon: 'The city, sky, and causal routes operating as one regulator.', purpose: 'Completes the Kindling ladder and explicitly satisfies the Beacon requirement.', zone: 'horizon', material: ['brass civic frame', 'blued-steel regulator arms', 'clock glass sky'], silhouette: 'city-scale regulator framing an open central route', movement: 'Every visible train resolves into one controlled release without hidden motion.', forms: ['one city-scale regulator', 'a ten-frame regulation council', 'a twenty-five-route world instrument', 'a fifty-district causal regulator', 'The Great Regulator Awake'],
  },
]

function kindlingObject(spec: ClockworkKindlingSpec): WorldObjectManifest {
  const stateMotion = motion('mechanical', spec.movement)
  return {
    id: spec.objectId,
    sourceKind: 'generator',
    sourceId: spec.sourceId,
    phenomenon: spec.phenomenon,
    purpose: spec.purpose,
    screenZone: spec.zone,
    salience: spec.zone === 'horizon' ? 'milestone' : spec.zone === 'heart' ? 'interactive' : 'supporting',
    material: spec.material,
    silhouette: spec.silhouette,
    motion: stateMotion,
    ownershipStates: {
      1: visualState(`${spec.phenomenon} One owned.`, spec.forms[0], spec.material, stateMotion, 'single'),
      10: visualState(`${spec.phenomenon} Ten owned.`, spec.forms[1], spec.material, stateMotion, 'group'),
      25: visualState(`${spec.phenomenon} Twenty-five owned.`, spec.forms[2], spec.material, stateMotion, 'group'),
      50: visualState(`${spec.phenomenon} Fifty owned.`, spec.forms[3], spec.material, stateMotion, 'infrastructure'),
      100: visualState(`${spec.phenomenon} One hundred owned.`, spec.forms[4], spec.material, stateMotion, 'infrastructure'),
    },
    reducedMotionState: visualState(
      `${spec.phenomenon} Fixed indexed state.`,
      `${spec.forms[4]} with numbered route stations`,
      spec.material,
      motion('still', 'Fixed before-and-after tooth positions preserve routing and schedule information.'),
      'infrastructure',
    ),
    lowQualityState: visualState(
      `${spec.phenomenon} Simplified transmission state.`,
      spec.forms[2],
      [spec.material[0]],
      motion('mechanical', 'One simplified indexed movement preserves route direction.', 9_000),
      'group',
    ),
    overlapGroup: `u4-kindling-${spec.zone}`,
    canOverlapWith: ['u4-route-lines'],
    minimumHeartDistance: spec.zone === 'heart' ? 1.05 : spec.zone === 'horizon' ? 2 : 1.3,
    priorityWhilePanelOpen: spec.zone === 'horizon' ? 'hold' : 'dim',
    audioCue: 'clockwork-purchase-train',
  }
}

export const CLOCKWORK_KINDLING_OBJECTS = KINDLING_SPECS.map(kindlingObject) as unknown as EighteenTuple<WorldObjectManifest>

interface PatentObjectSpec {
  readonly silhouette: string
  readonly movement: string
  readonly zone: ScreenZone
  readonly material: readonly string[]
}

const PATENT_OBJECT_SPECS: TwelveTuple<PatentObjectSpec> = [
  { silhouette: 'single broad tooth inside an open patent frame', movement: 'One before-and-after index position demonstrates transmitted work.', zone: 'near', material: ['brass', 'patent paper'] },
  { silhouette: 'ceramic bearing around one sealed oil drop', movement: 'The oil witness mark advances only when the bearing completes a cycle.', zone: 'near', material: ['ceramic bearing', 'oil glass'] },
  { silhouette: 'floating anchor pallet above a disconnected escape wheel', movement: 'Numbered fixed positions reveal the impossible missing input.', zone: 'near', material: ['blued steel', 'ruby bearing'] },
  { silhouette: 'three orbital gear rings around an empty moon axle', movement: 'Geared rings align at the declared meridian.', zone: 'far', material: ['brass orbital ring', 'clock glass'] },
  { silhouette: 'asymmetric cam profile beside a ten-notch memory strip', movement: 'The follower traces the stored ten-second profile.', zone: 'far', material: ['blued-steel cam', 'punched paper'] },
  { silhouette: 'paired governor weights enclosing a small civic heart', movement: 'Weights stop at a labeled humane load limit.', zone: 'near', material: ['brass weights', 'blue enamel'] },
  { silhouette: 'looped paper prophecy with one untouched margin', movement: 'Punched apertures pass a fixed reading gate in order.', zone: 'far', material: ['punched paper', 'inked brass'] },
  { silhouette: 'warranty seal around an endless but open gear path', movement: 'The path completes a cycle without closing into a forbidden route loop.', zone: 'far', material: ['wax seal', 'brass foil'] },
  { silhouette: 'cracked hourglass holding one grain outside the frame', movement: 'Numbered sand positions preserve the bounded exception without random drift.', zone: 'near', material: ['clock glass', 'numbered sand'] },
  { silhouette: 'articulated five-finger tool with one worn thumb joint', movement: 'The hand moves through three fixed repair poses.', zone: 'near', material: ['engraved brass', 'ivory substitute'] },
  { silhouette: 'shift bell crossed by a worker-controlled schedule lever', movement: 'The clapper moves only at the labeled civic interval.', zone: 'far', material: ['tuned brass', 'steel lever'] },
  { silhouette: 'complete blueprint frame with one route left open', movement: 'Route lines resolve toward but never fill the protected blank.', zone: 'horizon', material: ['blueprint paper', 'white drafting ink'] },
]

function patentObject(index: number): WorldObjectManifest {
  const item = CLOCKWORK_PATENT_ITEMS[index]
  const spec = PATENT_OBJECT_SPECS[index]
  const stateMotion = motion('mechanical', spec.movement, 8_000)
  return {
    id: `u4-object-${item.id}`,
    sourceKind: 'archive',
    sourceId: item.id,
    phenomenon: item.flavor,
    purpose: item.desc,
    screenZone: spec.zone,
    salience: 'interactive',
    material: spec.material,
    silhouette: spec.silhouette,
    motion: stateMotion,
    reducedMotionState: visualState(`${item.name} fixed patent plate.`, `${spec.silhouette} with numbered before-and-after marks`, spec.material, motion('still', 'Fixed patent diagrams preserve the mechanism.'), 'single'),
    lowQualityState: visualState(`${item.name} simplified patent plate.`, spec.silhouette, [spec.material[0]], motion('still', 'One outlined patent silhouette remains.'), 'single'),
    overlapGroup: 'u4-patent-ledger',
    canOverlapWith: [],
    minimumHeartDistance: 1.4,
    priorityWhilePanelOpen: 'hold',
    audioCue: 'clockwork-archive-index',
    loreRecord: item.id,
  }
}

export const CLOCKWORK_PATENT_OBJECTS = CLOCKWORK_PATENT_ITEMS.map((_, index) => patentObject(index)) as unknown as TwelveTuple<WorldObjectManifest>

export const CLOCKWORK_ARCHIVE_RECORDS = CLOCKWORK_PATENT_ITEMS.map((item, index): ArchiveRecordDef => ({
  id: item.id,
  name: item.name,
  observation: item.flavor,
  implication: item.record,
  effectDescription: item.desc,
  object: CLOCKWORK_PATENT_OBJECTS[index],
})) as unknown as TwelveTuple<ArchiveRecordDef>

export const CLOCKWORK_ARCHIVE_SHELVES: ThreeTuple<ArchiveShelfDef> = CLOCKWORK_PATENT_SHELVES.map((shelf) => ({
  id: shelf.id,
  name: shelf.name,
  recordIds: [...shelf.ids] as unknown as FourTuple<string>,
  rewardDescription: `${shelf.rewardName}: ${shelf.reward}`,
})) as unknown as ThreeTuple<ArchiveShelfDef>

export const CLOCKWORK_ARCHIVE: ArchiveDef = {
  id: 'u4-patent-ledger',
  canonicalName: 'Field Archive',
  localName: 'Patent Ledger',
  records: CLOCKWORK_ARCHIVE_RECORDS,
  shelves: CLOCKWORK_ARCHIVE_SHELVES,
}

function signalObject(index: number): WorldObjectManifest {
  const signal = CLOCKWORK_MAINTENANCE_SIGNALS[index]
  const silhouettes = [
    'open wrench frame with four indexed countdown teeth',
    'meridian crosshair over three meshed Orrery rings',
    'raised index tooth beside a boxed plus-one register',
    'punched-paper loop with ten numbered apertures',
  ] as const
  const movements = [
    'Four teeth index toward a fixed service mark.',
    'Three geared rings meet one labeled meridian.',
    'One extra tooth rises, holds for inspection, then enters or banks.',
    'Ten stored apertures pass the reading gate once.',
  ] as const
  const stateMotion = motion('mechanical', movements[index], signal.activeDurationMs)
  return {
    id: `u4-object-signal-${signal.id}`,
    sourceKind: 'omen',
    sourceId: signal.id,
    phenomenon: signal.description,
    purpose: signal.preparation,
    screenZone: index === 1 ? 'far' : 'near',
    salience: 'interactive',
    material: index === 3 ? ['punched paper', 'inked steel'] : ['brass', 'blued steel'],
    silhouette: silhouettes[index],
    motion: stateMotion,
    reducedMotionState: visualState(`${signal.name} fixed forecast state.`, `${silhouettes[index]} with remaining-time text`, ['brass', 'clock glass'], motion('still', 'Numbered static stages preserve the schedule.'), 'single'),
    lowQualityState: visualState(`${signal.name} simplified forecast state.`, silhouettes[index], ['brass'], motion('still', 'One complete hit target and countdown label remain.'), 'single'),
    overlapGroup: 'u4-maintenance-signals',
    canOverlapWith: [],
    minimumHeartDistance: 1.4,
    priorityWhilePanelOpen: 'emphasize',
    audioCue: signal.audioCue,
  }
}

export const CLOCKWORK_SIGNAL_OBJECTS = CLOCKWORK_MAINTENANCE_SIGNALS.map((_, index) => signalObject(index)) as unknown as FourTuple<WorldObjectManifest>

export const CLOCKWORK_SIGNAL_OMENS = CLOCKWORK_MAINTENANCE_SIGNALS.map((signal, index): OmenDef => ({
  id: signal.id,
  name: signal.name,
  description: signal.description,
  spawn: {
    mode: 'scheduled',
    scheduleMs: signal.periodMs,
    oddsVisibleAfterDiscovery: true,
  },
  rewards: [{
    id: `${signal.id}-reward`,
    description: signal.rewardDescription,
    exclusivePermanentPower: false,
    effects: signal.effects,
  }],
  object: CLOCKWORK_SIGNAL_OBJECTS[index],
  accessibilityLabel: `${signal.name}. ${signal.nonColorShape}. ${signal.preparation}`,
})) as unknown as AtLeastFour<OmenDef>

export const CLOCKWORK_BEACON_OBJECT: WorldObjectManifest = {
  id: 'u4-object-regulator-beacon',
  sourceKind: 'beacon',
  sourceId: 'u4-clockwork-beacon',
  phenomenon: 'The Great Regulator transmitting one stable interval into the Dark Between.',
  purpose: 'Proves the Unwound City can continue its schedules without the player sustaining it.',
  screenZone: 'horizon',
  salience: 'milestone',
  material: ['white clock glass', 'brass regulator frame', 'Wayfinder steel'],
  silhouette: 'open regulator frame enclosing one forward-pointing meridian hand',
  motion: motion('mechanical', 'One complete city cycle advances the meridian hand by one visible interval.', 15_000),
  reducedMotionState: visualState('Clockwork Beacon fixed interval.', 'open regulator frame with four numbered meridian positions', ['white clock glass', 'brass'], motion('still', 'Four fixed positions preserve Beacon timing.'), 'single'),
  lowQualityState: visualState('Clockwork Beacon simplified interval.', 'regulator frame and one meridian hand', ['white clock glass'], motion('still', 'One outlined Beacon frame remains.'), 'single'),
  overlapGroup: 'u4-beacon',
  canOverlapWith: ['u4-route-lines'],
  minimumHeartDistance: 2.2,
  priorityWhilePanelOpen: 'hold',
  audioCue: 'clockwork-beacon-answer',
}

export const CLOCKWORK_BEACON: BeaconDef = {
  id: 'u4-clockwork-beacon',
  canonicalName: 'Beacon',
  localName: 'The Continuing Interval',
  requirement: {
    sourceKind: 'generator',
    sourceId: 'u4-great-regulator',
    target: 1,
    description: 'Build The Great Regulator once; the final Kindling is not consumed.',
  },
  darkBetweenReward: 3,
  object: CLOCKWORK_BEACON_OBJECT,
  mapSilhouette: 'open regulator frame crossed by one forward meridian hand',
}
