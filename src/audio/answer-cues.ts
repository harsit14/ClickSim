import type { RealmAnswerId } from '../content/endings'
import {
  ANSWER_CHOREOGRAPHIES,
  answerChoreographyCue,
  type AnswerChoreographyEventDetail,
} from '../render/answer-choreography'

export type AnswerAudioArticulation = 'pulse' | 'held' | 'swell'

export interface AnswerAudioGesture {
  readonly startMs: number
  readonly durationMs: number
  readonly attackMs: number
  readonly startHz: number
  readonly endHz: number
  readonly waveform: OscillatorType
  readonly articulation: AnswerAudioArticulation
  readonly peakGain: number
  readonly lowPassHz: number
  readonly pan: number
}

export interface AnswerAudioPlan {
  readonly answerId: RealmAnswerId
  readonly audioCue: `answer.${RealmAnswerId}.resolve`
  /** Shares the canonical visual cadence name; sound never carries it exclusively. */
  readonly rhythm: string
  readonly ceremonyGain: number
  readonly totalDurationMs: number
  readonly gestures: readonly AnswerAudioGesture[]
}

export const ANSWER_AUDIO_CEREMONY_GAIN = 0.38
export const ANSWER_AUDIO_MAX_CONCURRENT_GESTURES = 3
export const ANSWER_AUDIO_MAX_DURATION_MS = 3_000
export const ANSWER_AUDIO_HEADROOM_LINEAR_CEILING = 0.14

const tone = (
  startMs: number,
  durationMs: number,
  attackMs: number,
  startHz: number,
  endHz: number,
  waveform: OscillatorType,
  articulation: AnswerAudioArticulation,
  peakGain: number,
  lowPassHz: number,
  pan: number,
): AnswerAudioGesture => ({
  startMs,
  durationMs,
  attackMs,
  startHz,
  endHz,
  waveform,
  articulation,
  peakGain,
  lowPassHz,
  pan,
})

/**
 * Twenty-one local ceremonies. Values are deliberately explicit: no random
 * detune, procedural mutation, or answer-to-doctrine shortcut can collapse
 * two choices into the same sonic structure.
 */
const ANSWER_AUDIO_GESTURES: Readonly<Record<RealmAnswerId, readonly AnswerAudioGesture[]>> = {
  'emberlight-bank-fire': [
    tone(0, 920, 120, 246.94, 220, 'sine', 'held', 0.078, 2_800, -0.18),
    tone(170, 730, 90, 370, 329.63, 'triangle', 'held', 0.052, 3_400, 0.18),
    tone(710, 650, 170, 123.47, 110, 'sine', 'swell', 0.044, 1_600, 0),
  ],
  'emberlight-spend-ember': [
    tone(0, 280, 18, 220, 329.63, 'triangle', 'pulse', 0.082, 4_800, -0.45),
    tone(130, 300, 20, 277.18, 415.3, 'triangle', 'pulse', 0.077, 5_200, -0.15),
    tone(270, 320, 22, 329.63, 493.88, 'triangle', 'pulse', 0.071, 5_800, 0.18),
    tone(420, 390, 28, 440, 659.25, 'sine', 'pulse', 0.065, 6_400, 0.5),
  ],
  'emberlight-pass-spark': [
    tone(0, 690, 55, 261.63, 392, 'triangle', 'pulse', 0.062, 4_500, -0.52),
    tone(310, 720, 80, 329.63, 493.88, 'sine', 'held', 0.057, 5_200, 0),
    tone(670, 780, 95, 392, 739.99, 'triangle', 'swell', 0.052, 6_200, 0.56),
  ],

  'tidefall-carry-names': [
    tone(0, 430, 75, 174.61, 196, 'sine', 'held', 0.061, 1_250, -0.36),
    tone(285, 430, 75, 196, 220, 'sine', 'held', 0.058, 1_180, -0.12),
    tone(570, 440, 80, 220, 246.94, 'sine', 'held', 0.055, 1_100, 0.14),
    tone(865, 620, 150, 246.94, 196, 'triangle', 'swell', 0.048, 940, 0.4),
  ],
  'tidefall-trust-current': [
    tone(0, 940, 260, 246.94, 146.83, 'sine', 'swell', 0.055, 980, -0.42),
    tone(430, 970, 300, 293.66, 174.61, 'sine', 'swell', 0.051, 860, 0.08),
    tone(880, 1_020, 340, 349.23, 196, 'sine', 'swell', 0.047, 760, 0.48),
  ],
  'tidefall-survivors-choose': [
    tone(0, 810, 95, 196, 261.63, 'triangle', 'held', 0.057, 1_450, -0.58),
    tone(370, 660, 70, 164.81, 246.94, 'sine', 'pulse', 0.054, 1_180, 0.02),
    tone(920, 750, 180, 220, 293.66, 'triangle', 'swell', 0.05, 1_320, 0.61),
  ],

  'verdance-prune-witnesses': [
    tone(0, 920, 190, 196, 174.61, 'triangle', 'held', 0.057, 2_100, -0.52),
    tone(110, 920, 190, 246.94, 220, 'triangle', 'held', 0.057, 2_100, 0.52),
    tone(650, 240, 12, 698.46, 349.23, 'square', 'pulse', 0.041, 3_000, 0),
  ],
  'verdance-open-canopy': [
    tone(0, 720, 260, 174.61, 261.63, 'sine', 'swell', 0.052, 1_900, -0.45),
    tone(220, 760, 280, 196, 329.63, 'triangle', 'swell', 0.048, 2_300, 0.45),
    tone(640, 740, 210, 261.63, 392, 'sine', 'swell', 0.044, 2_800, 0),
  ],
  'verdance-graft-inheritance': [
    tone(0, 390, 55, 174.61, 220, 'triangle', 'pulse', 0.056, 2_200, -0.48),
    tone(270, 400, 60, 261.63, 220, 'sine', 'pulse', 0.054, 2_000, 0.48),
    tone(550, 430, 75, 220, 293.66, 'triangle', 'held', 0.052, 2_400, -0.2),
    tone(850, 620, 150, 220, 329.63, 'sine', 'swell', 0.047, 2_700, 0.2),
  ],

  'clockwork-keep-warnings': [
    tone(0, 120, 7, 880, 830.61, 'square', 'pulse', 0.038, 2_900, -0.2),
    tone(220, 120, 7, 880, 830.61, 'square', 'pulse', 0.038, 2_900, -0.2),
    tone(440, 120, 7, 880, 830.61, 'square', 'pulse', 0.038, 2_900, -0.2),
    tone(710, 820, 95, 329.63, 370, 'triangle', 'held', 0.05, 2_400, 0.38),
  ],
  'clockwork-break-schedule': [
    tone(0, 95, 5, 987.77, 493.88, 'square', 'pulse', 0.047, 3_600, -0.48),
    tone(85, 110, 6, 739.99, 369.99, 'square', 'pulse', 0.043, 3_200, 0.46),
    tone(205, 130, 7, 622.25, 311.13, 'triangle', 'pulse', 0.04, 2_800, -0.18),
    tone(355, 155, 9, 523.25, 261.63, 'square', 'pulse', 0.036, 2_500, 0.24),
    tone(760, 440, 180, 146.83, 155.56, 'sine', 'swell', 0.04, 1_100, 0),
  ],
  'clockwork-unscheduled-hour': [
    tone(0, 115, 7, 783.99, 698.46, 'square', 'pulse', 0.036, 2_800, -0.18),
    tone(190, 115, 7, 783.99, 698.46, 'square', 'pulse', 0.036, 2_800, 0.18),
    tone(680, 1_080, 130, 220, 207.65, 'sine', 'held', 0.047, 1_500, 0),
  ],

  'brahmalok-open-margin': [
    tone(0, 180, 18, 293.66, 329.63, 'triangle', 'pulse', 0.043, 2_600, -0.32),
    tone(220, 190, 18, 329.63, 369.99, 'triangle', 'pulse', 0.041, 2_600, -0.12),
    tone(460, 210, 20, 369.99, 392, 'triangle', 'pulse', 0.039, 2_600, 0.08),
    tone(970, 720, 260, 246.94, 261.63, 'sine', 'swell', 0.045, 1_850, 0.42),
  ],
  'brahmalok-release-work': [
    tone(0, 500, 80, 196, 246.94, 'triangle', 'held', 0.052, 2_100, -0.38),
    tone(250, 520, 85, 246.94, 329.63, 'triangle', 'held', 0.049, 2_500, -0.1),
    tone(540, 540, 90, 329.63, 440, 'sine', 'held', 0.046, 3_000, 0.2),
    tone(870, 650, 150, 440, 659.25, 'sine', 'swell', 0.041, 3_800, 0.5),
  ],
  'brahmalok-many-hands': [
    tone(0, 440, 70, 220, 293.66, 'triangle', 'held', 0.044, 2_300, -0.62),
    tone(200, 450, 75, 277.18, 329.63, 'sine', 'held', 0.043, 2_500, -0.3),
    tone(430, 460, 80, 329.63, 392, 'triangle', 'held', 0.042, 2_700, 0),
    tone(690, 470, 85, 369.99, 440, 'sine', 'held', 0.041, 2_900, 0.3),
    tone(990, 610, 150, 440, 523.25, 'triangle', 'swell', 0.039, 3_200, 0.62),
  ],

  'vishnulok-keep-shape': [
    tone(0, 1_650, 240, 110, 110, 'sine', 'held', 0.046, 920, 0),
    tone(260, 350, 65, 220, 196, 'sine', 'pulse', 0.045, 1_250, -0.38),
    tone(620, 370, 70, 246.94, 207.65, 'triangle', 'pulse', 0.041, 1_350, 0.35),
    tone(1_020, 390, 75, 261.63, 220, 'sine', 'pulse', 0.038, 1_450, -0.08),
  ],
  'vishnulok-preserve-promise': [
    tone(0, 620, 170, 164.81, 220, 'sine', 'swell', 0.047, 1_250, -0.5),
    tone(330, 640, 180, 220, 164.81, 'sine', 'swell', 0.045, 1_180, 0.5),
    tone(680, 660, 190, 164.81, 246.94, 'triangle', 'swell', 0.043, 1_350, -0.24),
    tone(1_050, 690, 210, 246.94, 164.81, 'sine', 'swell', 0.041, 1_100, 0.24),
  ],
  'vishnulok-returned-name': [
    tone(0, 720, 230, 123.47, 146.83, 'sine', 'swell', 0.044, 900, 0),
    tone(1_000, 410, 70, 220, 277.18, 'triangle', 'held', 0.045, 1_600, -0.28),
    tone(1_250, 430, 75, 277.18, 349.23, 'sine', 'held', 0.042, 1_850, 0.04),
    tone(1_520, 580, 150, 349.23, 523.25, 'triangle', 'swell', 0.039, 2_300, 0.38),
  ],

  'kailash-carry-seed': [
    tone(0, 310, 55, 220, 196, 'triangle', 'held', 0.04, 1_150, 0),
    tone(220, 310, 55, 196, 174.61, 'triangle', 'held', 0.039, 1_100, -0.08),
    tone(440, 310, 55, 174.61, 155.56, 'triangle', 'held', 0.038, 1_050, 0.08),
    tone(660, 310, 55, 155.56, 138.59, 'triangle', 'held', 0.037, 1_000, -0.1),
    tone(880, 310, 55, 138.59, 123.47, 'triangle', 'held', 0.036, 950, 0.1),
    tone(1_100, 310, 55, 123.47, 110, 'triangle', 'held', 0.035, 900, -0.12),
    tone(1_320, 520, 130, 110, 98, 'sine', 'swell', 0.034, 820, 0.12),
  ],
  'kailash-complete-dissolution': [
    tone(0, 610, 210, 220, 196, 'sine', 'swell', 0.04, 1_150, 0),
    tone(340, 630, 230, 196, 164.81, 'sine', 'swell', 0.037, 1_020, -0.2),
    tone(740, 650, 250, 164.81, 130.81, 'sine', 'swell', 0.034, 900, 0.22),
    tone(1_190, 670, 270, 130.81, 98, 'sine', 'swell', 0.031, 780, -0.3),
    tone(1_700, 610, 310, 98, 73.42, 'sine', 'swell', 0.027, 650, 0.32),
  ],
  'kailash-leave-path': [
    tone(0, 250, 35, 146.83, 138.59, 'triangle', 'pulse', 0.037, 980, -0.28),
    tone(330, 270, 40, 138.59, 130.81, 'triangle', 'pulse', 0.036, 940, -0.16),
    tone(710, 290, 45, 130.81, 123.47, 'triangle', 'pulse', 0.035, 900, -0.04),
    tone(1_140, 310, 50, 123.47, 116.54, 'triangle', 'pulse', 0.034, 860, 0.08),
    tone(1_620, 330, 55, 116.54, 110, 'triangle', 'pulse', 0.033, 820, 0.2),
    tone(2_080, 890, 330, 110, 146.83, 'sine', 'swell', 0.03, 760, 0.36),
  ],
}

export function isRealmAnswerId(value: unknown): value is RealmAnswerId {
  return typeof value === 'string' && Object.hasOwn(ANSWER_AUDIO_GESTURES, value)
}

/** Pure lookup shared by playback and exhaustive structural tests. */
export function answerAudioPlan(answerId: RealmAnswerId): AnswerAudioPlan {
  const choreography = ANSWER_CHOREOGRAPHIES[answerId]
  const gestures = ANSWER_AUDIO_GESTURES[answerId]
  const totalDurationMs = Math.max(...gestures.map(({ startMs, durationMs }) => startMs + durationMs))
  return {
    answerId,
    audioCue: choreography.audioCue,
    rhythm: choreography.motion.rhythm,
    ceremonyGain: ANSWER_AUDIO_CEREMONY_GAIN,
    totalDurationMs,
    gestures,
  }
}

/**
 * Treat window events as an untrusted boundary. Preview never sounds, and a
 * mismatched cue/motif/rhythm cannot accidentally play another answer.
 */
export function answerIdFromChoreographyEvent(
  detail: unknown,
): RealmAnswerId | null {
  if (!detail || typeof detail !== 'object') return null
  const candidate = detail as Partial<AnswerChoreographyEventDetail>
  if (candidate.phase !== 'resolve' || !isRealmAnswerId(candidate.answerId)) return null
  const expected = answerChoreographyCue(candidate.answerId, 'resolve')
  return candidate.audioCue === expected.audioCue
    && candidate.universeId === expected.universeId
    && candidate.motif === expected.motif
    && candidate.rhythm === expected.rhythm
    ? candidate.answerId
    : null
}

const activeUntilByContext = new WeakMap<AudioContext, number>()

/**
 * Schedules one bounded ceremony beneath the existing master. This function
 * never resumes a context or changes state by itself; the shared SFX runtime
 * owns those policies. A currently sounding answer rejects duplicate events.
 */
export function scheduleAnswerAudioPlan(
  ctx: AudioContext,
  master: GainNode,
  plan: AnswerAudioPlan,
): boolean {
  if (ctx.state === 'closed' || ctx.currentTime < (activeUntilByContext.get(ctx) ?? -1)) return false

  try {
    const startedAt = ctx.currentTime
    const ceremony = ctx.createGain()
    ceremony.gain.value = plan.ceremonyGain
    ceremony.connect(master)

    let finalOscillator: OscillatorNode | null = null
    let finalStop = -1
    for (const gesture of plan.gestures) {
      const startsAt = startedAt + gesture.startMs / 1_000
      const endsAt = startsAt + gesture.durationMs / 1_000
      const oscillator = ctx.createOscillator()
      const filter = ctx.createBiquadFilter()
      const envelope = ctx.createGain()
      const panner = ctx.createStereoPanner()

      oscillator.type = gesture.waveform
      oscillator.frequency.setValueAtTime(gesture.startHz, startsAt)
      oscillator.frequency.exponentialRampToValueAtTime(gesture.endHz, endsAt)
      filter.type = 'lowpass'
      filter.frequency.value = gesture.lowPassHz
      filter.Q.value = gesture.articulation === 'pulse' ? 1.2 : 0.45
      panner.pan.value = gesture.pan

      const attackEndsAt = startsAt + gesture.attackMs / 1_000
      const releaseStartsAt = gesture.articulation === 'held'
        ? startsAt + gesture.durationMs * 0.68 / 1_000
        : attackEndsAt
      envelope.gain.setValueAtTime(0.0001, startsAt)
      envelope.gain.exponentialRampToValueAtTime(gesture.peakGain, attackEndsAt)
      envelope.gain.setValueAtTime(gesture.peakGain, releaseStartsAt)
      envelope.gain.exponentialRampToValueAtTime(0.0001, endsAt)

      oscillator.connect(filter).connect(envelope).connect(panner).connect(ceremony)
      oscillator.start(startsAt)
      oscillator.stop(endsAt + 0.015)

      if (endsAt > finalStop) {
        finalStop = endsAt
        finalOscillator = oscillator
      }
    }

    activeUntilByContext.set(ctx, startedAt + plan.totalDurationMs / 1_000)
    finalOscillator?.addEventListener('ended', () => ceremony.disconnect(), { once: true })
    return true
  } catch {
    return false
  }
}
