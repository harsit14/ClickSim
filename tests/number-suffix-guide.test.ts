import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'
import { amountFromNumber } from '../src/core/numeric/amount'
import { numberSuffixGuide } from '../src/core/number-suffix-guide'

test('the first large suffix lesson matches the amount actually being displayed', () => {
  assert.equal(numberSuffixGuide(amountFromNumber(999e18)), null)
  assert.deepEqual(numberSuffixGuide(amountFromNumber(1e21)), {
    symbol: 'Sx',
    name: 'sextillion',
    power: 21,
    explanation: 'Sx means sextillion, or ten to the power of 21. Each new suffix is one thousand times the last.',
  })
  assert.equal(numberSuffixGuide(amountFromNumber(2.4e27))?.symbol, 'Oc')
  assert.equal(numberSuffixGuide(amountFromNumber(1e40))?.name, 'scientific notation')
})

test('the shorthand hint is one-time, dismissible, reduced-motion safe, and shared by the app', () => {
  const hintUrl = new URL('../src/ui/NumberSuffixHint.svelte', import.meta.url)
  const hintSource = readFileSync(hintUrl, 'utf8')
  const appSource = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
  assert.deepEqual(compile(hintSource, { filename: hintUrl.pathname, generate: 'client' }).warnings, [])
  assert.match(hintSource, /ember:number-suffix-guide:v1/)
  assert.match(hintSource, /Dismiss number shorthand explanation/)
  assert.match(hintSource, /html\[data-motion='reduced'\]/)
  assert.match(appSource, /<NumberSuffixHint[\s\S]*amount=\{game\.light\}[\s\S]*suppressed=\{utilityPanelOpen \|\| storyModalActive \|\| resetPreviewOpen\}/)
  assert.match(hintSource, /!suppressed && !dismissed/)
})
