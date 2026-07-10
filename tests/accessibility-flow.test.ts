import assert from 'node:assert/strict'
import test from 'node:test'
import { EMPTY_ANNOUNCEMENT_STATE } from '../src/accessibility/announcements'
import { resolveAccessibilityFlow } from '../src/accessibility/flow'
import type { FocusReturnDescriptor, FocusTargetAvailability } from '../src/accessibility/focus'
import { compareProgressionBoundary } from '../src/experience/reset-comparison'
import { describeResetCardDecision } from '../src/experience/reset-comparison-ui'

const focusReturn: FocusReturnDescriptor = {
  reason: 'boundary-completed',
  preferred: { region: 'heart', entityId: 'last-ember', purpose: 'primary-action' },
  fallbacks: [{ region: 'application', purpose: 'application-start' }],
  preventScroll: true,
}

const availability: FocusTargetAvailability[] = [
  { target: focusReturn.preferred, available: true, disabled: false },
  { target: focusReturn.fallbacks[0], available: true, disabled: false },
]

test('reset confirmation resolves semantic announcement and focus without performing either', () => {
  const decision = describeResetCardDecision(
    compareProgressionBoundary({ boundary: 'epoch-turn' }),
    'confirm',
    focusReturn,
  )
  const flow = resolveAccessibilityFlow({
    announcementState: EMPTY_ANNOUNCEMENT_STATE,
    message: decision.announcement,
    delivery: { politeness: 'polite', dedupeKey: 'reset-decision', minimumIntervalMs: 500 },
    occurredAtMs: 1_000,
    focusReturn: decision.focusReturn,
    focusAvailability: availability,
  })

  assert.equal(flow.announcement?.decision, 'announce')
  assert.equal(flow.announcement?.message?.key, 'announcement.reset-confirm-requested')
  assert.deepEqual(flow.resolvedFocus?.target, focusReturn.preferred)
  assert.equal(flow.resolvedFocus?.preventScroll, true)
})

test('repeated flow announcements use the integrated dedupe policy', () => {
  const decision = describeResetCardDecision(
    compareProgressionBoundary({ boundary: 'epoch-turn' }),
    'cancel',
    focusReturn,
  )
  const first = resolveAccessibilityFlow({
    announcementState: EMPTY_ANNOUNCEMENT_STATE,
    message: decision.announcement,
    delivery: { politeness: 'polite', dedupeKey: 'reset-decision', minimumIntervalMs: 500 },
    occurredAtMs: 1_000,
    focusReturn: null,
    focusAvailability: [],
  })
  const repeated = resolveAccessibilityFlow({
    announcementState: first.nextAnnouncementState,
    message: decision.announcement,
    delivery: { politeness: 'polite', dedupeKey: 'reset-decision', minimumIntervalMs: 500 },
    occurredAtMs: 1_200,
    focusReturn: null,
    focusAvailability: [],
  })
  assert.equal(repeated.announcement?.decision, 'suppress-duplicate')
  assert.equal(repeated.nextAnnouncementState, first.nextAnnouncementState)
})

test('focus resolution falls back independently when announcements are off', () => {
  const flow = resolveAccessibilityFlow({
    announcementState: EMPTY_ANNOUNCEMENT_STATE,
    message: { key: 'announcement.dialog-closed', parameters: {} },
    delivery: { politeness: 'off', dedupeKey: 'dialog', minimumIntervalMs: 0 },
    occurredAtMs: 2_000,
    focusReturn,
    focusAvailability: [
      { target: focusReturn.preferred, available: false, disabled: false },
      { target: focusReturn.fallbacks[0], available: true, disabled: false },
    ],
  })
  assert.equal(flow.announcement?.decision, 'suppress-off')
  assert.deepEqual(flow.resolvedFocus?.target, focusReturn.fallbacks[0])
  assert.equal(flow.resolvedFocus?.usedFallback, true)
})

test('a flow with no semantic effects is a deterministic no-op', () => {
  const flow = resolveAccessibilityFlow({
    announcementState: EMPTY_ANNOUNCEMENT_STATE,
    message: null,
    delivery: null,
    occurredAtMs: 0,
    focusReturn: null,
    focusAvailability: [],
  })
  assert.equal(flow.announcement, null)
  assert.equal(flow.resolvedFocus, null)
  assert.equal(flow.nextAnnouncementState, EMPTY_ANNOUNCEMENT_STATE)
})
