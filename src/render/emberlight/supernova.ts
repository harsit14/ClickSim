import { EMBERLIGHT_AUDIO_EVENT_MAP } from '../../audio/emberlight/identity'
import { INFALL_RHYME_BEATS } from '../../content/infall-rhyme'

export type SupernovaAudioAction =
  | { readonly kind: 'duck-stem'; readonly stemId: string }
  | { readonly kind: 'intentional-silence' }
  | { readonly kind: 'play-cue'; readonly cueId: string }

export interface EmberlightSupernovaPhase {
  readonly id: string
  readonly startMs: number
  readonly durationMs: number
  readonly visual: string
  readonly shapeCue: string
  readonly caption: string
  readonly reducedMotion: string
  readonly audio: SupernovaAudioAction
}

export const EMBERLIGHT_SUPERNOVA_HOLD_BEAT_MS = Math.round(60_000 / 72)
export const EMBERLIGHT_SUPERNOVA_HOLD_MS = EMBERLIGHT_SUPERNOVA_HOLD_BEAT_MS * 3
const [INFALL_SETTLEMENT, INFALL_SUNS, INFALL_CONSTELLATIONS, INFALL_INSTRUMENTS] = INFALL_RHYME_BEATS

/**
 * One authoritative 32-second ceremony timeline. The negative-time held choice
 * is described separately by HOLD_MS because release must cancel before T0.
 */
export const EMBERLIGHT_SUPERNOVA_SENSORY_SPEC = {
  localName: 'Supernova',
  canonicalName: 'Epoch Turn',
  confirmationRequired: true,
  replayablePreview: true,
  fullScreenFlashAllowed: false,
  inputFeedbackDelayed: false,
  totalDurationMs: 32_000,
  heldChoice: {
    beats: 3,
    beatMs: EMBERLIGHT_SUPERNOVA_HOLD_BEAT_MS,
    durationMs: EMBERLIGHT_SUPERNOVA_HOLD_MS,
    releaseCancels: true,
    dimPerBeat: 0.1,
    stemOrder: ['ember-stem-choir', 'ember-stem-strings', 'ember-stem-bass'],
  },
  phases: [
    {
      id: 'listen-choir', startMs: 0, durationMs: 1_500,
      visual: 'Cosmic silhouettes lean two degrees toward the Last Ember.',
      shapeCue: 'the upper web inclines while its junctions remain fixed',
      caption: 'The farthest voices fall silent.',
      reducedMotion: 'The cosmic band loses one luminance step and receives a numbered notch.',
      audio: { kind: 'duck-stem', stemId: 'ember-stem-choir' },
    },
    {
      id: 'listen-strings', startMs: 1_500, durationMs: 1_500,
      visual: 'Constellations and the ecliptic incline toward the Last Ember.',
      shapeCue: 'the drawn sky tilts without camera movement',
      caption: 'The stars release their names.',
      reducedMotion: 'The ecliptic loses one luminance step and receives a second notch.',
      audio: { kind: 'duck-stem', stemId: 'ember-stem-strings' },
    },
    {
      id: 'listen-bass', startMs: 3_000, durationMs: 1_500,
      visual: 'Beacon and horizon structures turn inward.',
      shapeCue: 'vertical structures incline toward the central seam',
      caption: 'The horizon stops answering.',
      reducedMotion: 'The horizon loses one luminance step and receives a third notch.',
      audio: { kind: 'duck-stem', stemId: 'ember-stem-bass' },
    },
    {
      id: 'listen-mallets', startMs: 4_500, durationMs: 1_500,
      visual: 'Settlement fire banks from the outer terraces inward.',
      shapeCue: 'five ground lights close from left to right',
      caption: 'The first work listens last.',
      reducedMotion: 'The settlement loses one luminance step and receives a fourth notch.',
      audio: { kind: 'duck-stem', stemId: 'ember-stem-mallets' },
    },
    {
      id: INFALL_SETTLEMENT.supernovaPhaseId, startMs: INFALL_SETTLEMENT.startMs, durationMs: INFALL_SETTLEMENT.durationMs,
      visual: INFALL_SETTLEMENT.visual,
      shapeCue: INFALL_SETTLEMENT.shapeCue,
      caption: INFALL_SETTLEMENT.caption,
      reducedMotion: INFALL_SETTLEMENT.reducedMotion,
      audio: { kind: 'duck-stem', stemId: 'ember-stem-mallets' },
    },
    {
      id: INFALL_SUNS.supernovaPhaseId, startMs: INFALL_SUNS.startMs, durationMs: INFALL_SUNS.durationMs,
      visual: INFALL_SUNS.visual,
      shapeCue: INFALL_SUNS.shapeCue,
      caption: INFALL_SUNS.caption,
      reducedMotion: INFALL_SUNS.reducedMotion,
      audio: { kind: 'duck-stem', stemId: 'ember-stem-strings' },
    },
    {
      id: INFALL_CONSTELLATIONS.supernovaPhaseId, startMs: INFALL_CONSTELLATIONS.startMs, durationMs: INFALL_CONSTELLATIONS.durationMs,
      visual: INFALL_CONSTELLATIONS.visual,
      shapeCue: INFALL_CONSTELLATIONS.shapeCue,
      caption: INFALL_CONSTELLATIONS.caption,
      reducedMotion: INFALL_CONSTELLATIONS.reducedMotion,
      audio: { kind: 'duck-stem', stemId: 'ember-stem-strings' },
    },
    {
      id: INFALL_INSTRUMENTS.supernovaPhaseId, startMs: INFALL_INSTRUMENTS.startMs, durationMs: INFALL_INSTRUMENTS.durationMs,
      visual: INFALL_INSTRUMENTS.visual,
      shapeCue: INFALL_INSTRUMENTS.shapeCue,
      caption: INFALL_INSTRUMENTS.caption,
      reducedMotion: INFALL_INSTRUMENTS.reducedMotion,
      audio: { kind: 'duck-stem', stemId: 'ember-stem-choir' },
    },
    {
      id: 'void', startMs: 12_000, durationMs: 1_200,
      visual: 'Pure black holds for 1.2 seconds; one heartbeat sounds at the midpoint.',
      shapeCue: 'no shape remains',
      caption: 'Nothing.',
      reducedMotion: 'Pure black holds for the same duration with the heartbeat caption.',
      audio: { kind: 'intentional-silence' },
    },
    {
      id: 'blast', startMs: 13_200, durationMs: 800,
      visual: 'A thin palette ring expands and develops the Stardust field behind it.',
      shapeCue: 'one hairline ring leaves a slower luminous reveal boundary',
      caption: 'Supernova — the old sky becomes Stardust.',
      reducedMotion: 'The ring appears at three fixed radii; no full-screen white flash.',
      audio: { kind: 'play-cue', cueId: EMBERLIGHT_AUDIO_EVENT_MAP.supernova },
    },
    {
      id: 'stardust-rain', startMs: 14_000, durationMs: 8_000,
      visual: 'Up-lit Stardust falls to the surviving ash dunes and counts the reward.',
      shapeCue: 'small diamond motes land along the ground seam',
      caption: 'What fell returns as memory.',
      reducedMotion: 'A stationary facet counter advances with the same chord-note sequence.',
      audio: { kind: 'play-cue', cueId: EMBERLIGHT_AUDIO_EVENT_MAP.archive },
    },
    {
      id: 'rebuild', startMs: 22_000, durationMs: 8_000,
      visual: 'UI pieces return in their original purchase order with their first chimes.',
      shapeCue: 'counter, shop, upgrade bar, and dock rebuild outward from the Ember',
      caption: 'The instruments remember how they arrived.',
      reducedMotion: 'Named UI regions reappear as local contrast steps in acquisition order.',
      audio: { kind: 'play-cue', cueId: EMBERLIGHT_AUDIO_EVENT_MAP.purchase },
    },
    {
      id: 'return', startMs: 30_000, durationMs: 2_000,
      visual: 'The bare Coal breathes inside its persistent stone ring over glittering ash.',
      shapeCue: 'one Coal, one stone ring, and the faint ghosts of lost structures',
      caption: 'Again.',
      reducedMotion: 'Coal and retained marks appear in two local luminance steps.',
      audio: { kind: 'play-cue', cueId: EMBERLIGHT_AUDIO_EVENT_MAP.archive },
    },
  ] as const satisfies readonly EmberlightSupernovaPhase[],
} as const

export type EmberlightSupernovaPhaseId = (typeof EMBERLIGHT_SUPERNOVA_SENSORY_SPEC.phases)[number]['id']

export function emberlightSupernovaPhaseAt(elapsedMs: number): EmberlightSupernovaPhase {
  const bounded = Math.max(0, Math.min(EMBERLIGHT_SUPERNOVA_SENSORY_SPEC.totalDurationMs - 1, elapsedMs))
  return EMBERLIGHT_SUPERNOVA_SENSORY_SPEC.phases.find((phase) => (
    bounded >= phase.startMs && bounded < phase.startMs + phase.durationMs
  )) ?? EMBERLIGHT_SUPERNOVA_SENSORY_SPEC.phases.at(-1)!
}
