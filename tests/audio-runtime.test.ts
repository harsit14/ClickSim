import assert from 'node:assert/strict'
import test from 'node:test'
import type {
  AudioBusDef,
  AudioBusId,
  AudioCueDef,
  SemanticFeedbackEvent,
  UniverseAudioDef,
} from '../src/content/universes/types'
import {
  GLOBAL_CONCURRENCY_LIMIT,
  MASTER_PEAK_CEILING_DB,
  REQUIRED_AUDIO_BUSES,
} from '../src/audio/semantic-contract'
import {
  EMPTY_SEMANTIC_AUDIO_RUNTIME_STATE,
  applySemanticAudioEvent,
} from '../src/audio/semantic-runtime'
import type {
  AudioSinkFallbackRequest,
  AudioSinkPlayRequest,
  SemanticAudioRuntimeState,
  SemanticAudioSink,
} from '../src/audio/semantic-runtime'

const bus = (id: AudioBusId): AudioBusDef => ({
  id,
  parent: id === 'master' ? null : 'master',
  defaultGain: 0.8,
  userControllable: true,
  muteBehavior: 'suppress-audio-only',
})

const cue = (
  id: string,
  cueBus: AudioBusId,
  priority: AudioCueDef['priority'] = 'normal',
): AudioCueDef => ({
  id,
  bus: cueBus,
  family: `${cueBus}-family`,
  synthesisKey: `${cueBus}-synthesis`,
  targetPeakDb: cueBus === 'omen' ? -10 : -14,
  maximumPeakDb: -6,
  minimumIntervalMs: 80,
  maximumConcurrentInstances: 2,
  priority,
  muteGroup: `${cueBus}-group`,
  mutedFallback: priority === 'important' || priority === 'ceremony'
    ? 'visual-and-caption'
    : 'none',
})

function audio(): UniverseAudioDef {
  return {
    tempoBpm: 72,
    meter: '4/4',
    buses: REQUIRED_AUDIO_BUSES.map(bus),
    cues: [
      cue('touch-cue', 'touch'),
      cue('purchase-cue', 'purchase'),
      cue('critical-cue', 'touch', 'important'),
      cue('omen-cue', 'omen', 'important'),
      cue('prestige-cue', 'ceremony', 'ceremony'),
    ],
    clickMaterialCue: 'touch-cue',
    purchaseIntervalCue: 'purchase-cue',
    criticalAccentCue: 'critical-cue',
    omenCallCue: 'omen-cue',
    prestigeCadenceCue: 'prestige-cue',
    stems: [1, 2, 3, 4].map((index) => ({
      id: `music-stem-${index}`,
      kindlingFamily: `kindling-family-${index}`,
      bus: 'music' as const,
      description: `Adaptive music stem ${index}`,
    })) as unknown as UniverseAudioDef['stems'],
    silenceState: 'A deliberate rest with full visual timing information',
    fatiguePolicy: 'Rate-limit, attenuate dense families, and retain headroom',
  }
}

function touch(atMs: number): SemanticFeedbackEvent {
  return {
    id: `touch-${atMs}`,
    occurredAtMs: atMs,
    kind: 'touch',
    tier: 1,
    source: { universeId: 'emberlight', kind: 'heart', id: 'last-ember' },
    amount: { mantissa: 1, exponent: 0 },
    critical: false,
    rhythmBand: null,
    audioCue: 'touch-cue',
  }
}

function omen(atMs: number): SemanticFeedbackEvent {
  return {
    id: `omen-${atMs}`,
    occurredAtMs: atMs,
    kind: 'skill',
    tier: 2,
    source: { universeId: 'emberlight', kind: 'omen', id: 'omen-01' },
    skillId: 'omen-catch',
    result: 'success',
    audioCue: 'omen-cue',
  }
}

class RecordingSink implements SemanticAudioSink {
  readonly plays: AudioSinkPlayRequest[] = []
  readonly visualFallbacks: AudioSinkFallbackRequest[] = []
  readonly captionFallbacks: AudioSinkFallbackRequest[] = []

  constructor(private readonly start = true) {}

  play(request: AudioSinkPlayRequest): boolean {
    this.plays.push(request)
    return this.start
  }

  presentVisualFallback(request: AudioSinkFallbackRequest): void {
    this.visualFallbacks.push(request)
  }

  presentCaptionFallback(request: AudioSinkFallbackRequest): void {
    this.captionFallbacks.push(request)
  }
}

test('ten clicks per second plus an Omen apply headroom and ducking to the abstract sink', () => {
  const contract = audio()
  const sink = new RecordingSink()
  const schedule = [
    ...Array.from({ length: 10 }, (_, index) => ({
      atMs: index * 100,
      durationMs: 120,
      order: 1,
      event: touch(index * 100),
    })),
    { atMs: 500, durationMs: 800, order: 0, event: omen(500) },
  ].sort((left, right) => left.atMs - right.atMs || left.order - right.order)
  let state: SemanticAudioRuntimeState = EMPTY_SEMANTIC_AUDIO_RUNTIME_STATE
  const results = schedule.map((entry) => {
    const result = applySemanticAudioEvent(contract, sink, state, {
      event: entry.event,
      nowMs: entry.atMs,
      durationMs: entry.durationMs,
    })
    assert.strictEqual(result.event, entry.event)
    state = result.nextState
    return result
  })

  assert.equal(sink.plays.length, results.filter((result) => result.played).length)
  assert.equal(state.history.length, sink.plays.length)
  assert.ok(sink.plays.every((request) => (
    request.estimatedMasterPeakDb <= MASTER_PEAK_CEILING_DB + 1e-9
  )))
  const omenPlay = sink.plays.find((request) => request.cue.id === 'omen-cue')
  assert.deepEqual(omenPlay?.ducking.find((entry) => entry.bus === 'touch'), {
    bus: 'touch',
    gainDb: -6,
  })

  let maximumConcurrent = 0
  for (const entry of state.history) {
    maximumConcurrent = Math.max(maximumConcurrent, state.history.filter((candidate) => (
      candidate.startedAtMs <= entry.startedAtMs && candidate.endsAtMs > entry.startedAtMs
    )).length)
  }
  assert.ok(maximumConcurrent <= GLOBAL_CONCURRENCY_LIMIT)
  assert.ok(maximumConcurrent <= 3)
})

test('mute groups and intentional silence suppress audio only while preserving fallbacks', () => {
  const contract = audio()
  const sink = new RecordingSink()
  const touchEvent = touch(100)
  const mutedTouch = applySemanticAudioEvent(contract, sink, EMPTY_SEMANTIC_AUDIO_RUNTIME_STATE, {
    event: touchEvent,
    nowMs: 100,
    durationMs: 120,
    preferences: { mutedGroups: ['touch-group'] },
  })
  assert.strictEqual(mutedTouch.event, touchEvent)
  assert.equal(mutedTouch.played, false)
  assert.equal(mutedTouch.decision.play, false)
  if (!mutedTouch.decision.play) assert.equal(mutedTouch.decision.reason, 'muted-group')
  assert.deepEqual(mutedTouch.nextState.history, [])

  const omenEvent = omen(200)
  const mutedOmen = applySemanticAudioEvent(contract, sink, EMPTY_SEMANTIC_AUDIO_RUNTIME_STATE, {
    event: omenEvent,
    nowMs: 200,
    durationMs: 800,
    preferences: { mutedGroups: ['omen-group'] },
  })
  assert.strictEqual(mutedOmen.event, omenEvent)
  assert.deepEqual(mutedOmen.fallbackKinds, ['visual', 'caption'])
  assert.strictEqual(sink.visualFallbacks[0].event, omenEvent)
  assert.strictEqual(sink.captionFallbacks[0].event, omenEvent)

  const silent = applySemanticAudioEvent(contract, sink, EMPTY_SEMANTIC_AUDIO_RUNTIME_STATE, {
    event: touch(300),
    nowMs: 300,
    durationMs: 120,
    preferences: { silence: true },
  })
  assert.equal(silent.played, false)
  if (!silent.decision.play) assert.equal(silent.decision.reason, 'muted-bus')

  const unrelatedMute = applySemanticAudioEvent(contract, sink, EMPTY_SEMANTIC_AUDIO_RUNTIME_STATE, {
    event: touch(400),
    nowMs: 400,
    durationMs: 120,
    preferences: { mutedGroups: ['purchase-group'] },
  })
  assert.equal(unrelatedMute.played, true)
})

test('rate-limited and sink-rejected cues never enter played history', () => {
  const contract = audio()
  const sink = new RecordingSink()
  const first = applySemanticAudioEvent(contract, sink, EMPTY_SEMANTIC_AUDIO_RUNTIME_STATE, {
    event: touch(100),
    nowMs: 100,
    durationMs: 120,
  })
  assert.equal(first.played, true)
  assert.equal(first.nextState.history.length, 1)

  const limited = applySemanticAudioEvent(contract, sink, first.nextState, {
    event: touch(150),
    nowMs: 150,
    durationMs: 120,
  })
  assert.equal(limited.played, false)
  if (!limited.decision.play) assert.equal(limited.decision.reason, 'rate-limited')
  assert.equal(limited.nextState.history.length, 1)
  assert.equal(sink.plays.length, 1)

  const rejectingSink = new RecordingSink(false)
  const rejected = applySemanticAudioEvent(contract, rejectingSink, EMPTY_SEMANTIC_AUDIO_RUNTIME_STATE, {
    event: omen(500),
    nowMs: 500,
    durationMs: 800,
  })
  assert.equal(rejected.played, false)
  assert.deepEqual(rejected.nextState.history, [])
  assert.deepEqual(rejected.fallbackKinds, ['visual', 'caption'])
  assert.equal(rejectingSink.plays.length, 1)
  assert.equal(rejectingSink.visualFallbacks.length, 1)
  assert.equal(rejectingSink.captionFallbacks.length, 1)
})

test('sink errors preserve semantic events and do not manufacture played instances', () => {
  const contract = audio()
  const event = omen(900)
  const sink: SemanticAudioSink = {
    play: () => { throw new Error('device unavailable') },
    presentVisualFallback: () => undefined,
    presentCaptionFallback: () => undefined,
  }
  const result = applySemanticAudioEvent(contract, sink, EMPTY_SEMANTIC_AUDIO_RUNTIME_STATE, {
    event,
    nowMs: 900,
    durationMs: 800,
  })
  assert.strictEqual(result.event, event)
  assert.equal(result.played, false)
  assert.deepEqual(result.nextState.history, [])
  assert.ok(result.sinkErrors.some((entry) => entry.includes('device unavailable')))
})
