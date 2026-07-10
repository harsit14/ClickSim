import assert from 'node:assert/strict'
import test from 'node:test'
import {
  averagedRhythmReward,
  DEFAULT_AVERAGED_COMPETENT_RATIO,
  MAX_AVERAGED_COMPETENT_RATIO,
  MIN_AVERAGED_COMPETENT_RATIO,
  type RhythmPresentationContext,
} from '../src/accessibility/averaged-rhythm'

const presentation: RhythmPresentationContext = {
  audio: 'audible',
  motion: 'full',
  quality: 'high',
}

test('averaged rhythm sits 10–15% below competent play and below exceptional play', () => {
  const result = averagedRhythmReward({
    competentMultiplier: 1.6,
    exceptionalMultiplier: 2.2,
    presentation,
  })
  assert.equal(result.status, 'ready')
  assert.equal(result.competentRatio, DEFAULT_AVERAGED_COMPETENT_RATIO)
  assert.ok((result.competentGapRatio ?? 0) >= 0.10)
  assert.ok((result.competentGapRatio ?? 1) <= 0.15)
  assert.equal(result.rewardMultiplier, 1.6 * DEFAULT_AVERAGED_COMPETENT_RATIO)
  assert.equal(result.belowExceptional, true)
  assert.ok((result.rewardMultiplier ?? Number.POSITIVE_INFINITY) < 2.2)
})

test('caller targets are clamped to the approved accessibility balance range', () => {
  const low = averagedRhythmReward({
    competentMultiplier: 2,
    exceptionalMultiplier: 3,
    targetCompetentRatio: 0.2,
    presentation,
  })
  const high = averagedRhythmReward({
    competentMultiplier: 2,
    exceptionalMultiplier: 3,
    targetCompetentRatio: 1.5,
    presentation,
  })
  assert.equal(low.competentRatio, MIN_AVERAGED_COMPETENT_RATIO)
  assert.equal(high.competentRatio, MAX_AVERAGED_COMPETENT_RATIO)
})

test('audio, motion, and quality never affect averaged reward or eligibility', () => {
  const contexts: RhythmPresentationContext[] = []
  for (const audio of ['audible', 'muted'] as const) {
    for (const motion of ['full', 'reduced'] as const) {
      for (const quality of ['high', 'balanced', 'low'] as const) {
        contexts.push({ audio, motion, quality })
      }
    }
  }

  const results = contexts.map((context) => averagedRhythmReward({
    competentMultiplier: 1.5,
    exceptionalMultiplier: 2,
    presentation: context,
  }))
  assert.ok(results.every(({ status }) => status === 'ready'))
  assert.equal(new Set(results.map(({ rewardMultiplier }) => rewardMultiplier)).size, 1)
})

test('invalid balance profiles fail closed instead of inventing an accessible reward', () => {
  for (const profile of [
    { competentMultiplier: 0, exceptionalMultiplier: 2 },
    { competentMultiplier: 2, exceptionalMultiplier: 2 },
    { competentMultiplier: Number.NaN, exceptionalMultiplier: 3 },
  ]) {
    assert.deepEqual(averagedRhythmReward({ ...profile, presentation }), {
      status: 'invalid-profile',
      rewardMultiplier: null,
      competentRatio: null,
      competentGapRatio: null,
      belowExceptional: false,
      presentation,
    })
  }
})
