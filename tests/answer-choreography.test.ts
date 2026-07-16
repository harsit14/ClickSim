import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import { REALM_ANSWER_IDS } from '../src/content/endings'
import {
  ANSWER_CHOREOGRAPHIES,
  ANSWER_CHOREOGRAPHY_EVENT,
  answerChoreographyCue,
} from '../src/render/answer-choreography'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('all twenty-one answers own a distinct composition and motion fingerprint', () => {
  assert.deepEqual(Object.keys(ANSWER_CHOREOGRAPHIES), REALM_ANSWER_IDS)

  const motifs = new Set<string>()
  const compositions = new Set<string>()
  const geometry = new Set<string>()
  const rhythms = new Set<string>()
  const timings = new Set<string>()
  const audioCues = new Set<string>()

  for (const answerId of REALM_ANSWER_IDS) {
    const spec = ANSWER_CHOREOGRAPHIES[answerId]
    assert.equal(spec.answerId, answerId)
    assert.ok(spec.ariaDescription.length > 24, `${answerId}: accessible tableau description`)
    assert.ok(spec.paths.some(({ role }) => role === 'primary'), `${answerId}: primary silhouette`)
    assert.ok(
      spec.paths.some(({ role }) => role === 'accent')
        || spec.circles.some(({ role }) => role === 'accent'),
      `${answerId}: choreography accent`,
    )

    motifs.add(spec.motif)
    compositions.add(spec.composition)
    rhythms.add(spec.motion.rhythm)
    timings.add(`${spec.motion.drawMs}|${spec.motion.loopMs}|${spec.motion.staggerMs}`)
    audioCues.add(spec.audioCue)
    geometry.add(JSON.stringify({ paths: spec.paths, circles: spec.circles }))

    assert.equal(spec.audioCue, `answer.${answerId}.resolve`)
    assert.deepEqual(answerChoreographyCue(answerId, 'resolve'), {
      answerId,
      universeId: spec.universeId,
      motif: spec.motif,
      rhythm: spec.motion.rhythm,
      phase: 'resolve',
      audioCue: spec.audioCue,
    })
  }

  for (const [label, values] of [
    ['motifs', motifs],
    ['compositions', compositions],
    ['geometry fingerprints', geometry],
    ['motion rhythms', rhythms],
    ['motion timings', timings],
    ['audio cues', audioCues],
  ] as const) {
    assert.equal(values.size, 21, `${label} must be answer-specific`)
  }
  assert.equal(ANSWER_CHOREOGRAPHY_EVENT, 'clicksim:answer-choreography')
})

test('the code-native renderer preserves semantic geometry across presentation modes', () => {
  const art = read('../src/ui/AnswerChoreography.svelte')
  const question = read('../src/ui/TheQuestion.svelte')
  const app = read('../src/App.svelte')

  for (const spec of Object.values(ANSWER_CHOREOGRAPHIES)) {
    assert.match(art, new RegExp(`data-rhythm='${spec.motion.rhythm}'`))
  }

  assert.match(art, /data-answer-art=\{answerId\}/)
  assert.match(art, /data-motif=\{spec\.motif\}/)
  assert.match(art, /aria-label=\{decorative \? undefined : spec\.ariaDescription\}/)
  assert.match(art, /html\[data-visual-quality='low'\][\s\S]*secondary-group/)
  assert.match(art, /--answer-arrive:\$\{Math\.round\(spec\.motion\.drawMs \* 0\.62\)\}ms/)
  assert.match(art, /\.vector-group \{[\s\S]*transform-box: fill-box;[\s\S]*transform-origin: center;/)
  assert.match(art, /prefers-reduced-motion: reduce/)
  assert.match(art, /html\[data-motion='reduced'\]/)
  assert.match(art, /animation: none !important/)
  assert.doesNotMatch(art, /<canvas|<img|background-image:\s*url/)

  assert.match(question, /<AnswerChoreography[\s\S]*phase="preview"/)
  assert.match(question, /<AnswerChoreography[\s\S]*phase="resolve"[\s\S]*decorative=\{false\}/)
  assert.match(question, /new CustomEvent\(ANSWER_CHOREOGRAPHY_EVENT[\s\S]*cancelable: true/)
  assert.match(question, /data-answer-id=\{chosenId\}/)
  assert.match(question, /renderQuality === 'low'/)
  assert.match(app, /dataset\.visualQuality = effectiveQuality/)
  assert.match(app, /renderQuality=\{effectiveQuality\}/)

  assert.deepEqual(
    compile(art, { filename: 'AnswerChoreography.svelte', generate: 'client' }).warnings,
    [],
  )
  assert.deepEqual(
    compile(question, { filename: 'TheQuestion.svelte', generate: 'client' }).warnings,
    [],
  )
})
