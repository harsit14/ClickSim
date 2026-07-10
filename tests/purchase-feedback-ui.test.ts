import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('Kindling purchases do not render the removed geometry overlay', () => {
  const layer = readFileSync('src/ui/PurchaseCeremonyLayer.svelte', 'utf8')
  const runtime = readFileSync('src/feedback/live-runtime.svelte.ts', 'utf8')

  assert.doesNotMatch(layer, /purchase-ceremony|class="(?:price|path|delta)"/)
  assert.doesNotMatch(runtime, /manifest-purchase-ceremony|schedulePurchaseCeremony/)
  assert.match(layer, /aria-live="polite"/)
  assert.match(runtime, /screen-reader-announcement/)
})
