import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'

const panelUrl = new URL('../src/ui/UniverseLawPanel.svelte', import.meta.url)
const panelSource = readFileSync(panelUrl, 'utf8')
const worldSource = readFileSync(new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
const buffUrl = new URL('../src/ui/BuffBar.svelte', import.meta.url)
const buffSource = readFileSync(buffUrl, 'utf8')

test('the three future-universe law interfaces compile accessibly with distinct identities', () => {
  const compiled = compile(panelSource, {
    filename: panelUrl.pathname,
    generate: 'client',
  })

  assert.deepEqual(compiled.warnings, [])
  assert.match(panelSource, /aria-label="Brahmalok creation mandala"/)
  assert.match(panelSource, /aria-label="Tempest storm field"/)
  assert.match(panelSource, /aria-label="Canticle resonance score"/)
  assert.match(panelSource, /aria-label="Verdance grafting bench"/)
})

test('Brahmalok, Tempest, and Canticle use different spatial interaction grammars', () => {
  assert.match(panelSource, /class="creation-stage"[\s\S]*class="lotus-center"[\s\S]*class="creation-directions"/)
  assert.match(panelSource, /class="storm-layout"[\s\S]*class="anvil-cloud"[\s\S]*class="bolt-network"/)
  assert.match(panelSource, /class="orbital-measure"[\s\S]*class="nodal-figure"[\s\S]*--slot-index:/)
  assert.doesNotMatch(panelSource, /class="choices"/)
})

test('Verdance adds a rootstock-to-scion graft instead of borrowing a future-world instrument', () => {
  assert.match(panelSource, /class="graft-route"[\s\S]*Graft rootstock Kindling[\s\S]*Graft scion Kindling/)
  assert.match(panelSource, /configureVerdanceGrafting/)
  assert.match(panelSource, /severVerdanceGrafting/)
})

test('the authored worlds reinforce lotus court, convective-storm, and nodal-plate silhouettes', () => {
  assert.match(worldSource, /class="brahmalok-lotus"/)
  assert.match(worldSource, /class="tempest-anvil"/)
  assert.match(worldSource, /class="canticle-nodal nodal-one"/)
  assert.doesNotMatch(worldSource, /class="prismata-bench"/)
})

test('late-universe score and instrument share one compact surface', () => {
  assert.match(panelSource, /snippet integratedHeader[\s\S]*class="run-score"[\s\S]*class="instrument-title"/)
  assert.match(panelSource, /\.creation-stage \{[^}]*height: 5rem/)
  assert.match(panelSource, /\.storm-layout \{[^}]*height: 4\.6rem/)
  assert.match(panelSource, /\.orbital-measure \{[^}]*width: 7\.5rem/)
  assert.match(panelSource, /@media \(max-width: 800px\)[\s\S]*\.brahmalok-mandala,[\s\S]*\.canticle-score \{ width: 100%/)
  assert.match(appSource, /@media \(max-width: 800px\)[\s\S]*\.top-stack\.future-law \{ width: calc\(100vw - 1rem\); \}/)
  assert.match(appSource, /activePack\.id !== 'prismata'[^}]*activePack\.id !== 'tempest'[^}]*activePack\.id !== 'canticle'[\s\S]*<Hud/)
  assert.match(appSource, /\{#if !utilityPanelOpen\}[\s\S]*<UniverseLawPanel \/>[\s\S]*<UpgradeBar \/>/)
  assert.match(panelSource, /FIRST ARRIVAL/)
  assert.match(panelSource, /Choose how the lotus unfolds/)
  assert.match(panelSource, /Choose a discharge path/)
  assert.match(panelSource, /Choose a measure preset/)
  assert.match(panelSource, /ember:instrument-primer:v1:/)
  assert.match(panelSource, /aria-label="Explain this universe instrument"/)
  assert.match(panelSource, /class="effect-slot"[\s\S]*<BuffBar integrated reserve \/>/)
  assert.match(buffSource, /active\.slice\(0, 1\)/)
  assert.match(buffSource, /class:empty={active\.length === 0}/)
  assert.deepEqual(compile(buffSource, { filename: buffUrl.pathname, generate: 'client' }).warnings, [])
})
