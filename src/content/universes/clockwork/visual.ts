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
      sourceIds: ['u4-object-tooth', 'u4-object-cog', 'u4-object-ratchet'],
      threshold: 25,
      resultObjectId: 'u4-object-escapement',
      description: 'Early parts merge into one inspectable escapement train rather than decorative repeated gears.',
    },
    {
      sourceIds: ['u4-object-flywheel', 'u4-object-governor', 'u4-object-clockmaker-automaton'],
      threshold: 50,
      resultObjectId: 'u4-object-relay-foundry',
      description: 'Regulated mechanisms become a staffed Relay Foundry with explicit route lines.',
    },
    {
      sourceIds: ['u4-object-difference-engine', 'u4-object-prediction-mill', 'u4-object-meridian-clock'],
      threshold: 50,
      resultObjectId: 'u4-object-city-of-hours',
      description: 'Computation and public time merge into the inhabited City of Hours.',
    },
    {
      sourceIds: ['u4-object-causal-engine', 'u4-object-world-gear', 'u4-object-last-calendar'],
      threshold: 100,
      resultObjectId: 'u4-object-great-regulator',
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
