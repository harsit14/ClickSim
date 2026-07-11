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
  assert.match(panelSource, /aria-label="Vishnulok Endless Circuit"/)
  assert.match(panelSource, /aria-label="Kailash Still Point cycle"/)
  assert.match(panelSource, /aria-label="Verdance grafting bench"/)
})

test('Brahmalok, Vishnulok, and Kailash use different spatial interaction grammars', () => {
  assert.match(panelSource, /class="creation-stage"[\s\S]*class="lotus-center"[\s\S]*class="creation-directions"/)
  assert.match(panelSource, /class="ocean-layout"[\s\S]*class="refuge-center"[\s\S]*class="current-network"/)
  assert.match(panelSource, /class="mountain-cycle"[\s\S]*class="late-ring"[\s\S]*class="cycle-sequence"/)
  assert.doesNotMatch(panelSource, /class="choices"/)
})

test('Verdance adds a rootstock-to-scion graft instead of borrowing a future-world instrument', () => {
  assert.match(panelSource, /class="graft-route"[\s\S]*Graft rootstock Kindling[\s\S]*Graft scion Kindling/)
  assert.match(panelSource, /configureVerdanceGrafting/)
  assert.match(panelSource, /severVerdanceGrafting/)
})

test('the authored worlds reinforce lotus court, sustaining ocean, and mountain silhouettes', () => {
  assert.match(worldSource, /class="brahmalok-lotus"/)
  assert.match(worldSource, /class="vishnulok-horizon"/)
  assert.match(worldSource, /class="kailash-range range-near"/)
  assert.doesNotMatch(worldSource, /class="prismata-bench"/)
})

test('loka law state is legible in the world without opening its instrument', () => {
  assert.match(worldSource, /brahmalokStatus\(numericLawState, owned\)/)
  assert.match(worldSource, /tempestStatus\(numericLawState\)/)
  assert.match(worldSource, /canticleStatus\(numericLawState, owned, now\)/)
  assert.match(worldSource, /data-brahmalok-directions=/)
  assert.match(worldSource, /class:active=\{index < Math\.ceil\(\(vishnulokWorldState\?\.length/)
  assert.match(worldSource, /class="vishnulok-continuity"/)
  assert.match(worldSource, /class="kailash-cycle-marker"/)
  assert.match(worldSource, /data-kailash-act=/)
  assert.match(worldSource, /Brahmalok world state:/)
  assert.match(worldSource, /Vishnulok world state:/)
  assert.match(worldSource, /Kailash world state:/)
})

test('late-universe score and instrument share one compact surface', () => {
  assert.match(panelSource, /snippet integratedHeader[\s\S]*class="run-score"[\s\S]*class="instrument-title"/)
  assert.match(panelSource, /CONTINUOUS CREATION/)
  assert.match(panelSource, /TEMPORARY RETURN/)
  assert.match(panelSource, /GATHERING BASELINE/)
  assert.match(panelSource, /CONTINUOUS CYCLE/)
  assert.match(panelSource, /continuity rests during return/)
  assert.match(panelSource, /\.creation-stage \{[^}]*height: 5rem/)
  assert.match(panelSource, /\.ocean-layout \{[^}]*height: 4\.6rem/)
  assert.match(panelSource, /\.mountain-cycle \{[^}]*height:7\.2rem/)
  assert.match(panelSource, /@media \(max-width: 800px\)[\s\S]*\.brahmalok-mandala,[\s\S]*\.kailash-stillpoint \{ width: 100%/)
  assert.match(appSource, /@media \(max-width: 800px\)[\s\S]*\.top-stack\.future-law \{ width: calc\(100vw - 1rem\); \}/)
  assert.match(appSource, /activePack\.id !== 'prismata'[^}]*activePack\.id !== 'tempest'[^}]*activePack\.id !== 'canticle'[\s\S]*<Hud/)
  assert.match(appSource, /\{#if !utilityPanelOpen\}[\s\S]*<UniverseLawPanel \/>[\s\S]*<UpgradeBar \/>/)
  assert.match(panelSource, /FIRST ARRIVAL/)
  assert.match(panelSource, /Choose how the lotus unfolds/)
  assert.match(panelSource, /Choose a correction circuit/)
  assert.match(panelSource, /Choose a mountain cycle/)
  assert.match(panelSource, /ember:instrument-primer:v1:/)
  assert.match(panelSource, /aria-label="Explain this universe instrument"/)
  assert.match(panelSource, /aria-label=\{instrumentExpanded \? 'Collapse universe instrument' : 'Open universe instrument'\}/)
  assert.match(panelSource, /class:instrument-compact=\{!instrumentExpanded\}/)
  assert.match(panelSource, /ember:instrument-layout:v1:/)
  assert.match(panelSource, /ember:instrument-experience:v1:/)
  assert.match(panelSource, /markInstrumentExperienced\(\)/)
  assert.match(panelSource, /\.instrument-compact \{[^}]*width: min\(38rem/)
  assert.match(panelSource, /class="effect-slot"[\s\S]*<BuffBar integrated reserve \/>/)
  assert.match(buffSource, /active\.slice\(0, 1\)/)
  assert.match(buffSource, /class:empty={active\.length === 0}/)
  assert.deepEqual(compile(buffSource, { filename: buffUrl.pathname, generate: 'client' }).warnings, [])
})
