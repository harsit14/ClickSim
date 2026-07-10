import assert from 'node:assert/strict'
import test from 'node:test'
import { CLOCKWORK_V2_PACK } from '../src/content/universes/clockwork/index'
import { auditManifestRenderPlan, planManifestLayout } from '../src/render/manifest-layout'

test('all eighteen Clockwork Kindlings own five distinct structural states', () => {
  const objects = CLOCKWORK_V2_PACK.visual.objects.filter(({ sourceKind }) => sourceKind === 'generator')
  assert.equal(objects.length, 18)
  for (const object of objects) {
    assert.deepEqual(Object.keys(object.ownershipStates ?? {}), ['1', '10', '25', '50', '100'])
    assert.equal(new Set(Object.values(object.ownershipStates ?? {}).map(({ silhouette }) => silhouette)).size, 5, object.id)
    assert.notEqual(object.reducedMotionState.silhouette.trim(), '')
    assert.notEqual(object.lowQualityState.silhouette.trim(), '')
  }
})

test('Clockwork visual manifest contains every generator, patent, signal, and Beacon once', () => {
  assert.equal(CLOCKWORK_V2_PACK.visual.objects.length, 35)
  assert.equal(CLOCKWORK_V2_PACK.visual.objects.filter(({ sourceKind }) => sourceKind === 'generator').length, 18)
  assert.equal(CLOCKWORK_V2_PACK.visual.objects.filter(({ sourceKind }) => sourceKind === 'archive').length, 12)
  assert.equal(CLOCKWORK_V2_PACK.visual.objects.filter(({ sourceKind }) => sourceKind === 'omen').length, 4)
  assert.equal(CLOCKWORK_V2_PACK.visual.objects.filter(({ sourceKind }) => sourceKind === 'beacon').length, 1)
  assert.equal(new Set(CLOCKWORK_V2_PACK.visual.objects.map(({ id }) => id)).size, 35)
  assert.equal(CLOCKWORK_V2_PACK.visual.densityMerges.length, 4)
})

test('real Clockwork manifests remain clean on desktop across ownership and fallbacks', () => {
  const visibleObjectIds = CLOCKWORK_V2_PACK.visual.objects.map(({ id }) => id)
  for (const count of [1, 10, 25, 50, 100]) {
    const ownershipBySourceId = Object.fromEntries(
      CLOCKWORK_V2_PACK.economy.generators.map(({ id }) => [id, count]),
    )
    for (const preferences of [
      { reducedMotion: false, quality: 'high' as const, minimal: false, panelOpen: false },
      { reducedMotion: true, quality: 'balanced' as const, minimal: false, panelOpen: true },
      { reducedMotion: false, quality: 'low' as const, minimal: true, panelOpen: false },
    ]) {
      const plan = planManifestLayout({
        visual: CLOCKWORK_V2_PACK.visual,
        heart: CLOCKWORK_V2_PACK.heart,
        viewport: { width: 1280, height: 720 },
        state: { visibleObjectIds, ownershipBySourceId },
        preferences,
      })
      assert.deepEqual(plan.diagnostics, [])
      assert.deepEqual(auditManifestRenderPlan(plan), [])
      assert.ok(plan.objects.length > 0)
      assert.equal(plan.heart.focusLabel, 'Escapement Heart, Heart of Clockwork; route Ticks')
    }
  }
})
