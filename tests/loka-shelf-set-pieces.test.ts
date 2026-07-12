import assert from 'node:assert/strict'
import test from 'node:test'
import {
  LOKA_SHELF_MOMENT_DURATION_MS,
  LOKA_SHELF_SET_PIECES,
  planLokaShelfSetPieces,
} from '../src/render/loka-shelf-set-pieces'

function archiveIds(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}-archive-${String(index + 1).padStart(2, '0')}`)
}

test('nine authored shelf moments cover exactly three shelves in every loka', () => {
  assert.equal(LOKA_SHELF_SET_PIECES.length, 9)
  for (const universeId of ['prismata', 'tempest', 'canticle'] as const) {
    const realm = LOKA_SHELF_SET_PIECES.filter((entry) => entry.universeId === universeId)
    assert.deepEqual(realm.map(({ shelfIndex }) => shelfIndex), [1, 2, 3])
    assert.ok(realm.every(({ moment, staticEquivalent, shape, pattern }) => moment && staticEquivalent && shape && pattern))
  }
})

test('a shelf moment lasts twelve seconds, is skippable by persisted timestamp, and has reduced-motion equivalence', () => {
  const startedAt = 1_000_000
  const active = planLokaShelfSetPieces('prismata', archiveIds('u5', 4), { 'u5-shelf-1-at': startedAt }, startedAt + 3_000, true)[0]
  assert.equal(active.completed, true)
  assert.equal(active.active, true)
  assert.equal(active.reducedMotion, true)
  assert.equal(active.progressFraction, 0.25)
  assert.equal(active.progressKey, 'u5-shelf-1-at')

  const finished = planLokaShelfSetPieces('prismata', archiveIds('u5', 4), { 'u5-shelf-1-at': startedAt }, startedAt + LOKA_SHELF_MOMENT_DURATION_MS, false)[0]
  assert.equal(finished.active, false)
  const skipped = planLokaShelfSetPieces('prismata', archiveIds('u5', 4), { 'u5-shelf-1-at': 1 }, startedAt, false)[0]
  assert.equal(skipped.active, false)
})

test('completed shelves retain their world landmark after the timed moment', () => {
  const plans = planLokaShelfSetPieces('canticle', archiveIds('u7', 12), {}, Date.now(), false)
  assert.equal(plans.filter(({ completed }) => completed).length, 3)
  assert.equal(plans.filter(({ active }) => active).length, 0)
})
