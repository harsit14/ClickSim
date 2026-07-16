import { lumenComplicityLinesFor } from './lumen-complicity'
import { sagaLumenLinesFor } from './saga-lumen'
import { universeById, type UniverseId } from './universes'

export interface ArchivedStoryLine {
  readonly id: string
  readonly text: string
}

/** One resolver shared by the live ticker's persisted IDs and the Archive. */
export function storyLinesForUniverse(universeId: UniverseId): readonly ArchivedStoryLine[] {
  return [
    ...universeById(universeId).lumen,
    ...sagaLumenLinesFor(universeId),
    ...lumenComplicityLinesFor(universeId),
  ]
}
