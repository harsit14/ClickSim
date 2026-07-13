import { ACHIEVEMENTS } from '../content/achievements'
import { CHALLENGES } from '../content/challenges'
import { CONSTELLATION } from '../content/constellation'
import { DEEP_UPGRADES } from '../content/deep'
import { DEEP_WORKS, STARDUST_WORKS } from '../content/repeatables'
import { UI_UNLOCKS } from '../content/ui-unlocks'
import { SUCCESSION_RELAYS, lumenClaimIds } from '../content/legacy-exchange'
import { UNIVERSES, universeById } from '../content/universes'
import { VESSEL_PART_IDS } from '../content/vessel'
import { WAYFINDER_NODES } from '../content/wayfinder'
import type { GameState } from '../engine/game.svelte'
import { amountFromNumber } from './numeric/amount'

export const DEV_CHEATS = [
  { id: 'fund-world', label: 'Fund World', description: 'Set current-run currency and earnings to 1e80.' },
  { id: 'fund-epoch', label: 'Fund Epoch', description: 'Grant 1e9 local Epoch Matter.' },
  { id: 'fund-deep', label: 'Fund Deep', description: 'Grant 1e9 local Deep Matter.' },
  { id: 'fund-between', label: 'Fund Between', description: 'Grant 1e9 Dark Between.' },
  { id: 'fund-lumen', label: 'Fund Lumen Vault', description: 'Grant 50 shared Lumen Shards.' },
  { id: 'fund-all', label: 'Fund All', description: 'Grant every currency without changing unlocks.' },
  { id: 'show-all-controls', label: 'Show All Panels', description: 'Reveal every dock control while preserving the current economy.' },
  { id: 'complete-economy', label: 'All Kindlings + Upgrades', description: 'Own 125 of every local Kindling and every ordinary upgrade.' },
  { id: 'unlock-story', label: 'Archive + Story', description: 'Reveal the complete current-world Archive, Lumen journal, and Echoes.' },
  { id: 'complete-epoch-deep', label: 'Epoch + Deep Complete', description: 'Complete permanent nodes, repeatable works, trials, and Deep laws.' },
  { id: 'complete-vessel', label: 'Complete Vessel', description: 'Activate all five parts of this universe’s local Vessel.' },
  { id: 'ready-epoch', label: 'Ready Epoch Turn', description: 'Prepare a large real Epoch reward without performing the reset.' },
  { id: 'ready-deep', label: 'Ready Deep Collapse', description: 'Prepare a large real Deep reward without performing the reset.' },
  { id: 'ready-beacon', label: 'Ready Beacon', description: 'Complete local requirements but leave this world’s Beacon unlit.' },
  { id: 'question-ready', label: 'Ready The Question', description: 'Reveal the Act III choice without choosing an answer.' },
  { id: 'complete-world', label: 'Complete Current World', description: 'Finish the current world and light its Beacon.' },
  { id: 'unlock-multiverse', label: 'Unlock All Universes', description: 'Light all seven Beacons and unlock every Wayfinder law.' },
  { id: 'unlock-everything', label: 'Unlock Everything', description: 'Complete all current-world and shared progression while leaving endings replayable.' },
  { id: 'notification-storm', label: 'Fire 5 Notifications', description: 'Queue five presentation-only transients for overlap testing.' },
  { id: 'prime-loka-depth', label: 'Prime Loka Depth', description: 'Populate the active loka traces and make its next authored prompt immediately visible.' },
] as const

export type DevCheatId = (typeof DEV_CHEATS)[number]['id']

const WORLD_FUND = amountFromNumber(1e80)
const META_FUND = amountFromNumber(1e9)

function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

function fundWorld(game: GameState): void {
  game.light = WORLD_FUND
  game.totalEarned = WORLD_FUND
  game.eraEarned = WORLD_FUND
  game.allTimeEarned = WORLD_FUND
}

function fundEpoch(game: GameState): void {
  game.stardust = META_FUND
  game.stardustTotal = META_FUND
  game.supernovae = Math.max(game.supernovae, 12)
}

function fundDeep(game: GameState): void {
  game.singularities = META_FUND
  game.singTotal = META_FUND
  game.collapses = Math.max(game.collapses, 6)
}

function fundBetween(game: GameState): void {
  game.darkBetween = META_FUND
}

function fundLumen(game: GameState): void {
  game.lumenShards = Math.max(game.lumenShards, 50)
}

function fundAll(game: GameState): void {
  fundWorld(game)
  fundEpoch(game)
  fundDeep(game)
  fundBetween(game)
  fundLumen(game)
}

function showAllControls(game: GameState, now: number): void {
  game.ui = UI_UNLOCKS.map(({ id }) => id)
  fundAll(game)
  const pack = universeById(game.activeUniverse)
  game.curiosities = unique([...game.curiosities, ...pack.cabinet.items.map(({ id }) => id)])
  game.seen = unique([...game.seen, pack.lumen[0]?.id ?? 'awake'])
  game.echoes = unique([...game.echoes, pack.echoes[0]?.id].filter((id): id is string => !!id))
  game.keeperFedUntil = Math.max(game.keeperFedUntil, now + 86_400_000)
  game.vesselPartsByUniverse = {
    ...game.vesselPartsByUniverse,
    [game.activeUniverse]: [...VESSEL_PART_IDS],
  }
  if (game.activeUniverse === 'emberlight') game.vesselParts = [...VESSEL_PART_IDS]
  if (game.beacons.length === 0) game.beacons = [game.activeUniverse]
}

function completeEconomy(game: GameState): void {
  const pack = universeById(game.activeUniverse)
  fundWorld(game)
  game.owned = Object.fromEntries(pack.generators.map(({ id }) => [id, 125]))
  game.upgrades = pack.upgrades.map(({ id }) => id)
  game.clicks = Math.max(game.clicks, 100_000)
  game.buyAmount = 'max'
}

function unlockStory(game: GameState, now: number): void {
  const pack = universeById(game.activeUniverse)
  game.curiosities = unique([...game.curiosities, ...pack.cabinet.items.map(({ id }) => id)])
  game.seen = unique([...game.seen, ...pack.lumen.map(({ id }) => id)])
  game.echoes = unique([...game.echoes, ...pack.echoes.map(({ id }) => id)])
  game.keeperFedUntil = now + 86_400_000
  game.snailLastGiftAt = now - 86_400_000
}

function completeEpochAndDeep(game: GameState): void {
  fundEpoch(game)
  fundDeep(game)
  game.constellation = CONSTELLATION.map(({ id }) => id)
  game.stardustWorks = Object.fromEntries(STARDUST_WORKS.map(({ id }) => [id, 12]))
  game.singUpgrades = DEEP_UPGRADES.map(({ id }) => id)
  game.deepWorks = Object.fromEntries(DEEP_WORKS.map(({ id }) => [id, 12]))
  game.challengesDone = CHALLENGES.map(({ id }) => id)
  game.challenge = null
  game.challengeReturn = null
  game.autoKindler = true
  game.autoStoker = true
  game.autoNova = false
}

function completeVessel(game: GameState): void {
  game.vesselPartsByUniverse = {
    ...game.vesselPartsByUniverse,
    [game.activeUniverse]: [...VESSEL_PART_IDS],
  }
  if (game.activeUniverse === 'emberlight') game.vesselParts = [...VESSEL_PART_IDS]
}

function readyEpoch(game: GameState): void {
  fundWorld(game)
  game.challenge = null
  game.challengeReturn = null
}

function readyDeep(game: GameState): void {
  fundEpoch(game)
  game.challenge = null
  game.challengeReturn = null
}

function readyBeacon(game: GameState, now: number): void {
  showAllControls(game, now)
  completeEconomy(game)
  unlockStory(game, now)
  completeEpochAndDeep(game)
  completeVessel(game)
  game.beacons = game.beacons.filter((id) => id !== game.activeUniverse)
}

function questionReady(game: GameState): void {
  game.seen = unique([...game.seen, 'act3-hook'])
  game.ending = null
}

function completeWorld(game: GameState, now: number): void {
  readyBeacon(game, now)
  game.beacons = unique([...game.beacons, game.activeUniverse])
  fundBetween(game)
}

function unlockMultiverse(game: GameState): void {
  game.beacons = UNIVERSES.map(({ id }) => id)
  game.wayfinder = WAYFINDER_NODES.map(({ id }) => id)
  fundBetween(game)
}

function primeLokaDepth(game: GameState): void {
  completeEconomy(game)
  if (game.activeUniverse === 'brahmalok') {
    game.lokaProgress['brahmalok-folios'] = 18
    game.numericLawState['brahmalok-commission-phase'] = amountFromNumber(1)
    game.numericLawState['brahmalok-commission-index'] = amountFromNumber(3)
    game.numericLawState['brahmalok-commission-elapsed'] = amountFromNumber(0)
    game.numericLawState['brahmalok-commission-route-changes'] = amountFromNumber(3)
    game.numericLawState['brahmalok-commission-held-seconds'] = amountFromNumber(58)
    game.numericLawState['brahmalok-commission-edited'] = amountFromNumber(0)
  } else if (game.activeUniverse === 'vishnulok') {
    game.lokaProgress['vishnulok-routes'] = 14
    game.lokaProgress['vishnulok-returns'] = 120
    game.numericLawState['vishnulok-strain-phase'] = amountFromNumber(1)
    game.numericLawState['vishnulok-strain-index'] = amountFromNumber(0)
    game.numericLawState['vishnulok-continuity'] = amountFromNumber(100)
    game.numericLawState['vishnulok-continuity-2'] = amountFromNumber(100)
  } else if (game.activeUniverse === 'kailash') {
    game.lokaProgress['kailash-traces'] = 14
    game.supernovae = Math.max(game.supernovae, 6)
    game.numericLawState['kailash-front-phase'] = amountFromNumber(2)
    game.numericLawState['kailash-front-index'] = amountFromNumber(0)
    game.numericLawState['kailash-front-elapsed'] = amountFromNumber(185)
    game.numericLawState['kailash-front-answered-seconds'] = amountFromNumber(124)
    game.numericLawState['kailash-front-edited'] = amountFromNumber(0)
  }
}

/** Applies a deliberate development-only mutation to a live game state. */
export function applyDevCheat(game: GameState, id: DevCheatId, now = Date.now()): string {
  if (!Number.isFinite(now) || now < 0) throw new RangeError('Dev cheat time must be finite and nonnegative.')
  if (id === 'fund-world') fundWorld(game)
  else if (id === 'fund-epoch') fundEpoch(game)
  else if (id === 'fund-deep') fundDeep(game)
  else if (id === 'fund-between') fundBetween(game)
  else if (id === 'fund-lumen') fundLumen(game)
  else if (id === 'fund-all') fundAll(game)
  else if (id === 'show-all-controls') showAllControls(game, now)
  else if (id === 'complete-economy') completeEconomy(game)
  else if (id === 'unlock-story') unlockStory(game, now)
  else if (id === 'complete-epoch-deep') completeEpochAndDeep(game)
  else if (id === 'complete-vessel') completeVessel(game)
  else if (id === 'ready-epoch') readyEpoch(game)
  else if (id === 'ready-deep') readyDeep(game)
  else if (id === 'ready-beacon') readyBeacon(game, now)
  else if (id === 'question-ready') questionReady(game)
  else if (id === 'complete-world') completeWorld(game, now)
  else if (id === 'unlock-multiverse') unlockMultiverse(game)
  else if (id === 'prime-loka-depth') primeLokaDepth(game)
  else if (id === 'unlock-everything') {
    showAllControls(game, now)
    completeEconomy(game)
    unlockStory(game, now)
    completeEpochAndDeep(game)
    completeVessel(game)
    unlockMultiverse(game)
    questionReady(game)
    game.vesselPartsByUniverse = Object.fromEntries(
      UNIVERSES.map(({ id: universeId }) => [universeId, [...VESSEL_PART_IDS]]),
    )
    game.vesselParts = [...VESSEL_PART_IDS]
    game.achievements = ACHIEVEMENTS.map(({ id: achievementId }) => achievementId)
    game.successionRelays = Object.fromEntries(SUCCESSION_RELAYS.map(({ id: relayId }) => [relayId, 12]))
    game.lumenShards = Math.max(game.lumenShards, 50)
    game.lumenShardClaims = [...lumenClaimIds()]
    game.lumenDistillations = {}
    game.pastEndings = ['warden', 'hunger', 'companion']
    game.gardenEnding = null
    game.gardenSceneSeen = false
  }
  const label = DEV_CHEATS.find((cheat) => cheat.id === id)?.label ?? id
  return `${label} applied to ${universeById(game.activeUniverse).name}.`
}
