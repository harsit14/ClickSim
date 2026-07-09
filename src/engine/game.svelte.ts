import type { GeneratorDef } from '../content/generators'
import { UI_UNLOCK_BY_ID } from '../content/ui-unlocks'
import { NODE_BY_ID, nodeAvailable, perkBonus } from '../content/constellation'
import { CHALLENGE_BY_ID } from '../content/challenges'
import { DEEP_UPGRADE_BY_ID, SINGULARITY_COST } from '../content/deep'
import { clickBuffMult, productionBuffMult, tickBuffs } from '../systems/buffs.svelte'
import {
  type EcoState,
  totalRate,
  clickPower as computeClickPower,
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
}

/** The Question becomes available once its moment has been witnessed. */
export function questionReady(): boolean {
  return game.seen.includes('act3-hook') && game.ending === null
}

export function chooseEnding(id: 'warden' | 'hunger' | 'companion') {
  if (game.ending !== null) return
  game.ending = id
}

export const game: GameState = $state({
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
export const hasUi = (id: string) => game.ui.includes(id)

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
export function clickEmber(extraMult = 1): number {
  const power = clickPower() * extraMult
  game.clicks += 1
  earn(power)
  clickMeter.samples.push({ at: performance.now(), amount: power })
  pruneClickSamples()
  return power
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
  const def = upgradeById(id)
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
}
