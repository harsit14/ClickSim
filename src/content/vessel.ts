import type { GameState } from '../engine/game.svelte'
import type { EconomyAmount, UniverseId } from './universes/types'
import { kailashStatus, brahmalokStatus, vishnulokCircuitStatus } from './universes/f4-runtime'
import { verdanceCohortRuntimeSummary } from './universes/verdance/runtime'
import {
  amountFromNumber,
  amountToNumber,
  divideAmounts,
  gteAmount,
  minAmount,
} from '../core/numeric/amount'

export type VesselPartId =
  | 'hull-hearths'
  | 'sails-constellation'
  | 'heart-sun'
  | 'keel-trials'
  | 'archive'

export type VesselMotif =
  | 'starship'
  | 'bathysphere'
  | 'seed-ark'
  | 'clock-engine'
  | 'spectrum-prism'
  | 'storm-conductor'
  | 'resonant-chamber'

interface VesselPartBase {
  id: VesselPartId
  name: string
  short: string
  flavor: string
  requirement: string
  hue: number
  action: string
  glyph: string
  consumes?: { gen: string; count: number }
}

export interface VesselAmountPartDef extends VesselPartBase {
  progressKind: 'amount'
  target: EconomyAmount
  current: (g: GameState) => EconomyAmount
}

export interface VesselCountPartDef extends VesselPartBase {
  progressKind: 'count'
  target: number
  current: (g: GameState) => number
}

export type VesselPartDef = VesselAmountPartDef | VesselCountPartDef

export interface VesselBlueprint {
  universeId: UniverseId
  name: string
  overline: string
  description: string
  motif: VesselMotif
  completion: string
  stages: readonly [string, string, string, string, string, string]
  parts: readonly VesselPartDef[]
}

const amountPart = (
  id: VesselPartId,
  name: string,
  short: string,
  flavor: string,
  requirement: string,
  hue: number,
  action: string,
  glyph: string,
  target: number,
  current: (g: GameState) => EconomyAmount,
): VesselAmountPartDef => ({
  id,
  name,
  short,
  flavor,
  requirement,
  hue,
  action,
  glyph,
  progressKind: 'amount',
  target: amountFromNumber(target),
  current,
})

const countPart = (
  id: VesselPartId,
  name: string,
  short: string,
  flavor: string,
  requirement: string,
  hue: number,
  action: string,
  glyph: string,
  target: number,
  current: (g: GameState) => number,
  consumes?: { gen: string; count: number },
): VesselCountPartDef => ({
  id,
  name,
  short,
  flavor,
  requirement,
  hue,
  action,
  glyph,
  progressKind: 'count',
  target,
  current,
  ...(consumes ? { consumes } : {}),
})

const answered = (g: GameState) => g.ending === null ? 0 : 1
const archiveCount = (g: GameState) => g.curiosities.length
const trialCount = (g: GameState) => g.challengesDone.length
const constellationCount = (g: GameState) => g.constellation.length

const VERDANCE_KINDLING_IDS = Array.from(
  { length: 18 },
  (_, index) => `verdance-kindling-${String(index + 1).padStart(2, '0')}`,
)

function rootedVerdanceCohorts(g: GameState): number {
  const stages = verdanceCohortRuntimeSummary(
    VERDANCE_KINDLING_IDS,
    g.owned,
    g.numericLawState,
  ).stageQuantities
  return stages['verdance-cohort-rooted'] + stages['verdance-cohort-mature'] + stages['verdance-cohort-ancient']
}

function numericLawMarker(g: GameState, id: string): number {
  const value = g.numericLawState[id]
  if (!value) return 0
  try {
    return Math.max(0, amountToNumber(value))
  } catch {
    return 0
  }
}

const EMBERLIGHT_VESSEL: VesselBlueprint = {
  universeId: 'emberlight',
  name: 'The Starfaring Vessel',
  overline: 'emberlight · a shelter made from endings',
  description: 'Assemble warmth, a chart, a surrendered star, tested law, and one honest answer into the first crossing craft.',
  motif: 'starship',
  completion: 'The Starfaring Vessel is awake. The Wayfinder can carry it between worlds.',
  stages: [
    'a shape under scaffolds',
    'one warm system holding',
    'two structures answering the dark',
    'three crossing systems joined',
    'four of five parts holding',
    'a quiet ark, ready at the edge',
  ],
  parts: [
    amountPart('hull-hearths', 'Hull of Hearths', 'Hull', 'A thousand warm places, bent into one shelter.', '1e24 Light earned this era', 24, 'set the hull', '⌒', 1e24, (g) => g.eraEarned),
    countPart('sails-constellation', 'Sails of Constellation', 'Sails', 'Charts that learned to pull against the dark.', '9 constellation nodes drawn', 214, 'raise the sails', '✦', 9, constellationCount),
    countPart('heart-sun', 'Heart of a Sun', 'Heart', 'A star given up so the vessel may keep beating.', '100 Suns to sacrifice', 48, 'give 100 Suns', '●', 100, (g) => g.owned.sun ?? 0, { gen: 'sun', count: 100 }),
    countPart('keel-trials', 'Keel of Trials', 'Keel', 'Every rehearsal becomes a rib of the ship.', '4 trials completed', 12, 'lay the keel', '━', 4, trialCount),
    countPart('archive', 'The Archive', 'Archive', 'Lumen will not let you cross alone.', 'an answer chosen', 260, 'bring the archive', '▣', 1, answered),
  ],
}

const TIDEFALL_VESSEL: VesselBlueprint = {
  universeId: 'tidefall',
  name: 'The Abyssal Ark',
  overline: 'tidefall · a pressure vessel for the moonless crossing',
  description: 'Sound the deep, catalogue its living witnesses, and join a hundred patient calls into an ark that can survive the Between.',
  motif: 'bathysphere',
  completion: 'The Abyssal Ark holds pressure. Its moonwake can cross where no tide should reach.',
  stages: [
    'an empty pressure frame',
    'one pressure system sealed',
    'two deep systems holding',
    'three ark systems joined',
    'four of five depths answered',
    'the Abyssal Ark, sealed and awake',
  ],
  parts: [
    amountPart('hull-hearths', 'Pressure Shell', 'Shell', 'Moon Salt anneals a hull that treats the Dark Between as one more depth.', '40 Moon Salt gathered', 188, 'seal the shell', '◉', 40, (g) => g.stardustTotal),
    countPart('sails-constellation', 'Moonwake Fins', 'Fins', 'Eight recovered lives teach the ark how a world moves without a shore.', '8 Pelagic Archive objects catalogued', 202, 'set the fins', '≈', 8, archiveCount),
    countPart('heart-sun', 'Heart of the Drowned Beacon', 'Heart', 'A hundred distant calls become one patient pressure-pulse.', '100 Drowned Beacons to release', 194, 'release 100 Beacons', '●', 100, (g) => g.owned['tidefall-drowned-beacon'] ?? 0, { gen: 'tidefall-drowned-beacon', count: 100 }),
    countPart('keel-trials', 'Hadal Ballast', 'Ballast', 'Six impossible depths become the weight that keeps the crossing true.', '6 pressure trials endured', 218, 'lower the ballast', '▼', 6, trialCount),
    countPart('archive', 'Pelagic Memory Vault', 'Memory', 'The chosen answer is sealed as a shore the ark can carry.', 'an answer chosen', 260, 'seal the memory', '▣', 1, answered),
  ],
}

const VERDANCE_VESSEL: VesselBlueprint = {
  universeId: 'verdance',
  name: 'The Seed Ark',
  overline: 'verdance · a living crossing grown instead of built',
  description: 'Let cohorts take root, open the canopy, and graft memory around a heartwood core until the craft becomes its own ecology.',
  motif: 'seed-ark',
  completion: 'The Seed Ark has become self-sustaining. Its roots can take hold in the Dark Between.',
  stages: [
    'a dormant crossing seed',
    'one living structure rooted',
    'two tissues growing together',
    'three ark systems alive',
    'four of five growths established',
    'the Seed Ark, alive between worlds',
  ],
  parts: [
    countPart('hull-hearths', 'Rooted Seedcoat', 'Seedcoat', 'The hull is alive; every planted cohort must first choose to stay.', '50 Kindlings rooted for at least five minutes', 104, 'close the seedcoat', '◒', 50, rootedVerdanceCohorts),
    countPart('sails-constellation', 'Folded Canopy', 'Canopy', 'Ten canopy paths become leaves that steer by opening toward possibility.', '10 Living Canopy nodes grown', 82, 'fold the canopy', '❧', 10, constellationCount),
    countPart('heart-sun', 'Heartwood Core', 'Heartwood', 'Fifty old trunks join without becoming one identical ring.', '50 Heartwoods to graft', 42, 'graft 50 Heartwoods', '◎', 50, (g) => g.owned['verdance-kindling-09'] ?? 0, { gen: 'verdance-kindling-09', count: 50 }),
    countPart('keel-trials', 'Pollinator Compass', 'Compass', 'Eight specimens teach the ark to exchange difference across the dark.', '8 Herbarium specimens catalogued', 136, 'invite the pollinators', '✾', 8, archiveCount),
    countPart('archive', 'Garden Gate Cutting', 'Cutting', 'An answered branch remains open for a world not yet grown.', 'an answer chosen', 68, 'plant the cutting', '⌇', 1, answered),
  ],
}

const CLOCKWORK_VESSEL: VesselBlueprint = {
  universeId: 'clockwork',
  name: 'The Meridian Engine',
  overline: 'clockwork · a crossing whose every cause remains visible',
  description: 'Regulate a public train, surrender its predictive core, and leave one final route deliberately unfilled.',
  motif: 'clock-engine',
  completion: 'The Meridian Engine completes its inspection. Every route is visible; the final route remains yours.',
  stages: [
    'an unindexed crossing frame',
    'one assembly beneath its mark',
    'two inspected systems engaged',
    'three engine systems routed',
    'four of five causes declared',
    'the Meridian Engine, regulated for departure',
  ],
  parts: [
    amountPart('hull-hearths', 'Indexed Chassis', 'Chassis', 'Preserved intervals set every plate beneath a public mark.', '50 Preserved Intervals gathered', 42, 'index the chassis', '⌑', 50, (g) => g.stardustTotal),
    countPart('sails-constellation', 'Civic Transmission', 'Train', 'Eighteen installed laws expose where force enters, changes, and leaves.', '18 Clockwork laws installed', 210, 'engage the train', '⚙', 18, (g) => g.upgrades.length),
    countPart('heart-sun', 'Difference Spring', 'Spring', 'Fifty prediction engines surrender certainty and store only declared intent.', '50 Difference Engines to unwind', 195, 'unwind 50 Engines', '↻', 50, (g) => g.owned['clockwork-difference-engine'] ?? 0, { gen: 'clockwork-difference-engine', count: 50 }),
    countPart('keel-trials', 'Governor Assembly', 'Governor', 'Six deterministic trials prove the engine stops when its law says stop.', '6 regulation trials completed', 30, 'set the governor', '◎', 6, trialCount),
    countPart('archive', 'The Blank Route', 'Route', 'The final instruction is an answer, not a prediction.', 'an answer chosen', 214, 'leave the route open', '□', 1, answered),
  ],
}

const BRAHMALOK_VESSEL: VesselBlueprint = {
  universeId: 'brahmalok',
  name: 'The Unclosed Folio',
  overline: 'brahmalok · a passage approached through revisable creation',
  description: 'Balance seed, measure, name, and form; bind their relation without closing the margin through which another beginning may enter.',
  motif: 'spectrum-prism',
  completion: 'The Unclosed Folio aligns with the Open Lotus. The final square remains deliberately unoccupied.',
  stages: [
    'an unwritten crossing leaf',
    'one creation direction answered',
    'two revisable structures aligned',
    'three manuscript courts open',
    'four of five relations witnessed',
    'the Unclosed Folio, aligned for passage',
  ],
  parts: [
    countPart('hull-hearths', 'Four-Direction Binding', 'Binding', 'Seed, measure, name, and form must all reach the folio without one becoming sovereign.', 'all 4 creation directions active', 38, 'bind the four directions', '⌘', 4, (g) => brahmalokStatus(g.numericLawState, g.owned).activeDirections),
    countPart('sails-constellation', 'Margins of Relation', 'Margins', 'Ten learned relations keep the crossing answerable to revision.', '10 knowledge-map nodes understood', 214, 'rule the margins', '⌜', 10, constellationCount),
    countPart('heart-sun', 'Script Garden Leaf', 'Leaf', 'Fifty Script Gardens grow a page broad enough for an unfamiliar hand.', '50 Script Gardens to align', 38, 'align 50 Gardens', '▤', 50, (g) => g.owned['brahmalok-kindling-10'] ?? 0, { gen: 'brahmalok-kindling-10', count: 50 }),
    countPart('keel-trials', 'First-Forms Index', 'Index', 'Eight encountered records show how creation remains accountable to correction.', '8 First Form records encountered', 38, 'read the index', '⌑', 8, archiveCount),
    countPart('archive', 'The Open Square', 'Opening', 'The final page keeps one place that no traveler may claim.', 'an answer chosen', 206, 'leave the square open', '□', 1, answered),
  ],
}

const VISHNULOK_VESSEL: VesselBlueprint = {
  universeId: 'vishnulok',
  name: 'The Returning Harbor',
  overline: 'vishnulok · a crossing built by carrying every correction home',
  description: 'Open the widest safe refuge route, complete its return by choice, and hold the surviving continuity around one still horizon.',
  motif: 'storm-conductor',
  completion: 'The Returning Harbor holds an open refuge inside declared currents. It can cross without turning protection into possession.',
  stages: [
    'an open harbor frame',
    'one sustaining current held',
    'two correction routes returning',
    'three refuge systems linked',
    'four of five relations restored',
    'the Returning Harbor, open and homeward-bound',
  ],
  parts: [
    countPart('hull-hearths', 'Eight-Shore Circuit', 'Circuit', 'The crossing route must reach the full field before it can carry a world.', 'an 8-shelter correction circuit configured', 218, 'open the circuit', '∞', 8, (g) => vishnulokCircuitStatus(g.numericLawState).length),
    countPart('sails-constellation', 'Completed Return', 'Return', 'A completed correction proves the route can come home without becoming a cage.', 'one configured circuit returned', 42, 'bind the return line', '↶', 1, (g) => numericLawMarker(g, 'vishnulok-last-return') > 0 ? 1 : 0),
    amountPart('heart-sun', 'Continuity Hull', 'Hull', 'Harbor stone is set from the continuity that survived fifty Renewals.', '50 Returns gathered', 205, 'set the harbor hull', '≋', 50, (g) => g.stardustTotal),
    countPart('keel-trials', 'Refuge Threshold', 'Refuge', 'Six trials teach every route a visible path back into relation.', '6 continuance trials completed', 172, 'open the threshold', '⌂', 6, trialCount),
    countPart('archive', 'The Still Horizon', 'Horizon', 'The answer is calm water that remains alive beneath the crossing.', 'an answer chosen', 42, 'sound the horizon', '⌒', 1, answered),
  ],
}

const KAILASH_VESSEL: VesselBlueprint = {
  universeId: 'kailash',
  name: 'The Downward Path',
  overline: 'kailash · a crossing that returns from the summit',
  description: 'Keep every act legible, open shelter before release, and carry the surviving relation back toward ordinary life.',
  motif: 'resonant-chamber',
  completion: 'The Downward Path carries every Trace through the open ring. The Garden may begin without pretending nothing ended.',
  stages: [
    'an unread slope in the dark',
    'one silver route descending',
    'two shelters held open',
    'three mountain relations carried',
    'four of five acts made legible',
    'the Downward Path through an open ring',
  ],
  parts: [
    countPart('hull-hearths', 'Five-Act Ascent', 'Ascent', 'Emergence, shelter, release, veil, and grace must all remain legible beside rest.', 'all 6 cycle positions present', 196, 'mark the five acts', '△', 6, (g) => kailashStatus(g.numericLawState, g.owned, 0).distinctRoles),
    countPart('sails-constellation', 'Three Deliberate Rests', 'Rests', 'Stillness becomes consent only when the cycle makes room to stop.', 'at least 3 rests in the cycle', 196, 'leave the intervals', '○', 3, (g) => kailashStatus(g.numericLawState, g.owned, 0).restCount),
    countPart('heart-sun', 'Carried Witness', 'Witness', 'Eight recovered records teach the path to retain consequence and refuge together.', '8 Echoes recovered', 196, 'carry the witness', '⌃', 8, (g) => g.echoes.length),
    countPart('keel-trials', 'Refuge Boundary', 'Refuge', 'Six trials prove Release remains complete under silence, constraint, and cancellation.', '6 release trials completed', 31, 'open the refuge', '⌂', 6, trialCount),
    countPart('archive', 'Open Summit Interval', 'Return', 'The chosen answer is carried down as a path, not sealed into a final enclosure.', 'an answer chosen', 196, 'open the path down', '▽', 1, answered),
  ],
}

export const VESSEL_BLUEPRINTS: readonly VesselBlueprint[] = [
  EMBERLIGHT_VESSEL,
  TIDEFALL_VESSEL,
  VERDANCE_VESSEL,
  CLOCKWORK_VESSEL,
  BRAHMALOK_VESSEL,
  VISHNULOK_VESSEL,
  KAILASH_VESSEL,
]

const VESSEL_BLUEPRINT_BY_UNIVERSE = new Map(
  VESSEL_BLUEPRINTS.map((blueprint) => [blueprint.universeId, blueprint]),
)

/** Legacy export retained for stable part IDs and historical save migration. */
export const VESSEL_PARTS: readonly VesselPartDef[] = EMBERLIGHT_VESSEL.parts
export const VESSEL_PART_BY_ID = new Map(VESSEL_PARTS.map((part) => [part.id, part]))
export const VESSEL_PART_IDS = VESSEL_PARTS.map(({ id }) => id)
export const VESSEL_REVEAL_AT = amountFromNumber(1e21)

export function vesselBlueprint(universeId: string): VesselBlueprint {
  return VESSEL_BLUEPRINT_BY_UNIVERSE.get(universeId as UniverseId) ?? EMBERLIGHT_VESSEL
}

export function vesselPartsForUniverse(universeId: string): readonly VesselPartDef[] {
  return vesselBlueprint(universeId).parts
}

export function vesselPartForUniverse(universeId: string, id: VesselPartId): VesselPartDef | undefined {
  return vesselPartsForUniverse(universeId).find((part) => part.id === id)
}

export function vesselPartIdsFor(
  g: Pick<GameState, 'activeUniverse' | 'vesselParts' | 'vesselPartsByUniverse'>,
  universeId = g.activeUniverse,
): readonly string[] {
  const local = g.vesselPartsByUniverse?.[universeId]
  if (local) return local
  return universeId === 'emberlight' ? g.vesselParts : []
}

export function vesselRevealed(g: GameState): boolean {
  return vesselPartIdsFor(g).length > 0 || gteAmount(g.allTimeEarned, VESSEL_REVEAL_AT) || g.ending !== null
}

export function vesselPartComplete(g: GameState, id: VesselPartId, universeId = g.activeUniverse): boolean {
  return vesselPartIdsFor(g, universeId).includes(id)
}

export function vesselPartCurrent(g: GameState, part: VesselPartDef): EconomyAmount | number {
  return part.progressKind === 'amount'
    ? minAmount(part.current(g), part.target)
    : Math.min(part.current(g), part.target)
}

export function vesselPartReady(g: GameState, part: VesselPartDef, universeId = g.activeUniverse): boolean {
  const ready = part.progressKind === 'amount'
    ? gteAmount(part.current(g), part.target)
    : part.current(g) >= part.target
  return !vesselPartComplete(g, part.id, universeId) && ready
}

export function vesselProgress(g: GameState, part: VesselPartDef): number {
  if (part.progressKind === 'count') return Math.min(1, part.current(g) / part.target)
  const ratio = divideAmounts(part.current(g), part.target)
  return ratio.exponent >= 0 ? 1 : Math.min(1, amountToNumber(ratio))
}

export function vesselComplete(g: GameState, universeId = g.activeUniverse): boolean {
  return vesselPartsForUniverse(universeId).every((part) => vesselPartComplete(g, part.id, universeId))
}

export function vesselHasReadyPart(g: GameState): boolean {
  return vesselPartsForUniverse(g.activeUniverse).some((part) => vesselPartReady(g, part))
}

export function vesselBuiltCount(g: GameState, universeId = g.activeUniverse): number {
  return vesselPartsForUniverse(universeId).filter((part) => vesselPartComplete(g, part.id, universeId)).length
}

export function vesselStage(g: GameState): string {
  const blueprint = vesselBlueprint(g.activeUniverse)
  return blueprint.stages[vesselBuiltCount(g)] ?? blueprint.stages[0]
}
