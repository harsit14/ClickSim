import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { ACHIEVEMENTS } from '../src/content/achievements'
import { REALM_CONCLUSIONS } from '../src/content/endings'
import { SUCCESSION_RELAYS } from '../src/content/legacy-exchange'
import { LUMEN_COMPLICITY_LINES } from '../src/content/lumen-complicity'
import { ZERO_AMOUNT } from '../src/core/numeric/amount'
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

  const lokaConclusions = [
    REALM_CONCLUSIONS.brahmalok,
    REALM_CONCLUSIONS.vishnulok,
    REALM_CONCLUSIONS.kailash,
  ]
  assert.equal(new Set(lokaConclusions.map(({ question }) => question)).size, 3)
  assert.deepEqual(lokaConclusions.map(({ universeId }) => universeId), ['brahmalok', 'vishnulok', 'kailash'])
  assert.match(REALM_CONCLUSIONS.kailash.emotionalPurpose, /creation, preservation, or release/i)

  const admissions = LUMEN_COMPLICITY_LINES.filter(({ act }) => act === 'VII').map(({ text }) => text).join(' ')
  assert.match(admissions, /preservation/i)
  assert.match(admissions, /Still Point/i)
  assert.match(admissions, /four restored worlds and three lokas/i)
})

test('save-stable Atlas codes now decode to public loka canon without code drift', () => {
  const fixtures = [
    [5021, 'brahmalok', 'A1-3vh.4.1.7.8.3.1-o68kc', 'BRAHMALOK: THE OPEN MARGIN'],
    [7129, 'vishnulok', 'A1-5i1.5.2.7.a.4.z-usa7j', 'VISHNULOK: THE RETURNING HARBOR'],
    [12011, 'kailash', 'A1-99n.6.3.6.9.5.2-kgtcw', 'KAILASH: THE PATH DOWNWARD'],
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
    'clockwork->brahmalok',
    'brahmalok->vishnulok',
    'vishnulok->kailash',
  ])
  assert.match(SUCCESSION_RELAYS.slice(-3).map(({ description }) => description).join(' '), /Brahmalok.*Vishnulok.*Kailash/s)
  assert.ok(ACHIEVEMENTS.some(({ id }) => id === 'loka-cycle'))
  assert.ok(ACHIEVEMENTS.some(({ id }) => id === 'garden-renewal'))

  const allAnswers = ACHIEVEMENTS.find(({ id }) => id === 'all-answers')!
  const realmAnswers = Object.fromEntries(Object.entries(REALM_CONCLUSIONS).map(([universeId, conclusion]) => (
    [universeId, [conclusion.choices[0].id]]
  )))
  const achievementState = (
    pastEndings: readonly string[],
    ending: string | null,
    answers: Record<string, readonly string[]> = {},
  ) => ({ pastEndings, ending, realmAnswers: answers }) as unknown as Parameters<typeof allAnswers.when>[0]
  assert.equal(allAnswers.when(achievementState(['warden', 'hunger', 'companion'], null), ZERO_AMOUNT), true)
  assert.equal(allAnswers.when(achievementState(['warden', 'hunger'], 'companion'), ZERO_AMOUNT), true)
  assert.equal(allAnswers.when(achievementState([], null, realmAnswers), ZERO_AMOUNT), false)

  const guide = read('../src/content/guide.ts')
  assert.match(guide, /four restored worlds and three lokas/i)
  assert.match(guide, /deities are never generators, currencies, opponents, or upgrade buttons/i)

  const revelation = read('../src/ui/ClockworkRevelation.svelte')
  assert.doesNotMatch(revelation, />BRAHMALOK<|>VISHNULOK<|>KAILASH</)
  assert.match(revelation, />ORIGIN MODEL<.*>CONTINUITY MODEL<.*>RELEASE MODEL</s)
})
