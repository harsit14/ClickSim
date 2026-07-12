import assert from 'node:assert/strict'
import test from 'node:test'
import {
  compareProgressionBoundary,
  type ProgressionBoundary,
  type RecoveryEstimateInputs,
} from '../src/experience/reset-comparison'

function ids(items: readonly { id: string }[]): string[] {
  return items.map(({ id }) => id)
}

const recovery: RecoveryEstimateInputs = {
  currentFrontierRate: '3.4e15',
  postBoundaryStartingRate: '2.1e12',
  projectedRecoveredRate: '1.18e16',
  estimatedRecoveryMs: 240_000,
  basis: 'simulation',
  detailKey: 'recovery.simulated-purchase-route',
}

test('Epoch Turn reports exact World loss and preserves every higher scope', () => {
  const reward = { glyph: '◇', localName: 'Memory Seeds', canonicalName: 'Epoch Matter', current: '4', gain: '3', after: '7' }
  const result = compareProgressionBoundary({ boundary: 'epoch-turn', recovery, reward })
  assert.deepEqual(ids(result.lost), [
    'world-currency',
    'run-earnings',
    'kindlings',
    'ordinary-upgrades',
    'buy-mode',
    'trial-return-snapshot',
  ])
  assert.ok(ids(result.retained).includes('epoch-matter'))
  assert.ok(ids(result.retained).includes('epoch-turn-count'))
  assert.ok(ids(result.retained).includes('deep-collapse-count'))
  assert.ok(ids(result.retained).includes('local-archive'))
  assert.ok(ids(result.retained).includes('beacons'))
  assert.equal(result.recovery.status, 'estimated')
  assert.deepEqual(result.recovery.inputs, recovery)
  assert.deepEqual(result.reward, reward)
})

test('Deep Collapse clears World and Epoch scopes but not Deep/history or Between', () => {
  const result = compareProgressionBoundary({ boundary: 'deep-collapse' })
  assert.ok(ids(result.lost).includes('world-currency'))
  assert.ok(ids(result.lost).includes('epoch-matter'))
  assert.equal(ids(result.lost).includes('epoch-turn-count'), false)
  assert.ok(ids(result.retained).includes('deep-currency'))
  assert.ok(ids(result.retained).includes('epoch-turn-count'))
  assert.ok(ids(result.retained).includes('deep-collapse-count'))
  assert.ok(ids(result.retained).includes('local-trials'))
  assert.ok(ids(result.retained).includes('dark-between'))
  assert.equal(result.recovery.status, 'unavailable')
  assert.equal(result.recovery.reason, 'missing-estimate')
})

test('v12 Remembrance affects only the active universe and preserves memory records', () => {
  const result = compareProgressionBoundary({ boundary: 'remembrance', recovery })
  assert.ok(ids(result.lost).includes('local-trials'))
  assert.ok(ids(result.lost).includes('local-automation'))
  assert.ok(ids(result.lost).includes('local-story-seen-sequence'))
  assert.ok(ids(result.lost).includes('current-answer'))
  assert.ok(ids(result.lost).includes('progressive-ui'))
  assert.ok(ids(result.lost).includes('epoch-turn-count'))
  assert.ok(ids(result.lost).includes('deep-collapse-count'))
  assert.ok(ids(result.retained).includes('local-echoes'))
  assert.ok(ids(result.retained).includes('local-archive'))
  assert.ok(ids(result.retained).includes('local-records'))
  assert.equal(ids(result.retained).includes('epoch-turn-count'), false)
  assert.equal(ids(result.retained).includes('deep-collapse-count'), false)
  assert.ok(ids(result.retained).includes('historical-answers'))
  assert.deepEqual(ids(result.parked), ['other-parked-universe-runs'])
})

test('trial entry temporarily replaces an exact World snapshot instead of losing it', () => {
  const result = compareProgressionBoundary({ boundary: 'enter-trial' })
  assert.deepEqual(result.lost, [])
  assert.deepEqual(ids(result.temporarilyReplaced), [
    'world-currency',
    'run-earnings',
    'kindlings',
    'ordinary-upgrades',
    'buy-mode',
  ])
  assert.ok(ids(result.retained).includes('trial-return-snapshot'))
  assert.equal(result.recovery.status, 'not-applicable')
})

test('Crossing parks the complete departing local run and never reports a loss', () => {
  const result = compareProgressionBoundary({ boundary: 'crossing', recovery })
  assert.deepEqual(result.lost, [])
  assert.ok(ids(result.parked).includes('world-currency'))
  assert.ok(ids(result.parked).includes('epoch-matter'))
  assert.ok(ids(result.parked).includes('deep-currency'))
  assert.ok(ids(result.retained).includes('beacons'))
  assert.equal(result.recovery.status, 'not-applicable')
  assert.equal(result.recovery.inputs, null)
})

test('lighting a Beacon is completion without consuming local or shared state', () => {
  const result = compareProgressionBoundary({ boundary: 'light-beacon' })
  assert.deepEqual(result.lost, [])
  assert.ok(ids(result.retained).includes('kindlings'))
  assert.ok(ids(result.retained).includes('beacons'))
  assert.equal(result.requiresExplicitConfirmation, false)
})

test('Atlas route disposition changes only route-local reporting', () => {
  const discarded = compareProgressionBoundary({ boundary: 'atlas-route', atlasRouteDisposition: 'discard' })
  const archived = compareProgressionBoundary({ boundary: 'atlas-route', atlasRouteDisposition: 'archive' })
  assert.deepEqual(ids(discarded.lost), ['atlas-route-state'])
  assert.deepEqual(archived.lost, [])
  assert.ok(ids(archived.retained).includes('atlas-route-record'))
  assert.ok(ids(discarded.retained).includes('world-currency'))
})

test('full wipe is the sole boundary that clears Between and parked state', () => {
  const boundaries: ProgressionBoundary[] = [
    'enter-trial',
    'epoch-turn',
    'deep-collapse',
    'remembrance',
    'crossing',
    'light-beacon',
    'atlas-route',
  ]
  for (const boundary of boundaries) {
    assert.equal(ids(compareProgressionBoundary({ boundary }).lost).includes('beacons'), false)
  }

  const withoutExport = compareProgressionBoundary({ boundary: 'full-wipe' })
  assert.ok(ids(withoutExport.lost).includes('beacons'))
  assert.ok(ids(withoutExport.lost).includes('other-parked-universe-runs'))
  assert.ok(ids(withoutExport.lost).includes('atlas-route-state'))
  assert.deepEqual(withoutExport.retained, [])

  const withExport = compareProgressionBoundary({ boundary: 'full-wipe', externalExportAvailable: true })
  assert.deepEqual(ids(withExport.retained), ['external-export'])
})

test('invalid caller recovery estimates remain visible but are never presented as estimated', () => {
  const invalid = compareProgressionBoundary({
    boundary: 'epoch-turn',
    recovery: { ...recovery, estimatedRecoveryMs: Number.NaN },
  })
  assert.equal(invalid.recovery.status, 'unavailable')
  assert.equal(invalid.recovery.reason, 'invalid-estimate')
  assert.ok(Number.isNaN(invalid.recovery.inputs?.estimatedRecoveryMs))
})
