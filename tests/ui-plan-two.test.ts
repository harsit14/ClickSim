import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('phase one exposes plain labels, contextual trial actions, and readable ceremony chrome', () => {
  const app = read('../src/App.svelte')
  const banner = read('../src/ui/ChallengeBanner.svelte')
  const deep = read('../src/ui/TheDeep.svelte')
  const vault = read('../src/ui/LumenVaultShelf.svelte')
  const crossing = read('../src/ui/CrossingPrelude.svelte')
  const revelation = read('../src/ui/ClockworkRevelation.svelte')

  for (const label of ['Guide', 'Records', 'Options', 'Cabinet', 'Vessel', 'Epoch reset', 'Deep reset', 'Story', 'Legacy']) {
    assert.match(app, new RegExp(`>${label}<`))
  }
  assert.match(app, /activePack\.id === 'prismata' \? '✤' : epochMatterGlyph/)
  assert.match(banner, /<strong>Rule:<\/strong>/)
  assert.match(banner, /<b>Goal:<\/b>/)
  assert.match(banner, /aria-label=\{`Abandon \$\{copy\?\.name/)
  assert.match(deep, /aria-label=\{`Begin \$\{copy\.name\}/)
  assert.match(vault, /Unlock \$\{item\.name\} for \$\{item\.cost\} Lumen Shards/)
  assert.match(crossing, /\.phase-rail small \{[^}]*0\.6875rem/)
  assert.match(revelation, /\.caption small \{[^}]*\.6875rem/)
})

test('phase one Garden questions are persistently readable and keyboard-selectable', () => {
  const garden = read('../src/ui/GardenScene.svelte')
  assert.match(garden, /class="presence-reading"/)
  assert.match(garden, /class="presence-reader"/)
  assert.match(garden, /onfocus=\{\(\) => \(selectedUniverseId = node\.universeId\)\}/)
  assert.match(garden, /\.relation-names span \{[^}]*\.6875rem/)
  assert.match(garden, /figcaption small \{[^}]*\.6875rem/)
  assert.deepEqual(compile(garden, { filename: 'GardenScene.svelte', generate: 'client' }).warnings, [])
})
