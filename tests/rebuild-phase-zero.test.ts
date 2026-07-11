import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { EMBERLIGHT_V2 } from '../src/content/universes/emberlight-v2'
import { heartTargetCenter, HEART_VERTICAL_POSITION } from '../src/render/heart-target'
import {
  PARALLAX_BY_SCREEN_ZONE,
  planManifestLayout,
} from '../src/render/manifest-layout'

const worldSource = readFileSync(new URL('../src/render/world.ts', import.meta.url), 'utf8')
const layerSource = readFileSync(new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
const atlasSource = readFileSync(new URL('../src/ui/EndgameHub.svelte', import.meta.url), 'utf8')

test('the Heart sits at the landscape seam and the canvas draws one universe-colored floor', () => {
  assert.equal(HEART_VERTICAL_POSITION, 0.62)
  assert.deepEqual(heartTargetCenter({ width: 1280, height: 720 }), { x: 640, y: 446.4 })
  assert.match(worldSource, /private drawGround\(\)/)
  assert.match(worldSource, /ctx\.bezierCurveTo\([\s\S]*ctx\.bezierCurveTo\(/)
  for (const color of ['#221A24', '#0A2432', '#1C2415', '#262019', '#191627', '#1C2633', '#241826']) {
    assert.match(worldSource, new RegExp(color, 'i'))
  }
})

test('Emberlight tiers one through six live on grounded addresses with explicit parallax bands', () => {
  const firstSix = EMBERLIGHT_V2.visual.objects
    .filter((object) => object.sourceKind === 'generator')
    .slice(0, 6)
  assert.deepEqual(firstSix.map(({ sourceId }) => sourceId), ['spark', 'wisp', 'hearth', 'kiln', 'forge', 'beacon'])
  assert.ok(firstSix.every(({ screenZone }) => screenZone === 'near'))
  assert.deepEqual(PARALLAX_BY_SCREEN_ZONE, {
    near: 1,
    heart: 0.6,
    far: 0.35,
    horizon: 0.15,
  })

  const plan = planManifestLayout({
    visual: EMBERLIGHT_V2.visual,
    heart: EMBERLIGHT_V2.heart,
    viewport: { width: 1280, height: 720 },
    state: {
      visibleObjectIds: firstSix.map(({ id }) => id),
      ownershipBySourceId: Object.fromEntries(firstSix.map(({ sourceId }) => [sourceId, 1])),
    },
    preferences: { reducedMotion: false, quality: 'high', minimal: false, panelOpen: false },
  })
  assert.ok(plan.objects.length > 0)
  assert.ok(plan.objects.every(({ screenZone, parallaxFactor }) => screenZone === 'near' && parallaxFactor === 1))
  assert.deepEqual(plan.diagnostics, [])
})

test('bloom is one quality-tiered screen pass and virgin worlds suppress decorative orbitals', () => {
  assert.match(worldSource, /private applyScreenBloom\(profile: RenderProfile\)/)
  assert.match(worldSource, /profile\.id === 'high'[\s\S]*profile\.id === 'balanced'/)
  assert.doesNotMatch(worldSource, /const halo = ctx\.createRadialGradient/)
  assert.match(layerSource, /const virginWorld = \$derived\(visibleObjectIds\.length === 0\)/)
  assert.match(layerSource, /\{#if !virginWorld\}[\s\S]*class="scene-composition"/)
  assert.match(layerSource, /heartState && !virginWorld/)
  assert.match(appSource, /let goalLensEnabled = \$state\(false\)/)
  assert.match(appSource, /let promptState = \$state<ContextualPromptState>\(\{ enabled: false/)
})

test('Atlas law labels have an explicit gap and wrapping contract', () => {
  assert.match(atlasSource, /\.route-laws div \{ display: grid; align-content: start; gap: \.2rem; min-width: 0; \}/)
  assert.match(atlasSource, /\.route-laws div > strong \{ line-height: 1\.25; overflow-wrap: anywhere; \}/)
})
