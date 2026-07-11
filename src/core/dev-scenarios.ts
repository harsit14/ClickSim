import { DEEP_UPGRADES } from '../content/deep'
import { ACHIEVEMENTS } from '../content/achievements'
import { universeById } from '../content/universes'
import { amountFromNumber } from './numeric/amount'
import {
  migrateAndSanitizeSave,
  migrateAndSanitizeSaveV12,
  type SaveDataV12,
  type SaveDataV23,
} from './save-data'

export type DevScenario = 'opening' | 'ember-camp' | 'midgame' | 'ember-cosmic' | 'ember-postnova' | 'endgame' | 'question' | 'crossing' | 'tidefall' | 'verdance' | 'pruning' | 'clockwork' | 'prismata' | 'tempest' | 'canticle' | 'garden' | 'markets'

const GENERATORS = [
  'spark',
  'wisp',
  'hearth',
  'kiln',
  'forge',
  'beacon',
  'titan',
  'starseed',
  'protostar',
  'sun',
  'binary',
  'constellation',
  'nebula',
  'galaxy',
  'supercluster',
  'web',
  'loom',
  'ember2',
]

const UI = ['counter', 'shop', 'upgrades', 'stats', 'options', 'music', 'bulk']
const ECHOES = [
  'first-fire',
  'census',
  'lighthouse',
  'letters-home',
  'long-bright',
  'wisp-song',
  'inventory',
  'second-census',
  'margin-note',
  'shape-in-dark',
]
const CURIOSITIES = [
  'moth',
  'chimes',
  'hearthkeeper',
  'glass-garden',
  'second-cursor',
  'snail',
  'aurora',
  'door',
  'star-jar',
  'metronome-heart',
  'letter',
  'orrery',
]
const CONSTELLATION = [
  'forge-1',
  'forge-2',
  'forge-3',
  'hand-1',
  'hand-2',
  'hand-3',
  'sky-1',
  'sky-2',
  'sky-3',
  'root-1',
  'root-2',
  'root-3',
  'corona',
]

function emptyScenario(now: number): SaveDataV12 {
  return migrateAndSanitizeSaveV12({ version: 12, savedAt: now, activeUniverse: 'emberlight' })!
}

/** Deterministic, dev-only states used for manual and browser regression passes. */
export function createDevScenario(name: string | null, now = Date.now()): SaveDataV23 | null {
  if (!['opening', 'ember-camp', 'midgame', 'ember-cosmic', 'ember-postnova', 'endgame', 'question', 'crossing', 'tidefall', 'verdance', 'pruning', 'clockwork', 'prismata', 'tempest', 'canticle', 'garden', 'markets'].includes(name ?? '')) return null
  const base = emptyScenario(now)

  if (name === 'opening') return migrateAndSanitizeSave(base)

  if (name === 'ember-camp') {
    return migrateAndSanitizeSave({
      ...base,
      light: 4_000,
      totalEarned: 7_500,
      allTimeEarned: 7_500,
      eraEarned: 7_500,
      clicks: 120,
      owned: { spark: 21, wisp: 8, hearth: 8, kiln: 2 },
      achievements: ['first-hundred', 'knock-knock', 'steady-glow', 'first-spark', 'spark-x10', 'first-wisp', 'first-hearth'],
      ui: UI,
      seen: ['awake', 'again', 'counter', 'shop', 'upgrades', 'stats', 'options', 'music', 'bulk'],
    })
  }

  if (name === 'midgame') {
    return migrateAndSanitizeSave({
      ...base,
      light: 1e10,
      totalEarned: 1e10,
      allTimeEarned: 1e10,
      eraEarned: 1e10,
      clicks: 2_000,
      owned: { spark: 70, wisp: 45, hearth: 25, kiln: 12, forge: 4, beacon: 1 },
      achievements: ['first-hundred', 'warm-corner', 'milliflame', 'gigaglow', 'knock-knock', 'persistent', 'devoted', 'steady-glow', 'river', 'torrent', 'first-spark', 'spark-x10', 'spark-x25', 'first-wisp', 'wisp-x10', 'first-hearth', 'hearth-x10', 'first-kiln', 'first-forge', 'first-beacon'],
      ui: UI,
      seen: ['awake', 'again', 'counter', 'shop', 'upgrades', 'stats', 'options', 'music', 'bulk'],
      curiosities: ['moth', 'chimes', 'hearthkeeper'],
      keeperFedUntil: now + 3_600_000,
    })
  }

  if (name === 'ember-cosmic') {
    return migrateAndSanitizeSave({
      ...base,
      light: 1e27,
      totalEarned: 1e29,
      allTimeEarned: 1e29,
      eraEarned: 1e29,
      clicks: 18_000,
      owned: {
        spark: 110, wisp: 90, hearth: 100, kiln: 64, forge: 50, beacon: 32,
        titan: 25, starseed: 18, protostar: 12, sun: 50, binary: 25,
        constellation: 50, nebula: 25, galaxy: 10, supercluster: 3, web: 1,
      },
      achievements: ['first-hundred', 'warm-corner', 'milliflame', 'gigaglow', 'terabright', 'petalight', 'exaflare', 'zettashine', 'yottablaze', 'knock-knock', 'persistent', 'devoted', 'obsessed', 'steady-glow', 'river', 'torrent', 'cascade', 'deluge', 'the-pour', 'first-spark', 'spark-x10', 'spark-x25', 'spark-x50', 'first-wisp', 'wisp-x10', 'wisp-x25', 'first-hearth', 'hearth-x10', 'hearth-x25', 'first-sun', 'sun-x10', 'first-binary', 'first-constellation', 'first-nebula', 'first-galaxy', 'galaxy-x10', 'first-supercluster', 'first-web'],
      ui: UI,
      seen: ['awake', 'again', 'counter', 'shop', 'upgrades', 'stats', 'options', 'music', 'bulk', 'spark', 'act2-open'],
      curiosities: ['moth', 'chimes', 'hearthkeeper', 'glass-garden', 'second-cursor', 'snail', 'aurora', 'door'],
    })
  }

  if (name === 'ember-postnova') {
    return migrateAndSanitizeSave({
      ...base,
      light: 2,
      totalEarned: 2,
      allTimeEarned: 1e21,
      eraEarned: 2,
      clicks: 1,
      owned: {},
      achievements: ['first-hundred', 'warm-corner', 'milliflame', 'nova-1', 'dust-10'],
      ui: UI,
      seen: ['awake', 'again', 'counter', 'shop', 'upgrades', 'stats', 'options', 'music', 'bulk'],
      stardust: 12,
      stardustTotal: 12,
      supernovae: 1,
    })
  }

  if (name === 'tidefall') {
    return migrateAndSanitizeSave({
      ...base,
      activeUniverse: 'tidefall',
      light: 1e12,
      totalEarned: 1e13,
      allTimeEarned: 1e40,
      eraEarned: 1e13,
      clicks: 8_000,
      owned: {
        spark: 60,
        wisp: 45,
        hearth: 35,
        kiln: 25,
        forge: 18,
        beacon: 12,
        titan: 8,
        starseed: 5,
        protostar: 2,
        sun: 1,
      },
      upgrades: [
        'spark-10',
        'spark-25',
        'wisp-10',
        'hearth-10',
        'undertow-touch',
        'moon-pull',
        'ripple-memory',
        'tidepool-circles',
        'reef-accord',
        'pearls-follow-wakes',
      ],
      ui: UI,
      seen: ['tide-arrival', 'tide-droplet', 'tide-turn'],
      echoes: ['tide-moon-ledger'],
      curiosities: ['moth', 'chimes', 'hearthkeeper', 'glass-garden', 'second-cursor', 'snail', 'aurora', 'door'],
      keeperFedUntil: now + 3_600_000,
      snailLastGiftAt: now - 3_600_000,
      stardust: 20,
      stardustTotal: 40,
      supernovae: 3,
      singularities: 10,
      singTotal: 10,
      collapses: 1,
      singUpgrades: ['deep-resonance'],
      challengesDone: ['silence', 'entropy', 'bare-hands', 'drought', 'half-light', 'swarm'],
      beacons: ['emberlight'],
      darkBetween: 3,
      vesselParts: ['hull-hearths', 'sails-constellation', 'heart-sun', 'keel-trials', 'archive'],
    })
  }

  if (name === 'verdance' || name === 'pruning' || name === 'clockwork' || name === 'prismata' || name === 'tempest' || name === 'canticle' || name === 'garden') {
    const universeId = name === 'garden' ? 'canticle' : name === 'pruning' ? 'verdance' : name
    const pack = universeById(universeId)
    const route = ['emberlight', 'tidefall', 'verdance', 'clockwork', 'prismata', 'tempest', 'canticle']
    const priorBeacons = name === 'garden' ? route : route.slice(0, route.indexOf(universeId))
    const runCurrency = route.indexOf(universeId) >= 4 ? 1e24 : 1e18
    const scenario = migrateAndSanitizeSave({
      ...base,
      activeUniverse: universeId,
      light: runCurrency / 100,
      totalEarned: runCurrency,
      allTimeEarned: 1e40,
      eraEarned: runCurrency,
      clicks: 12_000,
      owned: Object.fromEntries((name === 'verdance' ? pack.generators : pack.generators.slice(0, 13)).map((generator, index) => [
        generator.id,
        Math.max(name === 'verdance' ? 10 : 1, 70 - index * 5),
      ])),
      upgrades: name === 'verdance'
        ? pack.upgrades.filter(({ effects }) => effects.some(({ kind }) => kind === 'synergy')).map(({ id }) => id)
        : pack.upgrades.slice(0, 12).map(({ id }) => id),
      ui: UI,
      seen: pack.lumen.slice(0, 6).map(({ id }) => id),
      echoes: pack.echoes.slice(0, 5).map(({ id }) => id),
      curiosities: pack.cabinet.items.slice(0, 8).map(({ id }) => id),
      keeperFedUntil: now + 3_600_000,
      snailLastGiftAt: now - 3_600_000,
      stardust: name === 'pruning' ? 0 : 35,
      stardustTotal: name === 'pruning' ? 0 : 60,
      supernovae: name === 'pruning' ? 0 : 4,
      singularities: 10,
      singTotal: 10,
      collapses: 1,
      singUpgrades: ['deep-resonance'],
      challengesDone: ['silence', 'entropy', 'bare-hands', 'drought'],
      beacons: priorBeacons,
      pastEndings: name === 'garden' ? ['warden', 'hunger', 'companion'] : base.pastEndings,
      ending: name === 'garden' ? 'companion' : null,
      darkBetween: 6,
      vesselParts: ['hull-hearths', 'sails-constellation', 'heart-sun', 'keel-trials', 'archive'],
    })
    if (!scenario) return null
    if (name === 'verdance') {
      scenario.numericLawState = {
        'u3-kindling-01-cohort-quantity': amountFromNumber(70),
        'u3-kindling-01-cohort-age': amountFromNumber(8 * 60 * 60_000),
        'u3-kindling-09-cohort-quantity': amountFromNumber(30),
        'u3-kindling-09-cohort-age': amountFromNumber(0),
        'u3-graft-rootstock': amountFromNumber(0),
        'u3-graft-scion': amountFromNumber(8),
        'u3-graft-active': amountFromNumber(1),
      }
    } else if (name === 'prismata') {
      scenario.numericLawState = {
        'u5-recipe': amountFromNumber(1),
        'u5-route-12': amountFromNumber(5),
      }
    } else if (name === 'tempest') {
      scenario.numericLawState = {
        'u6-path': amountFromNumber(1),
        'u6-path-length': amountFromNumber(8),
        'u6-path-risk': amountFromNumber(2),
        'u6-charge': amountFromNumber(18),
        'u6-boost-seconds': amountFromNumber(28),
        'u6-last-discharge': amountFromNumber(2),
      }
    } else if (name === 'canticle') {
      scenario.numericLawState = {
        'u7-measure': amountFromNumber(3),
      }
    }
    return scenario
  }

  const endgame = {
    ...base,
    light: 1e40,
    totalEarned: 1e40,
    allTimeEarned: 1e40,
    eraEarned: 1e40,
    clicks: 100_000,
    owned: Object.fromEntries(GENERATORS.map((id) => [id, 125])),
    achievements: ACHIEVEMENTS.map(({ id }) => id),
    ui: UI,
    seen: [
      'awake',
      'again',
      'counter',
      'shop',
      'upgrades',
      'stats',
      'options',
      'music',
      'bulk',
      'spark',
      'act2-open',
      ...(name === 'question' || name === 'crossing' ? ['act3-hook'] : []),
    ],
    stardust: 120,
    stardustTotal: 120,
    supernovae: 8,
    constellation: CONSTELLATION,
    echoes: ECHOES,
    singularities: 20,
    singTotal: 20,
    collapses: 3,
    singUpgrades: ['deep-resonance'],
    challengesDone: [
      'silence',
      'entropy',
      'bare-hands',
      'drought',
      'half-light',
      'swarm',
      'glass-ceiling',
      'ashen-touch',
      'unwritten',
      'broken-ladder',
      'single-voice',
      'small-vessels',
    ],
    curiosities: CURIOSITIES,
    keeperFedUntil: now + 3_600_000,
    snailLastGiftAt: now - 5_400_000,
    vesselParts: ['hull-hearths', 'sails-constellation', 'heart-sun', 'keel-trials'],
  }

  return migrateAndSanitizeSave({
    ...endgame,
    light: name === 'question' ? 1e21 : endgame.light,
    ...(name === 'crossing'
      ? {
          ending: 'warden',
          vesselParts: ['hull-hearths', 'sails-constellation', 'heart-sun', 'keel-trials', 'archive'],
        }
      : {}),
    ...(name === 'markets'
      ? {
          stardust: 160,
          stardustTotal: 160,
          stardustWorks: { 'continuing-corona': 3, 'parallax-engine': 2 },
          singularities: 100,
          singTotal: 100,
          singUpgrades: DEEP_UPGRADES.map((upgrade) => upgrade.id),
          deepWorks: { 'worldseed-compression': 2, 'recursive-abyss': 1 },
        }
      : {}),
  })
}
