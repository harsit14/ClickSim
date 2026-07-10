import assert from 'node:assert/strict'
import test from 'node:test'
import { TIDEFALL_V2_PACK } from '../src/content/universes/tidefall-v2'
import { TIDEFALL_PRESENTATION } from '../src/render/tidefall/presentation'

const OBJECT_STATE_KEYS = ['base', '1', '10', '25', '50', '100', 'reduced-motion', 'low-quality']
const HEART_STATE_KEYS = ['base', 'reduced-motion', 'low-quality']
const PRIMITIVES = new Set(['ellipse', 'polygon', 'ribbon', 'arc', 'branch', 'frame', 'cloud'])
const FILLS = new Set(['primary', 'secondary', 'highlight', 'shadow', 'void'])

test('presentation registry covers every Tidefall V2 manifest ID exactly and explicitly', () => {
  const manifestIds = TIDEFALL_V2_PACK.visual.objects.map(({ id }) => id).sort()
  const presentationIds = Object.keys(TIDEFALL_PRESENTATION.objects).sort()
  assert.deepEqual(presentationIds, manifestIds)
  assert.equal(presentationIds.length, 36)
  for (const [key, descriptor] of Object.entries(TIDEFALL_PRESENTATION.objects)) {
    assert.equal(descriptor.id, key)
    assert.ok(['back', 'middle', 'front'].includes(descriptor.depth))
    assert.notEqual(descriptor.occlusion.trim(), '')
    assert.deepEqual(Object.keys(descriptor.states).sort(), [...OBJECT_STATE_KEYS].sort(), key)
  }
})

test('Heart and tide states use their exact compatibility keys without inferred fallbacks', () => {
  assert.equal(TIDEFALL_PRESENTATION.heart.id, TIDEFALL_V2_PACK.heart.id)
  assert.deepEqual(Object.keys(TIDEFALL_PRESENTATION.heart.states), HEART_STATE_KEYS)
  assert.deepEqual(Object.keys(TIDEFALL_PRESENTATION.worldStates), ['rising', 'high', 'falling', 'low'])
  assert.deepEqual(
    Object.values(TIDEFALL_PRESENTATION.worldStates).map(({ id }) => id),
    ['tide-rising', 'tide-high', 'tide-falling', 'tide-low'],
  )
})

test('all presentation states are structural primitives with bounded explicit layers', () => {
  const objectStates = Object.values(TIDEFALL_PRESENTATION.objects).flatMap(({ states }) => Object.values(states))
  const heartStates = Object.values(TIDEFALL_PRESENTATION.heart.states)
  const worldStates = Object.values(TIDEFALL_PRESENTATION.worldStates)
  for (const state of [...objectStates, ...heartStates, ...worldStates]) {
    assert.notEqual(state.geometryLabel.trim(), '')
    assert.notEqual(state.pattern.trim(), '')
    assert.ok(state.layers.length > 0)
    for (const layer of state.layers) {
      assert.notEqual(layer.id.trim(), '')
      assert.equal(PRIMITIVES.has(layer.primitive), true, layer.id)
      assert.equal(FILLS.has(layer.fill), true, layer.id)
      assert.ok(Number.isFinite(layer.insetPercent) && layer.insetPercent >= 0 && layer.insetPercent <= 100, layer.id)
      assert.ok(Number.isFinite(layer.scaleX) && layer.scaleX > 0, layer.id)
      assert.ok(Number.isFinite(layer.scaleY) && layer.scaleY > 0, layer.id)
      assert.ok(Number.isFinite(layer.rotationDegrees), layer.id)
      assert.ok(Number.isFinite(layer.opacity) && layer.opacity >= 0 && layer.opacity <= 1, layer.id)
    }
  }
})

test('Kindling presentation ownership labels preserve all five authored manifest silhouettes', () => {
  for (const object of TIDEFALL_V2_PACK.visual.objects.filter(({ sourceKind }) => sourceKind === 'generator')) {
    const presentation = TIDEFALL_PRESENTATION.objects[object.id as keyof typeof TIDEFALL_PRESENTATION.objects]
    assert.ok(presentation, object.id)
    for (const threshold of ['1', '10', '25', '50', '100'] as const) {
      assert.equal(
        presentation.states[threshold].geometryLabel,
        object.ownershipStates?.[Number(threshold) as 1 | 10 | 25 | 50 | 100].silhouette,
        `${object.id}:${threshold}`,
      )
    }
    assert.equal(presentation.states['reduced-motion'].geometryLabel, object.reducedMotionState.silhouette)
    assert.equal(presentation.states['low-quality'].geometryLabel, object.lowQualityState.silhouette)
  }
})
