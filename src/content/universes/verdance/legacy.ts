import type { CuriosityCabinetDef, CuriosityDef, CuriosityShelfDef } from '../../curiosities'
import type { EchoDef } from '../../echoes'
import type { GeneratorDef } from '../../generators'
import type { LumenLine } from '../../lumen'
import type { UpgradeDef } from '../../upgrades'
import type { UniversePack } from '../types'
import { amountFromNumber, gteAmount } from '../../../core/numeric/amount'

const KINDLING_NAMES = [
  'Memory Seed', 'Root Hair', 'Pale Sprout', 'Moss Cradle', 'Mycelium Thread', 'Young Grove',
  'Pollinator Choir', 'Amber Orchard', 'Heartwood', 'Rain Canopy', 'Walking Mangrove',
  'Forest Constellation', 'Continental Rhizome', 'Photosphere Bloom', 'Biosphere Crown',
  'World Root', 'The Remembering Forest', 'The World-Tree',
] as const

const KINDLING_FLAVOR = [
  'A sealed memory waiting for pressure, water, and permission.',
  'The smallest root is already choosing a direction.',
  'A first leaf learning the shape of light.',
  'Soft ground that remembers every footstep as weather.',
  'A pale conversation traveling beneath the visible world.',
  'Many trunks agreeing to shelter one another.',
  'Wings and flowers keeping time without a clock.',
  'Sunlight stored as resin, sweetness, and patient years.',
  'The slow architecture at the center of every promise.',
  'A roof that turns falling water into shared abundance.',
  'A forest willing to move when the shore moves first.',
  'A canopy whose clearings repeat an older sky.',
  'Roots joining continents into one listening body.',
  'Leaves bright enough to photosynthesize starlight.',
  'A living atmosphere wearing the planet like a crown.',
  'Every biome connected below the reach of weather.',
  'A forest that keeps loss as rings instead of wounds.',
  'The whole patient world, finally able to grow beyond itself.',
] as const

const generator = (index: number, name: string, flavor: string): GeneratorDef => ({
  id: `u3-kindling-${String(index + 1).padStart(2, '0')}`,
  name,
  flavor,
  baseCost: index === 0 ? 15 : Math.round(15 * 12.2 ** index),
  baseRate: index === 0 ? 0.3 : 0.3 * 8.4 ** index,
  costMult: 1.15,
  tier: index + 1,
  hue: 72 + (index * 9) % 86,
})

export const VERDANCE_GENERATORS: GeneratorDef[] = KINDLING_NAMES.map((name, index) => (
  generator(index, name, KINDLING_FLAVOR[index])
))

const refinements = [
  { count: 10, multiplier: 15, adjective: 'Rooted', glyph: 'I' },
  { count: 25, multiplier: 75, adjective: 'Mature', glyph: 'II' },
  { count: 50, multiplier: 750, adjective: 'Ancient', glyph: 'III' },
] as const

export const VERDANCE_UPGRADES: UpgradeDef[] = VERDANCE_GENERATORS.flatMap((entry) => (
  refinements.map((refinement) => ({
    id: `${entry.id}-${refinement.count}`,
    name: `${refinement.adjective} ${entry.name}`,
    flavor: 'Age does not repeat the same growth. It deepens it.',
    cost: Math.round(entry.baseCost * refinement.multiplier),
    glyph: refinement.glyph,
    hue: entry.hue,
    unlock: { gen: entry.id, count: refinement.count },
    effects: [{ kind: 'genMult' as const, gen: entry.id, value: 2 }],
  }))
))

VERDANCE_UPGRADES.push(
  { id: 'u3-upgrade-seedcoat', name: 'Open Seedcoat', flavor: 'The first touch becomes a season.', cost: 60, glyph: '❧', hue: 92, unlock: { clicks: 10 }, effects: [{ kind: 'clickMult', value: 2 }] },
  { id: 'u3-upgrade-rhizome', name: 'Rhizome Accord', flavor: 'Every root lends strength to the next.', cost: 45_000, glyph: '⌇', hue: 112, unlock: { gen: 'u3-kindling-05', count: 10 }, effects: [{ kind: 'synergy', gen: 'u3-kindling-05', per: 'u3-kindling-02', value: 0.012 }] },
  { id: 'u3-upgrade-canopy', name: 'Shared Canopy', flavor: 'Nothing beneath it grows alone.', cost: 8e8, glyph: '⌒', hue: 82, unlock: { gen: 'u3-kindling-10', count: 10 }, effects: [{ kind: 'globalMult', value: 2 }] },
  { id: 'u3-upgrade-seedbank', name: 'Seedbank Memory', flavor: 'A careful ending shortens every beginning.', cost: 2e12, glyph: '◇', hue: 68, unlock: { gen: 'u3-kindling-14', count: 1 }, effects: [{ kind: 'globalMult', value: 2.5 }] },
)

const ARCHIVE_NAMES = [
  'Resurrection Fern', 'Moon Orchid', 'Walking Mangrove', 'Glass Lichen',
  'Memory Amber', 'Choir Fungus', 'Compass Vine', 'Lightning Oak',
  'Star Pollen', 'Ocean Seed', 'Root Fossil', 'Garden Gate Cutting',
] as const
const ARCHIVE_GLYPHS = ['⌁', '✾', '⌇', '◇', '◈', '≋', '↗', 'ϟ', '✦', '◉', '⌁', '❧'] as const

export const VERDANCE_CURIOSITIES: CuriosityDef[] = ARCHIVE_NAMES.map((name, index) => ({
  id: `u3-archive-${String(index + 1).padStart(2, '0')}`,
  name,
  glyph: ARCHIVE_GLYPHS[index],
  classification: `${index < 4 ? 'survival' : index < 8 ? 'communication' : 'inheritance'} specimen · herbarium ${String(index + 1).padStart(2, '0')}`,
  flavor: [
    'A leaf that closes around drought and opens after centuries.',
    'Its petals track a moon this world has never possessed.',
    'Roots become legs when the old shore stops returning.',
    'Transparent scales grow wherever two incompatible biomes touch.',
    'A season held in gold without pretending it is still alive.',
    'Fruiting bodies trade warnings as breath and harmony.',
    'Every tendril points toward the nearest safe future.',
    'Its rings preserve storms as branching silver scars.',
    'A flower’s message small enough to cross a vacuum.',
    'A seed carrying the memory of tides inside a dry shell.',
    'Proof that the first forest also learned how to end.',
    'One living cutting taken from a place with seven skies.',
  ][index],
  record: [
    'It survived by becoming almost nothing. The first lesson of Verdance is that rest can be an action.',
    'The orchid turns toward the same absence that pulls Tidefall. Its pollen contains a map of a removed moon.',
    'The mangrove moved one root at a time while the oceans withdrew. Preservation required migration.',
    'The lichen is two species refusing to call cooperation surrender.',
    'Memory Amber preserves change as sequence, not as a frozen perfect moment.',
    'The fungus warns distant groves before disease arrives. The warning is shaped like a chord.',
    'Compass Vine grows toward possibility rather than light. Clockwork diagrams appear in its branching angles.',
    'Lightning Oak stores every discharge but releases the charge harmlessly into new roots.',
    'Star Pollen germinates only after crossing the dark between worlds.',
    'Ocean Seed opens into a tidepool, then waits for a shore to volunteer.',
    'Root Fossil records the civilization’s final mistake: nothing was allowed to fall.',
    'The cutting recognizes the player’s touch as one of the conditions required for a Garden.',
  ][index],
  desc: [
    'strengthens offline aging', 'reveals lunar growth cycles', 'improves planted starts', 'links unlike Kindlings',
    'stores mature production', 'amplifies graft signals', 'guides Omen routes', 'preserves pruning value',
    'attracts rare pollination', 'improves return growth', 'strengthens Memory Seeds', 'reveals the Garden route',
  ][index],
  cost: 1e6 * 5 ** index,
  hue: 78 + (index * 11) % 78,
}))

const shelves: CuriosityShelfDef[] = [
  { id: 'hearthside', index: 'I', name: 'Survival', lore: 'Lives that endured by changing their relationship to time.', ids: VERDANCE_CURIOSITIES.slice(0, 4).map(({ id }) => id), rewardKind: 'production', rewardName: 'Dormant Wisdom', reward: 'all production ×1.12', rewardValue: 1.12 },
  { id: 'pilgrims', index: 'II', name: 'Communication', lore: 'Networks that made distant danger into shared knowledge.', ids: VERDANCE_CURIOSITIES.slice(4, 8).map(({ id }) => id), rewardKind: 'clicks', rewardName: 'Living Signal', reward: 'click power ×1.28', rewardValue: 1.28 },
  { id: 'portents', index: 'III', name: 'Inheritance', lore: 'Ways a world can give the future more than a copy of itself.', ids: VERDANCE_CURIOSITIES.slice(8, 12).map(({ id }) => id), rewardKind: 'stars', rewardName: 'Pollen Road', reward: 'Omen frequency +12%', rewardValue: 0.12 },
]

export const VERDANCE_CABINET: CuriosityCabinetDef = {
  id: 'verdance',
  title: 'The Impossible Herbarium',
  surveyLabel: 'Verdance living survey',
  dockTitle: 'The Impossible Herbarium',
  dockGlyph: '❧',
  items: VERDANCE_CURIOSITIES,
  itemById: new Map(VERDANCE_CURIOSITIES.map((item) => [item.id, item])),
  shelves,
  resonancePerItem: 0.01,
  fuelHours: 4,
  fuelProductionMult: 1.08,
  returnCycleSec: 2 * 60 * 60,
  returnRateSeconds: 45 * 60,
  starItemRateBonus: 0.06,
  beatWindowBonus: 0.025,
  lines: {
    empty: 'Three living shelves wait for specimens that survived impossible histories.',
    first: 'The Herbarium does not preserve a corpse. It preserves a way of continuing.',
    chapter: 'Four specimens have formed a living argument about survival.',
    cosmology: 'Roots from separate worlds have begun exchanging signals through the cases.',
    complete: 'The final cutting points beyond the canopy. It remembers a Garden.',
  },
  archiveRecord: 'HERBARIUM RECORD — THE PATIENT WORLD\n\nWe prevented every ending until nothing new could begin.\n\nPrune with care. Keep the ring, release the branch, and let the next seed disagree with us.\n\n— last gardener of the unmoving spring',
}

export const VERDANCE_LUMEN: LumenLine[] = [
  { id: 'u3-lumen-arrival', text: 'This Heart is a seed. It has been waiting so long that patience became a climate.', when: (g) => g.clicks >= 1 },
  { id: 'u3-lumen-root', text: 'The first root turned toward you instead of gravity.', when: (g) => (g.owned['u3-kindling-02'] ?? 0) >= 1 },
  { id: 'u3-lumen-law', text: 'These Kindlings are aging. Time is part of their body here.', when: (g) => gteAmount(g.totalEarned, amountFromNumber(1e5)) },
  { id: 'u3-lumen-pruning', text: 'Pruning is not erasure. The cut becomes a memory the next seed can use.', when: (g) => g.supernovae >= 1 },
  { id: 'u3-lumen-amber', text: 'The amber remembers each season without insisting any season return.', when: (g) => g.curiosities.includes('u3-archive-05') },
  { id: 'u3-lumen-forest', text: 'Their civilization loved preservation until change began to look like violence.', when: (g) => (g.owned['u3-kindling-09'] ?? 0) >= 1 },
  { id: 'u3-lumen-shade', text: 'The trials remove light because this world once removed uncertainty.', when: (g) => g.challengesDone.length >= 6 },
  { id: 'u3-lumen-root-network', text: 'The roots are exchanging stories faster than I can catalogue them.', when: (g) => (g.owned['u3-kindling-13'] ?? 0) >= 1 },
  { id: 'u3-lumen-question', text: 'If nothing is allowed to end, care becomes another kind of cage.', when: (g) => (g.owned['u3-kindling-17'] ?? 0) >= 1 },
  { id: 'u3-lumen-beacon', text: 'The World-Tree is opening a flower toward the dark between worlds.', when: (g) => (g.owned['u3-kindling-18'] ?? 0) >= 1 },
]

const ECHO_TITLES = [
  'The First Seedbank', 'Minutes of the Unmoving Spring', 'The Graft Accord', 'A History Written in Rings',
  'The Pollinator Census', 'Letter from the Walking Shore', 'The Mercy of Shade', 'Amber Testimony',
  'The Last Pruning', 'The World-Tree Answers',
] as const
const ECHO_TEXT = [
  'The seedbank catalogued every possible forest and planted only the safest. The first grove was flawless. The second was identical. By the thousandth spring, perfection had become indistinguishable from silence.',
  'No leaf was permitted to yellow. No fruit was allowed to fall. Gardeners repaired each bruise until the seasons forgot which direction to move.',
  'The Graft Accord began as a promise that every grove would share its strengths. It ended as a law forbidding any branch from growing a trait the council had not already named.',
  'Heartwood keeps injury as architecture. A ring does not erase the drought; it places the drought inside a body capable of another year.',
  'The pollinators vanished after the flowers became perfect copies. With no difference left to carry between them, the wings had no work.',
  'When the ocean withdrew, one mangrove moved inland. The keepers called it betrayal. The tree called it one more root.',
  'A young grove survived the final heat because an older canopy failed above it. The archive recorded the failure. The grove recorded a gift.',
  'Memory Amber contains motion: sap rising, a wing passing, a hand releasing a branch. Preservation was never stillness. We made it still because still things cannot surprise us.',
  'The last gardener cut the oldest tree. Everyone expected the world to die. Light reached the ground instead.',
  'The World-Tree does not ask to remain unchanged. Its first flower opens toward Emberlight; its deepest root drinks from Tidefall. It has decided that survival means relationship.',
] as const

export const VERDANCE_ECHOES: EchoDef[] = ECHO_TITLES.map((title, index) => ({
  id: `u3-echo-${String(index + 1).padStart(2, '0')}`,
  title,
  provenance: ['a seed coat', 'a council ledger', 'living cambium', 'a heartwood core', 'a pollen plate', 'a salt-stained root', 'a canopy gap', 'golden resin', 'a pruning blade', 'the first Beacon flower'][index],
  text: ECHO_TEXT[index],
  when: (g) => index < 2
    ? gteAmount(g.totalEarned, amountFromNumber(10 ** (5 + index * 3)))
    : (g.owned[`u3-kindling-${String(Math.min(18, index * 2 + 1)).padStart(2, '0')}`] ?? 0) >= 1,
}))

export const VERDANCE: UniversePack = {
  id: 'verdance',
  name: 'The Verdance',
  shortName: 'Verdance',
  currency: 'Sap',
  currencyGlyph: '❧',
  centralObject: 'First Seed',
  achievementPower: 'Vitality',
  description: 'A patient planetary organism where every planted Kindling matures through visible growth rings.',
  generators: VERDANCE_GENERATORS,
  generatorById: new Map(VERDANCE_GENERATORS.map((entry) => [entry.id, entry])),
  upgrades: VERDANCE_UPGRADES,
  upgradeById: new Map(VERDANCE_UPGRADES.map((entry) => [entry.id, entry])),
  lumen: VERDANCE_LUMEN,
  echoes: VERDANCE_ECHOES,
  palette: { theme: 'verdance', accentHue: 104, vars: { '--bg': '#07100b', '--amber': '#75c989', '--gold': '#d5ef9b', '--panel': 'rgba(10, 28, 18, 0.82)' } },
  // Temporary bridge: legacy playback has only two families. Semantic V2 audio below owns the real identity.
  audio: { music: 'verdance', click: 'verdance', event: 'verdance' },
  events: {
    noun: 'golden pollinator',
    motion: 'meteor',
    powerUps: [
      { id: 'u3-pollinator', label: 'Golden Pollinator', glyph: '✾', hue: 82, weight: 38, prodMult: 7, clickMult: 4, durationSec: 48, toast: 'A pollinator carries living Sap between every flowering Kindling.' },
      { id: 'u3-spore-rain', label: 'Spore Rain', glyph: '⌇', hue: 112, weight: 34, prodMult: 9, durationSec: 42, toast: 'New roots appear wherever the spores remember ground.' },
      { id: 'u3-sunbreak', label: 'Sunbreak', glyph: '☼', hue: 64, weight: 22, clickMult: 25, durationSec: 18, toast: 'A moving shaft of light finds every patient leaf.' },
      { id: 'u3-amber-fruit', label: 'Amber Fruit', glyph: '◈', hue: 42, weight: 6, prodMult: 18, rateSeconds: 1800, minAward: 80, durationSec: 24, toast: 'Stored age opens as sweetness, memory, and Sap.' },
    ],
  },
  cabinet: VERDANCE_CABINET,
  twist: { id: 'living-cohorts', name: 'The Patient Growth', randomnessAllowed: true, description: 'Kindlings mature through new, rooted, mature, and ancient cohorts; mature growth strengthens production and Pruning.', },
  route: { glyph: '❧', epithet: 'the patient world', arrival: 'one seed opens beneath a sky made entirely of waiting', unlockText: 'light Tidefall’s Beacon' },
  beacon: { generatorId: 'u3-kindling-18', count: 1, reward: 3, description: 'The World-Tree flowers into the Dark Between without abandoning its roots.' },
}
