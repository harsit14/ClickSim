import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'

test('Kindling names wrap in full while the bulk quantity remains visible', () => {
  const shopPath = new URL('../src/ui/ShopPanel.svelte', import.meta.url)
  const source = readFileSync(shopPath, 'utf8')
  const compiled = compile(source, { filename: shopPath.pathname, generate: 'client' })

  assert.deepEqual(compiled.warnings, [])
  assert.match(source, /<span class="name-label">\{g\.name\}<\/span>\s*\{#if p\.count > 1\}<small>×\{p\.count\}<\/small>\{\/if\}/)
  assert.match(source, /\.name-label\s*\{[^}]*min-width:\s*0;[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere;/s)
  assert.doesNotMatch(source, /\.name-label\s*\{[^}]*text-overflow:\s*ellipsis;/s)
  assert.match(source, /\.name small\s*\{[^}]*flex:\s*none;[^}]*white-space:\s*nowrap;/s)
})
