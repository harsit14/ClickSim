import type { World } from './world'

/** Lets non-canvas UI (the supernova cutscene) drive world effects. */
let ref: World | null = null

export function setWorldRef(w: World | null) {
  ref = w
}

export function worldRef(): World | null {
  return ref
}
