import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import {
  FIRST_EPOCH_APPROACH_RATIO,
  STARDUST_PIVOT,
} from '../src/content/economy-balance'
import { FIRST_EPOCH_HANDOFF_SEEN_ID } from '../src/content/experience-markers'
import { LUMEN_LINES } from '../src/content/lumen'
import { createDevScenario } from '../src/core/dev-scenarios'
import { amountFromNumber } from '../src/core/numeric/amount'
import { migrateAndSanitizeSave, serializeSaveDataV23 } from '../src/core/save-data'
import { buildFirstEpochCeremony } from '../src/experience/first-epoch'

const target = amountFromNumber(STARDUST_PIVOT)

function ceremony(overrides: Partial<Parameters<typeof buildFirstEpochCeremony>[0]> = {}) {
  return buildFirstEpochCeremony({
    universeId: 'emberlight',
    remembrances: 0,
    epochTurns: 0,
    currentEraEarnings: amountFromNumber(STARDUST_PIVOT * FIRST_EPOCH_APPROACH_RATIO),
    firstEpochTarget: target,
    epochReady: false,
    comparisonSeen: false,
    ...overrides,
  })
}

test('the first-Epoch lens arrives at seventy percent and advances through three explicit steps', () => {
  assert.equal(ceremony({ currentEraEarnings: amountFromNumber(STARDUST_PIVOT * 0.699) }).visible, false)

  const prepare = ceremony()
  assert.equal(prepare.visible, true)
  assert.equal(prepare.stage, 'prepare')
  assert.equal(prepare.actionLabel, 'Open the Observatory')
  assert.deepEqual(prepare.steps.map(({ id, status }) => [id, status]), [
    ['prepare', 'current'],
    ['compare', 'upcoming'],
    ['collapse', 'upcoming'],
  ])

  const compare = ceremony({ epochReady: true })
  assert.equal(compare.stage, 'compare')
  assert.equal(compare.actionLabel, 'Prepare the comparison')

  const collapse = ceremony({ epochReady: true, comparisonSeen: true })
  assert.equal(collapse.stage, 'collapse')
  assert.equal(collapse.actionLabel, 'Review and collapse')
  assert.deepEqual(collapse.steps.map(({ status }) => status), ['complete', 'complete', 'current'])
})

test('the first-Epoch lens is one-time and never repeats for later realms or Remembrance', () => {
  assert.equal(ceremony({ epochTurns: 1 }).visible, false)
  assert.equal(ceremony({ remembrances: 1 }).visible, false)
  assert.equal(ceremony({ universeId: 'tidefall' }).visible, false)
})

test('the post-Epoch handoff acknowledgement survives save sanitization', () => {
  const scenario = createDevScenario('ember-postnova')
  assert.ok(scenario)

  const serialized = serializeSaveDataV23(scenario)
  const clean = migrateAndSanitizeSave({
    ...serialized,
    seen: [...scenario.seen, FIRST_EPOCH_HANDOFF_SEEN_ID, 'forged-onboarding-marker'],
  })

  assert.ok(clean)
  assert.ok(clean.seen.includes(FIRST_EPOCH_HANDOFF_SEEN_ID))
  assert.equal(clean.seen.includes('forged-onboarding-marker'), false)
})

test('Lumen names the reset fear once at the same seventy-percent boundary', () => {
  const line = LUMEN_LINES.find(({ id }) => id === 'first-epoch-reassurance')
  assert.ok(line)
  assert.equal(line.text, 'You can end this sky and keep the dust. Ending is not failure.')

  const state = (eraRatio: number, overrides: Record<string, unknown> = {}) => ({
    eraEarned: amountFromNumber(STARDUST_PIVOT * eraRatio),
    remembrances: 0,
    supernovae: 0,
    ...overrides,
  }) as never
  assert.equal(line.when(state(0.699)), false)
  assert.equal(line.when(state(0.7)), true)
  assert.equal(line.when(state(1, { supernovae: 1 })), false)
  assert.equal(line.when(state(1, { remembrances: 1 })), false)
})

test('the ceremony lens and post-Epoch handoff compile accessibly and are wired into App', () => {
  for (const filename of ['FirstEpochLens.svelte', 'FirstEpochHandoff.svelte']) {
    const path = new URL(`../src/ui/${filename}`, import.meta.url)
    const source = readFileSync(path, 'utf8')
    assert.deepEqual(compile(source, { filename: path.pathname, generate: 'client' }).warnings, [])
  }

  const lens = readFileSync(new URL('../src/ui/FirstEpochLens.svelte', import.meta.url), 'utf8')
  const handoff = readFileSync(new URL('../src/ui/FirstEpochHandoff.svelte', import.meta.url), 'utf8')
  const app = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
  const observatory = readFileSync(new URL('../src/ui/Observatory.svelte', import.meta.url), 'utf8')

  assert.match(lens, /<strong>\{step\.label\}<\/strong>/)
  assert.match(lens, /aria-current=\{step\.status === 'current' \? 'step' : undefined\}/)
  assert.match(handoff, /What grew[\s\S]*What stayed[\s\S]*Buy first/)
  assert.match(handoff, /role="dialog"[\s\S]*aria-modal="true"/)
  assert.match(handoff, /containModalKeydown/)
  assert.match(app, /firstEpochCeremony\.visible \|\| goalLensEnabled \|\| promptState\.enabled|goalLensEnabled \|\| promptState\.enabled \|\| firstEpochCeremony\.visible/)
  assert.match(app, /resumesFirstEpochHandoff = game\.activeUniverse === 'emberlight'/)
  assert.match(app, /firstEpochHandoffOpen = \$state\(resumesFirstEpochHandoff\)/)
  assert.match(app, /observatoryInitialNodeId = 'forge-1'/)
  assert.match(observatory, /selectedId = \$state<string \| null>\(null\)/)
  assert.match(observatory, /selectedId === null && initialNodeId/)
})
