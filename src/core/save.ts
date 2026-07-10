import { game, ratePerSec, snapshotUniverseRun, type RunSnapshot } from '../engine/game.svelte'
import { perkBonus } from '../content/constellation'
import { migrateAndSanitizeSave, type SaveDataV12 } from './save-data'

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
  }
}

function snapshot(): SaveDataV12 {
  return {
    version: 12,
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
    universeRuns: {
      ...game.universeRuns,
      [game.activeUniverse]: snapshotUniverseRun(),
    },
  }
}

function apply(d: SaveDataV12) {
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
  game.challengesDone = [...d.challengesDone]
  game.autoKindler = d.autoKindler
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
    }]),
  )
}

function parseStored(raw: string | null): SaveDataV12 | null {
  if (!raw) return null
  try {
    return migrateAndSanitizeSave(JSON.parse(raw))
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
  localStorage.setItem(RECENT_BACKUP_KEYS[0], JSON.stringify(clean))
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
    const restored = { ...data, savedAt: Date.now() } satisfies SaveDataV12
    localStorage.setItem(KEY, JSON.stringify(restored))
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
    localStorage.setItem(KEY, JSON.stringify(snapshot()))
  } catch {
    // storage unavailable (private mode, quota) — play on without persistence
  }
}

/** Loads the save if present. Returns pending offline earnings (not yet applied). */
export function load(): number {
  const sameTabSession = hasActiveSession()
  const lastActiveAt = readNumber(PRESENCE_KEY)
  const now = Date.now()
  markActiveSession()
  markPresence()

  let data: SaveDataV12 | null = null
  let recoveredFrom = ''
  try {
    const candidates: Array<[string, string]> = [
      ['primary save', KEY],
      ['newest rolling backup', RECENT_BACKUP_KEYS[0]],
      ['second rolling backup', RECENT_BACKUP_KEYS[1]],
      ['third rolling backup', RECENT_BACKUP_KEYS[2]],
      ['daily backup', DAILY_BACKUP_KEY],
    ]
    for (const [label, key] of candidates) {
      data = parseStored(localStorage.getItem(key))
      if (!data) continue
      if (key !== KEY) {
        recoveredFrom = label
        localStorage.setItem(KEY, JSON.stringify(data))
      }
      break
    }
  } catch {
    return 0
  }
  if (!data) return 0
  recoveryMessage = recoveredFrom ? `Recovered from the ${recoveredFrom}.` : ''
  apply(data)
  const activeReload =
    lastActiveAt > 0 ? now - lastActiveAt < ACTIVE_SESSION_GRACE_MS : sameTabSession
  if (activeReload) {
    save()
    return 0
  }
  const efficiency = BASE_OFFLINE_EFFICIENCY + perkBonus(game.constellation, 'offline')
  const capSeconds = (BASE_OFFLINE_CAP_HOURS + perkBonus(game.constellation, 'offlineCap')) * 3600
  const lastMeaningfulActivity = Math.max(data.savedAt ?? now, lastActiveAt)
  const elapsedMs = Math.max(0, now - lastMeaningfulActivity)
  if (elapsedMs < MIN_OFFLINE_MS) return 0
  const elapsed = elapsedMs / 1000
  const counted = Math.min(elapsed, capSeconds)
  return ratePerSec() * counted * Math.min(1, efficiency)
}

export function exportSave(): string {
  const json = JSON.stringify(snapshot())
  return btoa(unescape(encodeURIComponent(json)))
}

export function importSave(code: string): boolean {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())))
    const data = migrateAndSanitizeSave(JSON.parse(json))
    if (!data) return false
    const committed = { ...data, savedAt: Date.now() }
    const current = localStorage.getItem(KEY)
    if (current) writeRecentBackup(current)
    localStorage.setItem(KEY, JSON.stringify(committed))
    apply(committed)
    return true
  } catch {
    return false
  }
}

/** Replaces the stored snapshot without mutating the mounted game. Used by dev scenarios before mount. */
export function replaceStoredSave(data: unknown): boolean {
  const clean = migrateAndSanitizeSave(data)
  if (!clean) return false
  try {
    localStorage.setItem(KEY, JSON.stringify(clean))
    return true
  } catch {
    return false
  }
}

export function hardReset() {
  try {
    for (const key of [KEY, ...RECENT_BACKUP_KEYS, DAILY_BACKUP_KEY, BACKUP_AT_KEY, BACKUP_DAY_KEY]) {
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
