// This registry is intentionally imperative. Making it reactive causes an effect
// that acquires a pause token to subscribe to its own mutations and rerun forever.
const pauseState = {
  nextId: 1,
  reasons: [] as Array<{ id: number; reason: string }>,
  startedAt: 0,
  elapsed: 0,
}

/** True while a story scene owns the screen and gameplay must not advance. */
export function gamePaused(): boolean {
  return pauseState.reasons.length > 0
}

/**
 * Acquires a gameplay pause and returns an idempotent release function.
 * Tokens make nested scenes safe: gameplay resumes only after every owner exits.
 */
export function acquireGamePause(reason: string): () => void {
  const id = pauseState.nextId++
  if (pauseState.reasons.length === 0) pauseState.startedAt = performance.now()
  pauseState.reasons.push({ id, reason })
  let released = false
  return () => {
    if (released) return
    released = true
    const index = pauseState.reasons.findIndex((entry) => entry.id === id)
    if (index >= 0) pauseState.reasons.splice(index, 1)
    if (pauseState.reasons.length === 0 && pauseState.startedAt > 0) {
      pauseState.elapsed += performance.now() - pauseState.startedAt
      pauseState.startedAt = 0
    }
  }
}

/** A monotonic gameplay clock that does not advance while the game is paused. */
export function gameTime(realNow = performance.now()): number {
  const activePause = pauseState.startedAt > 0 ? realNow - pauseState.startedAt : 0
  return realNow - pauseState.elapsed - activePause
}
