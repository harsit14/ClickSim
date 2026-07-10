import { EMBERLIGHT } from './emberlight'
import { TIDEFALL } from './tidefall'

export type { UniversePack, UniversePalette, UniverseTwist } from './types'

export const DEFAULT_UNIVERSE_ID = EMBERLIGHT.id
export const UNIVERSES = [EMBERLIGHT, TIDEFALL]
export const UNIVERSE_BY_ID = new Map(UNIVERSES.map((u) => [u.id, u]))

export function universeById(id: string | null | undefined = DEFAULT_UNIVERSE_ID) {
  return UNIVERSE_BY_ID.get(id ?? DEFAULT_UNIVERSE_ID) ?? EMBERLIGHT
}
