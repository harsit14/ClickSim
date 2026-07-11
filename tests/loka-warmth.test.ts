import assert from 'node:assert/strict'
import test from 'node:test'
import { PRISMATA } from '../src/content/universes/prismata'
import { TEMPEST } from '../src/content/universes/tempest'
import { CANTICLE } from '../src/content/universes/canticle'

test('each loka keeps one early human-scale Lumen beat beneath its cosmic register', () => {
  const firstLines = [PRISMATA, TEMPEST, CANTICLE].map((pack) => pack.lumen.find(({ id }) => id.endsWith('lumen-first'))?.text ?? '')
  assert.match(firstLines[0], /loose page.*sleeve.*margin/i)
  assert.match(firstLines[1], /little reed boat.*better map/i)
  assert.match(firstLines[2], /lamp.*warm cup.*way down/i)
  assert.ok(firstLines.every((line) => line.length < 220))
})

test('warmth stays in ordinary materials rather than sacred terminology', () => {
  const firstLines = [PRISMATA, TEMPEST, CANTICLE].map((pack) => pack.lumen.find(({ id }) => id.endsWith('lumen-first'))?.text ?? '')
  for (const line of firstLines) assert.doesNotMatch(line, /Brahma|Vishnu|Shiva|Saraswati|Lakshmi|Parvati|Ganga|Nandi|mantra|transliteration/i)
})
