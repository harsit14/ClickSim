import type { HeartManifest, MotionGrammar, VisualState } from '../types'

const motion = (
  kind: MotionGrammar['kind'],
  description: string,
  periodMs?: number,
): MotionGrammar => ({
  kind,
  description,
  ...(periodMs === undefined ? {} : { periodMs }),
  preservesTimingInformation: true,
})

const state = (
  label: string,
  silhouette: string,
  material: readonly string[],
  stateMotion: MotionGrammar,
): VisualState => ({ label, silhouette, material, motion: stateMotion, countPresentation: 'single' })

export const CLOCKWORK_HEART: HeartManifest = {
  id: 'clockwork-escapement-heart',
  canonicalName: 'Heart',
  localName: 'Escapement Heart',
  phenomenon: 'A ruby-pallet escapement converting deliberate touch into counted torque.',
  purpose: 'Primary focusable input and the visible source of every routed Tick.',
  material: ['brass escape wheel', 'ruby pallet', 'blued-steel anchor', 'clock glass'],
  silhouette: 'fifteen-tooth escape wheel crossed by an anchor pallet and output shaft',
  idleMotion: motion('mechanical', 'The anchor holds at a visible stop until an accepted input or routed cycle releases it.', 2_667),
  touchMotion: motion('mechanical', 'One tooth engages, the anchor releases, and torque exits through the marked output shaft.', 360),
  reducedMotionState: state(
    'Escapement Heart fixed input sequence.',
    'escape wheel with three numbered engage-release-transmit positions',
    ['brass', 'ruby pallet', 'blued steel'],
    motion('still', 'Three fixed positions and a contrast step preserve touch timing without rotation.'),
  ),
  lowQualityState: state(
    'Escapement Heart simplified focus state.',
    'high-contrast tooth, anchor pallet, and output arrow',
    ['brass', 'blued steel'],
    motion('still', 'The full focus target and one transmission arrow remain visible.'),
  ),
  touchCue: 'clockwork-heart-engage',
  focusLabel: 'Escapement Heart, Heart of Clockwork; route Ticks',
}

export interface ClockworkHeartResponsePhase {
  readonly id: 'engage-tooth' | 'release-pallet' | 'transmit-torque'
  readonly startsAtMs: number
  readonly endsAtMs: number
  readonly shapeCue: string
  readonly materialResponse: string
}

export interface ClockworkHeartResponsePlan {
  readonly startsAtMs: number
  readonly endsAtMs: number
  readonly audioCue: 'clockwork-heart-engage'
  readonly phases: readonly ClockworkHeartResponsePhase[]
}

export function planClockworkHeartResponse(
  startsAtMs: number,
  reducedMotion: boolean,
): ClockworkHeartResponsePlan {
  if (!Number.isFinite(startsAtMs) || startsAtMs < 0) {
    throw new RangeError('Clockwork Heart response start must be finite and nonnegative.')
  }
  const definitions = [
    { id: 'engage-tooth', durationMs: reducedMotion ? 60 : 90, shapeCue: 'one highlighted input tooth', materialResponse: 'The input tooth gains a strong local brass edge.' },
    { id: 'release-pallet', durationMs: reducedMotion ? 80 : 110, shapeCue: 'anchor pallet at numbered release position', materialResponse: reducedMotion ? 'The release position crossfades in place.' : 'The ruby pallet reciprocates through one bounded index.' },
    { id: 'transmit-torque', durationMs: reducedMotion ? 100 : 150, shapeCue: 'forward output arrow and route line', materialResponse: reducedMotion ? 'The output route thickens without travel.' : 'One torque mark advances into the connected route.' },
  ] as const
  let cursor = startsAtMs
  const phases = definitions.map((definition): ClockworkHeartResponsePhase => {
    const phase = {
      id: definition.id,
      startsAtMs: cursor,
      endsAtMs: cursor + definition.durationMs,
      shapeCue: definition.shapeCue,
      materialResponse: definition.materialResponse,
    }
    cursor = phase.endsAtMs
    return phase
  })
  return { startsAtMs, endsAtMs: cursor, audioCue: 'clockwork-heart-engage', phases }
}
