import type {
  AudioBusId,
  AudioCueDef,
  SemanticFeedbackEvent,
  UniverseAudioDef,
} from '../content/universes/types'
import { validateSemanticFeedbackEvent } from '../feedback/semantic-registry'
import {
  FATIGUE_WINDOW_MS,
  assertValidUniverseAudioDef,
  dispatchSemanticAudio,
} from './semantic-contract'
import type {
  AudioDispatchDecision,
  AudioDuckInstruction,
  AudioHistoryEntry,
  AudioSuppressionReason,
} from './semantic-contract'

export interface SemanticAudioRuntimeState {
  /** Contains successful sink starts only. */
  readonly history: readonly AudioHistoryEntry[]
}

export const EMPTY_SEMANTIC_AUDIO_RUNTIME_STATE: SemanticAudioRuntimeState = {
  history: [],
}

export interface SemanticAudioRuntimePreferences {
  readonly mutedBuses?: readonly AudioBusId[]
  readonly mutedGroups?: readonly string[]
  /** Intentional silence is equivalent to muting master for audio only. */
  readonly silence?: boolean
}

export interface SemanticAudioRuntimeRequest {
  readonly event: SemanticFeedbackEvent
  readonly nowMs: number
  readonly durationMs: number
  readonly preferences?: SemanticAudioRuntimePreferences
}

export interface AudioSinkPlayRequest {
  readonly event: SemanticFeedbackEvent
  readonly cue: AudioCueDef
  readonly startedAtMs: number
  readonly endsAtMs: number
  readonly appliedPeakDb: number
  readonly gainAdjustmentDb: number
  readonly estimatedMasterPeakDb: number
  readonly ducking: readonly AudioDuckInstruction[]
}

export type AudioFallbackKind = 'visual' | 'caption'
export type AudioRuntimeFallbackReason = AudioSuppressionReason | 'sink-rejected' | 'sink-error'

export interface AudioSinkFallbackRequest {
  readonly event: SemanticFeedbackEvent
  readonly cueId: string
  readonly kind: AudioFallbackKind
  readonly reason: AudioRuntimeFallbackReason
}

export interface SemanticAudioSink {
  /** Returns true only when playback actually started. */
  readonly play: (request: AudioSinkPlayRequest) => boolean
  readonly presentVisualFallback: (request: AudioSinkFallbackRequest) => void
  readonly presentCaptionFallback: (request: AudioSinkFallbackRequest) => void
}

export interface SemanticAudioRuntimeResult {
  /** Semantic input is never consumed by audio behavior. */
  readonly event: SemanticFeedbackEvent
  readonly decision: AudioDispatchDecision
  readonly played: boolean
  readonly fallbackKinds: readonly AudioFallbackKind[]
  readonly sinkErrors: readonly string[]
  readonly nextState: SemanticAudioRuntimeState
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function fallbackKindsFor(cue: AudioCueDef | undefined): readonly AudioFallbackKind[] {
  if (!cue || cue.mutedFallback === 'none') return []
  if (cue.mutedFallback === 'visual') return ['visual']
  if (cue.mutedFallback === 'caption') return ['caption']
  return ['visual', 'caption']
}

function presentFallbacks(
  sink: SemanticAudioSink,
  event: SemanticFeedbackEvent,
  cue: AudioCueDef | undefined,
  reason: AudioRuntimeFallbackReason,
): { readonly kinds: readonly AudioFallbackKind[]; readonly errors: readonly string[] } {
  const kinds = fallbackKindsFor(cue)
  const errors: string[] = []
  if (!cue) return { kinds, errors }
  for (const kind of kinds) {
    const request: AudioSinkFallbackRequest = { event, cueId: cue.id, kind, reason }
    try {
      if (kind === 'visual') sink.presentVisualFallback(request)
      else sink.presentCaptionFallback(request)
    } catch (error) {
      errors.push(`${kind}: ${errorMessage(error)}`)
    }
  }
  return { kinds, errors }
}

function retainedHistory(
  state: SemanticAudioRuntimeState,
  audio: UniverseAudioDef,
  nowMs: number,
): readonly AudioHistoryEntry[] {
  const retentionMs = Math.max(
    FATIGUE_WINDOW_MS,
    ...audio.cues.map((cue) => cue.minimumIntervalMs),
  )
  return state.history.filter((entry) => (
    entry.endsAtMs > nowMs || entry.startedAtMs >= nowMs - retentionMs
  ))
}

function mutedBuses(preferences: SemanticAudioRuntimePreferences | undefined): readonly AudioBusId[] {
  const result = new Set(preferences?.mutedBuses ?? [])
  if (preferences?.silence) result.add('master')
  return [...result]
}

function assertSemanticEvent(event: SemanticFeedbackEvent): void {
  const issues = validateSemanticFeedbackEvent(event)
  if (issues.length > 0) {
    const detail = issues.map((entry) => `${entry.path}: ${entry.message}`).join('\n')
    throw new TypeError(`Invalid semantic audio event:\n${detail}`)
  }
}

/**
 * Applies one validated semantic cue decision to an abstract sink. Only a successful
 * sink start enters history; mute, fatigue, rejection, and errors preserve the event.
 */
export function applySemanticAudioEvent(
  audio: UniverseAudioDef,
  sink: SemanticAudioSink,
  state: SemanticAudioRuntimeState,
  request: SemanticAudioRuntimeRequest,
): SemanticAudioRuntimeResult {
  assertValidUniverseAudioDef(audio)
  assertSemanticEvent(request.event)
  const history = retainedHistory(state, audio, request.nowMs)
  const dispatch = dispatchSemanticAudio(request.event, audio, {
    nowMs: request.nowMs,
    durationMs: request.durationMs,
    history,
    mutedBuses: mutedBuses(request.preferences),
    mutedGroups: request.preferences?.mutedGroups,
  })
  const cue = request.event.audioCue
    ? audio.cues.find((candidate) => candidate.id === request.event.audioCue)
    : undefined

  if (!dispatch.audio.play) {
    const fallback = presentFallbacks(
      sink,
      request.event,
      cue,
      dispatch.audio.reason,
    )
    return {
      event: request.event,
      decision: dispatch.audio,
      played: false,
      fallbackKinds: fallback.kinds,
      sinkErrors: fallback.errors,
      nextState: { history },
    }
  }

  if (!cue) {
    throw new Error(`Audio policy approved unknown cue "${dispatch.audio.cueId}".`)
  }
  const playRequest: AudioSinkPlayRequest = {
    event: request.event,
    cue,
    startedAtMs: request.nowMs,
    endsAtMs: dispatch.audio.endsAtMs,
    appliedPeakDb: dispatch.audio.appliedPeakDb,
    gainAdjustmentDb: dispatch.audio.gainAdjustmentDb,
    estimatedMasterPeakDb: dispatch.audio.estimatedMasterPeakDb,
    ducking: dispatch.audio.ducking,
  }

  let started = false
  let failureReason: AudioRuntimeFallbackReason | null = null
  const sinkErrors: string[] = []
  try {
    started = sink.play(playRequest)
    if (!started) failureReason = 'sink-rejected'
  } catch (error) {
    failureReason = 'sink-error'
    sinkErrors.push(`play: ${errorMessage(error)}`)
  }

  if (!started) {
    const fallback = presentFallbacks(
      sink,
      request.event,
      cue,
      failureReason ?? 'sink-rejected',
    )
    return {
      event: request.event,
      decision: dispatch.audio,
      played: false,
      fallbackKinds: fallback.kinds,
      sinkErrors: [...sinkErrors, ...fallback.errors],
      nextState: { history },
    }
  }

  const playedEntry: AudioHistoryEntry = {
    cueId: dispatch.audio.cueId,
    family: dispatch.audio.family,
    bus: dispatch.audio.bus,
    priority: dispatch.audio.priority,
    startedAtMs: request.nowMs,
    endsAtMs: dispatch.audio.endsAtMs,
    appliedPeakDb: dispatch.audio.appliedPeakDb,
  }
  return {
    event: request.event,
    decision: dispatch.audio,
    played: true,
    fallbackKinds: [],
    sinkErrors,
    nextState: { history: [...history, playedEntry] },
  }
}
