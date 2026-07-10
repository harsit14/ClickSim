import { THEMES } from '../content/themes'
import { UNIVERSES, V2_UNIVERSE_BY_ID, type UniverseId } from '../content/universes'
import { WAYFINDER_NODES } from '../content/wayfinder'
import type {
  ChronicleBest,
  ChronicleEvent,
  ChronicleMilestone,
  LawLoadout,
} from './types'

const LOADOUT_NAME_LIMIT = 32
const BEACON_NAME_LIMIT = 32
const AUTOMATION = ['manual', 'balanced', 'idle'] as const

function checksum(text: string): string {
  let value = 0x811c9dc5
  for (const character of text) {
    value ^= character.charCodeAt(0)
    value = Math.imul(value, 0x01000193)
  }
  return (value >>> 0).toString(36).slice(-4).padStart(4, '0')
}

export function cleanPlayerLabel(value: unknown, limit = LOADOUT_NAME_LIMIT): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, limit)
}

export function cleanBeaconName(value: unknown): string {
  return cleanPlayerLabel(value, BEACON_NAME_LIMIT)
}

export function recordChronicleEvent(
  events: readonly ChronicleEvent[],
  universeId: UniverseId,
  milestone: ChronicleMilestone,
  at: number,
  detail: string,
): ChronicleEvent[] {
  if (!Number.isFinite(at) || at < 0) return [...events]
  const safeDetail = cleanPlayerLabel(detail, 96)
  const identity = `${universeId}:${milestone}:${Math.floor(at)}:${safeDetail}`
  const event: ChronicleEvent = {
    id: `chronicle-${checksum(identity)}-${Math.floor(at).toString(36)}`,
    universeId,
    milestone,
    at: Math.floor(at),
    detail: safeDetail,
  }
  if (events.some((entry) => entry.id === event.id)) return [...events]
  return [...events, event]
    .sort((left, right) => left.at - right.at || left.id.localeCompare(right.id))
    .slice(-512)
}

export function chronicleTimeline(events: readonly ChronicleEvent[]): readonly ChronicleEvent[] {
  return [...events].sort((left, right) => left.at - right.at || left.id.localeCompare(right.id))
}

export function chronicleMilestonesByUniverse(
  events: readonly ChronicleEvent[],
): Readonly<Record<UniverseId, readonly ChronicleEvent[]>> {
  return Object.fromEntries(UNIVERSES.map((universe) => [
    universe.id,
    chronicleTimeline(events.filter((event) => event.universeId === universe.id)),
  ])) as Readonly<Record<UniverseId, readonly ChronicleEvent[]>>
}

function indexOfId(items: readonly { readonly id: string }[], id: string): number {
  return items.findIndex((entry) => entry.id === id)
}

export function validateLawLoadout(loadout: LawLoadout): readonly string[] {
  const issues: string[] = []
  const pack = V2_UNIVERSE_BY_ID.get(loadout.universeId)
  if (!pack) return ['loadout universe is unknown']
  if (!cleanPlayerLabel(loadout.name)) issues.push('loadout name is empty')
  if (!pack.economy.doctrines.some((entry) => entry.id === loadout.doctrineId)) issues.push('local doctrine is unknown')
  if (loadout.wayfinderLawIds.length > 3 || new Set(loadout.wayfinderLawIds).size !== loadout.wayfinderLawIds.length) issues.push('Wayfinder selection must contain up to three unique laws')
  if (loadout.wayfinderLawIds.some((id) => !WAYFINDER_NODES.some((entry) => entry.id === id))) issues.push('Wayfinder law is unknown')
  if (!pack.archive.shelves.some((entry) => entry.id === loadout.archiveShelfId)) issues.push('Archive shelf is unknown')
  if (!THEMES.some((entry) => entry.id === loadout.vestmentId)) issues.push('Heart vestment is unknown')
  if (!AUTOMATION.includes(loadout.automation)) issues.push('automation profile is unknown')
  if (loadout.anomalyResponseIds.length > 3 || new Set(loadout.anomalyResponseIds).size !== loadout.anomalyResponseIds.length) issues.push('anomaly responses must contain up to three unique IDs')
  if (loadout.anomalyResponseIds.some((id) => !/^[a-z0-9][a-z0-9-]{0,63}$/.test(id))) issues.push('anomaly response ID is invalid')
  return issues
}

export function lawLoadoutOwnershipIssues(
  loadout: LawLoadout,
  ownedWayfinder: readonly string[],
  unlockedThemes: readonly string[],
): readonly string[] {
  const issues = [...validateLawLoadout(loadout)]
  if (loadout.wayfinderLawIds.some((id) => !ownedWayfinder.includes(id))) issues.push('loadout references a Wayfinder law not owned by this save')
  if (!unlockedThemes.includes(loadout.vestmentId)) issues.push('loadout references a vestment not unlocked by this save')
  return issues
}

export function encodeLawLoadout(loadout: LawLoadout): string {
  const issues = validateLawLoadout(loadout)
  if (issues.length > 0) throw new TypeError(`Invalid law loadout: ${issues.join('; ')}`)
  const pack = V2_UNIVERSE_BY_ID.get(loadout.universeId)!
  const values = [
    indexOfId(UNIVERSES, loadout.universeId),
    indexOfId(pack.economy.doctrines, loadout.doctrineId),
    loadout.wayfinderLawIds.reduce((mask, id) => mask | (1 << indexOfId(WAYFINDER_NODES, id)), 0),
    indexOfId(pack.archive.shelves, loadout.archiveShelfId),
    indexOfId(THEMES, loadout.vestmentId),
    AUTOMATION.indexOf(loadout.automation),
  ]
  const body = values.map((value) => value.toString(36)).join('.')
  return `L1-${body}-${checksum(body)}`
}

export function decodeLawLoadout(code: string, name = 'Imported route'): LawLoadout | null {
  const canonical = code.trim().toLowerCase()
  const match = /^l1-([a-z0-9.]+)-([a-z0-9]{4})$/.exec(canonical)
  if (!match || checksum(match[1]) !== match[2]) return null
  const values = match[1].split('.').map((value) => Number.parseInt(value, 36))
  if (values.length !== 6 || values.some((value) => !Number.isInteger(value) || value < 0)) return null
  const [universeIndex, doctrineIndex, wayfinderMask, shelfIndex, themeIndex, automationIndex] = values
  const universe = UNIVERSES[universeIndex]
  if (!universe) return null
  const universeId = universe.id as UniverseId
  const pack = V2_UNIVERSE_BY_ID.get(universeId)
  const doctrine = pack?.economy.doctrines[doctrineIndex]
  const shelf = pack?.archive.shelves[shelfIndex]
  const vestment = THEMES[themeIndex]
  const automation = AUTOMATION[automationIndex]
  if (!pack || !doctrine || !shelf || !vestment || !automation) return null
  const loadout: LawLoadout = {
    id: `loadout-${checksum(canonical)}`,
    name: cleanPlayerLabel(name) || 'Imported route',
    universeId,
    doctrineId: doctrine.id,
    wayfinderLawIds: WAYFINDER_NODES.filter((_entry, index) => (wayfinderMask & (1 << index)) !== 0).map((entry) => entry.id),
    archiveShelfId: shelf.id,
    vestmentId: vestment.id,
    anomalyResponseIds: [],
    automation,
  }
  return validateLawLoadout(loadout).length === 0 ? loadout : null
}

export function upsertLawLoadout(loadouts: readonly LawLoadout[], loadout: LawLoadout): LawLoadout[] {
  if (validateLawLoadout(loadout).length > 0) return [...loadouts]
  const next = loadouts.filter((entry) => entry.id !== loadout.id)
  next.push({ ...loadout, name: cleanPlayerLabel(loadout.name) })
  return next.sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id)).slice(0, 32)
}

export function updateChronicleBest(
  bests: readonly ChronicleBest[],
  candidate: ChronicleBest,
): ChronicleBest[] {
  if (!candidate.routeCode || !Number.isFinite(candidate.durationMs) || candidate.durationMs <= 0 || !Number.isFinite(candidate.completedAt)) return [...bests]
  const previous = bests.find((entry) => entry.routeCode === candidate.routeCode)
  if (previous && previous.durationMs <= candidate.durationMs) return [...bests]
  return [...bests.filter((entry) => entry.routeCode !== candidate.routeCode), {
    ...candidate,
    durationMs: Math.floor(candidate.durationMs),
    completedAt: Math.floor(candidate.completedAt),
  }].sort((left, right) => left.durationMs - right.durationMs || left.routeCode.localeCompare(right.routeCode)).slice(0, 128)
}
