import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'
import {
  DEEP_LOW_PASS_HZ,
  OPEN_LOW_PASS_HZ,
  depthLowPassFrequency,
} from '../src/audio/sfx'

function read(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8')
}

test('affordable purchase controls expose emphasis and tactile press states', () => {
  const shop = read('../src/ui/ShopPanel.svelte')
  const upgrades = read('../src/ui/UpgradeBar.svelte')
  const chips = read('../src/ui/UiChips.svelte')
  assert.match(shop, /class:affordable=/)
  assert.match(shop, /\.row\.affordable::after/)
  assert.match(shop, /:active[\s\S]*translateY\(1px\) scale\(0\.985\)/)
  assert.match(upgrades, /class:affordable=/)
  assert.match(upgrades, /\.up\.affordable::after/)
  assert.match(upgrades, /:active[\s\S]*translateY\(2px\) scale\(0\.96\)/)
  assert.match(chips, /class:affordable=/)
})

test('landmarks reveal bounded interior marks without changing their silhouette box', () => {
  const world = read('../src/ui/ManifestWorldLayer.svelte')
  assert.match(world, /<span class="landmark-interior"><i><\/i><i><\/i><i><\/i><\/span>/)
  assert.match(world, /\.archive-landmark:hover \.landmark-interior/)
  assert.match(world, /\.low-quality \.landmark-interior \{ display: none; \}/)
  assert.match(world, /\.motion-paused \.landmark-interior \{ transition: none;/)
})

test('Deep applies one restrained reversible low-pass to music and effects', () => {
  assert.equal(depthLowPassFrequency(true), DEEP_LOW_PASS_HZ)
  assert.equal(depthLowPassFrequency(false), OPEN_LOW_PASS_HZ)
  assert.ok(DEEP_LOW_PASS_HZ >= 2_500 && DEEP_LOW_PASS_HZ <= 5_000)
  const sfx = read('../src/audio/sfx.ts')
  const music = read('../src/audio/music.ts')
  const deep = read('../src/ui/TheDeep.svelte')
  assert.match(sfx, /output\.type = 'lowpass'/)
  assert.match(sfx, /exponentialRampToValueAtTime\(depthLowPassFrequency\(active\)/)
  assert.match(music, /musicGain\.connect\(a\.output\)/)
  assert.match(deep, /setDepthLowPass\(true\)[\s\S]*return \(\) => setDepthLowPass\(false\)/)
})

test('polished interaction surfaces compile without accessibility warnings', () => {
  for (const path of ['../src/ui/ShopPanel.svelte', '../src/ui/UpgradeBar.svelte', '../src/ui/UiChips.svelte', '../src/ui/ManifestWorldLayer.svelte', '../src/ui/TheDeep.svelte']) {
    const source = read(path)
    assert.deepEqual(compile(source, { filename: path, generate: 'client' }).warnings, [], path)
  }
})
