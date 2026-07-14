import { UNIVERSES, universeById, type UniverseId } from './universes'
import type { GameState, UniverseRunState } from '../engine/state/game-state.svelte'

export type MementoRealm = UniverseId | 'legacy'
export type MementoMilestone = 'awakening' | 'settlement' | 'epoch' | 'archive' | 'deep' | 'beacon' | 'legacy'
export type MementoMotif =
  | 'ember'
  | 'drop'
  | 'seed'
  | 'gear'
  | 'folio'
  | 'ring'
  | 'archive'
  | 'deep'
  | 'beacon'
  | 'vessel'
  | 'compass'
  | 'mountain'
  | 'prism'
  | 'garden'
  | 'bookmark'
  | 'shell'
  | 'key'

export interface MementoDefinition {
  readonly id: string
  readonly name: string
  readonly realm: MementoRealm
  readonly milestone: MementoMilestone
  readonly motif: MementoMotif
  readonly provenance: string
  readonly story: string
  readonly hint: string
  readonly accent: string
  readonly secondary: string
}

interface RealmMementoSeed {
  readonly name: string
  readonly motif: MementoMotif
  readonly provenance: string
  readonly story: string
  readonly hint: string
}

interface RealmMementoSet {
  readonly realm: UniverseId
  readonly accent: string
  readonly secondary: string
  readonly seeds: Readonly<Record<Exclude<MementoMilestone, 'legacy'>, RealmMementoSeed>>
}

const REALM_SETS: readonly RealmMementoSet[] = [
  {
    realm: 'emberlight', accent: '#ff9b4a', secondary: '#ffe0a3',
    seeds: {
      awakening: { name: 'The Coal’s First Breath', motif: 'ember', provenance: 'lifted from the first warm seam in the dark', story: 'A coal-sized hollow holds one impossible orange breath. It brightens when approached and never consumes its little bed of ash.', hint: 'Wake the Coal with one deliberate kindle.' },
      settlement: { name: 'Hearthmaker’s Thimble', motif: 'vessel', provenance: 'found beside the first district that learned warmth', story: 'Too small for any known hand, the thimble is blackened on one side and polished by generations on the other.', hint: 'Build far enough for warmth to become a place.' },
      epoch: { name: 'Crown of Cooling Dust', motif: 'ring', provenance: 'caught after the first sky ended without failing', story: 'Stardust clings to an open circlet. The missing segment is where the next universe enters.', hint: 'Complete an Epoch turn.' },
      archive: { name: 'Glass Plate of Twelve Skies', motif: 'archive', provenance: 'developed in the Astral Cabinet’s dimmest drawer', story: 'Several constellations appear at once when the plate is tilted. None agrees on which sky came first.', hint: 'Begin a complete Cabinet shelf.' },
      deep: { name: 'Pocket Event Horizon', motif: 'deep', provenance: 'recovered from the fold beneath the Observatory', story: 'A black bead makes nearby light arrive late. Lumen stores it in a box with no interior corners.', hint: 'Return from the Deep once.' },
      beacon: { name: 'Lantern at the Last Bridge', motif: 'beacon', provenance: 'left burning where Emberlight opened into another law', story: 'The lantern shines backward and forward at once. Its handle is warm only on the side facing home.', hint: 'Light Emberlight’s Beacon.' },
    },
  },
  {
    realm: 'tidefall', accent: '#57d9c1', secondary: '#bcefe5',
    seeds: {
      awakening: { name: 'Gravityless Droplet', motif: 'drop', provenance: 'cupped above the first moonless surface', story: 'The droplet refuses to fall. A whole inverted sea trembles in miniature along its skin.', hint: 'Wake the Tideheart.' },
      settlement: { name: 'Shell That Hears the Moon', motif: 'shell', provenance: 'found in a district built beneath its own weather', story: 'There is no moon in Tidefall, yet the shell repeats a slow pull when held to the ear.', hint: 'Raise the early currents into a living settlement.' },
      epoch: { name: 'Undertow Salt Circlet', motif: 'ring', provenance: 'crystallized after the first Undertow', story: 'A white ring carries one dark tide around its edge. Breaking it only gives the current another entrance.', hint: 'Complete an Undertow.' },
      archive: { name: 'Tideglass Sounding Plate', motif: 'archive', provenance: 'pressed from four voices at one Pelagic depth', story: 'Pressure has written a map inside the glass. The deepest line resembles a question more than a trench.', hint: 'Complete a Pelagic Archive depth.' },
      deep: { name: 'Pressure Pearl', motif: 'deep', provenance: 'raised from the place brightness goes to sleep', story: 'The pearl is dark until submerged in shadow. Then it glows with the memory of everything lowered beside it.', hint: 'Return from Tidefall’s Deep.' },
      beacon: { name: 'Bell Beneath the Beacon', motif: 'beacon', provenance: 'heard when the drowned call finally found a shore', story: 'It rings without air, clapper, or impact. Every note arrives carrying a little water home.', hint: 'Light Tidefall’s Beacon.' },
    },
  },
  {
    realm: 'verdance', accent: '#9bcc71', secondary: '#e3efad',
    seeds: {
      awakening: { name: 'The Patient Seed', motif: 'seed', provenance: 'taken from the soil only after it opened its own hand', story: 'Its coat shows rings from seasons it never lived. The seed grows warmer when left alone.', hint: 'Wake the Seed Heart.' },
      settlement: { name: 'Graft-Keeper’s Needle', motif: 'key', provenance: 'set down between an elder root and a younger branch', story: 'Bone-white thorn and green metal have grown around each other without hiding the seam.', hint: 'Grow the canopy into its first civic form.' },
      epoch: { name: 'Pruning Ring', motif: 'ring', provenance: 'grown around the first careful cut', story: 'The wooden ring records the released branch as a silver interruption. Memory lives at the wound, not despite it.', hint: 'Complete a Pruning.' },
      archive: { name: 'Amber Folio', motif: 'folio', provenance: 'pressed from one complete Herbarium argument', story: 'Leaf veins become sentences in the amber. New punctuation appears after rain.', hint: 'Complete an Impossible Herbarium folio.' },
      deep: { name: 'Root Below Night', motif: 'deep', provenance: 'lifted from the root system beneath visible time', story: 'The root ends in no point. It branches inward, toward a soil the world has not made yet.', hint: 'Return from Verdance’s Deep.' },
      beacon: { name: 'World-Tree Pollen Lantern', motif: 'beacon', provenance: 'caught when the oldest flower faced the dark between worlds', story: 'Each mote carries a different possible forest. The glass leaves all of them room.', hint: 'Light Verdance’s Beacon.' },
    },
  },
  {
    realm: 'clockwork', accent: '#d7b46f', secondary: '#f1dfac',
    seeds: {
      awakening: { name: 'Tooth Before Motion', motif: 'gear', provenance: 'removed from the mechanism before its first accepted turn', story: 'The tooth ticks once a second but never advances. It is waiting for a cause it cannot predict.', hint: 'Wake the Escapement Heart.' },
      settlement: { name: 'Mechanist’s Open Key', motif: 'key', provenance: 'filed without an owner in the civic machine', story: 'The key fits every service door and locks none of them. Its teeth spell a public maintenance interval.', hint: 'Build Clockwork into its first working district.' },
      epoch: { name: 'Mainspring of the Blank Minute', motif: 'ring', provenance: 'retained when the first schedule rewound', story: 'The spring turns around an interval the calendar refuses to engrave, leaving one minute free to become otherwise.', hint: 'Complete a Recomposition.' },
      archive: { name: 'Patent Without an Owner', motif: 'folio', provenance: 'released from a complete public register drawer', story: 'Every mechanism is drawn clearly. The signature field is an open window cut through the brass page.', hint: 'Complete a Patent Ledger drawer.' },
      deep: { name: 'Black Escapement Pearl', motif: 'deep', provenance: 'found where torque crosses the event horizon', story: 'It releases one grain of darkness at a time, exactly when the surrounding machine can carry it.', hint: 'Return from Clockwork’s Deep.' },
      beacon: { name: 'Unscheduled Beacon Dial', motif: 'beacon', provenance: 'detached during the interval no forecast owned', story: 'The dial has no numbers. Its hand points toward whichever world has made room for surprise.', hint: 'Light Clockwork’s Beacon.' },
    },
  },
  {
    realm: 'brahmalok', accent: '#d9a060', secondary: '#f2cf98',
    seeds: {
      awakening: { name: 'Unassigned Seed Point', motif: 'seed', provenance: 'encountered at the edge of an already-open lotus court', story: 'Possibility gathers here without accepting a body. The object is recorded, never claimed as a source.', hint: 'Enter Brahmalok and wake its Heart.' },
      settlement: { name: 'Measure with an Open End', motif: 'compass', provenance: 'set beside a form that revised its own boundary', story: 'The instrument measures relation, then leaves its final span deliberately unruled.', hint: 'Let the four directions build their first shared form.' },
      epoch: { name: 'Folio of Returning Forms', motif: 'folio', provenance: 'preserved through the first Recomposition', story: 'Old forms remain legible beneath new ink. None is labeled original or final.', hint: 'Complete a Brahmalok Recomposition.' },
      archive: { name: 'Margin That Refused a Signature', motif: 'archive', provenance: 'read after four first-form records answered one another', story: 'The margin is crowded with corrections and empty where an owner’s name would go.', hint: 'Complete an Archive of First Forms folio.' },
      deep: { name: 'First Form in Dark Water', motif: 'deep', provenance: 'witnessed below the lotus reflection', story: 'A shape begins whenever it is not watched directly. The record describes its relations and leaves its body alone.', hint: 'Return from Brahmalok’s Deep.' },
      beacon: { name: 'Petal from the Open Lotus', motif: 'beacon', provenance: 'offered at the passage after ownership was declined', story: 'The petal opens around an empty center. It is a sign of welcome, never a piece taken from a sacred presence.', hint: 'Light Brahmalok’s Beacon.' },
    },
  },
  {
    realm: 'vishnulok', accent: '#e2cb7e', secondary: '#a9d9dd',
    seeds: {
      awakening: { name: 'Still Drop in Motion', motif: 'drop', provenance: 'heard where the first current held still without stopping', story: 'A drop circles its own quiet center. Rest and movement remain visible at the same time.', hint: 'Enter Vishnulok and wake its Heart.' },
      settlement: { name: 'Reed Boat’s Homeward Knot', motif: 'vessel', provenance: 'tied after a small boat completed its second return', story: 'The knot loosens for departure and tightens only when every passenger has found refuge.', hint: 'Open the first sustaining circuit.' },
      epoch: { name: 'Circlet of Daily Return', motif: 'ring', provenance: 'carried through the first Renewal', story: 'Seven tiny currents meet without merging. Each can still be traced home.', hint: 'Complete a Vishnulok Renewal.' },
      archive: { name: 'Harbor Ledger of Repairs', motif: 'archive', provenance: 'heard after one Continuance sounding closed its circuit', story: 'The ledger records harm beside remedy and leaves the final page open for consequence.', hint: 'Complete an Ocean of Continuance sounding.' },
      deep: { name: 'Sounding from the Cosmic Ocean', motif: 'deep', provenance: 'returned from below the last mapped harbor', story: 'The line comes back dry and humming. Empty space was not empty; distance itself was being sustained.', hint: 'Return from Vishnulok’s Deep.' },
      beacon: { name: 'Lamp from the Still Horizon', motif: 'beacon', provenance: 'tended where every route continues below calm water', story: 'The lamp casts no ownership shadow. Its light marks a refuge that may be left and found again.', hint: 'Light Vishnulok’s Beacon.' },
    },
  },
  {
    realm: 'kailash', accent: '#78aec0', secondary: '#e0d5b9',
    seeds: {
      awakening: { name: 'Snowmelt Seed', motif: 'mountain', provenance: 'held at the first shelter below the open summit', story: 'A drop of meltwater encloses a tiny descending path. Its destination matters as much as its release.', hint: 'Enter Kailash and wake its Heart.' },
      settlement: { name: 'Shelter-Keeper’s Copper Cup', motif: 'vessel', provenance: 'left warm beside the first inhabited descent', story: 'The cup is repaired in five metals. No mark identifies who may drink from it.', hint: 'Open the first shelters along the mountain path.' },
      epoch: { name: 'Unclosed Ring of Release', motif: 'ring', provenance: 'carried through the first responsible Release', story: 'The copper ring leaves one interval open for refuge, aftermath, and grace.', hint: 'Complete a Kailash Release.' },
      archive: { name: 'Witness Stone with No Owner', motif: 'archive', provenance: 'read after one Mountain Witness path returned', story: 'Snow, ash, water, and shelter have each written a line. No line calls the summit a prize.', hint: 'Complete a Mountain Witness ascent.' },
      deep: { name: 'Blue Stone from the Still Point', motif: 'deep', provenance: 'found beneath a rest that refused momentum', story: 'The stone rings only after a deliberate pause. Its silence is part of the object.', hint: 'Return from Kailash’s Deep.' },
      beacon: { name: 'Thread from the Path Down', motif: 'beacon', provenance: 'given when the open summit turned toward ordinary life', story: 'Silver thread, shelter wool, and river fiber remain distinct in one descending braid.', hint: 'Light Kailash’s Beacon.' },
    },
  },
]

const MILESTONES: readonly Exclude<MementoMilestone, 'legacy'>[] = ['awakening', 'settlement', 'epoch', 'archive', 'deep', 'beacon']

const realmMementos = REALM_SETS.flatMap((set) => MILESTONES.map((milestone): MementoDefinition => ({
  id: `memento-${set.realm}-${milestone}`,
  realm: set.realm,
  milestone,
  accent: set.accent,
  secondary: set.secondary,
  ...set.seeds[milestone],
})))

const legacyMementos: readonly MementoDefinition[] = [
  { id: 'memento-legacy-crossing', name: 'Wayfinder’s First Thread', realm: 'legacy', milestone: 'legacy', motif: 'compass', provenance: 'spun between the first two laws that learned one another’s names', story: 'The thread changes color at the crossing and keeps both colors. It points home without insisting on return.', hint: 'Light a first Beacon and open the Wayfinder.', accent: '#d7b46f', secondary: '#8ed6ca' },
  { id: 'memento-legacy-atlas', name: 'Cartographer’s Folding Star', realm: 'legacy', milestone: 'legacy', motif: 'prism', provenance: 'folded from the code of the first archived possible world', story: 'Every crease is a lawful route. Unfolding the star never destroys the code that made it.', hint: 'Archive one optional Atlas route.', accent: '#b8a1df', secondary: '#f0d99b' },
  { id: 'memento-legacy-sevenfold', name: 'Sevenfold Beacon Prism', realm: 'legacy', milestone: 'legacy', motif: 'prism', provenance: 'formed when seven restored worlds remained distinct in one light', story: 'Each face throws a different material shadow. The center belongs to none of them.', hint: 'Light all seven Beacons.', accent: '#f2c277', secondary: '#9bcfbd' },
  { id: 'memento-legacy-garden', name: 'The Garden’s Unclaimed Chair', realm: 'legacy', milestone: 'legacy', motif: 'garden', provenance: 'left at the clearing after the Garden received an answer', story: 'Roots grow around the chair and never over its seat. It remains available to whoever was not centered in the telling.', hint: 'Live one Garden closure.', accent: '#9eb37b', secondary: '#e6d6ad' },
  { id: 'memento-legacy-remembrance', name: 'Lumen’s Second Bookmark', realm: 'legacy', milestone: 'legacy', motif: 'bookmark', provenance: 'found already waiting at the first page of a remembered universe', story: 'One side reads “again.” The other reads “differently.” The paper is older than either sentence.', hint: 'Begin again through Remembrance.', accent: '#d8b29d', secondary: '#b8c8e7' },
]

export const MEMENTOS: readonly MementoDefinition[] = [...realmMementos, ...legacyMementos]
export const MEMENTO_IDS: ReadonlySet<string> = new Set(MEMENTOS.map((memento) => memento.id))
export const MEMENTO_BY_ID: ReadonlyMap<string, MementoDefinition> = new Map(MEMENTOS.map((memento) => [memento.id, memento]))

type LocalProgress = Pick<UniverseRunState, 'clicks' | 'owned' | 'supernovae' | 'collapses' | 'curiosities'>

function localProgress(state: GameState, realm: UniverseId): LocalProgress | null {
  if (state.activeUniverse === realm) return state
  return state.universeRuns[realm] ?? null
}

function realmMilestones(state: GameState, realm: UniverseId): ReadonlySet<MementoMilestone> {
  const milestones = new Set<MementoMilestone>()
  const run = localProgress(state, realm)
  const beaconed = state.beacons.includes(realm)
  if (!run && !beaconed) return milestones
  const pack = universeById(realm)
  const reachedSettlement = Boolean(run && pack.generators.slice(5).some((generator) => (run.owned[generator.id] ?? 0) > 0))
  const reachedEpoch = Boolean(run && (run.supernovae > 0 || run.collapses > 0))
  const reachedArchive = Boolean(run && run.curiosities.length >= 4)
  const reachedDeep = Boolean(run && run.collapses > 0)
  const awakened = Boolean(run && (run.clicks > 0 || Object.keys(run.owned).length > 0))

  if (awakened || reachedSettlement || reachedEpoch || reachedArchive || reachedDeep || beaconed) milestones.add('awakening')
  if (reachedSettlement || reachedEpoch || reachedDeep || beaconed) milestones.add('settlement')
  if (reachedEpoch || reachedDeep || beaconed) milestones.add('epoch')
  if (reachedArchive || beaconed) milestones.add('archive')
  if (reachedDeep || beaconed) milestones.add('deep')
  if (beaconed) milestones.add('beacon')
  return milestones
}

/** Eligible objects are history notes only. They never enter production or story gates. */
export function eligibleMementoIds(state: GameState): readonly string[] {
  const eligible = new Set<string>()
  for (const universe of UNIVERSES) {
    const milestones = realmMilestones(state, universe.id as UniverseId)
    for (const milestone of milestones) eligible.add(`memento-${universe.id}-${milestone}`)
  }
  if (state.beacons.length >= 1) eligible.add('memento-legacy-crossing')
  if (state.atlasCompletions.length >= 1) eligible.add('memento-legacy-atlas')
  if (state.beacons.length >= UNIVERSES.length) eligible.add('memento-legacy-sevenfold')
  if (state.gardenEnding !== null) eligible.add('memento-legacy-garden')
  if (state.remembrances >= 1) eligible.add('memento-legacy-remembrance')
  return MEMENTOS.filter((memento) => eligible.has(memento.id)).map((memento) => memento.id)
}

export function newlyEligibleMementos(state: GameState): readonly MementoDefinition[] {
  const held = new Set(state.mementos)
  return eligibleMementoIds(state)
    .filter((id) => !held.has(id))
    .map((id) => MEMENTO_BY_ID.get(id))
    .filter((memento): memento is MementoDefinition => Boolean(memento))
}
