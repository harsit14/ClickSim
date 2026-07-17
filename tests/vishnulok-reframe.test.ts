import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { amountFromNumber } from '../src/core/numeric/amount'
import { VISHNULOK, VISHNULOK_V2_PACK, VISHNULOK_SPEC } from '../src/content/universes/vishnulok'
import {
  VISHNULOK_BURDENS,
  VISHNULOK_CIRCUITS,
  vishnulokCircuitStatus,
} from '../src/content/universes/f4-runtime'
import { VISHNULOK_ARCHIVE_MARKS } from '../src/render/chamber-archive-marks'

const STABLE_KINDLING_IDS = Array.from(
  { length: 18 },
  (_, index) => `vishnulok-kindling-${String(index + 1).padStart(2, '0')}`,
)

test('Vishnulok fully occupies the save-stable vishnulok slot without renumbering player data', () => {
  assert.equal(VISHNULOK_SPEC.id, 'vishnulok')
  assert.equal(VISHNULOK_SPEC.prefix, 'vishnulok')
  assert.equal(VISHNULOK.shortName, 'Vishnulok')
  assert.deepEqual(VISHNULOK.generators.map(({ id }) => id), STABLE_KINDLING_IDS)
  assert.equal(VISHNULOK.generators.length, 18)
  assert.equal(VISHNULOK_V2_PACK.archive.records.length, 12)
  assert.ok(VISHNULOK.upgrades.every(({ id }) => id.startsWith('vishnulok-')))
})

test('the public vishnulok economy and archive are preservation-native rather than storm reskins', () => {
  const publicCopy = JSON.stringify({
    name: VISHNULOK_SPEC.name,
    premise: VISHNULOK_SPEC.premise,
    kindlings: VISHNULOK_SPEC.kindlings,
    archives: VISHNULOK_SPEC.archives,
    doctrines: VISHNULOK_SPEC.doctrines,
    trials: VISHNULOK_SPEC.trials,
  })
  assert.doesNotMatch(publicCopy, /thunder|lightning|storm|charge|fulgurite|discharge|supercell/i)
  assert.match(publicCopy, /continuity/i)
  assert.match(publicCopy, /refuge/i)
  assert.match(publicCopy, /return/i)
  assert.equal(new Set(VISHNULOK_SPEC.kindlings.map(({ name }) => name)).size, 18)
  assert.equal(new Set(VISHNULOK_SPEC.archives.map(({ name }) => name)).size, 12)
})

test('the Endless Circuit remains labeled, save-safe, and deterministic', () => {
  assert.deepEqual(VISHNULOK_CIRCUITS.map(({ id }) => id), ['daily-return', 'refuge-circuit', 'measured-correction', 'ocean-balance'])
  assert.deepEqual(VISHNULOK_BURDENS.map(({ id }) => id), ['sheltered', 'open-water', 'strained', 'far-reaching'])
  const legacyState = {
    'vishnulok-circuit': amountFromNumber(9),
    'vishnulok-shelter-count': amountFromNumber(99),
    'vishnulok-burden': amountFromNumber(8),
  }
  const status = vishnulokCircuitStatus(legacyState)
  assert.equal(status.circuit.id, 'ocean-balance')
  assert.equal(status.length, 8)
  assert.equal(status.burden.id, 'far-reaching')
  assert.match(status.explanation, /continuity|ready|returning/)
})

test('sacred presences and attributes remain outside ordinary mechanics and collectible art', () => {
  const mechanics = JSON.stringify({
    currency: VISHNULOK_SPEC.currency,
    heart: VISHNULOK_SPEC.heartName,
    kindlings: VISHNULOK_SPEC.kindlings,
    upgrades: VISHNULOK.upgrades,
    archives: VISHNULOK_SPEC.archives,
    doctrines: VISHNULOK_SPEC.doctrines,
    omens: VISHNULOK_SPEC.omens,
  })
  assert.doesNotMatch(mechanics, /\b(?:Vishnu|Lakshmi|Ananta|chakra)\b/i)
  const lakshmi = VISHNULOK_SPEC.story.find(({ title }) => title === 'Lakshmi at the Threshold')
  const ananta = VISHNULOK_SPEC.story.find(({ title }) => title === 'The Endless Support')
  assert.match(lakshmi?.text ?? '', /independent sacred presence/)
  assert.match(ananta?.text ?? '', /never as machinery, terrain, enemy, or the body of the player’s circuit/)
  assert.match(VISHNULOK_SPEC.fatiguePolicy, /no mantra, raga, conch ceremony, temple bell, or sacred instrument performance is simulated/i)
})

test('Vishnulok supplies twelve distinct cabinet marks and no storm world scaffold', () => {
  assert.equal(VISHNULOK_ARCHIVE_MARKS.length, 12)
  assert.equal(new Set(VISHNULOK_ARCHIVE_MARKS.map(({ diagramPath, accentPath }) => `${diagramPath}|${accentPath}`)).size, 12)
  const world = readFileSync(new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url), 'utf8')
  const worldLayer = readFileSync(new URL('../src/ui/VishnulokWorldLayer.svelte', import.meta.url), 'utf8')
  const panel = readFileSync(new URL('../src/ui/UniverseLawPanel.svelte', import.meta.url), 'utf8')
  assert.match(world, /vishnulok-horizon/)
  assert.match(worldLayer, /\.sr-only\s*\{[^}]*clip:rect\(0,0,0,0\)/s)
  assert.match(panel, /Vishnulok Endless Circuit/)
  assert.doesNotMatch(world, /vishnulok-anvil|vishnulok-leader|positive-continuity/)
  assert.doesNotMatch(panel, /storm-layout|DISCHARGE|storm field/)
})
