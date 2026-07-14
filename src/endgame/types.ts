import type { UniverseId } from '../content/universes/types'

export type ChronicleMilestone =
  | 'awakening'
  | 'epoch-turn'
  | 'deep-collapse'
  | 'answer'
  | 'beacon'
  | 'garden'
  | 'atlas-route'

export interface ChronicleEvent {
  readonly id: string
  readonly universeId: UniverseId
  readonly milestone: ChronicleMilestone
  readonly at: number
  readonly detail: string
}

export type AutomationProfile = 'manual' | 'balanced' | 'idle'

export interface LawLoadout {
  readonly id: string
  readonly name: string
  readonly universeId: UniverseId
  readonly doctrineId: string
  readonly wayfinderLawIds: readonly string[]
  readonly archiveShelfId: string
  readonly vestmentId: string
  readonly anomalyResponseIds: readonly string[]
  readonly automation: AutomationProfile
}

export interface ChronicleBest {
  readonly routeCode: string
  readonly durationMs: number
  readonly completedAt: number
}

export type GardenEnding = 'warden' | 'hunger' | 'companion' | 'continue'

export interface AtlasCompletion {
  readonly routeCode: string
  readonly universeId: UniverseId
  readonly seed: number
  readonly durationMs: number
  readonly completedAt: number
  readonly replayDigest: string
}

export interface ActiveAtlasRoute {
  readonly routeCode: string
  readonly universeId: UniverseId
  readonly seed: number
  readonly startedAt: number
}

export interface EndgameState {
  chronicleEvents: ChronicleEvent[]
  beaconNames: Record<string, string>
  lawLoadouts: LawLoadout[]
  activeLawLoadoutId: string | null
  chronicleBests: ChronicleBest[]
  atlasCompletions: AtlasCompletion[]
  activeAtlasRoute: ActiveAtlasRoute | null
  unlockedConvergences: string[]
  gardenEnding: GardenEnding | null
  gardenSceneSeen: boolean
  /** Permanent predecessor-to-successor production investments. */
  successionRelays: Record<string, number>
  /** Very rare shared currency earned across completed universes. */
  lumenShards: number
  /** One-time Beacon and Atlas sources already credited. */
  lumenShardClaims: string[]
  /** Persistent lore, vestment, and utility purchases. */
  lumenPurchases: string[]
  /** Expensive local Deep-currency conversions, capped per universe. */
  lumenDistillations: Record<string, number>
  /** Permanent, presentation-only objects found at authored world milestones. */
  mementos: string[]
}

export function emptyEndgameState(): EndgameState {
  return {
    chronicleEvents: [],
    beaconNames: {},
    lawLoadouts: [],
    activeLawLoadoutId: null,
    chronicleBests: [],
    atlasCompletions: [],
    activeAtlasRoute: null,
    unlockedConvergences: [],
    gardenEnding: null,
    gardenSceneSeen: false,
    successionRelays: {},
    lumenShards: 0,
    lumenShardClaims: [],
    lumenPurchases: [],
    lumenDistillations: {},
    mementos: [],
  }
}
