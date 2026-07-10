import assert from 'node:assert/strict'
import test from 'node:test'
import { validateUniverseAudioDef } from '../src/audio/semantic-contract'
import { EMBERLIGHT } from '../src/content/universes/emberlight'
import {
  EMBERLIGHT_V2,
  EMBERLIGHT_V2_SUPPLEMENT,
} from '../src/content/universes/emberlight-v2'
import { adaptLegacyUniversePack } from '../src/content/universes/legacy-v2-adapter'
import type { UniversePackV2Supplement } from '../src/content/universes/legacy-v2-adapter'
import { universeV2ById, V2_UNIVERSE_BY_ID } from '../src/content/universes'
import { planManifestLayout } from '../src/render/manifest-layout'
import { validateUniversePackV2 } from '../src/render/manifest-validator'

test('Emberlight crosses the temporary bridge as one complete validated V2 pack', () => {
  assert.equal(EMBERLIGHT_V2.id, 'emberlight')
  assert.equal(EMBERLIGHT_V2.economy.generators.length, 18)
  assert.equal(EMBERLIGHT_V2.economy.doctrines.length, 4)
  assert.equal(EMBERLIGHT_V2.omens.length, 4)
  assert.equal(EMBERLIGHT_V2.archive.records.length, 12)
  assert.equal(EMBERLIGHT_V2.archive.shelves.length, 3)
  assert.equal(EMBERLIGHT_V2.visual.objects.length, 35)
  assert.deepEqual(validateUniversePackV2(EMBERLIGHT_V2), { valid: true, issues: [] })
  assert.deepEqual(validateUniverseAudioDef(EMBERLIGHT_V2.audio), [])

  assert.deepEqual(
    EMBERLIGHT_V2.economy.generators.map(({ id }) => id),
    EMBERLIGHT.generators.map(({ id }) => id),
  )
  assert.deepEqual(
    EMBERLIGHT_V2.story.echoes.map(({ id }) => id),
    EMBERLIGHT.echoes.map(({ id }) => id),
  )
})

test('the lead registry exposes only approved V2 packs and never falls back across worlds', () => {
  assert.equal(V2_UNIVERSE_BY_ID.size, 1)
  assert.strictEqual(universeV2ById('emberlight'), EMBERLIGHT_V2)
  assert.equal(universeV2ById('tidefall'), null)
  assert.equal(universeV2ById('unknown'), null)
  assert.equal(universeV2ById(null), null)
})

test('every bridged Kindling has exactly one authored object with five ownership states', () => {
  for (const generator of EMBERLIGHT_V2.economy.generators) {
    const objects = EMBERLIGHT_V2.visual.objects.filter((object) => (
      object.sourceKind === 'generator' && object.sourceId === generator.id
    ))
    assert.equal(objects.length, 1, generator.id)
    assert.deepEqual(Object.keys(objects[0].ownershipStates ?? {}), ['1', '10', '25', '50', '100'])
    assert.notEqual(objects[0].silhouette.trim(), '')
    assert.notEqual(objects[0].purpose.trim(), '')
  }
})

test('the bridge fails closed on identity, referenced content, and accessibility omissions', () => {
  assert.throws(() => adaptLegacyUniversePack(EMBERLIGHT, {
    ...EMBERLIGHT_V2_SUPPLEMENT,
    id: 'tidefall',
  }), /cannot use V2 supplement/)

  const missingObject: UniversePackV2Supplement = {
    ...EMBERLIGHT_V2_SUPPLEMENT,
    visual: {
      ...EMBERLIGHT_V2_SUPPLEMENT.visual,
      objects: EMBERLIGHT_V2_SUPPLEMENT.visual.objects.filter((object) => (
        object.id !== 'ember-kindling-spark'
      )),
    },
  }
  assert.throws(
    () => adaptLegacyUniversePack(EMBERLIGHT, missingObject),
    /Generator "spark" requires exactly one visual object/,
  )

  const missingNonColorSignal: UniversePackV2Supplement = {
    ...EMBERLIGHT_V2_SUPPLEMENT,
    accessibility: {
      ...EMBERLIGHT_V2_SUPPLEMENT.accessibility,
      nonColorSignals: [],
    },
  }
  assert.throws(
    () => adaptLegacyUniversePack(EMBERLIGHT, missingNonColorSignal),
    /requires authored non-color state signals/,
  )
})

test('real Emberlight manifests remain bounded and Heart-clear across gate viewports and fallbacks', () => {
  const visibleObjectIds = EMBERLIGHT_V2.visual.objects.map(({ id }) => id)
  for (const count of [1, 10, 25, 50, 100]) {
    const ownershipBySourceId = Object.fromEntries(
      EMBERLIGHT_V2.economy.generators.map(({ id }) => [id, count]),
    )
    for (const viewport of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
      for (const preferences of [
        { reducedMotion: false, quality: 'high' as const, minimal: false, panelOpen: false },
        { reducedMotion: true, quality: 'balanced' as const, minimal: false, panelOpen: true },
        { reducedMotion: false, quality: 'low' as const, minimal: true, panelOpen: false },
      ]) {
        const plan = planManifestLayout({
          visual: EMBERLIGHT_V2.visual,
          heart: EMBERLIGHT_V2.heart,
          viewport,
          state: { visibleObjectIds, ownershipBySourceId },
          preferences,
        })
        assert.deepEqual(plan.diagnostics, [])
        assert.ok(plan.objects.length > 0)
        assert.equal(plan.heart.focusLabel, EMBERLIGHT_V2.heart.focusLabel)
      }
    }
  }
})
