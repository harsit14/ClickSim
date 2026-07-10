import type { EconomyAmount, UniverseId } from './universes/types'
import {
  amountFromNumber,
  ceilAmount,
  multiplyAmounts,
  powAmount,
} from '../core/numeric/amount'

export interface SuccessionRelay {
  readonly id: string
  readonly sourceUniverseId: UniverseId
  readonly targetUniverseId: UniverseId
  readonly name: string
  readonly description: string
  readonly sourceGift: string
}

export const SUCCESSION_RELAYS: readonly SuccessionRelay[] = [
  {
    id: 'relay-emberlight-tidefall',
    sourceUniverseId: 'emberlight',
    targetUniverseId: 'tidefall',
    name: 'Heat Below the Tide',
    description: 'Banked Emberlight keeps Tidefall’s first currents warm enough to move.',
    sourceGift: 'spent Singularity pressure becomes +12% Tidefall production per rank',
  },
  {
    id: 'relay-tidefall-verdance',
    sourceUniverseId: 'tidefall',
    targetUniverseId: 'verdance',
    name: 'The Rain Treaty',
    description: 'Moonless water crosses ahead and teaches the next roots how to return.',
    sourceGift: 'spent trench pressure becomes +12% Verdance production per rank',
  },
  {
    id: 'relay-verdance-clockwork',
    sourceUniverseId: 'verdance',
    targetUniverseId: 'clockwork',
    name: 'Living Escapement',
    description: 'Patient wood gives Clockwork a flexing tooth that never jams.',
    sourceGift: 'spent root pressure becomes +12% Clockwork production per rank',
  },
  {
    id: 'relay-clockwork-prismata',
    sourceUniverseId: 'clockwork',
    targetUniverseId: 'prismata',
    name: 'Calibrated Aperture',
    description: 'A civic clock opens Prismata’s lens at exactly the inspected angle.',
    sourceGift: 'spent mainspring pressure becomes +12% Prismata production per rank',
  },
  {
    id: 'relay-prismata-tempest',
    sourceUniverseId: 'prismata',
    targetUniverseId: 'tempest',
    name: 'Charged Spectrum',
    description: 'Separated wavelengths seed distinct charge layers inside the next storm.',
    sourceGift: 'spent facet pressure becomes +12% Tempest production per rank',
  },
  {
    id: 'relay-tempest-canticle',
    sourceUniverseId: 'tempest',
    targetUniverseId: 'canticle',
    name: 'Thunder’s Downbeat',
    description: 'A bounded discharge arrives in Canticle as the first beat of the measure.',
    sourceGift: 'spent storm pressure becomes +12% Canticle production per rank',
  },
]

export const SUCCESSION_RELAY_BY_ID = new Map(SUCCESSION_RELAYS.map((relay) => [relay.id, relay]))
export const MAX_SUCCESSION_RELAY_RANK = 100

export function successionRelayRank(ranks: Readonly<Record<string, number>>, relayId: string): number {
  return Math.max(0, Math.min(MAX_SUCCESSION_RELAY_RANK, Math.floor(ranks[relayId] ?? 0)))
}

export function successionRelayCost(rank: number): EconomyAmount | null {
  const cleanRank = Math.max(0, Math.floor(rank))
  if (cleanRank >= MAX_SUCCESSION_RELAY_RANK) return null
  return ceilAmount(multiplyAmounts(amountFromNumber(5), powAmount(amountFromNumber(1.8), cleanRank)))
}

export function successionRelayForTarget(targetUniverseId: string): SuccessionRelay | null {
  return SUCCESSION_RELAYS.find((relay) => relay.targetUniverseId === targetUniverseId) ?? null
}

export function successionRelayMultiplier(
  targetUniverseId: string,
  ranks: Readonly<Record<string, number>> | undefined,
  vaultPurchases: readonly string[] = [],
): number {
  const relay = successionRelayForTarget(targetUniverseId)
  if (!relay || !ranks) return 1
  const perRank = vaultPurchases.includes('utility-relay-lens') ? 0.15 : 0.12
  return 1 + successionRelayRank(ranks, relay.id) * perRank
}

export type LumenVaultItemKind = 'lore' | 'skin' | 'utility'

export interface LumenVaultItem {
  readonly id: string
  readonly kind: LumenVaultItemKind
  readonly name: string
  readonly glyph: string
  readonly cost: number
  readonly description: string
  readonly lore?: string
  readonly themeId?: string
  readonly productionMultiplier?: number
}

export const LUMEN_VAULT_ITEMS: readonly LumenVaultItem[] = [
  {
    id: 'lore-first-margin', kind: 'lore', name: 'The First Margin', glyph: '⌜', cost: 1,
    description: 'A page Lumen wrote before the Last Ember woke.',
    lore: 'Archive note zero: I was not made to remember everything. I volunteered after the first name vanished.',
  },
  {
    id: 'lore-seventh-witness', kind: 'lore', name: 'The Seventh Witness', glyph: 'Ⅶ', cost: 1,
    description: 'The same silhouette, recorded independently by every restored sky.',
    lore: 'Seven worlds disagreed about matter, time, color, weather, and song. All seven drew the Devourer with an empty place where a face should be.',
  },
  {
    id: 'lore-name-before-lumen', kind: 'lore', name: 'Before “Lumen”', glyph: '¶', cost: 1,
    description: 'A damaged signature from the old archive.',
    lore: 'My first name meant “the room where testimony waits.” Lumen is shorter. You chose it during a universe neither of us can restore.',
  },
  {
    id: 'lore-absent-eighth', kind: 'lore', name: 'The Absent Eighth', glyph: '∞', cost: 2,
    description: 'A route the Atlas refuses to classify as a universe.',
    lore: 'There is no eighth world. There is a space made by seven worlds declining to become one. The Garden calls that space freedom.',
  },
  {
    id: 'skin-aurora-archive', kind: 'skin', name: 'Aurora Archive', glyph: '◒', cost: 2,
    description: 'A cool auroral vestment with a living green edge.', themeId: 'aurora-archive',
  },
  {
    id: 'skin-eclipse-gold', kind: 'skin', name: 'Eclipse Gold', glyph: '◐', cost: 2,
    description: 'A black-gold Heart vestment cut from the edge of a total eclipse.', themeId: 'eclipse-gold',
  },
  {
    id: 'skin-chorusglass', kind: 'skin', name: 'Chorusglass', glyph: '◉', cost: 2,
    description: 'A silver-pink vestment that holds several universe accents at once.', themeId: 'chorusglass',
  },
  {
    id: 'utility-archive-resonator', kind: 'utility', name: 'Archive Resonator', glyph: '⌁', cost: 3,
    description: 'Every recovered world hums through one shared instrument: all production ×1.10.', productionMultiplier: 1.1,
  },
  {
    id: 'utility-relay-lens', kind: 'utility', name: 'Relay Lens', glyph: '◇', cost: 4,
    description: 'Makes every Succession Relay rank worth +15% instead of +12%.',
  },
]

export const LUMEN_VAULT_ITEM_BY_ID = new Map(LUMEN_VAULT_ITEMS.map((item) => [item.id, item]))
export const LUMEN_SHARD_GLYPH = '✥'
export const LUMEN_SHARD_NAME = 'Lumen Shard'
export const MAX_LUMEN_DISTILLATIONS_PER_UNIVERSE = 3

export function lumenVaultProductionMultiplier(purchases: readonly string[] | undefined): number {
  if (!purchases) return 1
  return LUMEN_VAULT_ITEMS.reduce(
    (multiplier, item) => purchases.includes(item.id) ? multiplier * (item.productionMultiplier ?? 1) : multiplier,
    1,
  )
}

export function lumenDistillationCost(count: number): EconomyAmount | null {
  const clean = Math.max(0, Math.floor(count))
  if (clean >= MAX_LUMEN_DISTILLATIONS_PER_UNIVERSE) return null
  return multiplyAmounts(amountFromNumber(1e6), powAmount(amountFromNumber(10), clean))
}

export function lumenClaimIds(): readonly string[] {
  return (['emberlight', 'tidefall', 'verdance', 'clockwork', 'prismata', 'tempest', 'canticle'] as const)
    .flatMap((id) => [`beacon-${id}`, `atlas-${id}`])
}
