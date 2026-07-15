import type { Effect } from './upgrades'
import type { GameState } from '../engine/game.svelte'
import type { GeneratorDef } from './generators'
import type { EconomyAmount } from './universes/types'
import { amountFromNumber, gteAmount } from '../core/numeric/amount'

/** Challenge trials — special runs with a twist, a goal, and a permanent reward.
 *  Started from the Deep. No stardust is earned during a trial. */
export interface ChallengeMods {
  /** overrides every generator's cost growth */
  costMult?: number
  /** scales all production */
  globalScale?: number
  /** generators produce nothing */
  gensDisabled?: boolean
  /** only generators of tier <= maxTier work or can be bought */
  maxTier?: number
  /** no falling stars */
  noStars?: boolean
  /** no music, no combos, no stars */
  silence?: boolean
  /** scales hand-click output without affecting passive production */
  clickScale?: number
  /** upgrades cannot be bought during the trial */
  noUpgrades?: boolean
  /** no generator may be owned above this count */
  maxOwnedPerGen?: number
  /** tiers with this parity neither produce nor can be bought */
  disabledTierParity?: 'odd' | 'even'
  /** only the highest generator tier currently owned produces */
  highestTierOnly?: boolean
}

export interface ChallengeDef {
  id: string
  name: string
  flavor: string
  rules: string
  goalText: string
  goal: (g: GameState, generators: readonly GeneratorDef[]) => boolean
  progress: (g: GameState, generators: readonly GeneratorDef[]) => { current: number | EconomyAmount; target: number | EconomyAmount }
  rewardDesc: string
  rewardEffects: Effect[]
  /** permanent multiplier on all generator costs once completed */
  rewardCostScale?: number
  /** permanent falling-star frequency bonus once completed */
  rewardStarRate?: number
  /** number of earlier trials required before this one is revealed */
  unlockAfter?: number
  mods: ChallengeMods
}

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'silence',
    name: 'The Silence',
    flavor: 'The old universe spent its last eon like this.',
    rules: 'No music. No rhythm. No stars. Just you and the dark.',
    goalText: 'earn ✦1B this run',
    goal: (g) => gteAmount(g.totalEarned, amountFromNumber(1e9)),
    progress: (g) => ({ current: g.totalEarned, target: amountFromNumber(1e9) }),
    rewardDesc: 'clicks ×2, always',
    rewardEffects: [{ kind: 'clickMult', value: 2 }],
    mods: { silence: true, noStars: true },
  },
  {
    id: 'entropy',
    name: 'Entropy',
    flavor: 'Everything costs more, eventually. Here, immediately.',
    rules: 'Generator costs grow at ×1.30 instead of ×1.15.',
    goalText: 'kindle a {sun}',
    goal: (g, generators) => (g.owned[generators[9]?.id ?? 'sun'] ?? 0) >= 1,
    progress: (g, generators) => ({ current: g.owned[generators[9]?.id ?? 'sun'] ?? 0, target: 1 }),
    rewardDesc: 'all generator costs −3%, always',
    rewardEffects: [],
    rewardCostScale: 0.97,
    mods: { costMult: 1.3 },
  },
  {
    id: 'bare-hands',
    name: 'Bare Hands',
    flavor: 'Before the sparks, there was only this.',
    rules: 'Generators produce nothing. Every point of light is clicked.',
    goalText: 'earn ✦1M this run',
    goal: (g) => gteAmount(g.totalEarned, amountFromNumber(1e6)),
    progress: (g) => ({ current: g.totalEarned, target: amountFromNumber(1e6) }),
    rewardDesc: 'clicks gain +2% of light/s, always',
    rewardEffects: [{ kind: 'clickShare', value: 0.02 }],
    mods: { gensDisabled: true },
  },
  {
    id: 'drought',
    name: 'The Drought',
    flavor: 'A sky with nothing left to give.',
    rules: 'No falling stars.',
    goalText: 'earn ✦1T this run',
    goal: (g) => gteAmount(g.totalEarned, amountFromNumber(1e12)),
    progress: (g) => ({ current: g.totalEarned, target: amountFromNumber(1e12) }),
    rewardDesc: 'falling stars 20% more often, always',
    rewardEffects: [],
    rewardStarRate: 0.2,
    mods: { noStars: true },
  },
  {
    id: 'half-light',
    name: 'Half-Light',
    flavor: 'Like working underwater. Like remembering through fog.',
    rules: 'All production ×0.1.',
    goalText: 'earn ✦10B this run',
    goal: (g) => gteAmount(g.totalEarned, amountFromNumber(1e10)),
    progress: (g) => ({ current: g.totalEarned, target: amountFromNumber(1e10) }),
    rewardDesc: 'all light ×1.1, always',
    rewardEffects: [{ kind: 'globalMult', value: 1.1 }],
    mods: { globalScale: 0.1 },
  },
  {
    id: 'swarm',
    name: 'The Swarm',
    flavor: 'No upper sky. No engines. Only the small things, in their millions.',
    rules: 'Only {spark}, {wisp}, and {hearth} function.',
    goalText: 'earn ✦1B this run',
    goal: (g) => gteAmount(g.totalEarned, amountFromNumber(1e9)),
    progress: (g) => ({ current: g.totalEarned, target: amountFromNumber(1e9) }),
    rewardDesc: '{spark}, {wisp}, and {hearth} ×3, always',
    rewardEffects: [
      { kind: 'genMult', gen: 'spark', value: 3 },
      { kind: 'genMult', gen: 'wisp', value: 3 },
      { kind: 'genMult', gen: 'hearth', value: 3 },
    ],
    mods: { maxTier: 3 },
  },
  {
    id: 'glass-ceiling',
    name: 'The Glass Ceiling',
    flavor: 'The sky allows breadth, but refuses abundance.',
    rules: 'No kindling may be owned above 15.',
    goalText: 'kindle a {sun}',
    goal: (g, generators) => (g.owned[generators[9]?.id ?? 'sun'] ?? 0) >= 1,
    progress: (g, generators) => ({ current: g.owned[generators[9]?.id ?? 'sun'] ?? 0, target: 1 }),
    rewardDesc: 'all light ×1.15, always',
    rewardEffects: [{ kind: 'globalMult', value: 1.15 }],
    unlockAfter: 3,
    mods: { maxOwnedPerGen: 15 },
  },
  {
    id: 'ashen-touch',
    name: 'Ashen Touch',
    flavor: 'Your hand remembers being smaller than a spark.',
    rules: 'Clicks produce only 5% of their usual light.',
    goalText: 'earn ✦1T this run',
    goal: (g) => gteAmount(g.totalEarned, amountFromNumber(1e12)),
    progress: (g) => ({ current: g.totalEarned, target: amountFromNumber(1e12) }),
    rewardDesc: 'clicks gain +2% of light/s, always',
    rewardEffects: [{ kind: 'clickShare', value: 0.02 }],
    unlockAfter: 4,
    mods: { clickScale: 0.05 },
  },
  {
    id: 'unwritten',
    name: 'The Unwritten',
    flavor: 'No refinements. No laws. Make a universe without instructions.',
    rules: 'Upgrades cannot be bought.',
    goalText: 'kindle a {sun}',
    goal: (g, generators) => (g.owned[generators[9]?.id ?? 'sun'] ?? 0) >= 1,
    progress: (g, generators) => ({ current: g.owned[generators[9]?.id ?? 'sun'] ?? 0, target: 1 }),
    rewardDesc: 'all light ×1.2, always',
    rewardEffects: [{ kind: 'globalMult', value: 1.2 }],
    unlockAfter: 5,
    mods: { noUpgrades: true },
  },
  {
    id: 'broken-ladder',
    name: 'The Broken Ladder',
    flavor: 'Every second rung was removed. The climb remains.',
    rules: 'Even-numbered generator tiers are silent.',
    goalText: 'earn ✦10T this run',
    goal: (g) => gteAmount(g.totalEarned, amountFromNumber(1e13)),
    progress: (g) => ({ current: g.totalEarned, target: amountFromNumber(1e13) }),
    rewardDesc: 'all generator costs −5%, always',
    rewardEffects: [],
    rewardCostScale: 0.95,
    unlockAfter: 6,
    mods: { disabledTierParity: 'even' },
  },
  {
    id: 'single-voice',
    name: 'The Single Voice',
    flavor: 'A choir becomes a solo whenever a brighter throat opens.',
    rules: 'Only your highest owned generator tier produces.',
    goalText: 'earn ✦1Qa this run',
    goal: (g) => gteAmount(g.totalEarned, amountFromNumber(1e15)),
    progress: (g) => ({ current: g.totalEarned, target: amountFromNumber(1e15) }),
    rewardDesc: 'all light ×1.25, always',
    rewardEffects: [{ kind: 'globalMult', value: 1.25 }],
    unlockAfter: 8,
    mods: { highestTierOnly: true },
  },
  {
    id: 'small-vessels',
    name: 'Small Vessels',
    flavor: 'The infinite, rebuilt from ten of everything.',
    rules: 'No kindling may be owned above 10.',
    goalText: 'kindle {ember2}',
    goal: (g, generators) => (g.owned[generators[17]?.id ?? 'ember2'] ?? 0) >= 1,
    progress: (g, generators) => ({ current: g.owned[generators[17]?.id ?? 'ember2'] ?? 0, target: 1 }),
    rewardDesc: 'all generator resonances ×2, always',
    rewardEffects: [{ kind: 'synergyMult', value: 2 }],
    unlockAfter: 10,
    mods: { maxOwnedPerGen: 10 },
  },
]

export const CHALLENGE_BY_ID = new Map(CHALLENGES.map((c) => [c.id, c]))

export function challengeUnlocked(completed: string[], challenge: ChallengeDef): boolean {
  return completed.length >= (challenge.unlockAfter ?? 0)
}
