export interface CriticalClickInput {
  readonly completedClicks: number
  readonly chance: number
  readonly randomnessAllowed: boolean
  readonly randomRoll?: number
}

export function criticalCadenceForChance(chance: number): number | null {
  if (!Number.isFinite(chance) || chance <= 0) return null
  return Math.max(1, Math.round(1 / Math.min(1, chance)))
}

/**
 * Random realms retain their ordinary roll. Deterministic realms translate the
 * displayed chance into an inspected cadence, so a listed 3% critical rate can
 * never silently become zero while still avoiding random economics.
 */
export function criticalClickOccurs(input: CriticalClickInput): boolean {
  if (!Number.isSafeInteger(input.completedClicks) || input.completedClicks < 0) return false
  const cadence = criticalCadenceForChance(input.chance)
  if (cadence === null) return false
  const chance = Math.min(1, input.chance)
  if (input.randomnessAllowed) {
    const roll = input.randomRoll
    return typeof roll === 'number' && Number.isFinite(roll) && roll >= 0 && roll < chance
  }
  return (input.completedClicks + 1) % cadence === 0
}
