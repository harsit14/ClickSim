import assert from 'node:assert/strict'
import test from 'node:test'
import { EMBERLIGHT_V2 } from '../src/content/universes/emberlight-v2'
import { planManifestLayout } from '../src/render/manifest-layout'
import {
  EMBERLIGHT_PRESENTATION,
  type EmberlightObjectStateKey,
} from '../src/render/emberlight/presentation'

const STATE_KEYS: readonly EmberlightObjectStateKey[] = [
  'base',
  '1',
  '10',
  '25',
  '50',
  '100',
  'reduced-motion',
  'low-quality',
]

const NAKED_PRIMITIVE = /^(?:a |an )?(?:circle|cone|sphere|cylinder|line|ellipse|polygon|ribbon|arc|branch|frame|cloud)$/i

test('all eighteen Kindlings keep stable IDs and five authored ownership forms', () => {
  const kindlings = EMBERLIGHT_V2.visual.objects.filter(({ sourceKind }) => sourceKind === 'generator')
  assert.equal(kindlings.length, 18)
  assert.deepEqual(
    kindlings.map(({ sourceId }) => sourceId),
    EMBERLIGHT_V2.economy.generators.map(({ id }) => id),
  )

  for (const object of kindlings) {
    assert.equal(NAKED_PRIMITIVE.test(object.silhouette.trim()), false, object.id)
    assert.ok(object.silhouette.trim().split(/\s+/).length >= 5, object.id)
    const ownership = object.ownershipStates!
    assert.deepEqual(Object.keys(ownership), ['1', '10', '25', '50', '100'])
    assert.equal(new Set(Object.values(ownership).map(({ silhouette }) => silhouette)).size, 5, object.id)
    assert.equal(ownership[1].countPresentation, 'single')
    assert.equal(ownership[10].countPresentation, 'group')
    assert.equal(ownership[25].countPresentation, 'group')
    assert.equal(ownership[50].countPresentation, 'infrastructure')
    assert.equal(ownership[100].countPresentation, 'infrastructure')
  }
})

test('Emberlight presentation explicitly covers Heart, every object, and every fallback state', () => {
  assert.equal(EMBERLIGHT_PRESENTATION.universeId, 'emberlight')
  assert.deepEqual(Object.keys(EMBERLIGHT_PRESENTATION.palette), [
    'primary', 'secondary', 'highlight', 'shadow', 'void',
  ])
  assert.ok(Object.values(EMBERLIGHT_PRESENTATION.palette).every((color) => /^#[0-9a-f]{6}$/i.test(color)))
  assert.equal(EMBERLIGHT_PRESENTATION.heart.id, EMBERLIGHT_V2.heart.id)
  assert.deepEqual(Object.keys(EMBERLIGHT_PRESENTATION.heart.states), [
    'base', 'reduced-motion', 'low-quality',
  ])

  const manifestIds = EMBERLIGHT_V2.visual.objects.map(({ id }) => id).sort()
  assert.deepEqual(Object.keys(EMBERLIGHT_PRESENTATION.objects).sort(), manifestIds)

  for (const manifest of EMBERLIGHT_V2.visual.objects) {
    const descriptor = EMBERLIGHT_PRESENTATION.objects[manifest.id]
    assert.equal(descriptor.id, manifest.id)
    assert.ok(descriptor.occlusion.trim())
    assert.deepEqual(Object.keys(descriptor.states).sort(), [...STATE_KEYS].sort())
    for (const state of Object.values(descriptor.states)) {
      assert.equal(NAKED_PRIMITIVE.test(state.geometryLabel.trim()), false, `${manifest.id}/${state.geometryLabel}`)
      assert.ok(state.pattern.trim(), manifest.id)
      assert.ok(state.layers.length >= 2, manifest.id)
      for (const layer of state.layers) {
        assert.ok(layer.insetPercent >= 0)
        assert.ok(layer.scaleX > 0 && layer.scaleY > 0)
        assert.ok(layer.opacity >= 0 && layer.opacity <= 1)
      }
    }
  }
})

test('late ownership states are concrete districts and infrastructure, not repeated copies', () => {
  const kindlings = EMBERLIGHT_V2.visual.objects.filter(({ sourceKind }) => sourceKind === 'generator')
  for (const manifest of kindlings) {
    const descriptor = EMBERLIGHT_PRESENTATION.objects[manifest.id]
    for (const threshold of ['50', '100'] as const) {
      const state = descriptor.states[threshold]
      assert.ok(state.layers.some(({ primitive }) => primitive === 'frame'), `${manifest.id}/${threshold}`)
      assert.ok(state.layers.some(({ primitive }) => primitive === 'branch'), `${manifest.id}/${threshold}`)
      assert.ok(state.layers.length > descriptor.states['1'].layers.length, `${manifest.id}/${threshold}`)
    }
  }
})

test('desktop density rules replace crowded tiers with three authored landmarks', () => {
  assert.equal(EMBERLIGHT_V2.visual.densityMerges.length, 3)
  const resultIds = new Set(EMBERLIGHT_V2.visual.densityMerges.map(({ resultObjectId }) => resultObjectId))
  const visibleObjectIds = EMBERLIGHT_V2.visual.densityMerges
    .flatMap(({ sourceIds }) => sourceIds)
  const objectCountsById = Object.fromEntries(
    EMBERLIGHT_V2.visual.densityMerges.flatMap(({ sourceIds }) => sourceIds.map((id) => [id, 25])),
  )
  const plan = planManifestLayout({
    visual: EMBERLIGHT_V2.visual,
    heart: EMBERLIGHT_V2.heart,
    viewport: { width: 1280, height: 720 },
    state: {
      visibleObjectIds,
      ownershipBySourceId: Object.fromEntries(
        EMBERLIGHT_V2.economy.generators.map(({ id }) => [id, 100]),
      ),
      objectCountsById,
    },
    preferences: { reducedMotion: false, quality: 'high', minimal: false, panelOpen: false },
  })
  const plannedIds = new Set(plan.objects.map(({ objectId }) => objectId))
  assert.ok([...resultIds].every((id) => plannedIds.has(id)))
  for (const rule of EMBERLIGHT_V2.visual.densityMerges) {
    assert.match(rule.description, /Kindling|stellar|cosmic|glimmer/i)
    assert.ok(rule.sourceIds.every((id) => plan.hidden.some((entry) => (
      entry.objectId === id && entry.reason === 'density-merged'
    ))))
  }
  assert.deepEqual(plan.diagnostics, [])
})
