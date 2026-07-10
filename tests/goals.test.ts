import assert from 'node:assert/strict'
import test from 'node:test'
import {
  recommendGoals,
  togglePinnedGoal,
  type GoalCandidate,
} from '../src/experience/goals'

function goal(overrides: Partial<GoalCandidate> & Pick<GoalCandidate, 'id'>): GoalCandidate {
  return {
    id: overrides.id,
    labelKey: overrides.labelKey ?? `goal.${overrides.id}`,
    eligibleSlots: overrides.eligibleSlots ?? ['now', 'soon'],
    state: overrides.state ?? 'available',
    meaningful: overrides.meaningful ?? true,
    priority: overrides.priority ?? 0,
    estimate: overrides.estimate ?? {
      estimatedSeconds: 30,
      basis: 'simulation',
      detailKey: 'goal.estimate.production',
    },
    reasonKey: overrides.reasonKey ?? 'goal.reason.useful-action',
    reasonParameters: overrides.reasonParameters,
  }
}

test('Goal Lens deterministically exposes now, soon, and the explicit pin', () => {
  const candidates = [
    goal({ id: 'soon-discovery', eligibleSlots: ['soon'], estimate: { estimatedSeconds: 600, basis: 'simulation', detailKey: 'estimate.discovery' } }),
    goal({ id: 'tie-b', eligibleSlots: ['now'], priority: 2 }),
    goal({ id: 'tie-a', eligibleSlots: ['now'], priority: 2 }),
    goal({ id: 'pinned-ambition', eligibleSlots: [], estimate: { estimatedSeconds: 20_000, basis: 'declared', detailKey: 'estimate.ambition' } }),
  ]

  const first = recommendGoals({ enabled: true, candidates, pinnedGoalId: 'pinned-ambition' })
  const repeated = recommendGoals({ enabled: true, candidates, pinnedGoalId: 'pinned-ambition' })

  assert.deepEqual(repeated, first)
  assert.equal(first.now?.goalId, 'tie-a')
  assert.equal(first.now?.reason, 'reachable-now')
  assert.equal(first.soon?.goalId, 'soon-discovery')
  assert.equal(first.soon?.reason, 'nearest-session-goal')
  assert.equal(first.pinned?.goalId, 'pinned-ambition')
  assert.equal(first.pinned?.reason, 'player-pinned')
  assert.equal(first.pinned?.estimate?.estimatedSeconds, 20_000)
})

test('pinned goals remain distinct from now and soon through deterministic replacement', () => {
  const candidates = [
    goal({ id: 'alpha', estimate: { estimatedSeconds: 0, basis: 'declared', detailKey: 'estimate.ready' } }),
    goal({ id: 'beta', eligibleSlots: ['now'], estimate: { estimatedSeconds: 10, basis: 'simulation', detailKey: 'estimate.action' } }),
    goal({ id: 'gamma', eligibleSlots: ['soon'], estimate: { estimatedSeconds: 300, basis: 'simulation', detailKey: 'estimate.discovery' } }),
  ]

  const withAlphaPinned = recommendGoals({ enabled: true, candidates, pinnedGoalId: 'alpha' })
  assert.deepEqual(
    [withAlphaPinned.now?.goalId, withAlphaPinned.soon?.goalId, withAlphaPinned.pinned?.goalId],
    ['beta', 'gamma', 'alpha'],
  )

  const replacement = togglePinnedGoal('alpha', 'beta')
  assert.equal(replacement, 'beta')
  const withBetaPinned = recommendGoals({ enabled: true, candidates, pinnedGoalId: replacement })
  const repeated = recommendGoals({ enabled: true, candidates, pinnedGoalId: replacement })
  assert.deepEqual(repeated, withBetaPinned)
  assert.deepEqual(
    [withBetaPinned.now?.goalId, withBetaPinned.soon?.goalId, withBetaPinned.pinned?.goalId],
    ['alpha', 'gamma', 'beta'],
  )
})

test('disabled Goal Lens is completely off, including pinned output', () => {
  assert.deepEqual(
    recommendGoals({ enabled: false, candidates: [goal({ id: 'ready' })], pinnedGoalId: 'ready' }),
    { status: 'disabled', now: null, soon: null, pinned: null },
  )
})

test('no eligible action produces an explicit empty result', () => {
  const result = recommendGoals({
    enabled: true,
    candidates: [
      goal({ id: 'complete', state: 'complete' }),
      goal({ id: 'blocked', state: 'blocked' }),
      goal({ id: 'not-meaningful', meaningful: false }),
      goal({ id: 'stalled', estimate: { estimatedSeconds: null, basis: 'unavailable', detailKey: 'estimate.stalled' } }),
    ],
  })

  assert.deepEqual(result, { status: 'empty', now: null, soon: null, pinned: null })
})

test('ready actions and invalid estimate values are handled without hidden time reads', () => {
  const result = recommendGoals({
    enabled: true,
    candidates: [
      goal({ id: 'negative', estimate: { estimatedSeconds: -1, basis: 'simulation', detailKey: 'estimate.invalid' } }),
      goal({ id: 'ready', estimate: { estimatedSeconds: 0, basis: 'declared', detailKey: 'estimate.ready' } }),
    ],
  })

  assert.equal(result.now?.goalId, 'ready')
  assert.equal(result.now?.reason, 'ready-now')
})

test('an explicit pin remains explainable when blocked, complete, or missing', () => {
  const candidates = [
    goal({ id: 'blocked', state: 'blocked' }),
    goal({ id: 'complete', state: 'complete' }),
  ]

  assert.equal(recommendGoals({ enabled: true, candidates, pinnedGoalId: 'blocked' }).pinned?.reason, 'pinned-blocked')
  assert.equal(recommendGoals({ enabled: true, candidates, pinnedGoalId: 'complete' }).pinned?.reason, 'pinned-complete')
  const missing = recommendGoals({ enabled: true, candidates, pinnedGoalId: 'removed-id' }).pinned
  assert.equal(missing?.reason, 'pinned-unavailable')
  assert.equal(missing?.labelKey, null)
})

test('pin toggling is pure and does not imply persistence', () => {
  assert.equal(togglePinnedGoal(null, 'beacon'), 'beacon')
  assert.equal(togglePinnedGoal('beacon', 'beacon'), null)
  assert.equal(togglePinnedGoal('trial', 'beacon'), 'beacon')
})
