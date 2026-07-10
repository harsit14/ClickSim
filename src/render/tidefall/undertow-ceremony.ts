export type UndertowCeremonyPhaseKind =
  | 'waterline-withdrawal'
  | 'current-reversal'
  | 'pressure-silence'
  | 'moon-salt-return'
  | 'low-tide-restart'

export interface UndertowCeremonyPhase {
  readonly kind: UndertowCeremonyPhaseKind
  readonly startsAtMs: number
  readonly endsAtMs: number
  readonly visual: string
  readonly nonColorSignal: string
  readonly presentation: 'authored-motion' | 'crossfade' | 'static-pressure-steps'
}

export interface UndertowCeremonyPlan {
  readonly id: 'tide-undertow-ceremony'
  readonly canonicalBoundary: 'epoch-turn'
  readonly localName: 'Undertow'
  readonly rewardName: 'Moon Salt'
  readonly startsAtMs: number
  readonly endsAtMs: number
  readonly audioCue: 'tide-undertow-cadence'
  readonly caption: string
  readonly phases: readonly UndertowCeremonyPhase[]
}

export interface UndertowCeremonyPreferences {
  readonly reducedMotion: boolean
  readonly lowQuality: boolean
}

const PHASES = [
  {
    kind: 'waterline-withdrawal',
    durationMs: 620,
    visual: 'The waterline contracts toward the Tideheart while built currents hold their silhouettes.',
    nonColorSignal: 'three inward pressure contours',
  },
  {
    kind: 'current-reversal',
    durationMs: 760,
    visual: 'Kindling current paths reverse in authored order from horizon to surface.',
    nonColorSignal: 'reverse arrows travel from horizon to Heart',
  },
  {
    kind: 'pressure-silence',
    durationMs: 420,
    visual: 'The Tideheart becomes a still pearl with one visible basin mark.',
    nonColorSignal: 'single closed basin and the caption “Undertow”',
  },
  {
    kind: 'moon-salt-return',
    durationMs: 700,
    visual: 'Moon Salt crystallizes as a branching nacre tide-chart around the Heart.',
    nonColorSignal: 'faceted salt branches with a persistent +Moon Salt label',
  },
  {
    kind: 'low-tide-restart',
    durationMs: 500,
    visual: 'The low-tide basin opens and the first remembered current returns.',
    nonColorSignal: 'wide low-tide contours and a restart focus ring',
  },
] as const

export function planUndertowCeremony(
  startsAtMs: number,
  preferences: UndertowCeremonyPreferences,
): UndertowCeremonyPlan {
  if (!Number.isFinite(startsAtMs) || startsAtMs < 0) {
    throw new RangeError('Undertow ceremony start must be finite and nonnegative.')
  }
  const presentation = preferences.reducedMotion
    ? 'crossfade'
    : preferences.lowQuality
      ? 'static-pressure-steps'
      : 'authored-motion'
  let cursor = startsAtMs
  const phases: UndertowCeremonyPhase[] = PHASES.map((phase) => {
    const result: UndertowCeremonyPhase = {
      kind: phase.kind,
      startsAtMs: cursor,
      endsAtMs: cursor + phase.durationMs,
      visual: phase.visual,
      nonColorSignal: phase.nonColorSignal,
      presentation,
    }
    cursor = result.endsAtMs
    return result
  })
  return {
    id: 'tide-undertow-ceremony',
    canonicalBoundary: 'epoch-turn',
    localName: 'Undertow',
    rewardName: 'Moon Salt',
    startsAtMs,
    endsAtMs: cursor,
    audioCue: 'tide-undertow-cadence',
    caption: 'Undertow: every current returns as Moon Salt. The next era begins at low tide.',
    phases,
  }
}
