import type {
  PurchaseFeedbackEvent,
  SemanticFeedbackEvent,
  UniversePackV2,
} from '../content/universes/types'
import { playBuy } from '../audio/sfx'
import {
  applySemanticAudioEvent,
  EMPTY_SEMANTIC_AUDIO_RUNTIME_STATE,
  type AudioSinkFallbackRequest,
  type AudioSinkPlayRequest,
  type SemanticAudioRuntimePreferences,
  type SemanticAudioRuntimeState,
  type SemanticAudioSink,
} from '../audio/semantic-runtime'
import {
  EMPTY_ANNOUNCEMENT_STATE,
  gateAnnouncement,
  type AnnouncementGateState,
} from '../accessibility/announcements'
import {
  dispatchSemanticFeedback,
  type FeedbackDispatchResult,
} from './index'

export interface LiveFeedbackPreferences {
  readonly audio: SemanticAudioRuntimePreferences
}

export interface LiveFeedbackState {
  announcement: string
  visualFallbackEventId: string | null
  lastDispatch: FeedbackDispatchResult | null
}

export const liveFeedback: LiveFeedbackState = $state({
  announcement: '',
  visualFallbackEventId: null,
  lastDispatch: null,
})

let audioState: SemanticAudioRuntimeState = EMPTY_SEMANTIC_AUDIO_RUNTIME_STATE
let announcementState: AnnouncementGateState = EMPTY_ANNOUNCEMENT_STATE

function fallbackMessage(request: AudioSinkFallbackRequest): string {
  const action = request.event.kind === 'purchase' ? 'Purchase completed' : 'Action completed'
  return `${action}; ${request.cueId} sound was unavailable.`
}

const audioSink: SemanticAudioSink = {
  play(request: AudioSinkPlayRequest): boolean {
    // The current synthesized interval is authored at the cue's target peak.
    const gainScale = 10 ** ((request.appliedPeakDb - request.cue.targetPeakDb) / 20)
    if (request.cue.synthesisKey === 'ember-purchase-interval') return playBuy(gainScale, 'emberlight')
    if (request.cue.synthesisKey === 'tide-purchase-minor-seventh-rise') return playBuy(gainScale, 'tidefall')
    if (request.cue.bus === 'purchase') return playBuy(gainScale, request.event.source.universeId)
    return false
  },
  presentVisualFallback(request) {
    liveFeedback.visualFallbackEventId = request.event.id
    window.setTimeout(() => {
      if (liveFeedback.visualFallbackEventId === request.event.id) {
        liveFeedback.visualFallbackEventId = null
      }
    }, 700)
  },
  presentCaptionFallback(request) {
    liveFeedback.announcement = fallbackMessage(request)
  },
}

function sourceName(event: SemanticFeedbackEvent, pack: UniversePackV2): string {
  if (event.source.kind === 'generator') {
    return pack.economy.generators.find(({ id }) => id === event.source.id)?.name ?? event.source.id
  }
  return event.source.id
}

function announce(event: SemanticFeedbackEvent, pack: UniversePackV2) {
  if (!event.announcement) return
  const result = gateAnnouncement(announcementState, {
    spec: event.announcement,
    occurredAtMs: event.occurredAtMs,
    parameters: event.kind === 'purchase'
      ? { quantity: event.quantity, source: sourceName(event, pack) }
      : { source: sourceName(event, pack) },
  })
  announcementState = result.nextState
  if (result.decision !== 'announce') return
  liveFeedback.announcement = event.kind === 'purchase'
    ? `Purchased ${event.quantity.toLocaleString()} ${sourceName(event, pack)}${event.quantity === 1 ? '' : ' Kindlings'}.`
    : `${sourceName(event, pack)} changed.`
}

/** Fans one completed economy purchase into independent audio and a11y consumers. */
export function publishLivePurchase(
  event: PurchaseFeedbackEvent,
  pack: UniversePackV2,
  preferences: LiveFeedbackPreferences,
): FeedbackDispatchResult {
  const dispatch = dispatchSemanticFeedback([event], [
    {
      id: 'semantic-audio',
      consume(candidate) {
        const result = applySemanticAudioEvent(pack.audio, audioSink, audioState, {
          event: candidate,
          nowMs: candidate.occurredAtMs,
          durationMs: 420,
          preferences: preferences.audio,
        })
        audioState = result.nextState
      },
    },
    {
      id: 'screen-reader-announcement',
      consume(candidate) {
        announce(candidate, pack)
      },
    },
  ])
  liveFeedback.lastDispatch = dispatch
  return dispatch
}

/** Test/dev reset; it never changes progression state. */
export function resetLiveFeedbackRuntime() {
  audioState = EMPTY_SEMANTIC_AUDIO_RUNTIME_STATE
  announcementState = EMPTY_ANNOUNCEMENT_STATE
  liveFeedback.announcement = ''
  liveFeedback.visualFallbackEventId = null
  liveFeedback.lastDispatch = null
}
