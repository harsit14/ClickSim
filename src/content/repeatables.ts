export type StardustWorkId = 'continuing-corona' | 'parallax-engine'
export type DeepWorkId = 'worldseed-compression' | 'recursive-abyss'

export interface RepeatableWork<Id extends string = string> {
  id: Id
  name: string
  glyph: string
  flavor: string
  effect: string
  baseCost: number
  costGrowth: number
  maxRank: number
}

/**
 * Post-constellation sinks. These ranks belong to the current deep era and are
 * folded away by a Deep Collapse, giving every era a useful Stardust endpoint.
 */
export const STARDUST_WORKS: RepeatableWork<StardustWorkId>[] = [
  {
    id: 'continuing-corona',
    name: 'The Continuing Corona',
    glyph: '✺',
    flavor: 'A constellation with no final star—only another place to draw one.',
    effect: 'all production ×1.30 per rank this deep era',
    baseCost: 4,
    costGrowth: 1.7,
    maxRank: 100,
  },
  {
    id: 'parallax-engine',
    name: 'Parallax Engine',
    glyph: '⟡',
    flavor: 'Every ending gives the Observatory a better angle on the next.',
    effect: 'stardust gain +15% per rank this deep era',
    baseCost: 7,
    costGrowth: 1.85,
    maxRank: 100,
  },
]

/** Permanent within a remembrance: these ranks survive every Deep Collapse. */
export const DEEP_WORKS: RepeatableWork<DeepWorkId>[] = [
  {
    id: 'worldseed-compression',
    name: 'Worldseed Compression',
    glyph: '◆',
    flavor: 'An entire dawn, folded until it fits inside the next first spark.',
    effect: 'all production ×2 per rank until remembrance',
    baseCost: 4,
    costGrowth: 2,
    maxRank: 100,
  },
  {
    id: 'recursive-abyss',
    name: 'The Recursive Abyss',
    glyph: '∞',
    flavor: 'The Deep remembers how much of itself it returned last time.',
    effect: 'Deep Collapse yield +25% per rank until remembrance',
    baseCost: 6,
    costGrowth: 2.25,
    maxRank: 100,
  },
]

export const STARDUST_WORK_BY_ID = new Map(STARDUST_WORKS.map((work) => [work.id, work]))
export const DEEP_WORK_BY_ID = new Map(DEEP_WORKS.map((work) => [work.id, work]))

export function workRank(ranks: Readonly<Record<string, number>>, id: string): number {
  return Math.max(0, Math.floor(ranks[id] ?? 0))
}

export function workCost(work: RepeatableWork, rank: number): number {
  if (rank >= work.maxRank) return Number.POSITIVE_INFINITY
  return Math.min(Number.MAX_SAFE_INTEGER, Math.ceil(work.baseCost * work.costGrowth ** rank))
}

export function stardustProductionMult(ranks: Readonly<Record<string, number>>): number {
  return 1.3 ** workRank(ranks, 'continuing-corona')
}

export function stardustYieldMult(ranks: Readonly<Record<string, number>>): number {
  return 1 + 0.15 * workRank(ranks, 'parallax-engine')
}

export function deepProductionMult(ranks: Readonly<Record<string, number>>): number {
  return 2 ** workRank(ranks, 'worldseed-compression')
}

export function singularityYieldMult(ranks: Readonly<Record<string, number>>): number {
  return 1 + 0.25 * workRank(ranks, 'recursive-abyss')
}

