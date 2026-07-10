import type { GeneratorDef } from '../content/generators'
import type { UpgradeDef, Effect } from '../content/upgrades'
import { NODE_BY_ID } from '../content/constellation'
import { CHALLENGE_BY_ID, type ChallengeMods } from '../content/challenges'
import { DEEP_EFFECTS, DEEP_UPGRADE_BY_ID } from '../content/deep'
import {
  curiosityClickMult,
  curiosityProductionMult,
} from '../content/curiosities'
import { universeById, V2_UNIVERSE_BY_ID } from '../content/universes'
import { verdanceGeneratorCohortStatus } from '../content/universes/verdance/runtime'
import { f4ClickMultiplier, f4RateMultiplier } from '../content/universes/f4-runtime'
import { wayfinderProductionMult, wayfinderTideAmplitude } from '../content/wayfinder'
import { deepProductionMult, stardustProductionMult } from '../content/repeatables'
import type { EconomyAmount, UniverseId } from '../content/universes/types'
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
import { atlasRouteMultiplier, decodeAtlasRoute } from '../endgame/atlas'
import type { ActiveAtlasRoute, LawLoadout } from '../endgame/types'
import {
  formulaAmount,
  formulaScalar,
  type FormulaBreakdown,
  type FormulaNode,
  type FormulaOperation,
  type FormulaSourceKind,
  type FormulaTerm,
  type FormulaValue,
} from '../core/numeric/formula-breakdown'

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
  /** Amount-valued state for universe-specific production laws. */
  numericLawState?: Readonly<Record<string, EconomyAmount>>
  /** Temporary Atlas route; the parked source run remains outside the route. */
  activeAtlasRoute?: ActiveAtlasRoute | null
  lawLoadouts?: readonly LawLoadout[]
  activeLawLoadoutId?: string | null
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
  const loadout = s.lawLoadouts?.find((entry) => entry.id === s.activeLawLoadoutId && entry.universeId === s.activeUniverse)
  const doctrine = loadout
    ? V2_UNIVERSE_BY_ID.get(loadout.universeId)?.economy.doctrines.find((entry) => entry.id === loadout.doctrineId)
    : null
  if (doctrine) yield* doctrine.effects
}

interface EffectSourceRecord {
  id: string
  label: string
  kind: FormulaSourceKind
  effects: readonly Effect[]
}

function effectSourceRecords(s: EcoState): EffectSourceRecord[] {
  const records: EffectSourceRecord[] = []
  for (const id of s.upgrades) {
    const upgrade = upgradeById(s, id)
    if (upgrade) records.push({ id, label: upgrade.name, kind: 'upgrade', effects: upgrade.effects })
  }
  for (const id of s.constellation) {
    const node = NODE_BY_ID.get(id)
    if (node) records.push({ id, label: node.name, kind: 'epoch', effects: node.effects })
  }
  for (const id of s.singUpgrades) {
    const effects = DEEP_EFFECTS[id]
    const upgrade = DEEP_UPGRADE_BY_ID.get(id)
    if (effects && upgrade) records.push({ id, label: upgrade.name, kind: 'deep', effects })
  }
  for (const id of s.challengesDone) {
    const challenge = CHALLENGE_BY_ID.get(id)
    if (challenge) records.push({ id, label: challenge.name, kind: 'deep', effects: challenge.rewardEffects })
  }
  const loadout = s.lawLoadouts?.find((entry) => entry.id === s.activeLawLoadoutId && entry.universeId === s.activeUniverse)
  const doctrine = loadout
    ? V2_UNIVERSE_BY_ID.get(loadout.universeId)?.economy.doctrines.find((entry) => entry.id === loadout.doctrineId)
    : null
  if (doctrine) records.push({ id: doctrine.id, label: doctrine.name, kind: 'universe-law', effects: doctrine.effects })
  return records
}

function formulaTerm(
  id: string,
  sourceKind: FormulaSourceKind,
  sourceId: string,
  label: string,
  value: FormulaValue,
  universeId?: string,
  detail?: string,
): FormulaTerm {
  return {
    kind: 'term',
    id,
    source: {
      kind: sourceKind,
      id: sourceId,
      label,
      ...(universeId ? { universeId: universeId as UniverseId } : {}),
    },
    value,
    ...(detail ? { detail } : {}),
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
  const cohortMultiplier = s.activeUniverse === 'verdance'
    ? verdanceGeneratorCohortStatus(def.id, s.owned[def.id] ?? 0, s.numericLawState).multiplier
    : 1
  return multiplyAmountByNumber(
    toAmount(def.baseRate),
    mult * (1 + synergy * synergyBonusMult(s)) * cohortMultiplier,
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
  const atlasRoute = s.activeAtlasRoute ? decodeAtlasRoute(s.activeAtlasRoute.routeCode) : null
  if (atlasRoute && atlasRoute.universeId === s.activeUniverse) {
    multiplier = multiplyAmountByNumber(multiplier, atlasRouteMultiplier(atlasRoute))
  }
  const fuelItemId = universe.cabinet.items.find(({ kind }) => kind === 'hearthkeeper')?.id
  if (fuelItemId && s.curiosities.includes(fuelItemId) && s.keeperFedUntil > now) {
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
  if (s.activeUniverse === 'prismata' || s.activeUniverse === 'tempest' || s.activeUniverse === 'canticle') {
    return f4RateMultiplier(s.activeUniverse, s.numericLawState, s.owned, now)
  }
  const raw = universeById(s.activeUniverse).twist.rateMultiplier?.(now) ?? 1
  return s.activeUniverse === 'tidefall'
    ? 1 + (raw - 1) * wayfinderTideAmplitude(s.wayfinder)
    : raw
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
    hunger
      * curiosityClickMult(s.curiosities, cabinet)
      * (challengeMods(s).clickScale ?? 1)
      * f4ClickMultiplier(s.activeUniverse, s.numericLawState, s.owned, now),
  )
}

function globalFormulaTerms(s: EcoState, now: number, prefix: string): FormulaNode[] {
  const universe = universeById(s.activeUniverse)
  const terms: FormulaNode[] = [
    formulaTerm(
      `${prefix}:radiance`,
      'system',
      'achievement-radiance',
      'Achievement radiance',
      formulaAmount(amountFromNumber(1 + 0.01 * s.achievements.length)),
      universe.id,
      `${s.achievements.length} achievements`,
    ),
    formulaTerm(
      `${prefix}:stardust`,
      'epoch',
      'stardust-glow',
      'Stardust glow',
      formulaAmount(addAmounts(ONE_AMOUNT, multiplyAmountByNumber(s.stardustTotal, 0.02))),
      universe.id,
    ),
    formulaTerm(
      `${prefix}:remembrance`,
      'doctrine',
      'remembrance-memory',
      'Remembrance memory',
      formulaAmount(powAmount(amountFromNumber(2), s.remembrances)),
      universe.id,
      `${s.remembrances} remembrances`,
    ),
    formulaTerm(
      `${prefix}:beacons`,
      'between',
      'beacon-network',
      'Beacon network',
      formulaAmount(powAmount(amountFromNumber(3), s.beacons.length)),
      undefined,
      `${s.beacons.length} beacons`,
    ),
    formulaTerm(`${prefix}:wayfinder`, 'between', 'wayfinder-production', 'Wayfinder laws', formulaScalar('multiplier', wayfinderProductionMult(s.wayfinder))),
    formulaTerm(`${prefix}:epoch-works`, 'epoch', 'stardust-works', 'Epoch works', formulaScalar('multiplier', stardustProductionMult(s.stardustWorks)), universe.id),
    formulaTerm(`${prefix}:deep-works`, 'deep', 'deep-works', 'Deep works', formulaScalar('multiplier', deepProductionMult(s.deepWorks))),
    formulaTerm(`${prefix}:archive`, 'archive', universe.cabinet.id, universe.cabinet.title, formulaScalar('multiplier', curiosityProductionMult(s.curiosities, universe.cabinet)), universe.id),
  ]

  const fuelItemId = universe.cabinet.items.find(({ kind }) => kind === 'hearthkeeper')?.id
  if (fuelItemId && s.curiosities.includes(fuelItemId) && s.keeperFedUntil > now) {
    terms.push(formulaTerm(
      `${prefix}:archive-fuel`,
      'archive',
      `${fuelItemId}-fuel`,
      'Fueled archive object',
      formulaScalar('multiplier', universe.cabinet.fuelProductionMult),
      universe.id,
    ))
  }
  const endingMultiplier = s.ending === 'warden' ? 1.25 : s.ending === 'companion' ? 1.3 : null
  if (endingMultiplier !== null) {
    terms.push(formulaTerm(
      `${prefix}:doctrine`,
      'doctrine',
      s.ending!,
      `${s.ending![0].toUpperCase()}${s.ending!.slice(1)} answer`,
      formulaScalar('multiplier', endingMultiplier),
    ))
  }
  for (const record of effectSourceRecords(s)) {
    record.effects.forEach((effect, index) => {
      if (effect.kind !== 'globalMult') return
      terms.push(formulaTerm(
        `${prefix}:effect:${record.kind}:${record.id}:${index}`,
        record.kind,
        record.id,
        record.label,
        formulaScalar('multiplier', effect.value),
        universe.id,
      ))
    })
  }
  return terms
}

function generatorRateFormula(
  s: EcoState,
  generator: GeneratorDef,
  owned: number,
): FormulaOperation {
  const universe = universeById(s.activeUniverse)
  const prefix = `rate:kindling:${generator.id}`
  const genMultiplierInputs: FormulaNode[] = [
    formulaTerm(`${prefix}:gen-mult-base`, 'base', `${generator.id}-base-multiplier`, 'Base generator multiplier', formulaScalar('multiplier', 1), universe.id),
  ]
  const synergyInputs: FormulaNode[] = []
  const synergyMultiplierInputs: FormulaNode[] = [
    formulaTerm(`${prefix}:synergy-scale-base`, 'base', 'base-synergy-scale', 'Base resonance scale', formulaScalar('multiplier', 1), universe.id),
  ]
  let generatorMultiplier = 1
  let synergy = 0
  let synergyScale = 1

  if (s.activeUniverse === 'verdance') {
    const cohort = verdanceGeneratorCohortStatus(generator.id, owned, s.numericLawState)
    generatorMultiplier *= cohort.multiplier
    genMultiplierInputs.push(formulaTerm(
      `${prefix}:cohort-maturity`,
      'universe-law',
      `${generator.id}-cohort-maturity`,
      `${cohort.stageLabel} cohort maturity`,
      formulaScalar('multiplier', cohort.multiplier),
      universe.id,
    ))
  }

  for (const record of effectSourceRecords(s)) {
    record.effects.forEach((effect, index) => {
      if (effect.kind === 'genMult' && effect.gen === generator.id) {
        generatorMultiplier *= effect.value
        genMultiplierInputs.push(formulaTerm(
          `${prefix}:gen-mult:${record.kind}:${record.id}:${index}`,
          record.kind,
          record.id,
          record.label,
          formulaScalar('multiplier', effect.value),
          universe.id,
        ))
      } else if (effect.kind === 'synergy' && effect.gen === generator.id) {
        const pairedOwned = s.owned[effect.per] ?? 0
        const paired = universe.generatorById.get(effect.per)
        const contribution = effect.value * pairedOwned
        synergy += contribution
        synergyInputs.push({
          kind: 'operation',
          id: `${prefix}:synergy:${record.kind}:${record.id}:${index}`,
          label: `${record.label} from ${paired?.name ?? effect.per}`,
          operator: 'product',
          inputs: [
            formulaTerm(`${prefix}:synergy-value:${record.kind}:${record.id}:${index}`, record.kind, record.id, record.label, formulaScalar('ratio', effect.value), universe.id),
            formulaTerm(`${prefix}:synergy-count:${record.kind}:${record.id}:${index}`, 'kindling', effect.per, paired?.name ?? effect.per, formulaScalar('count', pairedOwned), universe.id),
          ],
          result: formulaScalar('ratio', contribution),
        })
      } else if (effect.kind === 'synergyMult') {
        synergyScale *= effect.value
        synergyMultiplierInputs.push(formulaTerm(
          `${prefix}:synergy-scale:${record.kind}:${record.id}:${index}`,
          record.kind,
          record.id,
          record.label,
          formulaScalar('multiplier', effect.value),
          universe.id,
        ))
      }
    })
  }
  if (synergyInputs.length === 0) {
    synergyInputs.push(formulaTerm(
      `${prefix}:synergy-none`,
      'system',
      `${generator.id}-no-resonance`,
      'No active resonance',
      formulaScalar('ratio', 0),
      universe.id,
    ))
  }
  const synergySum: FormulaOperation = {
    kind: 'operation',
    id: `${prefix}:synergy-sum`,
    label: 'Resonance bonus',
    operator: 'sum',
    inputs: synergyInputs,
    result: formulaScalar('ratio', synergy),
  }
  const synergyScaleOperation: FormulaOperation = {
    kind: 'operation',
    id: `${prefix}:synergy-scale-product`,
    label: 'Resonance scale',
    operator: 'product',
    inputs: synergyMultiplierInputs,
    result: formulaScalar('multiplier', synergyScale),
  }
  const scaledSynergy: FormulaOperation = {
    kind: 'operation',
    id: `${prefix}:scaled-synergy`,
    label: 'Scaled resonance bonus',
    operator: 'product',
    inputs: [synergySum, synergyScaleOperation],
    result: formulaScalar('ratio', synergy * synergyScale),
  }
  const resonanceMultiplier: FormulaOperation = {
    kind: 'operation',
    id: `${prefix}:resonance-multiplier`,
    label: 'Final resonance multiplier',
    operator: 'sum',
    inputs: [
      formulaTerm(`${prefix}:resonance-base`, 'base', 'base-resonance', 'Base production', formulaScalar('multiplier', 1), universe.id),
      scaledSynergy,
    ],
    result: formulaScalar('multiplier', 1 + synergy * synergyScale),
  }
  const contribution = multiplyAmountByNumber(unitRate(s, generator), owned)
  return {
    kind: 'operation',
    id: `${prefix}:subtotal`,
    label: generator.name,
    operator: 'product',
    inputs: [
      formulaTerm(`${prefix}:base-rate`, 'base', `${generator.id}-base-rate`, `${generator.name} base rate`, formulaAmount(toAmount(generator.baseRate)), universe.id),
      formulaTerm(`${prefix}:owned`, 'kindling', generator.id, `${generator.name} owned`, formulaScalar('count', owned), universe.id),
      {
        kind: 'operation',
        id: `${prefix}:gen-mult-product`,
        label: 'Generator multipliers',
        operator: 'product',
        inputs: genMultiplierInputs,
        result: formulaScalar('multiplier', generatorMultiplier),
      },
      resonanceMultiplier,
    ],
    result: formulaAmount(contribution),
    collapsedByDefault: true,
  }
}

/** Pure explanation tree for the current passive production rate. */
export function rateFormula(
  s: EcoState,
  evaluatedAtMs: number,
  outputMultiplier = 1,
): FormulaBreakdown {
  const universe = universeById(s.activeUniverse)
  const mods = challengeMods(s)
  const kindlingTerms: FormulaNode[] = []
  const kindlingAmounts: EconomyAmount[] = []
  if (!mods.gensDisabled) {
    for (const generator of universe.generators) {
      const owned = Math.min(s.owned[generator.id] ?? 0, mods.maxOwnedPerGen ?? Number.POSITIVE_INFINITY)
      if (owned <= 0 || genDisabled(s, generator)) continue
      const contribution = multiplyAmountByNumber(unitRate(s, generator), owned)
      kindlingAmounts.push(contribution)
      kindlingTerms.push(generatorRateFormula(s, generator, owned))
    }
  }
  if (kindlingTerms.length === 0) {
    kindlingAmounts.push(ZERO_AMOUNT)
    kindlingTerms.push(formulaTerm(
      'rate:kindling:none',
      'system',
      'no-active-kindlings',
      'No active Kindlings',
      formulaAmount(ZERO_AMOUNT),
      universe.id,
    ))
  }
  const baseRate = sumAmounts(kindlingAmounts)
  const globalTerms = globalFormulaTerms(s, evaluatedAtMs, 'rate:global')
  const resultAmount = multiplyAmountByNumber(totalRate(s, evaluatedAtMs), outputMultiplier)
  const root: FormulaNode = {
    kind: 'operation',
    id: 'rate:result',
    label: 'Current passive production',
    operator: 'product',
    inputs: [
      {
        kind: 'operation',
        id: 'rate:kindling-sum',
        label: 'Active Kindlings',
        operator: 'sum',
        inputs: kindlingTerms,
        result: formulaAmount(baseRate),
      },
      {
        kind: 'operation',
        id: 'rate:global-product',
        label: 'Persistent multipliers',
        operator: 'product',
        inputs: globalTerms,
        result: formulaAmount(globalMult(s, evaluatedAtMs)),
        collapsedByDefault: true,
      },
      formulaTerm('rate:universe-law', 'universe-law', `${universe.id}-rate-law`, universe.twist.name, formulaScalar('multiplier', universeRateMult(s, evaluatedAtMs)), universe.id),
      formulaTerm('rate:challenge', 'system', s.challenge ?? 'no-challenge', s.challenge ? 'Trial production rule' : 'No trial penalty', formulaScalar('multiplier', mods.globalScale ?? 1), universe.id),
      formulaTerm('rate:omen', 'omen', 'active-production-effect', 'Active production effect', formulaScalar('multiplier', outputMultiplier), universe.id),
    ],
    result: formulaAmount(resultAmount),
  }
  return {
    contractVersion: 'formula-breakdown-v1',
    formulaId: 'current-passive-rate-v1',
    universeId: universe.id as UniverseId,
    subject: { kind: 'rate', sourceId: universe.id },
    root,
    result: formulaAmount(resultAmount),
    evaluatedAtMs,
  }
}

/** Pure explanation tree for click power with all dynamic multipliers explicit. */
export function clickFormula(
  s: EcoState,
  rateMultiplier: number,
  evaluatedAtMs: number,
  outputMultiplier = 1,
): FormulaBreakdown {
  const universe = universeById(s.activeUniverse)
  const flatInputs: FormulaNode[] = [
    formulaTerm('click:flat-base', 'heart', `${universe.id}-heart`, universe.centralObject, formulaAmount(ONE_AMOUNT), universe.id),
  ]
  const shareInputs: FormulaNode[] = [
    formulaTerm('click:share-base', 'base', 'base-click-rate-share', 'Base rate share', formulaScalar('ratio', BASE_CLICK_RATE_SHARE), universe.id),
  ]
  let flatMultiplier = 1
  let share = BASE_CLICK_RATE_SHARE
  for (const record of effectSourceRecords(s)) {
    record.effects.forEach((effect, index) => {
      if (effect.kind === 'clickMult') {
        flatMultiplier *= effect.value
        flatInputs.push(formulaTerm(`click:flat:${record.kind}:${record.id}:${index}`, record.kind, record.id, record.label, formulaScalar('multiplier', effect.value), universe.id))
      } else if (effect.kind === 'clickShare') {
        share += effect.value
        shareInputs.push(formulaTerm(`click:share:${record.kind}:${record.id}:${index}`, record.kind, record.id, record.label, formulaScalar('ratio', effect.value), universe.id))
      }
    })
  }
  const rate = totalRate(s, evaluatedAtMs)
  const ratePower = multiplyAmountByNumber(rate, rateMultiplier * share)
  const flatPower = amountFromNumber(flatMultiplier)
  const preModifier = maxAmount(flatPower, ratePower)
  const cabinetMultiplier = curiosityClickMult(s.curiosities, universe.cabinet)
  const challengeMultiplier = challengeMods(s).clickScale ?? 1
  const hungerMultiplier = s.ending === 'hunger' ? 2 : 1
  const lawClickMultiplier = f4ClickMultiplier(s.activeUniverse, s.numericLawState, s.owned, evaluatedAtMs)
  const resultAmount = multiplyAmountByNumber(clickPower(s, rateMultiplier, evaluatedAtMs), outputMultiplier)
  const root: FormulaNode = {
    kind: 'operation',
    id: 'click:result',
    label: 'Current click power',
    operator: 'product',
    inputs: [
      {
        kind: 'operation',
        id: 'click:minimum-choice',
        label: 'Flat power or rate share',
        operator: 'maximum',
        inputs: [
          { kind: 'operation', id: 'click:flat-product', label: 'Flat click power', operator: 'product', inputs: flatInputs, result: formulaAmount(flatPower) },
          {
            kind: 'operation',
            id: 'click:rate-product',
            label: 'Production rate share',
            operator: 'product',
            inputs: [
              formulaTerm('click:rate', 'system', 'current-production-rate', 'Current production rate', formulaAmount(rate), universe.id),
              formulaTerm('click:rate-multiplier', 'omen', 'active-production-effect', 'Active production effect', formulaScalar('multiplier', rateMultiplier), universe.id),
              { kind: 'operation', id: 'click:share-sum', label: 'Click rate share', operator: 'sum', inputs: shareInputs, result: formulaScalar('ratio', share) },
            ],
            result: formulaAmount(ratePower),
          },
        ],
        result: formulaAmount(preModifier),
      },
      formulaTerm('click:hunger', 'doctrine', s.ending === 'hunger' ? 'hunger' : 'no-hunger', 'Hunger answer', formulaScalar('multiplier', hungerMultiplier)),
      formulaTerm('click:archive', 'archive', universe.cabinet.id, universe.cabinet.title, formulaScalar('multiplier', cabinetMultiplier), universe.id),
      formulaTerm('click:challenge', 'system', s.challenge ?? 'no-challenge', s.challenge ? 'Trial click rule' : 'No trial click penalty', formulaScalar('multiplier', challengeMultiplier), universe.id),
      formulaTerm('click:universe-law', 'universe-law', `${universe.id}-click-law`, universe.twist.name, formulaScalar('multiplier', lawClickMultiplier), universe.id),
      formulaTerm('click:omen', 'omen', 'active-click-effect', 'Active click effect', formulaScalar('multiplier', outputMultiplier), universe.id),
    ],
    result: formulaAmount(resultAmount),
  }
  return {
    contractVersion: 'formula-breakdown-v1',
    formulaId: 'current-click-power-v1',
    universeId: universe.id as UniverseId,
    subject: { kind: 'click', sourceId: `${universe.id}-heart` },
    root,
    result: formulaAmount(resultAmount),
    evaluatedAtMs,
  }
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
