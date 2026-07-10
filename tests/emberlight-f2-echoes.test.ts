import assert from 'node:assert/strict'
import test from 'node:test'
import { ECHOES } from '../src/content/echoes'

test('ten revised Echoes form a mechanic-linked Emberlight arc without changing IDs', () => {
  assert.deepEqual(ECHOES.map(({ id }) => id), [
    'first-fire',
    'census',
    'lighthouse',
    'letters-home',
    'long-bright',
    'wisp-song',
    'inventory',
    'second-census',
    'margin-note',
    'shape-in-dark',
  ])
  assert.equal(ECHOES.length, 10)
  for (const echo of ECHOES) {
    const words = echo.text.trim().split(/\s+/).length
    assert.ok(words >= 80 && words <= 220, `${echo.id}: ${words} words`)
    assert.match(echo.text, /Heart|Kindling|Light|Sun|resonance|Omen|Supernova|Stardust|doctrine|Devourer/i)
  }
  assert.match(ECHOES.at(-1)!.text, /Devourer/)
  assert.match(ECHOES.at(-1)!.text, /It left you/)
})
