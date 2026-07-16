import type { GameState } from '../engine/game.svelte'
import type { LumenLine } from './lumen'
import {
  REALM_CHOICE_CALLBACKS,
  latestRealmAnswerId,
  type RealmChoiceCallback,
} from './endings'
import type { UniverseId } from './universes'

export interface SagaLumenLine extends LumenLine {
  readonly sourceUniverseId: UniverseId
  readonly targetUniverseId: UniverseId
  readonly sourceAnswerId: RealmChoiceCallback['sourceAnswerId']
}

/**
 * Each branch owns a stable line ID. The Archive can therefore reconstruct
 * what Lumen actually said even if a later Remembrance changes the source
 * realm's current answer.
 */
export const SAGA_LUMEN_LINES: readonly SagaLumenLine[] = REALM_CHOICE_CALLBACKS.map((callback) => ({
  id: `saga-${callback.id}`,
  text: callback.lumenLine,
  sourceUniverseId: callback.sourceUniverseId,
  targetUniverseId: callback.targetUniverseId,
  sourceAnswerId: callback.sourceAnswerId,
  when: (game: GameState) => (
    game.clicks >= 1
    && latestRealmAnswerId(game.realmAnswers, callback.sourceUniverseId) === callback.sourceAnswerId
  ),
}))

export function sagaLumenLinesFor(universeId: UniverseId): readonly SagaLumenLine[] {
  return SAGA_LUMEN_LINES.filter(({ targetUniverseId }) => targetUniverseId === universeId)
}
