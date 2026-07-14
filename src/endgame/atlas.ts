import type { UniverseId } from '../content/universes/types'
import type { AtlasCompletion } from './types'

export type AtlasLawKind = 'environment' | 'economy' | 'interaction'
export type AtlasLawTag =
  | 'stable'
  | 'cyclic'
  | 'aging'
  | 'deterministic'
  | 'spectral'
  | 'charged'
  | 'sequential'
  | 'active'
  | 'idle'
  | 'archive'
  | 'omen'

export interface AtlasLaw {
  readonly id: string
  readonly kind: AtlasLawKind
  readonly name: string
  readonly description: string
  readonly tags: readonly AtlasLawTag[]
  readonly universes: readonly UniverseId[] | 'all'
  readonly incompatibleWith: readonly string[]
  readonly productionMultiplier: number
}

export interface AtlasFragment {
  readonly id: string
  readonly title: string
  readonly text: string
  readonly universeId: UniverseId | 'any'
}

export interface AtlasMastery {
  readonly id: string
  readonly label: string
  readonly tags: readonly AtlasLawTag[]
}

export interface AtlasRoute {
  readonly version: 1
  readonly seed: number
  readonly universeId: UniverseId
  readonly environmentLawId: string
  readonly economyLawId: string
  readonly interactionLawId: string
  readonly fragmentId: string
  readonly masteryId: string | null
  readonly title: string
  readonly code: string
}

export interface AtlasReplayFrame {
  readonly step: number
  readonly event: 'enter' | 'law' | 'fragment' | 'mastery' | 'beacon'
  readonly value: string
}

export interface DailyAtlasRoute {
  readonly utcDay: string
  readonly route: AtlasRoute
}

const ALL_UNIVERSES: readonly UniverseId[] = [
  'emberlight', 'tidefall', 'verdance', 'clockwork', 'brahmalok', 'vishnulok', 'kailash',
]

const ATLAS_WORLD_NAMES: Readonly<Record<UniverseId, string>> = {
  emberlight: 'Emberlight',
  tidefall: 'Tidefall',
  verdance: 'Verdance',
  clockwork: 'Clockwork',
  brahmalok: 'Brahmalok',
  vishnulok: 'Vishnulok',
  kailash: 'Kailash',
}

const law = (
  id: string,
  kind: AtlasLawKind,
  name: string,
  description: string,
  tags: readonly AtlasLawTag[],
  universes: readonly UniverseId[] | 'all',
  productionMultiplier: number,
  incompatibleWith: readonly string[] = [],
): AtlasLaw => ({ id, kind, name, description, tags, universes, incompatibleWith, productionMultiplier })

export const ATLAS_LAWS: readonly AtlasLaw[] = [
  law('env-held-extremes', 'environment', 'Held Horizons', 'The world pauses briefly at each natural extreme, then permits return.', ['cyclic', 'active'], ['tidefall', 'vishnulok'], 1.04),
  law('env-long-memory', 'environment', 'Carried Memory', 'Forms and relations survive change without being kept unchanged.', ['aging', 'idle'], ['verdance', 'brahmalok', 'kailash'], 1.03),
  law('env-open-circuit', 'environment', 'Open Relation', 'One visible path remains incomplete so correction cannot become enclosure.', ['deterministic', 'active'], ['clockwork', 'vishnulok'], 1.06),
  law('env-shared-horizon', 'environment', 'Shared Horizon', 'Distant world objects contribute through declared relations.', ['stable', 'archive'], 'all', 1.02),

  law('eco-complete-shelves', 'economy', 'Complete Shelves', 'Only complete Archive shelves add their resonance.', ['archive', 'idle'], 'all', 1.08),
  law('eco-narrow-band', 'economy', 'Focused Beginning', 'The strongest family germinates while fourfold breadth soft-caps its excess.', ['sequential', 'active'], ['brahmalok', 'emberlight'], 1.10, ['int-many-small']),
  law('eco-patient-circulation', 'economy', 'Patient Circulation', 'Offline and low-attention production receive the larger share.', ['cyclic', 'idle'], ['tidefall', 'verdance', 'vishnulok', 'kailash'], 1.05),
  law('eco-declared-costs', 'economy', 'Declared Costs', 'Purchase growth is fixed and forecast before the route begins.', ['deterministic'], 'all', 1.04),

  law('int-forecast-omens', 'interaction', 'Forecast Omens', 'Every third Omen is announced far in advance.', ['omen', 'active'], 'all', 1.05),
  law('int-many-small', 'interaction', 'Many Small Relations', 'Lower Kindling families contribute more to active chains.', ['active', 'sequential'], ['emberlight', 'verdance', 'kailash'], 1.07, ['eco-narrow-band']),
  law('int-saved-threshold', 'interaction', 'Declared Threshold', 'The active law returns automatically at a declared threshold.', ['idle', 'deterministic'], ['clockwork', 'vishnulok', 'brahmalok'], 1.03),
  law('int-positive-rest', 'interaction', 'Deliberate Interval', 'Intentional pauses amplify the next visible action.', ['sequential', 'active'], ['kailash', 'tidefall', 'emberlight'], 1.06),
]

export const ATLAS_FRAGMENTS: readonly AtlasFragment[] = [
  { id: 'fragment-cartographer', title: 'The Missing Cartographer', text: 'Recover the mapmaker who removed the moon so the current could choose for itself.', universeId: 'tidefall' },
  { id: 'fragment-consenting-garden', title: 'Consent in the Rootwork', text: 'The gardeners record which branches agreed to become shelter for another life.', universeId: 'verdance' },
  { id: 'fragment-open-gear', title: 'The Unfinished Machine', text: 'One gear remains unmeshed so prediction never becomes an order.', universeId: 'clockwork' },
  { id: 'fragment-labeled-white', title: 'The Open Margin', text: 'A lotus, a seed, a measure, and a name begin forms without exhausting possibility.', universeId: 'brahmalok' },
  { id: 'fragment-quiet-release', title: 'The Returning Harbor', text: 'A refuge remains trustworthy because correction can leave it and still find the way home.', universeId: 'vishnulok' },
  { id: 'fragment-second-voice', title: 'The Path Downward', text: 'The summit opens its ring so release can become river, shelter, and renewal below.', universeId: 'kailash' },
  { id: 'fragment-first-warmth', title: 'A Fire That Asks', text: 'The first hearth learns to warm a stranger without naming itself their sun.', universeId: 'emberlight' },
]

export const ATLAS_MASTERIES: readonly AtlasMastery[] = [
  { id: 'mastery-no-critical', label: 'Light the temporary Beacon without a critical click.', tags: ['active'] },
  { id: 'mastery-one-shelf', label: 'Finish with exactly one complete Archive shelf.', tags: ['archive'] },
  { id: 'mastery-patient', label: 'Finish after one intentional quiet interval.', tags: ['idle'] },
  { id: 'mastery-visible-route', label: 'Finish without changing the declared interaction law.', tags: ['deterministic'] },
]

export interface ConvergenceDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requiredBeacons: number
  readonly routeSeeds: readonly number[]
  readonly objects: readonly string[]
  readonly echoes: readonly string[]
}

export const CONVERGENCES: readonly ConvergenceDef[] = [
  {
    id: 'first-neighbors', name: 'First Neighbors', requiredBeacons: 3,
    description: 'Currents, roots, and hearths exchange evidence without becoming one economy.',
    routeSeeds: [1303, 3187, 7711], objects: ['Treaty Seed', 'Shared Tideglass'], echoes: ['A Shore With Roots'],
  },
  {
    id: 'divided-sky', name: 'The Open Horizon', requiredBeacons: 5,
    description: 'Clockwork forecasts and Brahmalok directions make a shared future legible without closing it.',
    routeSeeds: [5021, 5813, 9967], objects: ['Open Escapement', 'First Margin'], echoes: ['The Shape of Cause'],
  },
  {
    id: 'choir-of-weather', name: 'The Completed Cycle', requiredBeacons: 7,
    description: 'Creation, preservation, and release remain distinct while the Garden carries their relation forward.',
    routeSeeds: [7129, 8081, 12011], objects: ['Open Lotus', 'Returning Current', 'Unclosed Ring'], echoes: ['What the Garden Carries'],
  },
]

function mix32(value: number): number {
  let x = value | 0
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b)
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b)
  return (x ^ (x >>> 16)) >>> 0
}

/** A shared UTC day label with no player-local rollover advantage. */
export function atlasUtcDay(now = Date.now()): string {
  if (!Number.isFinite(now) || now < 0) throw new RangeError('Atlas day requires a nonnegative finite timestamp')
  return new Date(Math.floor(now)).toISOString().slice(0, 10)
}

/** Daily seeds are only discovery shortcuts; their ordinary route codes never expire. */
export function dailyAtlasRoute(now = Date.now(), universeId?: UniverseId): DailyAtlasRoute {
  if (!Number.isFinite(now) || now < 0) throw new RangeError('Daily Atlas route requires a nonnegative finite timestamp')
  const utcDayIndex = Math.floor(now / 86_400_000)
  const seed = mix32(utcDayIndex ^ 0x6d2b79f5) & 0x7fffffff
  return { utcDay: atlasUtcDay(now), route: generateAtlasRoute(seed, universeId) }
}

function pick<T>(items: readonly T[], seed: number, salt: number): T {
  if (items.length === 0) throw new RangeError('Atlas selection cannot choose from an empty set')
  return items[mix32(seed ^ salt) % items.length]
}

function lawSupportsUniverse(lawDef: AtlasLaw, universeId: UniverseId): boolean {
  return lawDef.universes === 'all' || lawDef.universes.includes(universeId)
}

export function atlasLawsFor(universeId: UniverseId, kind: AtlasLawKind): readonly AtlasLaw[] {
  return ATLAS_LAWS.filter((entry) => entry.kind === kind && lawSupportsUniverse(entry, universeId))
}

function compatible(laws: readonly AtlasLaw[]): boolean {
  return laws.every((entry) => laws.every((other) => (
    entry.id === other.id || !entry.incompatibleWith.includes(other.id)
  )))
}

function routeCodeBody(route: Omit<AtlasRoute, 'code' | 'title'>): string {
  const universeIndex = ALL_UNIVERSES.indexOf(route.universeId)
  const environmentIndex = ATLAS_LAWS.findIndex((entry) => entry.id === route.environmentLawId)
  const economyIndex = ATLAS_LAWS.findIndex((entry) => entry.id === route.economyLawId)
  const interactionIndex = ATLAS_LAWS.findIndex((entry) => entry.id === route.interactionLawId)
  const fragmentIndex = ATLAS_FRAGMENTS.findIndex((entry) => entry.id === route.fragmentId)
  const masteryIndex = route.masteryId === null ? 35 : ATLAS_MASTERIES.findIndex((entry) => entry.id === route.masteryId)
  return [route.seed.toString(36), universeIndex, environmentIndex, economyIndex, interactionIndex, fragmentIndex, masteryIndex]
    .map((value) => value.toString(36)).join('.')
}

function checksum(text: string): string {
  let value = 2166136261
  for (const character of text) {
    value ^= character.charCodeAt(0)
    value = Math.imul(value, 16777619)
  }
  return (value >>> 0).toString(36).slice(-5).padStart(5, '0')
}

export function encodeAtlasRoute(route: Omit<AtlasRoute, 'code' | 'title'>): string {
  const body = routeCodeBody(route)
  return `A1-${body}-${checksum(body)}`
}

export function validateAtlasRoute(route: AtlasRoute): readonly string[] {
  const issues: string[] = []
  if (!Number.isInteger(route.seed) || route.seed < 0 || route.seed > 0x7fffffff) issues.push('seed must be a nonnegative signed-32-bit integer')
  if (!ALL_UNIVERSES.includes(route.universeId)) issues.push('universe is unknown')
  const laws = [route.environmentLawId, route.economyLawId, route.interactionLawId]
    .map((id) => ATLAS_LAWS.find((entry) => entry.id === id))
  if (laws.some((entry) => !entry)) issues.push('route references an unknown law')
  if (laws.some((entry) => entry && !lawSupportsUniverse(entry, route.universeId))) issues.push('route law does not support its universe')
  if (laws.every((entry): entry is AtlasLaw => Boolean(entry)) && !compatible(laws)) issues.push('route contains incompatible laws')
  if (!ATLAS_FRAGMENTS.some((entry) => entry.id === route.fragmentId && (entry.universeId === 'any' || entry.universeId === route.universeId))) issues.push('fragment does not belong to the route universe')
  if (route.masteryId !== null && !ATLAS_MASTERIES.some((entry) => entry.id === route.masteryId)) issues.push('mastery constraint is unknown')
  const expectedCode = encodeAtlasRoute({
    version: 1, seed: route.seed, universeId: route.universeId,
    environmentLawId: route.environmentLawId, economyLawId: route.economyLawId,
    interactionLawId: route.interactionLawId, fragmentId: route.fragmentId, masteryId: route.masteryId,
  })
  if (route.code !== expectedCode) issues.push('route code checksum does not match its laws')
  return issues
}

export function generateAtlasRoute(seed: number, universeId?: UniverseId): AtlasRoute {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0x7fffffff) throw new RangeError('Atlas seed must be a nonnegative signed-32-bit integer')
  const selectedUniverse = universeId ?? pick(ALL_UNIVERSES, seed, 0x17a5)
  const environment = pick(atlasLawsFor(selectedUniverse, 'environment'), seed, 0x2c51)
  const economyChoices = atlasLawsFor(selectedUniverse, 'economy')
    .filter((candidate) => compatible([environment, candidate]))
  const economy = pick(economyChoices, seed, 0x33d9)
  const interactionChoices = atlasLawsFor(selectedUniverse, 'interaction')
    .filter((candidate) => compatible([environment, economy, candidate]))
  const interaction = pick(interactionChoices, seed, 0x4f1b)
  const fragment = pick(ATLAS_FRAGMENTS.filter((entry) => entry.universeId === selectedUniverse || entry.universeId === 'any'), seed, 0x5a7d)
  const mastery = mix32(seed ^ 0x6e31) % 4 === 0 ? null : pick(ATLAS_MASTERIES, seed, 0x6e31)
  const withoutPresentation = {
    version: 1 as const, seed, universeId: selectedUniverse,
    environmentLawId: environment.id, economyLawId: economy.id,
    interactionLawId: interaction.id, fragmentId: fragment.id, masteryId: mastery?.id ?? null,
  }
  return {
    ...withoutPresentation,
    title: `${ATLAS_WORLD_NAMES[selectedUniverse].toUpperCase()}: ${fragment.title.toUpperCase()}`,
    code: encodeAtlasRoute(withoutPresentation),
  }
}

export function decodeAtlasRoute(code: string): AtlasRoute | null {
  const match = /^A1-([a-z0-9.]+)-([a-z0-9]{5})$/.exec(code.trim().toLowerCase().replace(/^a1-/, 'A1-'))
  if (!match || checksum(match[1]) !== match[2]) return null
  const parts = match[1].split('.').map((value) => Number.parseInt(value, 36))
  if (parts.length !== 7 || parts.some((value) => !Number.isInteger(value))) return null
  const [seed, universeIndex, environmentIndex, economyIndex, interactionIndex, fragmentIndex, masteryIndex] = parts
  const universeId = ALL_UNIVERSES[universeIndex]
  const environment = ATLAS_LAWS[environmentIndex]
  const economy = ATLAS_LAWS[economyIndex]
  const interaction = ATLAS_LAWS[interactionIndex]
  const fragment = ATLAS_FRAGMENTS[fragmentIndex]
  const mastery = masteryIndex === 35 ? null : ATLAS_MASTERIES[masteryIndex]
  if (!universeId || !environment || !economy || !interaction || !fragment || (masteryIndex !== 35 && !mastery)) return null
  const route: AtlasRoute = {
    version: 1, seed, universeId,
    environmentLawId: environment.id, economyLawId: economy.id,
    interactionLawId: interaction.id, fragmentId: fragment.id, masteryId: mastery?.id ?? null,
    title: `${ATLAS_WORLD_NAMES[universeId].toUpperCase()}: ${fragment.title.toUpperCase()}`,
    code: encodeAtlasRoute({
      version: 1, seed, universeId,
      environmentLawId: environment.id, economyLawId: economy.id,
      interactionLawId: interaction.id, fragmentId: fragment.id, masteryId: mastery?.id ?? null,
    }),
  }
  return validateAtlasRoute(route).length === 0 ? route : null
}

export function atlasRouteMultiplier(route: AtlasRoute): number {
  const laws = [route.environmentLawId, route.economyLawId, route.interactionLawId]
    .map((id) => ATLAS_LAWS.find((entry) => entry.id === id))
  if (validateAtlasRoute(route).length > 0 || laws.some((entry) => !entry)) return 1
  const raw = laws.reduce((total, entry) => total * (entry?.productionMultiplier ?? 1), 1)
  return 1 + Math.tanh((raw - 1) * 2.5) * 0.34
}

export function replayAtlasRoute(route: AtlasRoute): readonly AtlasReplayFrame[] {
  if (validateAtlasRoute(route).length > 0) throw new TypeError('Cannot replay an invalid Atlas route')
  return [
    { step: 0, event: 'enter', value: route.universeId },
    { step: 1, event: 'law', value: route.environmentLawId },
    { step: 2, event: 'law', value: route.economyLawId },
    { step: 3, event: 'law', value: route.interactionLawId },
    { step: 4, event: 'fragment', value: route.fragmentId },
    ...(route.masteryId ? [{ step: 5, event: 'mastery' as const, value: route.masteryId }] : []),
    { step: 6, event: 'beacon', value: route.code },
  ]
}

export function atlasReplayDigest(route: AtlasRoute): string {
  return checksum(JSON.stringify(replayAtlasRoute(route)))
}

export function bestAtlasCompletion(
  completions: readonly AtlasCompletion[],
  routeCode: string,
): AtlasCompletion | null {
  return completions
    .filter((entry) => entry.routeCode === routeCode)
    .sort((left, right) => left.durationMs - right.durationMs || left.completedAt - right.completedAt)[0] ?? null
}
