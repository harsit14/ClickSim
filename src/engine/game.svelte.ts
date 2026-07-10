import type { GeneratorDef } from '../content/generators'
import { UI_UNLOCK_BY_ID } from '../content/ui-unlocks'
import { CONSTELLATION, NODE_BY_ID, nodeAvailable, perkBonus } from '../content/constellation'
import { CHALLENGE_BY_ID } from '../content/challenges'
import { DEEP_UPGRADES, DEEP_UPGRADE_BY_ID, SINGULARITY_COST } from '../content/deep'
import {
  CURIOSITY_BY_ID,
  COMET_ORBIT_SEC,
  PROTOSTAR_FUEL_HOURS,
  cometGift,
  protostarFuelCost,
} from '../content/curiosities'
import { DEFAULT_UNIVERSE_ID, UNIVERSE_BY_ID, universeById } from '../content/universes'
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
  WAYFINDER_BY_ID,
  wayfinderNodeAvailable,
  wayfinderStartingKindlings,
  type WayfinderId,
} from '../content/wayfinder'
import {
  VESSEL_PART_BY_ID,
  vesselComplete as computeVesselComplete,
  vesselHasReadyPart as computeVesselHasReadyPart,
  vesselPartReady,
  vesselRevealed as computeVesselRevealed,
  type VesselPartId,
} from '../content/vessel'
import { clickBuffMult, productionBuffMult, tickBuffs } from '../systems/buffs.svelte'
import {
  type EcoState,
  totalRate,
  clickPower as computeClickPower,
  critChance as computeCritChance,
  critMult as computeCritMult,
  bulkCost,
  maxAffordable,
  costMultOf,
  costScaleOf,
  genDisabled,
  upgradeById,
  upgradeUnlocked,
} from './compute'

export type BuyAmount = 1 | 10 | 100 | 'max'

export interface RunSnapshot {
  light: number
  totalEarned: number
  owned: Record<string, number>
  upgrades: string[]
  buyAmount: BuyAmount
}

/** The progression that stays anchored to one universe when the Vessel leaves. */
export interface UniverseRunState {
  light: number
  totalEarned: number
  clicks: number
  owned: Record<string, number>
  upgrades: string[]
  buyAmount: BuyAmount
  seen: string[]
  stardust: number
  stardustTotal: number
  supernovae: number
  constellation: string[]
  stardustWorks: Record<string, number>
  echoes: string[]
  eraEarned: number
  singularities: number
  singTotal: number
  collapses: number
  singUpgrades: string[]
  deepWorks: Record<string, number>
  challenge: string | null
  challengeReturn: RunSnapshot | null
  challengesDone: string[]
  autoKindler: boolean
  autoStoker: boolean
  autoNova: boolean
  autoNovaThreshold: number
  ending: 'warden' | 'hunger' | 'companion' | null
  curiosities: string[]
  keeperFedUntil: number
  snailLastGiftAt: number
  crits: number
  bestCrit: number
}

export interface ClickResult {
  amount: number
  crit: boolean
  critMult: number
}

export interface GameState extends EcoState {
  ui: string[]
  seen: string[]
  playtime: number
  sfxVolume: number
  musicVolume: number
  buyAmount: BuyAmount
  starsCaught: number
  bestCombo: number
  /** light earned across ALL rebirths — never resets, for the record books */
  allTimeEarned: number
  /** light earned this deep-era — drives stardust math, resets at deep collapse */
  eraEarned: number
  /** unspent stardust */
  stardust: number
  supernovae: number
  echoes: string[]
  /** unspent singularities (layer 2) */
  singularities: number
  singTotal: number
  collapses: number
  autoKindler: boolean
  autoStoker: boolean
  autoNova: boolean
  autoNovaThreshold: number
  /** Main-run state to restore after a temporary trial. */
  challengeReturn: RunSnapshot | null
  /** vestment (cosmetic accent theme) id */
  theme: string
  /** every answer ever given, oldest first */
  pastEndings: Array<'warden' | 'hunger' | 'companion'>
  /** catalogued celestial phenomena (legacy ids are save-stable) */
  curiosities: string[]
  /** Protostar fueled-until wall-clock time, ms */
  keeperFedUntil: number
  /** last long-period comet return payout wall-clock time, ms */
  snailLastGiftAt: number
  /** critical click count */
  crits: number
  /** largest single critical click */
  bestCrit: number
  /** universes finished strongly enough to shine across worlds */
  beacons: string[]
  /** layer-3 meta-currency, earned between universes */
  darkBetween: number
  /** multiverse-level perks */
  wayfinder: string[]
  /** completed visible Vessel construction parts */
  vesselParts: string[]
  /** parked progression for every visited universe, including the current one at save time */
  universeRuns: Record<string, UniverseRunState>
}

/** The Question becomes available once its moment has been witnessed. */
export function questionReady(): boolean {
  return game.seen.includes('act3-hook') && game.ending === null
}

export function chooseEnding(id: 'warden' | 'hunger' | 'companion') {
  if (game.ending !== null) return
  game.ending = id
}

/** Remembrance — NG+. Everything returns to the first dark pixel, except what
 *  Lumen keeps: the echoes, the record (achievements), and the memory itself,
 *  which doubles all light each time. The question may be answered again. */
export function performRemembrance(): boolean {
  if (game.ending === null) return false
  game.pastEndings.push(game.ending)
  game.remembrances += 1
  // survives: echoes, achievements, pastEndings, theme, volumes,
  // curiosities, and the record books (allTimeEarned, playtime, starsCaught, bestCombo)
  game.light = 0
  game.totalEarned = 0
  game.clicks = 0
  game.owned = {}
  game.upgrades = []
  game.buyAmount = 1
  game.ui = [] // the interface is bought again, piece by piece
  game.seen = [] // the story replays — Lumen remembers, and says so
  game.stardust = 0
  game.stardustTotal = 0
  game.eraEarned = 0
  game.constellation = []
  game.stardustWorks = {}
  game.supernovae = 0
  game.singularities = 0
  game.singTotal = 0
  game.collapses = 0
  game.singUpgrades = []
  game.deepWorks = {}
  game.challenge = null
  game.challengeReturn = null
  game.challengesDone = []
  game.autoKindler = true
  game.autoStoker = true
  game.autoNova = false
  game.autoNovaThreshold = 1
  game.ending = null
  return true
}

export const game: GameState = $state({
  activeUniverse: DEFAULT_UNIVERSE_ID,
  light: 0,
  totalEarned: 0,
  clicks: 0,
  owned: {},
  upgrades: [],
  achievements: [],
  stardustTotal: 0,
  constellation: [],
  stardustWorks: {},
  singUpgrades: [],
  deepWorks: {},
  challenge: null,
  challengesDone: [],
  ui: [],
  seen: [],
  playtime: 0,
  sfxVolume: 0.5,
  musicVolume: 0.6,
  buyAmount: 1,
  starsCaught: 0,
  bestCombo: 0,
  allTimeEarned: 0,
  eraEarned: 0,
  stardust: 0,
  supernovae: 0,
  echoes: [],
  singularities: 0,
  singTotal: 0,
  collapses: 0,
  autoKindler: true,
  autoStoker: true,
  autoNova: false,
  autoNovaThreshold: 1,
  challengeReturn: null,
  ending: null,
  theme: 'ember',
  remembrances: 0,
  pastEndings: [],
  curiosities: [],
  keeperFedUntil: 0,
  snailLastGiftAt: 0,
  crits: 0,
  bestCrit: 0,
  beacons: [],
  darkBetween: 0,
  wayfinder: [],
  vesselParts: [],
  universeRuns: {},
})

function copyChallengeRun(run: RunSnapshot | null): RunSnapshot | null {
  if (!run) return null
  return {
    light: run.light,
    totalEarned: run.totalEarned,
    owned: { ...run.owned },
    upgrades: [...run.upgrades],
    buyAmount: run.buyAmount,
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
  }
}

function freshUniverseRun(universeId: string): UniverseRunState {
  const firstGenerator = universeById(universeId).generators[0]
  const startingKindlings = wayfinderStartingKindlings(game.wayfinder)
  return {
    light: 0,
    totalEarned: 0,
    clicks: 0,
    owned: startingKindlings > 0 && firstGenerator ? { [firstGenerator.id]: startingKindlings } : {},
    upgrades: [],
    buyAmount: 1,
    seen: [],
    stardust: 0,
    stardustTotal: 0,
    supernovae: 0,
    constellation: [],
    stardustWorks: {},
    echoes: [],
    eraEarned: 0,
    singularities: 0,
    singTotal: 0,
    collapses: 0,
    singUpgrades: [],
    deepWorks: {},
    challenge: null,
    challengeReturn: null,
    challengesDone: [],
    autoKindler: true,
    autoStoker: true,
    autoNova: false,
    autoNovaThreshold: 1,
    ending: null,
    curiosities: [],
    keeperFedUntil: 0,
    snailLastGiftAt: 0,
    crits: 0,
    bestCrit: 0,
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
}

export function universeVisited(id: string): boolean {
  return id === game.activeUniverse || game.universeRuns[id] !== undefined
}

export function universeBeaconReady(id = game.activeUniverse): boolean {
  const pack = UNIVERSE_BY_ID.get(id)
  if (!pack || game.beacons.includes(id)) return false
  const owned = id === game.activeUniverse ? game.owned : game.universeRuns[id]?.owned
  return (owned?.[pack.beacon.generatorId] ?? 0) >= pack.beacon.count
}

export function igniteCurrentBeacon(): number {
  if (game.challenge || !computeVesselComplete(game) || !universeBeaconReady()) return 0
  const pack = universeById(game.activeUniverse)
  game.beacons.push(pack.id)
  game.darkBetween += pack.beacon.reward
  return pack.beacon.reward
}

export function universeRouteUnlocked(id: string): boolean {
  if (!UNIVERSE_BY_ID.has(id) || !computeVesselComplete(game)) return false
  if (id === DEFAULT_UNIVERSE_ID || universeVisited(id)) return true
  if (id === 'tidefall') return game.beacons.includes(DEFAULT_UNIVERSE_ID)
  return false
}

export function buyWayfinder(id: WayfinderId): boolean {
  const node = WAYFINDER_BY_ID.get(id)
  if (!node || !wayfinderNodeAvailable(game.wayfinder, node) || game.darkBetween < node.cost) return false
  game.darkBetween -= node.cost
  game.wayfinder.push(id)
  return true
}

export function crossToUniverse(id: string): boolean {
  if (game.challenge || id === game.activeUniverse || !universeRouteUnlocked(id)) return false
  game.universeRuns[game.activeUniverse] = snapshotUniverseRun()
  const destination = game.universeRuns[id] ?? freshUniverseRun(id)
  game.activeUniverse = id
  restoreUniverseRun(destination)
  clickMeter.samples = []
  return true
}

const CLICK_RATE_WINDOW_MS = 3_000
const clickMeter = $state<{ samples: Array<{ at: number; amount: number }> }>({ samples: [] })

function pruneClickSamples(now = performance.now()) {
  const cutoff = now - CLICK_RATE_WINDOW_MS
  if (clickMeter.samples.some((s) => s.at < cutoff)) {
    clickMeter.samples = clickMeter.samples.filter((s) => s.at >= cutoff)
  }
}

export const ratePerSec = (now = Date.now()) => totalRate(game, now)
export const passiveRatePerSec = (now = Date.now()) => totalRate(game, now) * productionBuffMult()
export const recentClickRatePerSec = (now = performance.now()) => {
  // This function is read by Svelte derived values, so it must remain pure.
  // Expired samples are removed by click/tick mutations; ignore any that remain
  // here without writing reactive state during derivation.
  const cutoff = now - CLICK_RATE_WINDOW_MS
  const total = clickMeter.samples.reduce((sum, sample) => (
    sample.at >= cutoff ? sum + sample.amount : sum
  ), 0)
  return total / (CLICK_RATE_WINDOW_MS / 1000)
}
export const activeRatePerSec = (now = Date.now()) => passiveRatePerSec(now) + recentClickRatePerSec()
export const clickPower = () => computeClickPower(game, productionBuffMult()) * clickBuffMult()
export const critChance = () => computeCritChance(game)
export const critMult = () => computeCritMult(game)
export const hasUi = (id: string) => game.ui.includes(id)
export const hasCuriosity = (id: string) => game.curiosities.includes(id)
export const vesselRevealed = () => computeVesselRevealed(game)
export const vesselComplete = () => computeVesselComplete(game)
export const vesselHasReadyPart = () => computeVesselHasReadyPart(game)

export function earn(amount: number) {
  game.light += amount
  game.totalEarned += amount
  game.allTimeEarned += amount
  // Trial light counts for the run, but never becomes stardust.
  if (!game.challenge) game.eraEarned += amount
}

// ── Supernova (prestige layer 1) ─────────────────────────────────────────
export const STARDUST_PIVOT = 1e18

function stardustScale(): number {
  const horizon = game.singUpgrades.includes('event-horizon') ? 2 : 1
  const deepGlow = 1 + 0.5 * game.singTotal
  return deepGlow * horizon * stardustYieldMult(game.stardustWorks)
}

export function potentialStardust(): number {
  return Math.floor(Math.sqrt(game.eraEarned / STARDUST_PIVOT) * stardustScale())
}

export function stardustTargetFor(totalStardust: number): number {
  return Math.pow(totalStardust / stardustScale(), 2) * STARDUST_PIVOT
}

/** Stardust gained by collapsing right now. */
export function supernovaGain(): number {
  if (game.challenge) return 0 // trials give no stardust
  return Math.max(0, potentialStardust() - game.stardustTotal)
}

/** Rebuild-from-nothing shared by every kind of reset. */
function resetRun(withHeadStart: boolean) {
  game.light = 0
  game.totalEarned = 0
  game.owned = {}
  game.upgrades = []
  game.buyAmount = 1
  if (!withHeadStart) return
  const sparks =
    perkBonus(game.constellation, 'headStart') +
    (game.singUpgrades.includes('dawn-memory') ? 40 : 0)
  if (sparks > 0) game.owned['spark'] = sparks
  if (game.singUpgrades.includes('dawn-memory')) game.owned['wisp'] = 5
}

function snapshotRun(): RunSnapshot {
  return {
    light: game.light,
    totalEarned: game.totalEarned,
    owned: { ...game.owned },
    upgrades: [...game.upgrades],
    buyAmount: game.buyAmount,
  }
}

function restoreRun(snapshot: RunSnapshot) {
  game.light = snapshot.light
  game.totalEarned = snapshot.totalEarned
  game.owned = { ...snapshot.owned }
  game.upgrades = [...snapshot.upgrades]
  game.buyAmount = snapshot.buyAmount
}

/** The state reset. The cutscene around it lives in the UI layer. */
export function performSupernova(): number {
  const gain = supernovaGain()
  if (gain <= 0) return 0
  game.stardust += gain
  game.stardustTotal += gain
  game.supernovae += 1
  game.challengeReturn = null
  resetRun(true)
  return gain
}

// ── The Deep (prestige layer 2) ──────────────────────────────────────────
export function deepCollapseGain(): number {
  if (game.challenge) return 0
  return Math.floor((game.stardustTotal / SINGULARITY_COST) * singularityYieldMult(game.deepWorks))
}

/** Collapse the era: stardust, constellation, and era-light all return to the dark. */
export function performDeepCollapse(): number {
  const gain = deepCollapseGain()
  if (gain <= 0) return 0
  game.singularities += gain
  game.singTotal += gain
  game.collapses += 1
  game.stardust = 0
  game.stardustTotal = 0
  game.constellation = []
  game.stardustWorks = {}
  game.eraEarned = 0
  game.challengeReturn = null
  resetRun(true)
  return gain
}

export function buyDeepUpgrade(id: string): boolean {
  const def = DEEP_UPGRADE_BY_ID.get(id)
  if (!def || game.singUpgrades.includes(id) || game.singularities < def.cost) return false
  game.singularities -= def.cost
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
  if (!Number.isFinite(cost) || game.stardust < cost) return false
  game.stardust -= cost
  game.stardustWorks[id] = rank + 1
  return true
}

export function buyDeepWork(id: DeepWorkId): boolean {
  const work = DEEP_WORK_BY_ID.get(id)
  if (!work || !deepMarketComplete()) return false
  const rank = workRank(game.deepWorks, id)
  const cost = workCost(work, rank)
  if (!Number.isFinite(cost) || game.singularities < cost) return false
  game.singularities -= cost
  game.deepWorks[id] = rank + 1
  return true
}

// ── Curiosities ─────────────────────────────────────────────────────────
export function buyCuriosity(id: string): boolean {
  const def = CURIOSITY_BY_ID.get(id)
  if (game.challenge || !def || game.curiosities.includes(id) || game.light < def.cost) return false
  game.light -= def.cost
  game.curiosities.push(id)
  if (id === 'snail') game.snailLastGiftAt = Date.now()
  return true
}

export function protostarFueled(now = Date.now()): boolean {
  return hasCuriosity('hearthkeeper') && game.keeperFedUntil > now
}

export function fuelProtostar(): boolean {
  if (game.challenge || !hasCuriosity('hearthkeeper')) return false
  const cost = protostarFuelCost(passiveRatePerSec())
  if (game.light < cost) return false
  game.light -= cost
  const now = Date.now()
  game.keeperFedUntil = Math.max(game.keeperFedUntil, now) + PROTOSTAR_FUEL_HOURS * 3600_000
  return true
}

export function cometProgress(now = Date.now()): number {
  if (!hasCuriosity('snail')) return 0
  const lastGiftAt = game.snailLastGiftAt || now
  return Math.min(1, (now - lastGiftAt) / (COMET_ORBIT_SEC * 1000))
}

export function collectCometReturn(): number {
  if (game.challenge) return 0
  if (cometProgress() < 1) return 0
  const amount = cometGift(passiveRatePerSec())
  earn(amount)
  game.snailLastGiftAt = Date.now()
  return amount
}

// ── The Vessel (prestige layer 3 scaffold) ──────────────────────────────
export function buildVesselPart(id: VesselPartId): boolean {
  if (game.challenge || game.vesselParts.includes(id)) return false
  const part = VESSEL_PART_BY_ID.get(id)
  if (!part || !vesselPartReady(game, part)) return false
  if (part.consumes) {
    const owned = game.owned[part.consumes.gen] ?? 0
    if (owned < part.consumes.count) return false
    game.owned[part.consumes.gen] = owned - part.consumes.count
  }
  game.vesselParts.push(id)
  return true
}

// ── Challenge trials ─────────────────────────────────────────────────────
export function startChallenge(id: string): boolean {
  if (game.challenge || !CHALLENGE_BY_ID.has(id) || game.challengesDone.includes(id)) return false
  game.challengeReturn = snapshotRun()
  resetRun(false)
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
  if (game.stardust < node.cost) return false
  game.stardust -= node.cost
  game.constellation.push(id)
  return true
}

/** extraMult carries the rhythm-combo multiplier from the UI layer. */
export function clickEmber(extraMult = 1): ClickResult {
  const roll = Math.random()
  const chance = critChance()
  const crit = roll < chance
  const mult = crit ? critMult() : 1
  const power = clickPower() * extraMult * mult
  game.clicks += 1
  if (crit) {
    game.crits += 1
    if (power > game.bestCrit) game.bestCrit = power
  }
  earn(power)
  clickMeter.samples.push({ at: performance.now(), amount: power })
  pruneClickSamples()
  return { amount: power, crit, critMult: mult }
}

/** Buys according to the current buy amount. Returns units bought. */
export function buyGenerator(def: GeneratorDef): number {
  if (genDisabled(game, def)) return 0
  const owned = game.owned[def.id] ?? 0
  const mult = costMultOf(game, def)
  const scale = costScaleOf(game)
  const count =
    game.buyAmount === 'max' ? maxAffordable(def, owned, game.light, mult, scale) : game.buyAmount
  if (count <= 0) return 0
  const cost = bulkCost(def, owned, count, mult, scale)
  if (game.light < cost) return 0
  game.light -= cost
  game.owned[def.id] = owned + count
  return count
}

export function buyUpgrade(id: string): boolean {
  const def = upgradeById(game, id)
  if (!def || game.upgrades.includes(id)) return false
  if (!upgradeUnlocked(game, def) || game.light < def.cost) return false
  game.light -= def.cost
  game.upgrades.push(id)
  return true
}

export function buyUi(id: string): boolean {
  const def = UI_UNLOCK_BY_ID.get(id)
  if (!def || game.ui.includes(id) || game.light < def.cost) return false
  game.light -= def.cost
  game.ui.push(id)
  return true
}

export function tick(dtSeconds: number) {
  game.playtime += dtSeconds
  tickBuffs()
  pruneClickSamples()
  const rate = passiveRatePerSec()
  if (rate > 0) earn(rate * dtSeconds)
}

export function wipe() {
  game.activeUniverse = DEFAULT_UNIVERSE_ID
  game.light = 0
  game.totalEarned = 0
  game.clicks = 0
  game.owned = {}
  game.upgrades = []
  game.achievements = []
  game.stardustTotal = 0
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
  game.allTimeEarned = 0
  game.eraEarned = 0
  game.stardust = 0
  game.supernovae = 0
  game.echoes = []
  game.singularities = 0
  game.singTotal = 0
  game.collapses = 0
  game.autoKindler = true
  game.autoStoker = true
  game.autoNova = false
  game.autoNovaThreshold = 1
  game.ending = null
  game.theme = 'ember'
  game.remembrances = 0
  game.pastEndings = []
  game.curiosities = []
  game.keeperFedUntil = 0
  game.snailLastGiftAt = 0
  game.crits = 0
  game.bestCrit = 0
  game.beacons = []
  game.darkBetween = 0
  game.wayfinder = []
  game.vesselParts = []
  game.universeRuns = {}
}
