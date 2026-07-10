import { DEEP_UPGRADES } from '../content/deep'
import {
  migrateAndSanitizeSave,
  migrateAndSanitizeSaveV12,
  type SaveDataV12,
  type SaveDataV13,
} from './save-data'

export type DevScenario = 'midgame' | 'endgame' | 'question' | 'crossing' | 'tidefall' | 'markets'

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
export function createDevScenario(name: string | null, now = Date.now()): SaveDataV13 | null {
  if (!['midgame', 'endgame', 'question', 'crossing', 'tidefall', 'markets'].includes(name ?? '')) return null
  const base = emptyScenario(now)

  if (name === 'midgame') {
    return migrateAndSanitizeSave({
      ...base,
      light: 1e10,
      totalEarned: 1e10,
      allTimeEarned: 1e10,
      eraEarned: 1e10,
      clicks: 2_000,
      owned: { spark: 70, wisp: 45, hearth: 25, kiln: 12, forge: 4, beacon: 1 },
      ui: UI,
      seen: ['awake', 'again', 'counter', 'shop', 'upgrades', 'stats', 'options', 'music', 'bulk'],
      curiosities: ['moth', 'chimes', 'hearthkeeper'],
      keeperFedUntil: now + 3_600_000,
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

  const endgame = {
    ...base,
    light: 1e40,
    totalEarned: 1e40,
    allTimeEarned: 1e40,
    eraEarned: 1e40,
    clicks: 100_000,
    owned: Object.fromEntries(GENERATORS.map((id) => [id, 125])),
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
