import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { amountFromNumber } from '../src/core/numeric/amount'
import { BRAHMALOK_SPEC, BRAHMALOK, BRAHMALOK_V2_PACK } from '../src/content/universes/brahmalok'
import {
  BRAHMALOK_DIRECTIONS,
  BRAHMALOK_MODES,
  brahmalokStatus,
} from '../src/content/universes/f4-runtime'
import { BRAHMALOK_ARCHIVE_MARKS } from '../src/render/chamber-archive-marks'

const STABLE_KINDLING_IDS = Array.from(
  { length: 18 },
  (_, index) => `brahmalok-kindling-${String(index + 1).padStart(2, '0')}`,
)

test('Brahmalok fully occupies the save-stable brahmalok slot without renumbering player data', () => {
  assert.equal(BRAHMALOK_SPEC.id, 'brahmalok')
  assert.equal(BRAHMALOK_SPEC.prefix, 'brahmalok')
  assert.equal(BRAHMALOK.shortName, 'Brahmalok')
  assert.deepEqual(BRAHMALOK.generators.map(({ id }) => id), STABLE_KINDLING_IDS)
  assert.equal(BRAHMALOK.generators.length, 18)
  assert.equal(BRAHMALOK_V2_PACK.archive.records.length, 12)
  assert.ok(BRAHMALOK.upgrades.every(({ id }) => id.startsWith('brahmalok-')))
})

test('the public brahmalok economy and archive are creation-native rather than optical reskins', () => {
  const publicCopy = JSON.stringify({
    name: BRAHMALOK_SPEC.name,
    premise: BRAHMALOK_SPEC.premise,
    kindlings: BRAHMALOK_SPEC.kindlings,
    archives: BRAHMALOK_SPEC.archives,
    doctrines: BRAHMALOK_SPEC.doctrines,
    trials: BRAHMALOK_SPEC.trials,
  })
  assert.doesNotMatch(publicCopy, /prism|spectrum|wavelength|refraction|diffraction|manuscriptMemory/i)
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
    'brahmalok-mode': amountFromNumber(5),
    'brahmalok-route-01': amountFromNumber(5),
  }
  const owned = { 'brahmalok-kindling-01': 10 }
  const status = brahmalokStatus(legacyState, owned)
  assert.equal(status.mode.id, 'proliferation')
  assert.equal(status.routes[0], 3)
  assert.equal(status.directions.length, 4)
  assert.match(status.explanation, /directions/)
})

test('sacred presences remain outside ordinary mechanics and collectible art', () => {
  const mechanics = JSON.stringify({
    currency: BRAHMALOK_SPEC.currency,
    heart: BRAHMALOK_SPEC.heartName,
    kindlings: BRAHMALOK_SPEC.kindlings,
    upgrades: BRAHMALOK.upgrades,
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
  const marks = BRAHMALOK_ARCHIVE_MARKS
  assert.equal(marks.length, 12)
  assert.equal(new Set(marks.map(({ diagramPath, accentPath }) => `${diagramPath}|${accentPath}`)).size, 12)
  const world = readFileSync(new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url), 'utf8')
  const panel = readFileSync(new URL('../src/ui/UniverseLawPanel.svelte', import.meta.url), 'utf8')
  assert.match(world, /brahmalok-lotus/)
  assert.match(panel, /Brahmalok creation mandala/)
  assert.doesNotMatch(world, /brahmalok-world-prism|spectral-ray|detector-screen/)
  assert.doesNotMatch(panel, /refraction chamber|Choose a lens mode/)
})
