import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import { VERDANCE_V2_PACK } from '../src/content/universes/verdance'
import { createDevScenario } from '../src/core/dev-scenarios'
import { VERDANCE_ARCHIVE_SILHOUETTES } from '../src/render/verdance/archive-silhouettes'
import { planVerdanceGroves } from '../src/render/verdance/world-layer'

test('Verdance grove seats expose real new, rooted, mature, and ancient cohort forms', () => {
  const scenario = createDevScenario('verdance', 10_000)
  assert.ok(scenario)
  const groves = planVerdanceGroves(
    VERDANCE_V2_PACK.visual.objects,
    scenario.owned,
    scenario.numericLawState,
  )

  assert.equal(groves.length, 6)
  assert.deepEqual(groves.slice(0, 4).map(({ stageId }) => stageId), [
    'verdance-cohort-ancient',
    'verdance-cohort-rooted',
    'verdance-cohort-mature',
    'verdance-cohort-ancient',
  ])
  assert.deepEqual(groves.map(({ threshold }) => threshold), [50, 50, 25, 25, 10, 10])
  assert.ok(groves.every(({ xPercent }) => xPercent <= 40 || xPercent >= 61), 'the Heart clearing stays open')
})

test('visible Verdance groves retain the complete no-naked-primitives object card', () => {
  const scenario = createDevScenario('verdance', 10_000)
  assert.ok(scenario)
  const groves = planVerdanceGroves(VERDANCE_V2_PACK.visual.objects, scenario.owned, scenario.numericLawState)
  const objects = new Map(VERDANCE_V2_PACK.visual.objects.map((object) => [object.id, object]))
  for (const grove of groves) {
    const object = objects.get(grove.objectId)
    assert.ok(object)
    assert.ok(object.phenomenon.length > 12)
    assert.ok(object.purpose.length > 12)
    assert.ok(object.material.length >= 2)
    assert.ok(object.silhouette.length > 12)
    assert.ok(object.motion.description.length > 12)
    assert.deepEqual(Object.keys(object.ownershipStates ?? {}), ['1', '10', '25', '50', '100'])
    assert.ok(object.reducedMotionState.silhouette.length > 12)
    assert.ok(object.lowQualityState.silhouette.length > 12)
  }
})

test('Impossible Herbarium landmarks are twelve distinct botanical silhouettes at 32px', () => {
  assert.equal(VERDANCE_ARCHIVE_SILHOUETTES.length, 12)
  assert.equal(new Set(VERDANCE_ARCHIVE_SILHOUETTES.map(({ name }) => name)).size, 12)
  assert.equal(new Set(VERDANCE_ARCHIVE_SILHOUETTES.map(({ primaryPath, accentPath }) => `${primaryPath}|${accentPath}`)).size, 12)
  for (const silhouette of VERDANCE_ARCHIVE_SILHOUETTES) {
    assert.match(silhouette.primaryPath, /^M/)
    assert.match(silhouette.primaryPath, /Z$/)
    assert.match(silhouette.accentPath, /^M/)
  }
})

test('Verdance world and silhouette layers compile and carry root, canopy, cohort, and accessibility contracts', () => {
  const worldUrl = new URL('../src/ui/VerdanceWorldLayer.svelte', import.meta.url)
  const silhouetteUrl = new URL('../src/ui/VerdanceArchiveSilhouette.svelte', import.meta.url)
  const manifestSource = readFileSync(new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url), 'utf8')
  const worldSource = readFileSync(worldUrl, 'utf8')
  const silhouetteSource = readFileSync(silhouetteUrl, 'utf8')

  assert.deepEqual(compile(worldSource, { filename: worldUrl.pathname, generate: 'client' }).warnings, [])
  assert.deepEqual(compile(silhouetteSource, { filename: silhouetteUrl.pathname, generate: 'client' }).warnings, [])
  assert.match(worldSource, /class="canopy-network"/)
  assert.match(worldSource, /class="root-network"/)
  assert.match(worldSource, /data-cohort-stage=\{grove\.stageId\}/)
  assert.match(worldSource, /data-ownership-threshold=\{grove\.threshold\}/)
  assert.match(worldSource, /verdance-cohort-new[\s\S]*verdance-cohort-rooted[\s\S]*verdance-cohort-mature[\s\S]*verdance-cohort-ancient/)
  assert.match(worldSource, /motion-paused/)
  assert.match(manifestSource, /<VerdanceArchiveSilhouette index=/)
  assert.match(manifestSource, /<VerdanceWorldLayer/)
})
