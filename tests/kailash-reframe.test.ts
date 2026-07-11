import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { amountFromNumber } from '../src/core/numeric/amount'
import { CANTICLE, CANTICLE_V2_PACK, KAILASH_SPEC } from '../src/content/universes/canticle'
import { KAILASH_ACTS, KAILASH_CYCLES, canticleStatus } from '../src/content/universes/f4-runtime'
import { CANTICLE_ARCHIVE_MARKS } from '../src/render/chamber-archive-marks'

const STABLE_KINDLING_IDS = Array.from(
  { length: 18 },
  (_, index) => `u7-kindling-${String(index + 1).padStart(2, '0')}`,
)

test('Kailash fully occupies the save-stable u7 slot without renumbering player data', () => {
  assert.equal(KAILASH_SPEC.id, 'canticle')
  assert.equal(KAILASH_SPEC.prefix, 'u7')
  assert.equal(CANTICLE.shortName, 'Kailash')
  assert.deepEqual(CANTICLE.generators.map(({ id }) => id), STABLE_KINDLING_IDS)
  assert.equal(CANTICLE.generators.length, 18)
  assert.equal(CANTICLE_V2_PACK.archive.records.length, 12)
  assert.ok(CANTICLE.upgrades.every(({ id }) => id.startsWith('u7-')))
})

test('the public u7 economy and archive are mountain-native rather than musical reskins', () => {
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
    'u7-measure': amountFromNumber(99),
    'u7-slot-01': amountFromNumber(99),
  }
  const status = canticleStatus(legacyState, {}, 0)
  assert.equal(status.measure.id, 'open-ring')
  assert.equal(status.slots[0], 'grace')
  assert.match(status.explanation, /composition bonus.*continuous cycle total/)
})

test('sacred presences and attributes remain outside ordinary mechanics and collectible art', () => {
  const mechanics = JSON.stringify({
    currency: KAILASH_SPEC.currency,
    heart: KAILASH_SPEC.heartName,
    kindlings: KAILASH_SPEC.kindlings,
    upgrades: CANTICLE.upgrades,
    archives: KAILASH_SPEC.archives,
    doctrines: KAILASH_SPEC.doctrines,
    omens: KAILASH_SPEC.omens,
  })
  assert.doesNotMatch(mechanics, /\b(?:Shiva|Parvati|Ganga|Nandi|damaru|linga|trishula)\b/i)
  assert.match(KAILASH_SPEC.story.find(({ title }) => title === 'Parvati’s Independent Presence')?.text ?? '', /independent sacred presence/)
  assert.match(KAILASH_SPEC.story.find(({ title }) => title === 'Shiva Beyond the Instrument')?.text ?? '', /sacred presence whose meanings exceed/)
  assert.match(KAILASH_SPEC.fatiguePolicy, /no mantra, raga, temple ceremony, sacred bell, conch, or damaru simulation/i)
})

test('Kailash supplies twelve distinct Cabinet marks and no Canticle world scaffold', () => {
  assert.equal(CANTICLE_ARCHIVE_MARKS.length, 12)
  assert.equal(new Set(CANTICLE_ARCHIVE_MARKS.map(({ diagramPath, accentPath }) => `${diagramPath}|${accentPath}`)).size, 12)
  const world = readFileSync(new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url), 'utf8')
  const panel = readFileSync(new URL('../src/ui/UniverseLawPanel.svelte', import.meta.url), 'utf8')
  assert.match(world, /kailash-range range-near/)
  assert.match(panel, /Kailash Still Point cycle/)
  assert.doesNotMatch(world, /canticle-plate|canticle-nodal|canticle-wave/)
  assert.doesNotMatch(panel, /RESONANCE SCORE|orbital-measure|nodal-figure/)
})

test('Kailash Release is consent-gated and cancels cleanly on input release', () => {
  const card = readFileSync(new URL('../src/ui/ResetComparisonCard.svelte', import.meta.url), 'utf8')
  assert.match(card, /isKailashRelease/)
  assert.match(card, /universeId === 'canticle'/)
  assert.match(card, /release at any time to cancel/i)
  assert.match(card, /onpointerup=\{releaseHold\}/)
  assert.match(card, /onpointercancel=\{releaseHold\}/)
  assert.match(card, /onholdcancel/)
})
