import {
  CLOCKWORK_KINDLING_IDS,
  CLOCKWORK_ROUTE_LOADOUTS,
  type ClockworkKindlingId,
  type ClockworkRouteKind,
} from '../../content/universes/clockwork/routing'
import {
  CLOCKWORK_MAINTENANCE_SIGNALS,
  clockworkMaintenanceSignalStateAt,
} from '../../content/universes/clockwork/maintenance'

export interface ClockworkMachineSeat {
  readonly id: ClockworkKindlingId
  readonly name: string
  readonly x: number
  readonly y: number
  readonly scale: number
  readonly machine: 'tooth' | 'wheel' | 'stop' | 'spring' | 'governor' | 'engine'
}

export interface ClockworkPhysicalRoute {
  readonly id: string
  readonly from: ClockworkKindlingId
  readonly to: ClockworkKindlingId
  readonly kind: ClockworkRouteKind
  readonly path: string
}

export interface ClockworkScheduleRow {
  readonly id: string
  readonly name: string
  readonly glyph: string
  readonly status: 'forecast' | 'active'
  readonly remainingMs: number
  readonly warningVisible: boolean
  readonly nonColorShape: string
}

export interface ClockworkFlagshipScene {
  readonly machines: readonly (ClockworkMachineSeat & { readonly count: number })[]
  readonly routes: readonly ClockworkPhysicalRoute[]
  readonly schedule: readonly ClockworkScheduleRow[]
}

export const CLOCKWORK_MACHINE_SEATS: readonly ClockworkMachineSeat[] = [
  { id: 'clockwork-tooth', name: 'Tooth Press', x: 6, y: 77, scale: 0.72, machine: 'tooth' },
  { id: 'clockwork-cog', name: 'Cog Bench', x: 15, y: 70, scale: 0.8, machine: 'wheel' },
  { id: 'clockwork-ratchet', name: 'Ratchet Gate', x: 24, y: 77, scale: 0.86, machine: 'stop' },
  { id: 'clockwork-escapement', name: 'Civic Escapement', x: 33, y: 68, scale: 0.92, machine: 'stop' },
  { id: 'clockwork-mainspring', name: 'Mainspring Vault', x: 42, y: 76, scale: 0.94, machine: 'spring' },
  { id: 'clockwork-flywheel', name: 'Flywheel District', x: 58, y: 76, scale: 1.02, machine: 'wheel' },
  { id: 'clockwork-governor', name: 'Governor Stand', x: 67, y: 68, scale: 0.92, machine: 'governor' },
  { id: 'clockwork-clockmaker-automaton', name: 'Repair Guild', x: 76, y: 76, scale: 0.9, machine: 'engine' },
  { id: 'clockwork-orrery', name: 'Moonless Orrery', x: 85, y: 64, scale: 1, machine: 'wheel' },
  { id: 'clockwork-difference-engine', name: 'Difference Hall', x: 94, y: 45, scale: 0.9, machine: 'engine' },
  { id: 'clockwork-relay-foundry', name: 'Relay Foundry', x: 83, y: 52, scale: 0.96, machine: 'engine' },
  { id: 'clockwork-meridian-clock', name: 'Meridian Clock', x: 72, y: 36, scale: 0.92, machine: 'wheel' },
  { id: 'clockwork-prediction-mill', name: 'Prediction Mill', x: 61, y: 47, scale: 0.9, machine: 'engine' },
  { id: 'clockwork-city-of-hours', name: 'City of Hours', x: 39, y: 38, scale: 1.04, machine: 'engine' },
  { id: 'clockwork-causal-engine', name: 'Causal Engine', x: 28, y: 48, scale: 0.95, machine: 'engine' },
  { id: 'clockwork-world-gear', name: 'World Gear', x: 17, y: 52, scale: 1.08, machine: 'wheel' },
  { id: 'clockwork-last-calendar', name: 'Last Calendar', x: 6, y: 43, scale: 0.88, machine: 'engine' },
  { id: 'clockwork-great-regulator', name: 'Great Regulator', x: 50, y: 18, scale: 1.15, machine: 'governor' },
] as const

const SEAT_BY_ID = new Map(CLOCKWORK_MACHINE_SEATS.map((seat) => [seat.id, seat]))

function linkagePath(from: ClockworkMachineSeat, to: ClockworkMachineSeat): string {
  const startX = from.x + (to.x >= from.x ? 2.1 : -2.1)
  const endX = to.x + (to.x >= from.x ? -2.1 : 2.1)
  if (Math.abs(from.y - to.y) < 3) return `M ${startX} ${from.y} L ${endX} ${to.y}`
  const elbowX = Number(((startX + endX) / 2).toFixed(2))
  return `M ${startX} ${from.y} L ${elbowX} ${from.y} L ${elbowX} ${to.y} L ${endX} ${to.y}`
}

export function buildClockworkFlagshipScene(
  owned: Readonly<Record<string, number>>,
  nowMs: number,
): ClockworkFlagshipScene {
  if (!Number.isFinite(nowMs) || nowMs < 0) throw new RangeError('Clockwork flagship time must be finite and nonnegative.')
  const machines = CLOCKWORK_MACHINE_SEATS
    .map((seat) => ({ ...seat, count: owned[seat.id] ?? 0 }))
    .filter((seat) => seat.count > 0)
  const visible = new Set(machines.map(({ id }) => id))
  const civic = CLOCKWORK_ROUTE_LOADOUTS.find(({ id }) => id === 'clockwork-loadout-civic-chain')!
  const routes = civic.graph.edges.flatMap((edge) => {
    if (!visible.has(edge.from) || !visible.has(edge.to)) return []
    const from = SEAT_BY_ID.get(edge.from)
    const to = SEAT_BY_ID.get(edge.to)
    if (!from || !to) return []
    return [{ ...edge, path: linkagePath(from, to) }]
  })
  const schedule = CLOCKWORK_MAINTENANCE_SIGNALS.map((signal) => {
    const state = clockworkMaintenanceSignalStateAt(signal, nowMs)
    return {
      id: signal.id,
      name: signal.name,
      glyph: signal.glyph,
      status: state.status,
      remainingMs: state.remainingMs,
      warningVisible: state.warningVisible,
      nonColorShape: signal.nonColorShape,
    }
  })
  return { machines, routes, schedule }
}

export function formatClockworkScheduleDuration(durationMs: number): string {
  const seconds = Math.max(0, Math.ceil(durationMs / 1_000))
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${remainder.toString().padStart(2, '0')}`
}

export function clockworkKindlingSeatIds(): readonly ClockworkKindlingId[] {
  return CLOCKWORK_MACHINE_SEATS.map(({ id }) => id)
}

export function clockworkKindlingIdsAreCovered(): boolean {
  return CLOCKWORK_KINDLING_IDS.every((id) => SEAT_BY_ID.has(id))
}
