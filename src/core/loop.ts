import { tick } from '../engine/game.svelte'

const STEP_MS = 100
const MAX_CATCHUP_MS = 5000

export function startLoop() {
  let last = performance.now()
  let acc = 0
  setInterval(() => {
    const now = performance.now()
    acc += now - last
    last = now
    if (acc > MAX_CATCHUP_MS) acc = MAX_CATCHUP_MS
    while (acc >= STEP_MS) {
      tick(STEP_MS / 1000)
      acc -= STEP_MS
    }
  }, STEP_MS)
}
