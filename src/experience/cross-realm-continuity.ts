import {
  SUCCESSION_RELAYS,
  successionRelayMultiplier,
  successionRelayRank,
} from '../content/legacy-exchange'
import { universeById } from '../content/universes'
import type { UniverseId } from '../content/universes/types'

export interface RealmLawStatement {
  readonly universeId: UniverseId
  readonly sentence: string
  readonly practice: string
}

export const REALM_LAW_STATEMENTS: Readonly<Record<UniverseId, RealmLawStatement>> = {
  emberlight: {
    universeId: 'emberlight',
    sentence: 'Here, light steadies. Kindle to build; Supernova to carry dust forward.',
    practice: 'steady growth · deliberate ending',
  },
  tidefall: {
    universeId: 'tidefall',
    sentence: 'Here, growth tides. Surf the crest; Undertow returns Moon Salt.',
    practice: 'watch the waterline · return with the tide',
  },
  verdance: {
    universeId: 'verdance',
    sentence: 'Here, growth ages. Cultivate patiently; Pruning is how memory is kept.',
    practice: 'let cohorts mature · prune for memory',
  },
  clockwork: {
    universeId: 'clockwork',
    sentence: 'Here, growth routes. Follow dependencies; Recomposition keeps the working schedule.',
    practice: 'read the linkage · route before improving',
  },
  brahmalok: {
    universeId: 'brahmalok',
    sentence: 'Here, possibility unfolds. Balance seed, measure, name, and form; Renewal keeps revision open.',
    practice: 'balance the mandala · leave the center open',
  },
  vishnulok: {
    universeId: 'vishnulok',
    sentence: 'Here, growth circulates. Sustain the return; Restoration keeps every refuge connected.',
    practice: 'make a correction · complete the return',
  },
  kailash: {
    universeId: 'kailash',
    sentence: 'Here, growth releases. Prepare refuge first; Release keeps a path back to ordinary life.',
    practice: 'shelter before change · leave a path down',
  },
}

export function realmLawStatement(universeId: UniverseId): RealmLawStatement {
  return REALM_LAW_STATEMENTS[universeId]
}

export interface CrossingMemoryTransfer {
  readonly id: string
  readonly glyph: string
  readonly source: string
  readonly name: string
  readonly description: string
  readonly effect: string
}

export interface CrossingMemoryInput {
  readonly sourceId: UniverseId
  readonly targetId: UniverseId
  readonly firstArrival: boolean
  readonly beacons: readonly string[]
  readonly wayfinder: readonly string[]
  readonly successionRelays: Readonly<Record<string, number>>
  readonly lumenPurchases: readonly string[]
}

/**
 * Names at most two existing Between-scope effects at the moment their origin
 * is easiest to understand. This is presentation only; no new power is minted.
 */
export function crossingMemoryTransfers(input: CrossingMemoryInput): readonly CrossingMemoryTransfer[] {
  if (!input.firstArrival) return []
  const source = universeById(input.sourceId)
  const target = universeById(input.targetId)
  const transfers: CrossingMemoryTransfer[] = []

  if (input.beacons.includes(input.sourceId)) {
    transfers.push({
      id: `beacon-memory-${input.sourceId}`,
      glyph: source.route.glyph,
      source: `${source.shortName} Beacon`,
      name: 'A remembered horizon',
      description: `${source.shortName}'s completed sky remains visible inside the Wayfinder instrument.`,
      effect: '×3 all production in every realm',
    })
  }

  const relay = SUCCESSION_RELAYS.find((entry) => (
    entry.sourceUniverseId === input.sourceId
    && entry.targetUniverseId === input.targetId
  ))
  if (relay) {
    const rank = successionRelayRank(input.successionRelays, relay.id)
    if (rank > 0) {
      transfers.push({
        id: relay.id,
        glyph: '→',
        source: `${source.shortName} · relay rank ${rank}`,
        name: relay.name,
        description: relay.description,
        effect: `×${successionRelayMultiplier(input.targetId, input.successionRelays, input.lumenPurchases).toFixed(2)} ${target.shortName} production`,
      })
    }
  }

  if (transfers.length < 2 && input.wayfinder.includes('remembered-kindling')) {
    transfers.push({
      id: 'remembered-kindling-arrival',
      glyph: '✦',
      source: 'Wayfinder · Remembered Kindling',
      name: `A first ${target.generators[0]?.name ?? 'Kindling'} remembers`,
      description: `Something small from ${source.shortName} has taught the first Kindling how to begin here.`,
      effect: '25 tier-one Kindlings waiting on first arrival',
    })
  } else if (transfers.length < 2 && input.wayfinder.includes('between-cargo')) {
    transfers.push({
      id: 'between-cargo-arrival',
      glyph: '◆',
      source: 'Wayfinder · Cargo from the Dark Between',
      name: 'The hold returns heavier',
      description: `The Vessel carries ${source.shortName}'s learned weight into ${target.shortName}.`,
      effect: '×1.25 all production in every realm',
    })
  }

  return transfers.slice(0, 2)
}
