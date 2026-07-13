import { GENERATORS } from './generators'
import { universeById } from './universes'
import type { GameState } from '../engine/game.svelte'
import type { EconomyAmount } from './universes/types'
import {
  amountFromNumber,
  eqAmount,
  floorAmount,
  gtAmount,
  gteAmount,
  multiplyAmountByNumber,
} from '../core/numeric/amount'

export interface AchievementDef {
  id: string
  name: string
  flavor: string
  hidden?: boolean
  /** rate = current light/s, passed in so defs stay cheap */
  when: (g: GameState, rate: EconomyAmount) => boolean
}

const defs: AchievementDef[] = []
const A = (id: string, name: string, flavor: string, when: AchievementDef['when']) =>
  defs.push({ id, name, flavor, when })
const H = (id: string, name: string, flavor: string, when: AchievementDef['when']) =>
  defs.push({ id, name, flavor, when, hidden: true })

function currentGenerator(g: GameState, emberlightGeneratorId: string) {
  const tierIndex = GENERATORS.findIndex(({ id }) => id === emberlightGeneratorId)
  return tierIndex < 0 ? undefined : universeById(g.activeUniverse).generators[tierIndex]
}

// ── Wealth (total light ever earned) ────────────────────────────────────
const wealth: Array<[string, string, number, string]> = [
  ['first-hundred', 'A Hundred Points of Light', 100, 'It’s a start.'],
  ['warm-corner', 'Warm Corner', 1e4, 'This corner of nothing is warm now.'],
  ['milliflame', 'Milliflame', 1e6, 'Six zeroes of glow.'],
  ['gigaglow', 'Gigaglow', 1e9, 'The dark files a complaint.'],
  ['terabright', 'Terabright', 1e12, 'Visible from nowhere, because there is no where yet.'],
  ['petalight', 'Petalight', 1e15, 'The old universe peaked around here. Keep going.'],
  ['exaflare', 'Exaflare', 1e18, 'Lumen has stopped counting. You haven’t.'],
  ['zettashine', 'Zettashine', 1e21, 'Light beyond bookkeeping.'],
  ['yottablaze', 'Yottablaze', 1e24, 'There is no prefix after this. There will be.'],
]
for (const [id, name, amount, flavor] of wealth) {
  A(id, name, flavor, (g) => gteAmount(g.totalEarned, amountFromNumber(amount)))
}

// ── Clicks ──────────────────────────────────────────────────────────────
const clicks: Array<[string, string, number, string]> = [
  ['knock-knock', 'Knock Knock', 10, 'Someone’s home.'],
  ['persistent', 'Persistent', 100, 'The ember appreciates the attention.'],
  ['devoted', 'Devoted', 1_000, 'Your finger is warm now too.'],
  ['obsessed', 'Obsessed', 10_000, 'We don’t use the word “problem” here.'],
  ['true-name', 'The Ember Knows Your Name', 100_000, 'It won’t tell you how it learned it.'],
]
for (const [id, name, count, flavor] of clicks) A(id, name, flavor, (g) => g.clicks >= count)

// ── Flow (light per second) ─────────────────────────────────────────────
const flow: Array<[string, string, number, string]> = [
  ['steady-glow', 'Steady Glow', 10, 'It burns without you now. It still prefers you.'],
  ['river', 'River of Light', 1_000, 'Banks and all.'],
  ['torrent', 'Torrent', 1e6, 'Mind the spray.'],
  ['cascade', 'Cascade', 1e9, 'Downhill, if there were hills.'],
  ['deluge', 'Deluge of Dawn', 1e12, 'The void needs an umbrella.'],
  ['the-pour', 'The Light Pours', 1e15, 'From what vessel? Don’t ask yet.'],
]
for (const [id, name, rate, flavor] of flow) {
  A(id, name, flavor, (_g, r) => gteAmount(r, amountFromNumber(rate)))
}

// ── Firsts: one per generator ───────────────────────────────────────────
for (const gen of GENERATORS) {
  A(`first-${gen.id}`, `First ${gen.name}`, gen.flavor, (g) => {
    const current = currentGenerator(g, gen.id)
    return current ? (g.owned[current.id] ?? 0) >= 1 : false
  })
}

// ── Collections ─────────────────────────────────────────────────────────
const counts: Array<[string, string, string, number, string]> = [
  ['spark-x10', 'Kindling Pile', 'spark', 10, 'A respectable heap of maybe.'],
  ['spark-x25', 'Spark Storm', 'spark', 25, 'Weather, invented by you.'],
  ['spark-x50', 'A Thousand Flecks', 'spark', 50, 'Give or take nine hundred and fifty.'],
  ['wisp-x10', 'Will-o’-the-Ways', 'wisp', 10, 'They lead somewhere now.'],
  ['wisp-x25', 'Wisp Parliament', 'wisp', 25, 'Motion passes: keep dancing.'],
  ['hearth-x10', 'Village', 'hearth', 10, 'No villagers yet. Details.'],
  ['hearth-x25', 'Township', 'hearth', 25, 'Zoning approved by nobody.'],
  ['sun-x10', 'Solar Flock', 'sun', 10, 'They graze on nothing and shine anyway.'],
  ['galaxy-x10', 'Cluster Parent', 'galaxy', 10, 'A trillion bedtimes.'],
]
for (const [id, name, gen, count, flavor] of counts)
  A(id, name, flavor, (g) => {
    const current = currentGenerator(g, gen)
    return current ? (g.owned[current.id] ?? 0) >= count : false
  })

// ── Refinement ──────────────────────────────────────────────────────────
A('a-better-way', 'A Better Way', 'The first improvement of infinitely many.', (g) => g.upgrades.length >= 1)
A('refined', 'Refinement', 'Ten better ways.', (g) => g.upgrades.length >= 10)
A('perfectionist', 'Perfectionist', 'Twenty-five better ways.', (g) => g.upgrades.length >= 25)
A('no-stone-unlit', 'No Stone Unlit', 'Fifty better ways.', (g) => g.upgrades.length >= 50)
A('fully-furnished', 'Fully Furnished', 'You bought an entire user interface.', (g) => g.ui.length >= 7)

// ── Falling stars ───────────────────────────────────────────────────────
A('caught-one', 'Caught One!', 'The sky notices generosity.', (g) => g.starsCaught >= 1)
A('star-catcher', 'Star Catcher', 'Ten falling wishes, intercepted.', (g) => g.starsCaught >= 10)
A('meteor-greed', 'Greedy for Meteors', 'Fifty. The sky is keeping a list.', (g) => g.starsCaught >= 50)

// ── Rhythm ──────────────────────────────────────────────────────────────
A('on-the-beat', 'On the Beat', 'Eight clicks in rhythm.', (g) => g.bestCombo >= 8)
A('in-the-groove', 'In the Groove', 'Sixteen. The music leans toward you.', (g) => g.bestCombo >= 16)
A('metronome-heart', 'Pulsar Precision', 'Thirty-two. You are keeping time with a neutron star now.', (g) => g.bestCombo >= 32)

// ── Rebirth ─────────────────────────────────────────────────────────────
A('nova-1', 'Let There Be Nothing', 'You collapsed a universe on purpose. And then — again, light.', (g) => g.supernovae >= 1)
A('nova-3', 'Serial Creator', 'Three universes, each brighter than the last.', (g) => g.supernovae >= 3)
A('nova-10', 'The Cycle Holds', 'Ten collapses. Lumen has stopped grieving at each one. Almost.', (g) => g.supernovae >= 10)
A('dust-10', 'Pocketful of Sky', 'Ten stardust, gathered from your own endings.', (g) => gteAmount(g.stardustTotal, amountFromNumber(10)))
A('dust-50', 'Dust Baron', 'Fifty stardust. The void owes you money.', (g) => gteAmount(g.stardustTotal, amountFromNumber(50)))
A('first-node', 'Connect the Dots', 'Your first constellation star. The sky has a shape now.', (g) => g.constellation.length >= 1)
A('cartographer', 'Cartographer of Heaven', 'Seven constellation stars, drawn by hand.', (g) => g.constellation.length >= 7)
A('endless-sky', 'No Final Star', 'The complete constellation accepted one more point.', (g) =>
  Object.values(g.stardustWorks).reduce((sum, rank) => sum + rank, 0) >= 1)

// ── The Deep ────────────────────────────────────────────────────────────
A('deep-1', 'Past the Event Horizon', 'A whole era of stardust, folded into a point.', (g) => g.collapses >= 1)
A('deep-3', 'Recursive Dark', 'Three eras deep. The dark has layers, and you own several.', (g) => g.collapses >= 3)
A('sing-5', 'Five Points of Nothing', 'Five singularities. They weigh less than doubt.', (g) => gteAmount(g.singTotal, amountFromNumber(5)))
A('automated', 'The Machine Tends the Fire', 'Kindler and stoker, working while you dream.', (g) =>
  g.singUpgrades.includes('auto-kindler') && g.singUpgrades.includes('auto-stoker'))
A('deeper-still', 'Deeper Still', 'The finished Deep discovered that finished was only another surface.', (g) =>
  Object.values(g.deepWorks).reduce((sum, rank) => sum + rank, 0) >= 1)

// ── Trials ──────────────────────────────────────────────────────────────
A('trial-1', 'Tested', 'One trial endured.', (g) => g.challengesDone.length >= 1)
A('trial-3', 'Tempered', 'Three trials. The dark is running out of ideas.', (g) => g.challengesDone.length >= 3)
A('trial-6', 'First Circle', 'Six trials endured. The Deep reveals an inner horizon.', (g) => g.challengesDone.length >= 6)
A('trial-9', 'Lawbreaker', 'Nine broken laws, returned as permanent strengths.', (g) => g.challengesDone.length >= 9)
A('trial-12', 'Unbreakable', 'Every trial endured. The Deep has run out of ways to diminish you.', (g) =>
  g.challengesDone.length >= 12)

// ── Curiosities & chance ────────────────────────────────────────────────
A('first-crit', 'Found the Fault Line', 'One touch struck the dark exactly wrong.', (g) => g.crits >= 1)
A('crit-100', 'Hundred Bright Accidents', 'Probability has started looking over its shoulder.', (g) => g.crits >= 100)
A('curiosity-1', 'First Light on the Plate', 'One distant object resolved into a name.', (g) => g.curiosities.length >= 1)
A('curiosity-6', 'Surveyor of the Dark', 'Six astronomical phenomena catalogued.', (g) => g.curiosities.length >= 6)
A('curiosity-hearthside', 'Stellar Chorus', 'The Local Sky became a complete chapter.', (g) =>
  ['moth', 'chimes', 'hearthkeeper', 'glass-garden'].every((id) => g.curiosities.includes(id)))
A('curiosity-pilgrims', 'Signals Without Senders', 'Every object in the Signal Sky crossed the dark in its own way.', (g) =>
  ['second-cursor', 'snail', 'aurora', 'door'].every((id) => g.curiosities.includes(id)))
A('curiosity-portents', 'Gravitational Lens', 'The Deep Sky revealed something behind this universe.', (g) =>
  ['star-jar', 'metronome-heart', 'letter', 'orrery'].every((id) => g.curiosities.includes(id)))
H('curiosity-all', 'The Sky Is a Map', 'Every celestial object catalogued in one universe.', (g) => g.curiosities.length >= 12)

// ── Remembrance ─────────────────────────────────────────────────────────
A('remembered', 'Begin Again, Knowing', 'A whole universe, folded into memory. The first pixel, twice as bright.', (g) =>
  g.remembrances >= 1)
A('thrice-lived', 'Thrice-Lived', 'Three lifetimes. Lumen has stopped writing "final entry."', (g) =>
  g.remembrances >= 3)
H('all-answers', 'Every Word of It', 'Warden, Hunger, and Companion now meet as relations in the Garden.', (g) => {
  const all = new Set(g.pastEndings)
  if (g.ending) all.add(g.ending)
  return all.size >= 3
})

// ── The Answer ──────────────────────────────────────────────────────────
A('ending-warden', 'The Warden', 'This light is not yours. You keep it lit anyway.', (g) => g.ending === 'warden')
A('ending-hunger', 'The Hunger', 'Honest, at last, about what you are.', (g) => g.ending === 'hunger')
H('ending-companion', 'What Stayed', 'The archive, the cycle, and one answer no one can author alone.', (g) =>
  g.ending === 'companion')
A('loka-cycle', 'The Cycle Remains Open', 'Creation, preservation, and release completed their route without becoming possessions.', (g) =>
  ['brahmalok', 'vishnulok', 'kailash'].every((id) => g.beacons.includes(id)))
A('garden-renewal', 'A Path Down, A Garden Ahead', 'The completed cycle became a beginning without pretending nothing ended.', (g) =>
  g.gardenEnding !== null)

// ── Time ────────────────────────────────────────────────────────────────
A('an-hour-warm', 'An Hour Warm', 'Time flies when you’re reigniting a universe.', (g) => g.playtime >= 3_600)
A('ten-hours-kindled', 'Ten Hours Kindled', 'Lumen made you a mug of something warm. Metaphorically.', (g) => g.playtime >= 36_000)

// ── Hidden ──────────────────────────────────────────────────────────────
H('impatience', 'Impatience', '100 clicks before buying a single thing. The ember admires commitment to the bit.', (g) =>
  g.challenge === null && g.supernovae === 0 && g.collapses === 0 && g.clicks >= 100 && Object.keys(g.owned).length === 0)
H('night-reader', 'Night Reader', 'It’s 3 AM. The ember doesn’t judge. Lumen does, a little.', () =>
  new Date().getHours() === 3)
H('the-quiet-kind', 'The Quiet Kind', 'All sound off. The light doesn’t mind silence.', (g) =>
  g.sfxVolume === 0 && g.musicVolume === 0)
H('dragons-nest', 'Dragon’s Nest', 'Sitting on a full hour of production, unspent.', (g, r) =>
  gtAmount(r, amountFromNumber(10)) && gteAmount(g.light, multiplyAmountByNumber(r, 3_600)))
H('purist', 'Purist', 'A million light and not one upgrade. Why though.', (g) =>
  g.challenge === null && gteAmount(g.totalEarned, amountFromNumber(1e6)) && g.upgrades.length === 0)
H('lucky-777', 'Jackpot', '✦777 exactly on the counter.', (g) =>
  eqAmount(floorAmount(g.light), amountFromNumber(777)))
H('louder-than-silence', 'Louder Than Silence', 'You beat The Silence with nothing but your own rhythm.', (g) =>
  g.challengesDone.includes('silence'))
H('with-these-hands', 'With These Hands', 'A million points of light, every one of them touched.', (g) =>
  g.challengesDone.includes('bare-hands'))
H('beyond-the-song', 'Beyond the Song', 'A 64-beat streak. The music follows YOU now.', (g) => g.bestCombo >= 64)

export const ACHIEVEMENTS: AchievementDef[] = defs

type AchievementCopy = Pick<AchievementDef, 'name' | 'flavor'>

const TIDEFALL_ACHIEVEMENT_COPY: Record<string, AchievementCopy> = {
  'first-hundred': { name: 'A Hundred Drops of Glow', flavor: 'The first hint of an ocean.' },
  'warm-corner': { name: 'Quiet Current', flavor: 'This corner of nothing moves now.' },
  milliflame: { name: 'Milliglow', flavor: 'Six zeroes beneath the surface.' },
  petalight: { name: 'Petaglow', flavor: 'The old ocean peaked around here. Keep rising.' },
  exaflare: { name: 'Exatide', flavor: 'Lumen has stopped counting. You have not.' },
  zettashine: { name: 'Zettasheen', flavor: 'Glow beyond bookkeeping.' },
  yottablaze: { name: 'Yottaflood', flavor: 'There is no prefix after this. There will be.' },
  persistent: { name: 'Persistent', flavor: 'The Tideheart appreciates the attention.' },
  devoted: { name: 'Devoted', flavor: 'Your finger can feel the current now too.' },
  'true-name': { name: 'The Tide Knows Your Name', flavor: 'It will not tell you how it learned it.' },
  'steady-glow': { name: 'Steady Glow', flavor: 'It flows without you now. It still prefers you.' },
  'the-pour': { name: 'The Glow Pours', flavor: 'From what ocean? Do not ask yet.' },
  'spark-x10': { name: 'Droplet Pool', flavor: 'Ten beads of an ocean that has not arrived.' },
  'spark-x25': { name: 'Rain Without Sky', flavor: 'Weather, remembered by water.' },
  'spark-x50': { name: 'A Thousand Droplets', flavor: 'Give or take nine hundred and fifty.' },
  'wisp-x10': { name: 'Ripple Chorus', flavor: 'Every circle carries the same note outward.' },
  'wisp-x25': { name: 'Current Parliament', flavor: 'Motion passes: keep rising.' },
  'hearth-x10': { name: 'First Lagoon', flavor: 'No shore yet. Details.' },
  'hearth-x25': { name: 'Moonless Coast', flavor: 'The water obeys an absent horizon.' },
  'sun-x10': { name: 'Drowned Choir', flavor: 'Ten beacons calling through the same deep water.' },
  'galaxy-x10': { name: 'Ten Living Seas', flavor: 'Every current carries a bedtime.' },
  'caught-one': { name: 'Caught One!', flavor: 'The current notices generosity.' },
  'star-catcher': { name: 'Bubble Catcher', flavor: 'Ten wandering blessings, intercepted.' },
  'meteor-greed': { name: 'Greedy for Omens', flavor: 'Fifty. The sea is keeping a list.' },
  'metronome-heart': { name: 'Tideclock Precision', flavor: 'Thirty-two. You are keeping time with water that has not arrived yet.' },
  automated: { name: 'The Machine Tends the Current', flavor: 'Kindler and stoker, working while you dream.' },
  'curiosity-1': { name: 'First Signal on the Plate', flavor: 'One distant object resolved into a name.' },
  'curiosity-6': { name: 'Surveyor of the Deep', flavor: 'Six pelagic phenomena catalogued.' },
  'curiosity-all': { name: 'The Ocean Is a Map', flavor: 'Every pelagic object catalogued in one universe.' },
  'an-hour-warm': { name: 'An Hour Afloat', flavor: 'Time flows when you are raising a universe.' },
  'ten-hours-kindled': { name: 'Ten Hours Rising', flavor: 'Lumen made you a mug of something warm. Metaphorically.' },
  impatience: { name: 'Impatience', flavor: '100 clicks before buying a single thing. The Tideheart admires commitment to the bit.' },
  'night-reader': { name: 'Night Diver', flavor: 'It is 3 AM. The Tideheart does not judge. Lumen does, a little.' },
  purist: { name: 'Purist', flavor: 'A million glow and not one upgrade. Why though.' },
  'with-these-hands': { name: 'With These Hands', flavor: 'A million points of glow, every one of them touched.' },
}

const CABINET_ACHIEVEMENT_SHELVES: Record<string, number> = {
  'curiosity-hearthside': 0,
  'curiosity-pilgrims': 1,
  'curiosity-portents': 2,
}

function tidefallWorldText(text: string): string {
  return text
    .replace(/\bpoints of light\b/gi, 'points of glow')
    .replace(/\blight\b/g, 'glow')
    .replace(/\bLight\b/g, 'Glow')
    .replace(/\bthe ember\b/g, 'the Tideheart')
    .replace(/\bThe Ember\b/g, 'The Tideheart')
    .replace(/\bember\b/g, 'current')
    .replace(/\bfire\b/g, 'current')
}

/** Stable achievement ids stay global; visible copy belongs to the active universe. */
export function achievementDisplay(def: AchievementDef, universeId: string): AchievementCopy {
  const pack = universeById(universeId)
  if (pack.id === 'emberlight') return { name: def.name, flavor: def.flavor }

  if (def.id.startsWith('first-')) {
    const tierIndex = GENERATORS.findIndex(({ id }) => id === def.id.slice('first-'.length))
    const generator = tierIndex < 0 ? undefined : pack.generators[tierIndex]
    if (generator) return { name: `First ${generator.name}`, flavor: generator.flavor }
  }

  const shelfIndex = CABINET_ACHIEVEMENT_SHELVES[def.id]
  const shelf = shelfIndex === undefined ? undefined : pack.cabinet.shelves[shelfIndex]
  if (shelf) {
    return {
      name: shelf.rewardName,
      flavor: `${shelf.name} became a complete chapter of ${pack.name}.`,
    }
  }

  return TIDEFALL_ACHIEVEMENT_COPY[def.id] ?? {
    name: tidefallWorldText(def.name),
    flavor: tidefallWorldText(def.flavor),
  }
}
