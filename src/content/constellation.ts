import type { Effect } from './upgrades'

export type PerkKind =
  | 'starRate' // falling stars come more often (fraction faster)
  | 'starDuration' // star buffs last longer (fraction)
  | 'starPair' // chance a caught star calls another
  | 'offline' // added offline efficiency (fraction, base 0.5)
  | 'offlineCap' // added offline cap (hours, base 6)
  | 'comboWindow' // added beat window (seconds)
  | 'headStart' // sparks granted at each rebirth

export interface Perk {
  kind: PerkKind
  value: number
  desc: string
}

export interface StarNode {
  id: string
  name: string
  flavor: string
  cost: number // stardust
  branch: 'forge' | 'hand' | 'sky' | 'root' | 'crown'
  x: number // map coords, 0–100
  y: number // map coords, 0–70
  requires: string[]
  effects: Effect[]
  perks: Perk[]
}

const N = (
  branch: StarNode['branch'],
  id: string,
  name: string,
  flavor: string,
  cost: number,
  x: number,
  y: number,
  requires: string[],
  effects: Effect[],
  perks: Perk[] = [],
): StarNode => ({ id, name, flavor, cost, branch, x, y, requires, effects, perks })

export const CONSTELLATION: StarNode[] = [
  // ── The Forge — raw production ──────────────────────────────────────
  N('forge', 'forge-1', 'Anvil of Dawn', 'The first tool of the next universe.', 1, 20, 50, [],
    [{ kind: 'globalMult', value: 1.5 }]),
  N('forge', 'forge-2', 'Twin Bellows', 'Breathe in. Breathe out. Brighter.', 2, 12, 40, ['forge-1'],
    [{ kind: 'globalMult', value: 2 }]),
  N('forge', 'forge-3', 'Star Foundry', 'Mass production, in the oldest sense.', 5, 16, 28, ['forge-2'],
    [{ kind: 'globalMult', value: 3 }]),

  // ── The Hand — clicking ─────────────────────────────────────────────
  N('hand', 'hand-1', 'First Touch', 'The universe remembers being touched kindly.', 1, 78, 52, [],
    [{ kind: 'clickMult', value: 3 }]),
  N('hand', 'hand-2', 'Lightning Palm', 'Your hand, but faster than thought.', 2, 86, 42, ['hand-1'],
    [{ kind: 'clickShare', value: 0.02 }]),
  N('hand', 'hand-3', 'The Conductor', 'The music watches your hand now.', 4, 82, 30, ['hand-2'],
    [{ kind: 'clickMult', value: 2 }],
    [{ kind: 'comboWindow', value: 0.04, desc: 'the beat window widens by 40ms' }]),

  // ── The Sky — falling stars ─────────────────────────────────────────
  N('sky', 'sky-1', 'Open Window', 'Leave it ajar. Things fall in.', 1, 50, 18, [],
    [],
    [{ kind: 'starRate', value: 0.3, desc: 'falling stars come 30% more often' }]),
  N('sky', 'sky-2', 'Long Tails', 'Wishes with stamina.', 3, 40, 10, ['sky-1'],
    [],
    [{ kind: 'starDuration', value: 0.5, desc: 'star blessings last 50% longer' }]),
  N('sky', 'sky-3', 'Meteor Season', 'They travel in flocks, given a reason.', 6, 60, 8, ['sky-1'],
    [],
    [{ kind: 'starPair', value: 0.35, desc: 'caught stars have a 35% chance to call another' }]),

  // ── The Root — patience & rebirth ───────────────────────────────────
  N('root', 'root-1', 'Deep Coals', 'Banked overnight. Warm by morning.', 1, 50, 58, [],
    [],
    [{ kind: 'offline', value: 0.25, desc: 'offline light: 50% → 75% of full rate' }]),
  N('root', 'root-2', 'Patient Fire', 'It can wait much longer than you.', 3, 42, 64, ['root-1'],
    [],
    [{ kind: 'offlineCap', value: 6, desc: 'offline cap: 6h → 12h' }]),
  N('root', 'root-3', 'Ember Memory', 'Some sparks refuse to be unmade.', 5, 58, 66, ['root-1'],
    [],
    [{ kind: 'headStart', value: 25, desc: 'begin each rebirth with 25 Sparks' }]),

  // ── The Crown ───────────────────────────────────────────────────────
  N('crown', 'corona', 'Corona', 'What a sun wears when it has earned it.', 12, 50, 36, ['forge-3', 'hand-3'],
    [{ kind: 'globalMult', value: 4 }]),
]

export const NODE_BY_ID = new Map(CONSTELLATION.map((n) => [n.id, n]))

/** Sum of a perk kind across owned nodes. */
export function perkBonus(owned: string[], kind: PerkKind): number {
  let sum = 0
  for (const id of owned) {
    const node = NODE_BY_ID.get(id)
    if (!node) continue
    for (const p of node.perks) if (p.kind === kind) sum += p.value
  }
  return sum
}

export function nodeAvailable(owned: string[], node: StarNode): boolean {
  return node.requires.every((r) => owned.includes(r))
}
