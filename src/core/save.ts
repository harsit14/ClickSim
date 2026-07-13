import { applyF4LawEvents, game, ratePerSec, snapshotUniverseRun, type RunSnapshot } from '../engine/game.svelte'
import { perkBonus } from '../content/constellation'
import { universeById } from '../content/universes'
import { advanceVerdanceCohortLawState } from '../content/universes/verdance/runtime'
import { advanceF4LawState } from '../content/universes/f4-runtime'
import {
  LEGACY_SAVE_VERSION,
  migrateAndSanitizeSave,
  stringifySaveDataV23,
  type SaveDataV23,
} from './save-data'
import {
  decodeSaveImportCode,
  type SaveImportResult,
} from './save-import'
export { describeSaveImportFailure } from './save-import'
export type { SaveImportFailure, SaveImportResult } from './save-import'
import type { EconomyAmount } from '../content/universes/types'
import {
  ZERO_AMOUNT,
  multiplyAmountByNumber,
} from './numeric/amount'
import { commitV13Migration, V12_ROLLBACK_KEY } from './numeric/save-transaction'

const KEY = 'ember.save'
const RECENT_BACKUP_KEYS = ['ember.save.backup.1', 'ember.save.backup.2', 'ember.save.backup.3'] as const
const DAILY_BACKUP_KEY = 'ember.save.backup.daily'
const BACKUP_AT_KEY = 'ember.save.backup.at'
const BACKUP_DAY_KEY = 'ember.save.backup.day'
const SESSION_KEY = 'ember.session'
const PRESENCE_KEY = 'ember.presence'
const BASE_OFFLINE_EFFICIENCY = 0.5
const BASE_OFFLINE_CAP_HOURS = 2
const ACTIVE_SESSION_GRACE_MS = 90_000
const MIN_OFFLINE_MS = 60_000
const PRESENCE_INTERVAL_MS = 5_000
const BACKUP_INTERVAL_MS = 5 * 60_000

export type SaveBackupId = 'recent-1' | 'recent-2' | 'recent-3' | 'daily'

export interface SaveBackupSummary {
  id: SaveBackupId
  savedAt: number
  kind: 'recent' | 'daily'
}

let recoveryMessage = ''

function copyRunSnapshot(snapshot: RunSnapshot | null | undefined): RunSnapshot | null {
  if (!snapshot) return null
  return {
    light: snapshot.light,
    totalEarned: snapshot.totalEarned,
    owned: { ...snapshot.owned },
    upgrades: [...snapshot.upgrades],
    buyAmount: snapshot.buyAmount,
    numericLawState: { ...snapshot.numericLawState },
  }
}

function snapshot(): SaveDataV23 {
  return {
    version: 23,
    savedAt: Date.now(),
    activeUniverse: game.activeUniverse,
    light: game.light,
    totalEarned: game.totalEarned,
    clicks: game.clicks,
    owned: { ...game.owned },
    upgrades: [...game.upgrades],
    achievements: [...game.achievements],
    ui: [...game.ui],
    seen: [...game.seen],
    playtime: game.playtime,
    sfxVolume: game.sfxVolume,
    musicVolume: game.musicVolume,
    motionPreference: game.motionPreference,
    visualQuality: game.visualQuality,
    beatVisual: game.beatVisual,
    textScale: game.textScale,
    highContrast: game.highContrast,
    buyAmount: game.buyAmount,
    starsCaught: game.starsCaught,
    bestCombo: game.bestCombo,
    allTimeEarned: game.allTimeEarned,
    stardust: game.stardust,
    stardustTotal: game.stardustTotal,
    supernovae: game.supernovae,
    constellation: [...game.constellation],
    stardustWorks: { ...game.stardustWorks },
    echoes: [...game.echoes],
    eraEarned: game.eraEarned,
    singularities: game.singularities,
    singTotal: game.singTotal,
    collapses: game.collapses,
    singUpgrades: [...game.singUpgrades],
    deepWorks: { ...game.deepWorks },
    challenge: game.challenge,
    challengeReturn: copyRunSnapshot(game.challengeReturn),
    challengesDone: [...game.challengesDone],
    autoKindler: game.autoKindler,
    autoKindlerFamilies: [...game.autoKindlerFamilies],
    autoKindlerPriority: game.autoKindlerPriority,
    autoStoker: game.autoStoker,
    autoNova: game.autoNova,
    autoNovaThreshold: game.autoNovaThreshold,
    ending: game.ending,
    theme: game.theme,
    remembrances: game.remembrances,
    pastEndings: [...game.pastEndings],
    curiosities: [...game.curiosities],
    keeperFedUntil: game.keeperFedUntil,
    snailLastGiftAt: game.snailLastGiftAt,
    crits: game.crits,
    bestCrit: game.bestCrit,
    beacons: [...game.beacons],
    darkBetween: game.darkBetween,
    wayfinder: [...game.wayfinder],
    vesselParts: [...game.vesselParts],
    vesselPartsByUniverse: Object.fromEntries(
      Object.entries(game.vesselPartsByUniverse).map(([id, parts]) => [id, [...parts]]),
    ),
    universeRuns: game.activeAtlasRoute
      ? { ...game.universeRuns }
      : { ...game.universeRuns, [game.activeUniverse]: snapshotUniverseRun() },
    numericLawState: { ...game.numericLawState },
    lokaProgress: { ...game.lokaProgress },
    endgame: {
      chronicleEvents: game.chronicleEvents.map((event) => ({ ...event })),
      beaconNames: { ...game.beaconNames },
      lawLoadouts: game.lawLoadouts.map((loadout) => ({
        ...loadout,
        wayfinderLawIds: [...loadout.wayfinderLawIds],
        anomalyResponseIds: [...loadout.anomalyResponseIds],
      })),
      activeLawLoadoutId: game.activeLawLoadoutId,
      chronicleBests: game.chronicleBests.map((best) => ({ ...best })),
      atlasCompletions: game.atlasCompletions.map((completion) => ({ ...completion })),
      activeAtlasRoute: game.activeAtlasRoute ? { ...game.activeAtlasRoute } : null,
      unlockedConvergences: [...game.unlockedConvergences],
      gardenEnding: game.gardenEnding,
      gardenSceneSeen: game.gardenSceneSeen,
      successionRelays: { ...game.successionRelays },
      lumenShards: game.lumenShards,
      lumenShardClaims: [...game.lumenShardClaims],
      lumenPurchases: [...game.lumenPurchases],
      lumenDistillations: { ...game.lumenDistillations },
    },
  }
}

function apply(d: SaveDataV23) {
  game.activeUniverse = d.activeUniverse
  game.light = d.light
  game.totalEarned = d.totalEarned
  game.clicks = d.clicks
  game.owned = { ...d.owned }
  game.upgrades = [...d.upgrades]
  game.achievements = [...d.achievements]
  game.ui = [...d.ui]
  game.seen = [...d.seen]
  game.playtime = d.playtime
  game.sfxVolume = d.sfxVolume
  game.musicVolume = d.musicVolume
  game.motionPreference = d.motionPreference
  game.visualQuality = d.visualQuality
  game.beatVisual = d.beatVisual
  game.textScale = d.textScale
  game.highContrast = d.highContrast
  game.buyAmount = d.buyAmount
  game.starsCaught = d.starsCaught
  game.bestCombo = d.bestCombo
  game.allTimeEarned = d.allTimeEarned
  game.stardust = d.stardust
  game.stardustTotal = d.stardustTotal
  game.supernovae = d.supernovae
  game.constellation = [...d.constellation]
  game.stardustWorks = { ...d.stardustWorks }
  game.echoes = [...d.echoes]
  game.eraEarned = d.eraEarned
  game.singularities = d.singularities
  game.singTotal = d.singTotal
  game.collapses = d.collapses
  game.singUpgrades = [...d.singUpgrades]
  game.deepWorks = { ...d.deepWorks }
  game.challenge = d.challenge
  game.challengeReturn = copyRunSnapshot(d.challengeReturn)
  game.theme = d.theme
  game.remembrances = d.remembrances
  game.pastEndings = [...d.pastEndings]
  game.curiosities = [...d.curiosities]
  game.keeperFedUntil = d.keeperFedUntil
  game.snailLastGiftAt = d.snailLastGiftAt
  game.crits = d.crits
  game.bestCrit = d.bestCrit
  game.beacons = [...d.beacons]
  game.darkBetween = d.darkBetween
  game.wayfinder = [...d.wayfinder]
  game.vesselParts = [...d.vesselParts]
  game.vesselPartsByUniverse = Object.fromEntries(
    Object.entries(d.vesselPartsByUniverse).map(([id, parts]) => [id, [...parts]]),
  )
  game.challengesDone = [...d.challengesDone]
  game.autoKindler = d.autoKindler
  game.autoKindlerFamilies = [...d.autoKindlerFamilies]
  game.autoKindlerPriority = d.autoKindlerPriority
  game.autoStoker = d.autoStoker
  game.autoNova = d.autoNova
  game.autoNovaThreshold = d.autoNovaThreshold
  game.ending = d.ending
  game.universeRuns = Object.fromEntries(
    Object.entries(d.universeRuns).map(([id, run]) => [id, {
      ...run,
      owned: { ...run.owned },
      upgrades: [...run.upgrades],
      seen: [...run.seen],
      constellation: [...run.constellation],
      stardustWorks: { ...run.stardustWorks },
      echoes: [...run.echoes],
      singUpgrades: [...run.singUpgrades],
      deepWorks: { ...run.deepWorks },
      challengeReturn: copyRunSnapshot(run.challengeReturn),
      challengesDone: [...run.challengesDone],
      curiosities: [...run.curiosities],
      numericLawState: { ...run.numericLawState },
      lokaProgress: { ...run.lokaProgress },
    }]),
  )
  game.numericLawState = { ...d.numericLawState }
  game.lokaProgress = { ...d.lokaProgress }
  game.chronicleEvents = d.endgame.chronicleEvents.map((event) => ({ ...event }))
  game.beaconNames = { ...d.endgame.beaconNames }
  game.lawLoadouts = d.endgame.lawLoadouts.map((loadout) => ({
    ...loadout,
    wayfinderLawIds: [...loadout.wayfinderLawIds],
    anomalyResponseIds: [...loadout.anomalyResponseIds],
  }))
  game.activeLawLoadoutId = d.endgame.activeLawLoadoutId
  game.chronicleBests = d.endgame.chronicleBests.map((best) => ({ ...best }))
  game.atlasCompletions = d.endgame.atlasCompletions.map((completion) => ({ ...completion }))
  game.activeAtlasRoute = d.endgame.activeAtlasRoute ? { ...d.endgame.activeAtlasRoute } : null
  game.unlockedConvergences = [...d.endgame.unlockedConvergences]
  game.gardenEnding = d.endgame.gardenEnding
  game.gardenSceneSeen = d.endgame.gardenSceneSeen
  game.successionRelays = { ...d.endgame.successionRelays }
  game.lumenShards = d.endgame.lumenShards
  game.lumenShardClaims = [...d.endgame.lumenShardClaims]
  game.lumenPurchases = [...d.endgame.lumenPurchases]
  game.lumenDistillations = { ...d.endgame.lumenDistillations }
}

function parseStored(raw: string | null): SaveDataV23 | null {
  if (!raw) return null
  try {
    return migrateAndSanitizeSave(JSON.parse(raw))
  } catch {
    return null
  }
}

function storedVersion(raw: string): number | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    const version = (parsed as Record<string, unknown>).version
    return typeof version === 'number' && Number.isInteger(version) ? version : null
  } catch {
    return null
  }
}

function writeRecentBackup(raw: string) {
  const clean = parseStored(raw)
  if (!clean) return
  for (let index = RECENT_BACKUP_KEYS.length - 1; index > 0; index--) {
    const previous = localStorage.getItem(RECENT_BACKUP_KEYS[index - 1])
    if (previous) localStorage.setItem(RECENT_BACKUP_KEYS[index], previous)
  }
  localStorage.setItem(RECENT_BACKUP_KEYS[0], stringifySaveDataV23(clean))
}

function maybeBackup(raw: string | null, now: number) {
  if (!raw || !parseStored(raw)) return

  const day = new Date(now).toISOString().slice(0, 10)
  if (localStorage.getItem(BACKUP_DAY_KEY) !== day) {
    localStorage.setItem(DAILY_BACKUP_KEY, raw)
    localStorage.setItem(BACKUP_DAY_KEY, day)
  }

  const lastBackupAt = Number(localStorage.getItem(BACKUP_AT_KEY)) || 0
  if (now - lastBackupAt < BACKUP_INTERVAL_MS) return
  writeRecentBackup(raw)
  localStorage.setItem(BACKUP_AT_KEY, String(now))
}

const BACKUP_KEY_BY_ID: Record<SaveBackupId, string> = {
  'recent-1': RECENT_BACKUP_KEYS[0],
  'recent-2': RECENT_BACKUP_KEYS[1],
  'recent-3': RECENT_BACKUP_KEYS[2],
  daily: DAILY_BACKUP_KEY,
}

export function listSaveBackups(): SaveBackupSummary[] {
  const result: SaveBackupSummary[] = []
  try {
    for (const [id, key] of Object.entries(BACKUP_KEY_BY_ID) as Array<[SaveBackupId, string]>) {
      const data = parseStored(localStorage.getItem(key))
      if (!data) continue
      result.push({ id, savedAt: data.savedAt, kind: id === 'daily' ? 'daily' : 'recent' })
    }
  } catch {
    return []
  }
  return result.sort((a, b) => b.savedAt - a.savedAt)
}

export function restoreSaveBackup(id: SaveBackupId): boolean {
  try {
    const data = parseStored(localStorage.getItem(BACKUP_KEY_BY_ID[id]))
    if (!data) return false
    const current = localStorage.getItem(KEY)
    if (current) writeRecentBackup(current)
    const restored = { ...data, savedAt: Date.now() } satisfies SaveDataV23
    localStorage.setItem(KEY, stringifySaveDataV23(restored))
    apply(restored)
    return true
  } catch {
    return false
  }
}

export function saveRecoveryMessage(): string {
  return recoveryMessage
}

function readNumber(key: string): number {
  try {
    return Number(localStorage.getItem(key)) || 0
  } catch {
    return 0
  }
}

function markActiveSession() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    // session storage unavailable — offline rewards still use the presence heartbeat
  }
}

function hasActiveSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function markPresence() {
  if (document.visibilityState !== 'visible') return
  try {
    localStorage.setItem(PRESENCE_KEY, String(Date.now()))
  } catch {
    // ignore
  }
}

export function save() {
  try {
    const now = Date.now()
    maybeBackup(localStorage.getItem(KEY), now)
    localStorage.setItem(KEY, stringifySaveDataV23(snapshot()))
  } catch {
    // storage unavailable (private mode, quota) — play on without persistence
  }
}

/** Loads the save if present. Returns pending offline earnings (not yet applied). */
export function load(): EconomyAmount {
  const sameTabSession = hasActiveSession()
  const lastActiveAt = readNumber(PRESENCE_KEY)
  const now = Date.now()
  markActiveSession()
  markPresence()

  let data: SaveDataV23 | null = null
  let recoveredFrom = ''
  let migratedFromV12 = false
  try {
    const candidates: Array<[string, string]> = [
      ['primary save', KEY],
      ['newest rolling backup', RECENT_BACKUP_KEYS[0]],
      ['second rolling backup', RECENT_BACKUP_KEYS[1]],
      ['third rolling backup', RECENT_BACKUP_KEYS[2]],
      ['daily backup', DAILY_BACKUP_KEY],
    ]
    for (const [label, key] of candidates) {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const version = storedVersion(raw)
      if (version !== null && version <= 12) {
        const numeric = commitV13Migration(localStorage, KEY, raw)
        data = numeric ? migrateAndSanitizeSave(numeric) : null
        migratedFromV12 = data !== null
        if (data) localStorage.setItem(KEY, stringifySaveDataV23(data))
      } else {
        data = parseStored(raw)
      }
      if (!data) continue
      if (key !== KEY) {
        recoveredFrom = label
        if (!migratedFromV12) localStorage.setItem(KEY, stringifySaveDataV23(data))
      }
      break
    }
  } catch {
    return ZERO_AMOUNT
  }
  if (!data) return ZERO_AMOUNT
  const messages: string[] = []
  if (recoveredFrom) messages.push(`Recovered from the ${recoveredFrom}.`)
  if (migratedFromV12) {
    messages.push('Save upgraded through the numeric migration to v23. Your original v12 save is preserved for recovery and export.')
  }
  recoveryMessage = messages.join(' ')
  apply(data)
  const activeReload =
    lastActiveAt > 0 ? now - lastActiveAt < ACTIVE_SESSION_GRACE_MS : sameTabSession
  if (activeReload) {
    save()
    return ZERO_AMOUNT
  }
  const efficiency = BASE_OFFLINE_EFFICIENCY + perkBonus(game.constellation, 'offline')
  const capSeconds = (BASE_OFFLINE_CAP_HOURS + perkBonus(game.constellation, 'offlineCap')) * 3600
  const lastMeaningfulActivity = Math.max(data.savedAt ?? now, lastActiveAt)
  const elapsedMs = Math.max(0, now - lastMeaningfulActivity)
  if (elapsedMs < MIN_OFFLINE_MS) return ZERO_AMOUNT
  const elapsed = elapsedMs / 1000
  const counted = Math.min(elapsed, capSeconds)
  if (game.activeUniverse === 'verdance') {
    const generatorIds = universeById('verdance').generators.map(({ id }) => id)
    advanceVerdanceCohortLawState(game.numericLawState, game.owned, generatorIds, counted * 500)
    const midpointRate = ratePerSec()
    advanceVerdanceCohortLawState(game.numericLawState, game.owned, generatorIds, counted * 500)
    return multiplyAmountByNumber(midpointRate, counted * Math.min(1, efficiency))
  }
  if (game.activeUniverse === 'prismata' || game.activeUniverse === 'tempest') {
    const context = { upgrades: game.upgrades, archiveCount: game.curiosities.length, promptsPaused: game.challenge !== null }
    applyF4LawEvents(advanceF4LawState(game.activeUniverse, game.numericLawState, game.owned, counted * 0.5, context))
    const midpointRate = ratePerSec()
    applyF4LawEvents(advanceF4LawState(game.activeUniverse, game.numericLawState, game.owned, counted * 0.5, context))
    return multiplyAmountByNumber(midpointRate, counted * Math.min(1, efficiency))
  }
  if (game.activeUniverse === 'canticle') {
    applyF4LawEvents(advanceF4LawState(game.activeUniverse, game.numericLawState, game.owned, counted, {
      upgrades: game.upgrades,
      archiveCount: game.curiosities.length,
      promptsPaused: game.challenge !== null,
    }))
  }
  return multiplyAmountByNumber(ratePerSec(), counted * Math.min(1, efficiency))
}

export function exportSave(): string {
  const json = stringifySaveDataV23(snapshot())
  return btoa(unescape(encodeURIComponent(json)))
}

/** Exports the exact dedicated pre-v13 rollback snapshot without converting it down. */
export function exportV12Rollback(): string | null {
  try {
    const raw = localStorage.getItem(V12_ROLLBACK_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { version?: unknown }
    if (!parsed || typeof parsed !== 'object' || parsed.version !== 12) return null
    return btoa(unescape(encodeURIComponent(raw)))
  } catch {
    return null
  }
}

export function importSaveDetailed(code: string): SaveImportResult {
  const decoded = decodeSaveImportCode(code)
  if (!('json' in decoded)) return { ok: false, failure: decoded }
  try {
    let data = migrateAndSanitizeSave(decoded.parsed)
    if (!data) return { ok: false, failure: { reason: 'damaged-save', version: decoded.version } }
    const current = localStorage.getItem(KEY)
    if (current) writeRecentBackup(current)
    if (decoded.version <= LEGACY_SAVE_VERSION) {
      const numeric = commitV13Migration(localStorage, KEY, decoded.json, Date.now())
      data = numeric ? migrateAndSanitizeSave(numeric) : null
      if (!data) return { ok: false, failure: { reason: 'migration-failed', version: decoded.version } }
      localStorage.setItem(KEY, stringifySaveDataV23(data))
      recoveryMessage = 'Imported save upgraded through the numeric migration to v23. The original v12 data is preserved for recovery and export.'
    } else {
      data = { ...data, savedAt: Date.now() }
      localStorage.setItem(KEY, stringifySaveDataV23(data))
      recoveryMessage = ''
    }
    apply(data)
    return { ok: true }
  } catch {
    return { ok: false, failure: { reason: 'storage-unavailable' } }
  }
}

export function importSave(code: string): boolean {
  return importSaveDetailed(code).ok
}

/** Replaces the stored snapshot without mutating the mounted game. Used by dev scenarios before mount. */
export function replaceStoredSave(data: unknown): boolean {
  let candidate = data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const source = data as Record<string, unknown>
    if (source.version === 23 && source.light && typeof source.light === 'object') {
      try {
        candidate = JSON.parse(stringifySaveDataV23(data as SaveDataV23))
      } catch {
        return false
      }
    }
  }
  const clean = migrateAndSanitizeSave(candidate)
  if (!clean) return false
  try {
    localStorage.setItem(KEY, stringifySaveDataV23(clean))
    return true
  } catch {
    return false
  }
}

export function hardReset() {
  try {
    for (const key of [KEY, V12_ROLLBACK_KEY, ...RECENT_BACKUP_KEYS, DAILY_BACKUP_KEY, BACKUP_AT_KEY, BACKUP_DAY_KEY]) {
      localStorage.removeItem(key)
    }
  } catch {
    // ignore
  }
}

export function startAutosave() {
  markPresence()
  setInterval(markPresence, PRESENCE_INTERVAL_MS)
  setInterval(save, 30_000)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save()
    else markPresence()
  })
  window.addEventListener('beforeunload', save)
}
