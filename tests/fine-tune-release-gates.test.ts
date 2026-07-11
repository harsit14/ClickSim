import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'

const canvasUrl = new URL('../src/ui/EmberCanvas.svelte', import.meta.url)
const canvasSource = readFileSync(canvasUrl, 'utf8')
const appSource = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')

test('the untouched opening gives the first keyboard or pointer kindle a readable answer', () => {
  assert.deepEqual(compile(canvasSource, { filename: canvasUrl.pathname, generate: 'client' }).warnings, [])
  assert.match(canvasSource, /if \(game\.clicks === 1\)/)
  assert.match(canvasSource, /firstKindleResponse = `\$\{activeUniverse\.centralObject\} answered\./)
  assert.match(canvasSource, /class="first-kindle-response" aria-live="polite"/)
  assert.match(canvasSource, /aria-keyshortcuts="Space Enter"/)
})

test('adaptive canvas degradation governs the DOM world layer too', () => {
  assert.match(appSource, /resolveEffectiveVisualQuality/)
  assert.match(appSource, /renderHealth\.profile/)
  assert.match(appSource, /quality: effectiveQuality/)
})
