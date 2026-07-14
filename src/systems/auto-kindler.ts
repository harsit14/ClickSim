import { universeById } from '../content/universes'
import type { GeneratorDef } from '../content/generators'
import {
  autoKindlerFamilyForTier,
  type AutoKindlerFamily,
  type AutoKindlerPriority,
} from '../core/automation-preferences'
import type { EconomyAmount } from '../content/universes/types'
import {
  amountLog10,
  compareAmounts,
  gteAmount,
  isZeroAmount,
  multiplyAmounts,
} from '../core/numeric/amount'
import {
  costOf,
  costMultOf,
  costScaleOf,
  genDisabled,
  globalMult,
  unitRate,
  type EcoState,
} from '../engine/compute'

export interface AutoKindlerSettings {
  readonly families: readonly AutoKindlerFamily[]
  readonly priority: AutoKindlerPriority
}

export interface AutoKindlerPurchase {
  readonly generator: GeneratorDef
  readonly cost: EconomyAmount
  readonly paybackLog10: number
  readonly owned: number
  readonly affordable: boolean
}

function compareCandidate(
  left: AutoKindlerPurchase,
  right: AutoKindlerPurchase,
  priority: AutoKindlerPriority,
): number {
  if (priority === 'cheapest') {
    return compareAmounts(left.cost, right.cost) || left.paybackLog10 - right.paybackLog10
  }
  if (priority === 'least-owned') {
    return left.owned - right.owned || left.paybackLog10 - right.paybackLog10
  }
  if (priority === 'highest-tier') {
    return right.generator.tier - left.generator.tier || left.paybackLog10 - right.paybackLog10
  }
  return left.paybackLog10 - right.paybackLog10 || left.generator.tier - right.generator.tier
}

function rankedAutoKindlerPurchases(
  state: EcoState,
  settings: AutoKindlerSettings,
): AutoKindlerPurchase[] {
  if (settings.families.length === 0) return []
  const allowed = new Set(settings.families)
  const scale = costScaleOf(state)
  const candidates: AutoKindlerPurchase[] = []
  for (const generator of universeById(state.activeUniverse).generators) {
    if (!allowed.has(autoKindlerFamilyForTier(generator.tier)) || genDisabled(state, generator)) continue
    const owned = state.owned[generator.id] ?? 0
    const cost = costOf(generator, owned, costMultOf(state, generator), scale)
    const delta = multiplyAmounts(unitRate(state, generator), globalMult(state))
    if (isZeroAmount(delta)) continue
    candidates.push({
      generator,
      cost,
      paybackLog10: amountLog10(cost) - amountLog10(delta),
      owned,
      affordable: gteAmount(state.light, cost),
    })
  }
  candidates.sort((left, right) => compareCandidate(left, right, settings.priority))
  return candidates
}

/** Previews the next routed target even when its cost is still gathering. */
export function previewAutoKindlerPurchase(
  state: EcoState,
  settings: AutoKindlerSettings,
): AutoKindlerPurchase | null {
  return rankedAutoKindlerPurchases(state, settings)[0] ?? null
}

/** Chooses one affordable purchase without mutating the supplied economy. */
export function selectAutoKindlerPurchase(
  state: EcoState,
  settings: AutoKindlerSettings,
): AutoKindlerPurchase | null {
  return rankedAutoKindlerPurchases(state, settings).find(({ affordable }) => affordable) ?? null
}
