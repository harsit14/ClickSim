import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { amountFromNumber } from '../src/core/numeric/amount'
import { KAILASH, KAILASH_V2_PACK, KAILASH_SPEC } from '../src/content/universes/kailash'
import { KAILASH_ACTS, KAILASH_CYCLES, kailashStatus } from '../src/content/universes/f4-runtime'
import { KAILASH_ARCHIVE_MARKS } from '../src/render/chamber-archive-marks'

const STABLE_KINDLING_IDS = Array.from(
  { length: 18 },
  (_, index) => `kailash-kindling-${String(index + 1).padStart(2, '0')}`,
)

test('Kailash fully occupies the save-stable kailash slot without renumbering player data', () => {
  assert.equal(KAILASH_SPEC.id, 'kailash')
  assert.equal(KAILASH_SPEC.prefix, 'kailash')
  assert.equal(KAILASH.shortName, 'Kailash')
  assert.deepEqual(KAILASH.generators.map(({ id }) => id), STABLE_KINDLING_IDS)
  assert.equal(KAILASH.generators.length, 18)
  assert.equal(KAILASH_V2_PACK.archive.records.length, 12)
  assert.ok(KAILASH.upgrades.every(({ id }) => id.startsWith('kailash-')))
})

test('the public kailash economy and archive are mountain-native rather than musical reskins', () => {
  const publicCopy = JSON.stringify({
    name: KAILASH_SPEC.name,
    premise: KAILASH_SPEC.premise,
    kindlings: KAILASH_SPEC.kindlings,
    archives: KAILASH_SPEC.archives,
    doctrines: KAILASH_SPEC.doctrines,
    trials: KAILASH_SPEC.trials,
  })
  assert.doesNotMatch(publicCopy, /choir|chord|conductor|harmony|overtone|refrain|resonant|cathedral|chladni/i)
  assert.match(publicCopy, /mountain|summit/i)
  assert.match(publicCopy, /refuge|shelter/i)
  assert.match(publicCopy, /release|ending/i)
  assert.equal(new Set(KAILASH_SPEC.kindlings.map(({ name }) => name)).size, 18)
  assert.equal(new Set(KAILASH_SPEC.archives.map(({ name }) => name)).size, 12)
})

test('the Still Point sequence remains labeled, save-safe, and deterministic', () => {
  assert.deepEqual(KAILASH_ACTS, ['emergence', 'shelter', 'release', 'rest', 'veil', 'grace'])
  assert.deepEqual(KAILASH_CYCLES.map(({ id }) => id), ['mountain-cycle', 'refuge-cycle', 'river-cycle', 'open-ring'])
  assert.ok(KAILASH_CYCLES.every(({ slots }) => slots.length === 16))
  const legacyState = {
    'kailash-cycle': amountFromNumber(99),
    'kailash-slot-01': amountFromNumber(99),
  }
  const status = kailashStatus(legacyState, {}, 0)
  assert.equal(status.cycle.id, 'open-ring')
  assert.equal(status.slots[0], 'grace')
  assert.match(status.explanation, /composition bonus.*continuous cycle total/)
})

test('sacred presences and attributes remain outside ordinary mechanics and collectible art', () => {
  const mechanics = JSON.stringify({
    currency: KAILASH_SPEC.currency,
    heart: KAILASH_SPEC.heartName,
    kindlings: KAILASH_SPEC.kindlings,
    upgrades: KAILASH.upgrades,
    archives: KAILASH_SPEC.archives,
    doctrines: KAILASH_SPEC.doctrines,
    omens: KAILASH_SPEC.omens,
  })
  assert.doesNotMatch(mechanics, /\b(?:Shiva|Parvati|Ganga|Nandi|damaru|linga|trishula)\b/i)
  assert.match(KAILASH_SPEC.story.find(({ title }) => title === 'Parvati’s Independent Presence')?.text ?? '', /independent sacred presence/)
  assert.match(KAILASH_SPEC.story.find(({ title }) => title === 'Shiva Beyond the Instrument')?.text ?? '', /sacred presence whose meanings exceed/)
  assert.match(KAILASH_SPEC.fatiguePolicy, /no mantra, raga, temple ceremony, sacred bell, conch, or damaru simulation/i)
})

test('Kailash supplies twelve distinct Cabinet marks and no Kailash world scaffold', () => {
  assert.equal(KAILASH_ARCHIVE_MARKS.length, 12)
  assert.equal(new Set(KAILASH_ARCHIVE_MARKS.map(({ diagramPath, accentPath }) => `${diagramPath}|${accentPath}`)).size, 12)
  const world = readFileSync(new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url), 'utf8')
  const panel = readFileSync(new URL('../src/ui/UniverseLawPanel.svelte', import.meta.url), 'utf8')
  assert.match(world, /kailash-range range-near/)
  assert.match(panel, /Kailash Still Point cycle/)
  assert.doesNotMatch(world, /kailash-plate|kailash-nodal|kailash-wave/)
  assert.doesNotMatch(panel, /RESONANCE SCORE|orbital-measure|nodal-figure/)
})

test('Kailash Release uses the same inspect-then-click confirmation as every universe', () => {
  const card = readFileSync(new URL('../src/ui/ResetComparisonCard.svelte', import.meta.url), 'utf8')
  assert.match(card, /onclick=\{\(\) => decide\('confirm'\)\}/)
  assert.match(card, /onclick=\{\(\) => decide\('cancel'\)\}/)
  assert.doesNotMatch(card, /isKailashRelease|releaseHold|onholdcancel/)
})
