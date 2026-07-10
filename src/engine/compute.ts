import type { GeneratorDef } from '../content/generators'
import type { UpgradeDef, Effect } from '../content/upgrades'
import { NODE_BY_ID } from '../content/constellation'
import { CHALLENGE_BY_ID, type ChallengeMods } from '../content/challenges'
import { DEEP_EFFECTS } from '../content/deep'
import {
  curiosityClickMult,
  curiosityProductionMult,
} from '../content/curiosities'
import { universeById } from '../content/universes'
import { wayfinderProductionMult, wayfinderTideAmplitude } from '../content/wayfinder'
import { deepProductionMult, stardustProductionMult } from '../content/repeatables'
import type { EconomyAmount } from '../content/universes/types'
import {
  ONE_AMOUNT,
  ZERO_AMOUNT,
  addAmounts,
  amountFromNumber,
  amountLog10,
  amountToNumber,
  ceilAmount,
  compareAmounts,
  divideAmounts,
  gteAmount,
  maxAmount,
  multiplyAmountByNumber,
  multiplyAmounts,
  powAmount,
  subtractAmounts,
  sumAmounts,
  toAmount,
} from '../core/numeric/amount'

/** The purely economic slice of game state — everything production math needs.
 *  Kept free of Svelte so the headless balance simulator can drive it. */
export interface EcoState {
  /** active content pack */
  activeUniverse: string
  light: EconomyAmount
  totalEarned: EconomyAmount
  clicks: number
  owned: Record<string, number>
  upgrades: string[]
  /** unlocked achievement ids — each grants +1% Radiance to all production */
  achievements: string[]
  /** stardust earned this deep-era — each grants +2% to all production */
  stardustTotal: EconomyAmount
  /** owned constellation node ids — their effects join the modifier pipeline */
  constellation: string[]
  /** repeatable Stardust works; reset by a Deep Collapse */
  stardustWorks: Record<string, number>
  /** owned singularity upgrades (layer 2) */
  singUpgrades: string[]
  /** repeatable Singularity works; persist through Deep Collapses */
  deepWorks: Record<string, number>
  /** active challenge trial, if any */
  challenge: string | null
  /** completed challenge trials — their rewards are permanent */
  challengesDone: string[]
  /** the answer to the question, once given */
  ending: 'warden' | 'hunger' | 'companion' | null
  /** completed NG+ cycles — each doubles all production, forever */
  remembrances: number
  /** celestial phenomena catalogued in this universe */
  curiosities: string[]
  /** wall-clock ms until the Protostar cools; 0 means unfueled */
  keeperFedUntil: number
  /** universes finished strongly enough to shine across worlds */
  beacons: string[]
  /** layer-3 meta-currency, earned between universes */
  darkBetween: EconomyAmount
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

/** Permanent multiplier applied to the bonus portion of every generator resonance. */
export function synergyBonusMult(s: EcoState): number {
  let mult = 1
  for (const effect of ownedEffects(s)) {
    if (effect.kind === 'synergyMult') mult *= effect.value
  }
  return mult
}

/** Production of one unit of a generator, before the global multiplier. */
export function unitRate(s: EcoState, def: GeneratorDef): EconomyAmount {
  let mult = 1
  let synergy = 0
  for (const e of ownedEffects(s)) {
    if (e.kind === 'genMult' && e.gen === def.id) mult *= e.value
    else if (e.kind === 'synergy' && e.gen === def.id) synergy += e.value * (s.owned[e.per] ?? 0)
  }
  return multiplyAmountByNumber(
    toAmount(def.baseRate),
    mult * (1 + synergy * synergyBonusMult(s)),
  )
}

export function globalMult(s: EcoState, now = Date.now()): EconomyAmount {
  const universe = universeById(s.activeUniverse)
  let multiplier = amountFromNumber(1 + 0.01 * s.achievements.length) // Radiance
  multiplier = multiplyAmounts(
    multiplier,
    addAmounts(ONE_AMOUNT, multiplyAmountByNumber(s.stardustTotal, 0.02)),
  )
  multiplier = multiplyAmounts(multiplier, powAmount(amountFromNumber(2), s.remembrances))
  multiplier = multiplyAmounts(multiplier, powAmount(amountFromNumber(3), s.beacons.length))
  multiplier = multiplyAmountByNumber(multiplier, wayfinderProductionMult(s.wayfinder))
  multiplier = multiplyAmountByNumber(multiplier, stardustProductionMult(s.stardustWorks))
  multiplier = multiplyAmountByNumber(multiplier, deepProductionMult(s.deepWorks))
  multiplier = multiplyAmountByNumber(multiplier, curiosityProductionMult(s.curiosities, universe.cabinet))
  if (s.curiosities.includes('hearthkeeper') && s.keeperFedUntil > now) {
    multiplier = multiplyAmountByNumber(multiplier, universe.cabinet.fuelProductionMult)
  }
  if (s.ending === 'warden') multiplier = multiplyAmountByNumber(multiplier, 1.25)
  else if (s.ending === 'companion') multiplier = multiplyAmountByNumber(multiplier, 1.3)
  for (const e of ownedEffects(s)) {
    if (e.kind === 'globalMult') multiplier = multiplyAmountByNumber(multiplier, e.value)
  }
  return multiplier
}

/** The active universe's living physics at a specific moment. */
export function universeRateMult(s: EcoState, now = Date.now()): number {
  const raw = universeById(s.activeUniverse).twist.rateMultiplier?.(now) ?? 1
  return 1 + (raw - 1) * wayfinderTideAmplitude(s.wayfinder)
}

/** true when a challenge silences this generator entirely */
export function genDisabled(s: EcoState, def: GeneratorDef): boolean {
  const mods = challengeMods(s)
  if (mods.gensDisabled) return true
  if (mods.maxTier !== undefined && def.tier > mods.maxTier) return true
  if (mods.disabledTierParity === 'odd' && def.tier % 2 === 1) return true
  if (mods.disabledTierParity === 'even' && def.tier % 2 === 0) return true
  if (mods.highestTierOnly) {
    const highest = universeById(s.activeUniverse).generators.reduce(
      (tier, generator) => (s.owned[generator.id] ?? 0) > 0 ? Math.max(tier, generator.tier) : tier,
      0,
    )
    if (highest > 0 && def.tier !== highest) return true
  }
  return false
}

/** Restrictions that prevent purchasing, separate from production-only silencing. */
export function genPurchaseDisabled(s: EcoState, def: GeneratorDef): boolean {
  const mods = challengeMods(s)
  if (mods.gensDisabled) return true
  if (mods.maxTier !== undefined && def.tier > mods.maxTier) return true
  if (mods.disabledTierParity === 'odd' && def.tier % 2 === 1) return true
  if (mods.disabledTierParity === 'even' && def.tier % 2 === 0) return true
  return mods.maxOwnedPerGen !== undefined && (s.owned[def.id] ?? 0) >= mods.maxOwnedPerGen
}

export function genRate(s: EcoState, def: GeneratorDef, now = Date.now()): EconomyAmount {
  const cap = challengeMods(s).maxOwnedPerGen ?? Number.POSITIVE_INFINITY
  const owned = Math.min(s.owned[def.id] ?? 0, cap)
  if (owned === 0 || genDisabled(s, def)) return ZERO_AMOUNT
  let rate = multiplyAmountByNumber(unitRate(s, def), owned)
  rate = multiplyAmounts(rate, globalMult(s, now))
  return multiplyAmountByNumber(
    rate,
    universeRateMult(s, now) * (challengeMods(s).globalScale ?? 1),
  )
}

export function totalRate(s: EcoState, now = Date.now()): EconomyAmount {
  const mods = challengeMods(s)
  if (mods.gensDisabled) return ZERO_AMOUNT
  const rates: EconomyAmount[] = []
  for (const g of universeById(s.activeUniverse).generators) {
    const owned = Math.min(s.owned[g.id] ?? 0, mods.maxOwnedPerGen ?? Number.POSITIVE_INFINITY)
    if (owned > 0 && !genDisabled(s, g)) rates.push(multiplyAmountByNumber(unitRate(s, g), owned))
  }
  const base = sumAmounts(rates)
  return multiplyAmountByNumber(
    multiplyAmounts(base, globalMult(s, now)),
    universeRateMult(s, now) * (mods.globalScale ?? 1),
  )
}

export function clickPower(s: EcoState, rateMult = 1, now = Date.now()): EconomyAmount {
  let mult = 1
  let share = BASE_CLICK_RATE_SHARE
  for (const e of ownedEffects(s)) {
    if (e.kind === 'clickMult') mult *= e.value
    else if (e.kind === 'clickShare') share += e.value
  }
  const hunger = s.ending === 'hunger' ? 2 : 1
  const ratePower = multiplyAmountByNumber(totalRate(s, now), rateMult * share)
  const cabinet = universeById(s.activeUniverse).cabinet
  return multiplyAmountByNumber(
    maxAmount(amountFromNumber(mult), ratePower),
    hunger * curiosityClickMult(s.curiosities, cabinet) * (challengeMods(s).clickScale ?? 1),
  )
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

export function costOf(
  def: GeneratorDef,
  owned: number,
  mult = def.costMult,
  scale = 1,
): EconomyAmount {
  const growth = powAmount(amountFromNumber(mult), owned)
  return ceilAmount(multiplyAmountByNumber(multiplyAmounts(toAmount(def.baseCost), growth), scale))
}

/** Cost of buying `count` units starting from `owned` (geometric series). */
export function bulkCost(
  def: GeneratorDef,
  owned: number,
  count: number,
  mult = def.costMult,
  scale = 1,
): EconomyAmount {
  if (!Number.isSafeInteger(count) || count <= 0) return ZERO_AMOUNT
  const base = multiplyAmountByNumber(toAmount(def.baseCost), scale)
  if (mult === 1) return ceilAmount(multiplyAmountByNumber(base, count))
  const growth = powAmount(amountFromNumber(mult), owned)
  const series = divideAmounts(
    subtractAmounts(powAmount(amountFromNumber(mult), count), ONE_AMOUNT),
    amountFromNumber(mult - 1),
  )
  return ceilAmount(multiplyAmounts(multiplyAmounts(base, growth), series))
}

export function maxAffordable(
  def: GeneratorDef,
  owned: number,
  light: EconomyAmount,
  mult = def.costMult,
  scale = 1,
): number {
  const next = costOf(def, owned, mult, scale)
  if (!gteAmount(light, next)) return 0
  if (mult === 1) {
    const quotient = divideAmounts(light, next)
    if (quotient.exponent >= 9) return 1_000_000_000
    return Math.min(1_000_000_000, Math.floor(amountToNumber(quotient)))
  }
  const ratio = addAmounts(
    ONE_AMOUNT,
    divideAmounts(multiplyAmountByNumber(light, mult - 1), next),
  )
  let count = Math.min(1_000_000_000, Math.floor(amountLog10(ratio) / Math.log10(mult)))
  while (count > 0 && !gteAmount(light, bulkCost(def, owned, count, mult, scale))) count -= 1
  while (count < 1_000_000_000 && gteAmount(light, bulkCost(def, owned, count + 1, mult, scale))) count += 1
  return count
}

export function upgradeUnlocked(s: EcoState, u: UpgradeDef): boolean {
  const q = u.unlock
  if (q.gen !== undefined && (s.owned[q.gen] ?? 0) < (q.count ?? 1)) return false
  if (q.totalEarned !== undefined && !gteAmount(s.totalEarned, toAmount(q.totalEarned))) return false
  if (q.clicks !== undefined && s.clicks < q.clicks) return false
  if (q.curiosity !== undefined && !s.curiosities.includes(q.curiosity)) return false
  return true
}

/** Unlocked, not-yet-owned upgrades, cheapest first. */
export function availableUpgrades(s: EcoState): UpgradeDef[] {
  if (challengeMods(s).noUpgrades) return []
  return universeById(s.activeUniverse).upgrades.filter((u) => !s.upgrades.includes(u.id) && upgradeUnlocked(s, u)).sort(
    (a, b) => compareAmounts(toAmount(a.cost), toAmount(b.cost)),
  )
}
