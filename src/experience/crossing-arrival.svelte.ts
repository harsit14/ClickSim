import type { UniverseId } from '../content/universes/types'
import { crossingHabitBreaks, crossingVocabularyStumble } from './crossing-arrival'

interface ActiveCrossingArrival {
  sourceId: UniverseId
  sourceName: string
  sourceVerb: string
  destinationId: UniverseId
  destinationName: string
  destinationVerb: string
  firstArrival: boolean
  enteredAtMs: number | null
  wrongClickPending: boolean
  stumblePending: boolean
  consumedHabitIds: string[]
}

export const crossingArrivalState = $state<{ active: ActiveCrossingArrival | null }>({ active: null })

export function beginCrossingArrival(input: Omit<ActiveCrossingArrival, 'enteredAtMs' | 'wrongClickPending' | 'stumblePending' | 'consumedHabitIds'>) {
  crossingArrivalState.active = {
    ...input,
    enteredAtMs: null,
    wrongClickPending: false,
    stumblePending: false,
    consumedHabitIds: [],
  }
}

export function completeCrossingArrival(destinationId: UniverseId, nowMs = Date.now()): boolean {
  if (!Number.isFinite(nowMs) || nowMs < 0) throw new RangeError('Crossing arrival time must be finite and nonnegative.')
  const active = crossingArrivalState.active
  if (!active || active.destinationId !== destinationId) return false
  active.enteredAtMs = nowMs
  active.wrongClickPending = active.firstArrival
  active.stumblePending = active.firstArrival
  active.consumedHabitIds = []
  return true
}

export function cancelCrossingArrival() {
  crossingArrivalState.active = null
}

export function consumeCrossingWrongClick(universeId: UniverseId): UniverseId | null {
  const active = crossingArrivalState.active
  if (!active || active.destinationId !== universeId || !active.wrongClickPending) return null
  active.wrongClickPending = false
  return active.sourceId
}

export function consumeCrossingLumenStumble(universeId: UniverseId): { id: string; text: string } | null {
  const active = crossingArrivalState.active
  if (!active || active.destinationId !== universeId || !active.stumblePending) return null
  active.stumblePending = false
  return {
    id: `crossing-stumble-${active.destinationId}`,
    text: crossingVocabularyStumble(active.sourceName, active.sourceVerb, active.destinationName, active.destinationVerb),
  }
}

export function consumeCrossingHabitBreak(universeId: UniverseId, nowMs = Date.now()): { id: string; text: string } | null {
  if (!Number.isFinite(nowMs) || nowMs < 0) throw new RangeError('Crossing habit-break time must be finite and nonnegative.')
  const active = crossingArrivalState.active
  if (!active || active.destinationId !== universeId || !active.firstArrival || active.enteredAtMs === null) return null
  const elapsed = nowMs - active.enteredAtMs
  const next = crossingHabitBreaks(universeId).find((moment) => moment.atMs <= elapsed && !active.consumedHabitIds.includes(moment.id))
  if (!next) return null
  active.consumedHabitIds.push(next.id)
  return { id: next.id, text: next.text }
}
