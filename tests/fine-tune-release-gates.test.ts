import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'

const canvasUrl = new URL('../src/ui/EmberCanvas.svelte', import.meta.url)
const canvasSource = readFileSync(canvasUrl, 'utf8')
const appSource = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
const optionsUrl = new URL('../src/ui/OptionsPanel.svelte', import.meta.url)
const optionsSource = readFileSync(optionsUrl, 'utf8')

test('the untouched opening gives the first keyboard or pointer kindle a readable answer', () => {
  assert.deepEqual(compile(canvasSource, { filename: canvasUrl.pathname, generate: 'client' }).warnings, [])
  assert.match(canvasSource, /if \(game\.clicks === 1\)/)
  assert.match(canvasSource, /firstKindleResponse = `\$\{activeUniverse\.centralObject\} answered\./)
  assert.match(canvasSource, /class="first-kindle-response" aria-live="polite"/)
  assert.match(canvasSource, /aria-keyshortcuts="Space Enter"/)
  assert.match(canvasSource, /game\.clicks >= 5 && game\.clicks < 25/)
  assert.match(canvasSource, /keyboardKindleUsed = true/)
  assert.match(canvasSource, /Space<\/kbd> or <kbd>Enter<\/kbd> kindles without repeated pointer clicks/)
})

test('Options exposes the complete keyboard shortcut reference without relying on hover', () => {
  assert.deepEqual(compile(optionsSource, { filename: optionsUrl.pathname, generate: 'client' }).warnings, [])
  assert.match(optionsSource, /id="keyboard-controls-title"/)
  for (const label of ['Kindle the Heart', 'Buy visible Kindling', 'Cycle bulk amount', 'Guide, records, options', 'Story, Legacy, close panel']) {
    assert.match(optionsSource, new RegExp(label))
  }
})

test('Options keeps the public save surface simple', () => {
  assert.match(optionsSource, /<h3>Save<\/h3>/)
  assert.match(optionsSource, />Copy export<\/button>/)
  assert.match(optionsSource, />Download file<\/button>/)
  assert.match(optionsSource, />Import<\/button>/)
  assert.doesNotMatch(optionsSource, /Save safety|Copy pre-v13 rollback|exportV12Rollback/)
})

test('adaptive canvas degradation governs the DOM world layer too', () => {
  assert.match(appSource, /resolveEffectiveVisualQuality/)
  assert.match(appSource, /renderHealth\.profile/)
  assert.match(appSource, /quality: effectiveQuality/)
})
