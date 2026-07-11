import type { UniverseId } from '../content/universes'

export const HUNGER_HOLD_MS = 6_500
export const COMPANION_IDLE_MS = 9_000
export const COMPANION_SETTLE_MS = 600

export function tendGardenPresence(
  tended: readonly UniverseId[],
  universeId: UniverseId,
): readonly UniverseId[] {
  return tended.includes(universeId) ? tended : [...tended, universeId]
}

export function allGardenPresencesTended(
  tended: readonly UniverseId[],
  required: readonly UniverseId[],
): boolean {
  const unique = new Set(tended)
  return required.length > 0 && required.every((universeId) => unique.has(universeId))
}

export function ritualProgress(elapsedMs: number, requiredMs: number): number {
  if (!Number.isFinite(elapsedMs) || !Number.isFinite(requiredMs) || requiredMs <= 0) return 0
  return Math.max(0, Math.min(1, elapsedMs / requiredMs))
}

export function hungerHoldComplete(startedAt: number | null, now: number): boolean {
  return startedAt !== null
    && Number.isFinite(startedAt)
    && Number.isFinite(now)
    && now >= startedAt + HUNGER_HOLD_MS
}

export function companionStillnessComplete(lastInputAt: number | null, now: number): boolean {
  return lastInputAt !== null
    && Number.isFinite(lastInputAt)
    && Number.isFinite(now)
    && now >= lastInputAt + COMPANION_IDLE_MS
}
