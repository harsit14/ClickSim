import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import {
  GARDEN_CLOSURES,
  GARDEN_LINKS,
  GARDEN_NODES,
  gardenCredits,
} from '../src/endgame/garden'
import {
  allGardenPresencesTended,
  COMPANION_IDLE_MS,
  companionStillnessComplete,
  HUNGER_HOLD_MS,
  hungerHoldComplete,
  ritualProgress,
  tendGardenPresence,
} from '../src/endgame/garden-ritual'
import {
  DEVOURER_INFALL_ACCOUNT,
  INFALL_RHYME_BEATS,
  QUESTION_INFALL_START_INDEX,
  questionInfallBeat,
} from '../src/content/infall-rhyme'
import { REALM_CONCLUSIONS } from '../src/content/endings'
import { ECHOES } from '../src/content/echoes'
import { LUMEN_LINES } from '../src/content/lumen'
import { EMBERLIGHT_SUPERNOVA_SENSORY_SPEC } from '../src/render/emberlight/supernova'
import {
  LUMEN_COMPLICITY_LINES,
  lumenComplicityLinesFor,
} from '../src/content/lumen-complicity'
import { buildEnglishCatalog } from '../src/localization/catalog'

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8')

test('Phase 7.1 replaces the Garden cards with one full-screen quiet field', () => {
  const hub = read('../src/ui/EndgameHub.svelte')
  const scene = read('../src/ui/GardenScene.svelte')

  assert.deepEqual(compile(scene, { filename: 'GardenScene.svelte', generate: 'client' }).warnings, [])
  assert.match(hub, /class:garden-open=\{tab === 'garden'\}/)
  assert.match(hub, /<GardenScene/)
  assert.match(hub, /\.endgame\.garden-open \{ inset: 0;/)
  assert.doesNotMatch(hub, /class="garden-map"/)
  assert.doesNotMatch(hub, /class="garden-links"/)
  assert.doesNotMatch(scene, /class="[^\"]*card/)
})

test('the Garden has one distinct material presence for every restored world', () => {
  const scene = read('../src/ui/GardenScene.svelte')
  assert.equal(GARDEN_NODES.length, 7)
  assert.equal(new Set(GARDEN_NODES.map(({ universeId }) => universeId)).size, 7)
  assert.equal(GARDEN_LINKS.length, 7)

  for (const universeId of GARDEN_NODES.map(({ universeId }) => universeId)) {
    assert.match(scene, new RegExp(`${universeId}: '[^']+'`), `${universeId} lost its authored material`)
    assert.match(scene, new RegExp(`node\\.universeId === '${universeId}'|presence\\.${universeId}`))
  }
  for (const motif of ['coal', 'pool', 'branch', 'wheel', 'lotus-petal', 'returning-current', 'summit']) {
    assert.match(scene, new RegExp(`class="${motif}`), `${motif} motif is absent`)
  }
})

test('the numberless Garden renders no digit-bearing prose', () => {
  const scene = read('../src/ui/GardenScene.svelte')
  const markup = scene
    .slice(scene.indexOf('</script>') + '</script>'.length, scene.indexOf('<style>'))
    .replace(/<[^>]*>/gs, ' ')
    .replace(/\{[^}]*\}/g, ' ')
  const authoredCopy = [
    ...GARDEN_NODES.flatMap(({ name, offering, question }) => [name, offering, question]),
    ...GARDEN_LINKS.flatMap(({ name, result }) => [name, result]),
    ...GARDEN_CLOSURES.flatMap(({ name, consequence, finalLine }) => [name, consequence, finalLine]),
    ...gardenCredits('continue'),
  ].join(' ')

  assert.doesNotMatch(markup, /\d/)
  assert.doesNotMatch(authoredCopy, /\d/)
  assert.deepEqual(GARDEN_CLOSURES.map(({ name }) => name), ['Boundary', 'Renewal', 'Relation', 'Continue'])
})

test('the Garden keeps relations semantic and becomes still with reduced motion', () => {
  const scene = read('../src/ui/GardenScene.svelte')
  assert.match(scene, /aria-label="Relations among the restored worlds and lokas"/)
  assert.match(scene, /\{link\.name\}: \{link\.characterLabel\}\. \{link\.result\}/)
  assert.match(scene, /data-character=\{characterFor\('shared-sky'\)\}/)
  assert.match(scene, /class:reduced=\{reducedMotion\}/)
  assert.match(scene, /\.reduced \*, :global\(\[data-motion='reduced'\]\) \.garden-scene \* \{ animation: none !important; transition: none !important; \}/)
})

test('Phase 7.2 makes Boundary a complete one-by-one tending ritual', () => {
  const required = GARDEN_NODES.map(({ universeId }) => universeId)
  let tended = required.slice(0, -1)
  assert.equal(allGardenPresencesTended(tended, required), false)
  tended = tendGardenPresence(tended, required.at(-1)!)
  assert.equal(allGardenPresencesTended(tended, required), true)
  assert.strictEqual(tendGardenPresence(tended, required[0]), tended, 'repeat tending should be a no-op')

  const scene = read('../src/ui/GardenScene.svelte')
  assert.match(scene, /Tend \$\{node\.name\}/)
  assert.match(scene, /allGardenPresencesTended/)
  assert.match(scene, /finish\('warden'\)/)
})

test('Renewal requires one uninterrupted bounded hold over fallen matter', () => {
  const started = 10_000
  assert.ok(HUNGER_HOLD_MS >= 6_000)
  assert.equal(hungerHoldComplete(started, started + HUNGER_HOLD_MS - 1), false)
  assert.equal(hungerHoldComplete(started, started + HUNGER_HOLD_MS), true)
  assert.equal(hungerHoldComplete(null, started + HUNGER_HOLD_MS), false)
  assert.equal(ritualProgress(HUNGER_HOLD_MS / 2, HUNGER_HOLD_MS), 0.5)
  assert.equal(ritualProgress(Number.NaN, HUNGER_HOLD_MS), 0)

  const scene = read('../src/ui/GardenScene.svelte')
  assert.match(scene, /onpointerdown=/)
  assert.match(scene, /onpointerup=\{releaseHungerHold\}/)
  assert.match(scene, /onpointercancel=\{releaseHungerHold\}/)
  assert.match(scene, /onkeydown=\{hungerKeyDown\}/)
  assert.match(scene, /releasing begins again/)
  assert.match(scene, /fallen matter/i)
  assert.match(scene, /stated limit/i)
  assert.doesNotMatch(scene, /draw every presence|drawing them inward|chosen to take|last refusal|field is resisting|absorb/i)
  assert.doesNotMatch(scene, /\.hunger-holding \.presence \{[^}]*opacity:/s)
  const renewal = GARDEN_CLOSURES.find(({ id }) => id === 'hunger')!
  assert.match(`${renewal.consequence} ${renewal.finalLine}`, /fallen|soil|limit|future/i)
  assert.doesNotMatch(`${renewal.consequence} ${renewal.finalLine}`, /absorb|consume|devour/i)
})

test('Relation completes only after a full interval with no input', () => {
  const lastInput = 50_000
  assert.ok(COMPANION_IDLE_MS >= 8_000)
  assert.equal(companionStillnessComplete(lastInput, lastInput + COMPANION_IDLE_MS - 1), false)
  assert.equal(companionStillnessComplete(lastInput, lastInput + COMPANION_IDLE_MS), true)
  assert.equal(companionStillnessComplete(null, lastInput + COMPANION_IDLE_MS), false)

  const scene = read('../src/ui/GardenScene.svelte')
  assert.match(scene, /document\.addEventListener\('pointerdown', noteInput, true\)/)
  assert.match(scene, /document\.addEventListener\('keydown', noteInput, true\)/)
  assert.match(scene, /document\.addEventListener\('wheel', noteInput/)
  assert.match(scene, /finish\('companion'\)/)
  assert.match(scene, /Do nothing\./)
})

test('the Garden heading wraps inside narrow layouts', () => {
  const scene = read('../src/ui/GardenScene.svelte')
  assert.match(scene, /\.garden-heading span \{ white-space: normal; overflow-wrap: anywhere;/)
  assert.match(scene, /\.garden-heading \{ top: 5rem; left: 1rem; right: 1rem; transform: none; \}/)
})

test('Phase 7.3 makes Act III use the Supernova infall contract beat for beat', () => {
  assert.deepEqual(INFALL_RHYME_BEATS.map(({ id }) => id), [
    'settlement',
    'suns',
    'constellations',
    'instruments',
  ])
  const supernovaInfall = EMBERLIGHT_SUPERNOVA_SENSORY_SPEC.phases.filter(({ id }) => id.startsWith('infall-'))
  assert.deepEqual(supernovaInfall.map(({ id, startMs, durationMs, visual, shapeCue, caption, reducedMotion }) => ({
    id, startMs, durationMs, visual, shapeCue, caption, reducedMotion,
  })), INFALL_RHYME_BEATS.map((beat) => ({
    id: beat.supernovaPhaseId,
    startMs: beat.startMs,
    durationMs: beat.durationMs,
    visual: beat.visual,
    shapeCue: beat.shapeCue,
    caption: beat.caption,
    reducedMotion: beat.reducedMotion,
  })))
  assert.deepEqual(
    REALM_CONCLUSIONS.emberlight.lines.slice(QUESTION_INFALL_START_INDEX, QUESTION_INFALL_START_INDEX + INFALL_RHYME_BEATS.length),
    INFALL_RHYME_BEATS.map(({ questionLine }) => questionLine),
  )
  INFALL_RHYME_BEATS.forEach((beat, index) => assert.equal(questionInfallBeat(index + QUESTION_INFALL_START_INDEX), beat))
})

test('the final Echo describes every infall image in ceremony order', () => {
  const echo = ECHOES.find(({ id }) => id === 'shape-in-dark')!
  assert.ok(echo.text.includes(DEVOURER_INFALL_ACCOUNT))
  let previous = -1
  for (const { echoSentence } of INFALL_RHYME_BEATS) {
    const position = echo.text.indexOf(echoSentence)
    assert.ok(position > previous, `missing or out-of-order infall sentence: ${echoSentence}`)
    previous = position
  }
  assert.match(echo.text, /bottom-up/)
  assert.match(echo.text, /ecliptic seats/)
  assert.match(echo.text, /outer joints/)
  assert.match(echo.text, /detached from the edges/)
})

test('The Question stages the same timed ribbon and instrument collapse', () => {
  const question = read('../src/ui/TheQuestion.svelte')
  const rhyme = read('../src/ui/QuestionInfallRhyme.svelte')
  assert.deepEqual(compile(rhyme, { filename: 'QuestionInfallRhyme.svelte', generate: 'client' }).warnings, [])
  assert.match(question, /questionInfallBeat\(lineIdx\)/)
  assert.match(question, /<QuestionInfallRhyme beat=\{infallBeat\}/)
  assert.match(rhyme, /1500ms cubic-bezier\(0\.55, 0\.05, 0\.9, 0\.45\)/)
  assert.match(rhyme, /to \{ left: 49%; top: 54%; transform: rotate\(0\) scaleX\(\.08\); opacity: \.1; \}/)
  assert.match(rhyme, /perspective\(700px\) translate3d\(0, 36vh, -500px\) rotateX\(38deg\) rotateZ\(3deg\)/)
  assert.match(rhyme, /prefers-reduced-motion: reduce/)
})

test('Lumen names the confession only on a Remembrance replay after the rhyme is known', () => {
  const line = LUMEN_LINES.find(({ id }) => id === 'act3-infall-rhyme')!
  assert.ok(line)
  assert.match(line.text, /Supernova was not a metaphor.*confession/i)
  const state = (overrides: Record<string, unknown>) => ({
    remembrances: 1,
    supernovae: 1,
    echoes: ['shape-in-dark'],
    ...overrides,
  }) as never
  assert.equal(line.when(state({})), true)
  assert.equal(line.when(state({ remembrances: 0 })), false)
  assert.equal(line.when(state({ supernovae: 0 })), false)
  assert.equal(line.when(state({ echoes: [] })), false)
})

test('Phase 7.4 adds eight complicity admissions across Act III and Act VII', () => {
  assert.equal(LUMEN_COMPLICITY_LINES.length, 8)
  assert.deepEqual(LUMEN_COMPLICITY_LINES.map(({ id }) => id), [
    'act3-lumen-kept-column',
    'act3-lumen-unwoken',
    'act3-lumen-selected-witness',
    'act3-lumen-answer-debt',
    'act7-lumen-inevitable',
    'act7-lumen-storm-beacon',
    'act7-lumen-curation-rest',
    'act7-lumen-seven',
  ])
  assert.deepEqual(LUMEN_COMPLICITY_LINES.map(({ act }) => act), [
    'III', 'III', 'III', 'III', 'VII', 'VII', 'VII', 'VII',
  ])
  for (const line of LUMEN_COMPLICITY_LINES) {
    assert.match(line.text, /\bI\b|\bmine\b|\bmy\b/i, `${line.id} shifted agency away from Lumen`)
    assert.match(line.text, /decided|chose|selected|arranged|kept|left|called|wrote/i, `${line.id} lacks an authored choice`)
  }
  const finalAdmission = LUMEN_COMPLICITY_LINES.find(({ id }) => id === 'act7-lumen-seven')?.text ?? ''
  assert.match(finalAdmission, /discovered the loka traces.*older than my archive/i)
  assert.match(finalAdmission, /without pretending I authored the places/i)
  assert.doesNotMatch(finalAdmission, /I (?:made|created|authored|ordered) (?:the )?(?:three )?lokas/i)
})

test('the complicity arc orders itself within each parked universe run', () => {
  const state = (overrides: Record<string, unknown> = {}) => ({
    seen: [],
    collapses: 1,
    echoes: ['inventory', 'shape-in-dark'],
    owned: { ember2: 1 },
    ending: 'warden',
    supernovae: 1,
    beacons: ['vishnulok', 'kailash'],
    ...overrides,
  }) as never
  const ember = lumenComplicityLinesFor('emberlight')
  const vishnulok = lumenComplicityLinesFor('vishnulok')
  const kailash = lumenComplicityLinesFor('kailash')
  assert.deepEqual([ember.length, vishnulok.length, kailash.length], [4, 2, 2])
  assert.deepEqual(lumenComplicityLinesFor('clockwork'), [])

  assert.equal(ember[0].when(state()), true)
  assert.equal(ember[1].when(state()), false)
  assert.equal(ember[1].when(state({ seen: [ember[0].id] })), true)
  assert.equal(ember[2].when(state({ seen: [ember[1].id, 'act3-hook'] })), true)
  assert.equal(ember[3].when(state({ seen: [ember[2].id], ending: null })), false)
  assert.equal(ember[3].when(state({ seen: [ember[2].id] })), true)

  assert.equal(vishnulok[0].when(state({ ending: null })), false)
  assert.equal(vishnulok[0].when(state()), true)
  assert.equal(vishnulok[1].when(state({ seen: [] })), false)
  assert.equal(vishnulok[1].when(state({ seen: [vishnulok[0].id] })), true)
  assert.equal(kailash[0].when(state()), true)
  assert.equal(kailash[1].when(state({ seen: [] })), false)
  assert.equal(kailash[1].when(state({ seen: [kailash[0].id] })), true)
})

test('the Act III gate takes priority, then complicity lines, without replacing universe arcs', () => {
  const ticker = read('../src/ui/LumenTicker.svelte')
  assert.match(ticker, /const localQuestionSeen = universeLines[\s\S]*candidate\.unlocksQuestion && game\.seen\.includes\(candidate\.id\)/)
  assert.match(ticker, /const storyGate = universeLines[\s\S]*candidate\.unlocksQuestion && !localQuestionSeen/)
  assert.match(ticker, /line\.unlocksQuestion[\s\S]*game\.seen\.push\('act3-hook'\)/)
  assert.match(ticker, /const sagaLine = sagaLumenLinesFor\(universeId\)/)
  assert.match(ticker, /const metaLine = lumenComplicityLinesFor\(universeId\)/)
  assert.match(ticker, /const line = storyGate\s*\?\? sagaLine\s*\?\? metaLine\s*\?\? universeLines\.find/)
  assert.match(ticker, /act\[237\]\|saga-/)

  const catalog = buildEnglishCatalog()
  for (const line of LUMEN_COMPLICITY_LINES) {
    assert.equal(catalog[`lumen.complicity.${line.id}`], line.text)
  }
})
