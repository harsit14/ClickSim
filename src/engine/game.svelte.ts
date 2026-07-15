import type { GeneratorDef } from '../content/generators'
import { UI_UNLOCK_BY_ID } from '../content/ui-unlocks'
import { CONSTELLATION, NODE_BY_ID, nodeAvailable, perkBonus } from '../content/constellation'
import { CHALLENGE_BY_ID, challengeUnlocked } from '../content/challenges'
import { DEEP_UPGRADES, DEEP_UPGRADE_BY_ID, singularityCostForCount } from '../content/deep'
import {
  DAWN_MEMORY_FIRST_KINDLINGS,
  DAWN_MEMORY_SECOND_KINDLINGS,
  EVENT_HORIZON_STARDUST_MULTIPLIER,
  LIFETIME_SINGULARITY_STARDUST_BONUS,
  STARDUST_PIVOT,
} from '../content/economy-balance'
import {
  cometGift,
  protostarFuelCost,
} from '../content/curiosities'
import { DEFAULT_UNIVERSE_ID, UNIVERSE_BY_ID, universeById, universeV2ById } from '../content/universes'
import {
  advanceVerdanceCohortLawState,
  clearVerdanceGraft,
  configureVerdanceGraft,
  verdanceCohortRuntimeSummary,
} from '../content/universes/verdance/runtime'
import {
  advanceF4LawState,
  configureVishnulokCircuit as configureVishnulokCircuitState,
  cycleKailashAct,
  completeVishnulokReturn,
  completeSecondVishnulokReturn,
  enterKailashLongRest as enterKailashLongRestState,
  exitKailashLongRest as exitKailashLongRestState,
  kailashLongRestStatus,
  openBankedBrahmalokCommission,
  recallBankedKailashFront,
  retainedF4LawConfiguration,
  routeBrahmalokKindling,
  selectKailashCycle,
  selectBrahmalokMode,
  selectBrahmalokMarginMode,
  selectVishnulokCircuit,
  type F4LawEvents,
} from '../content/universes/f4-runtime'
import {
  DEEP_WORK_BY_ID,
  STARDUST_WORK_BY_ID,
  singularityYieldMult,
  stardustYieldMult,
  workCost,
  workRank,
  type DeepWorkId,
  type StardustWorkId,
} from '../content/repeatables'
import {
  LUMEN_VAULT_ITEM_BY_ID,
  MAX_LUMEN_DISTILLATIONS_PER_UNIVERSE,
  SUCCESSION_RELAY_BY_ID,
  lumenDistillationCost,
  successionRelayCost,
  successionRelayRank,
} from '../content/legacy-exchange'
import {
  WAYFINDER_BY_ID,
  wayfinderNodeAvailable,
  wayfinderStartingKindlings,
  type WayfinderId,
} from '../content/wayfinder'
import {
  vesselComplete as computeVesselComplete,
  vesselHasReadyPart as computeVesselHasReadyPart,
  vesselPartForUniverse,
  vesselPartIdsFor,
  vesselPartReady,
  vesselRevealed as computeVesselRevealed,
  vesselRouteUnlocked as computeVesselRouteUnlocked,
  vesselRouteVisible as computeVesselRouteVisible,
  vesselRouteVisited as computeVesselRouteVisited,
  type VesselPartId,
} from '../content/vessel'
import { clickBuffMult, productionBuffMult, tickBuffs } from '../systems/buffs.svelte'
import { criticalClickOccurs } from '../systems/critical-click'
import { pushToast } from '../systems/toasts.svelte'
import type { EconomyAmount } from '../content/universes/types'
import {
  ONE_AMOUNT,
  ZERO_AMOUNT,
  addAmounts,
  amountFromNumber,
  amountToNumber,
  divideAmountByNumber,
  divideAmounts,
  floorAmount,
  gtAmount,
  gteAmount,
  isZeroAmount,
  multiplyAmountByNumber,
  multiplyAmounts,
  powAmount,
  sqrtAmount,
  subtractAmounts,
  sumAmounts,
  toAmount,
  type AmountInput,
} from '../core/numeric/amount'
import {
  totalRate,
  clickPower as computeClickPower,
  critChance as computeCritChance,
  critMult as computeCritMult,
  bulkCost,
  maxAffordable,
  costMultOf,
  costScaleOf,
  genPurchaseDisabled,
  challengeMods,
  upgradeById,
  upgradeUnlocked,
} from './compute'
import {
  prepareBalanceAward,
  prepareClickCommit,
  prepareEarnings,
  preparePrestigeAward,
} from './economy-transactions'
import {
  atlasReplayDigest,
  decodeAtlasRoute,
  CONVERGENCES,
  type AtlasRoute,
} from '../endgame/atlas'
import {
  cleanBeaconName,
  lawLoadoutOwnershipIssues,
  recordChronicleEvent,
  updateChronicleBest,
  upsertLawLoadout,
  validateLawLoadout,
} from '../endgame/chronicle'
import { THEMES } from '../content/themes'
import { availableGardenClosures } from '../endgame/garden'
import {
  emptyEndgameState,
  type EndgameState,
  type GardenEnding,
  type LawLoadout,
} from '../endgame/types'
import { game } from './state/game-state.svelte'
import type {
  BuyAmount,
  ClickResult,
  GameState,
  RunSnapshot,
  UniverseRunState,
} from './state/game-state.svelte'

export { game }
export type { BuyAmount, ClickResult, GameState, RunSnapshot, UniverseRunState }

/** The Question becomes available once its moment has been witnessed. */
export function questionReady(): boolean {
  return game.seen.includes('act3-hook') && game.ending === null
}

export function chooseEnding(id: 'warden' | 'hunger' | 'companion') {
  if (game.ending !== null) return
  game.ending = id
  addChronicleMilestone('answer', `Answered ${id}.`)
}

/** Remembrance — NG+. Everything returns to the first dark pixel, except what
 *  Lumen keeps: the echoes, the record (achievements), and the memory itself,
 *  which doubles all light each time. The question may be answered again. */
export function performRemembrance(): boolean {
  if (game.ending === null || game.activeAtlasRoute) return false
  game.pastEndings.push(game.ending)
  game.remembrances += 1
  // survives: echoes, achievements, pastEndings, theme, volumes,
  // curiosities, and the record books (allTimeEarned, playtime, starsCaught, bestCombo)
  game.light = ZERO_AMOUNT
  game.totalEarned = ZERO_AMOUNT
  game.clicks = 0
  game.owned = {}
  game.upgrades = []
  game.buyAmount = 1
  game.ui = [] // the interface is bought again, piece by piece
  game.seen = [] // the story replays — Lumen remembers, and says so
  game.stardust = ZERO_AMOUNT
  game.stardustTotal = ZERO_AMOUNT
  game.eraEarned = ZERO_AMOUNT
  game.constellation = []
  game.stardustWorks = {}
  game.supernovae = 0
  game.singularities = ZERO_AMOUNT
  game.singTotal = ZERO_AMOUNT
  game.collapses = 0
  game.singUpgrades = []
  game.deepWorks = {}
  game.challenge = null
  game.challengeReturn = null
  game.challengesDone = []
  game.autoKindler = true
  game.autoStoker = true
  game.autoNova = false
  game.autoNovaThreshold = ONE_AMOUNT
  game.ending = null
  game.numericLawState = {}
  return true
}

function addChronicleMilestone(
  milestone: EndgameState['chronicleEvents'][number]['milestone'],
  detail: string,
  universeId = game.activeUniverse,
  at = Date.now(),
) {
  game.chronicleEvents = recordChronicleEvent(
    game.chronicleEvents,
    universeId as EndgameState['chronicleEvents'][number]['universeId'],
    milestone,
    at,
    detail,
  )
}

function syncConvergences() {
  for (const convergence of CONVERGENCES) {
    if (game.beacons.length >= convergence.requiredBeacons && !game.unlockedConvergences.includes(convergence.id)) {
      game.unlockedConvergences.push(convergence.id)
    }
  }
}

function copyChallengeRun(run: RunSnapshot | null): RunSnapshot | null {
  if (!run) return null
  return {
    light: run.light,
    totalEarned: run.totalEarned,
    owned: { ...run.owned },
    upgrades: [...run.upgrades],
    buyAmount: run.buyAmount,
    numericLawState: { ...run.numericLawState },
  }
}

export function snapshotUniverseRun(): UniverseRunState {
  return {
    light: game.light,
    totalEarned: game.totalEarned,
    clicks: game.clicks,
    owned: { ...game.owned },
    upgrades: [...game.upgrades],
    buyAmount: game.buyAmount,
    seen: [...game.seen],
    stardust: game.stardust,
    stardustTotal: game.stardustTotal,
    supernovae: game.supernovae,
    constellation: [...game.constellation],
    stardustWorks: { ...game.stardustWorks },
    echoes: [...game.echoes],
    eraEarned: game.eraEarned,
    singularities: game.singularities,
    singTotal: game.singTotal,
    collapses: game.collapses,
    singUpgrades: [...game.singUpgrades],
    deepWorks: { ...game.deepWorks },
    challenge: game.challenge,
    challengeReturn: copyChallengeRun(game.challengeReturn),
    challengesDone: [...game.challengesDone],
    autoKindler: game.autoKindler,
    autoStoker: game.autoStoker,
    autoNova: game.autoNova,
    autoNovaThreshold: game.autoNovaThreshold,
    ending: game.ending,
    curiosities: [...game.curiosities],
    keeperFedUntil: game.keeperFedUntil,
    snailLastGiftAt: game.snailLastGiftAt,
    crits: game.crits,
    bestCrit: game.bestCrit,
    numericLawState: { ...game.numericLawState },
    lokaProgress: { ...game.lokaProgress },
  }
}

function freshUniverseRun(universeId: string): UniverseRunState {
  const firstGenerator = universeById(universeId).generators[0]
  const startingKindlings = wayfinderStartingKindlings(game.wayfinder)
  return {
    light: ZERO_AMOUNT,
    totalEarned: ZERO_AMOUNT,
    clicks: 0,
    owned: startingKindlings > 0 && firstGenerator ? { [firstGenerator.id]: startingKindlings } : {},
    upgrades: [],
    buyAmount: 1,
    seen: [],
    stardust: ZERO_AMOUNT,
    stardustTotal: ZERO_AMOUNT,
    supernovae: 0,
    constellation: [],
    stardustWorks: {},
    echoes: [],
    eraEarned: ZERO_AMOUNT,
    singularities: ZERO_AMOUNT,
    singTotal: ZERO_AMOUNT,
    collapses: 0,
    singUpgrades: [],
    deepWorks: {},
    challenge: null,
    challengeReturn: null,
    challengesDone: [],
    autoKindler: true,
    autoStoker: true,
    autoNova: false,
    autoNovaThreshold: ONE_AMOUNT,
    ending: null,
    curiosities: [],
    keeperFedUntil: 0,
    snailLastGiftAt: 0,
    crits: 0,
    bestCrit: ZERO_AMOUNT,
    numericLawState: {},
    lokaProgress: {},
  }
}

function restoreUniverseRun(run: UniverseRunState) {
  game.light = run.light
  game.totalEarned = run.totalEarned
  game.clicks = run.clicks
  game.owned = { ...run.owned }
  game.upgrades = [...run.upgrades]
  game.buyAmount = run.buyAmount
  game.seen = [...run.seen]
  game.stardust = run.stardust
  game.stardustTotal = run.stardustTotal
  game.supernovae = run.supernovae
  game.constellation = [...run.constellation]
  game.stardustWorks = { ...run.stardustWorks }
  game.echoes = [...run.echoes]
  game.eraEarned = run.eraEarned
  game.singularities = run.singularities
  game.singTotal = run.singTotal
  game.collapses = run.collapses
  game.singUpgrades = [...run.singUpgrades]
  game.deepWorks = { ...run.deepWorks }
  game.challenge = run.challenge
  game.challengeReturn = copyChallengeRun(run.challengeReturn)
  game.challengesDone = [...run.challengesDone]
  game.autoKindler = run.autoKindler
  game.autoStoker = run.autoStoker
  game.autoNova = run.autoNova
  game.autoNovaThreshold = run.autoNovaThreshold
  game.ending = run.ending
  game.curiosities = [...run.curiosities]
  game.keeperFedUntil = run.keeperFedUntil
  game.snailLastGiftAt = run.snailLastGiftAt
  game.crits = run.crits
  game.bestCrit = run.bestCrit
  game.numericLawState = { ...run.numericLawState }
  game.lokaProgress = { ...run.lokaProgress }
}

export function universeVisited(id: string): boolean {
  return computeVesselRouteVisited(game, id)
}

export function universeBeaconReady(id = game.activeUniverse): boolean {
  const pack = UNIVERSE_BY_ID.get(id)
  if (!pack || game.beacons.includes(id)) return false
  const owned = id === game.activeUniverse ? game.owned : game.universeRuns[id]?.owned
  return (owned?.[pack.beacon.generatorId] ?? 0) >= pack.beacon.count
}

export function igniteCurrentBeacon(): EconomyAmount {
  if (game.challenge || !computeVesselComplete(game, game.activeUniverse) || !universeBeaconReady()) return ZERO_AMOUNT
  const pack = universeById(game.activeUniverse)
  const reward = toAmount(pack.beacon.reward)
  const nextDarkBetween = prepareBalanceAward(game.darkBetween, reward)
  game.beacons.push(pack.id)
  game.darkBetween = nextDarkBetween
  claimLumenShard(`beacon-${pack.id}`)
  addChronicleMilestone('beacon', `${game.beaconNames[pack.id] || pack.name} lit its Beacon.`)
  syncConvergences()
  return reward
}

export function universeRouteUnlocked(id: string): boolean {
  return computeVesselRouteUnlocked(game, id)
}

export function universeRouteVisible(id: string): boolean {
  return computeVesselRouteVisible(game, id)
}

export function buyWayfinder(id: WayfinderId): boolean {
  const node = WAYFINDER_BY_ID.get(id)
  const cost = node ? toAmount(node.cost) : ZERO_AMOUNT
  if (!node || !wayfinderNodeAvailable(game.wayfinder, node) || !gteAmount(game.darkBetween, cost)) return false
  game.darkBetween = subtractAmounts(game.darkBetween, cost)
  game.wayfinder.push(id)
  return true
}

function claimLumenShard(claimId: string): boolean {
  if (game.lumenShardClaims.includes(claimId)) return false
  game.lumenShardClaims.push(claimId)
  game.lumenShards += 1
  return true
}

/** A completed universe may strengthen only the universe immediately after it. */
export function buySuccessionRelay(id: string): boolean {
  const relay = SUCCESSION_RELAY_BY_ID.get(id)
  if (
    !relay
    || game.activeAtlasRoute !== null
    || relay.sourceUniverseId !== game.activeUniverse
    || !game.beacons.includes(relay.sourceUniverseId)
  ) return false
  const rank = successionRelayRank(game.successionRelays, relay.id)
  const cost = successionRelayCost(rank)
  if (!cost || !gteAmount(game.singularities, cost)) return false
  game.singularities = subtractAmounts(game.singularities, cost)
  game.successionRelays = { ...game.successionRelays, [relay.id]: rank + 1 }
  return true
}

/** Converts an extreme amount of one completed world's local Deep currency into a shared shard. */
export function distillLumenShard(): boolean {
  if (game.activeAtlasRoute || !game.beacons.includes(game.activeUniverse)) return false
  const count = Math.max(0, Math.floor(game.lumenDistillations[game.activeUniverse] ?? 0))
  if (count >= MAX_LUMEN_DISTILLATIONS_PER_UNIVERSE) return false
  const cost = lumenDistillationCost(count)
  if (!cost || !gteAmount(game.singularities, cost)) return false
  game.singularities = subtractAmounts(game.singularities, cost)
  game.lumenDistillations = { ...game.lumenDistillations, [game.activeUniverse]: count + 1 }
  game.lumenShards += 1
  return true
}

export function buyLumenVaultItem(id: string): boolean {
  const item = LUMEN_VAULT_ITEM_BY_ID.get(id)
  if (!item || game.lumenPurchases.includes(id) || game.lumenShards < item.cost) return false
  game.lumenShards -= item.cost
  game.lumenPurchases.push(id)
  if (item.themeId) game.theme = item.themeId
  return true
}

export function crossToUniverse(id: string): boolean {
  if (game.challenge || game.activeAtlasRoute || id === game.activeUniverse || !universeRouteUnlocked(id)) return false
  game.universeRuns[game.activeUniverse] = snapshotUniverseRun()
  const destination = game.universeRuns[id] ?? freshUniverseRun(id)
  game.activeUniverse = id
  restoreUniverseRun(destination)
  if (!game.chronicleEvents.some((event) => event.universeId === id && event.milestone === 'awakening')) {
    addChronicleMilestone('awakening', `${universeById(id).name} awakened.`)
  }
  clickMeter.samples = []
  return true
}

export function setBeaconName(universeId: string, name: string): boolean {
  if (!UNIVERSE_BY_ID.has(universeId) || !game.beacons.includes(universeId)) return false
  const clean = cleanBeaconName(name)
  if (!clean) return false
  game.beaconNames[universeId] = clean
  return true
}

export function saveLawLoadout(loadout: LawLoadout): boolean {
  if (validateLawLoadout(loadout).length > 0) return false
  game.lawLoadouts = upsertLawLoadout(game.lawLoadouts, loadout)
  return true
}

export function activateLawLoadout(id: string): boolean {
  if (game.challenge || game.activeAtlasRoute) return false
  const loadout = game.lawLoadouts.find((entry) => entry.id === id && entry.universeId === game.activeUniverse)
  const unlockedThemes = THEMES.filter((theme) => theme.unlocked(game)).map((theme) => theme.id)
  if (!loadout || lawLoadoutOwnershipIssues(loadout, game.wayfinder, unlockedThemes).length > 0) return false
  game.activeLawLoadoutId = loadout.id
  game.theme = loadout.vestmentId
  game.autoKindler = loadout.automation !== 'manual'
  game.autoStoker = loadout.automation !== 'manual'
  return true
}

export function beginAtlasRoute(route: AtlasRoute, now = Date.now()): boolean {
  if (
    game.beacons.length < 3 || game.challenge || game.activeAtlasRoute
    || route.universeId !== game.activeUniverse || decodeAtlasRoute(route.code)?.code !== route.code
    || !Number.isFinite(now) || now < 0
  ) return false
  game.universeRuns[game.activeUniverse] = snapshotUniverseRun()
  restoreUniverseRun(freshUniverseRun(game.activeUniverse))
  game.activeAtlasRoute = {
    routeCode: route.code,
    universeId: route.universeId,
    seed: route.seed,
    startedAt: Math.floor(now),
  }
  clickMeter.samples = []
  return true
}

export function atlasRouteReady(now = Date.now()): boolean {
  if (!game.activeAtlasRoute || game.activeAtlasRoute.universeId !== game.activeUniverse) return false
  const pack = universeById(game.activeUniverse)
  if ((game.owned[pack.beacon.generatorId] ?? 0) < pack.beacon.count) return false
  const route = decodeAtlasRoute(game.activeAtlasRoute.routeCode)
  if (!route?.masteryId) return true
  if (route.masteryId === 'mastery-no-critical') return game.crits === 0
  if (route.masteryId === 'mastery-one-shelf') {
    const archive = universeV2ById(game.activeUniverse)?.archive
    return archive?.shelves.filter((shelf) => shelf.recordIds.every((id) => game.curiosities.includes(id))).length === 1
  }
  if (route.masteryId === 'mastery-patient') {
    return now - game.activeAtlasRoute.startedAt >= 5_000 && clickMeter.samples.length === 0
  }
  return route.masteryId === 'mastery-visible-route'
}

function leaveAtlasRoute() {
  const returnRun = game.universeRuns[game.activeUniverse]
  if (returnRun) restoreUniverseRun(returnRun)
  game.activeAtlasRoute = null
  clickMeter.samples = []
}

export function abandonAtlasRoute(): boolean {
  if (!game.activeAtlasRoute) return false
  leaveAtlasRoute()
  return true
}

export function completeAtlasRoute(now = Date.now()): boolean {
  const active = game.activeAtlasRoute
  if (!active || !atlasRouteReady(now) || !Number.isFinite(now) || now <= active.startedAt) return false
  const route = decodeAtlasRoute(active.routeCode)
  if (!route) return false
  const completion = {
    routeCode: route.code,
    universeId: route.universeId,
    seed: route.seed,
    durationMs: Math.floor(now - active.startedAt),
    completedAt: Math.floor(now),
    replayDigest: atlasReplayDigest(route),
  }
  leaveAtlasRoute()
  game.atlasCompletions.push(completion)
  game.atlasCompletions = game.atlasCompletions.slice(-256)
  game.chronicleBests = updateChronicleBest(game.chronicleBests, completion)
  claimLumenShard(`atlas-${route.universeId}`)
  addChronicleMilestone('atlas-route', `Completed ${route.title} in ${completion.durationMs}ms.`, route.universeId, now)
  return true
}

export function chooseGardenEnding(id: GardenEnding, now = Date.now()): boolean {
  if (game.gardenEnding !== null) return false
  const available = availableGardenClosures(game.beacons, game.pastEndings, game.ending)
  if (!available.some((closure) => closure.id === id)) return false
  game.gardenEnding = id
  syncConvergences()
  addChronicleMilestone('garden', `The Garden answered: ${id}.`, game.activeUniverse, now)
  return true
}

export function markGardenSceneSeen() {
  if (game.gardenEnding) game.gardenSceneSeen = true
}

const CLICK_RATE_WINDOW_MS = 3_000
const clickMeter = $state<{ samples: Array<{ at: number; amount: EconomyAmount }> }>({ samples: [] })

function pruneClickSamples(now = performance.now()) {
  const cutoff = now - CLICK_RATE_WINDOW_MS
  if (clickMeter.samples.some((s) => s.at < cutoff)) {
    clickMeter.samples = clickMeter.samples.filter((s) => s.at >= cutoff)
  }
}

export const ratePerSec = (now = Date.now()) => totalRate(game, now)
export const passiveRatePerSec = (now = Date.now()) => multiplyAmountByNumber(totalRate(game, now), productionBuffMult())
export const recentClickRatePerSec = (now = performance.now()) => {
  // This function is read by Svelte derived values, so it must remain pure.
  // Expired samples are removed by click/tick mutations; ignore any that remain
  // here without writing reactive state during derivation.
  const cutoff = now - CLICK_RATE_WINDOW_MS
  const total = sumAmounts(clickMeter.samples
    .filter((sample) => sample.at >= cutoff)
    .map((sample) => sample.amount))
  return divideAmountByNumber(total, CLICK_RATE_WINDOW_MS / 1000)
}
export const activeRatePerSec = (now = Date.now()) => addAmounts(passiveRatePerSec(now), recentClickRatePerSec())
export const clickPower = () => multiplyAmountByNumber(computeClickPower(game, productionBuffMult()), clickBuffMult())
export const critChance = () => computeCritChance(game)
export const critMult = () => computeCritMult(game)
export const hasUi = (id: string) => game.ui.includes(id)
export const hasCuriosity = (id: string) => game.curiosities.includes(id)
export const vesselRevealed = () => computeVesselRevealed(game)
export const vesselComplete = () => computeVesselComplete(game)
export const vesselHasReadyPart = () => computeVesselHasReadyPart(game)

export function earn(value: AmountInput) {
  const amount = toAmount(value)
  if (gtAmount(amount, ZERO_AMOUNT) && !game.chronicleEvents.some((event) => event.universeId === game.activeUniverse && event.milestone === 'awakening')) {
    addChronicleMilestone('awakening', `${universeById(game.activeUniverse).name} awakened.`)
  }
  const next = prepareEarnings(game, amount, game.challenge === null)
  game.light = next.light
  game.totalEarned = next.totalEarned
  game.allTimeEarned = next.allTimeEarned
  game.eraEarned = next.eraEarned
}

// ── Supernova (prestige layer 1) ─────────────────────────────────────────
export { STARDUST_PIVOT } from '../content/economy-balance'

function stardustScale(): EconomyAmount {
  const horizon = game.singUpgrades.includes('event-horizon') ? EVENT_HORIZON_STARDUST_MULTIPLIER : 1
  const deepGlow = addAmounts(ONE_AMOUNT, multiplyAmountByNumber(game.singTotal, LIFETIME_SINGULARITY_STARDUST_BONUS))
  return multiplyAmountByNumber(deepGlow, horizon * stardustYieldMult(game.stardustWorks))
}

export function potentialStardust(): EconomyAmount {
  const base = sqrtAmount(divideAmountByNumber(game.eraEarned, STARDUST_PIVOT))
  return floorAmount(multiplyAmounts(base, stardustScale()))
}

export function stardustTargetFor(totalStardust: AmountInput): EconomyAmount {
  const ratio = divideAmounts(toAmount(totalStardust), stardustScale())
  return multiplyAmountByNumber(powAmount(ratio, 2), STARDUST_PIVOT)
}

/** Stardust gained by collapsing right now. */
export function supernovaGain(): EconomyAmount {
  if (game.challenge) return ZERO_AMOUNT // trials give no stardust
  const pack = universeById(game.activeUniverse)
  const maturityBonus = game.activeUniverse === 'verdance'
    ? verdanceCohortRuntimeSummary(
      pack.generators.map(({ id }) => id),
      game.owned,
      game.numericLawState,
    ).memorySeedBonus
    : 0
  const potential = addAmounts(potentialStardust(), amountFromNumber(maturityBonus))
  return gtAmount(potential, game.stardustTotal)
    ? subtractAmounts(potential, game.stardustTotal)
    : ZERO_AMOUNT
}

/** Rebuild-from-nothing shared by every kind of reset. */
function resetRun(withHeadStart: boolean) {
  game.light = ZERO_AMOUNT
  game.totalEarned = ZERO_AMOUNT
  game.owned = {}
  game.upgrades = []
  game.buyAmount = 1
  if (!withHeadStart) return
  const sparks =
    perkBonus(game.constellation, 'headStart') +
    (game.singUpgrades.includes('dawn-memory') ? DAWN_MEMORY_FIRST_KINDLINGS : 0)
  const [firstKindling, secondKindling] = universeById(game.activeUniverse).generators
  if (sparks > 0 && firstKindling) game.owned[firstKindling.id] = sparks
  if (game.singUpgrades.includes('dawn-memory') && secondKindling) game.owned[secondKindling.id] = DAWN_MEMORY_SECOND_KINDLINGS
}

function snapshotRun(): RunSnapshot {
  return {
    light: game.light,
    totalEarned: game.totalEarned,
    owned: { ...game.owned },
    upgrades: [...game.upgrades],
    buyAmount: game.buyAmount,
    numericLawState: { ...game.numericLawState },
  }
}

function restoreRun(snapshot: RunSnapshot) {
  game.light = snapshot.light
  game.totalEarned = snapshot.totalEarned
  game.owned = { ...snapshot.owned }
  game.upgrades = [...snapshot.upgrades]
  game.buyAmount = snapshot.buyAmount
  game.numericLawState = { ...snapshot.numericLawState }
}

/** The state reset. The cutscene around it lives in the UI layer. */
export function performSupernova(): EconomyAmount {
  const gain = supernovaGain()
  if (isZeroAmount(gain)) return ZERO_AMOUNT
  const retainedLawConfiguration = retainedF4LawConfiguration(game.activeUniverse, game.numericLawState)
  const next = preparePrestigeAward(game.stardust, game.stardustTotal, game.supernovae, gain)
  game.stardust = next.balance
  game.stardustTotal = next.total
  game.supernovae = next.resetCount
  game.challengeReturn = null
  const epochName = universeV2ById(game.activeUniverse)?.economy.localPrestige.localName ?? 'Epoch Turn'
  addChronicleMilestone('epoch-turn', `${epochName} preserved new Epoch Matter.`)
  resetRun(true)
  game.numericLawState = retainedLawConfiguration
  return gain
}

// ── The Deep (prestige layer 2) ──────────────────────────────────────────
export function deepCollapseGain(): EconomyAmount {
  if (game.challenge) return ZERO_AMOUNT
  return floorAmount(multiplyAmountByNumber(
    divideAmountByNumber(game.stardustTotal, deepCollapseCost()),
    singularityYieldMult(game.deepWorks),
  ))
}

export function deepCollapseCost(): number {
  return singularityCostForCount(amountToNumber(game.singTotal))
}

/** Collapse the era: stardust, constellation, and era-light all return to the dark. */
export function performDeepCollapse(): EconomyAmount {
  const gain = deepCollapseGain()
  if (isZeroAmount(gain)) return ZERO_AMOUNT
  const next = preparePrestigeAward(game.singularities, game.singTotal, game.collapses, gain)
  game.singularities = next.balance
  game.singTotal = next.total
  game.collapses = next.resetCount
  game.stardust = ZERO_AMOUNT
  game.stardustTotal = ZERO_AMOUNT
  game.constellation = []
  game.stardustWorks = {}
  game.eraEarned = ZERO_AMOUNT
  game.challengeReturn = null
  addChronicleMilestone('deep-collapse', 'Entered the local Deep boundary.')
  resetRun(true)
  game.numericLawState = {}
  return gain
}

export function buyDeepUpgrade(id: string): boolean {
  const def = DEEP_UPGRADE_BY_ID.get(id)
  const cost = def ? toAmount(def.cost) : ZERO_AMOUNT
  if (!def || game.singUpgrades.includes(id) || !gteAmount(game.singularities, cost)) return false
  game.singularities = subtractAmounts(game.singularities, cost)
  game.singUpgrades.push(id)
  return true
}

export const stardustMarketComplete = () => CONSTELLATION.every((node) => game.constellation.includes(node.id))
export const deepMarketComplete = () => DEEP_UPGRADES.every((upgrade) => game.singUpgrades.includes(upgrade.id))

export function buyStardustWork(id: StardustWorkId): boolean {
  const work = STARDUST_WORK_BY_ID.get(id)
  if (!work || !stardustMarketComplete()) return false
  const rank = workRank(game.stardustWorks, id)
  const cost = workCost(work, rank)
  if (cost === null || !gteAmount(game.stardust, cost)) return false
  game.stardust = subtractAmounts(game.stardust, cost)
  game.stardustWorks[id] = rank + 1
  return true
}

export function buyDeepWork(id: DeepWorkId): boolean {
  const work = DEEP_WORK_BY_ID.get(id)
  if (!work || !deepMarketComplete()) return false
  const rank = workRank(game.deepWorks, id)
  const cost = workCost(work, rank)
  if (cost === null || !gteAmount(game.singularities, cost)) return false
  game.singularities = subtractAmounts(game.singularities, cost)
  game.deepWorks[id] = rank + 1
  return true
}

// ── Curiosities ─────────────────────────────────────────────────────────
export function buyCuriosity(id: string): boolean {
  const cabinet = universeById(game.activeUniverse).cabinet
  const def = cabinet.itemById.get(id)
  const cost = def ? toAmount(def.cost) : ZERO_AMOUNT
  if (game.challenge || !def || game.curiosities.includes(id) || !gteAmount(game.light, cost)) return false
  game.light = subtractAmounts(game.light, cost)
  game.curiosities.push(id)
  const lokaPrefix = game.activeUniverse === 'brahmalok' ? 'brahmalok' : game.activeUniverse === 'vishnulok' ? 'vishnulok' : game.activeUniverse === 'kailash' ? 'kailash' : null
  if (lokaPrefix) {
    const held = new Set(game.curiosities)
    const shelfIndex = cabinet.shelves.findIndex((shelf) => shelf.ids.includes(id) && shelf.ids.every((recordId) => held.has(recordId)))
    const key = shelfIndex >= 0 ? `${lokaPrefix}-shelf-${shelfIndex + 1}-at` : ''
    if (key && !game.lokaProgress[key]) game.lokaProgress[key] = Date.now()
  }
  if (id === 'snail') game.snailLastGiftAt = Date.now()
  return true
}

export function skipLokaShelfSetPiece(key: string): boolean {
  if (!/^u[567]-shelf-[123]-at$/.test(key) || !game.lokaProgress[key]) return false
  game.lokaProgress[key] = 1
  return true
}

export function protostarFueled(now = Date.now()): boolean {
  const fuelItem = universeById(game.activeUniverse).cabinet.items.find(({ kind }) => kind === 'hearthkeeper')
  return !!fuelItem && hasCuriosity(fuelItem.id) && game.keeperFedUntil > now
}

export function fuelProtostar(): boolean {
  const fuelItem = universeById(game.activeUniverse).cabinet.items.find(({ kind }) => kind === 'hearthkeeper')
  if (game.challenge || !fuelItem || !hasCuriosity(fuelItem.id)) return false
  const cost = protostarFuelCost(passiveRatePerSec())
  if (!gteAmount(game.light, cost)) return false
  game.light = subtractAmounts(game.light, cost)
  const now = Date.now()
  const hours = universeById(game.activeUniverse).cabinet.fuelHours
  game.keeperFedUntil = Math.max(game.keeperFedUntil, now) + hours * 3600_000
  return true
}

export function cometProgress(now = Date.now()): number {
  if (!hasCuriosity('snail')) return 0
  const lastGiftAt = game.snailLastGiftAt || now
  const cycle = universeById(game.activeUniverse).cabinet.returnCycleSec
  return Math.min(1, (now - lastGiftAt) / (cycle * 1000))
}

export function collectCometReturn(): EconomyAmount {
  if (game.challenge) return ZERO_AMOUNT
  if (cometProgress() < 1) return ZERO_AMOUNT
  const amount = cometGift(passiveRatePerSec(), universeById(game.activeUniverse).cabinet.returnRateSeconds)
  earn(amount)
  game.snailLastGiftAt = Date.now()
  return amount
}

// ── The Vessel (prestige layer 3 scaffold) ──────────────────────────────
export function buildVesselPart(id: VesselPartId): boolean {
  if (game.challenge || vesselPartIdsFor(game).includes(id)) return false
  const part = vesselPartForUniverse(game.activeUniverse, id)
  if (!part || !vesselPartReady(game, part)) return false
  if (part.consumes) {
    const owned = game.owned[part.consumes.gen] ?? 0
    if (owned < part.consumes.count) return false
    game.owned[part.consumes.gen] = owned - part.consumes.count
  }
  const localParts = [...vesselPartIdsFor(game), id]
  game.vesselPartsByUniverse = {
    ...game.vesselPartsByUniverse,
    [game.activeUniverse]: localParts,
  }
  // Retain the original field as an Emberlight-only compatibility mirror.
  if (game.activeUniverse === DEFAULT_UNIVERSE_ID) game.vesselParts = [...localParts]
  return true
}

// ── Challenge trials ─────────────────────────────────────────────────────
export function startChallenge(id: string): boolean {
  const challenge = CHALLENGE_BY_ID.get(id)
  if (game.challenge || !challenge || game.challengesDone.includes(id)) return false
  if (!challengeUnlocked(game.challengesDone, challenge)) return false
  game.challengeReturn = snapshotRun()
  resetRun(false)
  game.numericLawState = {}
  game.challenge = id
  clickMeter.samples = []
  return true
}

/** Leave the trial and restore the main run that entered it. */
export function endChallenge(completed: boolean) {
  if (!game.challenge) return
  const challengeId = game.challenge
  const returnRun = game.challengeReturn
  if (completed && !game.challengesDone.includes(challengeId)) game.challengesDone.push(challengeId)
  game.challenge = null
  game.challengeReturn = null
  if (returnRun) restoreRun(returnRun)
  // Legacy mid-trial saves have no return snapshot; preserve their current run instead of wiping again.
  clickMeter.samples = []
}

export function buyNode(id: string): boolean {
  const node = NODE_BY_ID.get(id)
  if (!node || game.constellation.includes(id)) return false
  if (!nodeAvailable(game.constellation, node)) return false
  const cost = toAmount(node.cost)
  if (!gteAmount(game.stardust, cost)) return false
  game.stardust = subtractAmounts(game.stardust, cost)
  game.constellation.push(id)
  return true
}

/** extraMult carries the rhythm-combo multiplier from the UI layer. */
export function clickEmber(extraMult = 1): ClickResult {
  if (game.activeUniverse === 'kailash' && kailashLongRestStatus(game.numericLawState).resting) {
    return { amount: ZERO_AMOUNT, crit: false, critMult: 1 }
  }
  const randomAllowed = universeById(game.activeUniverse).twist.randomnessAllowed
  const chance = critChance()
  const crit = criticalClickOccurs({
    completedClicks: game.clicks,
    chance,
    randomnessAllowed: randomAllowed,
    randomRoll: randomAllowed ? Math.random() : undefined,
  })
  const mult = crit ? critMult() : 1
  const power = multiplyAmountByNumber(clickPower(), extraMult * mult)
  const next = prepareClickCommit(game, power, crit, game.challenge === null)
  game.light = next.light
  game.totalEarned = next.totalEarned
  game.allTimeEarned = next.allTimeEarned
  game.eraEarned = next.eraEarned
  game.clicks = next.clicks
  game.crits = next.crits
  game.bestCrit = next.bestCrit
  clickMeter.samples.push({ at: performance.now(), amount: power })
  pruneClickSamples()
  return { amount: power, crit, critMult: mult }
}

/** Buys according to the current buy amount. Returns units bought. */
export function buyGenerator(def: GeneratorDef): number {
  if (genPurchaseDisabled(game, def)) return 0
  const owned = game.owned[def.id] ?? 0
  const mult = costMultOf(game, def)
  const scale = costScaleOf(game)
  let count =
    game.buyAmount === 'max' ? maxAffordable(def, owned, game.light, mult, scale) : game.buyAmount
  const cap = challengeMods(game).maxOwnedPerGen
  if (cap !== undefined) count = Math.min(count, Math.max(0, cap - owned))
  if (count <= 0) return 0
  const cost = bulkCost(def, owned, count, mult, scale)
  if (!gteAmount(game.light, cost)) return 0
  game.light = subtractAmounts(game.light, cost)
  game.owned[def.id] = owned + count
  return count
}

export function buyUpgrade(id: string): boolean {
  if (challengeMods(game).noUpgrades) return false
  const def = upgradeById(game, id)
  if (!def || game.upgrades.includes(id)) return false
  const cost = toAmount(def.cost)
  if (!upgradeUnlocked(game, def) || !gteAmount(game.light, cost)) return false
  game.light = subtractAmounts(game.light, cost)
  game.upgrades.push(id)
  return true
}

export function buyUi(id: string): boolean {
  const def = UI_UNLOCK_BY_ID.get(id)
  const cost = def ? toAmount(def.cost) : ZERO_AMOUNT
  if (!def || game.ui.includes(id) || !gteAmount(game.light, cost)) return false
  game.light = subtractAmounts(game.light, cost)
  game.ui.push(id)
  return true
}

export function tick(dtSeconds: number) {
  game.playtime += dtSeconds
  tickBuffs()
  pruneClickSamples()
  if (game.activeUniverse === 'verdance') {
    const generatorIds = universeById('verdance').generators.map(({ id }) => id)
    advanceVerdanceCohortLawState(
      game.numericLawState,
      game.owned,
      generatorIds,
      dtSeconds * 1_000,
    )
  }
  const lawEvents = advanceF4LawState(game.activeUniverse, game.numericLawState, game.owned, dtSeconds, {
    upgrades: game.upgrades,
    archiveCount: game.curiosities.length,
    promptsPaused: game.challenge !== null,
  })
  applyF4LawEvents(lawEvents)
  const rate = passiveRatePerSec()
  if (!isZeroAmount(rate)) earn(multiplyAmountByNumber(rate, dtSeconds))
}

export function applyF4LawEvents(events: F4LawEvents): void {
  const add = (key: string, value: number) => {
    if (value <= 0) return
    game.lokaProgress[key] = Math.min(1_000_000_000, (game.lokaProgress[key] ?? 0) + value)
  }
  add('brahmalok-folios', events.foliosEarned)
  add('vishnulok-routes', events.routesEarned)
  add('vishnulok-returns', events.returnsCompleted)
  add('kailash-traces', events.tracesEarned)
  for (const announcement of events.announcements) {
    pushToast(
      game.activeUniverse === 'kailash' ? 'Mountain weather' : game.activeUniverse === 'vishnulok' ? 'Ocean strain' : 'Folio Commission',
      announcement.text,
      announcement.key,
    )
  }
}

/** Free, local reconfiguration for the active F4 world law. */
export function configureUniverseLaw(index: number): boolean {
  if (game.challenge) return false
  if (game.activeUniverse === 'brahmalok') return selectBrahmalokMode(game.numericLawState, index)
  if (game.activeUniverse === 'vishnulok') return selectVishnulokCircuit(game.numericLawState, index)
  if (game.activeUniverse === 'kailash') return selectKailashCycle(game.numericLawState, index)
  return false
}

/** Routes one Brahmalok Kindling through seed, measure, name, or form. */
export function configureBrahmalokDirection(kindlingIndex: number, directionIndex: number): boolean {
  return game.challenge === null && game.activeUniverse === 'brahmalok'
    ? routeBrahmalokKindling(game.numericLawState, kindlingIndex, directionIndex)
    : false
}

export function configureBrahmalokMargin(index: number | null): boolean {
  return game.challenge === null
    && game.activeUniverse === 'brahmalok'
    && game.curiosities.length >= 12
    ? selectBrahmalokMarginMode(game.numericLawState, index)
    : false
}

export function reviewBankedBrahmalokCommission(): boolean {
  return game.challenge === null
    && game.activeUniverse === 'brahmalok'
    ? openBankedBrahmalokCommission(game.numericLawState, game.curiosities.length)
    : false
}

/** Freely binds one Verdance rootstock cohort to one younger scion. */
export function configureVerdanceGrafting(rootstockIndex: number, scionIndex: number): boolean {
  return game.challenge === null && game.activeUniverse === 'verdance'
    ? configureVerdanceGraft(
      game.numericLawState,
      rootstockIndex,
      scionIndex,
      universeById('verdance').generators.length,
    )
    : false
}

export function severVerdanceGrafting(): boolean {
  return game.challenge === null && game.activeUniverse === 'verdance'
    ? clearVerdanceGraft(game.numericLawState)
    : false
}

/** Configures Vishnulok's declared circuit reach and carried burden. */
export function configureVishnulokPath(length: number, riskIndex: number): boolean {
  return game.challenge === null && game.activeUniverse === 'vishnulok'
    ? configureVishnulokCircuitState(game.numericLawState, length, riskIndex)
    : false
}

/** Advances one editable Kailash position through five game-fiction acts and rest. */
export function editKailashSlot(slotIndex: number): boolean {
  return game.challenge === null && game.activeUniverse === 'kailash'
    ? cycleKailashAct(game.numericLawState, slotIndex)
    : false
}

export const editKailashAct = editKailashSlot

export function kailashLongRestUnlocked(): boolean {
  return game.activeUniverse === 'kailash' && game.curiosities.length >= 12
}

export function beginKailashLongRest(): boolean {
  return game.challenge === null && kailashLongRestUnlocked()
    ? enterKailashLongRestState(game.numericLawState)
    : false
}

export function endKailashLongRest(): boolean {
  return game.activeUniverse === 'kailash'
    ? exitKailashLongRestState(game.numericLawState)
    : false
}

export function reviewBankedKailashFront(): boolean {
  return game.challenge === null
    && game.activeUniverse === 'kailash'
    ? recallBankedKailashFront(game.numericLawState)
    : false
}

/** Executes the active law action; Vishnulok completes its declared return. */
export function activateUniverseLaw(): boolean {
  return game.challenge === null && game.activeUniverse === 'vishnulok'
    ? completeVishnulokReturn(game.numericLawState)
    : false
}

export function activateVishnulokConfluence(): boolean {
  return game.challenge === null
    && game.activeUniverse === 'vishnulok'
    && game.upgrades.includes('vishnulok-auroral-return')
    ? completeSecondVishnulokReturn(game.numericLawState)
    : false
}

export function wipe() {
  game.activeUniverse = DEFAULT_UNIVERSE_ID
  game.light = ZERO_AMOUNT
  game.totalEarned = ZERO_AMOUNT
  game.clicks = 0
  game.owned = {}
  game.upgrades = []
  game.achievements = []
  game.stardustTotal = ZERO_AMOUNT
  game.constellation = []
  game.stardustWorks = {}
  game.singUpgrades = []
  game.deepWorks = {}
  game.challenge = null
  game.challengeReturn = null
  game.challengesDone = []
  game.ui = []
  game.seen = []
  game.playtime = 0
  game.buyAmount = 1
  game.starsCaught = 0
  game.bestCombo = 0
  game.allTimeEarned = ZERO_AMOUNT
  game.eraEarned = ZERO_AMOUNT
  game.stardust = ZERO_AMOUNT
  game.supernovae = 0
  game.echoes = []
  game.singularities = ZERO_AMOUNT
  game.singTotal = ZERO_AMOUNT
  game.collapses = 0
  game.autoKindler = true
  game.autoStoker = true
  game.autoNova = false
  game.autoNovaThreshold = ONE_AMOUNT
  game.ending = null
  game.theme = 'ember'
  game.remembrances = 0
  game.pastEndings = []
  game.curiosities = []
  game.keeperFedUntil = 0
  game.snailLastGiftAt = 0
  game.crits = 0
  game.bestCrit = ZERO_AMOUNT
  game.beacons = []
  game.darkBetween = ZERO_AMOUNT
  game.wayfinder = []
  game.vesselParts = []
  game.vesselPartsByUniverse = {}
  game.universeRuns = {}
  game.numericLawState = {}
  game.lokaProgress = {}
  Object.assign(game, emptyEndgameState())
}
