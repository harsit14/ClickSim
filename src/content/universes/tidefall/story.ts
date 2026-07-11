import { CHALLENGES } from '../../challenges'
import { localizeChallengeText } from '../../challenge-language'
import { TIDEFALL } from '../tidefall'
import type { PureLawValue, StorySceneDef, TrialDef } from '../types'

interface TidefallTrialIdentity {
  readonly name: string
  readonly historicalFailure: string
  readonly goal: TrialDef['goal']
}

const TIDEFALL_TRIAL_IDENTITIES: Readonly<Record<string, TidefallTrialIdentity>> = {
  silence: {
    name: 'The Stillwater',
    historicalFailure: 'No rhythm crossed water that had forgotten how to move.',
    goal: { metricId: 'run-glow', target: 1e9, description: 'Surface one billion Glow in the silent current.' },
  },
  entropy: {
    name: 'Salt Debt',
    historicalFailure: 'Everything carried by the current left something costly behind.',
    goal: { metricId: 'sun-owned', target: 1, description: 'Surface one Drowned Beacon under accelerated cost growth.' },
  },
  'bare-hands': {
    name: 'Open Water',
    historicalFailure: 'Before the first Droplet, one keeper faced the depth with only a hand.',
    goal: { metricId: 'run-glow', target: 1e6, description: 'Surface one million Glow without formation flow.' },
  },
  drought: {
    name: 'The Empty Current',
    historicalFailure: 'The old sea waited for a blessing that never rose.',
    goal: { metricId: 'run-glow', target: 1e12, description: 'Surface one trillion Glow without Omens.' },
  },
  'half-light': {
    name: 'Crushing Depth',
    historicalFailure: 'Production thinned until pressure became a world of its own.',
    goal: { metricId: 'run-glow', target: 1e10, description: 'Surface ten billion Glow at one-tenth production.' },
  },
  swarm: {
    name: 'The Shoal',
    historicalFailure: 'No great body survived; only small lights agreed to move together.',
    goal: { metricId: 'run-glow', target: 1e9, description: 'Surface one billion Glow using only Droplet, Ripple, and Tidepool.' },
  },
  'glass-ceiling': {
    name: 'The Surface Seal',
    historicalFailure: 'The sea allowed breadth but refused another layer.',
    goal: { metricId: 'sun-owned', target: 1, description: 'Surface one Drowned Beacon with every formation capped at fifteen.' },
  },
  'ashen-touch': {
    name: 'Numb Current',
    historicalFailure: 'The keeper’s hand remembered how cold the deepest water could become.',
    goal: { metricId: 'run-glow', target: 1e12, description: 'Surface one trillion Glow with weakened touch output.' },
  },
  unwritten: {
    name: 'The Uncharted',
    historicalFailure: 'No law survived long enough to become a map.',
    goal: { metricId: 'sun-owned', target: 1, description: 'Surface one Drowned Beacon without ordinary adaptations.' },
  },
  'broken-ladder': {
    name: 'Broken Sounding',
    historicalFailure: 'Every second depth marker returned without its line.',
    goal: { metricId: 'run-glow', target: 1e13, description: 'Surface ten trillion Glow while even tiers are silent.' },
  },
  'single-voice': {
    name: 'The Deepest Voice',
    historicalFailure: 'Only the lowest call could be heard through all that pressure.',
    goal: { metricId: 'run-glow', target: 1e15, description: 'Surface one quadrillion Glow with only the highest owned tier producing.' },
  },
  'small-vessels': {
    name: 'Tidepools',
    historicalFailure: 'The old ocean tried to survive inside ten of everything.',
    goal: { metricId: 'second-ember-owned', target: 1, description: 'Surface The Second Wave with every formation capped at ten.' },
  },
}

export const TIDEFALL_TRIALS: readonly TrialDef[] = CHALLENGES.map((challenge) => {
  const identity = TIDEFALL_TRIAL_IDENTITIES[challenge.id]
  if (!identity) throw new Error(`Missing Tidefall Pressure Trial identity for ${challenge.id}.`)
  return {
    id: challenge.id,
    name: identity.name,
    historicalFailure: identity.historicalFailure,
    rules: Object.fromEntries(Object.entries(challenge.mods)) as Readonly<Record<string, PureLawValue>>,
    goal: identity.goal,
    rewardEffects: challenge.rewardEffects,
    accessibilityDescription: `${identity.name}. ${localizeChallengeText(challenge.rules, TIDEFALL)} Goal: ${identity.goal.description} Reward: ${localizeChallengeText(challenge.rewardDesc, TIDEFALL)}.`,
  }
})

export const TIDEFALL_STORY_SCENES: readonly StorySceneDef[] = [
  { id: 'tidefall-arrival-moonless-surface', kind: 'arrival', skippableAfterFirstView: true, replayable: true },
  { id: 'tidefall-undertow-first-return', kind: 'epoch', skippableAfterFirstView: true, replayable: true },
  { id: 'tidefall-hadal-archive-descent', kind: 'deep', skippableAfterFirstView: true, replayable: true },
  { id: 'tidefall-shoreless-lighthouse', kind: 'beacon', skippableAfterFirstView: true, replayable: true },
  { id: 'tidefall-missing-moon-record', kind: 'transmission', skippableAfterFirstView: true, replayable: true },
  { id: 'tidefall-trench-learns-rhythm', kind: 'transmission', skippableAfterFirstView: true, replayable: true },
]
