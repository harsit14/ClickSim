import assert from 'node:assert/strict'
import test from 'node:test'
import {
  realmQuestionStateAvailable,
  recordRevisedRealmConclusionState,
} from '../src/engine/realm-conclusion-state'

test('Atlas route state cannot open or mutate the permanent realm Question', () => {
  assert.equal(realmQuestionStateAvailable({ activeAtlasRoute: null, ending: null }), true)
  assert.equal(realmQuestionStateAvailable({
    activeAtlasRoute: { routeCode: 'temporary' },
    ending: null,
  }), false)
  assert.equal(realmQuestionStateAvailable({ activeAtlasRoute: null, ending: 'warden' }), false)

  const routeState = {
    activeAtlasRoute: { routeCode: 'temporary' },
    beacons: ['emberlight'],
    realmAnswers: {},
  }
  assert.equal(recordRevisedRealmConclusionState(
    routeState,
    'emberlight',
    'emberlight-bank-fire',
  ), false)
  assert.deepEqual(routeState.realmAnswers, {})
})

test('completed-Beacon compatibility recording is local, one-time, and non-mechanical', () => {
  const incomplete = {
    activeAtlasRoute: null,
    beacons: [],
    realmAnswers: {},
  }
  assert.equal(recordRevisedRealmConclusionState(
    incomplete,
    'emberlight',
    'emberlight-bank-fire',
  ), false)

  const completed = {
    activeAtlasRoute: null,
    beacons: ['emberlight'],
    realmAnswers: {},
    ending: 'hunger' as const,
  }
  assert.equal(recordRevisedRealmConclusionState(
    completed,
    'emberlight',
    'tidefall-carry-names',
  ), false)
  assert.equal(recordRevisedRealmConclusionState(
    completed,
    'emberlight',
    'emberlight-bank-fire',
  ), true)
  assert.deepEqual(completed.realmAnswers, { emberlight: ['emberlight-bank-fire'] })
  assert.equal(completed.ending, 'hunger')

  assert.equal(recordRevisedRealmConclusionState(
    completed,
    'emberlight',
    'emberlight-spend-ember',
  ), false)
  assert.deepEqual(completed.realmAnswers, { emberlight: ['emberlight-bank-fire'] })
})
