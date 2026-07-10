import { game, ratePerSec, snapshotUniverseRun, type RunSnapshot } from '../engine/game.svelte'
import { perkBonus } from '../content/constellation'
import { migrateAndSanitizeSave, type SaveDataV11 } from './save-data'

const KEY = 'ember.save'
const SESSION_KEY = 'ember.session'
const PRESENCE_KEY = 'ember.presence'
const BASE_OFFLINE_EFFICIENCY = 0.5
const BASE_OFFLINE_CAP_HOURS = 2
const ACTIVE_SESSION_GRACE_MS = 90_000
const MIN_OFFLINE_MS = 60_000
const PRESENCE_INTERVAL_MS = 5_000

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

function snapshot(): SaveDataV11 {
  return {
    version: 11,
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

function apply(d: SaveDataV11) {
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

  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    return 0
  }
  if (!raw) return 0
  let data: SaveDataV11 | null
  try {
    data = migrateAndSanitizeSave(JSON.parse(raw))
  } catch {
    return 0
  }
  if (!data) return 0
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
    localStorage.removeItem(KEY)
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
