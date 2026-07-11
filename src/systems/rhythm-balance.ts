export const BASE_RHYTHM_WINDOW_MS = 90
export const RHYTHM_COMPETENT_MULTIPLIER = 1.4
export const RHYTHM_EXCEPTIONAL_MULTIPLIER = 1.5

export const RHYTHM_MULTIPLIER_STEPS = [
  { streak: 4, multiplier: 1.1 },
  { streak: 8, multiplier: 1.2 },
  { streak: 16, multiplier: 1.3 },
  { streak: 32, multiplier: RHYTHM_COMPETENT_MULTIPLIER },
  { streak: 64, multiplier: RHYTHM_EXCEPTIONAL_MULTIPLIER },
] as const

export interface RhythmAttractionCheckpoint {
  readonly rewardAt: number
  readonly charge: number
}

export function rhythmMultiplierForStreak(streak: number): number {
  if (!Number.isFinite(streak) || streak < 0) return 1
  return [...RHYTHM_MULTIPLIER_STEPS]
    .reverse()
    .find((step) => streak >= step.streak)?.multiplier ?? 1
}

/**
 * Long streak milestones fill one Omen-attraction cycle by the exceptional
 * threshold. Continuing performers contribute another bounded pulse every
 * thirty-two beats without increasing click output past the cap.
 */
export function rhythmAttractionCheckpoint(streak: number): RhythmAttractionCheckpoint | null {
  if (!Number.isSafeInteger(streak) || streak < 8) return null
  if (streak === 8) return { rewardAt: 8, charge: 10 }
  if (streak === 16) return { rewardAt: 16, charge: 20 }
  if (streak === 32) return { rewardAt: 32, charge: 30 }
  if (streak === 64) return { rewardAt: 64, charge: 40 }
  if (streak > 64 && streak % 32 === 0) return { rewardAt: streak, charge: 40 }
  return null
}
