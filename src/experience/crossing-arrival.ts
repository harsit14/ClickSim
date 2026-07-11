import type { UniverseId } from '../content/universes/types'

export const CROSSING_FIRST_ARRIVAL_DURATION_MS = 20_000
export const CROSSING_REVISIT_DURATION_MS = 6_800

export type CrossingCeremonyPhaseId = 'departure' | 'between' | 'wrong-foot' | 'translation' | 'arrival' | 'ready'

export interface CrossingCeremonyPhase {
  readonly id: CrossingCeremonyPhaseId
  readonly atMs: number
  readonly label: string
}

export const CROSSING_FIRST_ARRIVAL_PHASES: readonly CrossingCeremonyPhase[] = [
  { id: 'departure', atMs: 0, label: 'release the known' },
  { id: 'between', atMs: 3_200, label: 'enter the uncounted interval' },
  { id: 'wrong-foot', atMs: 6_800, label: 'carry one old habit too far' },
  { id: 'translation', atMs: 10_200, label: 'let the vessel learn new matter' },
  { id: 'arrival', atMs: 14_600, label: 'receive the destination law' },
  { id: 'ready', atMs: CROSSING_FIRST_ARRIVAL_DURATION_MS, label: 'crossing complete' },
] as const

const REVISIT_PHASES: readonly CrossingCeremonyPhase[] = [
  { id: 'departure', atMs: 0, label: 'release the known' },
  { id: 'between', atMs: 1_200, label: 'enter the remembered interval' },
  { id: 'translation', atMs: 2_800, label: 'restore the familiar law' },
  { id: 'arrival', atMs: 4_600, label: 'return to the destination' },
  { id: 'ready', atMs: CROSSING_REVISIT_DURATION_MS, label: 'return complete' },
] as const

export function crossingCeremonyPhases(firstArrival: boolean): readonly CrossingCeremonyPhase[] {
  return firstArrival ? CROSSING_FIRST_ARRIVAL_PHASES : REVISIT_PHASES
}

export function crossingCeremonyDuration(firstArrival: boolean): number {
  return firstArrival ? CROSSING_FIRST_ARRIVAL_DURATION_MS : CROSSING_REVISIT_DURATION_MS
}

export function crossingCeremonyPhaseAt(elapsedMs: number, firstArrival: boolean): CrossingCeremonyPhase {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) throw new RangeError('Crossing ceremony time must be finite and nonnegative.')
  const phases = crossingCeremonyPhases(firstArrival)
  return phases.reduce((selected, phase) => phase.atMs <= elapsedMs ? phase : selected, phases[0])
}

export interface CrossingCeremonyCopyInput {
  readonly sourceName: string
  readonly targetName: string
  readonly targetArrival: string
  readonly sourceVerb: string
  readonly targetVerb: string
}

export function crossingCeremonyLine(
  phase: CrossingCeremonyPhaseId,
  input: CrossingCeremonyCopyInput,
): string {
  switch (phase) {
    case 'departure': return `the vessel leaves ${input.sourceName} without extinguishing it`
    case 'between': return 'between universes, no number rises; no clock is willing to count'
    case 'wrong-foot': return `${input.sourceVerb}— the old verb follows us one beat too far`
    case 'translation': return input.targetArrival
    case 'arrival': return `${input.targetVerb}; the Wayfinder learns the new law before it names ${input.targetName}`
    case 'ready': return `the Wayfinder answers: ${input.targetName}`
  }
}

export interface CrossingHabitBreak {
  readonly id: string
  readonly atMs: number
  readonly text: string
}

const HABIT_BREAKS: Readonly<Record<UniverseId, readonly CrossingHabitBreak[]>> = {
  emberlight: [
    { id: 'cross-habit-emberlight-1', atMs: 75_000, text: 'The old law expected complexity. This Heart asks for one honest touch again.' },
    { id: 'cross-habit-emberlight-2', atMs: 270_000, text: 'Do not search for a cycle to exploit. Emberlight is steady because steadiness is its physics.' },
    { id: 'cross-habit-emberlight-3', atMs: 540_000, text: 'Kindle. The simple verb is not a regression when you return carrying context.' },
  ],
  tidefall: [
    { id: 'cross-habit-tidefall-1', atMs: 75_000, text: 'The old rhythm will lie here. Watch the waterline before deciding when to touch.' },
    { id: 'cross-habit-tidefall-2', atMs: 270_000, text: 'The tide meter is not ornament. The whole ocean is breathing through the rate.' },
    { id: 'cross-habit-tidefall-3', atMs: 540_000, text: 'Surface, then wait. Tidefall rewards attention to return, not constant acceleration.' },
  ],
  verdance: [
    { id: 'cross-habit-verdance-1', atMs: 75_000, text: 'These Kindlings are cohorts, not copies. New growth changes the age of the whole grove.' },
    { id: 'cross-habit-verdance-2', atMs: 270_000, text: 'A young forest can produce less than an old small one. Count maturity, not only stems.' },
    { id: 'cross-habit-verdance-3', atMs: 540_000, text: 'Grow, then let time participate. Verdance refuses the habit of instant completion.' },
  ],
  clockwork: [
    { id: 'cross-habit-clockwork-1', atMs: 75_000, text: 'Nothing here arrives by chance. Read the next Maintenance line before reaching for it.' },
    { id: 'cross-habit-clockwork-2', atMs: 270_000, text: 'A linkage is a dependency made visible. Follow the arrow before improving the machine.' },
    { id: 'cross-habit-clockwork-3', atMs: 540_000, text: 'Route first. The city considers unexplained efficiency a defect.' },
  ],
  prismata: [
    { id: 'cross-habit-prismata-1', atMs: 75_000, text: 'White is not one answer here. Separate the light before deciding what it can make.' },
    { id: 'cross-habit-prismata-2', atMs: 270_000, text: 'A brighter beam can still be the wrong wavelength. Follow the labeled path.' },
    { id: 'cross-habit-prismata-3', atMs: 540_000, text: 'Resolve difference without erasing it. Prismata calls that synthesis.' },
  ],
  tempest: [
    { id: 'cross-habit-tempest-1', atMs: 75_000, text: 'Stored charge is not production yet. Choose where the discharge is allowed to end.' },
    { id: 'cross-habit-tempest-2', atMs: 270_000, text: 'A longer path carries more risk because the storm remembers every cell.' },
    { id: 'cross-habit-tempest-3', atMs: 540_000, text: 'Discharge deliberately. Tempest punishes the old habit of treating release as automatic.' },
  ],
  canticle: [
    { id: 'cross-habit-canticle-1', atMs: 75_000, text: 'A rest is an occupied position here. Silence may be doing more work than the note beside it.' },
    { id: 'cross-habit-canticle-2', atMs: 270_000, text: 'Sequence changes meaning. The same voices in another order are another machine.' },
    { id: 'cross-habit-canticle-3', atMs: 540_000, text: 'Compose the absence too. Canticle does not confuse constant sound with progress.' },
  ],
}

export function crossingHabitBreaks(universeId: UniverseId): readonly CrossingHabitBreak[] {
  return HABIT_BREAKS[universeId]
}

export function crossingVocabularyStumble(
  sourceName: string,
  sourceVerb: string,
  targetName: string,
  targetVerb: string,
): string {
  return `${sourceVerb}— no. That word belongs to ${sourceName}. Here, in ${targetName}, we ${targetVerb}. I will learn to say it before I pretend to understand it.`
}
