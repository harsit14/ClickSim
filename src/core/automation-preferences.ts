export type AutoKindlerFamily = 0 | 1 | 2 | 3 | 4 | 5
export type AutoKindlerPriority = 'efficiency' | 'cheapest' | 'least-owned' | 'highest-tier'

export const AUTO_KINDLER_FAMILIES: readonly AutoKindlerFamily[] = [0, 1, 2, 3, 4, 5]
export const AUTO_KINDLER_PRIORITIES: readonly AutoKindlerPriority[] = [
  'efficiency',
  'cheapest',
  'least-owned',
  'highest-tier',
]

export function autoKindlerFamilyForTier(tier: number): AutoKindlerFamily {
  return Math.max(0, Math.min(5, Math.floor((tier - 1) / 3))) as AutoKindlerFamily
}
