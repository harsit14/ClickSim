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
  dispatchSemanticAudio,
  planAudioCue,
  simulateTenClicksPerSecondWithOmen,
  validateUniverseAudioDef,
} from '../src/audio/semantic-contract'
import { purchaseAudioProfile } from '../src/audio/sfx'

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

function validAudio(): UniverseAudioDef {
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
    silenceState: 'A deliberate harmonic rest with visual timing intact',
    fatiguePolicy: 'Bound pitch, rate-limit repetition, and attenuate dense families',
  }
}

const touchEvent: SemanticFeedbackEvent = {
  id: 'touch-feedback',
  occurredAtMs: 100,
  kind: 'touch',
  tier: 1,
  source: { universeId: 'emberlight', kind: 'heart', id: 'last-ember' },
  amount: { mantissa: 1, exponent: 0 },
  critical: false,
  rhythmBand: null,
  audioCue: 'touch-cue',
}

test('accepts explicit buses, semantic cue references, fallbacks, and four stems', () => {
  assert.deepEqual(validateUniverseAudioDef(validAudio()), [])
})

test('invalid buses and cues fail with actionable paths', () => {
  const audio = validAudio() as unknown as Record<string, any>
  audio.buses = audio.buses.filter((definition: AudioBusDef) => definition.id !== 'story')
  audio.buses.find((definition: AudioBusDef) => definition.id === 'touch').parent = 'purchase'
  audio.buses.find((definition: AudioBusDef) => definition.id === 'purchase').parent = 'touch'
  audio.cues[0] = {
    ...audio.cues[0],
    maximumPeakDb: 1,
    maximumConcurrentInstances: 20,
  }
  audio.cues[3] = { ...audio.cues[3], mutedFallback: 'none' }

  const issues = validateUniverseAudioDef(audio)
  assert.ok(issues.some((entry) => entry.path === 'buses' && entry.code === 'bus.required-missing'))
  assert.ok(issues.some((entry) => entry.path === 'buses.touch.parent' && entry.code === 'bus.parent-cycle'))
  assert.ok(issues.some((entry) => (
    entry.path === 'cues[0].maximumPeakDb' && entry.code === 'cue.maximum-peak-invalid'
  )))
  assert.ok(issues.some((entry) => (
    entry.path === 'cues[0].maximumConcurrentInstances' && entry.code === 'cue.concurrency-invalid'
  )))
  assert.ok(issues.some((entry) => (
    entry.path === 'cues[3].mutedFallback' && entry.code === 'cue.fallback-required'
  )))
})

test('bus and mute-group controls suppress audio only and preserve semantic events', () => {
  const audio = validAudio()
  const mutedBus = dispatchSemanticAudio(touchEvent, audio, {
    nowMs: 100,
    durationMs: 120,
    history: [],
    mutedBuses: ['touch'],
  })
  assert.strictEqual(mutedBus.event, touchEvent)
  assert.deepEqual(mutedBus.audio, {
    play: false,
    cueId: 'touch-cue',
    reason: 'muted-bus',
    mutedFallback: 'none',
  })

  const mutedMaster = dispatchSemanticAudio(touchEvent, audio, {
    nowMs: 100,
    durationMs: 120,
    history: [],
    mutedBuses: ['master'],
  })
  assert.strictEqual(mutedMaster.event, touchEvent)
  assert.equal(mutedMaster.audio.play, false)
  if (!mutedMaster.audio.play) assert.equal(mutedMaster.audio.reason, 'muted-bus')

  const unrelatedGroup = dispatchSemanticAudio(touchEvent, audio, {
    nowMs: 100,
    durationMs: 120,
    history: [],
    mutedGroups: ['purchase-group'],
  })
  assert.strictEqual(unrelatedGroup.event, touchEvent)
  assert.equal(unrelatedGroup.audio.play, true)

  const mutedTouchGroup = dispatchSemanticAudio(touchEvent, audio, {
    nowMs: 100,
    durationMs: 120,
    history: [],
    mutedGroups: ['touch-group'],
  })
  assert.strictEqual(mutedTouchGroup.event, touchEvent)
  assert.equal(mutedTouchGroup.audio.play, false)
  if (!mutedTouchGroup.audio.play) assert.equal(mutedTouchGroup.audio.reason, 'muted-group')
})

test('rate, concurrency, fatigue, and Omen ducking policies are deterministic', () => {
  const audio = validAudio()
  const first = planAudioCue('touch-cue', audio, {
    nowMs: 100,
    durationMs: 120,
    history: [],
  })
  assert.equal(first.play, true)
  if (!first.play) return

  const history = [{
    cueId: first.cueId,
    family: first.family,
    bus: first.bus,
    priority: first.priority,
    startedAtMs: 100,
    endsAtMs: first.endsAtMs,
    appliedPeakDb: first.appliedPeakDb,
  }]
  const limited = planAudioCue('touch-cue', audio, {
    nowMs: 150,
    durationMs: 120,
    history,
  })
  assert.equal(limited.play, false)
  if (!limited.play) assert.equal(limited.reason, 'rate-limited')

  const omen = planAudioCue('omen-cue', audio, {
    nowMs: 200,
    durationMs: 800,
    history,
  })
  assert.equal(omen.play, true)
  if (omen.play) {
    assert.deepEqual(omen.ducking.find((entry) => entry.bus === 'touch'), {
      bus: 'touch',
      gainDb: -6,
    })
  }

  const fatiguedHistory = Array.from({ length: 10 }, (_, index) => ({
    cueId: 'touch-cue',
    family: 'touch-family',
    bus: 'touch' as const,
    priority: 'normal' as const,
    startedAtMs: index * 90,
    endsAtMs: index * 90 + 1,
    appliedPeakDb: -14,
  }))
  const fatigued = planAudioCue('touch-cue', audio, {
    nowMs: 900,
    durationMs: 120,
    history: fatiguedHistory,
  })
  assert.equal(fatigued.play, false)
  if (!fatigued.play) assert.equal(fatigued.reason, 'fatigue-limited')
})

test('ten clicks per second plus an overlapping Omen remain below peak and voice budgets', () => {
  const audio = validAudio()
  const first = simulateTenClicksPerSecondWithOmen(audio)
  const second = simulateTenClicksPerSecondWithOmen(audio)

  assert.deepEqual(first, second)
  assert.equal(first.attempts, 11)
  assert.equal(first.played + first.suppressed, 11)
  assert.ok(first.maximumConcurrent <= GLOBAL_CONCURRENCY_LIMIT)
  assert.ok(first.maximumConcurrent <= 3)
  assert.ok(first.maximumEstimatedPeakDb <= MASTER_PEAK_CEILING_DB + 1e-9)
  assert.equal(first.ceilingRespected, true)
})

test('bulk purchase timbre scales without changing gain or voice count', () => {
  const one = purchaseAudioProfile(1)
  const ten = purchaseAudioProfile(10)
  const max = purchaseAudioProfile(10_000)

  assert.deepEqual(one, { pitchScale: 1, spacingScale: 1, decayScale: 1 })
  assert.ok(ten.pitchScale > one.pitchScale)
  assert.ok(ten.spacingScale < one.spacingScale)
  assert.ok(ten.decayScale > one.decayScale)
  assert.ok(max.pitchScale >= ten.pitchScale)
  assert.ok(max.spacingScale <= ten.spacingScale)
  assert.ok(max.decayScale >= ten.decayScale)
  assert.deepEqual(purchaseAudioProfile(Number.NaN), one)
})
