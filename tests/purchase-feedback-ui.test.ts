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
  assert.match(layer, /aria-live="polite"/)
  assert.match(runtime, /screen-reader-announcement/)
})
