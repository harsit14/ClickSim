import type { Effect } from './upgrades'

/** The Deep — layer 2. Collapse your gathered stardust into singularities,
 *  and spend them on things no single universe could hold. */
export interface DeepUpgrade {
  id: string
  name: string
  flavor: string
  cost: number // singularities
  desc: string
  /** true if the upgrade adds a toggle the player controls */
  toggle?: boolean
}

export const DEEP_UPGRADES: DeepUpgrade[] = [
  {
    id: 'auto-kindler',
    name: 'Auto-Kindler',
    flavor: 'Hands of the machine, warm as yours.',
    cost: 1,
    desc: 'buys from your chosen Kindling families and priority, every 2s',
    toggle: true,
  },
  {
    id: 'auto-stoker',
    name: 'Auto-Stoker',
    flavor: 'It reads your mind. It buys the obvious.',
    cost: 2,
    desc: 'automatically buys the cheapest available upgrade, every 2s',
    toggle: true,
  },
  {
    id: 'nova-engine',
    name: 'Nova Engine',
    flavor: 'Endings, scheduled.',
    cost: 3,
    desc: 'automatically supernovas when the gain reaches your threshold',
    toggle: true,
  },
  {
    id: 'dawn-memory',
    name: 'Dawn Memory',
    flavor: 'Some mornings refuse to be unmade.',
    cost: 1,
    desc: 'every rebirth begins with 30 {spark} and 3 {wisp}',
  },
  {
    id: 'event-horizon',
    name: 'Event Horizon',
    flavor: 'Nothing escapes. Especially not value.',
    cost: 3,
    desc: 'stardust gain ×1.75',
  },
  {
    id: 'deep-resonance',
    name: 'Deep Resonance',
    flavor: 'The void hums along now.',
    cost: 1,
    desc: 'all light ×2, forever, everywhere',
  },
]

export const DEEP_UPGRADE_BY_ID = new Map(DEEP_UPGRADES.map((u) => [u.id, u]))

/** Deep upgrades that feed the modifier pipeline. */
export const DEEP_EFFECTS: Record<string, Effect[]> = {
  'deep-resonance': [{ kind: 'globalMult', value: 2 }],
}

export const SINGULARITY_COST = 12 // stardust gathered per singularity
export const SINGULARITY_COST_STEPS = [12, 8, 6] as const

/** Deep recovery accelerates after the first two lifetime Singularities. */
export function singularityCostForCount(lifetimeSingularities: number): number {
  const count = Number.isFinite(lifetimeSingularities) ? Math.max(0, Math.floor(lifetimeSingularities)) : 0
  return SINGULARITY_COST_STEPS[Math.min(count, SINGULARITY_COST_STEPS.length - 1)]
}
