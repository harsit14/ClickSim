import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'

const panelUrl = new URL('../src/ui/UniverseLawPanel.svelte', import.meta.url)
const panelSource = readFileSync(panelUrl, 'utf8')
const worldSource = readFileSync(new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url), 'utf8')

test('the three future-universe law interfaces compile accessibly with distinct identities', () => {
  const compiled = compile(panelSource, {
    filename: panelUrl.pathname,
    generate: 'client',
  })

  assert.deepEqual(compiled.warnings, [])
  assert.match(panelSource, /aria-label="Prismata refraction chamber"/)
  assert.match(panelSource, /aria-label="Tempest storm field"/)
  assert.match(panelSource, /aria-label="Canticle resonance score"/)
})

test('Prismata, Tempest, and Canticle use different spatial interaction grammars', () => {
  assert.match(panelSource, /class="optics-stage"[\s\S]*class="prism-core"[\s\S]*class="spectral-rays"/)
  assert.match(panelSource, /class="storm-layout"[\s\S]*class="anvil-cloud"[\s\S]*class="bolt-network"/)
  assert.match(panelSource, /class="orbital-measure"[\s\S]*class="nodal-figure"[\s\S]*--slot-index:/)
  assert.doesNotMatch(panelSource, /class="choices"/)
})

test('the authored worlds reinforce prism, convective-storm, and nodal-plate silhouettes', () => {
  assert.match(worldSource, /class="prismata-world-prism"/)
  assert.match(worldSource, /class="tempest-anvil"/)
  assert.match(worldSource, /class="canticle-nodal nodal-one"/)
  assert.doesNotMatch(worldSource, /class="prismata-bench"/)
})
