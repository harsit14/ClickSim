export type ClockworkRewindingPhaseId =
  | 'train-disengagement'
  | 'reverse-release'
  | 'zero-index'
  | 'perfect-interval-lock'
  | 'first-tooth-restart'

export interface ClockworkRewindingPhase {
  readonly id: ClockworkRewindingPhaseId
  readonly startsAtMs: number
  readonly endsAtMs: number
  readonly visual: string
  readonly nonColorSignal: string
  readonly presentation: 'authored-motion' | 'crossfade' | 'indexed-stills'
}

export interface ClockworkRewindingPlan {
  readonly id: 'u4-rewinding-ceremony'
  readonly canonicalBoundary: 'epoch-turn'
  readonly localName: 'Rewinding'
  readonly rewardName: 'Mainsprings'
  readonly startsAtMs: number
  readonly endsAtMs: number
  readonly audioCue: 'clockwork-rewinding-cadence'
  readonly caption: string
  readonly phases: readonly ClockworkRewindingPhase[]
}

const PHASES = [
  { id: 'train-disengagement', durationMs: 600, visual: 'Route clutches open from the Great Regulator back toward the Heart.', nonColorSignal: 'numbered route segments dim eighteen through one' },
  { id: 'reverse-release', durationMs: 800, visual: 'Spring tension and the four musical layers release in reverse authored order.', nonColorSignal: 'four descending bars labeled causal, city, governor, escapement' },
  { id: 'zero-index', durationMs: 420, visual: 'Every World mechanism aligns to a shared engraved zero.', nonColorSignal: 'one strong zero-index line through every visible dial' },
  { id: 'perfect-interval-lock', durationMs: 720, visual: 'One exact interval winds into a sealed Mainspring beside the Heart.', nonColorSignal: 'boxed Mainspring count and one four-beat bracket' },
  { id: 'first-tooth-restart', durationMs: 480, visual: 'The first Tooth engages against a clean route socket.', nonColorSignal: 'single forward tooth, output arrow, and restart focus ring' },
] as const

export function planClockworkRewinding(
  startsAtMs: number,
  preferences: { readonly reducedMotion: boolean; readonly lowQuality: boolean },
): ClockworkRewindingPlan {
  if (!Number.isFinite(startsAtMs) || startsAtMs < 0) {
    throw new RangeError('Clockwork Rewinding start must be finite and nonnegative.')
  }
  const presentation: ClockworkRewindingPhase['presentation'] = preferences.reducedMotion
    ? 'crossfade'
    : preferences.lowQuality
      ? 'indexed-stills'
      : 'authored-motion'
  let cursor = startsAtMs
  const phases = PHASES.map((phase): ClockworkRewindingPhase => {
    const result = {
      id: phase.id,
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
    id: 'u4-rewinding-ceremony',
    canonicalBoundary: 'epoch-turn',
    localName: 'Rewinding',
    rewardName: 'Mainsprings',
    startsAtMs,
    endsAtMs: cursor,
    audioCue: 'clockwork-rewinding-cadence',
    caption: 'Rewinding: the World machine returns to zero. One perfected interval remains as Mainsprings.',
    phases,
  }
}
