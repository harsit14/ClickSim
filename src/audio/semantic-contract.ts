import type {
  AudioBusDef,
  AudioBusId,
  AudioCueDef,
  SemanticFeedbackEvent,
  UniverseAudioDef,
} from '../content/universes/types'

export interface AudioContractIssue {
  readonly path: string
  readonly code: string
  readonly message: string
}

export const REQUIRED_AUDIO_BUSES = [
  'master',
  'music',
  'ambient',
  'interface',
  'touch',
  'purchase',
  'omen',
  'story',
  'ceremony',
] as const satisfies readonly AudioBusId[]

export const MASTER_PEAK_CEILING_DB = -1
export const FATIGUE_WINDOW_MS = 1_000
export const FAMILY_SOFT_LIMIT = 4
export const FAMILY_HARD_LIMIT = 10
export const GLOBAL_CONCURRENCY_LIMIT = 8

const STABLE_ID = /^[a-z0-9][a-z0-9-]{0,63}$/
const AUDIO_BUS_IDS = new Set<string>(REQUIRED_AUDIO_BUSES)
const AUDIO_PRIORITIES = new Set(['ambient', 'normal', 'important', 'ceremony'])
const MUTED_FALLBACKS = new Set(['none', 'visual', 'caption', 'visual-and-caption'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function issue(
  issues: AudioContractIssue[],
  path: string,
  code: string,
  message: string,
): void {
  issues.push({ path, code, message })
}

function asRecords(value: unknown): readonly Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : []
}

function validateBusGraph(
  buses: readonly Record<string, unknown>[],
  issues: AudioContractIssue[],
): void {
  const parents = new Map<string, string | null>()
  for (const bus of buses) {
    if (typeof bus.id === 'string' && (typeof bus.parent === 'string' || bus.parent === null)) {
      parents.set(bus.id, bus.parent)
    }
  }

  for (const id of parents.keys()) {
    const visited = new Set<string>()
    let cursor: string | null | undefined = id
    while (cursor !== null && cursor !== undefined) {
      if (visited.has(cursor)) {
        issue(
          issues,
          `buses.${id}.parent`,
          'bus.parent-cycle',
          `Audio bus parent chain contains a cycle at "${cursor}".`,
        )
        break
      }
      visited.add(cursor)
      cursor = parents.get(cursor)
    }
  }
}

/** Validates the frozen audio shape at a JSON/runtime boundary. */
export function validateUniverseAudioDef(audio: unknown): readonly AudioContractIssue[] {
  const issues: AudioContractIssue[] = []
  if (!isRecord(audio)) {
    return [{ path: 'audio', code: 'audio.not-object', message: 'Expected an audio contract object.' }]
  }

  if (!Number.isFinite(audio.tempoBpm) || (audio.tempoBpm as number) < 20 || (audio.tempoBpm as number) > 240) {
    issue(issues, 'tempoBpm', 'audio.tempo-invalid', 'Tempo must be finite and between 20 and 240 BPM.')
  }
  for (const field of ['meter', 'silenceState', 'fatiguePolicy'] as const) {
    if (!nonEmpty(audio[field])) {
      issue(issues, field, 'audio.meaning-missing', `${field} must contain authored semantic meaning.`)
    }
  }

  const buses = asRecords(audio.buses)
  if (!Array.isArray(audio.buses)) {
    issue(issues, 'buses', 'bus.list-missing', 'Expected an explicit audio bus list.')
  }
  const seenBuses = new Set<string>()
  for (let index = 0; index < buses.length; index += 1) {
    const bus = buses[index]
    const path = `buses[${index}]`
    if (typeof bus.id !== 'string' || !AUDIO_BUS_IDS.has(bus.id)) {
      issue(issues, `${path}.id`, 'bus.id-invalid', 'Expected one of the frozen AudioBusId values.')
      continue
    }
    if (seenBuses.has(bus.id)) {
      issue(issues, `${path}.id`, 'bus.id-duplicate', `Duplicate audio bus "${bus.id}".`)
    }
    seenBuses.add(bus.id)
    if (bus.id === 'master') {
      if (bus.parent !== null) {
        issue(issues, `${path}.parent`, 'bus.master-parent', 'The master bus must have a null parent.')
      }
    } else if (typeof bus.parent !== 'string' || !AUDIO_BUS_IDS.has(bus.parent)) {
      issue(issues, `${path}.parent`, 'bus.parent-invalid', 'A non-master bus must reference a frozen bus ID.')
    }
    if (!Number.isFinite(bus.defaultGain) || (bus.defaultGain as number) < 0 || (bus.defaultGain as number) > 1) {
      issue(issues, `${path}.defaultGain`, 'bus.gain-invalid', 'Default gain must be finite and between 0 and 1.')
    }
    if (typeof bus.userControllable !== 'boolean') {
      issue(issues, `${path}.userControllable`, 'bus.control-invalid', 'Bus control state must be explicit.')
    }
    if (bus.muteBehavior !== 'suppress-audio-only') {
      issue(
        issues,
        `${path}.muteBehavior`,
        'bus.mute-behavior-invalid',
        'Muting must suppress audio only and cannot suppress semantic feedback or progression.',
      )
    }
  }
  for (const required of REQUIRED_AUDIO_BUSES) {
    if (!seenBuses.has(required)) {
      issue(issues, 'buses', 'bus.required-missing', `Missing required audio bus "${required}".`)
    }
  }
  validateBusGraph(buses, issues)

  const cues = asRecords(audio.cues)
  if (!Array.isArray(audio.cues)) {
    issue(issues, 'cues', 'cue.list-missing', 'Expected an explicit semantic cue list.')
  }
  const seenCues = new Set<string>()
  for (let index = 0; index < cues.length; index += 1) {
    const cue = cues[index]
    const path = `cues[${index}]`
    if (typeof cue.id !== 'string' || !STABLE_ID.test(cue.id)) {
      issue(issues, `${path}.id`, 'cue.id-invalid', 'Expected a stable lowercase hyphenated cue ID.')
    } else if (seenCues.has(cue.id)) {
      issue(issues, `${path}.id`, 'cue.id-duplicate', `Duplicate audio cue "${cue.id}".`)
    } else {
      seenCues.add(cue.id)
    }
    if (typeof cue.bus !== 'string' || !seenBuses.has(cue.bus)) {
      issue(issues, `${path}.bus`, 'cue.bus-missing', `Cue bus "${String(cue.bus)}" is not declared.`)
    }
    for (const field of ['family', 'synthesisKey', 'muteGroup'] as const) {
      if (!nonEmpty(cue[field])) {
        issue(issues, `${path}.${field}`, 'cue.meaning-missing', `${field} must be non-empty.`)
      }
    }
    if (!Number.isFinite(cue.targetPeakDb) || (cue.targetPeakDb as number) > MASTER_PEAK_CEILING_DB) {
      issue(
        issues,
        `${path}.targetPeakDb`,
        'cue.target-peak-invalid',
        `Target peak must be finite and no louder than ${MASTER_PEAK_CEILING_DB} dB.`,
      )
    }
    if (!Number.isFinite(cue.maximumPeakDb) || (cue.maximumPeakDb as number) > MASTER_PEAK_CEILING_DB) {
      issue(
        issues,
        `${path}.maximumPeakDb`,
        'cue.maximum-peak-invalid',
        `Maximum peak must be finite and no louder than ${MASTER_PEAK_CEILING_DB} dB.`,
      )
    }
    if (
      Number.isFinite(cue.targetPeakDb)
      && Number.isFinite(cue.maximumPeakDb)
      && (cue.targetPeakDb as number) > (cue.maximumPeakDb as number)
    ) {
      issue(
        issues,
        `${path}.targetPeakDb`,
        'cue.peak-order-invalid',
        'Target peak cannot be louder than the declared maximum peak.',
      )
    }
    if (!Number.isFinite(cue.minimumIntervalMs) || (cue.minimumIntervalMs as number) < 0) {
      issue(issues, `${path}.minimumIntervalMs`, 'cue.interval-invalid', 'Minimum interval must be finite and nonnegative.')
    }
    if (
      !Number.isInteger(cue.maximumConcurrentInstances)
      || (cue.maximumConcurrentInstances as number) < 1
      || (cue.maximumConcurrentInstances as number) > 4
    ) {
      issue(
        issues,
        `${path}.maximumConcurrentInstances`,
        'cue.concurrency-invalid',
        'Per-cue concurrency must be an integer from 1 through 4.',
      )
    }
    if (typeof cue.priority !== 'string' || !AUDIO_PRIORITIES.has(cue.priority)) {
      issue(issues, `${path}.priority`, 'cue.priority-invalid', 'Cue priority is not part of the frozen grammar.')
    }
    if (typeof cue.mutedFallback !== 'string' || !MUTED_FALLBACKS.has(cue.mutedFallback)) {
      issue(issues, `${path}.mutedFallback`, 'cue.fallback-invalid', 'Cue muted fallback is not part of the frozen grammar.')
    } else if (
      (cue.priority === 'important' || cue.priority === 'ceremony' || cue.bus === 'omen' || cue.bus === 'story')
      && cue.mutedFallback === 'none'
    ) {
      issue(
        issues,
        `${path}.mutedFallback`,
        'cue.fallback-required',
        'Important, ceremony, Omen, and story cues require a visual and/or caption fallback.',
      )
    }
  }

  const semanticCueFields = [
    ['clickMaterialCue', 'touch'],
    ['purchaseIntervalCue', 'purchase'],
    ['criticalAccentCue', 'touch'],
    ['omenCallCue', 'omen'],
    ['prestigeCadenceCue', 'ceremony'],
  ] as const
  const cueById = new Map(cues.map((cue) => [cue.id, cue]))
  for (const [field, expectedBus] of semanticCueFields) {
    const cueId = audio[field]
    if (typeof cueId !== 'string' || !seenCues.has(cueId)) {
      issue(issues, field, 'cue.reference-missing', `${field} must reference a declared cue.`)
    } else if (cueById.get(cueId)?.bus !== expectedBus) {
      issue(issues, field, 'cue.reference-bus', `${field} must reference the ${expectedBus} bus.`)
    }
  }

  if (!Array.isArray(audio.stems) || audio.stems.length !== 4) {
    issue(issues, 'stems', 'stem.cardinality', `Expected exactly 4 adaptive music stems, received ${Array.isArray(audio.stems) ? audio.stems.length : 0}.`)
  }
  const stems = asRecords(audio.stems)
  const seenStems = new Set<string>()
  for (let index = 0; index < stems.length; index += 1) {
    const stem = stems[index]
    const path = `stems[${index}]`
    if (typeof stem.id !== 'string' || !STABLE_ID.test(stem.id)) {
      issue(issues, `${path}.id`, 'stem.id-invalid', 'Expected a stable lowercase hyphenated stem ID.')
    } else if (seenStems.has(stem.id)) {
      issue(issues, `${path}.id`, 'stem.id-duplicate', `Duplicate music stem "${stem.id}".`)
    } else {
      seenStems.add(stem.id)
    }
    if (stem.bus !== 'music') {
      issue(issues, `${path}.bus`, 'stem.bus-invalid', 'Adaptive stems must use the music bus.')
    }
    if (!nonEmpty(stem.kindlingFamily) || !nonEmpty(stem.description)) {
      issue(issues, path, 'stem.meaning-missing', 'Stem family and description must contain authored meaning.')
    }
  }

  return issues
}

export function assertValidUniverseAudioDef(audio: unknown): asserts audio is UniverseAudioDef {
  const issues = validateUniverseAudioDef(audio)
  if (issues.length > 0) {
    const detail = issues.map((entry) => `${entry.path}: ${entry.message}`).join('\n')
    throw new TypeError(`Invalid universe audio contract:\n${detail}`)
  }
}

export interface AudioHistoryEntry {
  readonly cueId: string
  readonly family: string
  readonly bus: AudioBusId
  readonly priority: AudioCueDef['priority']
  readonly startedAtMs: number
  readonly endsAtMs: number
  readonly appliedPeakDb: number
}

export interface AudioDispatchContext {
  readonly nowMs: number
  readonly durationMs: number
  readonly history: readonly AudioHistoryEntry[]
  readonly mutedBuses?: readonly AudioBusId[]
  readonly mutedGroups?: readonly string[]
}

export interface AudioDuckInstruction {
  readonly bus: AudioBusId
  readonly gainDb: number
}

export type AudioSuppressionReason =
  | 'no-cue'
  | 'unknown-cue'
  | 'muted-bus'
  | 'muted-group'
  | 'rate-limited'
  | 'concurrency-limited'
  | 'fatigue-limited'
  | 'no-headroom'
  | 'invalid-context'

export type AudioDispatchDecision =
  | {
    readonly play: false
    readonly cueId: string | null
    readonly reason: AudioSuppressionReason
    readonly mutedFallback: AudioCueDef['mutedFallback'] | 'none'
  }
  | {
    readonly play: true
    readonly cueId: string
    readonly bus: AudioBusId
    readonly family: string
    readonly priority: AudioCueDef['priority']
    readonly appliedPeakDb: number
    readonly gainAdjustmentDb: number
    readonly fatigueCount: number
    readonly estimatedMasterPeakDb: number
    readonly endsAtMs: number
    readonly ducking: readonly AudioDuckInstruction[]
  }

export interface SemanticAudioDispatch {
  /** The semantic event is always preserved, including when audio is muted or rejected. */
  readonly event: SemanticFeedbackEvent
  readonly audio: AudioDispatchDecision
}

function dbToAmplitude(db: number): number {
  return 10 ** (db / 20)
}

function amplitudeToDb(amplitude: number): number {
  return amplitude <= 0 ? Number.NEGATIVE_INFINITY : 20 * Math.log10(amplitude)
}

function duckingFor(priority: AudioCueDef['priority'], bus: AudioBusId): readonly AudioDuckInstruction[] {
  if (priority === 'ceremony') {
    return [
      { bus: 'music', gainDb: -9 },
      { bus: 'ambient', gainDb: -9 },
      { bus: 'touch', gainDb: -12 },
      { bus: 'purchase', gainDb: -9 },
      { bus: 'omen', gainDb: -6 },
      { bus: 'story', gainDb: -4 },
    ]
  }
  if (priority === 'important' || bus === 'omen') {
    return [
      { bus: 'music', gainDb: -4 },
      { bus: 'ambient', gainDb: -5 },
      { bus: 'touch', gainDb: -6 },
      { bus: 'purchase', gainDb: -4 },
    ]
  }
  return []
}

function strongestDuck(instructions: readonly AudioDuckInstruction[], bus: AudioBusId): number {
  let result = 0
  for (const instruction of instructions) {
    if (instruction.bus === bus) result = Math.min(result, instruction.gainDb)
  }
  return result
}

function busIsMuted(
  bus: AudioBusId,
  buses: readonly AudioBusDef[],
  mutedBuses: readonly AudioBusId[],
): boolean {
  const muted = new Set<AudioBusId>(mutedBuses)
  const parents = new Map(buses.map((definition) => [definition.id, definition.parent]))
  let cursor: AudioBusId | null | undefined = bus
  const visited = new Set<AudioBusId>()
  while (cursor !== null && cursor !== undefined && !visited.has(cursor)) {
    if (muted.has(cursor)) return true
    visited.add(cursor)
    cursor = parents.get(cursor)
  }
  return false
}

function suppressed(
  cueId: string | null,
  reason: AudioSuppressionReason,
  fallback: AudioCueDef['mutedFallback'] | 'none' = 'none',
): AudioDispatchDecision {
  return { play: false, cueId, reason, mutedFallback: fallback }
}

/** Pure cue planning: rate limit, concurrency, fatigue, ducking, and peak headroom. */
export function planAudioCue(
  cueId: string,
  audio: UniverseAudioDef,
  context: AudioDispatchContext,
): AudioDispatchDecision {
  const cue = audio.cues.find((candidate) => candidate.id === cueId)
  if (!cue) return suppressed(cueId, 'unknown-cue')
  if (!Number.isFinite(context.nowMs) || context.nowMs < 0 || !Number.isFinite(context.durationMs) || context.durationMs <= 0) {
    return suppressed(cueId, 'invalid-context', cue.mutedFallback)
  }
  if (busIsMuted(cue.bus, audio.buses, context.mutedBuses ?? [])) {
    return suppressed(cueId, 'muted-bus', cue.mutedFallback)
  }
  if ((context.mutedGroups ?? []).includes(cue.muteGroup)) {
    return suppressed(cueId, 'muted-group', cue.mutedFallback)
  }

  const priorCuePlays = context.history
    .filter((entry) => entry.cueId === cue.id && entry.startedAtMs <= context.nowMs)
    .sort((left, right) => right.startedAtMs - left.startedAtMs)
  const latest = priorCuePlays[0]
  if (latest && context.nowMs - latest.startedAtMs < cue.minimumIntervalMs) {
    return suppressed(cueId, 'rate-limited', cue.mutedFallback)
  }

  const active = context.history.filter(
    (entry) => entry.startedAtMs <= context.nowMs && entry.endsAtMs > context.nowMs,
  )
  if (
    active.length >= GLOBAL_CONCURRENCY_LIMIT
    || active.filter((entry) => entry.cueId === cue.id).length >= cue.maximumConcurrentInstances
  ) {
    return suppressed(cueId, 'concurrency-limited', cue.mutedFallback)
  }

  const recentFamily = context.history.filter(
    (entry) => entry.family === cue.family
      && entry.startedAtMs <= context.nowMs
      && entry.startedAtMs > context.nowMs - FATIGUE_WINDOW_MS,
  ).length
  if (recentFamily >= FAMILY_HARD_LIMIT && (cue.priority === 'ambient' || cue.priority === 'normal')) {
    return suppressed(cueId, 'fatigue-limited', cue.mutedFallback)
  }
  const fatigueAdjustmentDb = recentFamily < FAMILY_SOFT_LIMIT
    ? 0
    : -Math.min(12, (recentFamily - FAMILY_SOFT_LIMIT + 1) * 1.5)

  const ducking = duckingFor(cue.priority, cue.bus)
  const inheritedDuckDb = active.reduce((strongest, entry) => {
    const activeDucking = duckingFor(entry.priority, entry.bus)
    return Math.min(strongest, strongestDuck(activeDucking, cue.bus))
  }, 0)
  const desiredPeakDb = Math.min(cue.targetPeakDb, cue.maximumPeakDb)
    + fatigueAdjustmentDb
    + inheritedDuckDb

  const activeAmplitude = active.reduce((sum, entry) => {
    const candidateDuckDb = strongestDuck(ducking, entry.bus)
    return sum + dbToAmplitude(entry.appliedPeakDb + candidateDuckDb)
  }, 0)
  const ceilingAmplitude = dbToAmplitude(MASTER_PEAK_CEILING_DB)
  const availableAmplitude = ceilingAmplitude - activeAmplitude
  if (availableAmplitude <= dbToAmplitude(-60)) {
    return suppressed(cueId, 'no-headroom', cue.mutedFallback)
  }

  const appliedPeakDb = Math.min(desiredPeakDb, amplitudeToDb(availableAmplitude))
  if (appliedPeakDb < -60) return suppressed(cueId, 'no-headroom', cue.mutedFallback)
  const estimatedAmplitude = activeAmplitude + dbToAmplitude(appliedPeakDb)

  return {
    play: true,
    cueId: cue.id,
    bus: cue.bus,
    family: cue.family,
    priority: cue.priority,
    appliedPeakDb,
    gainAdjustmentDb: appliedPeakDb - cue.targetPeakDb,
    fatigueCount: recentFamily,
    estimatedMasterPeakDb: amplitudeToDb(estimatedAmplitude),
    endsAtMs: context.nowMs + context.durationMs,
    ducking,
  }
}

/** Dispatches an optional cue without ever consuming or mutating the semantic event. */
export function dispatchSemanticAudio(
  event: SemanticFeedbackEvent,
  audio: UniverseAudioDef,
  context: AudioDispatchContext,
): SemanticAudioDispatch {
  if (!event.audioCue) return { event, audio: suppressed(null, 'no-cue') }
  return { event, audio: planAudioCue(event.audioCue, audio, context) }
}

export interface TenClicksOmenStressOptions {
  readonly startAtMs?: number
  readonly omenAtMs?: number
  readonly clickDurationMs?: number
  readonly omenDurationMs?: number
  readonly mutedBuses?: readonly AudioBusId[]
  readonly mutedGroups?: readonly string[]
}

export interface AudioStressReport {
  readonly attempts: 11
  readonly played: number
  readonly suppressed: number
  readonly maximumConcurrent: number
  readonly maximumEstimatedPeakDb: number
  readonly ceilingDb: number
  readonly ceilingRespected: boolean
  readonly decisions: readonly AudioDispatchDecision[]
}

/** Deterministic policy model: ten 100 ms-spaced touches plus one overlapping Omen call. */
export function simulateTenClicksPerSecondWithOmen(
  audio: UniverseAudioDef,
  options: TenClicksOmenStressOptions = {},
): AudioStressReport {
  const startAtMs = options.startAtMs ?? 0
  const omenAtMs = options.omenAtMs ?? 500
  const events = [
    ...Array.from({ length: 10 }, (_, index) => ({
      atMs: startAtMs + index * 100,
      cueId: audio.clickMaterialCue,
      durationMs: options.clickDurationMs ?? 120,
      order: 1,
    })),
    {
      atMs: startAtMs + omenAtMs,
      cueId: audio.omenCallCue,
      durationMs: options.omenDurationMs ?? 800,
      order: 0,
    },
  ].sort((left, right) => left.atMs - right.atMs || left.order - right.order)

  const history: AudioHistoryEntry[] = []
  const decisions: AudioDispatchDecision[] = []
  let maximumConcurrent = 0
  let maximumEstimatedPeakDb = Number.NEGATIVE_INFINITY

  for (const event of events) {
    const decision = planAudioCue(event.cueId, audio, {
      nowMs: event.atMs,
      durationMs: event.durationMs,
      history,
      mutedBuses: options.mutedBuses,
      mutedGroups: options.mutedGroups,
    })
    decisions.push(decision)
    if (!decision.play) continue
    history.push({
      cueId: decision.cueId,
      family: decision.family,
      bus: decision.bus,
      priority: decision.priority,
      startedAtMs: event.atMs,
      endsAtMs: decision.endsAtMs,
      appliedPeakDb: decision.appliedPeakDb,
    })
    const concurrent = history.filter(
      (entry) => entry.startedAtMs <= event.atMs && entry.endsAtMs > event.atMs,
    ).length
    maximumConcurrent = Math.max(maximumConcurrent, concurrent)
    maximumEstimatedPeakDb = Math.max(maximumEstimatedPeakDb, decision.estimatedMasterPeakDb)
  }

  const played = decisions.filter((decision) => decision.play).length
  return {
    attempts: 11,
    played,
    suppressed: decisions.length - played,
    maximumConcurrent,
    maximumEstimatedPeakDb,
    ceilingDb: MASTER_PEAK_CEILING_DB,
    ceilingRespected: maximumEstimatedPeakDb <= MASTER_PEAK_CEILING_DB + 1e-9,
    decisions,
  }
}
