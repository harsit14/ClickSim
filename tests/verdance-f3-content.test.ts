import assert from 'node:assert/strict'
import test from 'node:test'
import { assertValidUniversePackV2 } from '../src/render/manifest-validator'
import { VERDANCE, VERDANCE_V2_PACK } from '../src/content/universes/verdance'

test('Verdance ships one complete legacy and V2 content pack', () => {
  assert.equal(VERDANCE.generators.length, 18)
  assert.equal(VERDANCE.echoes.length, 10)
  assert.equal(VERDANCE.cabinet.items.length, 12)
  assert.equal(VERDANCE_V2_PACK.economy.generators.length, 18)
  assert.equal(VERDANCE_V2_PACK.economy.doctrines.length, 4)
  assert.equal(VERDANCE_V2_PACK.omens.length, 4)
  assert.equal(VERDANCE_V2_PACK.archive.records.length, 12)
  assert.equal(VERDANCE_V2_PACK.story.echoes.length, 10)
  assert.equal(VERDANCE_V2_PACK.story.scenes.some(({ kind }) => kind === 'beacon'), true)
  assert.equal(VERDANCE_V2_PACK.physics.cohorts?.witheringAllowed, false)
  assert.doesNotThrow(() => assertValidUniversePackV2(VERDANCE_V2_PACK))
})

test('Verdance IDs remain in the reserved U3 namespace outside legacy bridge fields', () => {
  assert.equal(VERDANCE_V2_PACK.economy.generators.every(({ id }) => id.startsWith('verdance-')), true)
  assert.equal(VERDANCE_V2_PACK.archive.records.every(({ id }) => id.startsWith('verdance-')), true)
  assert.equal(VERDANCE_V2_PACK.story.echoes.every(({ id }) => id.startsWith('verdance-')), true)
})
