import type { GeneratorDef } from '../content/generators'
import { UI_UNLOCK_BY_ID } from '../content/ui-unlocks'
import { NODE_BY_ID, nodeAvailable, perkBonus } from '../content/constellation'
import { CHALLENGE_BY_ID } from '../content/challenges'
import { DEEP_UPGRADE_BY_ID, SINGULARITY_COST } from '../content/deep'
import {
  CURIOSITY_BY_ID,
  KEEPER_FED_HOURS,
  SECOND_CURSOR_CPS,
  SNAIL_CROSSING_SEC,
  keeperMealCost,
  snailGift,
} from '../content/curiosities'
import { DEFAULT_UNIVERSE_ID } from '../content/universes'
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
  /** purchased screen oddities */
  curiosities: string[]
  /** Hearthkeeper fed-until wall-clock time, ms */
  keeperFedUntil: number
  /** last Lighthouse Snail payout wall-clock time, ms */
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
  game.supernovae = 0
  game.singularities = 0
  game.singTotal = 0
  game.collapses = 0
  game.singUpgrades = []
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
  singUpgrades: [],
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
})

const CLICK_RATE_WINDOW_MS = 3_000
const clickMeter = $state<{ samples: Array<{ at: number; amount: number }> }>({ samples: [] })

function pruneClickSamples(now = performance.now()) {
  const cutoff = now - CLICK_RATE_WINDOW_MS
  if (clickMeter.samples.some((s) => s.at < cutoff)) {
    clickMeter.samples = clickMeter.samples.filter((s) => s.at >= cutoff)
  }
}

export const ratePerSec = () => totalRate(game)
export const passiveRatePerSec = () => totalRate(game) * productionBuffMult()
export const recentClickRatePerSec = () => {
  pruneClickSamples()
  const total = clickMeter.samples.reduce((sum, s) => sum + s.amount, 0)
  return total / (CLICK_RATE_WINDOW_MS / 1000)
}
export const activeRatePerSec = () => passiveRatePerSec() + recentClickRatePerSec()
export const clickPower = () => computeClickPower(game, productionBuffMult()) * clickBuffMult()
export const critChance = () => computeCritChance(game)
export const critMult = () => computeCritMult(game)
export const hasUi = (id: string) => game.ui.includes(id)
export const hasCuriosity = (id: string) => game.curiosities.includes(id)

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
  return deepGlow * horizon
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
  return Math.floor(game.stardustTotal / SINGULARITY_COST)
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

// ── Curiosities ─────────────────────────────────────────────────────────
export function buyCuriosity(id: string): boolean {
  const def = CURIOSITY_BY_ID.get(id)
  if (game.challenge || !def || game.curiosities.includes(id) || game.light < def.cost) return false
  game.light -= def.cost
  game.curiosities.push(id)
  if (id === 'snail') game.snailLastGiftAt = Date.now()
  return true
}

export function hearthkeeperFed(now = Date.now()): boolean {
  return hasCuriosity('hearthkeeper') && game.keeperFedUntil > now
}

export function feedHearthkeeper(): boolean {
  if (game.challenge || !hasCuriosity('hearthkeeper')) return false
  const cost = keeperMealCost(passiveRatePerSec())
  if (game.light < cost) return false
  game.light -= cost
  const now = Date.now()
  game.keeperFedUntil = Math.max(game.keeperFedUntil, now) + KEEPER_FED_HOURS * 3600_000
  return true
}

export function snailProgress(now = Date.now()): number {
  if (!hasCuriosity('snail')) return 0
  const lastGiftAt = game.snailLastGiftAt || now
  return Math.min(1, (now - lastGiftAt) / (SNAIL_CROSSING_SEC * 1000))
}

export function collectSnailGift(): number {
  if (game.challenge) return 0
  if (snailProgress() < 1) return 0
  const amount = snailGift(passiveRatePerSec())
  earn(amount)
  game.snailLastGiftAt = Date.now()
  return amount
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
  if (hasCuriosity('second-cursor') && !game.challenge) {
    const ghostLight = clickPower() * SECOND_CURSOR_CPS * dtSeconds
    earn(ghostLight)
    clickMeter.samples.push({ at: performance.now(), amount: ghostLight })
  }
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
  game.singUpgrades = []
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
}
