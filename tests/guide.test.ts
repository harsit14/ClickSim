import assert from 'node:assert/strict'
import test from 'node:test'
import { GUIDE_CHAPTERS } from '../src/content/guide'

const REQUIRED_CHAPTERS = [
  'awakening',
  'economy',
  'active-play',
  'universes',
  'cabinet',
  'supernova',
  'deep',
  'trials',
  'multiverse',
  'story',
  'legacy',
  'progress',
  'saves-controls',
]

function chapterText(): string {
  return GUIDE_CHAPTERS.flatMap((chapter) => [
    chapter.nav,
    chapter.title,
    chapter.summary,
    ...chapter.keywords,
    ...chapter.blocks.flatMap((block) => [
      block.heading,
      ...block.paragraphs,
      ...(block.bullets ?? []),
      block.note ?? '',
    ]),
  ]).join(' ').toLowerCase()
}

test('Field Guide has one complete, uniquely-addressable chapter per major system', () => {
  assert.deepEqual(GUIDE_CHAPTERS.map((chapter) => chapter.id), REQUIRED_CHAPTERS)
  assert.equal(new Set(GUIDE_CHAPTERS.map((chapter) => chapter.id)).size, GUIDE_CHAPTERS.length)

  for (const chapter of GUIDE_CHAPTERS) {
    assert.ok(chapter.nav.trim(), `${chapter.id} needs a navigation label`)
    assert.ok(chapter.title.trim(), `${chapter.id} needs a title`)
    assert.ok(chapter.summary.trim(), `${chapter.id} needs a summary`)
    assert.ok(chapter.keywords.length >= 4, `${chapter.id} needs useful search keywords`)
    assert.ok(chapter.blocks.length > 0, `${chapter.id} needs explanatory content`)
    for (const block of chapter.blocks) {
      assert.ok(block.heading.trim(), `${chapter.id} has an unnamed block`)
      assert.ok(
        block.paragraphs.length > 0 || (block.bullets?.length ?? 0) > 0,
        `${chapter.id}/${block.heading} has no guidance`,
      )
    }
  }
})

test('Field Guide prose covers every progression layer and safety concept', () => {
  const corpus = chapterText()
  for (const concept of [
    'kindling',
    'critical',
    'rhythm',
    'power-up',
    'tidefall',
    'cabinet',
    'supernova',
    'stardust',
    'deep collapse',
    'singularities',
    'trials',
    'resonance atlas',
    'vessel',
    'beacon',
    'dark between',
    'wayfinder',
    'remembrance',
    'radiance',
    'offline',
    'export',
    'reduced-motion',
  ]) {
    assert.ok(corpus.includes(concept), `missing guide concept: ${concept}`)
  }
})
