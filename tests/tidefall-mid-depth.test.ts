import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { planTidefallMidDepth, tidefallMigrationForm } from '../src/render/tidefall/mid-depth'

test('Tidefall migration forms change at shared ownership thresholds', () => {
  assert.deepEqual([0, 1, 9, 10, 24, 25, 49, 50, 99, 100].map(tidefallMigrationForm), [0, 1, 1, 2, 2, 3, 3, 4, 4, 5])
})

test('Tidefall middle-band life is owned, sparse, and leaves the trench empty', () => {
  const owned = { wisp: 100, forge: 50, titan: 25, constellation: 10 }
  const high = planTidefallMidDepth(owned, 'high')
  const low = planTidefallMidDepth(owned, 'low')
  assert.equal(high.length, 4)
  assert.equal(low.length, 2)
  assert.ok(high.every(({ y }) => y >= 40 && y < 62))
  assert.equal(planTidefallMidDepth({}, 'high').length, 0)
})

test('Tidefall drifting forms become static under reduced motion', () => {
  const source = readFileSync(new URL('../src/ui/TidefallFlagshipLayer.svelte', import.meta.url), 'utf8')
  assert.match(source, /data-motion=\{reducedMotion \? 'static' : 'drifting'\}/)
  assert.match(source, /class:static=\{reducedMotion\}/)
  assert.match(source, /\.migration\.static \{[^}]*animation:none/)
})
