import {
  realmAnswerChoice,
  realmConclusion,
  type Ending,
  type RealmAnswerHistory,
  type RealmAnswerId,
} from '../content/endings'
import type { UniverseId } from '../content/universes'

interface RealmQuestionState {
  readonly activeAtlasRoute: unknown | null
  readonly ending: Ending | null
}

interface RevisedRealmConclusionState {
  readonly activeAtlasRoute: unknown | null
  readonly beacons: readonly string[]
  realmAnswers: RealmAnswerHistory
}

/** Atlas routes are disposable runs and may never alter the permanent answer ledger. */
export function realmQuestionStateAvailable(state: RealmQuestionState): boolean {
  return state.activeAtlasRoute === null && state.ending === null
}

/**
 * Records a revised narrative conclusion for a realm completed under the old
 * global-Question system. This deliberately does not touch the active ending
 * or any local economy state.
 */
export function recordRevisedRealmConclusionState(
  state: RevisedRealmConclusionState,
  universeId: UniverseId,
  answerId: RealmAnswerId,
): boolean {
  if (
    state.activeAtlasRoute !== null
    || !state.beacons.includes(universeId)
    || (state.realmAnswers[universeId]?.length ?? 0) > 0
  ) return false

  const answer = realmAnswerChoice(answerId)
  const conclusion = realmConclusion(universeId)
  if (!answer || !conclusion.choices.some((choice) => choice.id === answerId)) return false

  state.realmAnswers = {
    ...state.realmAnswers,
    [universeId]: [answerId],
  }
  return true
}
