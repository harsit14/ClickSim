import type { Effect } from '../../upgrades'

export type ClockworkMaintenanceSignalId =
  | 'clockwork-maintenance-window'
  | 'clockwork-noon-alignment'
  | 'clockwork-leap-tick'
  | 'clockwork-recall-notice'

export interface ClockworkMaintenanceSignalSpec {
  readonly id: ClockworkMaintenanceSignalId
  readonly name: string
  readonly periodMs: number
  readonly offsetMs: number
  readonly activeDurationMs: number
  readonly warningMs: number
  readonly description: string
  readonly preparation: string
  readonly rewardDescription: string
  readonly effects: readonly Effect[]
  readonly glyph: string
  readonly audioCue: string
  readonly nonColorShape: string
}

export const CLOCKWORK_MAINTENANCE_SIGNALS: readonly [
  ClockworkMaintenanceSignalSpec,
  ClockworkMaintenanceSignalSpec,
  ClockworkMaintenanceSignalSpec,
  ClockworkMaintenanceSignalSpec,
] = [
  {
    id: 'clockwork-maintenance-window',
    name: 'Maintenance Window',
    periodMs: 5 * 60_000,
    offsetMs: 60_000,
    activeDurationMs: 45_000,
    warningMs: 60_000,
    description: 'A forecast service interval opens one chosen train for exact tuning.',
    preparation: 'Choose the train before the wrench-frame closes; no progress is lost if ignored.',
    rewardDescription: 'The selected train receives the displayed temporary ×2 production tune.',
    effects: [{ kind: 'globalMult', value: 2 }],
    glyph: '⚒',
    audioCue: 'clockwork-signal-maintenance',
    nonColorShape: 'open wrench frame with four countdown teeth',
  },
  {
    id: 'clockwork-noon-alignment',
    name: 'Noon Alignment',
    periodMs: 12 * 60_000,
    offsetMs: 3 * 60_000,
    activeDurationMs: 30_000,
    warningMs: 90_000,
    description: 'The Orrery aligns on a fixed civic meridian and rewards a prepared route.',
    preparation: 'Route one complete power-cadence-efficiency chain before the meridian mark.',
    rewardDescription: 'A prepared complete chain receives the displayed temporary ×4 production alignment.',
    effects: [{ kind: 'globalMult', value: 4 }],
    glyph: '⌖',
    audioCue: 'clockwork-signal-noon',
    nonColorShape: 'crosshair over three meshed orbital rings',
  },
  {
    id: 'clockwork-leap-tick',
    name: 'Leap Tick',
    periodMs: 20 * 60_000,
    offsetMs: 7 * 60_000,
    activeDurationMs: 20_000,
    warningMs: 2 * 60_000,
    description: 'The civic clock declares one scheduled interval outside the ordinary count.',
    preparation: 'Choose whether to insert the extra cycle now or bank its explicit receipt.',
    rewardDescription: 'Insert or bank exactly one displayed production cycle; the outcome is deterministic.',
    effects: [],
    glyph: '+1',
    audioCue: 'clockwork-signal-leap',
    nonColorShape: 'one raised index tooth beside a boxed plus sign',
  },
  {
    id: 'clockwork-recall-notice',
    name: 'Recall Notice',
    periodMs: 30 * 60_000,
    offsetMs: 11 * 60_000,
    activeDurationMs: 40_000,
    warningMs: 3 * 60_000,
    description: 'A punched notice forecasts when the machine may repeat its best recent ten seconds.',
    preparation: 'Build a ten-second route sample; the exact stored value is shown before acceptance.',
    rewardDescription: 'Replay the displayed best recent ten-second production sample once.',
    effects: [],
    glyph: '↺',
    audioCue: 'clockwork-signal-recall',
    nonColorShape: 'punched-paper loop with ten numbered apertures',
  },
]

export interface ClockworkMaintenanceSignalState {
  readonly signalId: ClockworkMaintenanceSignalId
  readonly status: 'forecast' | 'active'
  readonly cycleIndex: number
  readonly startsAtMs: number
  readonly endsAtMs: number
  readonly remainingMs: number
  readonly warningVisible: boolean
}

export function clockworkMaintenanceSignalStateAt(
  spec: ClockworkMaintenanceSignalSpec,
  nowMs: number,
): ClockworkMaintenanceSignalState {
  if (!Number.isFinite(nowMs) || nowMs < 0) {
    throw new RangeError('Clockwork Maintenance Signal time must be finite and nonnegative.')
  }
  const relative = nowMs - spec.offsetMs
  const candidateIndex = Math.floor(relative / spec.periodMs)
  const candidateStart = spec.offsetMs + candidateIndex * spec.periodMs
  const candidateEnd = candidateStart + spec.activeDurationMs
  const active = candidateStart >= 0 && nowMs >= candidateStart && nowMs < candidateEnd
  const cycleIndex = active ? candidateIndex : Math.max(0, candidateIndex + 1)
  const startsAtMs = active ? candidateStart : spec.offsetMs + cycleIndex * spec.periodMs
  const endsAtMs = startsAtMs + spec.activeDurationMs
  return {
    signalId: spec.id,
    status: active ? 'active' : 'forecast',
    cycleIndex,
    startsAtMs,
    endsAtMs,
    remainingMs: active ? endsAtMs - nowMs : startsAtMs - nowMs,
    warningVisible: active || startsAtMs - nowMs <= spec.warningMs,
  }
}

export interface ClockworkMaintenanceTimelineEntry extends ClockworkMaintenanceSignalState {
  readonly name: string
  readonly nonColorShape: string
}

export function clockworkMaintenanceTimeline(
  nowMs: number,
  horizonMs: number,
): readonly ClockworkMaintenanceTimelineEntry[] {
  if (!Number.isFinite(horizonMs) || horizonMs < 0) {
    throw new RangeError('Clockwork Maintenance Signal horizon must be finite and nonnegative.')
  }
  const horizonEnd = nowMs + horizonMs
  const entries: ClockworkMaintenanceTimelineEntry[] = []
  for (const spec of CLOCKWORK_MAINTENANCE_SIGNALS) {
    const initial = clockworkMaintenanceSignalStateAt(spec, nowMs)
    let cycleIndex = initial.cycleIndex
    let startsAtMs = initial.startsAtMs
    while (startsAtMs <= horizonEnd) {
      const active = startsAtMs <= nowMs && nowMs < startsAtMs + spec.activeDurationMs
      entries.push({
        signalId: spec.id,
        name: spec.name,
        nonColorShape: spec.nonColorShape,
        status: active ? 'active' : 'forecast',
        cycleIndex,
        startsAtMs,
        endsAtMs: startsAtMs + spec.activeDurationMs,
        remainingMs: active ? startsAtMs + spec.activeDurationMs - nowMs : startsAtMs - nowMs,
        warningVisible: active || startsAtMs - nowMs <= spec.warningMs,
      })
      cycleIndex += 1
      startsAtMs = spec.offsetMs + cycleIndex * spec.periodMs
    }
  }
  return entries.sort((left, right) => left.startsAtMs - right.startsAtMs || left.signalId.localeCompare(right.signalId))
}
