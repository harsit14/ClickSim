import assert from 'node:assert/strict'
import test from 'node:test'
import { EMBERLIGHT_V2 } from '../src/content/universes/emberlight-v2'
import { TIDEFALL_V2_PACK } from '../src/content/universes/tidefall-v2'
import { EMBERLIGHT_PRESENTATION } from '../src/render/emberlight/presentation'
import {
  objectPresentationStateKey,
  validateUniversePresentation,
} from '../src/render/presentation-contract'
import {
  presentationWorldStateAt,
  universePresentationById,
} from '../src/render/presentation-registry'
import { TIDEFALL_PRESENTATION } from '../src/render/tidefall/presentation'

test('both F2 worlds satisfy the lead-owned presentation contract exactly', () => {
  assert.deepEqual(validateUniversePresentation(EMBERLIGHT_V2, EMBERLIGHT_PRESENTATION), [])
  assert.deepEqual(validateUniversePresentation(TIDEFALL_V2_PACK, TIDEFALL_PRESENTATION), [])
  assert.equal(universePresentationById('emberlight'), EMBERLIGHT_PRESENTATION)
  assert.equal(universePresentationById('tidefall'), TIDEFALL_PRESENTATION)
  assert.equal(universePresentationById('verdance'), null)
})

test('resolved manifest states map directly to frozen presentation keys', () => {
  assert.equal(objectPresentationStateKey({ source: 'base', ownershipThreshold: null }), 'base')
  assert.equal(objectPresentationStateKey({ source: 'ownership', ownershipThreshold: 50 }), '50')
  assert.equal(objectPresentationStateKey({ source: 'reduced-motion', ownershipThreshold: 100 }), 'reduced-motion')
  assert.equal(objectPresentationStateKey({ source: 'low-quality', ownershipThreshold: 100 }), 'low-quality')
})

test('Tidefall world-state selection is explicit and periodic', () => {
  assert.equal(presentationWorldStateAt('emberlight', 0), null)
  assert.equal(presentationWorldStateAt('tidefall', 0)?.key, 'rising')
  assert.equal(presentationWorldStateAt('tidefall', 22_500)?.key, 'high')
  assert.equal(presentationWorldStateAt('tidefall', 45_000)?.key, 'falling')
  assert.equal(presentationWorldStateAt('tidefall', 67_500)?.key, 'low')
  assert.equal(presentationWorldStateAt('tidefall', 90_000)?.key, 'rising')
})
