import { EMBERLIGHT } from './emberlight'
import { EMBERLIGHT_V2 } from './emberlight-v2'
import { TIDEFALL } from './tidefall'
import { TIDEFALL_V2_PACK } from './tidefall-v2'
import { VERDANCE, VERDANCE_V2_PACK } from './verdance'
import { CLOCKWORK, CLOCKWORK_V2_PACK } from './clockwork'
import { PRISMATA, PRISMATA_V2_PACK } from './prismata'
import { TEMPEST, TEMPEST_V2_PACK } from './tempest'
import { CANTICLE, CANTICLE_V2_PACK } from './canticle'
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
export const UNIVERSES = [EMBERLIGHT, TIDEFALL, VERDANCE, CLOCKWORK, PRISMATA, TEMPEST, CANTICLE]
export const UNIVERSE_BY_ID = new Map(UNIVERSES.map((u) => [u.id, u]))

/** Approved V2 registry. Entries are lead-owned and never fall back across worlds. */
export const V2_UNIVERSE_BY_ID: ReadonlyMap<UniverseId, UniversePackV2> = new Map([
  ['emberlight', EMBERLIGHT_V2],
  ['tidefall', TIDEFALL_V2_PACK],
  ['verdance', VERDANCE_V2_PACK],
  ['clockwork', CLOCKWORK_V2_PACK],
  ['prismata', PRISMATA_V2_PACK],
  ['tempest', TEMPEST_V2_PACK],
  ['canticle', CANTICLE_V2_PACK],
])

export function universeById(id: string | null | undefined = DEFAULT_UNIVERSE_ID) {
  return UNIVERSE_BY_ID.get(id ?? DEFAULT_UNIVERSE_ID) ?? EMBERLIGHT
}

/** Returns null for intentionally unported worlds; it never invents a V2 fallback. */
export function universeV2ById(id: string | null | undefined): UniversePackV2 | null {
  if (!id) return null
  return V2_UNIVERSE_BY_ID.get(id as UniverseId) ?? null
}
