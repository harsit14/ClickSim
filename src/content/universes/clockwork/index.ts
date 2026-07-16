import { assertValidUniverseAudioDef } from '../../../audio/semantic-contract'
import { assertValidUniversePackV2 } from '../../../render/manifest-validator'
import type {
  EighteenTuple,
  FourTuple,
  GeneratorDefV2,
  UniversePack,
  UniversePackV2,
  UpgradeDefV2,
} from '../types'
import { CLOCKWORK_ACCESSIBILITY } from './accessibility'
import { CLOCKWORK_PATENT_LEDGER } from './archive'
import { CLOCKWORK_AUDIO } from './audio'
import {
  CLOCKWORK_GENERATORS,
  CLOCKWORK_GENERATOR_BY_ID,
  CLOCKWORK_UPGRADES,
  CLOCKWORK_UPGRADE_BY_ID,
} from './economy'
import { CLOCKWORK_HEART } from './heart'
import {
  CLOCKWORK_ARCHIVE,
  CLOCKWORK_BEACON,
  CLOCKWORK_SIGNAL_OMENS,
} from './manifests'
import { CLOCKWORK_MAINTENANCE_SIGNALS } from './maintenance'
import { CLOCKWORK_ECHOES, CLOCKWORK_LUMEN, CLOCKWORK_STORY_SCENES } from './story'
import { CLOCKWORK_TRIALS } from './trials'
import { CLOCKWORK_VISUAL } from './visual'

const CLOCKWORK_DOCTRINES: FourTuple<UniversePackV2['economy']['doctrines'][number]> = [
  {
    id: 'clockwork-doctrine-power-train',
    name: 'Power Train',
    description: 'Concentrates transmitted power through one dominant inspected engine.',
    favoredMotivations: ['optimizer', 'performer'],
    effects: [],
    visualSignature: 'one heavy solid shaft joining the Escapement Heart to a large terminal flywheel',
  },
  {
    id: 'clockwork-doctrine-distributed-works',
    name: 'Distributed Works',
    description: 'Builds a broad redundant network with stable idle and offline operation.',
    favoredMotivations: ['optimizer', 'restorer'],
    effects: [],
    visualSignature: 'three parallel civic trains joined by open clutch frames and public load marks',
  },
  {
    id: 'clockwork-doctrine-precision-train',
    name: 'Precision Train',
    description: 'Favors exact cycle inspection, cadence routes, and timing windows.',
    favoredMotivations: ['performer', 'archivist'],
    effects: [],
    visualSignature: 'a ruby escapement crossing a notched four-beat chapter ring',
  },
  {
    id: 'clockwork-doctrine-forecast-engine',
    name: 'Forecast Engine',
    description: 'Favors scheduled automation, saved loadouts, and future-state planning.',
    favoredMotivations: ['wayfinder', 'optimizer'],
    effects: [],
    visualSignature: 'punched forecast paper passing through an Orrery meridian and three route gates',
  },
]

/**
 * Legacy registry bridge for the current engine. Random events stay disabled by
 * the twist; the event layer consumes these four entries only at their authored
 * deterministic Maintenance Signal times.
 */
export const CLOCKWORK: UniversePack = {
  id: 'clockwork',
  name: 'The Clockwork',
  shortName: 'Clockwork',
  currency: 'Ticks',
  currencyGlyph: '⌑',
  centralObject: 'Escapement Heart',
  achievementPower: 'Precision',
  description: 'An unwound civic machine where time is transmitted as visible, deterministic torque.',
  generators: CLOCKWORK_GENERATORS,
  generatorById: CLOCKWORK_GENERATOR_BY_ID,
  upgrades: CLOCKWORK_UPGRADES,
  upgradeById: CLOCKWORK_UPGRADE_BY_ID,
  lumen: CLOCKWORK_LUMEN,
  echoes: CLOCKWORK_ECHOES,
  palette: {
    theme: 'clockwork',
    accentHue: 42,
    vars: {
      '--bg': '#0b0d10',
      '--amber': '#d8a84e',
      '--gold': '#ffe1a3',
      '--panel': 'rgba(18, 21, 25, 0.88)',
    },
  },
  // The frozen legacy selector has only current-world identities. V2 owns Clockwork audio.
  audio: { music: 'clockwork', click: 'clockwork', event: 'clockwork' },
  events: {
    noun: 'Maintenance Signal',
    motion: 'meteor',
    powerUps: [
      { id: 'clockwork-maintenance-window', label: 'Maintenance Window', glyph: '⚒', hue: 42, weight: 25, prodMult: 2, durationSec: 45, toast: 'The scheduled service frame opens for the selected train.' },
      { id: 'clockwork-noon-alignment', label: 'Noon Alignment', glyph: '⌖', hue: 52, weight: 25, prodMult: 4, durationSec: 30, toast: 'The prepared route reaches its declared meridian.' },
      { id: 'clockwork-leap-tick', label: 'Leap Tick', glyph: '+1', hue: 198, weight: 25, rateSeconds: 1, minAward: 1, toast: 'One displayed production cycle may be inserted or banked.' },
      { id: 'clockwork-recall-notice', label: 'Recall Notice', glyph: '↺', hue: 214, weight: 25, rateSeconds: 10, minAward: 10, toast: 'The machine recalls its displayed best recent ten seconds.' },
    ],
  },
  cabinet: CLOCKWORK_PATENT_LEDGER,
  twist: {
    id: 'clockwork-deterministic-routing',
    name: 'The Visible Train',
    randomnessAllowed: false,
    description: 'Critical clicks follow an inspected cadence rather than a roll. Power-ups follow visible routes and scheduled Maintenance Signals.',
  },
  route: {
    glyph: '⚙',
    epithet: 'the unwound city',
    arrival: 'one stopped escapement waits inside a city that predicted this moment',
    unlockText: 'light Verdance’s Beacon',
  },
  beacon: {
    generatorId: 'clockwork-great-regulator',
    count: 1,
    reward: 3,
    description: 'The Great Regulator transmits one continuing interval into the Dark Between.',
  },
}

export const CLOCKWORK_V2_PACK: UniversePackV2 = {
  id: 'clockwork',
  identity: {
    name: 'The Clockwork',
    shortName: 'Clockwork',
    epithet: 'The Unwound City',
    premise: 'Restart a deterministic universe where time is transmitted as torque through an immense civic machine.',
    primaryVerb: 'route',
    civilizationQuestion: 'If certainty can prevent suffering, who may refuse it?',
  },
  economy: {
    currency: {
      id: 'clockwork-ticks',
      canonicalName: 'World Currency',
      localName: 'Ticks',
      singular: 'Tick',
      plural: 'Ticks',
      glyph: '⌑',
      material: 'counted torque released through a ruby-pallet escapement',
      scope: 'world',
    },
    generators: [...CLOCKWORK_GENERATORS] as unknown as EighteenTuple<GeneratorDefV2>,
    upgrades: [...CLOCKWORK_UPGRADES] as readonly UpgradeDefV2[],
    doctrines: CLOCKWORK_DOCTRINES,
    localPrestige: {
      id: 'clockwork-rewinding',
      canonicalName: 'Epoch Turn',
      localName: 'Rewinding',
      rewardCurrency: {
        id: 'clockwork-mainsprings',
        canonicalName: 'Epoch Matter',
        localName: 'Mainsprings',
        singular: 'Mainspring',
        plural: 'Mainsprings',
        glyph: '◒',
        material: 'perfected timing locked into a sealed tension spring',
        scope: 'epoch',
      },
      gainFormulaId: 'clockwork-rewinding-gain',
      loses: ['world-currency', 'run-earnings', 'kindlings', 'ordinary-upgrades', 'buy-mode'],
      retains: ['epoch-matter', 'epoch-doctrines', 'epoch-works', 'era-earnings', 'deep-currency', 'deep-laws', 'deep-works', 'trials', 'archive', 'story', 'beacons', 'between-currency', 'wayfinder'],
      ceremonyFeedbackId: 'clockwork-rewinding-feedback',
    },
  },
  heart: CLOCKWORK_HEART,
  physics: {
    randomAllowed: false,
    routing: {
      edgeKinds: ['power', 'cadence', 'efficiency'],
      cyclesAllowed: false,
      rewiringCost: 0,
      scheduleIsDeterministic: true,
    },
  },
  omens: CLOCKWORK_SIGNAL_OMENS,
  archive: CLOCKWORK_ARCHIVE,
  trials: CLOCKWORK_TRIALS,
  story: {
    civilizationQuestion: 'If certainty can prevent suffering, who may refuse it?',
    lumen: CLOCKWORK_LUMEN,
    echoes: CLOCKWORK_ECHOES,
    scenes: CLOCKWORK_STORY_SCENES,
  },
  audio: CLOCKWORK_AUDIO,
  visual: CLOCKWORK_VISUAL,
  beacon: CLOCKWORK_BEACON,
  accessibility: CLOCKWORK_ACCESSIBILITY,
}

assertValidUniversePackV2(CLOCKWORK_V2_PACK)
assertValidUniverseAudioDef(CLOCKWORK_V2_PACK.audio)

export { CLOCKWORK_MAINTENANCE_SIGNALS }
export * from './routing'
export * from './revelation'
