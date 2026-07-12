import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import { V2_UNIVERSE_BY_ID } from '../src/content/universes'
import {
  CANTICLE_ARCHIVE_MARKS,
  PRISMATA_ARCHIVE_MARKS,
  TEMPEST_ARCHIVE_MARKS,
  VERDANCE_ARCHIVE_MARKS,
} from '../src/render/chamber-archive-marks'
import { VERDANCE_ARCHIVE_SILHOUETTES } from '../src/render/verdance/archive-silhouettes'

const componentUrl = new URL('../src/ui/ChamberLandmarkSilhouette.svelte', import.meta.url)
const componentSource = readFileSync(componentUrl, 'utf8')
const worldSource = readFileSync(new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url), 'utf8')

test('four chamber worlds expose 48 raw world-material silhouettes without badge plates', () => {
  assert.deepEqual(compile(componentSource, { filename: componentUrl.pathname, generate: 'client' }).warnings, [])
  assert.match(componentSource, /class="material-body"/)
  assert.match(componentSource, /class="object-form"/)
  assert.match(componentSource, /class="object-accent"/)
  assert.doesNotMatch(componentSource, /chamber-frame|framePath|border-radius:\s*50%/)
  assert.match(componentSource, /\.silhouette \.object-form \{ stroke:#000;stroke-width:3\.4/)
  assert.match(worldSource, /class:world-material=/)
  assert.match(worldSource, /class="landmark-name">\{record\.name\}/)
  assert.match(worldSource, /\.verdance \.archive-landmark,[\s\S]*width:4\.1rem;height:4\.1rem/)
  assert.match(worldSource, /aria-label=\{`\$\{landmark\.accessibleDescription\}\. Open \$\{pack\.archive\.localName\}\.\`\}/)
  const harness = readFileSync(new URL('../src/ui/SilhouetteHarness.svelte', import.meta.url), 'utf8')
  assert.match(harness, /chamber-archives/)
  assert.match(harness, /All chamber Archive silhouettes at 32 pixels/)
  assert.match(harness, /CHAMBER_ARCHIVE_MARKS/)
})

test('every retired badge retains a distinct 32px object form', () => {
  for (const marks of [PRISMATA_ARCHIVE_MARKS, TEMPEST_ARCHIVE_MARKS, CANTICLE_ARCHIVE_MARKS]) {
    assert.equal(marks.length, 12)
    assert.equal(new Set(marks.map(({ diagramPath, accentPath }) => `${diagramPath}|${accentPath}`)).size, 12)
    assert.ok(marks.every(({ diagramPath, accentPath }) => diagramPath.startsWith('M') && accentPath.startsWith('M')))
  }
  assert.equal(VERDANCE_ARCHIVE_SILHOUETTES.length, 12)
  assert.equal(new Set(VERDANCE_ARCHIVE_SILHOUETTES.map(({ primaryPath }) => primaryPath)).size, 12)
})

test('all 48 chamber Archive objects pass the complete no-naked-primitives card', () => {
  for (const universeId of ['verdance', 'prismata', 'tempest', 'canticle'] as const) {
    const pack = V2_UNIVERSE_BY_ID.get(universeId)
    assert.ok(pack)
    const archiveObjects = pack.visual.objects.filter(({ sourceKind }) => sourceKind === 'archive')
    assert.equal(archiveObjects.length, 12)
    for (const object of archiveObjects) {
      assert.ok(object.phenomenon.length > 12, `${object.id}: phenomenon`)
      assert.ok(object.purpose.length > 12, `${object.id}: purpose`)
      assert.ok(object.screenZone, `${object.id}: zone`)
      assert.ok(object.material.length >= 2, `${object.id}: material`)
      assert.ok(object.silhouette.length > 12, `${object.id}: silhouette`)
      assert.ok(object.motion.description.length > 12, `${object.id}: idle`)
      assert.ok(object.audioCue, `${object.id}: sound`)
      assert.ok(object.loreRecord, `${object.id}: lore`)
      assert.ok(object.reducedMotionState.silhouette.length > 12, `${object.id}: reduced motion`)
      assert.ok(object.lowQualityState.silhouette.length > 12, `${object.id}: low quality`)
    }
  }
})
