import type { GeneratorDef } from '../content/generators'
import type { UpgradeDef, Effect } from '../content/upgrades'
import { NODE_BY_ID } from '../content/constellation'
import { CHALLENGE_BY_ID, type ChallengeMods } from '../content/challenges'
import { DEEP_EFFECTS } from '../content/deep'
import { KEEPER_BONUS } from '../content/curiosities'
import { universeById } from '../content/universes'

/** The purely economic slice of game state — everything production math needs.
 *  Kept free of Svelte so the headless balance simulator can drive it. */
export interface EcoState {
  /** active content pack */
  activeUniverse: string
  light: number
  totalEarned: number
  clicks: number
  owned: Record<string, number>
  upgrades: string[]
  /** unlocked achievement ids — each grants +1% Radiance to all production */
  achievements: string[]
  /** stardust earned this deep-era — each grants +2% to all production */
  stardustTotal: number
  /** owned constellation node ids — their effects join the modifier pipeline */
  constellation: string[]
  /** owned singularity upgrades (layer 2) */
  singUpgrades: string[]
  /** active challenge trial, if any */
  challenge: string | null
  /** completed challenge trials — their rewards are permanent */
  challengesDone: string[]
  /** the answer to the question, once given */
  ending: 'warden' | 'hunger' | 'companion' | null
  /** completed NG+ cycles — each doubles all production, forever */
  remembrances: number
  /** one-shot oddities bought for this universe */
  curiosities: string[]
  /** wall-clock ms until the Hearthkeeper helps; 0 means sulking */
  keeperFedUntil: number
  /** universes finished strongly enough to shine across worlds */
  beacons: string[]
  /** layer-3 meta-currency, earned between universes */
  darkBetween: number
  /** multiverse-level perks */
  wayfinder: string[]
  /** completed visible Vessel construction parts */
  vesselParts: string[]
}

const NO_MODS: ChallengeMods = {}

export function challengeMods(s: EcoState): ChallengeMods {
  return (s.challenge && CHALLENGE_BY_ID.get(s.challenge)?.mods) || NO_MODS
}

const BASE_CLICK_RATE_SHARE = 0.05

export function upgradeById(s: Pick<EcoState, 'activeUniverse'>, id: string): UpgradeDef | undefined {
  return universeById(s.activeUniverse).upgradeById.get(id)
}

function* ownedEffects(s: EcoState): Generator<Effect> {
  for (const id of s.upgrades) {
    const u = upgradeById(s, id)
    if (u) yield* u.effects
  }
  for (const id of s.constellation) {
    const n = NODE_BY_ID.get(id)
    if (n) yield* n.effects
  }
  for (const id of s.singUpgrades) {
    const fx = DEEP_EFFECTS[id]
    if (fx) yield* fx
  }
  for (const id of s.challengesDone) {
    const c = CHALLENGE_BY_ID.get(id)
    if (c) yield* c.rewardEffects
  }
}

/** Production of one unit of a generator, before the global multiplier. */
export function unitRate(s: EcoState, def: GeneratorDef): number {
  let mult = 1
  let synergy = 0
  for (const e of ownedEffects(s)) {
    if (e.kind === 'genMult' && e.gen === def.id) mult *= e.value
    else if (e.kind === 'synergy' && e.gen === def.id) synergy += e.value * (s.owned[e.per] ?? 0)
  }
  return def.baseRate * mult * (1 + synergy)
}

export function globalMult(s: EcoState, now = Date.now()): number {
  let m = 1 + 0.01 * s.achievements.length // Radiance
  m *= 1 + 0.02 * s.stardustTotal // stardust, kept across every rebirth
  m *= Math.pow(2, s.remembrances) // memory glow — the universe remembers being bright
  m *= Math.pow(3, s.beacons.length) // Beacons will be earned by future Crossings.
  if (s.curiosities.includes('hearthkeeper') && s.keeperFedUntil > now) m *= KEEPER_BONUS
  if (s.ending === 'warden') m *= 1.25
  else if (s.ending === 'companion') m *= 1.3
  for (const e of ownedEffects(s)) if (e.kind === 'globalMult') m *= e.value
  return m
}

/** true when a challenge silences this generator entirely */
export function genDisabled(s: EcoState, def: GeneratorDef): boolean {
  const mods = challengeMods(s)
  if (mods.gensDisabled) return true
  return mods.maxTier !== undefined && def.tier > mods.maxTier
}

export function genRate(s: EcoState, def: GeneratorDef): number {
  const owned = s.owned[def.id] ?? 0
  if (owned === 0 || genDisabled(s, def)) return 0
  return unitRate(s, def) * owned * globalMult(s) * (challengeMods(s).globalScale ?? 1)
}

export function totalRate(s: EcoState): number {
  const mods = challengeMods(s)
  if (mods.gensDisabled) return 0
  let sum = 0
  for (const g of universeById(s.activeUniverse).generators) {
    const owned = s.owned[g.id] ?? 0
    if (owned > 0 && !genDisabled(s, g)) sum += unitRate(s, g) * owned
  }
  return sum * globalMult(s) * (mods.globalScale ?? 1)
}

export function clickPower(s: EcoState, rateMult = 1): number {
  let mult = 1
  let share = BASE_CLICK_RATE_SHARE
  for (const e of ownedEffects(s)) {
    if (e.kind === 'clickMult') mult *= e.value
    else if (e.kind === 'clickShare') share += e.value
  }
  const hunger = s.ending === 'hunger' ? 2 : 1
  const ratePower = totalRate(s) * rateMult * share
  return Math.max(mult, ratePower) * hunger
}

export function critChance(s: EcoState): number {
  let chance = 0.03
  for (const e of ownedEffects(s)) if (e.kind === 'critChance') chance += e.value
  return Math.min(0.35, chance)
}

export function critMult(s: EcoState): number {
  let mult = 10
  for (const e of ownedEffects(s)) if (e.kind === 'critMult') mult += e.value
  return mult
}

/** Cost growth rate, considering an active Entropy trial. */
export function costMultOf(s: EcoState, def: GeneratorDef): number {
  return challengeMods(s).costMult ?? def.costMult
}

/** Permanent cost discount from completed trials. */
export function costScaleOf(s: EcoState): number {
  let scale = 1
  for (const id of s.challengesDone) {
    const c = CHALLENGE_BY_ID.get(id)
    if (c?.rewardCostScale) scale *= c.rewardCostScale
  }
  return scale
}

export function costOf(def: GeneratorDef, owned: number, mult = def.costMult, scale = 1): number {
  return Math.ceil(def.baseCost * scale * Math.pow(mult, owned))
}

/** Cost of buying `count` units starting from `owned` (geometric series). */
export function bulkCost(
  def: GeneratorDef,
  owned: number,
  count: number,
  mult = def.costMult,
  scale = 1,
): number {
  const m = mult
  return Math.ceil((def.baseCost * scale * Math.pow(m, owned) * (Math.pow(m, count) - 1)) / (m - 1))
}

export function maxAffordable(
  def: GeneratorDef,
  owned: number,
  light: number,
  mult = def.costMult,
  scale = 1,
): number {
  const m = mult
  const next = def.baseCost * scale * Math.pow(m, owned)
  if (light < next) return 0
  return Math.floor(Math.log((light * (m - 1)) / next + 1) / Math.log(m))
}

export function upgradeUnlocked(s: EcoState, u: UpgradeDef): boolean {
  const q = u.unlock
  if (q.gen !== undefined && (s.owned[q.gen] ?? 0) < (q.count ?? 1)) return false
  if (q.totalEarned !== undefined && s.totalEarned < q.totalEarned) return false
  if (q.clicks !== undefined && s.clicks < q.clicks) return false
  if (q.curiosity !== undefined && !s.curiosities.includes(q.curiosity)) return false
  return true
}

/** Unlocked, not-yet-owned upgrades, cheapest first. */
export function availableUpgrades(s: EcoState): UpgradeDef[] {
  return universeById(s.activeUniverse).upgrades.filter((u) => !s.upgrades.includes(u.id) && upgradeUnlocked(s, u)).sort(
    (a, b) => a.cost - b.cost,
  )
}
