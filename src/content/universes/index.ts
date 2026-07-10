import { EMBERLIGHT } from './emberlight'
import { EMBERLIGHT_V2 } from './emberlight-v2'
import { TIDEFALL } from './tidefall'
import type { UniverseId, UniversePackV2 } from './types'

export type {
  UniversePack,
  UniversePackV2,
  UniverseId,
  UniversePalette,
  UniverseTwist,
  UniversePowerUp,
  UniverseEventIdentity,
  UniverseAudioIdentity,
  WorldObjectManifest,
  UniverseLawHooks,
  SemanticFeedbackEvent,
  UniverseAudioDef,
  AudioCueDef,
  AudioBusDef,
  UniverseAccessibilityDef,
} from './types'

export const DEFAULT_UNIVERSE_ID = EMBERLIGHT.id
export const UNIVERSES = [EMBERLIGHT, TIDEFALL]
export const UNIVERSE_BY_ID = new Map(UNIVERSES.map((u) => [u.id, u]))

/** Temporary F1 registry: only packs that pass the full V2 bridge belong here. */
export const V2_UNIVERSE_BY_ID: ReadonlyMap<UniverseId, UniversePackV2> = new Map([
  ['emberlight', EMBERLIGHT_V2],
])

export function universeById(id: string | null | undefined = DEFAULT_UNIVERSE_ID) {
  return UNIVERSE_BY_ID.get(id ?? DEFAULT_UNIVERSE_ID) ?? EMBERLIGHT
}

/** Returns null for intentionally unported worlds; it never invents a V2 fallback. */
export function universeV2ById(id: string | null | undefined): UniversePackV2 | null {
  if (!id) return null
  return V2_UNIVERSE_BY_ID.get(id as UniverseId) ?? null
}
