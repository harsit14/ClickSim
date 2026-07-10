import { ACHIEVEMENTS } from '../content/achievements'
import { CHALLENGES } from '../content/challenges'
import { CONSTELLATION } from '../content/constellation'
import { DEEP_UPGRADES } from '../content/deep'
import { THEMES } from '../content/themes'
import { UI_UNLOCKS } from '../content/ui-unlocks'
import { DEFAULT_UNIVERSE_ID, UNIVERSES, universeById } from '../content/universes'
import { VESSEL_PARTS } from '../content/vessel'
import { DEEP_WORKS, STARDUST_WORKS } from '../content/repeatables'
import type { BuyAmount, RunSnapshot, UniverseRunState } from '../engine/game.svelte'
import type { BeatVisual, MotionPreference, TextScale, VisualQuality } from './preferences'

export const CURRENT_SAVE_VERSION = 12

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
  challengeReturn: RunSnapshot | null
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
  universeRuns: Record<string, UniverseRunState>
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
    beatVisual: d.beatVisual ?? 'subtle',
    textScale: d.textScale ?? 'normal',
    highContrast: d.highContrast ?? false,
  }),
}

const BUY_AMOUNTS = new Set<BuyAmount>([1, 10, 100, 'max'])
const ENDINGS = new Set<string>(['warden', 'hunger', 'companion'])
const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,63}$/
const MOTION_PREFERENCES = new Set<MotionPreference>(['system', 'reduced'])
const VISUAL_QUALITIES = new Set<VisualQuality>(['auto', 'high', 'balanced', 'low'])
const BEAT_VISUALS = new Set<BeatVisual>(['subtle', 'strong', 'off'])
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

function numberValue(value: unknown, fallback: number, min = 0, max = Number.MAX_VALUE): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, value))
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
): RunSnapshot | null {
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

function sanitizeUniverseRun(value: unknown, universeId: string): UniverseRunState | null {
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

function sanitizeUniverseRuns(value: unknown): Record<string, UniverseRunState> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: Record<string, UniverseRunState> = {}
  for (const universe of UNIVERSES) {
    const run = sanitizeUniverseRun((value as Record<string, unknown>)[universe.id], universe.id)
    if (run) result[universe.id] = run
  }
  return result
}

/** Migrates an unknown save and returns a complete, content-aware, safe v12 snapshot. */
export function migrateAndSanitizeSave(data: unknown): SaveDataV12 | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  let source = { ...(data as Record<string, unknown>) }
  if (typeof source.version !== 'number' || !Number.isInteger(source.version)) return null
  if (source.version < 1 || source.version > CURRENT_SAVE_VERSION) return null

  while (numberValue(source.version, 0) < CURRENT_SAVE_VERSION) {
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
    beatVisual: enumValue(source.beatVisual, BEAT_VISUALS, 'subtle'),
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
