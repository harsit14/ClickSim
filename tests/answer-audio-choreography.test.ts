import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { REALM_CONCLUSIONS, type RealmAnswerId } from '../src/content/endings'
import {
  ANSWER_CHOREOGRAPHIES,
  answerChoreographyCue,
} from '../src/render/answer-choreography'
import {
  ANSWER_AUDIO_HEADROOM_LINEAR_CEILING,
  ANSWER_AUDIO_MAX_CONCURRENT_GESTURES,
  ANSWER_AUDIO_MAX_DURATION_MS,
  answerAudioPlan,
  answerIdFromChoreographyEvent,
  scheduleAnswerAudioPlan,
} from '../src/audio/answer-cues'
import { playRealmAnswerChoreography } from '../src/audio/sfx'

const answerIds = Object.values(REALM_CONCLUSIONS)
  .flatMap(({ choices }) => choices.map(({ id }) => id))

function activeAt(answerId: RealmAnswerId, atMs: number) {
  return answerAudioPlan(answerId).gestures.filter(({ startMs, durationMs }) => (
    startMs <= atMs && startMs + durationMs > atMs
  ))
}

test('all twenty-one answer IDs own canonical, multi-beat audio plans', () => {
  assert.equal(answerIds.length, 21)
  assert.equal(new Set(answerIds).size, 21)
  assert.deepEqual(new Set(answerIds), new Set(Object.keys(ANSWER_CHOREOGRAPHIES)))

  for (const answerId of answerIds) {
    const plan = answerAudioPlan(answerId)
    const visual = ANSWER_CHOREOGRAPHIES[answerId]
    assert.equal(plan.answerId, answerId)
    assert.equal(plan.audioCue, visual.audioCue)
    assert.equal(plan.rhythm, visual.motion.rhythm)
    assert.ok(plan.gestures.length >= 3, `${answerId}: multi-beat sequence`)
    assert.ok(new Set(plan.gestures.map(({ startMs }) => startMs)).size >= 3, `${answerId}: distinct beats`)
    assert.ok(plan.totalDurationMs <= ANSWER_AUDIO_MAX_DURATION_MS, `${answerId}: bounded duration`)
    assert.ok(plan.totalDurationMs >= 700, `${answerId}: ceremony remains legible`)

    for (const gesture of plan.gestures) {
      assert.ok(Number.isFinite(gesture.startMs) && gesture.startMs >= 0, `${answerId}: start`)
      assert.ok(gesture.durationMs > 0, `${answerId}: duration`)
      assert.ok(gesture.attackMs > 0 && gesture.attackMs < gesture.durationMs, `${answerId}: envelope`)
      assert.ok(gesture.startHz >= 60 && gesture.startHz <= 1_200, `${answerId}: start frequency`)
      assert.ok(gesture.endHz >= 60 && gesture.endHz <= 1_200, `${answerId}: end frequency`)
      assert.ok(gesture.peakGain > 0 && gesture.peakGain <= 0.1, `${answerId}: local gain`)
      assert.ok(gesture.lowPassHz >= 600 && gesture.lowPassHz <= 7_000, `${answerId}: filter`)
      assert.ok(gesture.pan >= -0.7 && gesture.pan <= 0.7, `${answerId}: optional stereo position`)
    }
  }
})

test('every answer has a different scheduling fingerprint, not a doctrine-level reskin', () => {
  const fingerprints = answerIds.map((answerId) => {
    const plan = answerAudioPlan(answerId)
    // Canonical IDs and rhythm labels are intentionally excluded: timing,
    // contour, timbre, envelopes, filtering, and stereo motion must differ.
    return JSON.stringify(plan.gestures)
  })
  assert.equal(new Set(fingerprints).size, 21)
})

test('answer ceremonies preserve the global concurrency and headroom contracts', () => {
  for (const answerId of answerIds) {
    const plan = answerAudioPlan(answerId)
    const boundaries = plan.gestures.flatMap(({ startMs, durationMs }) => [startMs, startMs + durationMs])
    for (const atMs of boundaries) {
      const active = activeAt(answerId, atMs)
      assert.ok(
        active.length <= ANSWER_AUDIO_MAX_CONCURRENT_GESTURES,
        `${answerId}: ${active.length} voices at ${atMs}ms`,
      )
      const conservativePeak = active.reduce((sum, { peakGain }) => sum + peakGain, 0) * plan.ceremonyGain
      assert.ok(
        conservativePeak <= ANSWER_AUDIO_HEADROOM_LINEAR_CEILING,
        `${answerId}: ${conservativePeak} linear peak at ${atMs}ms`,
      )
    }
  }
})

test('the event adapter accepts only exact resolve details and rejects previews or drift', () => {
  for (const answerId of answerIds) {
    const resolve = answerChoreographyCue(answerId, 'resolve')
    assert.equal(answerIdFromChoreographyEvent(resolve), answerId)
    assert.equal(answerIdFromChoreographyEvent(answerChoreographyCue(answerId, 'preview')), null)
    assert.equal(answerIdFromChoreographyEvent({ ...resolve, rhythm: `${resolve.rhythm}-drift` }), null)
    assert.equal(answerIdFromChoreographyEvent({ ...resolve, motif: `${resolve.motif}-drift` }), null)
    assert.equal(answerIdFromChoreographyEvent({ ...resolve, universeId: 'emberlight' }), (
      resolve.universeId === 'emberlight' ? answerId : null
    ))
  }
  assert.equal(answerIdFromChoreographyEvent(null), null)
  assert.equal(answerIdFromChoreographyEvent({ phase: 'resolve', answerId: 'not-an-answer' }), null)
})

test('closed or unavailable WebAudio declines cleanly so the legacy cue can fall back', () => {
  const plan = answerAudioPlan('emberlight-bank-fire')
  const closedContext = { state: 'closed', currentTime: 0 } as AudioContext
  assert.equal(scheduleAnswerAudioPlan(closedContext, {} as GainNode, plan), false)
  if (!('AudioContext' in globalThis)) {
    assert.equal(playRealmAnswerChoreography('emberlight-bank-fire'), false)
  }
})

test('successful WebAudio scheduling builds the full graph and rejects duplicate ceremonies', () => {
  const parameter = () => ({
    value: 0,
    setValueAtTime() {},
    exponentialRampToValueAtTime() {},
  })
  const connect = (_target: unknown) => _target
  const oscillators: Array<{
    starts: number[]
    stops: number[]
    endedListener: (() => void) | null
  }> = []
  const context = {
    state: 'running',
    currentTime: 4,
    createGain: () => ({ gain: parameter(), connect, disconnect() {} }),
    createBiquadFilter: () => ({ type: 'lowpass', frequency: parameter(), Q: parameter(), connect }),
    createStereoPanner: () => ({ pan: parameter(), connect }),
    createOscillator: () => {
      const record = { starts: [] as number[], stops: [] as number[], endedListener: null as (() => void) | null }
      oscillators.push(record)
      return {
        type: 'sine',
        frequency: parameter(),
        connect,
        start: (at: number) => record.starts.push(at),
        stop: (at: number) => record.stops.push(at),
        addEventListener: (_event: string, listener: () => void) => { record.endedListener = listener },
      }
    },
  }
  const master = { connect } as unknown as GainNode
  const plan = answerAudioPlan('verdance-graft-inheritance')

  assert.equal(scheduleAnswerAudioPlan(context as unknown as AudioContext, master, plan), true)
  assert.equal(oscillators.length, plan.gestures.length)
  assert.ok(oscillators.every(({ starts, stops }) => starts.length === 1 && stops.length === 1))
  assert.ok(oscillators.at(-1)?.endedListener, 'the final oscillator owns ceremony cleanup')
  assert.equal(scheduleAnswerAudioPlan(context as unknown as AudioContext, master, plan), false)

  context.currentTime += plan.totalDurationMs / 1_000 + 0.001
  assert.equal(scheduleAnswerAudioPlan(context as unknown as AudioContext, master, plan), true)
  assert.equal(oscillators.length, plan.gestures.length * 2)
})

test('answer synthesis is deterministic, timer-free, and claims the visual event only on success', () => {
  const plans = readFileSync(new URL('../src/audio/answer-cues.ts', import.meta.url), 'utf8')
  const sfx = readFileSync(new URL('../src/audio/sfx.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(plans, /Math\.random|setTimeout|setInterval|Date\.now/)
  assert.match(sfx, /answerIdFromChoreographyEvent\(event\.detail\)/)
  assert.match(sfx, /playRealmAnswerChoreography\(answerId\)\) event\.preventDefault\(\)/)
})
