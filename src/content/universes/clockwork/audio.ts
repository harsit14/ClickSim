import type {
  AudioBusDef,
  AudioBusId,
  AudioCueDef,
  UniverseAudioDef,
} from '../types'

const bus = (id: AudioBusId, parent: AudioBusId | null, defaultGain: number): AudioBusDef => ({
  id,
  parent,
  defaultGain,
  userControllable: true,
  muteBehavior: 'suppress-audio-only',
})

export const CLOCKWORK_AUDIO_BUSES: readonly AudioBusDef[] = [
  bus('master', null, 0.8),
  bus('music', 'master', 0.56),
  bus('ambient', 'master', 0.32),
  bus('interface', 'master', 0.54),
  bus('touch', 'master', 0.62),
  bus('purchase', 'interface', 0.58),
  bus('omen', 'master', 0.68),
  bus('story', 'master', 0.54),
  bus('ceremony', 'master', 0.74),
]

const cue = (
  id: string,
  cueBus: AudioBusId,
  family: string,
  synthesisKey: string,
  targetPeakDb: number,
  minimumIntervalMs: number,
  priority: AudioCueDef['priority'],
  mutedFallback: AudioCueDef['mutedFallback'],
): AudioCueDef => ({
  id,
  bus: cueBus,
  family,
  synthesisKey,
  targetPeakDb,
  maximumPeakDb: -6,
  minimumIntervalMs,
  maximumConcurrentInstances: priority === 'normal' ? 2 : 1,
  priority,
  muteGroup: `clockwork-${cueBus}`,
  mutedFallback,
})

export const CLOCKWORK_AUDIO_CUES: readonly AudioCueDef[] = [
  cue('clockwork-heart-engage', 'touch', 'escapement-tooth', 'clockwork-heart-tooth-engage', -16, 75, 'normal', 'none'),
  cue('clockwork-purchase-train', 'purchase', 'completed-train-interval', 'clockwork-purchase-train-resolve', -14, 120, 'normal', 'visual'),
  cue('clockwork-inspected-cycle', 'touch', 'formula-inspection-accent', 'clockwork-inspected-cycle-resolve', -13, 180, 'important', 'visual'),
  cue('clockwork-route-change', 'interface', 'linkage-change', 'clockwork-route-linkage-lock', -15, 160, 'normal', 'visual'),
  cue('clockwork-signal-maintenance', 'omen', 'maintenance-window-call', 'clockwork-four-tooth-service-call', -11, 600, 'important', 'visual-and-caption'),
  cue('clockwork-signal-noon', 'omen', 'noon-alignment-call', 'clockwork-orrery-meridian-call', -10, 600, 'important', 'visual-and-caption'),
  cue('clockwork-signal-leap', 'omen', 'leap-tick-call', 'clockwork-extra-index-call', -11, 600, 'important', 'visual-and-caption'),
  cue('clockwork-signal-recall', 'omen', 'recall-notice-call', 'clockwork-ten-aperture-recall-call', -11, 600, 'important', 'visual-and-caption'),
  cue('clockwork-archive-index', 'story', 'patent-ledger-index', 'clockwork-patent-plate-resolve', -13, 500, 'important', 'caption'),
  cue('clockwork-rewinding-cadence', 'ceremony', 'reverse-spring-cadence', 'clockwork-rewinding-reverse-order', -8, 2_500, 'ceremony', 'visual-and-caption'),
  cue('clockwork-beacon-answer', 'ceremony', 'continuing-interval-answer', 'clockwork-beacon-meridian-answer', -8, 2_500, 'ceremony', 'visual-and-caption'),
]

export const CLOCKWORK_AUDIO: UniverseAudioDef = {
  tempoBpm: 90,
  meter: '4/4 strict civic time',
  buses: CLOCKWORK_AUDIO_BUSES,
  cues: CLOCKWORK_AUDIO_CUES,
  clickMaterialCue: 'clockwork-heart-engage',
  purchaseIntervalCue: 'clockwork-purchase-train',
  criticalAccentCue: 'clockwork-inspected-cycle',
  omenCallCue: 'clockwork-signal-maintenance',
  prestigeCadenceCue: 'clockwork-rewinding-cadence',
  stems: [
    { id: 'clockwork-stem-escapement', kindlingFamily: 'clockwork-tooth-through-clockwork-flywheel', bus: 'music', description: 'Dry escapement, ceramic bearing, and low tuned-metal intervals establish the first train.' },
    { id: 'clockwork-stem-governor', kindlingFamily: 'clockwork-governor-through-clockwork-difference-engine', bus: 'music', description: 'Governor weights and relay clicks enter only when their train completes a cycle.' },
    { id: 'clockwork-stem-city', kindlingFamily: 'clockwork-relay-foundry-through-clockwork-city-of-hours', bus: 'music', description: 'Public bells and punched-paper rhythm assemble the machine into a city.' },
    { id: 'clockwork-stem-causal', kindlingFamily: 'clockwork-causal-engine-through-clockwork-great-regulator', bus: 'music', description: 'Tuned steel and gradually humanized timing reveal the protected exception in the plan.' },
  ],
  silenceState: 'Indexed tooth shapes, route line weights, countdown text, and formula inspection preserve every timing fact.',
  fatiguePolicy: 'Ordinary purchases sound only when their train resolves, touch clicks rate-limit before fatigue, Maintenance Signals duck touch and ambience, and continuous ticking is never used as a progress requirement.',
}
