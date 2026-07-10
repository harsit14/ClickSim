import type { NonColorSignalDef } from '../types'

export const TIDEFALL_TIDE_PERIOD_MS = 90_000

export type TidefallTideStateId = 'rising' | 'high' | 'falling' | 'low'

export interface TidefallTideState {
  readonly id: TidefallTideStateId
  readonly phase: number
  readonly multiplier: number
  readonly text: string
  readonly shape: string
  readonly pattern: string
  readonly highContrastTreatment: string
}

export const TIDEFALL_TIDE_SIGNALS: Readonly<Record<TidefallTideStateId, NonColorSignalDef>> = {
  rising: {
    stateId: 'tide-rising',
    text: 'Tide rising',
    shape: 'three upward pressure arcs',
    pattern: 'ascending ripple spacing',
    highContrastTreatment: 'outlined up-chevron beside the tide label',
  },
  high: {
    stateId: 'tide-high',
    text: 'High tide',
    shape: 'broad crest crown',
    pattern: 'dense horizontal crest bands',
    highContrastTreatment: 'double-line crest above the tide label',
  },
  falling: {
    stateId: 'tide-falling',
    text: 'Tide falling',
    shape: 'three downward pressure arcs',
    pattern: 'descending ripple spacing',
    highContrastTreatment: 'outlined down-chevron beside the tide label',
  },
  low: {
    stateId: 'tide-low',
    text: 'Low tide',
    shape: 'deep basin crescent',
    pattern: 'widely spaced pressure contours',
    highContrastTreatment: 'double-line basin below the tide label',
  },
}

function normalizedPhase(timeMs: number): number {
  if (!Number.isFinite(timeMs)) throw new RangeError('Tide time must be finite.')
  return ((timeMs % TIDEFALL_TIDE_PERIOD_MS) + TIDEFALL_TIDE_PERIOD_MS)
    % TIDEFALL_TIDE_PERIOD_MS / TIDEFALL_TIDE_PERIOD_MS
}

export function tidefallTideMultiplier(timeMs: number): number {
  const phase = normalizedPhase(timeMs)
  return 1 + 0.4 * Math.sin(phase * Math.PI * 2)
}

export function tidefallTideState(timeMs: number): TidefallTideState {
  const phase = normalizedPhase(timeMs)
  const multiplier = tidefallTideMultiplier(timeMs)
  const derivative = Math.cos(phase * Math.PI * 2)
  const id: TidefallTideStateId = multiplier >= 1.2
    ? 'high'
    : multiplier <= 0.8
      ? 'low'
      : derivative >= 0
        ? 'rising'
        : 'falling'
  return { id, phase, multiplier, ...TIDEFALL_TIDE_SIGNALS[id] }
}
