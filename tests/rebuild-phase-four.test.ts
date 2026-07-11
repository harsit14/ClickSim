import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8')

test('Phase 4 loads local variable Fraunces and Inter with the authored type tokens', () => {
  const main = read('../src/main.ts')
  const css = read('../src/app.css')
  const pkg = JSON.parse(read('../package.json')) as { dependencies?: Record<string, string> }
  assert.match(main, /@fontsource-variable\/inter\/opsz\.css/)
  assert.match(main, /@fontsource-variable\/fraunces\/full\.css/)
  assert.match(main, /@fontsource-variable\/fraunces\/full-italic\.css/)
  assert.ok(pkg.dependencies?.['@fontsource-variable/inter'])
  assert.ok(pkg.dependencies?.['@fontsource-variable/fraunces'])
  assert.match(css, /--font-interface: 'Inter Variable'/)
  assert.match(css, /--font-story: 'Fraunces Variable'/)
  assert.match(css, /font-feature-settings: 'tnum' 1/)
  assert.match(css, /font-variation-settings: 'opsz' 18/)
})

test('the instrument panel token owns glass, blur, hairline, and four bezel corners', () => {
  const css = read('../src/app.css')
  assert.match(css, /--glass: rgba\(10, 8, 18, 0\.82\)/)
  assert.match(css, /--glass-border: rgba\(242, 216, 167, 0\.14\)/)
  assert.match(css, /backdrop-filter: blur\(12px\)/)
  assert.match(css, /background-position: left 3px top 3px,[\s\S]*right 3px bottom 3px/)
})

test('Lumen uses protected world prose, word entrance, importance pause, and a five-line quill', () => {
  const source = read('../src/ui/LumenTicker.svelte')
  const world = read('../src/render/world.ts')
  assert.deepEqual(compile(source, { filename: 'LumenTicker.svelte', generate: 'client' }).warnings, [])
  assert.match(source, /slice\(0, 5\)/)
  assert.match(source, /class="lumen-vignette"/)
  assert.match(source, /@keyframes word-arrive/)
  assert.match(source, /dataset\.lumenImportance = importance/)
  assert.match(source, /data-temperature=\{temperature\}/)
  assert.match(source, /Read recent Lumen lines/)
  assert.match(world, /particlesPaused = document\.documentElement\.dataset\.lumenImportance === 'important'/)
  assert.match(world, /if \(!particlesPaused\) \{/)
})

test('shop and upgrade affordability is warm light versus cold coal, never disabled gray', () => {
  const shop = read('../src/ui/ShopPanel.svelte')
  const upgrades = read('../src/ui/UpgradeBar.svelte')
  const observatory = read('../src/ui/Observatory.svelte')
  const deep = read('../src/ui/TheDeep.svelte')
  assert.match(shop, /class="shop instrument-panel"/)
  assert.match(shop, /inset 0 0 1\.1rem color-mix\(in srgb, var\(--amber\) 12%/)
  assert.match(shop, /\.row\.unaffordable \{[\s\S]*opacity: 1;[\s\S]*linear-gradient/)
  assert.match(upgrades, /inset 0 0 1rem color-mix\(in srgb, var\(--amber\) 12%/)
  assert.match(upgrades, /\.up\.unaffordable \{[\s\S]*opacity: 1;[\s\S]*linear-gradient/)
  assert.match(observatory, /class:affordable class:unaffordable/)
  assert.match(observatory, /\.work\.unaffordable/)
  assert.doesNotMatch(observatory, /\.work button:disabled \{ opacity:/)
  assert.match(deep, /class:owned class:affordable class:unaffordable/)
  assert.match(deep, /\.recursive-work\.unaffordable/)
  assert.doesNotMatch(deep, /\.recursive-work button:disabled \{ opacity:/)
})

test('HUD counter and rate use the Phase 4 size and weight contract', () => {
  const hud = read('../src/ui/Hud.svelte')
  assert.match(hud, /font-size: clamp\(2\.3rem, 3\.45vw, 2\.75rem\)/)
  assert.match(hud, /font-weight: 700/)
  assert.match(hud, /font-size: 0\.9375rem/)
  assert.match(hud, /font-weight: 500/)
  assert.match(hud, /\.hud::before \{[\s\S]*radial-gradient/)
})

test('major interactive surfaces share the instrument panel and story-type contracts', () => {
  const panels = [
    ['../src/ui/StatsPanel.svelte', 'panel instrument-panel'],
    ['../src/ui/OptionsPanel.svelte', 'panel instrument-panel'],
    ['../src/ui/CuriosityCabinet.svelte', 'cabinet instrument-panel'],
    ['../src/ui/VesselPanel.svelte', 'vessel instrument-panel'],
    ['../src/ui/Codex.svelte', 'codex instrument-panel'],
    ['../src/ui/GameGuide.svelte', 'guide instrument-panel'],
    ['../src/ui/Observatory.svelte', 'observatory instrument-panel'],
    ['../src/ui/TheDeep.svelte', 'deep instrument-panel'],
    ['../src/ui/EndgameHub.svelte', 'endgame instrument-panel'],
    ['../src/ui/ResetComparisonCard.svelte', 'reset-card instrument-panel'],
  ] as const
  for (const [relative, className] of panels) assert.match(read(relative), new RegExp(`class="${className}`))
  const css = read('../src/app.css')
  assert.match(css, /\.instrument-panel :where\(h2, \.panel-title, \.universe-name\)/)
  assert.match(css, /\.instrument-panel :where\(em, \.flavor, \.nova-text, \.fold-text, \.empty-journal\)/)
})

test('rule 12 protects every remaining intentionally naked world label with a vignette', () => {
  const combo = read('../src/ui/ComboMeter.svelte')
  const flagship = read('../src/ui/EmberlightFlagshipLayer.svelte')
  assert.match(combo, /\.combo \{[\s\S]*background: radial-gradient/)
  assert.match(flagship, /\.landmark-name \{[\s\S]*background: radial-gradient/)
})
