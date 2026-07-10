import type { UniverseId } from '../content/universes/types'
import { tidefallTideState } from '../content/universes/tidefall/tide-state'
import { EMBERLIGHT_PRESENTATION } from './emberlight/presentation'
import type { UniversePresentation, WorldStatePresentation } from './presentation-contract'
import { TIDEFALL_PRESENTATION } from './tidefall/presentation'

export interface ResolvedPresentationWorldState {
  readonly key: string
  readonly label: string
  readonly descriptor: WorldStatePresentation
}

type WorldStateResolver = (nowMs: number) => { readonly key: string; readonly label: string }

export const PRESENTATION_BY_UNIVERSE_ID: ReadonlyMap<UniverseId, UniversePresentation> = new Map<UniverseId, UniversePresentation>([
  ['emberlight', EMBERLIGHT_PRESENTATION],
  ['tidefall', TIDEFALL_PRESENTATION],
])

const WORLD_STATE_RESOLVERS: Readonly<Partial<Record<UniverseId, WorldStateResolver>>> = {
  tidefall: (nowMs) => {
    const state = tidefallTideState(nowMs)
    return { key: state.id, label: state.text }
  },
}

/** Returns only an explicitly registered presentation; it never guesses a fallback. */
export function universePresentationById(id: string | null | undefined): UniversePresentation | null {
  if (!id) return null
  return PRESENTATION_BY_UNIVERSE_ID.get(id as UniverseId) ?? null
}

/** Resolves a world state through an explicit presentation registry, not renderer ID parsing. */
export function presentationWorldStateAt(
  universeId: string,
  nowMs: number,
): ResolvedPresentationWorldState | null {
  const presentation = universePresentationById(universeId)
  const resolver = WORLD_STATE_RESOLVERS[universeId as UniverseId]
  if (!presentation || !resolver) return null
  const resolved = resolver(nowMs)
  const descriptor = presentation.worldStates[resolved.key]
  return descriptor ? { ...resolved, descriptor } : null
}
