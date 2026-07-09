import { game, ratePerSec, type BuyAmount, type RunSnapshot } from '../engine/game.svelte'
import { UI_UNLOCKS } from '../content/ui-unlocks'
import { perkBonus } from '../content/constellation'

const KEY = 'ember.save'
const SESSION_KEY = 'ember.session'
const PRESENCE_KEY = 'ember.presence'
const CURRENT_VERSION = 7
const BASE_OFFLINE_EFFICIENCY = 0.5
const BASE_OFFLINE_CAP_HOURS = 2
const ACTIVE_SESSION_GRACE_MS = 90_000
const MIN_OFFLINE_MS = 60_000
const PRESENCE_INTERVAL_MS = 5_000

interface SaveDataV7 {
  version: 7
  savedAt: number
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
  buyAmount: BuyAmount
  starsCaught: number
  bestCombo: number
  allTimeEarned: number
  stardust: number
  stardustTotal: number
  supernovae: number
  constellation: string[]
  echoes: string[]
  eraEarned: number
  singularities: number
  singTotal: number
  collapses: number
  singUpgrades: string[]
  challenge: string | null
  challengeReturn: RunSnapshot | null
  challengesDone: string[]
  autoKindler: boolean
  autoStoker: boolean
  autoNova: boolean
  autoNovaThreshold: number
  ending: 'warden' | 'hunger' | 'companion' | null
  theme?: string
}

/** Step-by-step upgrades from each older version to the next. Never delete these. */
const MIGRATIONS: Record<number, (d: any) => any> = {
  1: (d) => ({
    ...d,
    version: 2,
    upgrades: [],
    // v1 predates purchasable UI — grant panels a player of that wealth would have
    ui: UI_UNLOCKS.filter((u) => (d.totalEarned ?? 0) >= u.cost * 3).map((u) => u.id),
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
    // best available estimate of lifetime light for pre-prestige saves
    allTimeEarned: d.totalEarned ?? 0,
    stardust: 0,
    stardustTotal: 0,
    supernovae: 0,
    constellation: [],
    echoes: [],
  }),
  4: (d) => ({
    ...d,
    version: 5,
    eraEarned: d.allTimeEarned ?? 0,
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
  5: (d) => ({
    ...d,
    version: 6,
    ending: null,
  }),
  6: (d) => ({
    ...d,
    version: 7,
    challengeReturn: null,
  }),
}

function migrate(data: any): SaveDataV7 | null {
  if (!data || typeof data.version !== 'number') return null
  let d = data
  while (d.version < CURRENT_VERSION) {
    const step = MIGRATIONS[d.version]
    if (!step) return null
    d = step(d)
  }
  return d.version === CURRENT_VERSION ? (d as SaveDataV7) : null
}

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

function snapshot(): SaveDataV7 {
  return {
    version: 7,
    savedAt: Date.now(),
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
    echoes: [...game.echoes],
    eraEarned: game.eraEarned,
    singularities: game.singularities,
    singTotal: game.singTotal,
    collapses: game.collapses,
    singUpgrades: [...game.singUpgrades],
    challenge: game.challenge,
    challengeReturn: copyRunSnapshot(game.challengeReturn),
    challengesDone: [...game.challengesDone],
    autoKindler: game.autoKindler,
    autoStoker: game.autoStoker,
    autoNova: game.autoNova,
    autoNovaThreshold: game.autoNovaThreshold,
    ending: game.ending,
    theme: game.theme,
  }
}

function apply(d: SaveDataV7) {
  game.light = d.light ?? 0
  game.totalEarned = d.totalEarned ?? 0
  game.clicks = d.clicks ?? 0
  game.owned = d.owned ?? {}
  game.upgrades = d.upgrades ?? []
  game.achievements = d.achievements ?? []
  game.ui = d.ui ?? []
  game.seen = d.seen ?? []
  game.playtime = d.playtime ?? 0
  game.sfxVolume = d.sfxVolume ?? 0.5
  game.musicVolume = d.musicVolume ?? 0.6
  game.buyAmount = d.buyAmount ?? 1
  game.starsCaught = d.starsCaught ?? 0
  game.bestCombo = d.bestCombo ?? 0
  game.allTimeEarned = d.allTimeEarned ?? d.totalEarned ?? 0
  game.stardust = d.stardust ?? 0
  game.stardustTotal = d.stardustTotal ?? 0
  game.supernovae = d.supernovae ?? 0
  game.constellation = d.constellation ?? []
  game.echoes = d.echoes ?? []
  game.eraEarned = d.eraEarned ?? d.allTimeEarned ?? 0
  game.singularities = d.singularities ?? 0
  game.singTotal = d.singTotal ?? 0
  game.collapses = d.collapses ?? 0
  game.singUpgrades = d.singUpgrades ?? []
  game.challenge = d.challenge ?? null
  game.challengeReturn = copyRunSnapshot(d.challengeReturn)
  game.theme = d.theme ?? 'ember'
  game.challengesDone = d.challengesDone ?? []
  game.autoKindler = d.autoKindler ?? true
  game.autoStoker = d.autoStoker ?? true
  game.autoNova = d.autoNova ?? false
  game.autoNovaThreshold = d.autoNovaThreshold ?? 1
  game.ending = d.ending ?? null
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
  let data: SaveDataV7 | null
  try {
    data = migrate(JSON.parse(raw))
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
    const data = migrate(JSON.parse(json))
    if (!data) return false
    apply(data)
    save()
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
