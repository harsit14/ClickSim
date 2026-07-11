import type { UniverseId } from './universes/types'

export type DivineRealmId = 'brahmalok' | 'vishnulok' | 'kailash'
export type DivineRealmRole = 'creation' | 'preservation' | 'dissolution'
export type DivineRealmMechanicFoundation = 'routing' | 'path' | 'sequence'

export interface DivineRealmPlan {
  readonly id: DivineRealmId
  /** Existing save slot retained until the replacement is complete. */
  readonly saveSlotUniverseId: Extract<UniverseId, 'prismata' | 'tempest' | 'canticle'>
  readonly stablePrefix: 'u5' | 'u6' | 'u7'
  readonly publicName: string
  readonly traditionalReference: string
  readonly role: DivineRealmRole
  readonly playerVerb: 'unfold' | 'sustain' | 'release'
  readonly mechanicFoundation: DivineRealmMechanicFoundation
  readonly centralInterface: string
  readonly sacredPresences: readonly string[]
  readonly narrativePurpose: string
  readonly visualThesis: string
  readonly completionRite: string
}

export const RESTORED_UNIVERSE_ROUTE = [
  'emberlight',
  'tidefall',
  'verdance',
  'clockwork',
] as const satisfies readonly UniverseId[]

export const DIVINE_REALMS = [
  {
    id: 'brahmalok', saveSlotUniverseId: 'prismata', stablePrefix: 'u5',
    publicName: 'Brahmalok', traditionalReference: 'Brahmaloka / Satyaloka',
    role: 'creation', playerVerb: 'unfold', mechanicFoundation: 'routing',
    centralInterface: 'The Lotus of Becoming', sacredPresences: ['Brahma', 'Saraswati'],
    narrativePurpose: 'Intentional creation becomes legible through knowledge, distinction, measure, and form.',
    visualThesis: 'Four horizons unfold from a lotus field in rose, maroon, ivory, and gold; knowledge changes structure rather than becoming floating decoration.',
    completionRite: 'The four horizons become one creation while every direction remains legible.',
  },
  {
    id: 'vishnulok', saveSlotUniverseId: 'tempest', stablePrefix: 'u6',
    publicName: 'Vishnulok', traditionalReference: 'Vaikuntha',
    role: 'preservation', playerVerb: 'sustain', mechanicFoundation: 'path',
    centralInterface: 'The Endless Circuit', sacredPresences: ['Vishnu', 'Lakshmi', 'Ananta'],
    narrativePurpose: 'Preservation is revealed as responsive restoration of order rather than refusal to change.',
    visualThesis: 'A calm indigo cosmic ocean is organized by endless coils, an ivory conch pulse, lotus light, and a declared golden correction route.',
    completionRite: 'The correction circuit closes, the chakra returns, and the cosmic ocean becomes still without becoming lifeless.',
  },
  {
    id: 'kailash', saveSlotUniverseId: 'canticle', stablePrefix: 'u7',
    publicName: 'Kailash', traditionalReference: 'Kailasa',
    role: 'dissolution', playerVerb: 'release', mechanicFoundation: 'sequence',
    centralInterface: 'The Still Point', sacredPresences: ['Shiva', 'Parvati', 'Ganga', 'Nandi'],
    narrativePurpose: 'Dissolution becomes renewal, refuge, grace, and release rather than destruction as spectacle.',
    visualThesis: 'Moonlit snow and blue stone remain nearly still until river, damaru, ash, copper fire, and the late dance ring reveal the cosmic rhythm.',
    completionRite: 'A consent-gated five-act dissolution releases the world beat by beat and carries retained progression into the Garden.',
  },
] as const satisfies readonly DivineRealmPlan[]

export const DIVINE_REALM_BY_ID: ReadonlyMap<DivineRealmId, DivineRealmPlan> = new Map(
  DIVINE_REALMS.map((realm) => [realm.id, realm]),
)

export const DIVINE_REALM_BY_SAVE_SLOT: ReadonlyMap<DivineRealmPlan['saveSlotUniverseId'], DivineRealmPlan> = new Map(
  DIVINE_REALMS.map((realm) => [realm.saveSlotUniverseId, realm]),
)

/** Existing runtime order. Save-slot IDs stay stable as each public loka replacement ships. */
export const SAVE_STABLE_STORY_ROUTE = [
  ...RESTORED_UNIVERSE_ROUTE,
  ...DIVINE_REALMS.map(({ saveSlotUniverseId }) => saveSlotUniverseId),
] as const satisfies readonly UniverseId[]

export const SACRED_CONTENT_GUARDRAILS = [
  'not-currency', 'not-generator', 'not-upgrade', 'not-boss', 'not-loot',
  'not-joke-achievement', 'not-cabinet-collectible',
] as const

export function divineRealmForSaveSlot(universeId: string): DivineRealmPlan | null {
  return DIVINE_REALM_BY_SAVE_SLOT.get(universeId as DivineRealmPlan['saveSlotUniverseId']) ?? null
}
