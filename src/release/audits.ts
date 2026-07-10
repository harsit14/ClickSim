import { V2_UNIVERSE_BY_ID, type UniverseId } from '../content/universes'
import type { AudioHistoryEntry } from '../audio/semantic-contract'
import {
  GLOBAL_CONCURRENCY_LIMIT,
  MASTER_PEAK_CEILING_DB,
  planAudioCue,
} from '../audio/semantic-contract'
import type { UniverseAudioDef } from '../content/universes/types'

export interface ReleaseAuditIssue {
  readonly scope: string
  readonly message: string
}

export interface AudioFatigueSummary {
  readonly universeId: UniverseId
  readonly durationMs: number
  readonly attempts: number
  readonly played: number
  readonly suppressed: number
  readonly maximumConcurrent: number
  readonly maximumPeakDb: number
  readonly maximumAttenuationDb: number
  readonly issues: readonly ReleaseAuditIssue[]
}

function missing(value: string | readonly string[]): boolean {
  return typeof value === 'string'
    ? value.trim().length < 3
    : value.length === 0 || value.some((entry) => entry.trim().length < 2)
}

export function auditObjectPurpose(): readonly ReleaseAuditIssue[] {
  const issues: ReleaseAuditIssue[] = []
  for (const [universeId, pack] of V2_UNIVERSE_BY_ID) {
    const objects = pack.visual.objects
    const ids = new Set<string>()
    if (missing(pack.heart.phenomenon) || missing(pack.heart.purpose) || missing(pack.heart.silhouette)) {
      issues.push({ scope: `${universeId}.heart`, message: 'Heart lacks a phenomenon, purpose, or silhouette' })
    }
    for (const object of objects) {
      const scope = `${universeId}.object.${object.id}`
      if (ids.has(object.id)) issues.push({ scope, message: 'object ID is duplicated' })
      ids.add(object.id)
      if (missing(object.phenomenon)) issues.push({ scope, message: 'phenomenon is missing' })
      if (missing(object.purpose)) issues.push({ scope, message: 'mechanical/story purpose is missing' })
      if (missing(object.silhouette)) issues.push({ scope, message: 'silhouette is missing' })
      if (missing(object.material)) issues.push({ scope, message: 'material is missing' })
      if (missing(object.reducedMotionState.label) || missing(object.lowQualityState.label)) {
        issues.push({ scope, message: 'fallback state loses its semantic label' })
      }
      if (object.sourceKind === 'generator' && !object.ownershipStates) {
        issues.push({ scope, message: 'Kindling object lacks five ownership states' })
      }
    }
    const generatorObjects = objects.filter((object) => object.sourceKind === 'generator')
    if (generatorObjects.length !== 18) issues.push({ scope: `${universeId}.visual`, message: `expected 18 Kindling objects, received ${generatorObjects.length}` })
    if (objects.filter((object) => object.sourceKind === 'beacon').length !== 1) issues.push({ scope: `${universeId}.visual`, message: 'Beacon must appear exactly once' })
    for (const record of pack.archive.records) {
      if (!ids.has(record.object.id)) issues.push({ scope: `${universeId}.archive.${record.id}`, message: 'Archive object is absent from the visible manifest' })
      if (missing(record.observation) || missing(record.implication) || missing(record.effectDescription)) {
        issues.push({ scope: `${universeId}.archive.${record.id}`, message: 'Archive record lacks observation, implication, or effect' })
      }
    }
  }
  return issues
}

export function auditAccessibilityContracts(): readonly ReleaseAuditIssue[] {
  const issues: ReleaseAuditIssue[] = []
  for (const [universeId, pack] of V2_UNIVERSE_BY_ID) {
    const accessibility = pack.accessibility
    if (!accessibility.muted.fullGameplayEquivalent || accessibility.muted.captions.length === 0) {
      issues.push({ scope: `${universeId}.muted`, message: 'muted mode lacks full gameplay captions' })
    }
    if (!accessibility.reducedMotion.fullGameplayEquivalent || !accessibility.reducedMotion.timingInformationPreserved) {
      issues.push({ scope: `${universeId}.reduced-motion`, message: 'reduced motion loses timing or gameplay' })
    }
    if (!accessibility.lowQuality.fullGameplayEquivalent || !accessibility.lowQuality.preservesHitTargets || !accessibility.lowQuality.preservesStateLabels) {
      issues.push({ scope: `${universeId}.low-quality`, message: 'low quality loses targets or state labels' })
    }
    if (accessibility.nonColorSignals.length < 4) issues.push({ scope: `${universeId}.non-color`, message: 'fewer than four non-color state signals' })
    if (!accessibility.timing.averagedModeAvailable) issues.push({ scope: `${universeId}.timing`, message: 'averaged timing alternative is unavailable' })
    const [minimum, maximum] = accessibility.timing.averagedRewardRatio
    if (minimum < 0.85 || maximum > 0.9 || minimum > maximum) issues.push({ scope: `${universeId}.timing`, message: 'averaged reward lies outside the approved 85–90% range' })
  }
  return issues
}

function concurrentAt(history: readonly AudioHistoryEntry[], atMs: number): number {
  return history.filter((entry) => entry.startedAtMs <= atMs && entry.endsAtMs > atMs).length
}

export function simulateAudioFatigueSession(
  universeId: UniverseId,
  audio: UniverseAudioDef,
  durationMs = 30 * 60_000,
): AudioFatigueSummary {
  const issues: ReleaseAuditIssue[] = []
  let history: AudioHistoryEntry[] = []
  let attempts = 0
  let played = 0
  let maximumConcurrent = 0
  let maximumPeakDb = Number.NEGATIVE_INFINITY
  let maximumAttenuationDb = 0
  for (let atMs = 0; atMs < durationMs; atMs += 200) {
    const cueId = atMs > 0 && atMs % 60_000 === 0 ? audio.omenCallCue : audio.clickMaterialCue
    const duration = cueId === audio.omenCallCue ? 900 : 120
    attempts += 1
    const decision = planAudioCue(cueId, audio, { nowMs: atMs, durationMs: duration, history })
    history = history.filter((entry) => entry.endsAtMs > atMs || entry.startedAtMs >= atMs - 12_000)
    if (!decision.play) continue
    played += 1
    maximumPeakDb = Math.max(maximumPeakDb, decision.estimatedMasterPeakDb)
    maximumAttenuationDb = Math.min(maximumAttenuationDb, decision.gainAdjustmentDb)
    history.push({
      cueId: decision.cueId,
      family: decision.family,
      bus: decision.bus,
      priority: decision.priority,
      startedAtMs: atMs,
      endsAtMs: decision.endsAtMs,
      appliedPeakDb: decision.appliedPeakDb,
    })
    maximumConcurrent = Math.max(maximumConcurrent, concurrentAt(history, atMs))
  }
  if (maximumPeakDb > MASTER_PEAK_CEILING_DB + 1e-9) issues.push({ scope: `${universeId}.audio`, message: 'master peak ceiling exceeded' })
  if (maximumConcurrent > GLOBAL_CONCURRENCY_LIMIT) issues.push({ scope: `${universeId}.audio`, message: 'global concurrency limit exceeded' })
  if (played === attempts && maximumAttenuationDb >= 0) issues.push({ scope: `${universeId}.audio`, message: 'fatigue policy neither suppressed nor attenuated a dense repeated cue' })
  return {
    universeId,
    durationMs,
    attempts,
    played,
    suppressed: attempts - played,
    maximumConcurrent,
    maximumPeakDb,
    maximumAttenuationDb,
    issues,
  }
}
