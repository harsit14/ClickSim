import { EMBERLIGHT_AUDIO_EVENT_MAP } from '../../audio/emberlight/identity'

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

const ONE_BEAT_MS = Math.round(60_000 / 72)

export const EMBERLIGHT_SUPERNOVA_SENSORY_SPEC = {
  localName: 'Supernova',
  canonicalName: 'Epoch Turn',
  confirmationRequired: true,
  replayablePreview: true,
  fullScreenFlashAllowed: false,
  inputFeedbackDelayed: false,
  totalDurationMs: 6_233,
  phases: [
    {
      id: 'gather', startMs: 0, durationMs: 900,
      visual: 'Every owned Kindling sends one material thread toward the Last Ember.',
      shapeCue: 'eighteen possible spokes contract into a broken five-point corona',
      caption: 'The Known Sky gathers what this era made.',
      reducedMotion: 'Spokes shorten in place; no camera movement or screen travel occurs.',
      audio: { kind: 'duck-stem', stemId: 'ember-stem-mallets' },
    },
    {
      id: 'withdraw-forge', startMs: 900, durationMs: 600,
      visual: 'Foundry light banks into four fixed notches beneath the Heart.',
      shapeCue: 'the lowest corona notch closes',
      caption: 'The first work becomes memory.',
      reducedMotion: 'One notch changes from outline to solid.',
      audio: { kind: 'duck-stem', stemId: 'ember-stem-forge' },
    },
    {
      id: 'withdraw-strings', startMs: 1_500, durationMs: 600,
      visual: 'The stellar ecliptic resolves into two still lensing arcs.',
      shapeCue: 'paired arcs close around the Heart',
      caption: 'The stars release their names.',
      reducedMotion: 'Two arcs crossfade to a fixed inner position.',
      audio: { kind: 'duck-stem', stemId: 'ember-stem-strings' },
    },
    {
      id: 'withdraw-choir', startMs: 2_100, durationMs: 600,
      visual: 'Galaxy and web silhouettes become one branching horizon line.',
      shapeCue: 'the horizon web reduces to one open branch',
      caption: 'The great structures leave one route behind.',
      reducedMotion: 'The web loses branches by local opacity steps.',
      audio: { kind: 'duck-stem', stemId: 'ember-stem-choir' },
    },
    {
      id: 'corona-hold', startMs: 2_700, durationMs: 600,
      visual: 'The Last Ember holds as a white core inside a dark, broken corona.',
      shapeCue: 'one white center and five separated black-edged points',
      caption: 'One light remains.',
      reducedMotion: 'The final silhouette is static and high contrast.',
      audio: { kind: 'duck-stem', stemId: 'ember-stem-choir' },
    },
    {
      id: 'one-beat-silence', startMs: 3_300, durationMs: ONE_BEAT_MS,
      visual: 'The broken corona remains visible while all ambient travel stops.',
      shapeCue: 'a single open ring marks the complete silent beat',
      caption: 'The old light releases.',
      reducedMotion: 'A progress notch fills around a stationary ring.',
      audio: { kind: 'intentional-silence' },
    },
    {
      id: 'collapse', startMs: 4_133, durationMs: 900,
      visual: 'The corona folds inward and leaves five Stardust facets.',
      shapeCue: 'five diamond facets replace the former corona points',
      caption: 'Supernova — Emberlight’s Epoch Turn.',
      reducedMotion: 'The corona crossfades directly into five numbered facets.',
      audio: { kind: 'play-cue', cueId: EMBERLIGHT_AUDIO_EVENT_MAP.supernova },
    },
    {
      id: 'return', startMs: 5_033, durationMs: 1_200,
      visual: 'A smaller Last Ember returns above retained Archive and history marks.',
      shapeCue: 'the broken five-point Heart returns inside a persistent facet frame',
      caption: 'Stardust remains. The Astral Cabinet remembers. Kindle again.',
      reducedMotion: 'The new Heart and retained marks appear in two local contrast steps.',
      audio: { kind: 'play-cue', cueId: EMBERLIGHT_AUDIO_EVENT_MAP.archive },
    },
  ] as const satisfies readonly EmberlightSupernovaPhase[],
} as const
