import type { EconomyAmount } from './universes/types'
import { amountFromNumber, maxAmount, multiplyAmountByNumber } from '../core/numeric/amount'

/** Celestial curiosities — astronomical phenomena catalogued inside each universe.
 *  Stable legacy ids preserve existing saves while the visible archive can evolve
 *  into a shared cosmology across future worlds. */
export interface CuriosityDef {
  id: string
  name: string
  glyph: string
  classification: string
  flavor: string
  record: string
  desc: string
  cost: number
  hue: number
  /** rows with special UI in the cabinet */
  kind?: 'hearthkeeper' | 'snail' | 'letter' | 'door'
}

export const CURIOSITIES: CuriosityDef[] = [
  {
    id: 'moth',
    name: 'White Dwarf',
    glyph: '◉',
    classification: 'stellar remnant · local survey 01',
    flavor: 'A small dead sun, still refusing to become dark.',
    record: 'Its spectrum matches no star born in Emberlight. It was already ancient when your first Spark opened its eyes.',
    desc: 'orbits the central light and lends each click a little gravity',
    cost: 1e6,
    hue: 40,
  },
  {
    id: 'chimes',
    name: 'Magnetar',
    glyph: '✣',
    classification: 'neutron remnant · local survey 02',
    flavor: 'Its magnetic field rings through the dark like struck glass.',
    record: 'One recurring pulse contains a syllable Lumen remembers but will not translate. The archive marks it as a name.',
    desc: 'a distant magnetic chord strengthens production and critical chance',
    cost: 5e6,
    hue: 190,
  },
  {
    id: 'hearthkeeper',
    name: 'Protostar',
    glyph: '✦',
    classification: 'stellar nursery · local survey 03',
    flavor: 'A star before ignition, warm with the possibility of itself.',
    record: 'The first object Lumen asked you not to collapse. “Some beginnings deserve time,” was the entire explanation.',
    desc: 'stoke its core; while fueled, all production +5%. it cools, but never dies',
    cost: 25e6,
    hue: 18,
    kind: 'hearthkeeper',
  },
  {
    id: 'glass-garden',
    name: 'Emission Nebula',
    glyph: '≋',
    classification: 'stellar nursery · local survey 04',
    flavor: 'A garden measured in light-years, flowering around unborn suns.',
    record: 'Its hydrogen filaments describe a shoreline beneath a moonless sea. The shape means nothing here. Not yet.',
    desc: 'luminous gas takes root around the edges of the universe',
    cost: 1e8,
    hue: 280,
  },
  {
    id: 'second-cursor',
    name: 'Quasar',
    glyph: '⌁',
    classification: 'active galactic nucleus · signal 01',
    flavor: 'A galaxy’s bright wound, focused into one impossible direction.',
    record: 'Every beam crosses the point where the first universe ended. Whatever sits there has begun answering in clicks.',
    desc: 'fires one clean pulse into the central light every beat',
    cost: 5e8,
    hue: 200,
  },
  {
    id: 'snail',
    name: 'Long-Period Comet',
    glyph: '☄',
    classification: 'wandering body · signal 02',
    flavor: 'The longest road in the system, repeated without complaint.',
    record: 'Salt sleeps inside its ice—salt from an ocean Emberlight has never contained. Its return path points beyond this sky.',
    desc: 'completes an orbit in about 90 minutes; every return carries a gift',
    cost: 2e9,
    hue: 90,
    kind: 'snail',
  },
  {
    id: 'aurora',
    name: 'Supernova Remnant',
    glyph: '∿',
    classification: 'expanding remnant · signal 03',
    flavor: 'A star’s last decision, still traveling outward.',
    record: 'The shock front is a map of a universe that died before Emberlight. The empty center is exactly vessel-shaped.',
    desc: 'an expanding ribbon of stellar memory crosses the background',
    cost: 1e10,
    hue: 160,
  },
  {
    id: 'door',
    name: 'Black Hole',
    glyph: '●',
    classification: 'collapsed star · signal 04',
    flavor: 'Not an absence. A place where every direction becomes inward.',
    record: 'It loses one clock-tick each cycle. The missing time reappears in the Wayfinder as a route no instrument can see.',
    desc: 'its event horizon becomes readable when this universe grows vast enough',
    cost: 1e11,
    hue: 50,
    kind: 'door',
  },
  {
    id: 'star-jar',
    name: 'Neutron Star',
    glyph: '⊙',
    classification: 'compact remnant · deep survey 01',
    flavor: 'A city’s mass packed into a light you could cover with one hand.',
    record: 'Its crust keeps a perfect count of every touch made in this universe. The oldest tally begins before you arrived.',
    desc: 'its gravity draws falling stars 5% more often',
    cost: 1e12,
    hue: 55,
  },
  {
    id: 'metronome-heart',
    name: 'Pulsar',
    glyph: '⋇',
    classification: 'rotating neutron star · deep survey 02',
    flavor: 'A lighthouse built by physics, keeping time for no shore.',
    record: 'It was synchronized with the game’s music before the music existed. Lumen calls this evidence and changes the subject.',
    desc: 'its precise rotation widens the beat window by 20ms',
    cost: 1e13,
    hue: 340,
  },
  {
    id: 'letter',
    name: 'Red Giant',
    glyph: '✹',
    classification: 'late-stage star · deep survey 03',
    flavor: 'A sun grown enormous and gentle at the edge of its ending.',
    record: 'Its outer atmosphere carries a narrow-band transmission. Someone hid a final message inside the star’s own breathing.',
    desc: 'its spectrum holds an archival transmission that can be read',
    cost: 1e14,
    hue: 30,
    kind: 'letter',
  },
  {
    id: 'orrery',
    name: 'Supermassive Black Hole',
    glyph: '◉',
    classification: 'galactic anchor · deep survey 04',
    flavor: 'An entire galaxy turning around a darkness too large to notice it is alone.',
    record: 'Its lens shows more than background stars: a moonless sea, a glass dawn, a sky folded into roots. These are not reflections.',
    desc: 'its gravitational lens reveals worlds that may be reachable',
    cost: 1e15,
    hue: 45,
  },
]

export const CURIOSITY_BY_ID = new Map(CURIOSITIES.map((c) => [c.id, c]))

export type CuriosityShelfId = 'hearthside' | 'pilgrims' | 'portents'
export type CuriosityRewardKind = 'production' | 'clicks' | 'stars'

export interface CuriosityShelfDef {
  id: CuriosityShelfId
  index: string
  name: string
  lore: string
  ids: string[]
  rewardKind: CuriosityRewardKind
  rewardName: string
  reward: string
  rewardValue: number
}

export interface CuriosityCabinetDef {
  id: string
  title: string
  surveyLabel: string
  dockTitle: string
  dockGlyph: string
  items: CuriosityDef[]
  itemById: Map<string, CuriosityDef>
  shelves: CuriosityShelfDef[]
  resonancePerItem: number
  fuelHours: number
  fuelProductionMult: number
  returnCycleSec: number
  returnRateSeconds: number
  starItemRateBonus: number
  beatWindowBonus: number
  lines: {
    empty: string
    first: string
    chapter: string
    cosmology: string
    complete: string
  }
  archiveRecord: string
}

/**
 * The Cabinet is a three-part astronomical survey rather than a flat shop. Each
 * band moves outward in scale: local phenomena, distant signals, deep gravity.
 */
export const CURIOSITY_SHELVES: CuriosityShelfDef[] = [
  {
    id: 'hearthside',
    index: 'I',
    name: 'The Local Sky',
    lore: 'The first phenomena catalogued after Emberlight learned to look beyond itself.',
    ids: ['moth', 'chimes', 'hearthkeeper', 'glass-garden'],
    rewardKind: 'production',
    rewardName: 'Stellar Chorus',
    reward: 'all production ×1.10',
    rewardValue: 1.1,
  },
  {
    id: 'pilgrims',
    index: 'II',
    name: 'The Signal Sky',
    lore: 'Distant objects first encountered as messages, routes, and impossible returns.',
    ids: ['second-cursor', 'snail', 'aurora', 'door'],
    rewardKind: 'clicks',
    rewardName: 'Signal Cadence',
    reward: 'click power ×1.25',
    rewardValue: 1.25,
  },
  {
    id: 'portents',
    index: 'III',
    name: 'The Deep Sky',
    lore: 'Ancient gravity wells whose light remembers universes outside this one.',
    ids: ['star-jar', 'metronome-heart', 'letter', 'orrery'],
    rewardKind: 'stars',
    rewardName: 'Gravitational Lens',
    reward: 'falling-star frequency +10%',
    rewardValue: 0.1,
  },
]

/** Every individual Archive record provides a meaningful permanent benefit. */
export const CABINET_RESONANCE_PER_ITEM = 0.02
export const CURIOSITY_RESONANCE_PER_ITEM = CABINET_RESONANCE_PER_ITEM

const uniqueKnownCuriosities = (held: readonly string[], cabinet: CuriosityCabinetDef) =>
  new Set(held.filter((id) => cabinet.itemById.has(id)))

export function curiosityShelfProgress(held: readonly string[], shelf: CuriosityShelfDef, cabinet = EMBERLIGHT_CABINET): number {
  const owned = uniqueKnownCuriosities(held, cabinet)
  return shelf.ids.filter((id) => owned.has(id)).length
}

export function curiosityShelfComplete(held: readonly string[], shelfId: CuriosityShelfId, cabinet = EMBERLIGHT_CABINET): boolean {
  const shelf = cabinet.shelves.find((entry) => entry.id === shelfId)
  return !!shelf && curiosityShelfProgress(held, shelf, cabinet) === shelf.ids.length
}

export function completedCuriosityShelves(held: readonly string[], cabinet = EMBERLIGHT_CABINET): number {
  return cabinet.shelves.filter((shelf) => curiosityShelfComplete(held, shelf.id, cabinet)).length
}

/** Every find resonates; the first shelf adds its own capstone harmony. */
export function curiosityProductionMult(held: readonly string[], cabinet = EMBERLIGHT_CABINET): number {
  const resonance = 1 + uniqueKnownCuriosities(held, cabinet).size * cabinet.resonancePerItem
  const shelf = cabinet.shelves.find((entry) => entry.rewardKind === 'production')
  return resonance * (shelf && curiosityShelfComplete(held, shelf.id, cabinet) ? shelf.rewardValue : 1)
}

export function curiosityClickMult(held: readonly string[], cabinet = EMBERLIGHT_CABINET): number {
  const shelf = cabinet.shelves.find((entry) => entry.rewardKind === 'clicks')
  return shelf && curiosityShelfComplete(held, shelf.id, cabinet) ? shelf.rewardValue : 1
}

export function curiosityStarRateBonus(held: readonly string[], cabinet = EMBERLIGHT_CABINET): number {
  const shelf = cabinet.shelves.find((entry) => entry.rewardKind === 'stars')
  return shelf && curiosityShelfComplete(held, shelf.id, cabinet) ? shelf.rewardValue : 0
}

export const RED_GIANT_RECORD =
  'SPECTRAL RECORD 7 — THE LAST GARDENERS\n\n' +
  'To whoever tends the next light: we knew the end was coming. Most of us. We were afraid until fear became another kind of weather.\n\n' +
  'The light was worth the burning. Write that somewhere gravity cannot erase.\n\n' +
  'If the old routes open again, do not mistake another sky for an empty one. Someone may already be tending it.\n\n— transmitted from a star with no surviving name'

export const EMBERLIGHT_CABINET: CuriosityCabinetDef = {
  id: 'emberlight',
  title: 'The Celestial Cabinet',
  surveyLabel: 'Emberlight astronomical survey',
  dockTitle: 'The Celestial Cabinet',
  dockGlyph: '◍',
  items: CURIOSITIES,
  itemById: CURIOSITY_BY_ID,
  shelves: CURIOSITY_SHELVES,
  resonancePerItem: CURIOSITY_RESONANCE_PER_ITEM,
  fuelHours: 2,
  fuelProductionMult: 1.05,
  returnCycleSec: 90 * 60,
  returnRateSeconds: 1800,
  starItemRateBonus: 0.05,
  beatWindowBonus: 0.02,
  lines: {
    empty: 'Three survey bands wait for signals Emberlight has not learned to recognize.',
    first: 'The universe becomes less lonely once its oldest lights have names.',
    chapter: 'Four distant phenomena have resolved into one chapter of the same sky.',
    cosmology: 'The cabinet has stopped resembling a collection. It is becoming a cosmology.',
    complete: 'The survey is complete. Taken together, these objects describe a route out.',
  },
  archiveRecord: RED_GIANT_RECORD,
}

export const TIDEFALL_CURIOSITIES: CuriosityDef[] = [
  { id: 'moth', name: 'Phantom Moon', glyph: '◒', classification: 'surface omen · tide plate 01', flavor: 'A moon reflected in water beneath a moonless sky.', record: 'The reflection waxes when no body passes overhead. Its craters match the White Dwarf catalogued in Emberlight, but its tides pull in the opposite direction.', desc: 'its absent gravity lends every gathered object a quieter strength', cost: 1e6, hue: 198 },
  { id: 'chimes', name: 'Pressure Bell', glyph: '≋', classification: 'resonant current · tide plate 02', flavor: 'A ring of water that tolls without air, metal, or impact.', record: 'Each note arrives from deeper water than the last. The seventh carries the archival frequency of a Magnetar, slowed until an ocean can sing it.', desc: 'its low tide-note strengthens production and critical chance', cost: 5e6, hue: 184 },
  { id: 'hearthkeeper', name: 'Pearl Nursery', glyph: '◉', classification: 'living shoal · tide plate 03', flavor: 'Unopened worlds growing nacre around a shared irritation.', record: 'Lumen identifies the irritant as a splinter of Emberlight. The pearls identify Lumen as weather and continue growing.', desc: 'feed the nursery; while luminous, all production +8% for three hours', cost: 25e6, hue: 164, kind: 'hearthkeeper' },
  { id: 'glass-garden', name: 'Kelp Nebula', glyph: '≋', classification: 'floating forest · tide plate 04', flavor: 'Roots above. Stars below. A forest refusing both directions.', record: 'Its spores arrange themselves into the outline of a Red Giant. In Tidefall, even botany remembers the sky.', desc: 'bioluminescent fronds spread through the lower currents', cost: 1e8, hue: 152 },
  { id: 'second-cursor', name: 'Quasar Sounding', glyph: '⌿', classification: 'depth signal · pelagic plate 01', flavor: 'A beam lowered into the sea to ask how deep tomorrow will be.', record: 'The pulse returns before it is sent. Every answer is one click long and points toward the same unopened pressure-door.', desc: 'returns one measured pulse to the central glow every beat', cost: 5e8, hue: 194 },
  { id: 'snail', name: 'Century Leviathan', glyph: '∿', classification: 'migratory giant · pelagic plate 02', flavor: 'So large that a complete migration resembles continental drift.', record: 'Salt constellations grow along its back. One matches the route home; another maps a universe neither archive has visited.', desc: 'completes a migration in about 60 minutes; its wake carries forty minutes of glow', cost: 2e9, hue: 174, kind: 'snail' },
  { id: 'aurora', name: 'Blooming Trench', glyph: '≈', classification: 'abyssal bloom · pelagic plate 03', flavor: 'The deepest wound in the sea, flowering upward in color.', record: 'The bloom occurs whenever a Supernova Remnant expands in Emberlight. Distance is becoming a less convincing explanation.', desc: 'a slow bioluminescent bloom climbs the background water', cost: 1e10, hue: 176 },
  { id: 'door', name: 'The Black Mouth', glyph: '●', classification: 'pressure aperture · pelagic plate 04', flavor: 'Not a trench. A place where depth becomes a direction.', record: 'Old charts call it a drain. New readings call it an event horizon. Something beyond it calls it a door.', desc: 'its inward current becomes readable when this ocean grows vast enough', cost: 1e11, hue: 224, kind: 'door' },
  { id: 'star-jar', name: 'Moon Pearl', glyph: '⊙', classification: 'compressed tide · abyss plate 01', flavor: 'A whole moon-pull folded into something held by one current.', record: 'Its layers count every wandering blessing that crossed this sea. The innermost layer predates Tidefall.', desc: 'its pull draws wandering bubbles 8% more often', cost: 1e12, hue: 205 },
  { id: 'metronome-heart', name: 'Tideclock', glyph: '⋇', classification: 'living chronometer · abyss plate 02', flavor: 'It measures time by the water that has not arrived yet.', record: 'The clock loses thirty-five milliseconds at every crest. Those milliseconds reappear around your rhythm window.', desc: 'its predicted crest widens the beat window by 35ms', cost: 1e13, hue: 188 },
  { id: 'letter', name: 'Red Tide Beacon', glyph: '✹', classification: 'warning bloom · abyss plate 03', flavor: 'A red light tended long after the final keeper drowned.', record: 'The keeper encoded one last field report inside the bloom cycle. The first line reads: THE SEA REMEMBERS UP.', desc: 'its repeating bloom holds a drowned archival transmission', cost: 1e14, hue: 8, kind: 'letter' },
  { id: 'orrery', name: 'World Current Eye', glyph: '◉', classification: 'oceanic singularity · abyss plate 04', flavor: 'Every current in Tidefall passes through its gaze eventually.', record: 'Inside the pupil: a warm ember, a white remnant, a garden of roots, and the silhouette of the vessel. None are reflections.', desc: 'its lens reveals currents that continue between universes', cost: 1e15, hue: 212 },
]

export const TIDEFALL_CURIOSITY_SHELVES: CuriosityShelfDef[] = [
  { id: 'hearthside', index: 'I', name: 'The Surface Omens', lore: 'Things seen where the moonless sea touches a sky it does not trust.', ids: ['moth', 'chimes', 'hearthkeeper', 'glass-garden'], rewardKind: 'stars', rewardName: 'Moonless Pull', reward: 'wandering bubble frequency +15%', rewardValue: 0.15 },
  { id: 'pilgrims', index: 'II', name: 'The Pelagic Signals', lore: 'Messages carried by migrations, impossible beams, and water moving inward.', ids: ['second-cursor', 'snail', 'aurora', 'door'], rewardKind: 'production', rewardName: 'Living Current', reward: 'all production ×1.18', rewardValue: 1.18 },
  { id: 'portents', index: 'III', name: 'The Abyssal Relics', lore: 'Objects recovered from depths where Tidefall remembers other skies.', ids: ['star-jar', 'metronome-heart', 'letter', 'orrery'], rewardKind: 'clicks', rewardName: 'Pressure Memory', reward: 'click power ×1.35', rewardValue: 1.35 },
]

export const TIDEFALL_RECORD =
  'KEEPER RECORD — THE SEA REMEMBERS UP\n\n' +
  'We removed the moons because we believed they commanded the tides. The water rose anyway.\n\n' +
  'It was never obedience. It was memory. Every tidepool kept the shape of a larger ocean inside it.\n\n' +
  'If another sky finds this signal, do not teach the sea to be still. Teach it where to return.\n\n— last keeper of the red tide beacon'

export const TIDEFALL_CABINET: CuriosityCabinetDef = {
  id: 'tidefall',
  title: 'The Pelagic Archive',
  surveyLabel: 'Tidefall depth survey',
  dockTitle: 'The Pelagic Archive',
  dockGlyph: '≋',
  items: TIDEFALL_CURIOSITIES,
  itemById: new Map(TIDEFALL_CURIOSITIES.map((item) => [item.id, item])),
  shelves: TIDEFALL_CURIOSITY_SHELVES,
  resonancePerItem: CABINET_RESONANCE_PER_ITEM,
  fuelHours: 3,
  fuelProductionMult: 1.08,
  returnCycleSec: 60 * 60,
  returnRateSeconds: 40 * 60,
  starItemRateBonus: 0.08,
  beatWindowBonus: 0.035,
  lines: {
    empty: 'Three depth bands wait beneath water that has never known a shore.',
    first: 'The sea becomes stranger, and less empty, once its movements have names.',
    chapter: 'Four phenomena now move as one current through the archive.',
    cosmology: 'This is no collection. It is an ocean remembering how to become a map.',
    complete: 'Every depth is charted. Together, the relics describe a current between worlds.',
  },
  archiveRecord: TIDEFALL_RECORD,
}

/** Protostar fueling economy (legacy state names remain save-compatible). */
export const PROTOSTAR_FUEL_HOURS = 2
export const PROTOSTAR_BONUS = 1.05
export const protostarFuelCost = (ratePerSec: EconomyAmount): EconomyAmount => maxAmount(
  amountFromNumber(100),
  multiplyAmountByNumber(ratePerSec, 300),
)

/** Long-period comet return cycle. */
export const COMET_ORBIT_SEC = 90 * 60
export const cometGift = (ratePerSec: EconomyAmount, rateSeconds = 1800): EconomyAmount => maxAmount(
  amountFromNumber(50),
  multiplyAmountByNumber(ratePerSec, rateSeconds),
)
