import { ACHIEVEMENTS } from '../content/achievements'
import { CHALLENGES } from '../content/challenges'
import { CONSTELLATION } from '../content/constellation'
import { DEEP_UPGRADES } from '../content/deep'
import {
  LUMEN_VAULT_ITEMS,
  MAX_LUMEN_DISTILLATIONS_PER_UNIVERSE,
  MAX_SUCCESSION_RELAY_RANK,
  SUCCESSION_RELAYS,
  lumenClaimIds,
} from '../content/legacy-exchange'
import { THEMES } from '../content/themes'
import { UI_UNLOCKS } from '../content/ui-unlocks'
import { DEFAULT_UNIVERSE_ID, UNIVERSES, universeById } from '../content/universes'
import { VESSEL_PARTS } from '../content/vessel'
import { DEEP_WORKS, STARDUST_WORKS } from '../content/repeatables'
import type { BuyAmount } from '../engine/game.svelte'
import {
  atlasReplayDigest,
  decodeAtlasRoute,
  CONVERGENCES,
} from '../endgame/atlas'
import {
  cleanBeaconName,
  cleanPlayerLabel,
  validateLawLoadout,
} from '../endgame/chronicle'
import { emptyEndgameState, type EndgameState, type GardenEnding } from '../endgame/types'
import type { BeatVisual, MotionPreference, TextScale, VisualQuality } from './preferences'
import type { Amount, SerializedAmount } from './numeric/amount'
import {
  ONE_AMOUNT,
  amountFromNumber,
  maxAmount,
  minAmount,
  parseAmount,
  serializeAmount,
} from './numeric/amount'

export const CURRENT_SAVE_VERSION = 23
export const F5_SAVE_VERSION = 22
export const LEGACY_SAVE_VERSION = 12
export const NUMERIC_SAVE_VERSION = 13

export interface LegacyRunSnapshotV12 {
  light: number
  totalEarned: number
  owned: Record<string, number>
  upgrades: string[]
  buyAmount: BuyAmount
}

export interface LegacyUniverseRunStateV12 {
  light: number
  totalEarned: number
  clicks: number
  owned: Record<string, number>
  upgrades: string[]
  buyAmount: BuyAmount
  seen: string[]
  stardust: number
  stardustTotal: number
  supernovae: number
  constellation: string[]
  stardustWorks: Record<string, number>
  echoes: string[]
  eraEarned: number
  singularities: number
  singTotal: number
  collapses: number
  singUpgrades: string[]
  deepWorks: Record<string, number>
  challenge: string | null
  challengeReturn: LegacyRunSnapshotV12 | null
  challengesDone: string[]
  autoKindler: boolean
  autoStoker: boolean
  autoNova: boolean
  autoNovaThreshold: number
  ending: 'warden' | 'hunger' | 'companion' | null
  curiosities: string[]
  keeperFedUntil: number
  snailLastGiftAt: number
  crits: number
  bestCrit: number
}

export interface SaveDataV12 {
  version: 12
  savedAt: number
  activeUniverse: string
  light: number
  totalEarned: number
  clicks: number
  owned: Record<string, number>
  upgrades: string[]
  achievements: string[]
  ui: string[]
  seen: string[]
  playtime: number
  sfxVolume: number
  musicVolume: number
  motionPreference: MotionPreference
  visualQuality: VisualQuality
  beatVisual: BeatVisual
  textScale: TextScale
  highContrast: boolean
  buyAmount: BuyAmount
  starsCaught: number
  bestCombo: number
  allTimeEarned: number
  stardust: number
  stardustTotal: number
  supernovae: number
  constellation: string[]
  stardustWorks: Record<string, number>
  echoes: string[]
  eraEarned: number
  singularities: number
  singTotal: number
  collapses: number
  singUpgrades: string[]
  deepWorks: Record<string, number>
  challenge: string | null
  challengeReturn: LegacyRunSnapshotV12 | null
  challengesDone: string[]
  autoKindler: boolean
  autoStoker: boolean
  autoNova: boolean
  autoNovaThreshold: number
  ending: 'warden' | 'hunger' | 'companion' | null
  theme: string
  remembrances: number
  pastEndings: Array<'warden' | 'hunger' | 'companion'>
  curiosities: string[]
  keeperFedUntil: number
  snailLastGiftAt: number
  crits: number
  bestCrit: number
  beacons: string[]
  darkBetween: number
  wayfinder: string[]
  vesselParts: string[]
  universeRuns: Record<string, LegacyUniverseRunStateV12>
}

export interface SaveRunSnapshotV13 {
  light: Amount
  totalEarned: Amount
  owned: Record<string, number>
  upgrades: string[]
  buyAmount: BuyAmount
  numericLawState: Record<string, Amount>
}

export interface SaveUniverseRunStateV13 {
  light: Amount
  totalEarned: Amount
  clicks: number
  owned: Record<string, number>
  upgrades: string[]
  buyAmount: BuyAmount
  seen: string[]
  stardust: Amount
  stardustTotal: Amount
  supernovae: number
  constellation: string[]
  stardustWorks: Record<string, number>
  echoes: string[]
  eraEarned: Amount
  singularities: Amount
  singTotal: Amount
  collapses: number
  singUpgrades: string[]
  deepWorks: Record<string, number>
  challenge: string | null
  challengeReturn: SaveRunSnapshotV13 | null
  challengesDone: string[]
  autoKindler: boolean
  autoStoker: boolean
  autoNova: boolean
  autoNovaThreshold: Amount
  ending: 'warden' | 'hunger' | 'companion' | null
  curiosities: string[]
  keeperFedUntil: number
  snailLastGiftAt: number
  crits: number
  bestCrit: Amount
  numericLawState: Record<string, Amount>
  lokaProgress: Record<string, number>
}

export interface SaveDataV13 extends Omit<SaveDataV12,
  | 'version'
  | 'light'
  | 'totalEarned'
  | 'allTimeEarned'
  | 'stardust'
  | 'stardustTotal'
  | 'eraEarned'
  | 'singularities'
  | 'singTotal'
  | 'challengeReturn'
  | 'autoNovaThreshold'
  | 'bestCrit'
  | 'darkBetween'
  | 'universeRuns'
> {
  version: 13
  light: Amount
  totalEarned: Amount
  allTimeEarned: Amount
  stardust: Amount
  stardustTotal: Amount
  eraEarned: Amount
  singularities: Amount
  singTotal: Amount
  challengeReturn: SaveRunSnapshotV13 | null
  autoNovaThreshold: Amount
  bestCrit: Amount
  darkBetween: Amount
  numericLawState: Record<string, Amount>
  lokaProgress: Record<string, number>
  universeRuns: Record<string, SaveUniverseRunStateV13>
}

export interface SerializedRunSnapshotV13 extends Omit<SaveRunSnapshotV13, 'light' | 'totalEarned' | 'numericLawState'> {
  light: SerializedAmount
  totalEarned: SerializedAmount
  numericLawState: Record<string, SerializedAmount>
}

export interface SerializedUniverseRunStateV13 extends Omit<SaveUniverseRunStateV13,
  | 'light'
  | 'totalEarned'
  | 'stardust'
  | 'stardustTotal'
  | 'eraEarned'
  | 'singularities'
  | 'singTotal'
  | 'challengeReturn'
  | 'autoNovaThreshold'
  | 'bestCrit'
  | 'numericLawState'
> {
  light: SerializedAmount
  totalEarned: SerializedAmount
  stardust: SerializedAmount
  stardustTotal: SerializedAmount
  eraEarned: SerializedAmount
  singularities: SerializedAmount
  singTotal: SerializedAmount
  challengeReturn: SerializedRunSnapshotV13 | null
  autoNovaThreshold: SerializedAmount
  bestCrit: SerializedAmount
  numericLawState: Record<string, SerializedAmount>
}

export interface SerializedSaveDataV13 extends Omit<SaveDataV13,
  | 'light'
  | 'totalEarned'
  | 'allTimeEarned'
  | 'stardust'
  | 'stardustTotal'
  | 'eraEarned'
  | 'singularities'
  | 'singTotal'
  | 'challengeReturn'
  | 'autoNovaThreshold'
  | 'bestCrit'
  | 'darkBetween'
  | 'numericLawState'
  | 'universeRuns'
> {
  light: SerializedAmount
  totalEarned: SerializedAmount
  allTimeEarned: SerializedAmount
  stardust: SerializedAmount
  stardustTotal: SerializedAmount
  eraEarned: SerializedAmount
  singularities: SerializedAmount
  singTotal: SerializedAmount
  challengeReturn: SerializedRunSnapshotV13 | null
  autoNovaThreshold: SerializedAmount
  bestCrit: SerializedAmount
  darkBetween: SerializedAmount
  numericLawState: Record<string, SerializedAmount>
  universeRuns: Record<string, SerializedUniverseRunStateV13>
}

export interface SaveDataV22 extends Omit<SaveDataV13, 'version'> {
  version: 22
  endgame: EndgameState
}

export interface SerializedSaveDataV22 extends Omit<SerializedSaveDataV13, 'version'> {
  version: 22
  endgame: EndgameState
}

export interface SaveDataV23 extends Omit<SaveDataV22, 'version'> {
  version: 23
  vesselPartsByUniverse: Record<string, string[]>
  endgame: EndgameState
}

export interface SerializedSaveDataV23 extends Omit<SerializedSaveDataV22, 'version'> {
  version: 23
  vesselPartsByUniverse: Record<string, string[]>
}

const MIGRATIONS: Record<number, (d: Record<string, unknown>) => Record<string, unknown>> = {
  1: (d) => ({
    ...d,
    version: 2,
    upgrades: [],
    ui: UI_UNLOCKS.filter((u) => numberValue(d.totalEarned, 0) >= u.cost * 3).map((u) => u.id),
    playtime: 0,
    sfxVolume: 0.5,
    buyAmount: 1,
  }),
  2: (d) => ({
    ...d,
    version: 3,
    achievements: [],
    musicVolume: 0.6,
    starsCaught: 0,
    bestCombo: 0,
  }),
  3: (d) => ({
    ...d,
    version: 4,
    allTimeEarned: numberValue(d.totalEarned, 0),
    stardust: 0,
    stardustTotal: 0,
    supernovae: 0,
    constellation: [],
    echoes: [],
  }),
  4: (d) => ({
    ...d,
    version: 5,
    eraEarned: numberValue(d.allTimeEarned, 0),
    singularities: 0,
    singTotal: 0,
    collapses: 0,
    singUpgrades: [],
    challenge: null,
    challengesDone: [],
    autoKindler: true,
    autoStoker: true,
    autoNova: false,
    autoNovaThreshold: 1,
  }),
  5: (d) => ({ ...d, version: 6, ending: null }),
  6: (d) => ({ ...d, version: 7, challengeReturn: null }),
  7: (d) => ({
    ...d,
    version: 8,
    theme: d.theme ?? 'ember',
    remembrances: d.remembrances ?? 0,
    pastEndings: d.pastEndings ?? [],
    curiosities: d.curiosities ?? [],
    keeperFedUntil: d.keeperFedUntil ?? 0,
    snailLastGiftAt: d.snailLastGiftAt ?? 0,
    crits: d.crits ?? 0,
    bestCrit: d.bestCrit ?? 0,
  }),
  8: (d) => ({
    ...d,
    version: 9,
    activeUniverse: d.activeUniverse ?? DEFAULT_UNIVERSE_ID,
    beacons: d.beacons ?? [],
    darkBetween: d.darkBetween ?? 0,
    wayfinder: d.wayfinder ?? [],
    vesselParts: d.vesselParts ?? [],
  }),
  9: (d) => ({
    ...d,
    version: 10,
    universeRuns: d.universeRuns ?? {},
  }),
  10: (d) => ({
    ...d,
    version: 11,
    stardustWorks: d.stardustWorks ?? {},
    deepWorks: d.deepWorks ?? {},
  }),
  11: (d) => ({
    ...d,
    version: 12,
    motionPreference: d.motionPreference ?? 'system',
    visualQuality: d.visualQuality ?? 'auto',
    beatVisual: d.beatVisual ?? 'heart',
    textScale: d.textScale ?? 'normal',
    highContrast: d.highContrast ?? false,
  }),
}

const BUY_AMOUNTS = new Set<BuyAmount>([1, 10, 100, 'max'])
const ENDINGS = new Set<string>(['warden', 'hunger', 'companion'])
const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,63}$/
const MOTION_PREFERENCES = new Set<MotionPreference>(['system', 'reduced'])
const VISUAL_QUALITIES = new Set<VisualQuality>(['auto', 'high', 'balanced', 'low'])
const BEAT_VISUALS = new Set<BeatVisual>(['heart', 'edge', 'off'])
const TEXT_SCALES = new Set<TextScale>(['normal', 'large'])

const achievementIds = new Set(ACHIEVEMENTS.map((item) => item.id))
const challengeIds = new Set(CHALLENGES.map((item) => item.id))
const constellationIds = new Set(CONSTELLATION.map((item) => item.id))
const deepUpgradeIds = new Set(DEEP_UPGRADES.map((item) => item.id))
const stardustWorkIds = new Set(STARDUST_WORKS.map((item) => item.id))
const deepWorkIds = new Set(DEEP_WORKS.map((item) => item.id))
const themeIds = new Set(THEMES.map((item) => item.id))
const uiIds = new Set(UI_UNLOCKS.map((item) => item.id))
const universeIds = new Set(UNIVERSES.map((item) => item.id))
const vesselPartIds = new Set(VESSEL_PARTS.map((item) => item.id))
const seenIds = new Set(UNIVERSES.flatMap((universe) => universe.lumen.map((item) => item.id)))
const chronicleMilestones = new Set([
  'awakening', 'epoch-turn', 'deep-collapse', 'answer', 'beacon', 'garden', 'atlas-route',
])
const gardenEndings = new Set<GardenEnding>(['warden', 'hunger', 'companion', 'continue'])
const convergenceIds = new Set(CONVERGENCES.map((entry) => entry.id))
const successionRelayIds = new Set(SUCCESSION_RELAYS.map((entry) => entry.id))
const lumenVaultItemIds = new Set(LUMEN_VAULT_ITEMS.map((entry) => entry.id))
const lumenShardClaimIds = new Set(lumenClaimIds())

function numberValue(value: unknown, fallback: number, min = 0, max = Number.MAX_VALUE): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

function beatVisualValue(value: unknown): BeatVisual {
  // v12-v23 used intensity names for the same persisted field. Keep those
  // saves meaningful while replacing intensity with the more useful target.
  if (value === 'subtle') return 'heart'
  if (value === 'strong') return 'edge'
  return enumValue(value, BEAT_VISUALS, 'heart')
}

function integerValue(value: unknown, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  return Math.floor(numberValue(value, fallback, min, max))
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function knownStrings(value: unknown, allowed: ReadonlySet<string>, max = 512): string[] {
  if (!Array.isArray(value)) return []
  const result: string[] = []
  const seen = new Set<string>()
  for (const item of value) {
    if (typeof item !== 'string' || !allowed.has(item) || seen.has(item)) continue
    result.push(item)
    seen.add(item)
    if (result.length >= max) break
  }
  return result
}

function safeIds(value: unknown, max = 128): string[] {
  if (!Array.isArray(value)) return []
  const result: string[] = []
  const seen = new Set<string>()
  for (const item of value) {
    if (typeof item !== 'string' || !SAFE_ID.test(item) || seen.has(item)) continue
    result.push(item)
    seen.add(item)
    if (result.length >= max) break
  }
  return result
}

function sanitizeEndgameState(value: unknown): EndgameState {
  const empty = emptyEndgameState()
  if (!value || typeof value !== 'object' || Array.isArray(value)) return empty
  const source = value as Record<string, unknown>

  const chronicleEvents = Array.isArray(source.chronicleEvents)
    ? source.chronicleEvents.flatMap((raw) => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return []
      const event = raw as Record<string, unknown>
      if (
        typeof event.id !== 'string' || !SAFE_ID.test(event.id)
        || typeof event.universeId !== 'string' || !universeIds.has(event.universeId)
        || typeof event.milestone !== 'string' || !chronicleMilestones.has(event.milestone)
      ) return []
      return [{
        id: event.id,
        universeId: event.universeId as EndgameState['chronicleEvents'][number]['universeId'],
        milestone: event.milestone as EndgameState['chronicleEvents'][number]['milestone'],
        at: integerValue(event.at, 0, 0),
        detail: cleanPlayerLabel(event.detail, 96),
      }]
    }).slice(-512)
    : []

  const beaconNames: Record<string, string> = {}
  if (source.beaconNames && typeof source.beaconNames === 'object' && !Array.isArray(source.beaconNames)) {
    for (const [id, rawName] of Object.entries(source.beaconNames)) {
      const name = cleanBeaconName(rawName)
      if (universeIds.has(id) && name) beaconNames[id] = name
    }
  }

  const lawLoadouts = Array.isArray(source.lawLoadouts)
    ? source.lawLoadouts.flatMap((raw) => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return []
      const item = raw as Record<string, unknown>
      if (
        typeof item.id !== 'string' || !SAFE_ID.test(item.id)
        || typeof item.universeId !== 'string' || !universeIds.has(item.universeId)
      ) return []
      const loadout: EndgameState['lawLoadouts'][number] = {
        id: item.id,
        name: cleanPlayerLabel(item.name),
        universeId: item.universeId as EndgameState['lawLoadouts'][number]['universeId'],
        doctrineId: typeof item.doctrineId === 'string' ? item.doctrineId : '',
        wayfinderLawIds: safeIds(item.wayfinderLawIds, 3),
        archiveShelfId: typeof item.archiveShelfId === 'string' ? item.archiveShelfId : '',
        vestmentId: typeof item.vestmentId === 'string' ? item.vestmentId : '',
        anomalyResponseIds: safeIds(item.anomalyResponseIds, 3),
        automation: item.automation === 'idle' || item.automation === 'balanced' ? item.automation : 'manual',
      }
      return validateLawLoadout(loadout).length === 0 ? [loadout] : []
    }).slice(0, 32)
    : []

  const chronicleBests = Array.isArray(source.chronicleBests)
    ? source.chronicleBests.flatMap((raw) => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return []
      const item = raw as Record<string, unknown>
      const route = typeof item.routeCode === 'string' ? decodeAtlasRoute(item.routeCode) : null
      const durationMs = integerValue(item.durationMs, 0, 1)
      if (!route || durationMs <= 0) return []
      return [{ routeCode: route.code, durationMs, completedAt: integerValue(item.completedAt, 0, 0) }]
    }).slice(0, 128)
    : []

  const atlasCompletions = Array.isArray(source.atlasCompletions)
    ? source.atlasCompletions.flatMap((raw) => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return []
      const item = raw as Record<string, unknown>
      const route = typeof item.routeCode === 'string' ? decodeAtlasRoute(item.routeCode) : null
      const durationMs = integerValue(item.durationMs, 0, 1)
      if (!route || durationMs <= 0 || item.replayDigest !== atlasReplayDigest(route)) return []
      return [{
        routeCode: route.code,
        universeId: route.universeId,
        seed: route.seed,
        durationMs,
        completedAt: integerValue(item.completedAt, 0, 0),
        replayDigest: atlasReplayDigest(route),
      }]
    }).slice(-256)
    : []

  let activeAtlasRoute: EndgameState['activeAtlasRoute'] = null
  if (source.activeAtlasRoute && typeof source.activeAtlasRoute === 'object' && !Array.isArray(source.activeAtlasRoute)) {
    const active = source.activeAtlasRoute as Record<string, unknown>
    const route = typeof active.routeCode === 'string' ? decodeAtlasRoute(active.routeCode) : null
    if (route) activeAtlasRoute = {
      routeCode: route.code,
      universeId: route.universeId,
      seed: route.seed,
      startedAt: integerValue(active.startedAt, 0, 0),
    }
  }

  const successionRelays = Object.fromEntries(
    Object.entries(rankRecord(source.successionRelays, successionRelayIds))
      .map(([id, rank]) => [id, Math.min(MAX_SUCCESSION_RELAY_RANK, rank)]),
  )
  const lumenDistillations: Record<string, number> = {}
  if (source.lumenDistillations && typeof source.lumenDistillations === 'object' && !Array.isArray(source.lumenDistillations)) {
    for (const universe of UNIVERSES) {
      const count = integerValue(
        (source.lumenDistillations as Record<string, unknown>)[universe.id],
        0,
        0,
        MAX_LUMEN_DISTILLATIONS_PER_UNIVERSE,
      )
      if (count > 0) lumenDistillations[universe.id] = count
    }
  }

  return {
    chronicleEvents,
    beaconNames,
    lawLoadouts,
    activeLawLoadoutId: typeof source.activeLawLoadoutId === 'string'
      && lawLoadouts.some((loadout) => loadout.id === source.activeLawLoadoutId)
      ? source.activeLawLoadoutId
      : null,
    chronicleBests,
    atlasCompletions,
    activeAtlasRoute,
    unlockedConvergences: knownStrings(source.unlockedConvergences, convergenceIds),
    gardenEnding: typeof source.gardenEnding === 'string' && gardenEndings.has(source.gardenEnding as GardenEnding)
      ? source.gardenEnding as GardenEnding
      : null,
    gardenSceneSeen: booleanValue(source.gardenSceneSeen, false),
    successionRelays,
    lumenShards: integerValue(source.lumenShards, 0, 0, 1_000_000),
    lumenShardClaims: knownStrings(source.lumenShardClaims, lumenShardClaimIds, lumenShardClaimIds.size),
    lumenPurchases: knownStrings(source.lumenPurchases, lumenVaultItemIds, lumenVaultItemIds.size),
    lumenDistillations,
  }
}

function ownedRecord(value: unknown, allowed: ReadonlySet<string>): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: Record<string, number> = {}
  for (const [id, count] of Object.entries(value)) {
    if (!allowed.has(id)) continue
    const clean = integerValue(count, 0, 0, 1_000_000_000)
    if (clean > 0) result[id] = clean
  }
  return result
}

function rankRecord(value: unknown, allowed: ReadonlySet<string>): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: Record<string, number> = {}
  for (const [id, rank] of Object.entries(value)) {
    if (!allowed.has(id)) continue
    const clean = integerValue(rank, 0, 0, 100)
    if (clean > 0) result[id] = clean
  }
  return result
}

function endingValue(value: unknown): SaveDataV12['ending'] {
  return typeof value === 'string' && ENDINGS.has(value)
    ? (value as SaveDataV12['ending'])
    : null
}

function enumValue<T extends string>(value: unknown, allowed: ReadonlySet<T>, fallback: T): T {
  return typeof value === 'string' && allowed.has(value as T) ? (value as T) : fallback
}

function buyAmountValue(value: unknown): BuyAmount {
  return BUY_AMOUNTS.has(value as BuyAmount) ? (value as BuyAmount) : 1
}

function sanitizeRunSnapshot(
  value: unknown,
  generatorIds: ReadonlySet<string>,
  upgradeIds: ReadonlySet<string>,
): LegacyRunSnapshotV12 | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const source = value as Record<string, unknown>
  const totalEarned = numberValue(source.totalEarned, 0)
  return {
    light: Math.min(numberValue(source.light, 0), totalEarned),
    totalEarned,
    owned: ownedRecord(source.owned, generatorIds),
    upgrades: knownStrings(source.upgrades, upgradeIds),
    buyAmount: buyAmountValue(source.buyAmount),
  }
}

function sanitizeUniverseRun(value: unknown, universeId: string): LegacyUniverseRunStateV12 | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const source = value as Record<string, unknown>
  const pack = universeById(universeId)
  const generatorIds = new Set(pack.generators.map((item) => item.id))
  const upgradeIds = new Set(pack.upgrades.map((item) => item.id))
  const echoIds = new Set(pack.echoes.map((item) => item.id))
  const curiosityIds = new Set(pack.cabinet.items.map((item) => item.id))
  const localSeenIds = new Set(pack.lumen.map((item) => item.id))
  const totalEarned = numberValue(source.totalEarned, 0)
  const stardustTotal = integerValue(source.stardustTotal)
  const singTotal = integerValue(source.singTotal)

  return {
    light: Math.min(numberValue(source.light, 0), totalEarned),
    totalEarned,
    clicks: integerValue(source.clicks),
    owned: ownedRecord(source.owned, generatorIds),
    upgrades: knownStrings(source.upgrades, upgradeIds),
    buyAmount: buyAmountValue(source.buyAmount),
    seen: knownStrings(source.seen, localSeenIds),
    stardust: Math.min(integerValue(source.stardust), stardustTotal),
    stardustTotal,
    supernovae: integerValue(source.supernovae),
    constellation: knownStrings(source.constellation, constellationIds),
    stardustWorks: rankRecord(source.stardustWorks, stardustWorkIds),
    echoes: knownStrings(source.echoes, echoIds),
    eraEarned: numberValue(source.eraEarned, totalEarned),
    singularities: Math.min(integerValue(source.singularities), singTotal),
    singTotal,
    collapses: integerValue(source.collapses),
    singUpgrades: knownStrings(source.singUpgrades, deepUpgradeIds),
    deepWorks: rankRecord(source.deepWorks, deepWorkIds),
    challenge:
      typeof source.challenge === 'string' && challengeIds.has(source.challenge)
        ? source.challenge
        : null,
    challengeReturn: sanitizeRunSnapshot(source.challengeReturn, generatorIds, upgradeIds),
    challengesDone: knownStrings(source.challengesDone, challengeIds),
    autoKindler: booleanValue(source.autoKindler, true),
    autoStoker: booleanValue(source.autoStoker, true),
    autoNova: booleanValue(source.autoNova, false),
    autoNovaThreshold: integerValue(source.autoNovaThreshold, 1, 1, 1_000_000_000),
    ending: endingValue(source.ending),
    curiosities: knownStrings(source.curiosities, curiosityIds),
    keeperFedUntil: integerValue(source.keeperFedUntil, 0, 0),
    snailLastGiftAt: integerValue(source.snailLastGiftAt, 0, 0),
    crits: integerValue(source.crits),
    bestCrit: numberValue(source.bestCrit, 0),
  }
}

function sanitizeUniverseRuns(value: unknown): Record<string, LegacyUniverseRunStateV12> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: Record<string, LegacyUniverseRunStateV12> = {}
  for (const universe of UNIVERSES) {
    const run = sanitizeUniverseRun((value as Record<string, unknown>)[universe.id], universe.id)
    if (run) result[universe.id] = run
  }
  return result
}

/** Migrates an unknown save and returns a complete, content-aware, safe v12 snapshot. */
export function migrateAndSanitizeSaveV12(data: unknown): SaveDataV12 | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  let source = { ...(data as Record<string, unknown>) }
  if (typeof source.version !== 'number' || !Number.isInteger(source.version)) return null
  if (source.version < 1 || source.version > LEGACY_SAVE_VERSION) return null

  while (numberValue(source.version, 0) < LEGACY_SAVE_VERSION) {
    const step = MIGRATIONS[numberValue(source.version, 0)]
    if (!step) return null
    source = step(source)
  }

  const activeUniverse =
    typeof source.activeUniverse === 'string' && universeIds.has(source.activeUniverse)
      ? source.activeUniverse
      : DEFAULT_UNIVERSE_ID
  const pack = universeById(activeUniverse)
  const generatorIds = new Set(pack.generators.map((item) => item.id))
  const upgradeIds = new Set(pack.upgrades.map((item) => item.id))
  const echoIds = new Set(pack.echoes.map((item) => item.id))
  const curiosityIds = new Set(pack.cabinet.items.map((item) => item.id))
  const totalEarned = numberValue(source.totalEarned, 0)
  const stardustTotal = integerValue(source.stardustTotal)
  const singTotal = integerValue(source.singTotal)
  const ending = endingValue(source.ending)

  return {
    version: 12,
    savedAt: integerValue(source.savedAt, Date.now(), 0),
    activeUniverse,
    light: Math.min(numberValue(source.light, 0), totalEarned),
    totalEarned,
    clicks: integerValue(source.clicks),
    owned: ownedRecord(source.owned, generatorIds),
    upgrades: knownStrings(source.upgrades, upgradeIds),
    achievements: knownStrings(source.achievements, achievementIds),
    ui: knownStrings(source.ui, uiIds),
    seen: knownStrings(source.seen, seenIds),
    playtime: numberValue(source.playtime, 0, 0, 1_000_000_000_000),
    sfxVolume: numberValue(source.sfxVolume, 0.5, 0, 1),
    musicVolume: numberValue(source.musicVolume, 0.6, 0, 1),
    motionPreference: enumValue(source.motionPreference, MOTION_PREFERENCES, 'system'),
    visualQuality: enumValue(source.visualQuality, VISUAL_QUALITIES, 'auto'),
    beatVisual: beatVisualValue(source.beatVisual),
    textScale: enumValue(source.textScale, TEXT_SCALES, 'normal'),
    highContrast: booleanValue(source.highContrast, false),
    buyAmount: buyAmountValue(source.buyAmount),
    starsCaught: integerValue(source.starsCaught),
    bestCombo: integerValue(source.bestCombo),
    allTimeEarned: Math.max(numberValue(source.allTimeEarned, totalEarned), totalEarned),
    stardust: Math.min(integerValue(source.stardust), stardustTotal),
    stardustTotal,
    supernovae: integerValue(source.supernovae),
    constellation: knownStrings(source.constellation, constellationIds),
    stardustWorks: rankRecord(source.stardustWorks, stardustWorkIds),
    echoes: knownStrings(source.echoes, echoIds),
    eraEarned: numberValue(source.eraEarned, numberValue(source.allTimeEarned, totalEarned)),
    singularities: Math.min(integerValue(source.singularities), singTotal),
    singTotal,
    collapses: integerValue(source.collapses),
    singUpgrades: knownStrings(source.singUpgrades, deepUpgradeIds),
    deepWorks: rankRecord(source.deepWorks, deepWorkIds),
    challenge:
      typeof source.challenge === 'string' && challengeIds.has(source.challenge)
        ? source.challenge
        : null,
    challengeReturn: sanitizeRunSnapshot(source.challengeReturn, generatorIds, upgradeIds),
    challengesDone: knownStrings(source.challengesDone, challengeIds),
    autoKindler: booleanValue(source.autoKindler, true),
    autoStoker: booleanValue(source.autoStoker, true),
    autoNova: booleanValue(source.autoNova, false),
    autoNovaThreshold: integerValue(source.autoNovaThreshold, 1, 1, 1_000_000_000),
    ending,
    theme:
      typeof source.theme === 'string' && themeIds.has(source.theme) ? source.theme : 'ember',
    remembrances: integerValue(source.remembrances),
    pastEndings: knownStrings(source.pastEndings, ENDINGS) as SaveDataV12['pastEndings'],
    curiosities: knownStrings(source.curiosities, curiosityIds),
    keeperFedUntil: integerValue(source.keeperFedUntil, 0, 0),
    snailLastGiftAt: integerValue(source.snailLastGiftAt, 0, 0),
    crits: integerValue(source.crits),
    bestCrit: numberValue(source.bestCrit, 0),
    beacons: knownStrings(source.beacons, universeIds),
    darkBetween: integerValue(source.darkBetween),
    wayfinder: safeIds(source.wayfinder),
    vesselParts: knownStrings(source.vesselParts, vesselPartIds),
    universeRuns: sanitizeUniverseRuns(source.universeRuns),
  }
}

function requiredAmount(source: Record<string, unknown>, key: string): Amount {
  const value = source[key]
  if (typeof value !== 'string') throw new TypeError(`Required v13 amount ${key} must be a string`)
  return parseAmount(value)
}

function sanitizeNumericLawState(value: unknown): Record<string, Amount> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('v13 numericLawState must be an object')
  }
  const result: Record<string, Amount> = {}
  for (const [id, amount] of Object.entries(value)) {
    if (!SAFE_ID.test(id) || typeof amount !== 'string') {
      throw new TypeError(`Invalid numeric law-state entry ${id}`)
    }
    result[id] = parseAmount(amount)
    if (Object.keys(result).length > 128) throw new RangeError('Too many numeric law-state entries')
  }
  return result
}

function sanitizeLokaProgress(value: unknown): Record<string, number> {
  if (value === undefined) return {}
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('lokaProgress must be an object')
  }
  const result: Record<string, number> = {}
  for (const [id, count] of Object.entries(value)) {
    if (!/^u[567]-[a-z0-9-]+$/.test(id)) throw new TypeError(`Invalid loka progress entry ${id}`)
    result[id] = integerValue(count, 0, 0, 1_000_000_000)
    if (Object.keys(result).length > 32) throw new RangeError('Too many loka progress entries')
  }
  return result
}

function serializeNumericLawState(value: Readonly<Record<string, Amount>>): Record<string, SerializedAmount> {
  return Object.fromEntries(
    Object.entries(value).map(([id, amount]) => [id, serializeAmount(amount)]),
  )
}

function convertRunSnapshotV12(value: LegacyRunSnapshotV12 | null): SaveRunSnapshotV13 | null {
  if (!value) return null
  return {
    ...value,
    light: amountFromNumber(value.light),
    totalEarned: amountFromNumber(value.totalEarned),
    numericLawState: {},
  }
}

function convertUniverseRunV12(value: LegacyUniverseRunStateV12): SaveUniverseRunStateV13 {
  return {
    ...value,
    light: amountFromNumber(value.light),
    totalEarned: amountFromNumber(value.totalEarned),
    stardust: amountFromNumber(value.stardust),
    stardustTotal: amountFromNumber(value.stardustTotal),
    eraEarned: amountFromNumber(value.eraEarned),
    singularities: amountFromNumber(value.singularities),
    singTotal: amountFromNumber(value.singTotal),
    challengeReturn: convertRunSnapshotV12(value.challengeReturn),
    autoNovaThreshold: amountFromNumber(value.autoNovaThreshold),
    bestCrit: amountFromNumber(value.bestCrit),
    numericLawState: {},
    lokaProgress: {},
  }
}

export function convertSaveV12ToV13(value: SaveDataV12): SaveDataV13 {
  return {
    ...value,
    version: 13,
    light: amountFromNumber(value.light),
    totalEarned: amountFromNumber(value.totalEarned),
    allTimeEarned: amountFromNumber(value.allTimeEarned),
    stardust: amountFromNumber(value.stardust),
    stardustTotal: amountFromNumber(value.stardustTotal),
    eraEarned: amountFromNumber(value.eraEarned),
    singularities: amountFromNumber(value.singularities),
    singTotal: amountFromNumber(value.singTotal),
    challengeReturn: convertRunSnapshotV12(value.challengeReturn),
    autoNovaThreshold: amountFromNumber(value.autoNovaThreshold),
    bestCrit: amountFromNumber(value.bestCrit),
    darkBetween: amountFromNumber(value.darkBetween),
    numericLawState: {},
    lokaProgress: {},
    universeRuns: Object.fromEntries(
      Object.entries(value.universeRuns).map(([id, run]) => [id, convertUniverseRunV12(run)]),
    ),
  }
}

function sanitizeRunSnapshotV13(
  value: unknown,
  generatorIds: ReadonlySet<string>,
  upgradeIds: ReadonlySet<string>,
): SaveRunSnapshotV13 | null {
  if (value === null) return null
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('v13 challengeReturn must be null or an object')
  }
  const source = value as Record<string, unknown>
  const totalEarned = requiredAmount(source, 'totalEarned')
  const legacy = sanitizeRunSnapshot(
    { ...source, light: 0, totalEarned: 0 },
    generatorIds,
    upgradeIds,
  )
  if (!legacy) throw new TypeError('Invalid v13 challengeReturn')
  return {
    ...legacy,
    light: minAmount(requiredAmount(source, 'light'), totalEarned),
    totalEarned,
    numericLawState: source.numericLawState === undefined
      ? {}
      : sanitizeNumericLawState(source.numericLawState),
  }
}

function sanitizeUniverseRunV13(value: unknown, universeId: string): SaveUniverseRunStateV13 | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const source = value as Record<string, unknown>
  const pack = universeById(universeId)
  const generatorIds = new Set(pack.generators.map((item) => item.id))
  const upgradeIds = new Set(pack.upgrades.map((item) => item.id))
  const totalEarned = requiredAmount(source, 'totalEarned')
  const stardustTotal = requiredAmount(source, 'stardustTotal')
  const singTotal = requiredAmount(source, 'singTotal')
  const legacy = sanitizeUniverseRun({
    ...source,
    light: 0,
    totalEarned: 0,
    stardust: 0,
    stardustTotal: 0,
    eraEarned: 0,
    singularities: 0,
    singTotal: 0,
    challengeReturn: source.challengeReturn === null
      ? null
      : { ...(source.challengeReturn as Record<string, unknown>), light: 0, totalEarned: 0 },
    autoNovaThreshold: 1,
    bestCrit: 0,
  }, universeId)
  if (!legacy) return null
  return {
    ...legacy,
    light: minAmount(requiredAmount(source, 'light'), totalEarned),
    totalEarned,
    stardust: minAmount(requiredAmount(source, 'stardust'), stardustTotal),
    stardustTotal,
    eraEarned: requiredAmount(source, 'eraEarned'),
    singularities: minAmount(requiredAmount(source, 'singularities'), singTotal),
    singTotal,
    challengeReturn: sanitizeRunSnapshotV13(source.challengeReturn, generatorIds, upgradeIds),
    autoNovaThreshold: maxAmount(ONE_AMOUNT, requiredAmount(source, 'autoNovaThreshold')),
    bestCrit: requiredAmount(source, 'bestCrit'),
    numericLawState: sanitizeNumericLawState(source.numericLawState),
    lokaProgress: sanitizeLokaProgress(source.lokaProgress),
  }
}

function sanitizeUniverseRunsV13(value: unknown): Record<string, SaveUniverseRunStateV13> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: Record<string, SaveUniverseRunStateV13> = {}
  for (const universe of UNIVERSES) {
    const raw = (value as Record<string, unknown>)[universe.id]
    if (raw === undefined) continue
    const run = sanitizeUniverseRunV13(raw, universe.id)
    if (!run) throw new TypeError(`Invalid v13 universe run ${universe.id}`)
    result[universe.id] = run
  }
  return result
}

function legacyUniverseRunsFromV13(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value).map(([id, raw]) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [id, raw]
    const run = raw as Record<string, unknown>
    return [id, {
      ...run,
      light: 0,
      totalEarned: 0,
      stardust: 0,
      stardustTotal: 0,
      eraEarned: 0,
      singularities: 0,
      singTotal: 0,
      challengeReturn: run.challengeReturn === null
        ? null
        : { ...(run.challengeReturn as Record<string, unknown>), light: 0, totalEarned: 0 },
      autoNovaThreshold: 1,
      bestCrit: 0,
    }]
  }))
}

function sanitizeSaveV13(data: unknown): SaveDataV13 | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const source = data as Record<string, unknown>
  if (source.version !== NUMERIC_SAVE_VERSION) return null
  try {
    const totalEarned = requiredAmount(source, 'totalEarned')
    const stardustTotal = requiredAmount(source, 'stardustTotal')
    const singTotal = requiredAmount(source, 'singTotal')
    const legacy = migrateAndSanitizeSaveV12({
      ...source,
      version: 12,
      light: 0,
      totalEarned: 0,
      allTimeEarned: 0,
      stardust: 0,
      stardustTotal: 0,
      eraEarned: 0,
      singularities: 0,
      singTotal: 0,
      challengeReturn: source.challengeReturn === null
        ? null
        : { ...(source.challengeReturn as Record<string, unknown>), light: 0, totalEarned: 0 },
      autoNovaThreshold: 1,
      bestCrit: 0,
      darkBetween: 0,
      universeRuns: legacyUniverseRunsFromV13(source.universeRuns),
    })
    if (!legacy) return null
    const pack = universeById(legacy.activeUniverse)
    return {
      ...legacy,
      version: 13,
      light: minAmount(requiredAmount(source, 'light'), totalEarned),
      totalEarned,
      allTimeEarned: maxAmount(requiredAmount(source, 'allTimeEarned'), totalEarned),
      stardust: minAmount(requiredAmount(source, 'stardust'), stardustTotal),
      stardustTotal,
      eraEarned: requiredAmount(source, 'eraEarned'),
      singularities: minAmount(requiredAmount(source, 'singularities'), singTotal),
      singTotal,
      challengeReturn: sanitizeRunSnapshotV13(
        source.challengeReturn,
        new Set(pack.generators.map((item) => item.id)),
        new Set(pack.upgrades.map((item) => item.id)),
      ),
      autoNovaThreshold: maxAmount(ONE_AMOUNT, requiredAmount(source, 'autoNovaThreshold')),
      bestCrit: requiredAmount(source, 'bestCrit'),
      darkBetween: requiredAmount(source, 'darkBetween'),
      numericLawState: sanitizeNumericLawState(source.numericLawState),
      lokaProgress: sanitizeLokaProgress(source.lokaProgress),
      universeRuns: sanitizeUniverseRunsV13(source.universeRuns),
    }
  } catch {
    return null
  }
}

export function migrateAndSanitizeSaveV13(data: unknown): SaveDataV13 | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const version = (data as Record<string, unknown>).version
  if (version === NUMERIC_SAVE_VERSION) return sanitizeSaveV13(data)
  const legacy = migrateAndSanitizeSaveV12(data)
  return legacy ? convertSaveV12ToV13(legacy) : null
}

function serializeRunSnapshotV13(value: SaveRunSnapshotV13 | null): SerializedRunSnapshotV13 | null {
  if (!value) return null
  return {
    ...value,
    light: serializeAmount(value.light),
    totalEarned: serializeAmount(value.totalEarned),
    numericLawState: serializeNumericLawState(value.numericLawState),
  }
}

function serializeUniverseRunV13(value: SaveUniverseRunStateV13): SerializedUniverseRunStateV13 {
  return {
    ...value,
    light: serializeAmount(value.light),
    totalEarned: serializeAmount(value.totalEarned),
    stardust: serializeAmount(value.stardust),
    stardustTotal: serializeAmount(value.stardustTotal),
    eraEarned: serializeAmount(value.eraEarned),
    singularities: serializeAmount(value.singularities),
    singTotal: serializeAmount(value.singTotal),
    challengeReturn: serializeRunSnapshotV13(value.challengeReturn),
    autoNovaThreshold: serializeAmount(value.autoNovaThreshold),
    bestCrit: serializeAmount(value.bestCrit),
    numericLawState: serializeNumericLawState(value.numericLawState),
  }
}

export function serializeSaveDataV13(value: SaveDataV13): SerializedSaveDataV13 {
  return {
    ...value,
    light: serializeAmount(value.light),
    totalEarned: serializeAmount(value.totalEarned),
    allTimeEarned: serializeAmount(value.allTimeEarned),
    stardust: serializeAmount(value.stardust),
    stardustTotal: serializeAmount(value.stardustTotal),
    eraEarned: serializeAmount(value.eraEarned),
    singularities: serializeAmount(value.singularities),
    singTotal: serializeAmount(value.singTotal),
    challengeReturn: serializeRunSnapshotV13(value.challengeReturn),
    autoNovaThreshold: serializeAmount(value.autoNovaThreshold),
    bestCrit: serializeAmount(value.bestCrit),
    darkBetween: serializeAmount(value.darkBetween),
    numericLawState: serializeNumericLawState(value.numericLawState),
    universeRuns: Object.fromEntries(
      Object.entries(value.universeRuns).map(([id, run]) => [id, serializeUniverseRunV13(run)]),
    ),
  }
}

export function stringifySaveDataV13(value: SaveDataV13): string {
  return JSON.stringify(serializeSaveDataV13(value))
}

function sanitizeVesselPartsByUniverse(
  value: unknown,
  legacy: Pick<SaveDataV13, 'beacons' | 'vesselParts'>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const universe of UNIVERSES) {
      const parts = knownStrings((value as Record<string, unknown>)[universe.id], vesselPartIds)
      if (parts.length > 0) result[universe.id] = parts
    }
  }

  // Historical saves owned one global Vessel, which was constructed in
  // Emberlight. Every already-lit Beacon is also grandfathered as locally
  // complete because that crossing has already happened; the current unlit
  // universe starts its own construction loop from zero.
  if (!result[DEFAULT_UNIVERSE_ID] && legacy.vesselParts.length > 0) {
    result[DEFAULT_UNIVERSE_ID] = [...legacy.vesselParts]
  }
  const complete = VESSEL_PARTS.map(({ id }) => id)
  for (const universeId of legacy.beacons) result[universeId] = [...complete]
  return result
}

export function convertSaveV13ToV22(value: SaveDataV13): SaveDataV22 {
  const endgame = emptyEndgameState()
  endgame.unlockedConvergences = CONVERGENCES
    .filter((convergence) => value.beacons.length >= convergence.requiredBeacons)
    .map((convergence) => convergence.id)
  endgame.lumenShardClaims = value.beacons.map((id) => `beacon-${id}`)
  endgame.lumenShards = endgame.lumenShardClaims.length
  return { ...value, version: 22, endgame }
}

function sanitizeSaveV22(data: unknown): SaveDataV22 | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const source = data as Record<string, unknown>
  if (source.version !== F5_SAVE_VERSION) return null
  const numeric = sanitizeSaveV13({ ...source, version: NUMERIC_SAVE_VERSION })
  if (!numeric) return null
  const endgame = sanitizeEndgameState(source.endgame)
  const rawEndgame = source.endgame && typeof source.endgame === 'object' && !Array.isArray(source.endgame)
    ? source.endgame as Record<string, unknown>
    : null
  if (!rawEndgame || !Object.hasOwn(rawEndgame, 'lumenShardClaims')) {
    endgame.lumenShardClaims = [
      ...numeric.beacons.map((id) => `beacon-${id}`),
      ...new Set(endgame.atlasCompletions.map(({ universeId }) => `atlas-${universeId}`)),
    ]
    endgame.lumenShards = endgame.lumenShardClaims.length
  }
  endgame.unlockedConvergences = [...new Set([
    ...endgame.unlockedConvergences,
    ...CONVERGENCES
      .filter((convergence) => numeric.beacons.length >= convergence.requiredBeacons)
      .map((convergence) => convergence.id),
  ])]
  return { ...numeric, version: 22, endgame }
}

export function migrateAndSanitizeSaveV22(data: unknown): SaveDataV22 | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const version = (data as Record<string, unknown>).version
  if (version === F5_SAVE_VERSION) return sanitizeSaveV22(data)
  const numeric = migrateAndSanitizeSaveV13(data)
  return numeric ? convertSaveV13ToV22(numeric) : null
}

export function serializeSaveDataV22(value: SaveDataV22): SerializedSaveDataV22 {
  return {
    ...serializeSaveDataV13({ ...value, version: 13 }),
    version: 22,
    endgame: value.endgame,
  }
}

export function stringifySaveDataV22(value: SaveDataV22): string {
  return JSON.stringify(serializeSaveDataV22(value))
}

export function convertSaveV22ToV23(value: SaveDataV22): SaveDataV23 {
  return {
    ...value,
    version: 23,
    vesselPartsByUniverse: sanitizeVesselPartsByUniverse(undefined, value),
  }
}

function sanitizeSaveV23(data: unknown): SaveDataV23 | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const source = data as Record<string, unknown>
  if (source.version !== CURRENT_SAVE_VERSION) return null
  const prior = sanitizeSaveV22({ ...source, version: F5_SAVE_VERSION })
  if (!prior) return null
  return {
    ...prior,
    version: 23,
    vesselPartsByUniverse: sanitizeVesselPartsByUniverse(source.vesselPartsByUniverse, prior),
  }
}

export function migrateAndSanitizeSaveV23(data: unknown): SaveDataV23 | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const version = (data as Record<string, unknown>).version
  if (version === CURRENT_SAVE_VERSION) return sanitizeSaveV23(data)
  const prior = migrateAndSanitizeSaveV22(data)
  return prior ? convertSaveV22ToV23(prior) : null
}

export function serializeSaveDataV23(value: SaveDataV23): SerializedSaveDataV23 {
  return {
    ...serializeSaveDataV22({ ...value, version: 22 }),
    version: 23,
    vesselPartsByUniverse: Object.fromEntries(
      Object.entries(value.vesselPartsByUniverse).map(([id, parts]) => [id, [...parts]]),
    ),
  }
}

export function stringifySaveDataV23(value: SaveDataV23): string {
  return JSON.stringify(serializeSaveDataV23(value))
}

/** Current public reader: every accepted historical save returns the complete v23 snapshot. */
export const migrateAndSanitizeSave = migrateAndSanitizeSaveV23
