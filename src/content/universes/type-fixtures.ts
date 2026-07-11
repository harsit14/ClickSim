import type {
  ArchiveDef,
  CurrencyPresentation,
  HeartManifest,
  LocalPrestigeDef,
  UniversePackV2,
} from './types'

type UniverseFixture<
  Id extends UniversePackV2['id'],
  Currency extends string,
  Heart extends string,
  EpochTurn extends string,
  EpochMatter extends string,
  Archive extends string,
> = Omit<UniversePackV2, 'id' | 'economy' | 'heart' | 'archive'> & {
  readonly id: Id
  readonly economy: Omit<UniversePackV2['economy'], 'currency' | 'localPrestige'> & {
    readonly currency: Omit<CurrencyPresentation, 'localName'> & { readonly localName: Currency }
    readonly localPrestige: Omit<LocalPrestigeDef, 'localName' | 'rewardCurrency'> & {
      readonly localName: EpochTurn
      readonly rewardCurrency: Omit<CurrencyPresentation, 'localName'> & {
        readonly localName: EpochMatter
      }
    }
  }
  readonly heart: Omit<HeartManifest, 'localName'> & { readonly localName: Heart }
  readonly archive: Omit<ArchiveDef, 'localName'> & { readonly localName: Archive }
}

type AssertPack<T extends UniversePackV2> = T

export type EmberlightTypeFixture = AssertPack<UniverseFixture<
  'emberlight',
  'Light',
  'Last Ember',
  'Supernova',
  'Stardust',
  'Astral Cabinet'
>>

export type TidefallTypeFixture = AssertPack<UniverseFixture<
  'tidefall',
  'Glow',
  'Tideheart',
  'Undertow',
  'Moon Salt',
  'Pelagic Archive'
>>

export type VerdanceTypeFixture = AssertPack<UniverseFixture<
  'verdance',
  'Sap',
  'First Seed',
  'Pruning',
  'Memory Seeds',
  'Impossible Herbarium'
>>

export type ClockworkTypeFixture = AssertPack<UniverseFixture<
  'clockwork',
  'Ticks',
  'Escapement Heart',
  'Rewinding',
  'Mainsprings',
  'Patent Ledger'
>>

export type PrismataTypeFixture = AssertPack<UniverseFixture<
  'prismata',
  'Possibility',
  'Lotus of Becoming',
  'Recomposition',
  'Folios',
  'Archive of First Forms'
>>

export type TempestTypeFixture = AssertPack<UniverseFixture<
  'tempest',
  'Continuity',
  'The Endless Circuit',
  'Renewal',
  'Returns',
  'Ocean of Continuance'
>>

export type CanticleTypeFixture = AssertPack<UniverseFixture<
  'canticle',
  'Resonance',
  'First Chord',
  'Refrain',
  'Overtones',
  'Resonant Memory'
>>

export type SevenUniverseTypeFixtures = readonly [
  EmberlightTypeFixture,
  TidefallTypeFixture,
  VerdanceTypeFixture,
  ClockworkTypeFixture,
  PrismataTypeFixture,
  TempestTypeFixture,
  CanticleTypeFixture,
]

type FixtureIds = SevenUniverseTypeFixtures[number]['id']
type AllUniverseIds = UniversePackV2['id']
type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false
type AssertTrue<Value extends true> = Value

/** Compile-time proof that the fixture set covers the frozen seven-universe ID union. */
export type SevenUniverseFixtureCoverage = AssertTrue<Equal<FixtureIds, AllUniverseIds>>
