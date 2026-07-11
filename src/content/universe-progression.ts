import type { ChallengeDef } from './challenges'
import type { StarNode } from './constellation'
import type { DeepUpgrade } from './deep'
import type { RepeatableWork } from './repeatables'
import { vesselPartForUniverse, type VesselPartDef } from './vessel'
import type { UniversePack } from './universes/types'
import { localizedChallengeCopy, type ChallengeDisplayCopy } from './challenge-language'

export interface ProgressionCopy {
  name: string
  flavor: string
  effect?: string
}

export interface VesselPartCopy extends ProgressionCopy {
  requirement: string
  action: string
}

export interface ObservatoryIdentity {
  overline: string
  title: string
  mapTitle: string
  trialWait: string
  firstText: string
  needsText: string
  readyText: string
  warningText: string
  collapseName: string
  goText: string
  ownedText: string
  eternalEyebrow: string
  eternalTitle: string
  eternalIntro: string
  eternalEmpty: string
  workVerb: string
  nodes?: Record<string, ProgressionCopy>
  nodePositions?: Record<string, { x: number; y: number }>
  works?: Record<string, ProgressionCopy>
}

export interface DeepIdentity {
  overline: string
  title: string
  trialWait: string
  gatherText: string
  readyText: string
  warningText: string
  collapseName: string
  goText: string
  worksTitle: string
  recursiveEyebrow: string
  recursiveTitle: string
  recursiveIntro: string
  recursiveEmpty: string
  workVerb: string
  trialsTitle: string
  trialsNote: string
  circleNames: [string, string]
  circleNotes: [string, string]
  toastTitle: string
  toastBody: string
  upgrades?: Record<string, ProgressionCopy>
  works?: Record<string, ProgressionCopy>
  challenges?: Record<string, ProgressionCopy>
}

export interface UniverseProgressionIdentity {
  observatory: ObservatoryIdentity
  deep: DeepIdentity
}

const EMBERLIGHT_PROGRESSION: UniverseProgressionIdentity = {
  observatory: {
    overline: 'emberlight · the sky after an ending',
    title: 'The Observatory',
    mapTitle: 'The Constellation',
    trialWait: 'A trial is underway — the sky waits until it ends.',
    firstText: 'When your {currency} has been vast enough, you may let this universe collapse — and keep the stardust.',
    needsText: 'The next collapse needs more {currency}.',
    readyText: 'Collapse everything. Begin again, brighter.',
    warningText: 'All {currency}, generators, and upgrades return to the dark. Stardust is forever.',
    collapseName: 'Supernova',
    goText: 'Let go',
    ownedText: 'drawn into your sky',
    eternalEyebrow: 'after the final constellation',
    eternalTitle: 'The Eternal Observatory',
    eternalIntro: 'These works consume unspent Stardust. Their ranks survive Supernovas and fold away only during a Deep Collapse.',
    eternalEmpty: 'Complete every constellation node. When the sky has no empty place left, Stardust can be drawn into repeatable works.',
    workVerb: 'draw',
  },
  deep: {
    overline: 'below the last light',
    title: 'The Deep',
    trialWait: 'A trial is underway. The deep waits.',
    gatherText: 'Gather stardust; the deep takes eras whole.',
    readyText: 'Fold the era. Stardust, constellation, everything — for ◉.',
    warningText: 'Your stardust, every constellation star, and the era’s {currency} are all taken. Singularities — and everything they buy — are forever.',
    collapseName: 'Deep Collapse',
    goText: 'Fold it all',
    worksTitle: 'Singularity works',
    recursiveEyebrow: 'beyond the finished market',
    recursiveTitle: 'The Recursive Works',
    recursiveIntro: 'Singularities can be compressed repeatedly. These ranks survive every Deep Collapse and end only with Remembrance.',
    recursiveEmpty: 'Acquire every Singularity work first. Once the market is complete, the Deep begins offering ranks instead of endings.',
    workVerb: 'compress',
    trialsTitle: 'Trials of the Deep',
    trialsNote: 'rules rehearsed until they become power',
    circleNames: ['The First Circle', 'The Inner Horizon'],
    circleNotes: ['the laws that break a young universe', 'compound laws for a universe that remembers'],
    toastTitle: 'The Deep opens',
    toastBody: 'an era, folded into your hand',
  },
}

const TIDEFALL_PROGRESSION: UniverseProgressionIdentity = {
  observatory: {
    overline: 'tidefall · currents remembered as stars',
    title: 'The Moonless Chart',
    mapTitle: 'The Current Chart',
    trialWait: 'A pressure trial is underway — the chart holds its breath.',
    firstText: 'When the moonless sea holds enough {currency}, release the whole tide into the dark. What settles becomes Moon Salt.',
    needsText: 'The next Undertow needs a higher tide of {currency}.',
    readyText: 'Let the moonless sea rise through its own sky. Begin again at low tide.',
    warningText: 'Every current, creature, and law sinks beyond the chart. Moon Salt alone washes back.',
    collapseName: 'Undertow',
    goText: 'Release the tide',
    ownedText: 'set into the current',
    eternalEyebrow: 'after the last current closes',
    eternalTitle: 'The Returning Ocean',
    eternalIntro: 'These soundings consume unspent Moon Salt. Their depth survives Undertows and is washed clean only by a Hadal Descent.',
    eternalEmpty: 'Complete every current-chart node. Once every route meets the Moonless Crown, Moon Salt can be sounded into returning currents.',
    workVerb: 'sound',
    nodePositions: {
      'forge-1': { x: 16, y: 52 }, 'forge-2': { x: 24, y: 39 }, 'forge-3': { x: 38, y: 31 },
      'hand-1': { x: 84, y: 52 }, 'hand-2': { x: 76, y: 39 }, 'hand-3': { x: 62, y: 31 },
      'sky-1': { x: 50, y: 9 }, 'sky-2': { x: 31, y: 16 }, 'sky-3': { x: 69, y: 16 },
      'root-1': { x: 50, y: 65 }, 'root-2': { x: 32, y: 62 }, 'root-3': { x: 68, y: 62 },
      corona: { x: 50, y: 39 },
    },
    nodes: {
      'forge-1': { name: 'First Spring', flavor: 'The smallest upward current finds a way.' },
      'forge-2': { name: 'Twin Currents', flavor: 'One rises because the other remembers falling.' },
      'forge-3': { name: 'Reef Foundry', flavor: 'Production grows sideways, alive with color.' },
      'hand-1': { name: 'Tide’s Reach', flavor: 'The water leans into the hand that tends it.' },
      'hand-2': { name: 'Undertow Palm', flavor: 'Your touch arrives twice: once at the surface, once below.' },
      'hand-3': { name: 'Current Conductor', flavor: 'The sea begins keeping time with you.' },
      'sky-1': { name: 'Open Surface', flavor: 'Leave one patch of water unguarded. Blessings rise through it.' },
      'sky-2': { name: 'Long Drift', flavor: 'A wandering bubble learns not to hurry.' },
      'sky-3': { name: 'Bloom Season', flavor: 'One omen opens and another follows.' },
      'root-1': { name: 'Deep Pool', flavor: 'What settles overnight returns luminous.' },
      'root-2': { name: 'Patient Tide', flavor: 'It can wait longer than any shore.' },
      'root-3': { name: 'Droplet Memory', flavor: 'Some water refuses to forget the ocean.' },
      corona: { name: 'Moonless Crown', flavor: 'The tide needs no moon once it remembers the pull.' },
    },
    works: {
      'continuing-corona': {
        name: 'The Continuing Current',
        flavor: 'The chart has no final shore—only another route returning inward.',
        effect: 'all production ×1.30 per sounding this hadal era',
      },
      'parallax-engine': {
        name: 'Sounding Engine',
        flavor: 'Every ending teaches the sea to measure the next depth sooner.',
        effect: 'Moon Salt gain +15% per sounding this hadal era',
      },
    },
  },
  deep: {
    overline: 'below the last mapped current',
    title: 'The Hadal Archive',
    trialWait: 'A pressure trial is underway. The trench keeps its distance.',
    gatherText: 'Gather Moon Salt; the Black Mouth accepts only complete tides.',
    readyText: 'Lower the whole era beyond the final sounding. Pressure will return it as ◉.',
    warningText: 'Your Moon Salt, every current-chart node, and the era’s {currency} pass below the Black Mouth. Singularities return carrying the pressure.',
    collapseName: 'Hadal Descent',
    goText: 'Descend beyond sound',
    worksTitle: 'Pressure laws',
    recursiveEyebrow: 'where the trench turns inward',
    recursiveTitle: 'The Returning Trench',
    recursiveIntro: 'Singularities become pressure-seeds. Each layer survives every Hadal Descent and opens only when Remembrance drains the sea.',
    recursiveEmpty: 'Recover every Pressure Law first. When the Hadal Archive is complete, the trench begins returning deeper versions of itself.',
    workVerb: 'lower',
    trialsTitle: 'Pressure Trials',
    trialsNote: 'depths endured until the body remembers them as strength',
    circleNames: ['The Shelf Waters', 'The Hadal Ring'],
    circleNotes: ['laws that break against the first descent', 'laws that survive where surface glow cannot follow'],
    toastTitle: 'The Trench opens',
    toastBody: 'an ocean, pressed into one impossible pearl',
    upgrades: {
      'auto-kindler': { name: 'Current Tender', flavor: 'A patient hand made from pressure and brass.', effect: 'automatically gathers the most efficient kindling, every 2s' },
      'auto-stoker': { name: 'Reef Scribe', flavor: 'It reads the shoal and records the obvious next law.', effect: 'automatically inscribes the cheapest available upgrade, every 2s' },
      'nova-engine': { name: 'Ebb Engine', flavor: 'Every tide learns when to leave.', effect: 'automatically triggers Undertow when the Moon Salt gain reaches your threshold' },
      'dawn-memory': { name: 'Tide Memory', flavor: 'Some waters refuse to be emptied.', effect: 'every return to low tide begins with 40 {spark} and 5 {wisp}' },
      'event-horizon': { name: 'The Black Mouth', flavor: 'Nothing escapes. Value returns as pressure.', effect: 'Moon Salt gain ×2' },
      'deep-resonance': { name: 'Hadal Resonance', flavor: 'The ocean floor has begun humming back.', effect: 'all glow ×2, forever, everywhere' },
    },
    works: {
      'worldseed-compression': {
        name: 'Pearlseed Compression',
        flavor: 'An entire ocean folded around one bright irritation.',
        effect: 'all production ×2 per layer until remembrance',
      },
      'recursive-abyss': {
        name: 'The Recursive Trench',
        flavor: 'Every bottom opens onto the pressure remembered below it.',
        effect: 'Hadal Descent yield +25% per layer until remembrance',
      },
    },
    challenges: {
      silence: { name: 'The Stillwater', flavor: 'No rhythm crosses water that has forgotten how to move.' },
      entropy: { name: 'Salt Debt', flavor: 'Everything carried by the current leaves something behind.' },
      'bare-hands': { name: 'Open Water', flavor: 'Before the first droplet, there was only your hand and depth.' },
      drought: { name: 'The Empty Current', flavor: 'A sea with nothing left to send upward.' },
      'half-light': { name: 'Crushing Depth', flavor: 'Production thins as the pressure becomes a world of its own.' },
      swarm: { name: 'The Shoal', flavor: 'No great body. Only small lights agreeing to move together.' },
      'glass-ceiling': { name: 'The Surface Seal', flavor: 'The sea allows breadth but refuses another layer.' },
      'ashen-touch': { name: 'Numb Current', flavor: 'Your hand remembers how cold the deepest water can become.' },
      unwritten: { name: 'The Uncharted', flavor: 'No law survives long enough to become a map.' },
      'broken-ladder': { name: 'Broken Sounding', flavor: 'Every second depth-marker returns without its line.' },
      'single-voice': { name: 'The Deepest Voice', flavor: 'Only the lowest call can be heard through all that pressure.' },
      'small-vessels': { name: 'Tidepools', flavor: 'The whole ocean, remembered by ten of everything.' },
    },
  },
}

const VERDANCE_PROGRESSION: UniverseProgressionIdentity = {
  observatory: {
    ...EMBERLIGHT_PROGRESSION.observatory,
    overline: 'verdance · every ending opens the canopy',
    title: 'The Growth Rings',
    mapTitle: 'The Living Canopy',
    trialWait: 'A shade trial is underway — the grove keeps its ring open.',
    firstText: 'When this season holds enough {currency}, prune the living world with care. What the roots retain becomes Memory Seeds.',
    needsText: 'The next Pruning needs a fuller season of {currency}.',
    readyText: 'Release the oldest growth. Let light reach the next seed.',
    warningText: 'Sap, current Kindlings, and ordinary grafts return to the soil. Memory Seeds and every preserved ring remain.',
    collapseName: 'Pruning',
    goText: 'Open the canopy',
    ownedText: 'grown into the canopy',
    eternalEyebrow: 'after the canopy learns release',
    eternalTitle: 'The Perennial Grove',
    eternalIntro: 'These living works consume unspent Memory Seeds. Their rings survive Prunings and return to soil only in a Root Descent.',
    eternalEmpty: 'Complete the living canopy. Once every branch can release its oldest growth, Memory Seeds can establish perennial works.',
    workVerb: 'graft',
    nodes: {
      'forge-1': { name: 'First Root', flavor: 'The smallest root makes one irreversible choice.' },
      'forge-2': { name: 'Twin Cotyledons', flavor: 'Two first leaves divide the work of becoming.' },
      'forge-3': { name: 'Graft Nursery', flavor: 'Difference becomes strength where living edges meet.' },
      'hand-1': { name: 'Tending Hand', flavor: 'Care is attention without ownership.' },
      'hand-2': { name: 'Cambium Touch', flavor: 'One deliberate cut teaches the branch where to heal.' },
      'hand-3': { name: 'Gardener’s Rhythm', flavor: 'The grove learns the cadence of patient work.' },
      'sky-1': { name: 'Canopy Gap', flavor: 'Light reaches the lives waiting below the oldest crown.' },
      'sky-2': { name: 'Long Season', flavor: 'Growth that is not hurried can still arrive.' },
      'sky-3': { name: 'Pollinator Flight', flavor: 'Difference travels on wings between distant flowers.' },
      'root-1': { name: 'Seedbank', flavor: 'The future sleeps without becoming a copy.' },
      'root-2': { name: 'Patient Soil', flavor: 'What rests here is not lost.' },
      'root-3': { name: 'Ring Memory', flavor: 'Every hard season becomes structure.' },
      corona: { name: 'World-Tree Crown', flavor: 'The whole canopy opens one flower toward the Dark Between.' },
    },
    works: {
      'continuing-corona': { name: 'The Continuing Canopy', flavor: 'Every released branch opens another place for light.', effect: 'all production ×1.30 per graft this root era' },
      'parallax-engine': { name: 'Succession Garden', flavor: 'Each ending teaches the seedbank what the next forest may try.', effect: 'Memory Seed gain +15% per graft this root era' },
    },
  },
  deep: {
    ...EMBERLIGHT_PROGRESSION.deep,
    overline: 'below the oldest remembered root',
    title: 'The Root Below',
    trialWait: 'A shade trial is underway. The deep roots wait.',
    gatherText: 'Gather Memory Seeds; the Root Below accepts complete forests.',
    readyText: 'Return the era to its first soil. Its whole ecology will condense into ◉.',
    warningText: 'Memory Seeds, canopy paths, and the era’s {currency} become deep soil. Singularities preserve what the next forest needs.',
    collapseName: 'Root Descent',
    goText: 'Return to first soil',
    worksTitle: 'Root laws',
    recursiveEyebrow: 'where every root becomes a seed',
    recursiveTitle: 'The Recursive Seedbank',
    recursiveIntro: 'Singularities can be planted as deeper laws. Their rings survive every Root Descent until Remembrance.',
    recursiveEmpty: 'Recover every Root Law first. The seedbank opens again only when a complete ecology can disagree with itself.',
    workVerb: 'plant',
    trialsTitle: 'Trials of Shade',
    trialsNote: 'conditions endured until adaptation becomes inheritance',
    circleNames: ['The Understory', 'The Root Horizon'],
    circleNotes: ['laws learned beneath the first canopy', 'laws carried below the reach of seasons'],
    toastTitle: 'The Root Below opens',
    toastBody: 'a forest, returned to possibility',
    upgrades: {
      'auto-kindler': { name: 'Root Tender', flavor: 'A patient root finds the next viable seed.', effect: 'automatically plants the most efficient Kindling, every 2s' },
      'auto-stoker': { name: 'Graft Scribe', flavor: 'Mycelium records the next useful living refinement.', effect: 'automatically inscribes the cheapest available graft, every 2s' },
      'nova-engine': { name: 'Pruning Hand', flavor: 'The grove learns to release growth at the chosen threshold.', effect: 'automatically triggers Pruning at your Memory Seed threshold' },
      'dawn-memory': { name: 'Seed Memory', flavor: 'The first soil remembers how the prior forest began.', effect: 'every new season begins with 40 {spark} and 5 {wisp}' },
      'event-horizon': { name: 'Root Mouth', flavor: 'What enters the deepest soil returns as possibility.', effect: 'Memory Seed gain ×2' },
      'deep-resonance': { name: 'Rhizome Resonance', flavor: 'Every world-root has begun answering the others.', effect: 'all sap ×2, forever, everywhere' },
    },
    works: {
      'worldseed-compression': { name: 'Seedbank Compression', flavor: 'A whole ecology folded into one viable disagreement.', effect: 'all production ×2 per layer until remembrance' },
      'recursive-abyss': { name: 'The Recursive Root', flavor: 'Every deepest root becomes the first root of another forest.', effect: 'Root Descent yield +25% per layer until remembrance' },
    },
    challenges: {
      silence: { name: 'Still Canopy', flavor: 'The grove must keep time after every wing and leaf falls quiet.' },
      entropy: { name: 'Nutrient Debt', flavor: 'Every harvest must leave enough soil for what follows.' },
      'bare-hands': { name: 'Bare Soil', flavor: 'Before the first root, there is only touch and possibility.' },
      drought: { name: 'Drought Ring', flavor: 'A hard season must become structure rather than erasure.' },
      'half-light': { name: 'Deep Shade', flavor: 'The understory learns to grow beneath a perfect crown.' },
      swarm: { name: 'Seedling Commons', flavor: 'Small lives cooperate before any great trunk exists.' },
      'glass-ceiling': { name: 'Canopy Seal', flavor: 'Breadth continues where height has been denied.' },
      'ashen-touch': { name: 'Numb Root', flavor: 'The first signal arrives weakened but still alive.' },
      unwritten: { name: 'Wild Graft', flavor: 'Growth proceeds without an approved catalogue.' },
      'broken-ladder': { name: 'Broken Succession', flavor: 'Every second layer of the ecology is missing.' },
      'single-voice': { name: 'Monoculture', flavor: 'One dominant life must carry a world that needs difference.' },
      'small-vessels': { name: 'Bonsai World', flavor: 'A complete ecology held inside ten of everything.' },
    },
  },
}

const CLOCKWORK_PROGRESSION: UniverseProgressionIdentity = {
  observatory: {
    ...EMBERLIGHT_PROGRESSION.observatory,
    overline: 'clockwork · every interval remains inspectable',
    title: 'The Regulator Hall',
    mapTitle: 'The Transmission Diagram',
    trialWait: 'A maintenance trial is underway — the regulator holds its marked position.',
    firstText: 'When the civic train has transmitted enough {currency}, rewind the interval. Its perfected tension becomes Mainsprings.',
    needsText: 'The next Rewinding requires a longer transmitted interval of {currency}.',
    readyText: 'Release the train, seal its exact timing, and restart the Heart.',
    warningText: 'Ticks, present machines, and ordinary patents return to their initial positions. Mainsprings and inspected systems remain.',
    collapseName: 'Rewinding',
    goText: 'Release the mainspring',
    ownedText: 'locked into the train',
    eternalEyebrow: 'after the final route is inspected',
    eternalTitle: 'The Continuing Works',
    eternalIntro: 'These civic works consume unspent Mainsprings. Their ranks survive Rewindings and stop only at a Zero Interval.',
    eternalEmpty: 'Complete the Transmission Diagram. Once every route declares its input and output, Mainsprings can power continuing works.',
    workVerb: 'route',
    nodes: {
      'forge-1': { name: 'First Tooth', flavor: 'One useful engagement proves that work was transmitted.' },
      'forge-2': { name: 'Meshed Pair', flavor: 'Direction becomes a relationship between two exact edges.' },
      'forge-3': { name: 'Relay Works', flavor: 'A civic train carries force farther than one wheel can reach.' },
      'hand-1': { name: 'Winding Key', flavor: 'Intention enters the machine through a declared socket.' },
      'hand-2': { name: 'Escapement Touch', flavor: 'Continuous tension becomes one inspectable interval.' },
      'hand-3': { name: 'Master Clockmaker', flavor: 'The hand knows when precision should yield to care.' },
      'sky-1': { name: 'Open Schedule', flavor: 'One future remains visible without becoming compulsory.' },
      'sky-2': { name: 'Long Interval', flavor: 'The mechanism keeps time across an unattended shift.' },
      'sky-3': { name: 'Maintenance Window', flavor: 'A forecast becomes useful when it leaves room to prepare.' },
      'root-1': { name: 'Reserve Spring', flavor: 'Stored torque waits behind an honest load mark.' },
      'root-2': { name: 'Banked Tick', flavor: 'One unused interval remains available by choice.' },
      'root-3': { name: 'Recall Cam', flavor: 'The best completed shift becomes a visible profile.' },
      corona: { name: 'Great Regulator', flavor: 'Every civic train resolves into one controlled release.' },
    },
    works: {
      'continuing-corona': { name: 'The Continuing Train', flavor: 'Every complete route leaves one more useful output socket.', effect: 'all production ×1.30 per route this zeroed era' },
      'parallax-engine': { name: 'Forecast Engine', flavor: 'Each ending gives the city a more inspectable next schedule.', effect: 'Mainspring gain +15% per route this zeroed era' },
    },
  },
  deep: {
    ...EMBERLIGHT_PROGRESSION.deep,
    overline: 'beneath the city’s stopped second',
    title: 'The Zero Interval',
    trialWait: 'A maintenance trial is underway. The zero interval remains held.',
    gatherText: 'Gather Mainsprings; the Zero Interval accepts whole civic schedules.',
    readyText: 'Stop the era at its exact meridian. Every route will compress into ◉.',
    warningText: 'Mainsprings, Transmission Diagram routes, and the era’s {currency} enter the stopped interval. Singularities preserve the inspected cause.',
    collapseName: 'Zeroing',
    goText: 'Hold the final tick',
    worksTitle: 'Causal works',
    recursiveEyebrow: 'after the machine predicts itself',
    recursiveTitle: 'The Recursive Engine',
    recursiveIntro: 'Singularities become indexed causes. Their ranks survive every Zeroing until Remembrance clears the schedule.',
    recursiveEmpty: 'Acquire every Causal Work. The engine begins repeating only when the final route remains deliberately open.',
    workVerb: 'index',
    trialsTitle: 'Maintenance Trials',
    trialsNote: 'deterministic failures rehearsed until their remedies become law',
    circleNames: ['The Power Train', 'The Causal Train'],
    circleNotes: ['laws governing useful transmission', 'laws governing choice inside prediction'],
    toastTitle: 'The Zero Interval opens',
    toastBody: 'a city, held between two ticks',
    upgrades: {
      'auto-kindler': { name: 'Automatic Oiler', flavor: 'A service arm attends the most efficient train.', effect: 'automatically installs the most efficient Kindling, every 2s' },
      'auto-stoker': { name: 'Patent Clerk', flavor: 'It indexes the next affordable refinement without hiding the formula.', effect: 'automatically files the cheapest available upgrade, every 2s' },
      'nova-engine': { name: 'Rewinding Governor', flavor: 'The interval releases only at the declared Mainspring threshold.', effect: 'automatically triggers Rewinding at your Mainspring threshold' },
      'dawn-memory': { name: 'Start-State Register', flavor: 'The machine preserves an inspected beginning.', effect: 'every restart begins with 40 {spark} and 5 {wisp}' },
      'event-horizon': { name: 'Zero Escapement', flavor: 'No useful interval escapes uncounted.', effect: 'Mainspring gain ×2' },
      'deep-resonance': { name: 'Causal Resonance', flavor: 'Every world-machine transmits through the same silent bearing.', effect: 'all ticks ×2, forever, everywhere' },
    },
    works: {
      'worldseed-compression': { name: 'City-State Compression', flavor: 'An entire civic schedule sealed inside one indexed cause.', effect: 'all production ×2 per layer until remembrance' },
      'recursive-abyss': { name: 'The Recursive Engine', flavor: 'Every complete output becomes another machine’s declared input.', effect: 'Zeroing yield +25% per layer until remembrance' },
    },
    challenges: {
      silence: { name: 'Silent Shift', flavor: 'The schedule must remain legible when every bell is muted.' },
      entropy: { name: 'Backlash Tax', flavor: 'Each poor mesh charges the future for a present error.' },
      'bare-hands': { name: 'Hand-Wound', flavor: 'The civic train begins without autonomous power.' },
      drought: { name: 'Missed Service', flavor: 'The forecast arrives but its maintenance signal does not.' },
      'half-light': { name: 'Reduced Torque', flavor: 'One tenth of the designed force must carry the shift.' },
      swarm: { name: 'First Train Only', flavor: 'The three smallest mechanisms support every district.' },
      'glass-ceiling': { name: 'Socket Limit', flavor: 'No private inventory may hide unbounded scale.' },
      'ashen-touch': { name: 'Blunt Tooth', flavor: 'The Heart engages without its expected leverage.' },
      unwritten: { name: 'Unpatented', flavor: 'The city rebuilds without consulting ordinary refinements.' },
      'broken-ladder': { name: 'Broken Sequence', flavor: 'Every second transmission shaft is absent.' },
      'single-voice': { name: 'Single Shaft', flavor: 'Only the highest installed machine may transmit work.' },
      'small-vessels': { name: 'Ten of Everything', flavor: 'The Great Regulator must emerge from a bounded city.' },
    },
  },
}

function futureProgression(config: {
  overline: string
  observatoryTitle: string
  mapTitle: string
  currency: string
  epoch: string
  matter: string
  epochCopy: {
    firstText: string
    needsText: string
    readyText: string
    warningText: string
    goText: string
  }
  deepTitle: string
  deepVerb: string
  trialsTitle: string
  circleNames: [string, string]
  nodes: Record<string, ProgressionCopy>
  works: Record<string, ProgressionCopy>
  deepUpgrades: Record<string, ProgressionCopy>
  deepWorks: Record<string, ProgressionCopy>
  challenges: Record<string, ProgressionCopy>
}): UniverseProgressionIdentity {
  const mapName = config.mapTitle.replace(/^The /, '')
  return {
    observatory: {
      ...EMBERLIGHT_PROGRESSION.observatory,
      overline: config.overline,
      title: config.observatoryTitle,
      mapTitle: config.mapTitle,
      trialWait: `A local trial is underway — ${config.observatoryTitle} holds its current state.`,
      firstText: config.epochCopy.firstText,
      needsText: config.epochCopy.needsText,
      readyText: config.epochCopy.readyText,
      warningText: config.epochCopy.warningText,
      collapseName: config.epoch,
      goText: config.epochCopy.goText,
      ownedText: `preserved as ${config.matter}`,
      eternalEyebrow: `after the first ${config.epoch}`,
      eternalTitle: `The Continuing ${mapName}`,
      eternalIntro: `These works consume unspent ${config.matter}. Their ranks survive ${config.epoch} and fold only at the local Deep boundary.`,
      eternalEmpty: `Complete ${config.mapTitle}. Its finished relationships open repeatable ${config.matter} works.`,
      workVerb: config.epochCopy.goText.toLowerCase(),
      nodes: config.nodes,
      works: config.works,
    },
    deep: {
      ...EMBERLIGHT_PROGRESSION.deep,
      overline: `beneath ${config.overline.split(' · ')[0]}`,
      title: config.deepTitle,
      trialWait: `A local trial is underway. ${config.deepTitle} waits.`,
      gatherText: `Gather ${config.matter}; ${config.deepTitle} accepts complete epochs.`,
      readyText: `Compress the finished ${config.currency} era into ◉.`,
      warningText: `${config.matter}, the local build map, and the era’s {currency} enter ${config.deepTitle}. Singularities and deeper records remain.`,
      collapseName: config.deepTitle,
      goText: config.deepVerb,
      worksTitle: `${config.deepTitle} works`,
      recursiveEyebrow: 'after the local law learns recursion',
      recursiveTitle: `The Recursive ${config.deepTitle}`,
      recursiveIntro: `Singularities repeat the local law without erasing its authored constraints.`,
      recursiveEmpty: `Acquire every local Deep work before recursion begins.`,
      workVerb: config.deepVerb.toLowerCase(),
      trialsTitle: config.trialsTitle,
      trialsNote: 'historical failures rehearsed until another strategy becomes possible',
      circleNames: config.circleNames,
      circleNotes: ['the foundational form of the local law', 'the civilization’s failure transformed into a tool'],
      toastTitle: `${config.deepTitle} opens`,
      toastBody: 'one authored world law, compressed without becoming generic',
      upgrades: config.deepUpgrades,
      works: config.deepWorks,
      challenges: config.challenges,
    },
  }
}

const PRISMATA_PROGRESSION = futureProgression({
  overline: 'brahmalok · every first form keeps a margin',
  observatoryTitle: 'The Recomposition Court',
  mapTitle: 'The Fourfold Manuscript',
  currency: 'Possibility',
  epoch: 'Recomposition',
  matter: 'Folios',
  epochCopy: {
    firstText: 'When seed, measure, name, and form can answer one another, preserve their relation as a Folio and return the current forms to possibility.',
    needsText: 'This mandala has not held enough {currency} to bind another Folio. Keep every direction answerable and the center open.',
    readyText: 'The four directions are aligned. Release their present bodies and preserve the revisable relation.',
    warningText: 'Possibility, present Kindlings, and ordinary refinements return to the open center. Folios, mandala routes, Archives, and deeper laws remain.',
    goText: 'Recompose the folio',
  },
  deepTitle: 'The Unwritten Margin',
  deepVerb: 'Enter the open margin',
  trialsTitle: 'Trials of First Form',
  circleNames: ['The Four Questions', 'The Open Future'],
  nodes: {
    'forge-1': { name: 'Seed Question', flavor: 'Possibility enters without an assigned body.' },
    'forge-2': { name: 'Reciprocal Measure', flavor: 'A proportion changes when the life it measures changes.' },
    'forge-3': { name: 'Fourfold Workshop', flavor: 'Seed, measure, name, and form share responsibility for what appears.' },
    'hand-1': { name: 'Reed Touch', flavor: 'One deliberate mark opens a route without claiming the page.' },
    'hand-2': { name: 'Clay Palm', flavor: 'The gesture leaves weight and texture while preserving revision.' },
    'hand-3': { name: 'Margin Keeper', flavor: 'The hand knows when to stop writing and leave room to answer.' },
    'sky-1': { name: 'Unwritten Leaf', flavor: 'An unfamiliar beginning is invited without classification.' },
    'sky-2': { name: 'Long Manuscript', flavor: 'Quiet margins keep gathering revisions while unattended.' },
    'sky-3': { name: 'Dawn Calendar', flavor: 'New beginnings arrive as a readable cycle, never a final date.' },
    'root-1': { name: 'Memory Pool', flavor: 'Earlier revisions remain visible beneath the latest reflection.' },
    'root-2': { name: 'Patient Folio', flavor: 'A delayed answer is still part of the creation field.' },
    'root-3': { name: 'Recomposed Relation', flavor: 'A solved mandala survives without freezing its forms.' },
    corona: { name: 'Open Lotus', flavor: 'Every direction surrounds a center that remains unowned.' },
  },
  works: {
    'continuing-corona': { name: 'The Continuing Folio', flavor: 'Every preserved relation opens another useful beginning.', effect: 'all production ×1.30 per Recomposition this margin era' },
    'parallax-engine': { name: 'Revision Engine', flavor: 'Each Recomposition gives the next mandala a more honest margin.', effect: 'Folio gain +15% per Recomposition this margin era' },
  },
  deepUpgrades: {
    'auto-kindler': { name: 'Seed Tender', flavor: 'The court unfolds the most useful available Kindling.', effect: 'automatically unfolds the most efficient Kindling, every 2s' },
    'auto-stoker': { name: 'Margin Scribe', flavor: 'The manuscript marks the next useful refinement.', effect: 'automatically inscribes the cheapest available law, every 2s' },
    'nova-engine': { name: 'Recomposition Engine', flavor: 'The folio binds only at the declared threshold.', effect: 'automatically triggers Recomposition at your Folio threshold' },
    'dawn-memory': { name: 'First-Page Memory', flavor: 'The new mandala remembers how the prior one began.', effect: 'every new manuscript begins with a measured head start' },
    'event-horizon': { name: 'Unwritten Margin', flavor: 'Open space returns as possibility rather than capacity.', effect: 'Folio gain ×2' },
    'deep-resonance': { name: 'Creative Relation', flavor: 'Every realm answers without becoming raw material.', effect: 'all Possibility ×2, forever, everywhere' },
  },
  deepWorks: {
    'worldseed-compression': { name: 'Folio Compression', flavor: 'A complete mandala folded into one revisable relation.', effect: 'all production ×2 per layer until Remembrance' },
    'recursive-abyss': { name: 'The Recursive Margin', flavor: 'Every completed page preserves another place to answer.', effect: 'Unwritten Margin yield +25% per layer until Remembrance' },
  },
  challenges: {
    silence: { name: 'Unspoken Page', flavor: 'The creation field must remain legible without sound.' },
    entropy: { name: 'Revision Debt', flavor: 'Every careless certainty taxes the forms that follow.' },
    'bare-hands': { name: 'First Mark', flavor: 'The manuscript begins without autonomous production.' },
    drought: { name: 'Dry Ink', flavor: 'Stored marginal memory must carry an interrupted current.' },
    'half-light': { name: 'Faint Dawn', flavor: 'A reduced signal must preserve every creation direction.' },
    swarm: { name: 'First Forms Only', flavor: 'Only the earliest Kindlings may carry the whole mandala.' },
    'glass-ceiling': { name: 'Bounded Folio', flavor: 'Variation continues inside a strict ownership limit.' },
    'ashen-touch': { name: 'Soft Reed', flavor: 'The Lotus answers a deliberately softened gesture.' },
    unwritten: { name: 'Unruled Page', flavor: 'No saved mode may decide the next creation.' },
    'broken-ladder': { name: 'Missing Directions', flavor: 'Every second Kindling tier is absent.' },
    'single-voice': { name: 'One Question', flavor: 'One source must prove that relation still matters.' },
    'small-vessels': { name: 'Pocket Manuscript', flavor: 'A complete mandala is held inside ten of everything.' },
  },
})

const TEMPEST_PROGRESSION = futureProgression({
  overline: 'tempest · every path leaves evidence',
  observatoryTitle: 'The Grounding Field',
  mapTitle: 'The Storm Map',
  currency: 'Charge',
  epoch: 'Grounding',
  matter: 'Fulgurites',
  epochCopy: {
    firstText: 'When the sky can no longer hold its useful difference, choose the ground. The declared path will cool into Fulgurites.',
    needsText: 'The pressure wall needs more {currency} before another path can survive as glass.',
    readyText: 'The leader has reached the ground mark. Release the weather through the route you chose.',
    warningText: 'Charge, present storm cells, and ordinary refinements return to calm. Fulgurites, saved paths, Archives, and deeper laws remain.',
    goText: 'Complete the path',
  },
  deepTitle: 'The Quiet Eye',
  deepVerb: 'Cross the eye wall',
  trialsTitle: 'Trials of Release',
  circleNames: ['The Pressure Wall', 'The Final Climate'],
  nodes: {
    'forge-1': { name: 'First Gradient', flavor: 'A useful difference appears between two measured points.' },
    'forge-2': { name: 'Coupled Cells', flavor: 'Pressure becomes weather when neighboring volumes answer.' },
    'forge-3': { name: 'Front Foundry', flavor: 'A planetary circulation carries local work across the horizon.' },
    'hand-1': { name: 'Leader Touch', flavor: 'Intention gives the branching path its next candidate.' },
    'hand-2': { name: 'Static Palm', flavor: 'A dry snap joins separated regions without hiding the route.' },
    'hand-3': { name: 'Path Conductor', flavor: 'The hand knows when stored potential should become consequence.' },
    'sky-1': { name: 'Open Cell', flavor: 'The atmosphere leaves room for an unfamiliar formation.' },
    'sky-2': { name: 'Long Forecast', flavor: 'Circulation persists across an unattended watch.' },
    'sky-3': { name: 'Sprite Season', flavor: 'High events arrive as a linked forecast instead of a surprise.' },
    'root-1': { name: 'Storm Battery', flavor: 'Separated charge waits behind a visible safety mark.' },
    'root-2': { name: 'Patient Front', flavor: 'Contained pressure remains motion, even while unattended.' },
    'root-3': { name: 'Fulgurite Memory', flavor: 'A completed path survives as glassed evidence.' },
    corona: { name: 'Planetary Dynamo', flavor: 'Every front resolves into one stable auroral column.' },
  },
  works: {
    'continuing-corona': { name: 'The Continuing Climate', flavor: 'Every grounded path leaves another useful pressure route.', effect: 'all production ×1.30 per grounding this quiet era' },
    'parallax-engine': { name: 'Forecast Engine', flavor: 'Each storm makes the next threshold easier to read.', effect: 'Fulgurite gain +15% per grounding this quiet era' },
  },
  deepUpgrades: {
    'auto-kindler': { name: 'Cell Seeder', flavor: 'The dynamo feeds the most efficient connected storm cell.', effect: 'automatically charges the most efficient Kindling, every 2s' },
    'auto-stoker': { name: 'Almanac Relay', flavor: 'The forecast records the next useful atmospheric refinement.', effect: 'automatically records the cheapest available law, every 2s' },
    'nova-engine': { name: 'Grounding Relay', flavor: 'The route fires only at the declared Fulgurite threshold.', effect: 'automatically triggers Grounding at your Fulgurite threshold' },
    'dawn-memory': { name: 'Pressure Memory', flavor: 'The new atmosphere remembers a stable starting gradient.', effect: 'every new climate begins with a bounded head start' },
    'event-horizon': { name: 'Eye Wall', flavor: 'No useful potential crosses the calm center unmeasured.', effect: 'Fulgurite gain ×2' },
    'deep-resonance': { name: 'Planetary Circulation', flavor: 'Every world contributes to a larger weather system.', effect: 'all Charge ×2, forever, everywhere' },
  },
  deepWorks: {
    'worldseed-compression': { name: 'Climate Compression', flavor: 'A planetary circulation sealed inside one readable path.', effect: 'all production ×2 per layer until Remembrance' },
    'recursive-abyss': { name: 'The Recursive Eye', flavor: 'Every calm center opens into another bounded storm.', effect: 'Quiet Eye yield +25% per layer until Remembrance' },
  },
  challenges: {
    silence: { name: 'Silent Pressure', flavor: 'The storm must remain legible when every rumble is muted.' },
    entropy: { name: 'Turbulent Debt', flavor: 'Every inefficient cell taxes the fronts that follow.' },
    'bare-hands': { name: 'Unseeded Sky', flavor: 'The first gradient forms without autonomous weather.' },
    drought: { name: 'Dry Thunder', flavor: 'The discharge path must form without its expected rain.' },
    'half-light': { name: 'Weak Potential', flavor: 'A smaller gradient must still choose a useful route.' },
    swarm: { name: 'Local Cells', flavor: 'Only the first formations may carry a global climate.' },
    'glass-ceiling': { name: 'Pressure Cap', flavor: 'Circulation continues while each cell remains bounded.' },
    'ashen-touch': { name: 'Grounded Hand', flavor: 'The Heart answers through reduced leader influence.' },
    unwritten: { name: 'Unforecast', flavor: 'No saved path may decide where the storm travels.' },
    'broken-ladder': { name: 'Broken Front', flavor: 'Every second atmospheric layer is absent.' },
    'single-voice': { name: 'One Supercell', flavor: 'One dominant storm must carry a world of connected weather.' },
    'small-vessels': { name: 'Storm in Glass', flavor: 'A planetary climate held inside ten of everything.' },
  },
})

const CANTICLE_PROGRESSION = futureProgression({
  overline: 'canticle · every voice leaves room to answer',
  observatoryTitle: 'The Refrain Hall',
  mapTitle: 'The Living Measure',
  currency: 'Resonance',
  epoch: 'Refrain',
  matter: 'Overtones',
  epochCopy: {
    firstText: 'When this movement has carried every answer it can hold, let the final bar close. Its surviving relationships will remain as Overtones.',
    needsText: 'The measure needs more {currency} before its ending can leave a true Overtone.',
    readyText: 'The final beat is sounding. Do not cut it short; leave the rest after it open.',
    warningText: 'Resonance, present voices, and ordinary refinements return to rest. Overtones, measures, Resonant Memory, and deeper laws remain.',
    goText: 'Let the bar resolve',
  },
  deepTitle: 'The Perfect Rest',
  deepVerb: 'Hold the rest',
  trialsTitle: 'Trials of Relationship',
  circleNames: ['The First Measure', 'The Second Voice'],
  nodes: {
    'forge-1': { name: 'First Pulse', flavor: 'One event gives the measure a place to begin.' },
    'forge-2': { name: 'Answering Pair', flavor: 'Two distinct voices share time without becoming unison.' },
    'forge-3': { name: 'Harmonic Loom', flavor: 'Many roles become a movement whose sources remain audible.' },
    'hand-1': { name: 'Opening Strike', flavor: 'The membrane remembers a deliberate and gentle beginning.' },
    'hand-2': { name: 'Syncopated Touch', flavor: 'The hand places emphasis where expectation left room.' },
    'hand-3': { name: 'Second Conductor', flavor: 'The gesture invites an answer instead of demanding imitation.' },
    'sky-1': { name: 'Open Measure', flavor: 'One empty slot remains available to an unfamiliar voice.' },
    'sky-2': { name: 'Long Sustain', flavor: 'A relationship persists across an unattended phrase.' },
    'sky-3': { name: 'Refrain Season', flavor: 'Returning events arrive as variations rather than copies.' },
    'root-1': { name: 'Drone Memory', flavor: 'A sustained voice holds context beneath the active phrase.' },
    'root-2': { name: 'Patient Rest', flavor: 'Silence carries structure while nothing is struck.' },
    'root-3': { name: 'Overtone Memory', flavor: 'The strongest relationship survives the completed measure.' },
    corona: { name: 'Second Voice', flavor: 'The whole choir leaves enough room for an unscripted answer.' },
  },
  works: {
    'continuing-corona': { name: 'The Continuing Measure', flavor: 'Every completed phrase opens another useful rest.', effect: 'all production ×1.30 per refrain this silent era' },
    'parallax-engine': { name: 'Counterpoint Engine', flavor: 'Each ending gives the next voice a clearer entrance.', effect: 'Overtone gain +15% per refrain this silent era' },
  },
  deepUpgrades: {
    'auto-kindler': { name: 'Measure Keeper', flavor: 'The chamber sounds the most useful available role.', effect: 'automatically voices the most efficient Kindling, every 2s' },
    'auto-stoker': { name: 'Score Scribe', flavor: 'The notation marks the next useful refinement.', effect: 'automatically inscribes the cheapest available law, every 2s' },
    'nova-engine': { name: 'Refrain Keeper', flavor: 'The measure completes only at the declared Overtone threshold.', effect: 'automatically triggers Refrain at your Overtone threshold' },
    'dawn-memory': { name: 'Opening Memory', flavor: 'The first pulse remembers how the prior measure began.', effect: 'every new composition begins with a measured head start' },
    'event-horizon': { name: 'Perfect Rest', flavor: 'Nothing sounds, but every relationship remains present.', effect: 'Overtone gain ×2' },
    'deep-resonance': { name: 'World Resonance', flavor: 'Every universe answers without losing its voice.', effect: 'all Resonance ×2, forever, everywhere' },
  },
  deepWorks: {
    'worldseed-compression': { name: 'Movement Compression', flavor: 'A whole composition folded into one audible relationship.', effect: 'all production ×2 per layer until Remembrance' },
    'recursive-abyss': { name: 'The Recursive Refrain', flavor: 'Every ending becomes another voice’s entrance.', effect: 'Perfect Rest yield +25% per layer until Remembrance' },
  },
  challenges: {
    silence: { name: 'Audible Silence', flavor: 'The structure must remain playable with every sound muted.' },
    entropy: { name: 'Dissonance Debt', flavor: 'Each careless interval taxes the voices that follow.' },
    'bare-hands': { name: 'Unaccompanied', flavor: 'The first measure begins without an autonomous voice.' },
    drought: { name: 'Broken Sustain', flavor: 'The phrase must continue after its expected drone ends.' },
    'half-light': { name: 'Faint Voice', flavor: 'A reduced signal must still remain individually legible.' },
    swarm: { name: 'Chamber Ensemble', flavor: 'Only the first voices may carry the whole movement.' },
    'glass-ceiling': { name: 'Eight Slots', flavor: 'Variation continues inside a strictly bounded measure.' },
    'ashen-touch': { name: 'Muted Strike', flavor: 'The Heart answers a deliberately softened gesture.' },
    unwritten: { name: 'Improvised Score', flavor: 'No saved preset may decide the next phrase.' },
    'broken-ladder': { name: 'Missing Beats', flavor: 'Every second role in the measure is absent.' },
    'single-voice': { name: 'Solo Choir', flavor: 'One source must prove that relationship still matters.' },
    'small-vessels': { name: 'Pocket Canticle', flavor: 'A complete movement held inside ten of everything.' },
  },
})

const PROGRESSION_BY_UNIVERSE: Record<string, UniverseProgressionIdentity> = {
  emberlight: EMBERLIGHT_PROGRESSION,
  tidefall: TIDEFALL_PROGRESSION,
  verdance: VERDANCE_PROGRESSION,
  clockwork: CLOCKWORK_PROGRESSION,
  prismata: PRISMATA_PROGRESSION,
  tempest: TEMPEST_PROGRESSION,
  canticle: CANTICLE_PROGRESSION,
}

export function progressionIdentity(universeId: string): UniverseProgressionIdentity {
  return PROGRESSION_BY_UNIVERSE[universeId] ?? EMBERLIGHT_PROGRESSION
}

export function vesselPartCopy(part: VesselPartDef, universeId: string): VesselPartCopy {
  const local = vesselPartForUniverse(universeId, part.id) ?? part
  return {
    name: local.name,
    flavor: local.flavor,
    requirement: local.requirement,
    action: local.action,
  }
}

export function constellationNodeCopy(node: StarNode, universeId: string): ProgressionCopy {
  return progressionIdentity(universeId).observatory.nodes?.[node.id] ?? node
}

export function constellationNodePosition(node: StarNode, universeId: string): { x: number; y: number } {
  return progressionIdentity(universeId).observatory.nodePositions?.[node.id] ?? node
}

export function stardustWorkCopy(work: RepeatableWork, universeId: string): ProgressionCopy {
  return progressionIdentity(universeId).observatory.works?.[work.id] ?? work
}

export function deepUpgradeCopy(upgrade: DeepUpgrade, universeId: string): ProgressionCopy {
  return progressionIdentity(universeId).deep.upgrades?.[upgrade.id] ?? upgrade
}

export function deepWorkCopy(work: RepeatableWork, universeId: string): ProgressionCopy {
  return progressionIdentity(universeId).deep.works?.[work.id] ?? work
}

export function challengeCopy(challenge: ChallengeDef, universe: UniversePack): ChallengeDisplayCopy {
  const identity = progressionIdentity(universe.id).deep.challenges?.[challenge.id] ?? challenge
  return localizedChallengeCopy(challenge, universe, identity)
}
