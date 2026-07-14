import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'
import {
  ARCHIVE_LOW_PASS_HZ,
  AUDIO_SPACE_PROFILES,
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

test('Archive and Deep apply restrained reversible depth to music and effects', () => {
  assert.equal(depthLowPassFrequency(true), DEEP_LOW_PASS_HZ)
  assert.equal(depthLowPassFrequency(false), OPEN_LOW_PASS_HZ)
  assert.ok(DEEP_LOW_PASS_HZ >= 2_500 && DEEP_LOW_PASS_HZ <= 5_000)
  assert.ok(ARCHIVE_LOW_PASS_HZ > DEEP_LOW_PASS_HZ)
  assert.ok(ARCHIVE_LOW_PASS_HZ < OPEN_LOW_PASS_HZ)
  assert.ok(AUDIO_SPACE_PROFILES.deep.reverbWet > AUDIO_SPACE_PROFILES.archive.reverbWet)
  assert.ok(AUDIO_SPACE_PROFILES.archive.reverbWet > AUDIO_SPACE_PROFILES.world.reverbWet)
  const sfx = read('../src/audio/sfx.ts')
  const music = read('../src/audio/music.ts')
  const app = read('../src/App.svelte')
  assert.match(sfx, /output\.type = 'lowpass'/)
  assert.match(sfx, /createConvolver\(\)/)
  assert.match(sfx, /exponentialRampToValueAtTime\(profile\.lowPassHz/)
  assert.match(music, /musicGain\.connect\(a\.output\)/)
  assert.match(app, /setAudioSpace\([\s\S]*shell\.panels\.deep[\s\S]*'archive'[\s\S]*'world'/)
})

test('polished interaction surfaces compile without accessibility warnings', () => {
  for (const path of ['../src/ui/ShopPanel.svelte', '../src/ui/UpgradeBar.svelte', '../src/ui/UiChips.svelte', '../src/ui/ManifestWorldLayer.svelte', '../src/ui/TheDeep.svelte']) {
    const source = read(path)
    assert.deepEqual(compile(source, { filename: path, generate: 'client' }).warnings, [], path)
  }
})
