import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { ACHIEVEMENTS } from '../src/content/achievements'
import { QUESTION_LINES } from '../src/content/endings'
import { SUCCESSION_RELAYS } from '../src/content/legacy-exchange'
import { LUMEN_COMPLICITY_LINES } from '../src/content/lumen-complicity'
import {
  CONVERGENCES,
  decodeAtlasRoute,
  generateAtlasRoute,
} from '../src/endgame/atlas'
import { GARDEN_LINKS, GARDEN_NODES } from '../src/endgame/garden'

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8')

test('Phase 9.7 carries the three lokas through Lumen, the Question, and the Garden', () => {
  assert.deepEqual(GARDEN_NODES.slice(-3).map(({ name }) => name), [
    'Open Lotus',
    'Returning Harbor',
    'Open Summit',
  ])
  assert.ok(GARDEN_NODES.slice(-3).every(({ offering, question }) =>
    !/wavelength|storm|lightning|harmony|score|voice/i.test(`${offering} ${question}`)))
  assert.ok(GARDEN_LINKS.every(({ name, result }) =>
    !/labeled lens|weather clock|choir of storms|percussion/i.test(`${name} ${result}`)))

  const question = QUESTION_LINES.join(' ')
  for (const name of ['Brahmalok', 'Vishnulok', 'Kailash']) assert.match(question, new RegExp(name))
  assert.match(question, /creation, preservation, and responsible release/i)

  const admissions = LUMEN_COMPLICITY_LINES.filter(({ act }) => act === 'VII').map(({ text }) => text).join(' ')
  assert.match(admissions, /preservation/i)
  assert.match(admissions, /Still Point/i)
  assert.match(admissions, /four restored worlds and three lokas/i)
})

test('save-stable Atlas codes now decode to public loka canon without code drift', () => {
  const fixtures = [
    [5021, 'prismata', 'A1-3vh.4.1.7.8.3.1-o68kc', 'BRAHMALOK: THE OPEN MARGIN'],
    [7129, 'tempest', 'A1-5i1.5.2.7.a.4.z-usa7j', 'VISHNULOK: THE RETURNING HARBOR'],
    [12011, 'canticle', 'A1-99n.6.3.6.9.5.2-kgtcw', 'KAILASH: THE PATH DOWNWARD'],
  ] as const

  for (const [seed, universeId, code, title] of fixtures) {
    const route = generateAtlasRoute(seed, universeId)
    assert.equal(route.code, code)
    assert.equal(route.title, title)
    assert.equal(decodeAtlasRoute(code)?.title, title)
  }

  assert.deepEqual(CONVERGENCES.map(({ id }) => id), [
    'first-neighbors',
    'divided-sky',
    'choir-of-weather',
  ])
  assert.deepEqual(CONVERGENCES.slice(1).map(({ name }) => name), [
    'The Open Horizon',
    'The Completed Cycle',
  ])
})

test('relays, achievements, guide, and Clockwork revelation expose the completed cycle', () => {
  assert.deepEqual(SUCCESSION_RELAYS.slice(-3).map(({ sourceUniverseId, targetUniverseId }) =>
    `${sourceUniverseId}->${targetUniverseId}`), [
    'clockwork->prismata',
    'prismata->tempest',
    'tempest->canticle',
  ])
  assert.match(SUCCESSION_RELAYS.slice(-3).map(({ description }) => description).join(' '), /Brahmalok.*Vishnulok.*Kailash/s)
  assert.ok(ACHIEVEMENTS.some(({ id }) => id === 'loka-cycle'))
  assert.ok(ACHIEVEMENTS.some(({ id }) => id === 'garden-renewal'))

  const guide = read('../src/content/guide.ts')
  assert.match(guide, /four restored worlds and three lokas/i)
  assert.match(guide, /deities are never generators, currencies, opponents, or upgrade buttons/i)

  const revelation = read('../src/ui/ClockworkRevelation.svelte')
  assert.doesNotMatch(revelation, />PRISMATA<|>TEMPEST<|>CANTICLE</)
  assert.match(revelation, />ORIGIN MODEL<.*>CONTINUITY MODEL<.*>RELEASE MODEL</s)
})
