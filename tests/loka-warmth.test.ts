import assert from 'node:assert/strict'
import test from 'node:test'
import { BRAHMALOK } from '../src/content/universes/brahmalok'
import { VISHNULOK } from '../src/content/universes/vishnulok'
import { KAILASH } from '../src/content/universes/kailash'

test('each loka keeps one early human-scale Lumen beat beneath its cosmic register', () => {
  const firstLines = [BRAHMALOK, VISHNULOK, KAILASH].map((pack) => pack.lumen.find(({ id }) => id.endsWith('lumen-first'))?.text ?? '')
  assert.match(firstLines[0], /loose page.*sleeve.*margin/i)
  assert.match(firstLines[1], /little reed boat.*better map/i)
  assert.match(firstLines[2], /lamp.*warm cup.*way down/i)
  assert.ok(firstLines.every((line) => line.length < 220))
})

test('warmth stays in ordinary materials rather than sacred terminology', () => {
  const firstLines = [BRAHMALOK, VISHNULOK, KAILASH].map((pack) => pack.lumen.find(({ id }) => id.endsWith('lumen-first'))?.text ?? '')
  for (const line of firstLines) assert.doesNotMatch(line, /Brahma|Vishnu|Shiva|Saraswati|Lakshmi|Parvati|Ganga|Nandi|mantra|transliteration/i)
})
