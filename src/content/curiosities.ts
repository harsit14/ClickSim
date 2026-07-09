/** Curiosities — one-shot oddities that live on the screen, not in the numbers.
 *  Inspired by the novelty density of neal.fun's Stimulation Clicker,
 *  filtered through EMBER's "warm place" rule: nothing here punishes. */
export interface CuriosityDef {
  id: string
  name: string
  flavor: string
  desc: string
  cost: number
  hue: number
  /** rows with special UI in the cabinet */
  kind?: 'hearthkeeper' | 'snail' | 'letter' | 'door'
}

export const CURIOSITIES: CuriosityDef[] = [
  {
    id: 'moth',
    name: 'A Moth',
    flavor: 'It found the brightest thing in the universe. It stayed.',
    desc: 'orbits the ember, forever',
    cost: 1e6,
    hue: 40,
  },
  {
    id: 'chimes',
    name: 'Wind Chimes',
    flavor: 'Strung on nothing, tuned to the key of the dark.',
    desc: 'a soft note rings out, now and then',
    cost: 5e6,
    hue: 190,
  },
  {
    id: 'hearthkeeper',
    name: 'The Hearthkeeper',
    flavor: 'A wisp with a tiny rake and enormous opinions about coals.',
    desc: 'feed it light; while fed, all production +5%. it never dies — it sulks',
    cost: 25e6,
    hue: 18,
    kind: 'hearthkeeper',
  },
  {
    id: 'glass-garden',
    name: 'A Garden of Glass',
    flavor: 'Flowers that grew once, elsewhere. They remember how to shine.',
    desc: 'crystal blossoms take root in the void',
    cost: 1e8,
    hue: 280,
  },
  {
    id: 'second-cursor',
    name: 'A Second Cursor',
    flavor: 'It is not copying you. It is keeping you company.',
    desc: 'a ghost hand clicks the ember once per beat',
    cost: 5e8,
    hue: 200,
  },
  {
    id: 'snail',
    name: 'The Lighthouse Snail',
    flavor: 'Slowest pilgrim in creation. Carries its own beacon.',
    desc: 'crosses the void in about 90 minutes; each arrival brings a gift',
    cost: 2e9,
    hue: 90,
    kind: 'snail',
  },
  {
    id: 'aurora',
    name: 'Bottled Aurora',
    flavor: 'Do not open. Or do.',
    desc: 'a ribbon of borrowed sky, unbottled across yours',
    cost: 1e10,
    hue: 160,
  },
  {
    id: 'door',
    name: 'A Small Door',
    flavor: 'It has no wall. It is locked. Nobody knows.',
    desc: 'stands in the void. it will know when to open',
    cost: 1e11,
    hue: 50,
    kind: 'door',
  },
  {
    id: 'star-jar',
    name: 'Star in a Jar',
    flavor: 'Caught fair and square. It doesn’t mind. Probably.',
    desc: 'falling stars come 5% more often',
    cost: 1e12,
    hue: 55,
  },
  {
    id: 'metronome-heart',
    name: 'The Metronome Heart',
    flavor: 'It beats with the music because it always has.',
    desc: 'the beat window widens by 20ms',
    cost: 1e13,
    hue: 340,
  },
  {
    id: 'letter',
    name: 'A Letter, Unsent',
    flavor: 'Addressed to the old universe. Postage impossible.',
    desc: 'can be read. once you own a thing like this, you must',
    cost: 1e14,
    hue: 30,
    kind: 'letter',
  },
  {
    id: 'orrery',
    name: 'The Orrery of Wishes',
    flavor: 'Every universe that might yet be, in brass and light.',
    desc: 'spins slowly in the corner of the sky. some of the worlds look... reachable',
    cost: 1e15,
    hue: 45,
  },
]

export const CURIOSITY_BY_ID = new Map(CURIOSITIES.map((c) => [c.id, c]))

export const LETTER_TEXT =
  'To whoever tends the next one —\n\n' +
  'We knew, at the end. Most of us. We were not afraid, or we were, and it stopped mattering, which is the same thing worn smooth.\n\n' +
  'The light was worth the burning. Write that down somewhere it will survive.\n\n' +
  'Feed the moths for us.\n\n— The Last Gardeners'

/** Hearthkeeper economy */
export const KEEPER_FED_HOURS = 2
export const KEEPER_BONUS = 1.05
export const keeperMealCost = (ratePerSec: number) => Math.max(100, ratePerSec * 300)

/** Lighthouse Snail */
export const SNAIL_CROSSING_SEC = 90 * 60
export const snailGift = (ratePerSec: number) => Math.max(50, ratePerSec * 1800)

/** Ghost companion */
export const SECOND_CURSOR_CPS = 1.2
