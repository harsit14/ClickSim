import type { GameState } from '../engine/game.svelte'
import type { EconomyAmount } from './universes/types'
import {
  amountFromNumber,
  amountToNumber,
  divideAmounts,
  gteAmount,
  minAmount,
} from '../core/numeric/amount'

export type VesselPartId =
  | 'hull-hearths'
  | 'sails-constellation'
  | 'heart-sun'
  | 'keel-trials'
  | 'archive'

interface VesselPartBase {
  id: VesselPartId
  name: string
  short: string
  flavor: string
  requirement: string
  hue: number
  action: string
  consumes?: { gen: string; count: number }
}

export interface VesselAmountPartDef extends VesselPartBase {
  progressKind: 'amount'
  target: EconomyAmount
  current: (g: GameState) => EconomyAmount
}

export interface VesselCountPartDef extends VesselPartBase {
  progressKind: 'count'
  target: number
  current: (g: GameState) => number
}

export type VesselPartDef = VesselAmountPartDef | VesselCountPartDef

export const VESSEL_REVEAL_AT = amountFromNumber(1e21)

export const VESSEL_PARTS: VesselPartDef[] = [
  {
    id: 'hull-hearths',
    name: 'Hull of Hearths',
    short: 'Hull',
    flavor: 'A thousand warm places, bent into one shelter.',
    requirement: '1e24 light this era',
    hue: 24,
    progressKind: 'amount',
    target: amountFromNumber(1e24),
    action: 'set the hull',
    current: (g) => g.eraEarned,
  },
  {
    id: 'sails-constellation',
    name: 'Sails of Constellation',
    short: 'Sails',
    flavor: 'Charts that learned to pull against the dark.',
    requirement: '9 constellation nodes',
    hue: 214,
    progressKind: 'count',
    target: 9,
    action: 'raise the sails',
    current: (g) => g.constellation.length,
  },
  {
    id: 'heart-sun',
    name: 'Heart of a Sun',
    short: 'Heart',
    flavor: 'A star given up so the vessel may keep beating.',
    requirement: '100 Suns to sacrifice',
    hue: 48,
    progressKind: 'count',
    target: 100,
    action: 'give 100 Suns',
    consumes: { gen: 'sun', count: 100 },
    current: (g) => g.owned['sun'] ?? 0,
  },
  {
    id: 'keel-trials',
    name: 'Keel of Trials',
    short: 'Keel',
    flavor: 'Every rehearsal becomes a rib of the ship.',
    requirement: '4 trials completed',
    hue: 12,
    progressKind: 'count',
    target: 4,
    action: 'lay the keel',
    current: (g) => g.challengesDone.length,
  },
  {
    id: 'archive',
    name: 'The Archive',
    short: 'Archive',
    flavor: 'Lumen will not let you cross alone.',
    requirement: 'an answer chosen',
    hue: 260,
    progressKind: 'count',
    target: 1,
    action: 'bring the archive',
    current: (g) => g.ending === null ? 0 : 1,
  },
]

export const VESSEL_PART_BY_ID = new Map(VESSEL_PARTS.map((p) => [p.id, p]))

export function vesselRevealed(g: GameState): boolean {
  return g.vesselParts.length > 0 || gteAmount(g.allTimeEarned, VESSEL_REVEAL_AT) || g.ending !== null
}

export function vesselPartComplete(g: GameState, id: VesselPartId): boolean {
  return g.vesselParts.includes(id)
}

export function vesselPartCurrent(g: GameState, part: VesselPartDef): EconomyAmount | number {
  return part.progressKind === 'amount'
    ? minAmount(part.current(g), part.target)
    : Math.min(part.current(g), part.target)
}

export function vesselPartReady(g: GameState, part: VesselPartDef): boolean {
  const ready = part.progressKind === 'amount'
    ? gteAmount(part.current(g), part.target)
    : part.current(g) >= part.target
  return !vesselPartComplete(g, part.id) && ready
}

export function vesselProgress(g: GameState, part: VesselPartDef): number {
  if (part.progressKind === 'count') return Math.min(1, part.current(g) / part.target)
  const ratio = divideAmounts(part.current(g), part.target)
  return ratio.exponent >= 0 ? 1 : Math.min(1, amountToNumber(ratio))
}

export function vesselComplete(g: GameState): boolean {
  return VESSEL_PARTS.every((part) => vesselPartComplete(g, part.id))
}

export function vesselHasReadyPart(g: GameState): boolean {
  return VESSEL_PARTS.some((part) => vesselPartReady(g, part))
}

export function vesselBuiltCount(g: GameState): number {
  return VESSEL_PARTS.filter((part) => vesselPartComplete(g, part.id)).length
}

export function vesselStage(g: GameState): string {
  const count = vesselBuiltCount(g)
  if (count === 0) return 'a shape under scaffolds'
  if (count < VESSEL_PARTS.length) return 'a vessel being remembered'
  return 'a quiet ark, ready at the edge'
}
