export type WayfinderId = 'between-cargo' | 'steady-keel' | 'remembered-kindling'

export interface WayfinderNodeDef {
  id: WayfinderId
  name: string
  glyph: string
  cost: number
  flavor: string
  effect: string
  requires?: WayfinderId
}

export const WAYFINDER_NODES: WayfinderNodeDef[] = [
  {
    id: 'between-cargo',
    name: 'Cargo from the Dark Between',
    glyph: '◆',
    cost: 1,
    flavor: 'The hold comes back heavier than anything you put inside it.',
    effect: 'all production ×1.25 in every universe',
  },
  {
    id: 'steady-keel',
    name: 'Steady Keel',
    glyph: '⌁',
    cost: 1,
    requires: 'between-cargo',
    flavor: 'The Vessel learns which motions belong to the sea and which belong to fear.',
    effect: 'Tidefall’s production swing is 30% gentler',
  },
  {
    id: 'remembered-kindling',
    name: 'Remembered Kindling',
    glyph: '✦',
    cost: 2,
    requires: 'steady-keel',
    flavor: 'A new universe begins with something small from the last one.',
    effect: 'first visits begin with 25 tier-one kindlings',
  },
]

export const WAYFINDER_BY_ID = new Map(WAYFINDER_NODES.map((node) => [node.id, node]))

export function wayfinderNodeAvailable(owned: readonly string[], node: WayfinderNodeDef): boolean {
  return !owned.includes(node.id) && (!node.requires || owned.includes(node.requires))
}

export function wayfinderProductionMult(owned: readonly string[]): number {
  return owned.includes('between-cargo') ? 1.25 : 1
}

export function wayfinderTideAmplitude(owned: readonly string[]): number {
  return owned.includes('steady-keel') ? 0.7 : 1
}

export function wayfinderStartingKindlings(owned: readonly string[]): number {
  return owned.includes('remembered-kindling') ? 25 : 0
}
