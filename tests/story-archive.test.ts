import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'
import { buildStoryTranscript } from '../src/experience/story-archive'

const universes = [
  {
    id: 'emberlight',
    shortName: 'Emberlight',
    lumen: [
      { id: 'ember-first', text: 'First ember line.' },
      { id: 'ember-second', text: 'Second ember line.' },
      { id: 'ember-unseen', text: 'This line has not happened.' },
    ],
  },
  {
    id: 'tidefall',
    shortName: 'Tidefall',
    lumen: [
      { id: 'tide-first', text: 'First tide line.' },
      { id: 'tide-second', text: 'Second tide line.' },
    ],
  },
]

test('story transcript keeps encountered order and brings the current universe first', () => {
  const transcript = buildStoryTranscript(
    universes,
    'tidefall',
    ['tide-second', 'unknown', 'tide-second', 'tide-first'],
    { emberlight: { seen: ['ember-second', 'ember-first'] } },
  )

  assert.equal(transcript.count, 4)
  assert.deepEqual(transcript.groups.map(({ universeId }) => universeId), ['tidefall', 'emberlight'])
  assert.deepEqual(transcript.groups[0].entries.map(({ id }) => id), ['tide-second', 'tide-first'])
  assert.deepEqual(transcript.groups[1].entries.map(({ id }) => id), ['ember-second', 'ember-first'])
  assert.equal(transcript.latest?.id, 'tide-first')
  assert.equal(transcript.latest?.universeName, 'Tidefall')
  assert.equal(transcript.groups.flatMap(({ entries }) => entries).some(({ id }) => id === 'ember-unseen'), false)
})

test('a parked universe still supplies the latest available transcript when the current journal is empty', () => {
  const transcript = buildStoryTranscript(
    universes,
    'tidefall',
    [],
    { emberlight: { seen: ['ember-first'] } },
  )
  assert.equal(transcript.groups.length, 1)
  assert.equal(transcript.groups[0].current, false)
  assert.equal(transcript.latest?.id, 'ember-first')
})

test('Story Archive UI compiles without accessibility warnings', () => {
  const codexPath = new URL('../src/ui/Codex.svelte', import.meta.url)
  const compiled = compile(readFileSync(codexPath, 'utf8'), {
    filename: codexPath.pathname,
    generate: 'client',
  })
  assert.deepEqual(compiled.warnings, [])

  const appSource = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
  assert.match(appSource, /storyArchiveVisible/)
  assert.match(appSource, /title="Story Archive · E"/)
})
