import { advanceOmenAttraction } from './omen-attraction'

export const fallingStarState = $state({
  pendingSummons: 0,
  omenAttraction: 0,
})

let lastSummonAt = 0

export function summonFallingStar() {
  const now = performance.now()
  if (now - lastSummonAt < 20_000) return false
  lastSummonAt = now
  fallingStarState.pendingSummons += 1
  return true
}

export function chargeOmenAttraction(amount: number): boolean {
  const next = advanceOmenAttraction(fallingStarState.omenAttraction, amount)
  fallingStarState.omenAttraction = next.charge
  if (!next.ready || !summonFallingStar()) return false
  fallingStarState.omenAttraction = next.overflow
  return true
}

export function resetOmenAttraction() {
  fallingStarState.omenAttraction = 0
}

export function resetFallingStars() {
  fallingStarState.pendingSummons = 0
  fallingStarState.omenAttraction = 0
  lastSummonAt = 0
}
