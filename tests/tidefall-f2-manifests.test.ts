import assert from 'node:assert/strict'
import test from 'node:test'
import {
  TIDEFALL_CURIOSITIES,
  TIDEFALL_CURIOSITY_SHELVES,
} from '../src/content/curiosities'
import { TIDEFALL } from '../src/content/universes/tidefall'
import { TIDEFALL_V2_PACK } from '../src/content/universes/tidefall-v2'
import {
  TIDEFALL_ARCHIVE_OBJECTS,
  TIDEFALL_KINDLING_OBJECTS,
  TIDEFALL_OMEN_OBJECTS,
  TIDEFALL_OMENS,
} from '../src/content/universes/tidefall/manifests'
import { TIDEFALL_OMEN_RUNTIME_SPECS } from '../src/content/universes/tidefall/omens'
import {
  TIDEFALL_TIDE_PERIOD_MS,
  TIDEFALL_TIDE_SIGNALS,
  tidefallTideMultiplier,
  tidefallTideState,
} from '../src/content/universes/tidefall/tide-state'

test('all eighteen Kindlings carry five meaningful authored ownership states', () => {
  assert.equal(TIDEFALL_KINDLING_OBJECTS.length, 18)
  assert.deepEqual(
    TIDEFALL_KINDLING_OBJECTS.map(({ sourceId }) => sourceId),
    TIDEFALL.generators.map(({ id }) => id),
  )
  for (const object of TIDEFALL_KINDLING_OBJECTS) {
    assert.deepEqual(Object.keys(object.ownershipStates ?? {}), ['1', '10', '25', '50', '100'])
    const states = Object.values(object.ownershipStates ?? {})
    assert.equal(new Set(states.map(({ silhouette }) => silhouette)).size, 5, object.id)
    assert.ok(states.every(({ label, material }) => label.length > 8 && material.length > 0), object.id)
    assert.notEqual(object.reducedMotionState.silhouette, '')
    assert.notEqual(object.lowQualityState.silhouette, '')
  }
})

test('all twelve Pelagic Archive records retain their legacy save IDs, names, and shelves', () => {
  assert.equal(TIDEFALL_ARCHIVE_OBJECTS.length, 12)
  assert.deepEqual(
    TIDEFALL_V2_PACK.archive.records.map(({ id, name }) => ({ id, name })),
    TIDEFALL_CURIOSITIES.map(({ id, name }) => ({ id, name })),
  )
  assert.deepEqual(
    TIDEFALL_V2_PACK.archive.shelves.map(({ id, name, recordIds }) => ({ id, name, recordIds: [...recordIds] })),
    TIDEFALL_CURIOSITY_SHELVES.map(({ id, name, ids }) => ({ id, name, recordIds: [...ids] })),
  )
  for (const [index, object] of TIDEFALL_ARCHIVE_OBJECTS.entries()) {
    assert.equal(object.sourceId, TIDEFALL_CURIOSITIES[index].id)
    assert.equal(object.loreRecord, TIDEFALL_CURIOSITIES[index].id)
  }
})

test('five Tidefall Omens have distinct motion, silhouettes, cues, and nonexclusive rewards', () => {
  assert.equal(TIDEFALL_OMENS.length, 5)
  assert.equal(TIDEFALL_OMEN_OBJECTS.length, 5)
  assert.equal(new Set(TIDEFALL_OMEN_OBJECTS.map(({ silhouette }) => silhouette)).size, 5)
  assert.equal(new Set(TIDEFALL_OMEN_OBJECTS.map(({ motion }) => motion.description)).size, 5)
  assert.equal(new Set(TIDEFALL_OMEN_OBJECTS.map(({ audioCue }) => audioCue)).size, 5)
  assert.ok(TIDEFALL_OMENS.every((omen) => omen.rewards.every((reward) => reward.exclusivePermanentPower === false)))

  const leviathan = TIDEFALL_OMEN_RUNTIME_SPECS.find(({ id }) => id === 'leviathan-passage')
  assert.equal(leviathan?.surfacings, 3)
  assert.equal(leviathan?.archiveRecordId, 'snail')
  assert.equal(TIDEFALL_OMEN_OBJECTS[4].screenZone, 'horizon')
})

test('the deterministic ninety-second tide exposes four periodic non-color states and averages one', () => {
  assert.equal(TIDEFALL_TIDE_PERIOD_MS, 90_000)
  assert.equal(tidefallTideState(0).id, 'rising')
  assert.equal(tidefallTideState(22_500).id, 'high')
  assert.equal(tidefallTideState(45_000).id, 'falling')
  assert.equal(tidefallTideState(67_500).id, 'low')
  assert.equal(tidefallTideState(-22_500).id, 'low')
  assert.equal(tidefallTideMultiplier(22_500), 1.4)
  assert.equal(tidefallTideMultiplier(67_500), 0.6)
  assert.equal(tidefallTideMultiplier(12_345), tidefallTideMultiplier(102_345))
  assert.throws(() => tidefallTideState(Number.NaN), /finite/)

  const samples = Array.from({ length: 360 }, (_, index) => tidefallTideMultiplier(index * 250))
  const average = samples.reduce((sum, value) => sum + value, 0) / samples.length
  assert.ok(Math.abs(average - 1) < 1e-12)
  assert.deepEqual(Object.keys(TIDEFALL_TIDE_SIGNALS), ['rising', 'high', 'falling', 'low'])
  assert.ok(Object.values(TIDEFALL_TIDE_SIGNALS).every(({ text, shape, pattern, highContrastTreatment }) => (
    text.length > 0 && shape.length > 0 && pattern.length > 0 && highContrastTreatment.length > 0
  )))
})
