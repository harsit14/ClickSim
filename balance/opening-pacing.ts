import { UI_UNLOCKS, type UiUnlock } from '../src/content/ui-unlocks'

export const KEYBOARD_HINT_APPEARS_AT_CLICKS = 5

export interface OpeningUnlockMilestone {
  readonly id: string
  readonly heartActivations: number
  readonly activationsSincePreviousUnlock: number
  readonly remainingLight: number
}

export interface OpeningPacingStudy {
  readonly contract: 'opening-agency-v1'
  readonly milestones: readonly OpeningUnlockMilestone[]
  readonly keyboardHintLeadActivations: number
  readonly longestUnlockGap: number
  readonly structuralIssues: readonly string[]
  readonly costDecision: 'hold-for-observed-fatigue' | 'reduce'
}

/** Exact fresh-save path at one Light per Heart activation and immediate UI buys. */
export function simulateOpeningUnlocks(
  unlocks: readonly UiUnlock[] = UI_UNLOCKS.slice(0, 3),
): readonly OpeningUnlockMilestone[] {
  if (unlocks.length === 0) throw new RangeError('Opening study requires at least one UI unlock')
  let light = 0
  let totalEarned = 0
  let activations = 0
  let previousActivations = 0
  const milestones: OpeningUnlockMilestone[] = []
  for (const unlock of unlocks) {
    if (!Number.isSafeInteger(unlock.cost) || unlock.cost <= 0 || !Number.isSafeInteger(unlock.appearAt) || unlock.appearAt < 0) {
      throw new RangeError(`Invalid opening unlock ${unlock.id}`)
    }
    while (totalEarned < unlock.appearAt || light < unlock.cost) {
      activations += 1
      totalEarned += 1
      light += 1
    }
    light -= unlock.cost
    milestones.push({
      id: unlock.id,
      heartActivations: activations,
      activationsSincePreviousUnlock: activations - previousActivations,
      remainingLight: light,
    })
    previousActivations = activations
  }
  return milestones
}

export function buildOpeningPacingStudy(
  unlocks: readonly UiUnlock[] = UI_UNLOCKS.slice(0, 3),
): OpeningPacingStudy {
  const milestones = simulateOpeningUnlocks(unlocks)
  const counter = milestones.find(({ id }) => id === 'counter')
  const shop = milestones.find(({ id }) => id === 'shop')
  const upgrades = milestones.find(({ id }) => id === 'upgrades')
  if (!counter || !shop || !upgrades) throw new RangeError('Opening study requires counter, shop, and upgrades')
  const longestUnlockGap = Math.max(...milestones.map(({ activationsSincePreviousUnlock }) => activationsSincePreviousUnlock))
  const structuralIssues: string[] = []
  if (KEYBOARD_HINT_APPEARS_AT_CLICKS >= counter.heartActivations) structuralIssues.push('keyboard discovery arrives after the first unlock')
  if (shop.heartActivations > 40) structuralIssues.push('the first spending decision requires more than forty activations')
  if (upgrades.heartActivations > 120) structuralIssues.push('the first growth controls require more than 120 activations')
  if (longestUnlockGap > 75) structuralIssues.push('one opening unlock gap exceeds seventy-five activations')
  return {
    contract: 'opening-agency-v1',
    milestones,
    keyboardHintLeadActivations: counter.heartActivations - KEYBOARD_HINT_APPEARS_AT_CLICKS,
    longestUnlockGap,
    structuralIssues,
    // Structural pacing passing cannot disprove physical fatigue. Costs move
    // only after the observed-session thresholds in the QA protocol are met.
    costDecision: structuralIssues.length > 0 ? 'reduce' : 'hold-for-observed-fatigue',
  }
}
