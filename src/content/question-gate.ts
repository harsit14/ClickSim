import type { GameState } from '../engine/game.svelte'

/** The final story question belongs to the active realm's deepest Kindling. */
export function questionHookReady(
  game: GameState,
  generatorId: string,
  count = 1,
): boolean {
  return game.collapses >= 1 && (game.owned[generatorId] ?? 0) >= count
}
