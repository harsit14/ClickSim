import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import { EMBERLIGHT_SET_PIECES } from '../src/render/emberlight/set-piece-registry'
import { kindlingShopMark } from '../src/render/kindling-shop-marks'
import { TIDEFALL_SET_PIECES } from '../src/render/tidefall/set-piece-registry'
import type { UniverseId } from '../src/content/universes/types'

const chamberWorlds: readonly UniverseId[] = ['verdance', 'clockwork', 'prismata', 'tempest', 'canticle']

test('every universe has eighteen distinct Kindling shop silhouettes', () => {
  const emberlight = EMBERLIGHT_SET_PIECES.flatMap(({ stages }) => stages)
  const tidefall = TIDEFALL_SET_PIECES.flatMap(({ stages }) => stages)
  assert.equal(emberlight.length, 18)
  assert.equal(tidefall.length, 18)
  assert.equal(new Set(emberlight.map(({ paths }) => paths.map(({ d }) => d).join('|'))).size, 18)
  assert.equal(new Set(tidefall.map(({ paths }) => paths.map(({ d }) => d).join('|'))).size, 18)

  for (const universeId of chamberWorlds) {
    const marks = Array.from({ length: 18 }, (_, index) => kindlingShopMark(universeId, index + 1))
    assert.ok(marks.every(Boolean), `${universeId} must define every shop tier`)
    const fingerprints = marks.map((mark) => `${mark!.framePath}|${mark!.bodyPath}|${mark!.accentPath}`)
    assert.equal(new Set(fingerprints).size, 18, `${universeId} shop silhouettes must remain distinct`)
  }
})

test('Kindling shop art stays compact and compiles without warnings', () => {
  const shopPath = new URL('../src/ui/ShopPanel.svelte', import.meta.url)
  const artPath = new URL('../src/ui/KindlingShopArt.svelte', import.meta.url)
  const shop = readFileSync(shopPath, 'utf8')
  const art = readFileSync(artPath, 'utf8')

  assert.deepEqual(compile(shop, { filename: shopPath.pathname, generate: 'client' }).warnings, [])
  assert.deepEqual(compile(art, { filename: artPath.pathname, generate: 'client' }).warnings, [])
  assert.match(shop, /<KindlingShopArt universeId=\{pack\.id\}/)
  assert.match(shop, /\.kindling-icon\s*\{[^}]*width:\s*0\.95rem;[^}]*height:\s*0\.95rem;/s)
  assert.match(art, /emberlightSetPieceStage/)
  assert.match(art, /tidefallSetPieceStageForSource/)
  assert.match(art, /kindlingShopMark/)
})

test('Cabinet is a universe-specific archive field instead of one shared card stack', () => {
  const cabinetPath = new URL('../src/ui/CuriosityCabinet.svelte', import.meta.url)
  const cabinet = readFileSync(cabinetPath, 'utf8')

  assert.deepEqual(compile(cabinet, { filename: cabinetPath.pathname, generate: 'client' }).warnings, [])
  assert.match(cabinet, /data-universe=\{pack\.id\}/)
  assert.match(cabinet, /class="archive-field"/)
  assert.match(cabinet, /class="archive-index"/)
  assert.match(cabinet, /class="inspection-backdrop"/)
  assert.match(cabinet, /role="dialog"/)
  assert.match(cabinet, /aria-modal="true"/)
  assert.match(cabinet, /\.inspection-backdrop\s*\{[^}]*z-index:\s*11;/s)
  assert.match(cabinet, /\.cabinet\s*\{[^}]*z-index:\s*12;/s)
  assert.match(cabinet, /width:\s*min\(56rem,/)
  for (const theme of ['emberlight', 'tidefall', 'verdance', 'clockwork', 'prismata', 'tempest', 'canticle']) {
    assert.match(cabinet, new RegExp(`class:${theme}=\\{pack\\.id === '${theme}'\\}`))
  }
  for (const localName of ['relation field', 'pressure transect', 'specimen press', 'patent register', 'fourfold manuscript court', 'continuance sounding', 'memory score']) {
    assert.match(cabinet, new RegExp(localName))
  }
})
