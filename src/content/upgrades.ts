import { GENERATORS, GENERATOR_BY_ID } from './generators'

export type Effect =
  | { kind: 'genMult'; gen: string; value: number }
  | { kind: 'globalMult'; value: number }
  | { kind: 'clickMult'; value: number }
  | { kind: 'clickShare'; value: number } // clicks gain this fraction of light/s
  | { kind: 'synergy'; gen: string; per: string; value: number } // gen +value fraction per `per` owned

export interface Unlock {
  gen?: string
  count?: number
  totalEarned?: number
  clicks?: number
}

export interface UpgradeDef {
  id: string
  name: string
  flavor: string
  cost: number
  glyph: string
  hue: number
  unlock: Unlock
  effects: Effect[]
}

export function describeEffect(e: Effect): string {
  const gen = (id: string) => GENERATOR_BY_ID.get(id)?.name ?? id
  switch (e.kind) {
    case 'genMult':
      return `${gen(e.gen)} production ×${e.value}`
    case 'globalMult':
      return `all light ×${e.value}`
    case 'clickMult':
      return `clicks ×${e.value}`
    case 'clickShare':
      return `clicks gain +${e.value * 100}% of light/s`
    case 'synergy':
      return `${gen(e.gen)} +${(e.value * 100).toFixed(1)}% per ${gen(e.per)}`
  }
}

const upgrades: UpgradeDef[] = []

// ── Tiered generator refinements: ×2 at 10 / 25 / 50 owned ─────────────
const REFINEMENTS = [
  { at: 10, costMult: 15, adj: 'Kindled', glyph: 'I', flavor: 'They burn brighter now.' },
  { at: 25, costMult: 75, adj: 'Radiant', glyph: 'II', flavor: 'They hum with purpose.' },
  { at: 50, costMult: 750, adj: 'Incandescent', glyph: 'III', flavor: 'They no longer flicker.' },
]
for (const g of GENERATORS) {
  for (const r of REFINEMENTS) {
    upgrades.push({
      id: `${g.id}-${r.at}`,
      name: `${r.adj} ${g.name}`,
      flavor: r.flavor,
      cost: Math.round(g.baseCost * r.costMult),
      glyph: r.glyph,
      hue: g.hue,
      unlock: { gen: g.id, count: r.at },
      effects: [{ kind: 'genMult', gen: g.id, value: 2 }],
    })
  }
}

// ── Click line ──────────────────────────────────────────────────────────
const click = (
  id: string,
  name: string,
  flavor: string,
  cost: number,
  clicks: number,
  effects: Effect[],
) => upgrades.push({ id, name, flavor, cost, glyph: '✦', hue: 42, unlock: { clicks }, effects })

click('ember-touch', 'Ember Touch', 'It knows your hand now.', 60, 10, [
  { kind: 'clickMult', value: 2 },
])
click('steady-hand', 'Steady Hand', 'The trembling stops.', 750, 60, [
  { kind: 'clickMult', value: 2 },
])
click('cinder-grip', 'Cinder Grip', 'Hold the heat. Let it hold back.', 8_000, 180, [
  { kind: 'clickMult', value: 2 },
  { kind: 'clickShare', value: 0.005 },
])
click('afterglow', 'Afterglow', 'Every touch lingers.', 150_000, 500, [
  { kind: 'clickShare', value: 0.015 },
])
click('solar-knuckle', 'Solar Knuckle', 'You could crack a mountain. Gently.', 10e6, 1_200, [
  { kind: 'clickMult', value: 3 },
])
click('gravity-of-attention', 'Gravity of Attention', 'Where you look, light gathers.', 1e9, 3_000, [
  { kind: 'clickShare', value: 0.04 },
])

// ── Global dawns: ×2 everything at milestones ───────────────────────────
const dawn = (id: string, name: string, flavor: string, cost: number, totalEarned: number) =>
  upgrades.push({
    id,
    name,
    flavor,
    cost,
    glyph: '✳',
    hue: 48,
    unlock: { totalEarned },
    effects: [{ kind: 'globalMult', value: 2 }],
  })

dawn('first-light', 'First Light', 'The dark noticed. It said nothing.', 10_000, 5_000)
dawn('gathering-glow', 'Gathering Glow', 'Warmth, remembering itself.', 1e6, 5e5)
dawn('break-of-dawn', 'Break of Dawn', 'Somewhere, a horizon.', 1e8, 5e7)
dawn('little-noon', 'Little Noon', 'Shadows, for the first time in eons.', 1e10, 5e9)
dawn('true-noon', 'True Noon', 'No shadows at all.', 1e13, 5e12)
dawn('endless-day', 'Endless Day', 'The old universe never managed this.', 1e16, 5e15)

// ── Synergies: the web begins ───────────────────────────────────────────
upgrades.push(
  {
    id: 'wisp-chorus',
    name: 'Wisp Chorus',
    flavor: 'They sing to the sparks. The sparks sing back.',
    cost: 25_000,
    glyph: '∞',
    hue: 190,
    unlock: { gen: 'wisp', count: 10 },
    effects: [{ kind: 'synergy', gen: 'wisp', per: 'spark', value: 0.02 }],
  },
  {
    id: 'hearth-gathering',
    name: 'Hearth Gathering',
    flavor: 'Every wisp brings a little kindling home.',
    cost: 300_000,
    glyph: '∞',
    hue: 18,
    unlock: { gen: 'hearth', count: 10 },
    effects: [{ kind: 'synergy', gen: 'hearth', per: 'wisp', value: 0.01 }],
  },
  {
    id: 'seed-beacons',
    name: 'Seeds Follow Beacons',
    flavor: 'They drift toward the calling light.',
    cost: 5e9,
    glyph: '∞',
    hue: 80,
    unlock: { gen: 'starseed', count: 10 },
    effects: [{ kind: 'synergy', gen: 'starseed', per: 'beacon', value: 0.01 }],
  },
  {
    id: 'sun-of-hearths',
    name: 'A Sun Is a Hearth',
    flavor: 'Just one that everyone can sit around.',
    cost: 2e12,
    glyph: '∞',
    hue: 45,
    unlock: { gen: 'sun', count: 10 },
    effects: [{ kind: 'synergy', gen: 'sun', per: 'hearth', value: 0.005 }],
  },
  {
    id: 'garden-wisps',
    name: 'Gardener Wisps',
    flavor: 'Someone has to water the nebulae.',
    cost: 4e15,
    glyph: '∞',
    hue: 280,
    unlock: { gen: 'nebula', count: 10 },
    effects: [{ kind: 'synergy', gen: 'nebula', per: 'wisp', value: 0.002 }],
  },
  {
    id: 'titan-heart',
    name: 'Titan’s Heart',
    flavor: 'Every forge feeds the great furnace.',
    cost: 400e6,
    glyph: '∞',
    hue: 8,
    unlock: { gen: 'titan', count: 10 },
    effects: [{ kind: 'synergy', gen: 'titan', per: 'forge', value: 0.01 }],
  },
  {
    id: 'nursery-rows',
    name: 'Nursery Rows',
    flavor: 'Seeds, planted in tidy lines across the dark.',
    cost: 60e9,
    glyph: '∞',
    hue: 200,
    unlock: { gen: 'protostar', count: 10 },
    effects: [{ kind: 'synergy', gen: 'protostar', per: 'starseed', value: 0.01 }],
  },
  {
    id: 'binary-waltz',
    name: 'Binary Waltz',
    flavor: 'The wisps taught them the steps.',
    cost: 12e12,
    glyph: '∞',
    hue: 55,
    unlock: { gen: 'binary', count: 10 },
    effects: [{ kind: 'synergy', gen: 'binary', per: 'wisp', value: 0.02 }],
  },
  {
    id: 'stellar-cartography',
    name: 'Stellar Cartography',
    flavor: 'A constellation is only as rich as its stars.',
    cost: 200e12,
    glyph: '∞',
    hue: 210,
    unlock: { gen: 'constellation', count: 10 },
    effects: [{ kind: 'synergy', gen: 'constellation', per: 'sun', value: 0.01 }],
  },
  {
    id: 'web-weft',
    name: 'Weft of the Web',
    flavor: 'The filaments run through every drawn figure.',
    cost: 25e18,
    glyph: '∞',
    hue: 175,
    unlock: { gen: 'web', count: 10 },
    effects: [{ kind: 'synergy', gen: 'web', per: 'constellation', value: 0.01 }],
  },
  {
    id: 'loom-threads',
    name: 'Galaxy Thread',
    flavor: 'The loom weaves with what you give it.',
    cost: 500e18,
    glyph: '∞',
    hue: 320,
    unlock: { gen: 'loom', count: 10 },
    effects: [{ kind: 'synergy', gen: 'loom', per: 'galaxy', value: 0.005 }],
  },
  {
    id: 'ember-kinship',
    name: 'Kinship of Embers',
    flavor: 'It warms to every hearth you have ever lit.',
    cost: 10e21,
    glyph: '∞',
    hue: 0,
    unlock: { gen: 'ember2', count: 1 },
    effects: [{ kind: 'synergy', gen: 'ember2', per: 'hearth', value: 0.01 }],
  },
)

export const UPGRADES: UpgradeDef[] = upgrades
