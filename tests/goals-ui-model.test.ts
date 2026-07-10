import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import {
  buildGoalLensUiModel,
  nextGoalPin,
} from '../src/experience/goal-lens-ui'
import type { GoalCandidate, GoalLensInput } from '../src/experience/goals'
import {
  buildResetComparisonCardModel,
  describeResetCardDecision,
} from '../src/experience/reset-comparison-ui'
import { compareProgressionBoundary } from '../src/experience/reset-comparison'
import type { FocusReturnDescriptor } from '../src/accessibility/focus'

function candidate(id: string, eligibleSlots: GoalCandidate['eligibleSlots'], seconds: number): GoalCandidate {
  return {
    id,
    labelKey: `goal.${id}`,
    eligibleSlots,
    state: 'available',
    meaningful: true,
    priority: 1,
    estimate: { estimatedSeconds: seconds, basis: 'simulation', detailKey: 'goal.estimate.simulated' },
    reasonKey: 'goal.reason.useful',
  }
}

const goals: GoalLensInput = {
  enabled: true,
  candidates: [
    candidate('generator', ['now'], 20),
    candidate('discovery', ['soon'], 600),
    candidate('beacon', [], 8_000),
  ],
  pinnedGoalId: 'beacon',
}

test('Goal Lens UI model exposes stable now, soon, and pinned slots', () => {
  const model = buildGoalLensUiModel({ goals, presentationMode: 'standard' })
  assert.equal(model.visibility, 'expanded')
  assert.deepEqual(
    model.slots.map(({ id, recommendation }) => [id, recommendation?.goalId]),
    [['now', 'generator'], ['soon', 'discovery'], ['pinned', 'beacon']],
  )
})

test('Goal Lens fully hides when off or minimalist and collapses during active rhythm', () => {
  const disabled = buildGoalLensUiModel({
    goals: { ...goals, enabled: false },
    presentationMode: 'standard',
  })
  assert.equal(disabled.visibility, 'hidden')
  assert.equal(disabled.hiddenReason, 'feature-off')
  assert.equal(disabled.result.status, 'disabled')

  const minimalist = buildGoalLensUiModel({ goals, presentationMode: 'minimalist' })
  assert.equal(minimalist.visibility, 'hidden')
  assert.equal(minimalist.hiddenReason, 'minimalist')

  const activeRhythm = buildGoalLensUiModel({ goals, presentationMode: 'active-rhythm' })
  assert.equal(activeRhythm.visibility, 'collapsed')
  assert.equal(activeRhythm.result.now?.goalId, 'generator')
})

test('Goal Lens stays absent until it has a meaningful recommendation', () => {
  const empty = buildGoalLensUiModel({
    goals: { enabled: true, candidates: [] },
    presentationMode: 'standard',
  })
  assert.equal(empty.result.status, 'empty')
  assert.equal(empty.visibility, 'hidden')
  assert.equal(empty.hiddenReason, 'no-recommendation')
})

test('Goal Lens pin changes remain explicit caller-owned values', () => {
  assert.equal(nextGoalPin(null, 'beacon'), 'beacon')
  assert.equal(nextGoalPin('beacon', 'beacon'), null)
  assert.equal(nextGoalPin('trial', 'beacon'), 'beacon')
})

test('reset card model preserves exact impact categories and caller recovery inputs', () => {
  const comparison = compareProgressionBoundary({
    boundary: 'epoch-turn',
    recovery: {
      currentFrontierRate: '3.4e15',
      postBoundaryStartingRate: '2.1e12',
      projectedRecoveredRate: '1.18e16',
      estimatedRecoveryMs: 240_000,
      basis: 'simulation',
      detailKey: 'recovery.route.simulated',
    },
  })
  const card = buildResetComparisonCardModel(comparison)
  const lost = card.sections.find(({ id }) => id === 'lost')
  const retained = card.sections.find(({ id }) => id === 'retained')
  assert.deepEqual(lost?.items, comparison.lost)
  assert.deepEqual(retained?.items, comparison.retained)
  assert.deepEqual(lost?.groups.map(({ scope, items }) => [scope, items.length]), [
    ['world', 6],
  ])
  assert.deepEqual(retained?.groups.map(({ scope, items }) => [scope, items.length]), [
    ['epoch', 4],
    ['deep-history', 13],
    ['between', 13],
  ])
  assert.deepEqual(card.recovery.inputs, comparison.recovery.inputs)
  assert.equal(card.requiresExplicitConfirmation, true)
})

test('reset confirm and cancel callbacks carry explicit semantic focus plans', () => {
  const comparison = compareProgressionBoundary({ boundary: 'deep-collapse' })
  const confirmFocus: FocusReturnDescriptor = {
    reason: 'boundary-completed',
    preferred: { region: 'heart', entityId: 'last-ember', purpose: 'primary-action' },
    fallbacks: [{ region: 'application', purpose: 'application-start' }],
    preventScroll: true,
  }
  const cancelFocus: FocusReturnDescriptor = {
    reason: 'dialog-closed',
    preferred: { region: 'reset-preview', entityId: 'deep-collapse', purpose: 'invoker' },
    fallbacks: [{ region: 'heart', entityId: 'last-ember', purpose: 'primary-action' }],
    preventScroll: true,
  }

  const confirmed = describeResetCardDecision(comparison, 'confirm', confirmFocus)
  const cancelled = describeResetCardDecision(comparison, 'cancel', cancelFocus)
  assert.equal(confirmed.action, 'confirm')
  assert.equal(confirmed.focusReturn, confirmFocus)
  assert.equal(confirmed.announcement.key, 'announcement.reset-confirm-requested')
  assert.equal(cancelled.action, 'cancel')
  assert.equal(cancelled.focusReturn, cancelFocus)
  assert.equal(cancelled.announcement.key, 'announcement.reset-cancelled')
})

test('new F1b components compile with no accessibility compiler warnings', () => {
  for (const filename of ['GoalLens.svelte', 'ContextualPrompts.svelte', 'ResetComparisonCard.svelte']) {
    const path = new URL(`../src/ui/${filename}`, import.meta.url)
    const compiled = compile(readFileSync(path, 'utf8'), { filename: path.pathname, generate: 'client' })
    assert.deepEqual(compiled.warnings, [], `${filename} emitted compiler warnings`)
  }
})

test('optional guidance is off until the player enables it from Settings', () => {
  const appSource = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
  const optionsSource = readFileSync(new URL('../src/ui/OptionsPanel.svelte', import.meta.url), 'utf8')

  assert.match(appSource, /let goalLensEnabled = \$state\(false\)/)
  assert.match(appSource, /promptState = \$state<ContextualPromptState>\(\{ enabled: false, dismissedIds: \[\] \}\)/)
  assert.match(appSource, /goalLensEnabled \|\| promptState\.enabled/)
  assert.match(optionsSource, /goalLensEnabled = false/)
  assert.match(optionsSource, /promptsEnabled = false/)
  assert.match(optionsSource, /Opt in to next-useful/)
  assert.match(optionsSource, /These never appear automatically/)
})
