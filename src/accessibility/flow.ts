import type { AnnouncementSpec } from '../content/universes/types'
import {
  gateAnnouncement,
  type AnnouncementGatePolicy,
  type AnnouncementGateResult,
  type AnnouncementGateState,
  type SemanticMessage,
} from './announcements'
import {
  resolveFocusReturn,
  type FocusReturnDescriptor,
  type FocusTargetAvailability,
  type ResolvedFocusReturn,
} from './focus'

export type AnnouncementDelivery = Pick<
  AnnouncementSpec,
  'politeness' | 'dedupeKey' | 'minimumIntervalMs'
>

export interface AccessibilityFlowInput {
  readonly announcementState: AnnouncementGateState
  readonly message: SemanticMessage | null
  readonly delivery: AnnouncementDelivery | null
  readonly occurredAtMs: number
  readonly focusReturn: FocusReturnDescriptor | null
  readonly focusAvailability: readonly FocusTargetAvailability[]
  readonly announcementPolicy?: AnnouncementGatePolicy
}

export interface AccessibilityFlowResult {
  readonly announcement: AnnouncementGateResult | null
  readonly resolvedFocus: ResolvedFocusReturn | null
  readonly nextAnnouncementState: AnnouncementGateState
}

/** Resolves announcement and focus effects as data; the UI performs neither effect here. */
export function resolveAccessibilityFlow(input: AccessibilityFlowInput): AccessibilityFlowResult {
  const announcement = input.message && input.delivery
    ? gateAnnouncement(
      input.announcementState,
      {
        spec: {
          messageKey: input.message.key,
          ...input.delivery,
        },
        parameters: input.message.parameters,
        occurredAtMs: input.occurredAtMs,
      },
      input.announcementPolicy,
    )
    : null

  return {
    announcement,
    resolvedFocus: input.focusReturn
      ? resolveFocusReturn(input.focusReturn, input.focusAvailability)
      : null,
    nextAnnouncementState: announcement?.nextState ?? input.announcementState,
  }
}
