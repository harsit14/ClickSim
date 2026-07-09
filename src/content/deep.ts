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
    desc: 'automatically buys the most efficient generator, every 2s',
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
    cost: 2,
    desc: 'every rebirth begins with 40 Sparks and 5 Wisps',
  },
  {
    id: 'event-horizon',
    name: 'Event Horizon',
    flavor: 'Nothing escapes. Especially not value.',
    cost: 4,
    desc: 'stardust gain ×2',
  },
  {
    id: 'deep-resonance',
    name: 'Deep Resonance',
    flavor: 'The void hums along now.',
    cost: 3,
    desc: 'all light ×2, forever, everywhere',
  },
]

export const DEEP_UPGRADE_BY_ID = new Map(DEEP_UPGRADES.map((u) => [u.id, u]))

/** Deep upgrades that feed the modifier pipeline. */
export const DEEP_EFFECTS: Record<string, Effect[]> = {
  'deep-resonance': [{ kind: 'globalMult', value: 2 }],
}

export const SINGULARITY_COST = 20 // stardust gathered per singularity
