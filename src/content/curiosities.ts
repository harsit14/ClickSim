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
  },
]

export const CURIOSITY_RESONANCE_PER_ITEM = 0.01

const uniqueKnownCuriosities = (held: readonly string[]) =>
  new Set(held.filter((id) => CURIOSITY_BY_ID.has(id)))

export function curiosityShelfProgress(held: readonly string[], shelf: CuriosityShelfDef): number {
  const owned = uniqueKnownCuriosities(held)
  return shelf.ids.filter((id) => owned.has(id)).length
}

export function curiosityShelfComplete(held: readonly string[], shelfId: CuriosityShelfId): boolean {
  const shelf = CURIOSITY_SHELVES.find((entry) => entry.id === shelfId)
  return !!shelf && curiosityShelfProgress(held, shelf) === shelf.ids.length
}

export function completedCuriosityShelves(held: readonly string[]): number {
  return CURIOSITY_SHELVES.filter((shelf) => curiosityShelfComplete(held, shelf.id)).length
}

/** Every find resonates; the first shelf adds its own capstone harmony. */
export function curiosityProductionMult(held: readonly string[]): number {
  const resonance = 1 + uniqueKnownCuriosities(held).size * CURIOSITY_RESONANCE_PER_ITEM
  return resonance * (curiosityShelfComplete(held, 'hearthside') ? 1.1 : 1)
}

export function curiosityClickMult(held: readonly string[]): number {
  return curiosityShelfComplete(held, 'pilgrims') ? 1.25 : 1
}

export function curiosityStarRateBonus(held: readonly string[]): number {
  return curiosityShelfComplete(held, 'portents') ? 0.1 : 0
}

export const RED_GIANT_RECORD =
  'SPECTRAL RECORD 7 — THE LAST GARDENERS\n\n' +
  'To whoever tends the next light: we knew the end was coming. Most of us. We were afraid until fear became another kind of weather.\n\n' +
  'The light was worth the burning. Write that somewhere gravity cannot erase.\n\n' +
  'If the old routes open again, do not mistake another sky for an empty one. Someone may already be tending it.\n\n— transmitted from a star with no surviving name'

/** Protostar fueling economy (legacy state names remain save-compatible). */
export const PROTOSTAR_FUEL_HOURS = 2
export const PROTOSTAR_BONUS = 1.05
export const protostarFuelCost = (ratePerSec: number) => Math.max(100, ratePerSec * 300)

/** Long-period comet return cycle. */
export const COMET_ORBIT_SEC = 90 * 60
export const cometGift = (ratePerSec: number) => Math.max(50, ratePerSec * 1800)
