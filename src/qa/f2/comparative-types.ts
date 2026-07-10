import type { UniverseId } from '../../content/universes/types'

export const F2_COMPARATIVE_CONTRACT = 'f2-comparative-qa-v1' as const

export type F2Owner =
  | 'agent-01-emberlight'
  | 'agent-02-tidefall'
  | 'team-q1'

export type F2Dimension =
  | 'heart'
  | 'world-silhouette'
  | 'interactive-objects'
  | 'materials'
  | 'motion'
  | 'click-response'
  | 'omen-behavior'
  | 'archive'
  | 'local-prestige'
  | 'audio-families'
  | 'state-signals'

export type F2Condition =
  | 'blind-visual'
  | 'audio-only'
  | 'muted'
  | 'high-contrast'
  | 'reduced-motion'
  | 'low-quality'

export type ObservationSurface = 'world' | 'shop' | 'archive' | 'guide'

export type ObservedEntityKind =
  | 'heart'
  | 'currency'
  | 'generator'
  | 'omen'
  | 'archive'
  | 'archive-record'
  | 'local-prestige'

export interface SurfaceObservation {
  readonly universeId: UniverseId
  readonly surface: ObservationSurface
  readonly entityKind: ObservedEntityKind
  readonly entityId: string
  readonly displayedName: string
  /** Caller-supplied canonical token, such as `hue:42`, `gold-plasma`, or `tide-cyan`. */
  readonly colorToken: string
  readonly artifactId: string
  readonly sourcePath: string
}

export type IdentificationSubject =
  | 'world'
  | 'heart'
  | 'interactive-object'
  | 'state'
  | 'omen'
  | 'prestige'

export interface IdentificationTrial {
  readonly condition: F2Condition
  readonly expectedUniverseId: UniverseId
  readonly identifiedUniverseId: UniverseId | 'unclear'
  readonly subject: IdentificationSubject
  readonly testerId: string
  readonly artifactId: string
  readonly cuesReported: readonly string[]
}

export interface ComparativeHarnessInput {
  readonly surfaceObservations: readonly SurfaceObservation[]
  readonly identificationTrials: readonly IdentificationTrial[]
}

export interface FeatureFingerprint {
  /** Hash and features intentionally omit pack IDs, authored names, and UI labels. */
  readonly signature: string
  readonly features: readonly string[]
}

export interface DimensionAudit {
  readonly dimension: F2Dimension
  readonly left: FeatureFingerprint
  readonly right: FeatureFingerprint
  readonly similarity: number
  readonly maximumAllowedSimilarity: number
  readonly distinguishable: boolean
}

export interface ConditionAudit {
  readonly condition: F2Condition
  readonly predictedSimilarity: number
  readonly maximumAllowedSimilarity: number
  readonly structurallyDistinct: boolean
  readonly completedTrials: number
  readonly correctTrials: number
  readonly accuracy: number | null
  readonly passed: boolean
}

export interface ConsistencyAudit {
  readonly universeId: UniverseId
  readonly surfacesCovered: readonly ObservationSurface[]
  readonly observationCount: number
  readonly passed: boolean
}

export interface DefectEvidence {
  readonly artifactIds: readonly string[]
  readonly leftSignature?: string
  readonly rightSignature?: string
  readonly similarity?: number
  readonly expected?: string
  readonly actual?: string
  readonly cues?: readonly string[]
}

export interface ComparativeDefect {
  readonly id: string
  readonly severity: 'gate' | 'major' | 'coverage'
  readonly owner: F2Owner
  readonly universeId: UniverseId | null
  readonly dimension: F2Dimension | F2Condition | 'consistency' | 'input-coverage'
  readonly path: string
  readonly summary: string
  readonly reproduction: readonly string[]
  readonly evidence: DefectEvidence
}

export interface UniverseFingerprints {
  readonly dimensions: Readonly<Record<F2Dimension, FeatureFingerprint>>
  readonly conditions: Readonly<Record<F2Condition, FeatureFingerprint>>
}

export interface ComparativeAuditReport {
  readonly contractVersion: typeof F2_COMPARATIVE_CONTRACT
  readonly packIds: readonly [UniverseId, UniverseId]
  readonly dimensionAudits: readonly DimensionAudit[]
  readonly conditionAudits: readonly ConditionAudit[]
  readonly consistencyAudits: readonly ConsistencyAudit[]
  readonly defects: readonly ComparativeDefect[]
  readonly gatePassed: boolean
}
