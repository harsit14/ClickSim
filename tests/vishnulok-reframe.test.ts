import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { amountFromNumber } from '../src/core/numeric/amount'
import { TEMPEST, TEMPEST_V2_PACK, VISHNULOK_SPEC } from '../src/content/universes/tempest'
import {
  VISHNULOK_BURDENS,
  VISHNULOK_CIRCUITS,
  tempestStatus,
} from '../src/content/universes/f4-runtime'
import { TEMPEST_ARCHIVE_MARKS } from '../src/render/chamber-archive-marks'

const STABLE_KINDLING_IDS = Array.from(
  { length: 18 },
  (_, index) => `u6-kindling-${String(index + 1).padStart(2, '0')}`,
)

test('Vishnulok fully occupies the save-stable u6 slot without renumbering player data', () => {
  assert.equal(VISHNULOK_SPEC.id, 'tempest')
  assert.equal(VISHNULOK_SPEC.prefix, 'u6')
  assert.equal(TEMPEST.shortName, 'Vishnulok')
  assert.deepEqual(TEMPEST.generators.map(({ id }) => id), STABLE_KINDLING_IDS)
  assert.equal(TEMPEST.generators.length, 18)
  assert.equal(TEMPEST_V2_PACK.archive.records.length, 12)
  assert.ok(TEMPEST.upgrades.every(({ id }) => id.startsWith('u6-')))
})

test('the public u6 economy and archive are preservation-native rather than storm reskins', () => {
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
    'u6-path': amountFromNumber(9),
    'u6-path-length': amountFromNumber(99),
    'u6-path-risk': amountFromNumber(8),
  }
  const status = tempestStatus(legacyState)
  assert.equal(status.path.id, 'ocean-balance')
  assert.equal(status.length, 8)
  assert.equal(status.risk.id, 'far-reaching')
  assert.match(status.explanation, /continuity|ready|returning/)
})

test('sacred presences and attributes remain outside ordinary mechanics and collectible art', () => {
  const mechanics = JSON.stringify({
    currency: VISHNULOK_SPEC.currency,
    heart: VISHNULOK_SPEC.heartName,
    kindlings: VISHNULOK_SPEC.kindlings,
    upgrades: TEMPEST.upgrades,
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
  assert.equal(TEMPEST_ARCHIVE_MARKS.length, 12)
  assert.equal(new Set(TEMPEST_ARCHIVE_MARKS.map(({ diagramPath, accentPath }) => `${diagramPath}|${accentPath}`)).size, 12)
  const world = readFileSync(new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url), 'utf8')
  const panel = readFileSync(new URL('../src/ui/UniverseLawPanel.svelte', import.meta.url), 'utf8')
  assert.match(world, /vishnulok-horizon/)
  assert.match(panel, /Vishnulok Endless Circuit/)
  assert.doesNotMatch(world, /tempest-anvil|tempest-leader|positive-charge/)
  assert.doesNotMatch(panel, /storm-layout|DISCHARGE|storm field/)
})
