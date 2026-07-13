import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { KAILASH_V2_PACK } from '../src/content/universes/kailash'
import { kailashOwnershipThreshold, planKailashFormations } from '../src/render/kailash/world-layer'

test('Kailash landforms change structure at the shared ownership thresholds', () => {
  assert.deepEqual([0, 1, 9, 10, 24, 25, 49, 50, 99, 100].map(kailashOwnershipThreshold), [0, 1, 1, 10, 10, 25, 25, 50, 50, 100])
})

test('Kailash endgame uses six capped three-Kindling landforms outside the Heart clearing', () => {
  const owned = Object.fromEntries(KAILASH_V2_PACK.visual.objects
    .filter(({ sourceKind }) => sourceKind === 'generator')
    .map(({ sourceId }) => [sourceId, 125]))
  const high = planKailashFormations(KAILASH_V2_PACK.visual.objects, owned, 'high')
  const low = planKailashFormations(KAILASH_V2_PACK.visual.objects, owned, 'low')
  assert.equal(high.length, 6)
  assert.equal(low.length, 4)
  assert.deepEqual(low.map(({ kind }) => kind), ['snowfield', 'river', 'open-pass', 'horizon'])
  assert.ok(high.every(({ sourceIds, threshold }) => sourceIds.length === 3 && threshold === 100))
  assert.ok(high.every(({ xPercent }) => xPercent < 44 || xPercent > 56))
  assert.equal(new Set(high.map(({ kind }) => kind)).size, 6)
  assert.equal(new Set(high.map(({ basePath }) => basePath)).size, 6)
})

test('Kailash preserves the visible Heart above an apertured summit', () => {
  const vista = readFileSync(new URL('../src/ui/ChamberVistaLayer.svelte', import.meta.url), 'utf8')
  const world = readFileSync(new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url), 'utf8')
  assert.match(vista, /summit-range[^}]*heart-aperture[^}]*radial-gradient\(circle var\(--heart-aperture\) at 50% 54\.5%/)
  assert.match(vista, /summit-rest[^}]*background:transparent[^}]*box-shadow:none/)
  assert.match(world, /\.kailash \.heart-frame \{/)
  assert.match(world, /<KailashWorldLayer/)
})

test('Kailash ownership forms retain reduced-motion and low-quality fallbacks', () => {
  const layer = readFileSync(new URL('../src/ui/KailashWorldLayer.svelte', import.meta.url), 'utf8')
  assert.match(layer, /class:motion-paused=\{reducedMotion\}/)
  assert.match(layer, /class:low-quality=\{quality === 'low'\}/)
  assert.match(layer, /\.motion-paused \.formation-art \{ animation:none; \}/)
  assert.match(layer, /data-ownership-threshold=\{formation\.threshold\}/)
})
