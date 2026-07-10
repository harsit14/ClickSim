import type { ChallengeDef } from './challenges'
import type { StarNode } from './constellation'
import type { DeepUpgrade } from './deep'
import type { RepeatableWork } from './repeatables'
import type { VesselPartDef } from './vessel'

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
  vessel?: Record<string, VesselPartCopy>
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
  vessel: {
    'hull-hearths': {
      name: 'Hull of Tidepools',
      flavor: 'A thousand small shores, curved into one shelter.',
      requirement: '1e24 glow this era',
      action: 'seal the hull',
    },
    'sails-constellation': {
      name: 'Sails of Moonwake',
      flavor: 'Routes drawn in foam learn how to pull against the dark.',
      requirement: '9 current-chart nodes',
      action: 'raise the moonwake',
    },
    'heart-sun': {
      name: 'Heart of the Drowned Beacon',
      flavor: 'A hundred distant calls, joined into one patient pulse.',
      requirement: '100 Drowned Beacons to release',
      action: 'release 100 Beacons',
    },
    'keel-trials': {
      name: 'Keel of Pressure',
      flavor: 'Every impossible depth becomes another rib of the ship.',
      requirement: '4 pressure trials completed',
      action: 'sound the keel',
    },
    archive: {
      name: 'The Pelagic Archive',
      flavor: 'Lumen seals every remembered shore inside the crossing.',
      requirement: 'an answer chosen',
      action: 'bring the archive',
    },
  },
  observatory: {
    overline: 'tidefall · currents remembered as stars',
    title: 'The Moonless Chart',
    mapTitle: 'The Current Chart',
    trialWait: 'A pressure trial is underway — the chart holds its breath.',
    firstText: 'When the moonless sea holds enough {currency}, release the whole tide into the dark. What settles becomes stardust.',
    needsText: 'The next Moonfall needs a higher tide of {currency}.',
    readyText: 'Let the moonless sea rise through its own sky. Begin again at low tide.',
    warningText: 'Every current, creature, and law sinks beyond the chart. Stardust alone washes back.',
    collapseName: 'Moonfall',
    goText: 'Release the tide',
    ownedText: 'set into the current',
    eternalEyebrow: 'after the last current closes',
    eternalTitle: 'The Returning Ocean',
    eternalIntro: 'These soundings consume unspent Stardust. Their depth survives Moonfalls and is washed clean only by a Hadal Descent.',
    eternalEmpty: 'Complete every current-chart node. Once every route meets the Moonless Crown, Stardust can be sounded into returning currents.',
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
        effect: 'stardust gain +15% per sounding this hadal era',
      },
    },
  },
  deep: {
    overline: 'below the last mapped current',
    title: 'The Hadal Archive',
    trialWait: 'A pressure trial is underway. The trench keeps its distance.',
    gatherText: 'Gather stardust; the Black Mouth accepts only complete tides.',
    readyText: 'Lower the whole era beyond the final sounding. Pressure will return it as ◉.',
    warningText: 'Your stardust, every current-chart node, and the era’s {currency} pass below the Black Mouth. Singularities return carrying the pressure.',
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
      'nova-engine': { name: 'Ebb Engine', flavor: 'Every tide learns when to leave.', effect: 'automatically triggers Moonfall when the stardust gain reaches your threshold' },
      'dawn-memory': { name: 'Tide Memory', flavor: 'Some waters refuse to be emptied.', effect: 'every return to low tide begins with 40 {spark} and 5 {wisp}' },
      'event-horizon': { name: 'The Black Mouth', flavor: 'Nothing escapes. Value returns as pressure.', effect: 'stardust gain ×2' },
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

const PROGRESSION_BY_UNIVERSE: Record<string, UniverseProgressionIdentity> = {
  emberlight: EMBERLIGHT_PROGRESSION,
  tidefall: TIDEFALL_PROGRESSION,
}

export function progressionIdentity(universeId: string): UniverseProgressionIdentity {
  return PROGRESSION_BY_UNIVERSE[universeId] ?? EMBERLIGHT_PROGRESSION
}

export function vesselPartCopy(part: VesselPartDef, universeId: string): VesselPartCopy {
  return progressionIdentity(universeId).vessel?.[part.id] ?? {
    name: part.name,
    flavor: part.flavor,
    requirement: part.requirement,
    action: part.action,
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

export function challengeCopy(challenge: ChallengeDef, universeId: string): ProgressionCopy {
  return progressionIdentity(universeId).deep.challenges?.[challenge.id] ?? challenge
}
