import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import {
  buildEmberlightFlagshipScene,
  EMBERLIGHT_CONSTELLATIONS,
  emberlightOwnershipThreshold,
} from '../src/render/emberlight/flagship-scene'
import { ACHIEVEMENTS } from '../src/content/achievements'
import { LUMEN_LINES } from '../src/content/lumen'
import { KINDLED_SKY_CATEGORIES, planKindledSky } from '../src/render/emberlight/kindled-sky'
import { EMBERLIGHT_REMNANTS, planEmberlightRemnants } from '../src/render/emberlight/remnants'
import { createDevScenario } from '../src/core/dev-scenarios'

test('the Kindling regression cannot restore decorative orbit or random-star scaffolds', () => {
  const layer = readFileSync(new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url), 'utf8')
  assert.doesNotMatch(layer, /ember-orbit|ember-corona|EMBER_STARS/)
  assert.match(layer, /<EmberlightFlagshipLayer owned=\{owned\}/)
})

test('Hearth and Sun ownership use the shared five-state structural grammar', () => {
  assert.deepEqual(
    [0, 1, 9, 10, 24, 25, 49, 50, 99, 100, 999].map(emberlightOwnershipThreshold),
    [null, 1, 1, 10, 10, 25, 25, 50, 50, 100, 100],
  )

  const one = buildEmberlightFlagshipScene({ hearth: 1, sun: 1 })
  const organized = buildEmberlightFlagshipScene({ hearth: 10, sun: 10 })
  const neighbors = buildEmberlightFlagshipScene({ hearth: 25, sun: 25 })
  const topology = buildEmberlightFlagshipScene({ hearth: 50, sun: 50 })
  const landmarks = buildEmberlightFlagshipScene({ hearth: 100, sun: 100 })

  assert.deepEqual([one.hearthSeats.length, organized.hearthSeats.length, neighbors.hearthSeats.length], [1, 3, 5])
  assert.equal(neighbors.mergedHearthLight, true)
  assert.equal(topology.settlementGlow, true)
  assert.equal(topology.eclipticVisible, true)
  assert.equal(landmarks.terraces, true)
  assert.equal(landmarks.eclipticLandmark, true)
  assert.equal(landmarks.hearthSeats.length, 1)
  assert.equal(landmarks.sunSeats.length, 1)
})

test('the drawn sky contains twelve distinct named authored figures', () => {
  assert.equal(EMBERLIGHT_CONSTELLATIONS.length, 12)
  assert.equal(new Set(EMBERLIGHT_CONSTELLATIONS.map(({ id }) => id)).size, 12)
  assert.equal(new Set(EMBERLIGHT_CONSTELLATIONS.map(({ name }) => name)).size, 12)
  assert.ok(EMBERLIGHT_CONSTELLATIONS.every(({ path, nodes }) => path.startsWith('M') && nodes.length >= 5))
  assert.equal(buildEmberlightFlagshipScene({ constellation: 1 }).constellationFigures.length, 1)
  assert.equal(buildEmberlightFlagshipScene({ constellation: 10 }).constellationFigures.length, 10)
  assert.equal(buildEmberlightFlagshipScene({ constellation: 125 }).constellationFigures.length, 12)
})

test('the Phase 2 flagship layer compiles cleanly and carries the depth grammar', () => {
  const url = new URL('../src/ui/EmberlightFlagshipLayer.svelte', import.meta.url)
  const source = readFileSync(url, 'utf8')
  assert.deepEqual(compile(source, { filename: url.pathname, generate: 'client' }).warnings, [])
  assert.match(source, /class="drawn-sky"/)
  assert.match(source, /class="ecliptic"/)
  assert.match(source, /class="settlement"/)
  assert.match(source, /radial-gradient\(circle at 43% 38%/)
  assert.match(source, /class="coronal-loop loop-a"/)
  assert.match(source, /@keyframes draw-figure/)
  assert.match(source, /width: calc\(1\.8rem \* var\(--scale\)\)/)
  assert.match(source, /width: calc\(3\.15rem \* var\(--scale\)\)/)
  assert.match(source, /data-stage="steady-answer"/)
  assert.doesNotMatch(source, /secondBlink|answering-blink|window\.addEventListener\('pointerdown'/)
  for (const family of [
    'ember-exhale',
    'kept-fire',
    'industry-signal',
    'horizon-seed',
    'stellar-birth',
    'stellar-relations',
    'deep-sky',
    'cosmic-topology',
    'answer',
  ]) assert.match(source, new RegExp(`['"]${family}['"]`))
})

test('the Kindled Sky names every unlocked achievement and routes only within categories', () => {
  const plan = planKindledSky(ACHIEVEMENTS.map(({ id }) => id))
  assert.equal(plan.stars.length, ACHIEVEMENTS.length)
  assert.equal(KINDLED_SKY_CATEGORIES.length, 12)
  assert.equal(new Set(plan.stars.map(({ id }) => id)).size, ACHIEVEMENTS.length)
  assert.ok(plan.stars.every(({ name }) => name.length > 0))
  assert.ok(plan.routes.every((route) => {
    const from = plan.stars.find((star) => star.x === route.from[0] && star.y === route.from[1])
    const to = plan.stars.find((star) => star.x === route.to[0] && star.y === route.to[1])
    return from?.category === route.category && to?.category === route.category
  }))
  assert.ok(plan.routes.every((route) => Math.hypot(
    route.to[0] - route.from[0],
    route.to[1] - route.from[1],
  ) <= 14))
})

test('six Remnants use the shared structural thresholds and have two Lumen lines each', () => {
  assert.equal(EMBERLIGHT_REMNANTS.length, 6)
  const plans = [1, 10, 25, 50, 100].map((count) => planEmberlightRemnants(
    Object.fromEntries(EMBERLIGHT_REMNANTS.flatMap(({ sourceIds }) => sourceIds.map((id) => [id, count]))),
  ))
  assert.deepEqual(plans.map((plan) => plan[0]?.threshold), [1, 10, 25, 50, 100])
  assert.deepEqual(plans.map((plan) => plan[0]?.reveal), [0.22, 0.42, 0.62, 0.82, 1])
  assert.equal(plans.at(-1)?.filter(({ complete }) => complete).length, 6)
  const remnantLines = LUMEN_LINES.filter(({ id }) => id.startsWith('remnant-'))
  assert.equal(remnantLines.length, 12)
  for (const remnant of EMBERLIGHT_REMNANTS) {
    const stem = remnant.id === 'half-bridge' ? 'bridge'
      : remnant.id === 'child-orrery' ? 'orrery'
        : remnant.id === 'broken-lens' ? 'lens'
          : remnant.id === 'star-tablet' ? 'tablet'
            : remnant.id === 'empty-rib' ? 'rib'
              : 'doorframe'
    assert.equal(remnantLines.filter(({ id }) => id.startsWith(`remnant-${stem}-`)).length, 2)
  }
})

test('Phase 2 UI uses authored monochrome artifacts and preserves physical painter order', () => {
  const art = readFileSync(new URL('../src/ui/SetPieceArt.svelte', import.meta.url), 'utf8')
  const shopArt = readFileSync(new URL('../src/ui/KindlingShopArt.svelte', import.meta.url), 'utf8')
  const shop = readFileSync(new URL('../src/ui/ShopPanel.svelte', import.meta.url), 'utf8')
  const upgrades = readFileSync(new URL('../src/ui/UpgradeBar.svelte', import.meta.url), 'utf8')
  const world = readFileSync(new URL('../src/render/world.ts', import.meta.url), 'utf8')
  assert.match(art, /class:monochrome/)
  assert.match(shop, /<KindlingShopArt universeId=\{pack\.id\}/)
  assert.match(shopArt, /<SetPieceArt \{stage\} monochrome/)
  assert.match(shop, /state-glint/)
  assert.match(upgrades, /<SetPieceArt stage=\{artifact\} monochrome/)
  assert.match(world, /sparkCount > 0/)
  assert.match(world, /Math\.log2\(sparkCount \+ 1\)/)
  assert.ok(world.indexOf('this.drawEmberlightWisps(now, r, reduced)') < world.indexOf('this.drawEmberlightCoal(now, r, reduced)'))
})

test('the six written progression moments have deterministic browser-review saves', () => {
  const names = ['opening', 'ember-camp', 'midgame', 'ember-cosmic', 'ember-postnova', 'endgame'] as const
  const moments = names.map((name) => createDevScenario(name, 10_000))
  assert.ok(moments.every(Boolean))
  assert.deepEqual(moments.map((moment) => Object.keys(moment!.owned).length), [0, 4, 6, 16, 0, 18])
  assert.equal(moments[4]!.supernovae, 1)
  assert.equal(moments[5]!.owned.ember2, 125)
  assert.equal(moments[5]!.achievements.length, ACHIEVEMENTS.length)
})

test('new Phase 2 Svelte layers and consumers compile without warnings', () => {
  for (const relative of [
    '../src/ui/KindledSky.svelte',
    '../src/ui/EmberlightRemnants.svelte',
    '../src/ui/ShopPanel.svelte',
    '../src/ui/UpgradeBar.svelte',
  ]) {
    const url = new URL(relative, import.meta.url)
    const source = readFileSync(url, 'utf8')
    assert.deepEqual(compile(source, { filename: url.pathname, generate: 'client' }).warnings, [])
    if (relative.endsWith('KindledSky.svelte')) {
      assert.match(source, /cursor: pointer/)
      assert.doesNotMatch(source, /cursor: help/)
    }
  }
})
