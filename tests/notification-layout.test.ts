import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'

test('desktop notifications reserve a lane clear of the Kindling shop', () => {
  const toastPath = new URL('../src/ui/Toasts.svelte', import.meta.url)
  const toastSource = readFileSync(toastPath, 'utf8')
  const appSource = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
  const compiled = compile(toastSource, { filename: toastPath.pathname, generate: 'client' })

  assert.deepEqual(compiled.warnings, [])
  assert.match(toastSource, /class:shop-clear/)
  assert.match(toastSource, /\.toasts\.shop-clear\s*{[^}]*top:\s*9rem;[^}]*right:\s*19rem;/s)
  assert.match(appSource, /<Toasts clearOfShop={hasUi\('shop'\) && !utilityPanelOpen} \/>/)
})
