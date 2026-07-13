import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('Kindling purchases target the pooled world renderer without restoring the removed overlay', () => {
  const layer = readFileSync('src/ui/PurchaseCeremonyLayer.svelte', 'utf8')
  const runtime = readFileSync('src/feedback/live-runtime.svelte.ts', 'utf8')

  assert.doesNotMatch(layer, /purchase-ceremony|class="(?:price|path|delta)"/)
  assert.doesNotMatch(runtime, /manifest-purchase-ceremony/)
  assert.match(runtime, /schedulePurchaseCeremony/)
  assert.match(runtime, /emitPurchaseMote/)
  assert.match(runtime, /quantity: event\.quantity/)
  assert.match(runtime, /intensity: scheduled\.ceremony\.intensity/)
  assert.match(runtime, /milestoneThreshold/)
  assert.match(layer, /aria-live="polite"/)
  assert.match(runtime, /screen-reader-announcement/)
})

test('pointer and keyboard purchases share quantity-aware feedback', () => {
  const shop = readFileSync('src/ui/ShopPanel.svelte', 'utf8')
  const canvas = readFileSync('src/ui/EmberCanvas.svelte', 'utf8')
  const world = readFileSync('src/render/world.ts', 'utf8')

  assert.match(shop, /completedGeneratorPurchaseFeedback/)
  assert.match(canvas, /completedGeneratorPurchaseFeedback/)
  assert.match(canvas, /publishLivePurchase/)
  assert.match(world, /Math\.log10\(quantity \+ 1\)/)
  assert.match(world, /`×\$\{quantity\.toLocaleString\(\)\}`/)
  assert.match(world, /options\.reducedMotion\s*\?\s*1/)
  assert.match(world, /threshold \$\{options\.milestoneThreshold\.toLocaleString\(\)\}/)
})
