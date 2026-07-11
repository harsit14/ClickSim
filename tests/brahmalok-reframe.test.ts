import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { amountFromNumber } from '../src/core/numeric/amount'
import { BRAHMALOK_SPEC, PRISMATA, PRISMATA_V2_PACK } from '../src/content/universes/prismata'
import {
  BRAHMALOK_DIRECTIONS,
  BRAHMALOK_MODES,
  brahmalokStatus,
} from '../src/content/universes/f4-runtime'
import { PRISMATA_ARCHIVE_MARKS } from '../src/render/chamber-archive-marks'

const STABLE_KINDLING_IDS = Array.from(
  { length: 18 },
  (_, index) => `u5-kindling-${String(index + 1).padStart(2, '0')}`,
)

test('Brahmalok fully occupies the save-stable u5 slot without renumbering player data', () => {
  assert.equal(BRAHMALOK_SPEC.id, 'prismata')
  assert.equal(BRAHMALOK_SPEC.prefix, 'u5')
  assert.equal(PRISMATA.shortName, 'Brahmalok')
  assert.deepEqual(PRISMATA.generators.map(({ id }) => id), STABLE_KINDLING_IDS)
  assert.equal(PRISMATA.generators.length, 18)
  assert.equal(PRISMATA_V2_PACK.archive.records.length, 12)
  assert.ok(PRISMATA.upgrades.every(({ id }) => id.startsWith('u5-')))
})

test('the public u5 economy and archive are creation-native rather than optical reskins', () => {
  const publicCopy = JSON.stringify({
    name: BRAHMALOK_SPEC.name,
    premise: BRAHMALOK_SPEC.premise,
    kindlings: BRAHMALOK_SPEC.kindlings,
    archives: BRAHMALOK_SPEC.archives,
    doctrines: BRAHMALOK_SPEC.doctrines,
    trials: BRAHMALOK_SPEC.trials,
  })
  assert.doesNotMatch(publicCopy, /prism|spectrum|wavelength|refraction|diffraction|fluorescence/i)
  assert.match(publicCopy, /lotus/i)
  assert.match(publicCopy, /seed/i)
  assert.match(publicCopy, /manuscript/i)
  assert.equal(new Set(BRAHMALOK_SPEC.kindlings.map(({ name }) => name)).size, 18)
  assert.equal(new Set(BRAHMALOK_SPEC.archives.map(({ name }) => name)).size, 12)
})

test('the four-direction mandala is labeled, save-safe, and deterministic', () => {
  assert.deepEqual(BRAHMALOK_DIRECTIONS.map(({ id }) => id), ['seed', 'measure', 'name', 'form'])
  assert.deepEqual(BRAHMALOK_MODES.map(({ id }) => id), ['germination', 'mandala', 'memory', 'proliferation'])
  const legacyState = {
    'u5-recipe': amountFromNumber(5),
    'u5-route-01': amountFromNumber(5),
  }
  const owned = { 'u5-kindling-01': 10 }
  const status = brahmalokStatus(legacyState, owned)
  assert.equal(status.recipe.id, 'proliferation')
  assert.equal(status.routes[0], 3)
  assert.equal(status.bands.length, 4)
  assert.match(status.explanation, /directions/)
})

test('sacred presences remain outside ordinary mechanics and collectible art', () => {
  const mechanics = JSON.stringify({
    currency: BRAHMALOK_SPEC.currency,
    heart: BRAHMALOK_SPEC.heartName,
    kindlings: BRAHMALOK_SPEC.kindlings,
    upgrades: PRISMATA.upgrades,
    archives: BRAHMALOK_SPEC.archives,
    doctrines: BRAHMALOK_SPEC.doctrines,
    omens: BRAHMALOK_SPEC.omens,
  })
  assert.doesNotMatch(mechanics, /\b(?:Brahma|Saraswati)\b/)
  const knowledgeScene = BRAHMALOK_SPEC.story.find(({ title }) => title === 'Knowledge Is a Presence')
  assert.match(knowledgeScene?.text ?? '', /independent sacred presence/)
  assert.match(knowledgeScene?.text ?? '', /not an upgrade, assistant, collectible, or possession/)
  assert.match(BRAHMALOK_SPEC.fatiguePolicy, /no chant, mantra, raga, or sacred instrument performance is simulated/i)
})

test('Brahmalok supplies twelve distinct cabinet marks and no optical world scaffold', () => {
  const marks = PRISMATA_ARCHIVE_MARKS
  assert.equal(marks.length, 12)
  assert.equal(new Set(marks.map(({ diagramPath, accentPath }) => `${diagramPath}|${accentPath}`)).size, 12)
  const world = readFileSync(new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url), 'utf8')
  const panel = readFileSync(new URL('../src/ui/UniverseLawPanel.svelte', import.meta.url), 'utf8')
  assert.match(world, /brahmalok-lotus/)
  assert.match(panel, /Brahmalok creation mandala/)
  assert.doesNotMatch(world, /prismata-world-prism|spectral-ray|detector-screen/)
  assert.doesNotMatch(panel, /refraction chamber|Choose a lens recipe/)
})
