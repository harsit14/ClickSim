import type { UniverseAccessibilityDef } from '../types'
import {
  CLOCKWORK_KINDLING_OBJECTS,
  CLOCKWORK_SIGNAL_OBJECTS,
} from './manifests'

export const CLOCKWORK_ACCESSIBILITY: UniverseAccessibilityDef = {
  heartLabel: 'Escapement Heart, Heart of Clockwork; route Ticks',
  currencyLabel: 'Ticks, Clockwork World currency',
  screenReaderOrder: [
    'clockwork-escapement-heart',
    'clockwork-route-inspector',
    'clockwork-maintenance-timeline',
    ...CLOCKWORK_KINDLING_OBJECTS.map(({ id }) => id),
    ...CLOCKWORK_SIGNAL_OBJECTS.map(({ id }) => id),
    'clockwork-patent-ledger',
    'clockwork-clockwork-beacon',
  ],
  announcements: [
    { messageKey: 'clockwork.announcement.route-change', politeness: 'polite', dedupeKey: 'clockwork-route-change', minimumIntervalMs: 700 },
    { messageKey: 'clockwork.announcement.maintenance-forecast', politeness: 'polite', dedupeKey: 'clockwork-maintenance-forecast', minimumIntervalMs: 2_000 },
    { messageKey: 'clockwork.announcement.maintenance-active', politeness: 'assertive', dedupeKey: 'clockwork-maintenance-active', minimumIntervalMs: 1_000 },
    { messageKey: 'clockwork.announcement.rewinding', politeness: 'polite', dedupeKey: 'clockwork-rewinding', minimumIntervalMs: 3_000 },
  ],
  nonColorSignals: [
    { stateId: 'clockwork-route-power', text: 'Power route', shape: 'solid forward shaft arrow', pattern: 'continuous heavy line', highContrastTreatment: 'double black-and-white shaft with P label' },
    { stateId: 'clockwork-route-cadence', text: 'Cadence route', shape: 'three evenly spaced escapement teeth', pattern: 'short equal dash sequence', highContrastTreatment: 'white tooth marks with C label' },
    { stateId: 'clockwork-route-efficiency', text: 'Efficiency route', shape: 'nested bearing rings', pattern: 'double parallel line', highContrastTreatment: 'outlined rings with E label' },
    { stateId: 'clockwork-route-inactive', text: 'Route inactive', shape: 'open clutch ends', pattern: 'broken line with square gap', highContrastTreatment: 'large central gap and inactive text' },
    { stateId: 'clockwork-route-overload', text: 'Socket or load limit reached', shape: 'raised governor weights', pattern: 'crosshatched warning frame', highContrastTreatment: 'strong X frame and exact limit text' },
    { stateId: 'clockwork-signal-forecast', text: 'Maintenance Signal forecast', shape: 'boxed clock with countdown teeth', pattern: 'numbered remaining intervals', highContrastTreatment: 'white frame, black inset, absolute start time' },
    { stateId: 'clockwork-signal-active', text: 'Maintenance Signal active', shape: 'closed service frame', pattern: 'solid border and remaining-time notches', highContrastTreatment: 'double outline and countdown text' },
    { stateId: 'clockwork-heart-transmit', text: 'Tick transmitted', shape: 'engage, release, forward arrow', pattern: 'three numbered positions', highContrastTreatment: 'local white tooth and strong output arrow' },
  ],
  timing: {
    visualCue: 'A numbered escapement tooth reaches the fixed release mark.',
    audioCue: 'One tuned metal engagement accompanies but never solely communicates the accepted interval.',
    shapeCue: 'Engage, release, and transmit appear as three fixed indexed shapes.',
    averagedModeAvailable: true,
    averagedRewardRatio: [0.85, 0.9],
  },
  muted: {
    fullGameplayEquivalent: true,
    captions: ['Route type, source, destination, and exact formula', 'Maintenance Signal absolute start and remaining time', 'Train completion', 'Rewinding phase and Mainspring gain'],
  },
  reducedMotion: {
    fullGameplayEquivalent: true,
    replacementStrategy: 'static-pose',
    timingInformationPreserved: true,
  },
  lowQuality: {
    fullGameplayEquivalent: true,
    preservesHitTargets: true,
    preservesStateLabels: true,
  },
}
