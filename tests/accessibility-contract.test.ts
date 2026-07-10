import assert from 'node:assert/strict'
import test from 'node:test'
import {
  EMPTY_ANNOUNCEMENT_STATE,
  gateAnnouncement,
  type AnnouncementGatePolicy,
  type AnnouncementRequest,
} from '../src/accessibility/announcements'
import {
  resolveFocusReturn,
  type FocusReturnDescriptor,
  type FocusTargetAvailability,
} from '../src/accessibility/focus'

const policy: AnnouncementGatePolicy = {
  enabled: true,
  dedupeWindowMs: 1_000,
  globalMinimumIntervalMs: 100,
  defaultMinimumIntervalMs: 250,
}

function announcement(
  occurredAtMs: number,
  parameters: AnnouncementRequest['parameters'] = { count: 1 },
  overrides: Partial<AnnouncementRequest['spec']> = {},
): AnnouncementRequest {
  return {
    occurredAtMs,
    parameters,
    spec: {
      messageKey: overrides.messageKey ?? 'announcement.archive-record-found',
      politeness: overrides.politeness ?? 'polite',
      dedupeKey: overrides.dedupeKey ?? 'archive-discovery',
      minimumIntervalMs: overrides.minimumIntervalMs ?? 250,
    },
  }
}

test('announcement requests remain semantic and preserve politeness', () => {
  const result = gateAnnouncement(EMPTY_ANNOUNCEMENT_STATE, announcement(5_000), policy)
  assert.equal(result.decision, 'announce')
  assert.equal(result.politeness, 'polite')
  assert.deepEqual(result.message, {
    key: 'announcement.archive-record-found',
    parameters: { count: 1 },
  })
})

test('identical semantic messages are deduplicated without mutating gate state', () => {
  const first = gateAnnouncement(EMPTY_ANNOUNCEMENT_STATE, announcement(1_000), policy)
  const duplicate = gateAnnouncement(first.nextState, announcement(1_500), policy)
  assert.equal(duplicate.decision, 'suppress-duplicate')
  assert.equal(duplicate.message, null)
  assert.equal(duplicate.nextState, first.nextState)
})

test('changed messages sharing a channel are rate-limited', () => {
  const first = gateAnnouncement(EMPTY_ANNOUNCEMENT_STATE, announcement(1_000), policy)
  const tooFast = gateAnnouncement(first.nextState, announcement(1_100, { count: 2 }), policy)
  assert.equal(tooFast.decision, 'suppress-rate-limit')

  const allowed = gateAnnouncement(first.nextState, announcement(1_250, { count: 2 }), policy)
  assert.equal(allowed.decision, 'announce')
})

test('global limiting applies across dedupe keys and to assertive messages', () => {
  const first = gateAnnouncement(EMPTY_ANNOUNCEMENT_STATE, announcement(1_000), policy)
  const assertive = announcement(1_050, { boundary: 'epoch-turn' }, {
    messageKey: 'announcement.reset-warning',
    politeness: 'assertive',
    dedupeKey: 'reset-warning',
  })
  assert.equal(gateAnnouncement(first.nextState, assertive, policy).decision, 'suppress-rate-limit')
  assert.equal(gateAnnouncement(first.nextState, { ...assertive, occurredAtMs: 1_100 }, policy).decision, 'announce')
})

test('off announcements and a disabled policy produce no message or state update', () => {
  const off = gateAnnouncement(
    EMPTY_ANNOUNCEMENT_STATE,
    announcement(1_000, {}, { politeness: 'off' }),
    policy,
  )
  assert.equal(off.decision, 'suppress-off')
  assert.equal(off.nextState, EMPTY_ANNOUNCEMENT_STATE)

  const disabled = gateAnnouncement(
    EMPTY_ANNOUNCEMENT_STATE,
    announcement(1_000),
    { ...policy, enabled: false },
  )
  assert.equal(disabled.decision, 'suppress-off')
  assert.equal(disabled.message, null)
})

test('non-finite parameters and caller timestamps fail closed', () => {
  assert.equal(
    gateAnnouncement(EMPTY_ANNOUNCEMENT_STATE, announcement(1_000, { count: Number.NaN }), policy).decision,
    'suppress-invalid',
  )
  const first = gateAnnouncement(EMPTY_ANNOUNCEMENT_STATE, announcement(2_000), policy)
  assert.equal(
    gateAnnouncement(first.nextState, announcement(1_999, { count: 2 }), policy).decision,
    'suppress-invalid',
  )
})

test('focus return resolves preferred then ordered fallbacks from semantic descriptors', () => {
  const descriptor: FocusReturnDescriptor = {
    reason: 'dialog-closed',
    preferred: { region: 'shop', entityId: 'spark', purpose: 'invoker' },
    fallbacks: [
      { region: 'shop', purpose: 'heading' },
      { region: 'heart', entityId: 'last-ember', purpose: 'primary-action' },
    ],
    preventScroll: true,
    announcement: { key: 'announcement.reset-preview-closed', parameters: {} },
  }
  const availability: FocusTargetAvailability[] = [
    { target: descriptor.preferred, available: false, disabled: false },
    { target: descriptor.fallbacks[0], available: true, disabled: true },
    { target: descriptor.fallbacks[1], available: true, disabled: false },
  ]

  const resolved = resolveFocusReturn(descriptor, availability)
  assert.deepEqual(resolved?.target, descriptor.fallbacks[1])
  assert.equal(resolved?.usedFallback, true)
  assert.equal(resolved?.preventScroll, true)
  assert.equal(resolved?.announcement?.key, 'announcement.reset-preview-closed')
})

test('focus return yields null when no semantic target is focusable', () => {
  const descriptor: FocusReturnDescriptor = {
    reason: 'flow-cancelled',
    preferred: { region: 'reset-preview', purpose: 'invoker' },
    fallbacks: [{ region: 'application', purpose: 'application-start' }],
    preventScroll: false,
  }
  assert.equal(resolveFocusReturn(descriptor, []), null)
})
