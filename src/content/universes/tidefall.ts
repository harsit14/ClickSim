import type { EchoDef } from '../echoes'
import type { GeneratorDef } from '../generators'
import type { LumenLine } from '../lumen'
import type { Effect, UpgradeDef } from '../upgrades'
import type { UniversePack } from './types'
import { TIDEFALL_CABINET } from '../curiosities'

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
law('ripple-memory', 'Ripple Memory', 'Every Droplet teaches the next Ripple how far it has traveled.', 25_000, { gen: 'wisp', count: 10 }, [
  { kind: 'synergy', gen: 'wisp', per: 'spark', value: 0.02 },
], '∞', 194)
law('tidepool-circles', 'Tidepool Circles', 'Ripples arrive carrying news from every nearby shore.', 300_000, { gen: 'hearth', count: 10 }, [
  { kind: 'synergy', gen: 'hearth', per: 'wisp', value: 0.01 },
], '∞', 174)
law('pearls-follow-wakes', 'Pearls Follow Wakes', 'A Moonwake makes irritation look like a destination.', 5e9, { gen: 'starseed', count: 10 }, [
  { kind: 'synergy', gen: 'starseed', per: 'beacon', value: 0.01 },
], '∞', 178)
law('beacon-is-tidepool', 'A Beacon Is a Tidepool', 'Only the distance from shore changes.', 2e12, { gen: 'sun', count: 10 }, [
  { kind: 'synergy', gen: 'sun', per: 'hearth', value: 0.005 },
], '∞', 200)
law('garden-currents', 'Garden Currents', 'Ripples carry invisible seeds down into the abyss.', 4e15, { gen: 'nebula', count: 10 }, [
  { kind: 'synergy', gen: 'nebula', per: 'wisp', value: 0.002 },
], '∞', 244)
law('cathedral-reef', 'Cathedral Reef', 'Every Reef Light becomes a window in the kelp.', 400e6, { gen: 'titan', count: 10 }, [
  { kind: 'synergy', gen: 'titan', per: 'forge', value: 0.01 },
], '∞', 152)
law('luminous-spawning', 'Luminous Spawning', 'Pearl Seeds open. The dark water answers in color.', 60e9, { gen: 'protostar', count: 10 }, [
  { kind: 'synergy', gen: 'protostar', per: 'starseed', value: 0.01 },
], '∞', 188)
law('twin-undertow', 'Twin Undertow', 'The smallest Ripples still pull at both tides.', 12e12, { gen: 'binary', count: 10 }, [
  { kind: 'synergy', gen: 'binary', per: 'wisp', value: 0.02 },
], '∞', 218)
law('shoal-mapping', 'Shoal Mapping', 'A Drowned Beacon gives the school something to circle.', 200e12, { gen: 'constellation', count: 10 }, [
  { kind: 'synergy', gen: 'constellation', per: 'sun', value: 0.01 },
], '∞', 190)
law('current-cartography', 'Current Cartography', 'Every bright shoal marks one route through the world-water.', 25e18, { gen: 'web', count: 10 }, [
  { kind: 'synergy', gen: 'web', per: 'constellation', value: 0.01 },
], '∞', 184)
law('trench-feeding', 'The Trench Feeds', 'The Living Sea lowers whole histories into the dreaming dark.', 500e18, { gen: 'loom', count: 10 }, [
  { kind: 'synergy', gen: 'loom', per: 'galaxy', value: 0.005 },
], '∞', 258)
law('wave-remembers-pools', 'The Wave Remembers Pools', 'Every little shore survives inside the shoreless wave.', 10e21, { gen: 'ember2', count: 1 }, [
  { kind: 'synergy', gen: 'ember2', per: 'hearth', value: 0.01 },
], '∞', 168)
law('trench-memory', 'Trench Memory', 'Pressure remembers every bright thing lowered into it.', 1e16, { gen: 'loom', count: 1 }, [
  { kind: 'globalMult', value: 2.5 },
], '◉', 258)

export const TIDEFALL_UPGRADES = upgrades

const TIDEFALL_LUMEN: LumenLine[] = [
  { id: 'tide-arrival', text: 'This dark is wet. That should be impossible. It is not the strangest thing here.', when: (g) => g.clicks >= 1 },
  { id: 'tide-droplet', text: 'A droplet with no gravity. It is waiting for the rest of the ocean.', when: (g) => (g.owned.spark ?? 0) >= 1 },
  { id: 'tide-turn', text: 'The glow is rising. Watch the pull; this universe pays attention to timing.', when: (g) => g.totalEarned >= 1e5 },
  { id: 'tide-beacon', text: 'That beacon is underwater. It has been calling longer than our universe was alive.', when: (g) => (g.owned.sun ?? 0) >= 1 },
  { id: 'tide-white-dwarf', text: 'The White Dwarf is reflected in water that has no surface. It has been here before us.', when: (g) => g.curiosities.includes('moth') },
  { id: 'tide-quasar', text: 'That Quasar beam is not crossing the sea. The sea is using it as a sounding line.', when: (g) => g.curiosities.includes('second-cursor') },
  { id: 'tide-horizon', text: 'They called the Black Hole a drain. Archives become inaccurate when they are frightened.', when: (g) => g.curiosities.includes('door') },
  { id: 'tide-first-circle', text: 'Six trials, and still you rise. This ocean has begun measuring its depth against you.', when: (g) => g.challengesDone.length >= 6 },
  { id: 'tide-all-trials', text: 'Twelve impossible tides endured. The sea is out of ways to make you smaller.', when: (g) => g.challengesDone.length >= 12 },
  { id: 'tide-trench', text: 'Do not mistake the bottom for emptiness. Something here learned to sleep under pressure.', when: (g) => (g.owned.loom ?? 0) >= 1 },
  { id: 'tide-second-wave', text: 'The Second Wave has no shore to break upon. Perhaps it is meant to cross instead.', when: (g) => (g.owned.ember2 ?? 0) >= 1 },
]

export const TIDEFALL_ECHOES: EchoDef[] = [
  {
    id: 'tide-salt-primer',
    title: 'The Salt Primer',
    provenance: 'scratched into the shell of the first tidepool',
    text: 'Lesson one: every shore is a promise the sea makes to stop. Lesson two: the sea has never kept it. Lesson three was washed away before anyone could decide whether that proved anything.',
    when: (g) => g.totalEarned >= 1e5,
  },
  {
    id: 'tide-drowned-observatory',
    title: 'The Drowned Observatory',
    provenance: 'a lens recovered beneath a reef that predates water',
    text: 'The astronomers lowered a White Dwarf into the ocean and called it a moon. A Magnetar rang beneath it. The tides became predictable for eleven minutes, which was long enough to build a calendar and short enough to regret doing so.',
    when: (g) => (g.owned.forge ?? 0) >= 10,
  },
  {
    id: 'tide-moon-ledger',
    title: 'Ledger of Missing Moons',
    provenance: 'pressed into salt-glass beneath the first tidepool',
    text: 'Moon one: gone. Moon two: gone. Moon three: never rose. The sea continued its devotions without them. In the final margin: “Perhaps obedience can outlive its reason. Perhaps that is what hope is.”',
    when: (g) => g.totalEarned >= 1e8,
  },
  {
    id: 'tide-quasar-sounding',
    title: 'Quasar Sounding No. 7',
    provenance: 'a beam-width measured in the margin of a drowned chart',
    text: 'We aimed the Quasar through the deepest water. Its pulse returned before we sent it, carrying a map of trenches not yet formed. At the bottom of every future trench, the same small door waited.',
    when: (g) => (g.owned.beacon ?? 0) >= 10,
  },
  {
    id: 'tide-red-giant-buoy',
    title: 'The Red Giant Buoy',
    provenance: 'a warning light still swelling beyond its brass housing',
    text: 'The Red Giant was supposed to mark the safe water. It grew until every direction looked safe and the sailors stopped believing in direction. The oldest captain tied herself to its light and called that navigation.',
    when: (g) => (g.owned.protostar ?? 0) >= 1,
  },
  {
    id: 'tide-mouth-chart',
    title: 'Chart of the Black Mouth',
    provenance: 'ink pulled into a perfect circle around an absent center',
    text: 'Do not call it a drain. A drain empties somewhere. This Black Hole accepts the sea, the moons, and every explanation we lower after them. Nothing arrives elsewhere. Something merely becomes more certain here.',
    when: (g) => (g.owned.sun ?? 0) >= 1,
  },
  {
    id: 'tide-shoal-constitution',
    title: 'The Shoal Constitution',
    provenance: 'signed by nine thousand lights moving as one',
    text: 'No star shall cross the dark alone. No small light shall be mistaken for an insignificant one. When the great appetite returns, we will scatter—not from fear, but so the universe must learn every name before it can swallow us.',
    when: (g) => (g.owned.constellation ?? 0) >= 1,
  },
  {
    id: 'tide-last-ocean-census',
    title: 'Census of the Last Ocean',
    provenance: 'a roll of names too long to remain dry',
    text: 'The census counted currents, reefs, remembered moons, and one Supermassive Black Hole mistaken for a horizon. Final population: everything. Final correction, in another hand: everything we managed to name.',
    when: (g) => (g.owned.galaxy ?? 0) >= 1,
  },
  {
    id: 'tide-last-diver',
    title: 'The Last Diver',
    provenance: 'a voice trapped in a pearl, still counting downward',
    text: 'At the trench floor I found no monster. I found a door made of pressure, opening inward. Something on the other side was dreaming of sunlight. I did not knock. I am brave, not rude.',
    when: (g) => (g.owned.loom ?? 0) >= 1,
  },
  {
    id: 'tide-second-wave-testimony',
    title: 'Testimony of the Second Wave',
    provenance: 'heard simultaneously from every shore that never existed',
    text: 'The moons did not command us. The old hunger did not summon us. We rise because every tidepool kept a shape of the ocean inside itself, and at last those small memories agreed to become vast again.',
    when: (g) => (g.owned.ember2 ?? 0) >= 1,
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
  centralObject: 'Tidewell',
  achievementPower: 'Resonance',
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
  audio: { music: 'tidefall', click: 'tidefall', event: 'tidefall' },
  events: {
    noun: 'wandering bubble',
    motion: 'bubble',
    powerUps: [
      { id: 'spring-tide', label: 'Spring Tide', glyph: '≈9', hue: 182, weight: 42, prodMult: 9, clickMult: 3, durationSec: 54, toast: 'The moonless sea rises through everything you have made.' },
      { id: 'undertow', label: 'Undertow', glyph: '×333', hue: 216, weight: 38, prodMult: 2, clickMult: 333, durationSec: 21, toast: 'Every touch catches the current beneath the current.' },
      { id: 'moon-pearl', label: 'Moon Pearl', glyph: '+20m', hue: 162, weight: 17, prodMult: 2, durationSec: 90, rateSeconds: 1200, minAward: 50, toast: 'A compressed tide opens: stored {currency} now, a living current after.' },
      { id: 'abyssal-bloom', label: 'Abyssal Bloom', glyph: '×25', hue: 268, weight: 3, prodMult: 25, clickMult: 25, durationSec: 12, toast: 'For twelve seconds, the bottom of the sea blooms upward.' },
    ],
  },
  cabinet: TIDEFALL_CABINET,
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
