import { CHALLENGES } from '../../challenges'
import { localizeChallengeText, type ChallengeLanguageContext } from '../../challenge-language'
import type { PureLawValue, TrialDef } from '../types'
import { CLOCKWORK_GENERATORS } from './economy'

const CLOCKWORK_TRIAL_LANGUAGE: ChallengeLanguageContext = {
  id: 'clockwork',
  currency: 'Ticks',
  currencyGlyph: '⌑',
  generators: CLOCKWORK_GENERATORS,
  events: { noun: 'Maintenance Signal' },
}

const NAMES: Readonly<Record<string, readonly [string, string]>> = {
  silence: ['Silent Shift', 'The city learned that a schedule could remain legible when every bell was muted.'],
  entropy: ['Backlash Tax', 'Each poorly meshed tooth charged the future for an error made in the present.'],
  'bare-hands': ['Hand-Wound', 'The first Clockmakers rebuilt a shift with no autonomous train.'],
  drought: ['Missed Service', 'A machine expected its forecast maintenance and received no signal.'],
  'half-light': ['Reduced Torque', 'The civic train survived on one tenth of its designed force.'],
  swarm: ['First Train Only', 'The city asked its three smallest mechanisms to carry every district.'],
  'glass-ceiling': ['Socket Limit', 'No machine could hide scale behind an unbounded private inventory.'],
  'ashen-touch': ['Blunt Tooth', 'The Heart engaged without the leverage its keepers expected.'],
  unwritten: ['Unpatented', 'The city rebuilt without consulting any ordinary refinement.'],
  'broken-ladder': ['Broken Sequence', 'Every second transmission shaft was removed from the plan.'],
  'single-voice': ['Single Shaft', 'Only the highest installed machine was permitted to transmit work.'],
  'small-vessels': ['Ten of Everything', 'The Great Regulator was assembled from a deliberately bounded city.'],
}

const GOALS: Readonly<Record<string, TrialDef['goal']>> = {
  silence: { metricId: 'clockwork-run-ticks', target: 1e9, description: 'Transmit one billion Ticks during the Silent Shift.' },
  entropy: { metricId: 'clockwork-difference-engine-owned', target: 1, description: 'Build one Difference Engine under immediate backlash costs.' },
  'bare-hands': { metricId: 'clockwork-run-ticks', target: 1e6, description: 'Transmit one million Ticks without mechanism transmission.' },
  drought: { metricId: 'clockwork-run-ticks', target: 1e12, description: 'Transmit one trillion Ticks without Maintenance Signals.' },
  'half-light': { metricId: 'clockwork-run-ticks', target: 1e10, description: 'Transmit ten billion Ticks at one-tenth torque.' },
  swarm: { metricId: 'clockwork-run-ticks', target: 1e9, description: 'Transmit one billion Ticks using only Tooth, Cog, and Ratchet.' },
  'glass-ceiling': { metricId: 'clockwork-difference-engine-owned', target: 1, description: 'Build one Difference Engine with every mechanism capped at fifteen.' },
  'ashen-touch': { metricId: 'clockwork-run-ticks', target: 1e12, description: 'Transmit one trillion Ticks with weakened Heart torque.' },
  unwritten: { metricId: 'clockwork-difference-engine-owned', target: 1, description: 'Build one Difference Engine without ordinary upgrades.' },
  'broken-ladder': { metricId: 'clockwork-run-ticks', target: 1e13, description: 'Transmit ten trillion Ticks while even tiers are disconnected.' },
  'single-voice': { metricId: 'clockwork-run-ticks', target: 1e15, description: 'Transmit one quadrillion Ticks using only the highest owned tier.' },
  'small-vessels': { metricId: 'clockwork-great-regulator-owned', target: 1, description: 'Build The Great Regulator with every tier capped at ten.' },
}

export const CLOCKWORK_TRIALS: readonly TrialDef[] = CHALLENGES.map((challenge) => {
  const identity = NAMES[challenge.id]
  const goal = GOALS[challenge.id]
  if (!identity || !goal) throw new Error(`Missing Clockwork trial identity for ${challenge.id}.`)
  return {
    id: `clockwork-trial-${challenge.id}`,
    name: identity[0],
    historicalFailure: identity[1],
    rules: Object.fromEntries(Object.entries(challenge.mods)) as Readonly<Record<string, PureLawValue>>,
    goal,
    rewardEffects: challenge.rewardEffects,
    accessibilityDescription: `${identity[0]}. ${localizeChallengeText(challenge.rules, CLOCKWORK_TRIAL_LANGUAGE)} Goal: ${goal.description} Reward: ${localizeChallengeText(challenge.rewardDesc, CLOCKWORK_TRIAL_LANGUAGE)}.`,
  }
})
