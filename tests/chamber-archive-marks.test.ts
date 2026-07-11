import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'
import { universeById, V2_UNIVERSE_BY_ID } from '../src/content/universes'
import {
  CANTICLE_ARCHIVE_MARKS,
  CHAMBER_ARCHIVE_MARKS,
  CHAMBER_ARCHIVE_MARK_BY_ID,
  PRISMATA_ARCHIVE_MARKS,
  TEMPEST_ARCHIVE_MARKS,
  VERDANCE_ARCHIVE_MARKS,
} from '../src/render/chamber-archive-marks'

const componentUrl = new URL('../src/ui/ArchiveRecordArt.svelte', import.meta.url)
const componentSource = readFileSync(componentUrl, 'utf8')

test('each revisited chamber world owns twelve unique native Archive marks', () => {
  const sets = [
    ['verdance', VERDANCE_ARCHIVE_MARKS],
    ['prismata', PRISMATA_ARCHIVE_MARKS],
    ['tempest', TEMPEST_ARCHIVE_MARKS],
    ['canticle', CANTICLE_ARCHIVE_MARKS],
  ] as const

  for (const [universeId, marks] of sets) {
    const cabinetIds = universeById(universeId).cabinet.items.map(({ id }) => id)
    const recordIds = V2_UNIVERSE_BY_ID.get(universeId)!.archive.records.map(({ id }) => id)
    assert.equal(marks.length, 12)
    assert.deepEqual(marks.map(({ id }) => id), cabinetIds)
    assert.deepEqual(marks.map(({ id }) => id), recordIds)
    assert.ok(marks.every((mark) => mark.universeId === universeId))
    assert.equal(new Set(marks.map(({ diagramPath }) => diagramPath)).size, 12)
    assert.equal(new Set(marks.map(({ label }) => label)).size, 12)
    assert.deepEqual([...new Set(marks.map(({ family }) => family))].length, 3)
    assert.deepEqual([...new Set(marks.map(({ family }) => family))].map((family) => (
      marks.filter((mark) => mark.family === family).length
    )), [4, 4, 4])
  }
})

test('the chamber Archive registry is complete and collision-free', () => {
  assert.equal(CHAMBER_ARCHIVE_MARKS.length, 48)
  assert.equal(CHAMBER_ARCHIVE_MARK_BY_ID.size, 48)
  assert.equal(new Set(CHAMBER_ARCHIVE_MARKS.map(({ id }) => id)).size, 48)
  assert.ok(CHAMBER_ARCHIVE_MARKS.every(({ framePath, diagramPath, accentPath }) => (
    framePath.startsWith('M') && diagramPath.startsWith('M') && accentPath.startsWith('M')
  )))
})

test('ArchiveRecordArt uses native plates before the celestial fallback', () => {
  assert.match(componentSource, /CHAMBER_ARCHIVE_MARK_BY_ID/)
  assert.match(componentSource, /else if chamberMark[\s\S]*class="chamber-frame"[\s\S]*class="chamber-diagram"[\s\S]*class="chamber-accent"[\s\S]*\{:else\}/)
  for (const universeId of ['verdance', 'prismata', 'tempest', 'canticle']) {
    assert.match(componentSource, new RegExp(`data-native-universe='${universeId}'`))
  }
  assert.deepEqual(compile(componentSource, { filename: componentUrl.pathname, generate: 'client' }).warnings, [])
})
