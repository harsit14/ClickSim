import type {
  AudioBusDef,
  AudioCueDef,
  UniverseAudioDef,
} from '../../content/universes/types'

export const EMBERLIGHT_AUDIO_BUSES: readonly AudioBusDef[] = [
  { id: 'master', parent: null, defaultGain: 0.82, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'music', parent: 'master', defaultGain: 0.64, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'ambient', parent: 'master', defaultGain: 0.42, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'interface', parent: 'master', defaultGain: 0.56, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'touch', parent: 'master', defaultGain: 0.58, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'purchase', parent: 'master', defaultGain: 0.56, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'omen', parent: 'master', defaultGain: 0.62, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'story', parent: 'master', defaultGain: 0.58, userControllable: true, muteBehavior: 'suppress-audio-only' },
  { id: 'ceremony', parent: 'master', defaultGain: 0.7, userControllable: true, muteBehavior: 'suppress-audio-only' },
]

const cue = (
  id: string,
  bus: AudioCueDef['bus'],
  family: string,
  synthesisKey: string,
  priority: AudioCueDef['priority'],
  mutedFallback: AudioCueDef['mutedFallback'],
  minimumIntervalMs: number,
  targetPeakDb: number,
): AudioCueDef => ({
  id,
  bus,
  family,
  synthesisKey,
  targetPeakDb,
  maximumPeakDb: -3,
  minimumIntervalMs,
  maximumConcurrentInstances: priority === 'ambient' ? 1 : 2,
  priority,
  muteGroup: `emberlight-${bus}`,
  mutedFallback,
})

export const EMBERLIGHT_AUDIO_CUES: readonly AudioCueDef[] = [
  cue('ember-touch', 'touch', 'woody-plasma', 'ember-touch-impact', 'normal', 'none', 45, -15),
  cue('ember-purchase', 'purchase', 'forged-interval', 'ember-purchase-interval', 'normal', 'visual', 90, -13),
  cue('ember-critical', 'touch', 'magnetic-accent', 'ember-critical-tail', 'important', 'visual', 120, -10),
  cue('ember-omen', 'omen', 'meteor-plasma-call', 'ember-falling-star-descent', 'important', 'visual-and-caption', 600, -9),
  cue('ember-pulsar-sweep', 'omen', 'numbered-radio-sweep', 'ember-pulsar-three-window-call', 'important', 'visual-and-caption', 600, -10),
  cue('ember-comet-return', 'omen', 'returning-ice-harmonic', 'ember-comet-route-return', 'important', 'visual-and-caption', 1_000, -11),
  cue('ember-microlensing', 'omen', 'gravitational-focus-chord', 'ember-lens-alignment', 'important', 'visual-and-caption', 800, -10),
  cue('ember-supernova', 'ceremony', 'subtractive-cadence', 'ember-supernova-cadence', 'ceremony', 'visual-and-caption', 2_000, -7),
  cue('ember-archive', 'story', 'spectral-record', 'ember-archive-resolve', 'important', 'caption', 500, -12),
  cue('ember-achievement', 'interface', 'radiance-interval', 'ember-radiance-resolve', 'important', 'visual', 400, -12),
  cue('ember-beacon', 'ceremony', 'answered-light', 'ember-beacon-light', 'ceremony', 'visual-and-caption', 2_000, -7),
]

export const EMBERLIGHT_AUDIO_EVENT_MAP = {
  click: 'ember-touch',
  purchase: 'ember-purchase',
  critical: 'ember-critical',
  omens: {
    'falling-star': 'ember-omen',
    'pulsar-sweep': 'ember-pulsar-sweep',
    'comet-return': 'ember-comet-return',
    'microlensing-event': 'ember-microlensing',
  },
  archive: 'ember-archive',
  achievement: 'ember-achievement',
  supernova: 'ember-supernova',
  beacon: 'ember-beacon',
} as const

export const EMBERLIGHT_AUDIO_DEF: UniverseAudioDef = {
  tempoBpm: 72,
  meter: '4/4',
  buses: EMBERLIGHT_AUDIO_BUSES,
  cues: EMBERLIGHT_AUDIO_CUES,
  clickMaterialCue: EMBERLIGHT_AUDIO_EVENT_MAP.click,
  purchaseIntervalCue: EMBERLIGHT_AUDIO_EVENT_MAP.purchase,
  criticalAccentCue: EMBERLIGHT_AUDIO_EVENT_MAP.critical,
  omenCallCue: EMBERLIGHT_AUDIO_EVENT_MAP.omens['falling-star'],
  prestigeCadenceCue: EMBERLIGHT_AUDIO_EVENT_MAP.supernova,
  stems: [
    { id: 'ember-stem-mallets', kindlingFamily: 'spark-through-forge', bus: 'music', description: 'Warm mallets voice the nursery and early craft tiers.' },
    { id: 'ember-stem-forge', kindlingFamily: 'beacon-through-starseed', bus: 'music', description: 'Forge percussion enters with civilizational infrastructure.' },
    { id: 'ember-stem-strings', kindlingFamily: 'protostar-through-constellation', bus: 'music', description: 'Strings widen as mature stars establish an ecliptic.' },
    { id: 'ember-stem-choir', kindlingFamily: 'nebula-through-second-ember', bus: 'music', description: 'Choir resolves the cosmic hierarchy and subtracts before Supernova.' },
  ],
  silenceState: 'One intentional 72 BPM beat of silence is marked by a static broken-corona shape and the caption “The old light releases.”',
  fatiguePolicy: 'Bound pitch variation, rate-limit repeated material cues, duck touch under each Omen call, and retain at least one decibel of master headroom.',
}
