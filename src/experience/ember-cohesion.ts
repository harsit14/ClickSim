import { shownAt } from '../content/generators'
import { perkBonus } from '../content/constellation'
import { universeById } from '../content/universes'
import type { EconomyAmount } from '../content/universes/types'
import type { GameState } from '../engine/game.svelte'
import {
  costMultOf,
  costOf,
  costScaleOf,
  availableUpgrades,
  bulkCost,
  totalRate,
  unitRate,
} from '../engine/compute'
import { format } from '../core/format'
import {
  ZERO_AMOUNT,
  addAmounts,
  amountLog10,
  amountFromNumber,
  amountToBoundedNumber,
  divideAmounts,
  gtAmount,
  gteAmount,
  isZeroAmount,
  subtractAmounts,
  multiplyAmountByNumber,
  toAmount,
} from '../core/numeric/amount'
import type { GoalCandidate } from './goals'
import type { RecoveryEstimateInputs } from './reset-comparison'

export function secondsToAmountTarget(
  balance: EconomyAmount,
  target: EconomyAmount,
  ratePerSecond: EconomyAmount,
): number | null {
  if (gteAmount(balance, target)) return 0
  if (isZeroAmount(ratePerSecond)) return null
  const seconds = amountToBoundedNumber(divideAmounts(subtractAmounts(target, balance), ratePerSecond))
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null
}

export function buildEmberGoalCandidates(
  state: GameState,
  novaReady: boolean,
  evaluatedAtMs: number,
): readonly GoalCandidate[] {
  const pack = universeById(state.activeUniverse)
  const rate = totalRate(state, evaluatedAtMs)
  const shown = pack.generators.filter((generator) => (
    gteAmount(state.totalEarned, amountFromNumber(shownAt(generator)))
  ))
  const candidates: GoalCandidate[] = shown.map((generator, index) => {
    const cost = costOf(
      generator,
      state.owned[generator.id] ?? 0,
      costMultOf(state, generator),
      costScaleOf(state),
    )
    const seconds = secondsToAmountTarget(state.light, cost, rate)
    return {
      id: `kindling-${generator.id}`,
      labelKey: `goal.kindling.${generator.name}`,
      eligibleSlots: ['now'],
      state: 'available',
      meaningful: true,
      priority: 200 - index,
      estimate: {
        estimatedSeconds: seconds,
        basis: seconds === null ? 'unavailable' : 'simulation',
        detailKey: seconds === 0 ? 'goal-lens.detail.ready' : 'goal-lens.detail.current-rate',
      },
      reasonKey: seconds === 0
        ? 'goal-lens.reason.affordable-kindling'
        : 'goal-lens.reason.reachable-kindling',
      reasonParameters: { rate: format(unitRate(state, generator)) },
    }
  })

  const nextUnseen = pack.generators.find((generator) => (
    !gteAmount(state.totalEarned, amountFromNumber(shownAt(generator)))
  ))
  if (nextUnseen) {
    const discoveryTarget = amountFromNumber(shownAt(nextUnseen))
    const seconds = secondsToAmountTarget(state.totalEarned, discoveryTarget, rate)
    candidates.push({
      id: `discovery-${nextUnseen.id}`,
      labelKey: `goal.discovery.${nextUnseen.name}`,
      eligibleSlots: ['soon'],
      state: 'available',
      meaningful: true,
      priority: 100,
      estimate: {
        estimatedSeconds: seconds,
        basis: seconds === null ? 'unavailable' : 'simulation',
        detailKey: 'goal-lens.detail.discovery-rate',
      },
      reasonKey: 'goal-lens.reason.discovery',
    })
  }

  if (novaReady) {
    candidates.push({
      id: 'epoch-turn-supernova',
      labelKey: 'goal-lens.supernova',
      eligibleSlots: ['now', 'soon'],
      state: 'available',
      meaningful: true,
      priority: 500,
      estimate: { estimatedSeconds: 0, basis: 'declared', detailKey: 'goal-lens.detail.ready' },
      reasonKey: 'goal-lens.reason.supernova',
    })
  }
  return candidates
}

/**
 * Builds a transparent static-rate recovery projection without mutating the run.
 * It preserves every permanent multiplier and applies the exact post-Supernova head start.
 */
export function previewSupernovaRecovery(
  state: GameState,
  stardustGain: EconomyAmount,
  evaluatedAtMs: number,
): RecoveryEstimateInputs {
  const pack = universeById(state.activeUniverse)
  const currentRate = totalRate(state, evaluatedAtMs)
  const first = pack.generators[0]
  const headStart = perkBonus(state.constellation, 'headStart')
    + (state.singUpgrades.includes('dawn-memory') ? 40 : 0)
  const owned: Record<string, number> = {}
  if (headStart > 0 && first) owned[first.id] = headStart
  if (state.singUpgrades.includes('dawn-memory')) owned.wisp = 5
  const postState: GameState = {
    ...state,
    light: ZERO_AMOUNT,
    totalEarned: ZERO_AMOUNT,
    owned,
    upgrades: [],
    buyAmount: 1,
    stardustTotal: addAmounts(state.stardustTotal, stardustGain),
  }
  const startingRate = totalRate(postState, evaluatedAtMs)
  const stepMs = 5_000
  const maximumMs = 4 * 60 * 60_000
  let elapsedMs = 0
  let projectedRate = startingRate

  while (!gteAmount(projectedRate, currentRate) && elapsedMs < maximumMs) {
    const stepRate = totalRate(postState, evaluatedAtMs + elapsedMs)
    const earned = multiplyAmountByNumber(stepRate, stepMs / 1_000)
    postState.light = addAmounts(postState.light, earned)
    postState.totalEarned = addAmounts(postState.totalEarned, earned)

    for (let guard = 0; guard < 24; guard += 1) {
      let bestScore = Number.POSITIVE_INFINITY
      let commit: (() => void) | null = null
      const before = totalRate(postState, evaluatedAtMs + elapsedMs)

      for (const generator of pack.generators) {
        const ownedCount = postState.owned[generator.id] ?? 0
        const mult = costMultOf(postState, generator)
        const scale = costScaleOf(postState)
        const quantity = [100, 10, 1].find((count) => gteAmount(
          postState.light,
          bulkCost(generator, ownedCount, count, mult, scale),
        ))
        if (!quantity) continue
        const cost = bulkCost(generator, ownedCount, quantity, mult, scale)
        const after = totalRate({
          ...postState,
          owned: { ...postState.owned, [generator.id]: ownedCount + quantity },
        }, evaluatedAtMs + elapsedMs)
        if (!gtAmount(after, before)) continue
        const score = amountLog10(cost) - amountLog10(subtractAmounts(after, before))
        if (score >= bestScore) continue
        bestScore = score
        commit = () => {
          postState.light = subtractAmounts(postState.light, cost)
          postState.owned[generator.id] = ownedCount + quantity
        }
      }

      for (const upgrade of availableUpgrades(postState)) {
        const cost = toAmount(upgrade.cost)
        if (!gteAmount(postState.light, cost)) continue
        const after = totalRate({
          ...postState,
          upgrades: [...postState.upgrades, upgrade.id],
        }, evaluatedAtMs + elapsedMs)
        if (!gtAmount(after, before)) continue
        const score = amountLog10(cost) - amountLog10(subtractAmounts(after, before))
        if (score >= bestScore) continue
        bestScore = score
        commit = () => {
          postState.light = subtractAmounts(postState.light, cost)
          postState.upgrades.push(upgrade.id)
        }
      }

      if (!commit) break
      commit()
    }
    elapsedMs += stepMs
    projectedRate = totalRate(postState, evaluatedAtMs + elapsedMs)
  }

  const recovered = gteAmount(projectedRate, currentRate)
  return {
    currentFrontierRate: `${format(currentRate)}/s`,
    postBoundaryStartingRate: `${format(startingRate)}/s`,
    projectedRecoveredRate: `${format(projectedRate)}/s`,
    estimatedRecoveryMs: recovered ? elapsedMs : null,
    basis: recovered ? 'simulation' : 'unavailable',
    detailKey: 'reset.recovery.epoch-projection',
  }
}
