/** Shared numeric guardrails for the seven authored universe economies. */

/**
 * Four percent of Emberlight's established cost/base-rate ratio at each tier.
 * Authored costs may be slower than this floor, but never more efficient.
 */
export const KINDLING_MIN_COST_PER_RATE_SECONDS = [
  2,
  2.5714285714285716,
  3.6666666666666665,
  5.2,
  7.529411764705882,
  11.428571428571429,
  17,
  26,
  38.13953488372093,
  58.333333333333336,
  104.91803278688525,
  207.6923076923077,
  409.09090909090907,
  864.8648648648649,
  1_935.483870967742,
  4_444.444444444444,
  10_434.782608695652,
  26_000,
] as const

export function balancedKindlingBaseCost(authoredCost: number, baseRate: number, tier: number, floorMultiplier = 1): number {
  const floorRatio = KINDLING_MIN_COST_PER_RATE_SECONDS[tier - 1]
  if (floorRatio === undefined || !Number.isFinite(authoredCost) || authoredCost <= 0 || !Number.isFinite(baseRate) || baseRate <= 0 || !Number.isFinite(floorMultiplier) || floorMultiplier < 1) {
    throw new RangeError(`Invalid tier-${tier} Kindling economy`)
  }
  return Math.max(authoredCost, Math.ceil(baseRate * floorRatio * floorMultiplier))
}

export const UNIVERSE_KINDLING_FLOOR_MULTIPLIERS: Readonly<Record<string, number>> = {
  brahmalok: 10,
  vishnulok: 1.9,
}

export function universeKindlingFloorMultiplier(universeId: string): number {
  return UNIVERSE_KINDLING_FLOOR_MULTIPLIERS[universeId] ?? 1
}

/** Shared Cabinet discovery cadence: early, middle, and late first-era shelves. */
export const CABINET_COSTS = [
  1e6, 5e6, 25e6, 1e8,
  5e8, 2e9, 1e10, 1e11,
  1e12, 1e13, 1e14, 1e15,
] as const

export const ACHIEVEMENT_POWER_TIERS = [
  { through: 20, bonusPerPoint: 0.01 },
  { through: 50, bonusPerPoint: 0.005 },
  { through: Number.POSITIVE_INFINITY, bonusPerPoint: 0.0025 },
] as const

function normalizedAchievementCount(count: number): number {
  return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0
}

/** Additive production bonus, before the base x1 is included. */
export function achievementPowerBonus(count: number): number {
  let remaining = normalizedAchievementCount(count)
  let previousCap = 0
  let bonus = 0
  for (const tier of ACHIEVEMENT_POWER_TIERS) {
    const capacity = tier.through - previousCap
    const points = Math.min(remaining, capacity)
    bonus += points * tier.bonusPerPoint
    remaining -= points
    if (remaining <= 0) break
    previousCap = tier.through
  }
  return bonus
}

export function achievementProductionMult(count: number): number {
  return 1 + achievementPowerBonus(count)
}

/** Marginal bonus granted by the achievement at this one-based ordinal. */
export function achievementPointBonus(ordinal: number): number {
  const point = normalizedAchievementCount(ordinal)
  if (point <= 0) return 0
  return achievementPowerBonus(point) - achievementPowerBonus(point - 1)
}

export function achievementPowerPercent(count: number): number {
  return Math.round(achievementPowerBonus(count) * 10_000) / 100
}

export function achievementPointPercent(ordinal: number): number {
  return Math.round(achievementPointBonus(ordinal) * 10_000) / 100
}

export const STARDUST_PIVOT = 1.8e18
export const STARDUST_PRODUCTION_BONUS_PER_POINT = 0.03
export const LIFETIME_SINGULARITY_STARDUST_BONUS = 2
export const LIFETIME_SINGULARITY_PRODUCTION_BONUS = 1
export const EVENT_HORIZON_STARDUST_MULTIPLIER = 1.75
export const DAWN_MEMORY_FIRST_KINDLINGS = 30
export const DAWN_MEMORY_SECOND_KINDLINGS = 3
