import type { UniverseVisualManifest } from '../types'
import {
  CLOCKWORK_BEACON_OBJECT,
  CLOCKWORK_KINDLING_OBJECTS,
  CLOCKWORK_PATENT_OBJECTS,
  CLOCKWORK_SIGNAL_OBJECTS,
} from './manifests'

export const CLOCKWORK_VISUAL: UniverseVisualManifest = {
  materials: ['brass', 'blued steel', 'ceramic bearing', 'clock glass', 'oil', 'punched paper', 'tensioned spring', 'engraved ivory substitute'],
  primarySilhouettes: ['meaningful-tooth gear', 'anchor escapement', 'cam profile', 'centrifugal governor', 'public clock tower', 'one-way linkage', 'astronomical clock'],
  motionGrammar: ['still', 'mechanical', 'waveform', 'authored'],
  zones: {
    heart: { purpose: 'The Escapement Heart and cadence mechanism remain fully inspectable at the center.', maximumInteractiveObjects: 2, motionFrequency: 'medium' },
    near: { purpose: 'The power train, early machines, and reachable Maintenance Signals expose sockets and load.', maximumInteractiveObjects: 3, motionFrequency: 'high' },
    far: { purpose: 'Computation, prediction, relay, and Patent Ledger mechanisms form the civic machine.', maximumInteractiveObjects: 3, motionFrequency: 'medium' },
    horizon: { purpose: 'The City of Hours, causal machinery, Last Calendar, Great Regulator, and Beacon define the skyline.', maximumInteractiveObjects: 2, motionFrequency: 'low' },
  },
  objects: [
    ...CLOCKWORK_KINDLING_OBJECTS,
    ...CLOCKWORK_PATENT_OBJECTS,
    ...CLOCKWORK_SIGNAL_OBJECTS,
    CLOCKWORK_BEACON_OBJECT,
  ],
  densityMerges: [
    {
      sourceIds: ['clockwork-object-tooth', 'clockwork-object-cog', 'clockwork-object-ratchet'],
      threshold: 25,
      resultObjectId: 'clockwork-object-escapement',
      description: 'Early parts merge into one inspectable escapement train rather than decorative repeated gears.',
    },
    {
      sourceIds: ['clockwork-object-flywheel', 'clockwork-object-governor', 'clockwork-object-clockmaker-automaton'],
      threshold: 50,
      resultObjectId: 'clockwork-object-relay-foundry',
      description: 'Regulated mechanisms become a staffed Relay Foundry with explicit route lines.',
    },
    {
      sourceIds: ['clockwork-object-difference-engine', 'clockwork-object-prediction-mill', 'clockwork-object-meridian-clock'],
      threshold: 50,
      resultObjectId: 'clockwork-object-city-of-hours',
      description: 'Computation and public time merge into the inhabited City of Hours.',
    },
    {
      sourceIds: ['clockwork-object-causal-engine', 'clockwork-object-world-gear', 'clockwork-object-last-calendar'],
      threshold: 100,
      resultObjectId: 'clockwork-object-great-regulator',
      description: 'Causality, world torque, and the protected blank date resolve into The Great Regulator.',
    },
  ],
  attentionBudget: {
    primaryTargets: 1,
    secondaryInteractiveObjects: 3,
    temporaryRewardEffects: 2,
    storySubtitles: 1,
    majorPanels: 1,
  },
}
