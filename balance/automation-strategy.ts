import type { EcoState } from '../src/engine/compute'
import { subtractAmounts, serializeAmount } from '../src/core/numeric/amount'
import type { SerializedEconomyAmount } from '../src/content/universes/types'
import {
  selectAutoKindlerPurchase,
  type AutoKindlerSettings,
} from '../src/systems/auto-kindler'

export interface AutoKindlerSimulationResult {
  readonly purchasedGeneratorIds: readonly string[]
  readonly finalLight: SerializedEconomyAmount
  readonly finalOwned: Readonly<Record<string, number>>
}

/** Bounded strategy study using the same chooser and cost curve as live automation. */
export function simulateAutoKindlerStrategy(
  initial: EcoState,
  settings: AutoKindlerSettings,
  maxPurchases: number,
): AutoKindlerSimulationResult {
  if (!Number.isSafeInteger(maxPurchases) || maxPurchases < 0 || maxPurchases > 10_000) {
    throw new RangeError('maxPurchases must be an integer from 0 to 10000')
  }
  const state: EcoState = {
    ...initial,
    owned: { ...initial.owned },
    upgrades: [...initial.upgrades],
    achievements: [...initial.achievements],
    constellation: [...initial.constellation],
    stardustWorks: { ...initial.stardustWorks },
    singUpgrades: [...initial.singUpgrades],
    deepWorks: { ...initial.deepWorks },
    challengesDone: [...initial.challengesDone],
    curiosities: [...initial.curiosities],
    beacons: [...initial.beacons],
    wayfinder: [...initial.wayfinder],
    vesselParts: [...initial.vesselParts],
    numericLawState: { ...initial.numericLawState },
  }
  const purchasedGeneratorIds: string[] = []
  for (let count = 0; count < maxPurchases; count++) {
    const purchase = selectAutoKindlerPurchase(state, settings)
    if (!purchase) break
    state.light = subtractAmounts(state.light, purchase.cost)
    state.owned[purchase.generator.id] = purchase.owned + 1
    purchasedGeneratorIds.push(purchase.generator.id)
  }
  return {
    purchasedGeneratorIds,
    finalLight: serializeAmount(state.light),
    finalOwned: { ...state.owned },
  }
}
