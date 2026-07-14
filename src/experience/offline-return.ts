import { universeById } from '../content/universes'
import type { EconomyAmount } from '../content/universes/types'
import {
  addAmounts,
  amountToBoundedNumber,
  compareAmounts,
  divideAmounts,
  gtAmount,
  gteAmount,
  isZeroAmount,
  multiplyAmountByNumber,
  subtractAmounts,
  toAmount,
} from '../core/numeric/amount'
import {
  availableUpgrades,
  costMultOf,
  costOf,
  costScaleOf,
  genDisabled,
  type EcoState,
} from '../engine/compute'

export interface OfflineMilestoneCandidate {
  readonly id: string
  readonly name: string
  readonly kind: 'Kindling' | 'upgrade'
  readonly cost: EconomyAmount
}

export interface OfflineNearMiss {
  readonly candidate: OfflineMilestoneCandidate
  readonly status: 'reached' | 'approaching'
  readonly additionalSeconds: number
}

/** Player-meaningful purchases only: first ownership and newly available upgrades. */
export function offlineMilestoneCandidates(state: EcoState): readonly OfflineMilestoneCandidate[] {
  const pack = universeById(state.activeUniverse)
  const scale = costScaleOf(state)
  const unlocks = pack.generators
    .filter((generator) => (state.owned[generator.id] ?? 0) === 0 && !genDisabled(state, generator))
    .map((generator) => ({
      id: generator.id,
      name: generator.name,
      kind: 'Kindling' as const,
      cost: costOf(generator, 0, costMultOf(state, generator), scale),
    }))
  const upgrades = availableUpgrades(state).map((upgrade) => ({
    id: upgrade.id,
    name: upgrade.name,
    kind: 'upgrade' as const,
    cost: toAmount(upgrade.cost),
  }))
  if (unlocks.length > 0 || upgrades.length > 0) return [...unlocks, ...upgrades]

  // A complete shop still gets a useful next-purchase horizon.
  return pack.generators
    .filter((generator) => !genDisabled(state, generator))
    .map((generator) => ({
      id: generator.id,
      name: `another ${generator.name}`,
      kind: 'Kindling' as const,
      cost: costOf(
        generator,
        state.owned[generator.id] ?? 0,
        costMultOf(state, generator),
        scale,
      ),
    }))
}

export function selectOfflineNearMiss(
  currentBalance: EconomyAmount,
  pendingGain: EconomyAmount,
  passiveRate: EconomyAmount,
  efficiency: number,
  candidates: readonly OfflineMilestoneCandidate[],
): OfflineNearMiss | null {
  if (!Number.isFinite(efficiency) || efficiency < 0) return null
  const returnBalance = addAmounts(currentBalance, pendingGain)
  const newlyReached = candidates
    .filter(({ cost }) => !gteAmount(currentBalance, cost) && gteAmount(returnBalance, cost))
    .sort((left, right) => compareAmounts(right.cost, left.cost))[0]
  if (newlyReached) return { candidate: newlyReached, status: 'reached', additionalSeconds: 0 }

  const productiveRate = multiplyAmountByNumber(passiveRate, efficiency)
  if (!isZeroAmount(productiveRate)) {
    const approaching = candidates
      .filter(({ cost }) => gtAmount(cost, returnBalance))
      .map((candidate) => ({
        candidate,
        seconds: amountToBoundedNumber(divideAmounts(
          subtractAmounts(candidate.cost, returnBalance),
          productiveRate,
        )),
      }))
      .filter(({ seconds }) => Number.isFinite(seconds) && seconds > 0)
      .sort((left, right) => left.seconds - right.seconds)[0]
    if (approaching) {
      return {
        candidate: approaching.candidate,
        status: 'approaching',
        additionalSeconds: approaching.seconds,
      }
    }
  }

  const alreadyReachable = candidates
    .filter(({ cost }) => gteAmount(returnBalance, cost))
    .sort((left, right) => compareAmounts(right.cost, left.cost))[0]
  return alreadyReachable
    ? { candidate: alreadyReachable, status: 'reached', additionalSeconds: 0 }
    : null
}
