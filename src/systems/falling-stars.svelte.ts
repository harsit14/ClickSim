export const fallingStarState = $state({
  pendingSummons: 0,
})

let lastSummonAt = 0

export function summonFallingStar() {
  const now = performance.now()
  if (now - lastSummonAt < 20_000) return false
  lastSummonAt = now
  fallingStarState.pendingSummons += 1
  return true
}
