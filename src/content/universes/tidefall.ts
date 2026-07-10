import type { EchoDef } from '../echoes'
import type { GeneratorDef } from '../generators'
import type { LumenLine } from '../lumen'
import type { Effect, UpgradeDef } from '../upgrades'
import type { UniversePack } from './types'

const G = (
  tier: number,
  id: string,
  name: string,
  baseCost: number,
  baseRate: number,
  hue: number,
  flavor: string,
): GeneratorDef => ({ id, name, flavor, baseCost, baseRate, costMult: 1.15, tier, hue })

export const TIDEFALL_GENERATORS: GeneratorDef[] = [
  G(1, 'spark', 'Droplet', 15, 0.3, 186, 'A bead of glow that refuses to fall.'),
  G(2, 'wisp', 'Ripple', 180, 2.8, 194, 'A circle traveling through an ocean that is not there.'),
  G(3, 'hearth', 'Tidepool', 2_200, 24, 174, 'A shallow world with its own patient moon.'),
  G(4, 'kiln', 'Current', 26_000, 200, 202, 'Glow that has decided where it is going.'),
  G(5, 'forge', 'Reef Light', 320_000, 1_700, 164, 'A city of small colors, building itself sideways.'),
  G(6, 'beacon', 'Moonwake', 4e6, 14_000, 210, 'The path left by a moon that never arrived.'),
  G(7, 'titan', 'Kelp Cathedral', 51e6, 120_000, 152, 'Its bells are roots. Its prayers are pressure.'),
  G(8, 'starseed', 'Pearl Seed', 650e6, 1e6, 178, 'An irritation, given enough centuries to become beautiful.'),
  G(9, 'protostar', 'Bioluminance', 8.2e9, 8.6e6, 188, 'Life’s oldest answer to a dark sea.'),
  G(10, 'sun', 'Drowned Beacon', 105e9, 72e6, 200, 'Still calling from beneath a sky of water.'),
  G(11, 'binary', 'Twin Tides', 1.6e12, 610e6, 218, 'One rises because the other remembers falling.'),
  G(12, 'constellation', 'Shoal Constellation', 27e12, 5.2e9, 190, 'Stars schooling together for safety.'),
  G(13, 'nebula', 'Abyssal Garden', 450e12, 44e9, 244, 'Flowers opening where light should have drowned.'),
  G(14, 'galaxy', 'The Living Sea', 8e15, 370e9, 176, 'Every current carries a name.'),
  G(15, 'supercluster', 'Ocean of Moons', 150e15, 3.1e12, 224, 'A million silver pulls, agreeing for one moment.'),
  G(16, 'web', 'World Current', 3e18, 27e12, 184, 'The route all water takes between beginnings.'),
  G(17, 'loom', 'The Deep Trench', 60e18, 230e12, 258, 'Something at the bottom is dreaming upward.'),
  G(18, 'ember2', 'The Second Wave', 1.3e21, 2e15, 168, 'It rises without shore, wind, or moon.'),
]

const upgrades: UpgradeDef[] = []
const refinements = [
  { at: 10, costMult: 15, adjective: 'Rising', glyph: 'I', flavor: 'The pull grows surer.' },
  { at: 25, costMult: 75, adjective: 'Cresting', glyph: 'II', flavor: 'Every current leans the same way.' },
  { at: 50, costMult: 750, adjective: 'Moon-Pulled', glyph: 'III', flavor: 'The absent moon is absent no longer.' },
]

for (const generator of TIDEFALL_GENERATORS) {
  for (const refinement of refinements) {
    upgrades.push({
      id: `${generator.id}-${refinement.at}`,
      name: `${refinement.adjective} ${generator.name}`,
      flavor: refinement.flavor,
      cost: Math.round(generator.baseCost * refinement.costMult),
      glyph: refinement.glyph,
      hue: generator.hue,
      unlock: { gen: generator.id, count: refinement.at },
      effects: [{ kind: 'genMult', gen: generator.id, value: 2 }],
    })
  }
}

const law = (
  id: string,
  name: string,
  flavor: string,
  cost: number,
  unlock: UpgradeDef['unlock'],
  effects: Effect[],
  glyph = '≈',
  hue = 188,
) => upgrades.push({ id, name, flavor, cost, glyph, hue, unlock, effects })

law('undertow-touch', 'Undertow Touch', 'The water pulls back when your hand arrives.', 60, { clicks: 10 }, [
  { kind: 'clickMult', value: 2 },
])
law('crest-timing', 'Crest Timing', 'Touch the instant before the wave knows it has risen.', 8_000, { clicks: 180 }, [
  { kind: 'clickMult', value: 2 },
  { kind: 'clickShare', value: 0.01 },
])
law('moon-pull', 'Moon Pull', 'No moon is visible. The sea obeys anyway.', 10_000, { totalEarned: 5_000 }, [
  { kind: 'globalMult', value: 2 },
], '☾', 214)
law('spring-tide', 'Spring Tide', 'Every small current votes for the same horizon.', 1e8, { totalEarned: 5e7 }, [
  { kind: 'globalMult', value: 2 },
])
law('reef-accord', 'Reef Accord', 'Every Tidepool leaves a little color on the reef.', 3e8, { gen: 'forge', count: 10 }, [
  { kind: 'synergy', gen: 'forge', per: 'hearth', value: 0.008 },
], '∞', 164)
law('trench-memory', 'Trench Memory', 'Pressure remembers every bright thing lowered into it.', 1e16, { gen: 'loom', count: 1 }, [
  { kind: 'globalMult', value: 2.5 },
], '◉', 258)

export const TIDEFALL_UPGRADES = upgrades

const TIDEFALL_LUMEN: LumenLine[] = [
  { id: 'tide-arrival', text: 'This dark is wet. That should be impossible. It is not the strangest thing here.', when: (g) => g.clicks >= 1 },
  { id: 'tide-droplet', text: 'A droplet with no gravity. It is waiting for the rest of the ocean.', when: (g) => (g.owned.spark ?? 0) >= 1 },
  { id: 'tide-turn', text: 'The glow is rising. Watch the pull; this universe pays attention to timing.', when: (g) => g.totalEarned >= 1e5 },
  { id: 'tide-beacon', text: 'That beacon is underwater. It has been calling longer than our universe was alive.', when: (g) => (g.owned.sun ?? 0) >= 1 },
  { id: 'tide-trench', text: 'Do not mistake the bottom for emptiness. Something here learned to sleep under pressure.', when: (g) => (g.owned.loom ?? 0) >= 1 },
  { id: 'tide-second-wave', text: 'The Second Wave has no shore to break upon. Perhaps it is meant to cross instead.', when: (g) => (g.owned.ember2 ?? 0) >= 1 },
]

const TIDEFALL_ECHOES: EchoDef[] = [
  {
    id: 'tide-moon-ledger',
    title: 'Ledger of Missing Moons',
    provenance: 'pressed into salt-glass beneath the first tidepool',
    text: 'Moon one: gone. Moon two: gone. Moon three: never rose. The sea continued its devotions without them. In the final margin: “Perhaps obedience can outlive its reason. Perhaps that is what hope is.”',
    when: (g) => g.totalEarned >= 1e8,
  },
  {
    id: 'tide-last-diver',
    title: 'The Last Diver',
    provenance: 'a voice trapped in a pearl, still counting downward',
    text: 'At the trench floor I found no monster. I found a door made of pressure, opening inward. Something on the other side was dreaming of sunlight. I did not knock. I am brave, not rude.',
    when: (g) => (g.owned.loom ?? 0) >= 1,
  },
]

const TIDE_PERIOD_MS = 90_000
export const tidefallRateMultiplier = (timeMs: number) =>
  1 + 0.4 * Math.sin((timeMs / TIDE_PERIOD_MS) * Math.PI * 2)

export const TIDEFALL: UniversePack = {
  id: 'tidefall',
  name: 'The Tidefall',
  shortName: 'Tidefall',
  currency: 'Glow',
  currencyGlyph: '≈',
  description: 'A moonless ocean where production rises and falls on a visible ninety-second tide.',
  generators: TIDEFALL_GENERATORS,
  generatorById: new Map(TIDEFALL_GENERATORS.map((generator) => [generator.id, generator])),
  upgrades: TIDEFALL_UPGRADES,
  upgradeById: new Map(TIDEFALL_UPGRADES.map((upgrade) => [upgrade.id, upgrade])),
  lumen: TIDEFALL_LUMEN,
  echoes: TIDEFALL_ECHOES,
  palette: {
    theme: 'tidefall',
    accentHue: 188,
    vars: {
      '--bg': '#030b12',
      '--amber': '#58ded8',
      '--gold': '#b9fff2',
      '--panel': 'rgba(7, 24, 34, 0.82)',
    },
  },
  musicMode: 'tidefall',
  twist: {
    id: 'living-tide',
    name: 'The Living Tide',
    randomnessAllowed: true,
    description: 'Production swells from ×0.60 to ×1.40 over a ninety-second tide.',
    rateMultiplier: tidefallRateMultiplier,
  },
  route: {
    glyph: '≈',
    epithet: 'the moonless sea',
    arrival: 'a tide rises in a universe with no moon',
    unlockText: 'light Emberlight’s Beacon',
  },
  beacon: {
    generatorId: 'ember2',
    count: 1,
    reward: 2,
    description: 'The Second Wave rises high enough to be seen between universes.',
  },
}
