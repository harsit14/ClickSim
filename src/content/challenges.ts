import type { Effect } from './upgrades'
import type { GameState } from '../engine/game.svelte'

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
}

export interface ChallengeDef {
  id: string
  name: string
  flavor: string
  rules: string
  goalText: string
  goal: (g: GameState) => boolean
  progress: (g: GameState) => { current: number; target: number }
  rewardDesc: string
  rewardEffects: Effect[]
  /** permanent multiplier on all generator costs once completed */
  rewardCostScale?: number
  /** permanent falling-star frequency bonus once completed */
  rewardStarRate?: number
  mods: ChallengeMods
}

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'silence',
    name: 'The Silence',
    flavor: 'The old universe spent its last eon like this.',
    rules: 'No music. No rhythm. No stars. Just you and the dark.',
    goalText: 'earn ✦1B this run',
    goal: (g) => g.totalEarned >= 1e9,
    progress: (g) => ({ current: g.totalEarned, target: 1e9 }),
    rewardDesc: 'clicks ×2, always',
    rewardEffects: [{ kind: 'clickMult', value: 2 }],
    mods: { silence: true, noStars: true },
  },
  {
    id: 'entropy',
    name: 'Entropy',
    flavor: 'Everything costs more, eventually. Here, immediately.',
    rules: 'Generator costs grow at ×1.30 instead of ×1.15.',
    goalText: 'kindle a Sun',
    goal: (g) => (g.owned['sun'] ?? 0) >= 1,
    progress: (g) => ({ current: g.owned['sun'] ?? 0, target: 1 }),
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
    goal: (g) => g.totalEarned >= 1e6,
    progress: (g) => ({ current: g.totalEarned, target: 1e6 }),
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
    goal: (g) => g.totalEarned >= 1e12,
    progress: (g) => ({ current: g.totalEarned, target: 1e12 }),
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
    goal: (g) => g.totalEarned >= 1e10,
    progress: (g) => ({ current: g.totalEarned, target: 1e10 }),
    rewardDesc: 'all light ×1.1, always',
    rewardEffects: [{ kind: 'globalMult', value: 1.1 }],
    mods: { globalScale: 0.1 },
  },
  {
    id: 'swarm',
    name: 'The Swarm',
    flavor: 'No suns. No forges. Only the small things, in their millions.',
    rules: 'Only Sparks, Wisps, and Hearths function.',
    goalText: 'earn ✦1B this run',
    goal: (g) => g.totalEarned >= 1e9,
    progress: (g) => ({ current: g.totalEarned, target: 1e9 }),
    rewardDesc: 'Sparks, Wisps, and Hearths ×3, always',
    rewardEffects: [
      { kind: 'genMult', gen: 'spark', value: 3 },
      { kind: 'genMult', gen: 'wisp', value: 3 },
      { kind: 'genMult', gen: 'hearth', value: 3 },
    ],
    mods: { maxTier: 3 },
  },
]

export const CHALLENGE_BY_ID = new Map(CHALLENGES.map((c) => [c.id, c]))
