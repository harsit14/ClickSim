import type { AnnouncementSpec } from '../content/universes/types'

export type SemanticMessageParameter = string | number | boolean | null

export interface SemanticMessage {
  readonly key: string
  readonly parameters: Readonly<Record<string, SemanticMessageParameter>>
}

export interface AnnouncementRequest {
  /** Uses the frozen universe announcement shape; no rendered sentence is stored here. */
  readonly spec: AnnouncementSpec
  readonly parameters: Readonly<Record<string, SemanticMessageParameter>>
  readonly occurredAtMs: number
}

export interface AnnouncementReceipt {
  readonly acceptedAtMs: number
  readonly fingerprint: string
}

export interface AnnouncementGateState {
  readonly lastAcceptedAtMs: number | null
  readonly lastAcceptedByKey: Readonly<Record<string, AnnouncementReceipt>>
}

export interface AnnouncementGatePolicy {
  readonly enabled: boolean
  readonly dedupeWindowMs: number
  readonly globalMinimumIntervalMs: number
  readonly defaultMinimumIntervalMs: number
}

export type AnnouncementDecision =
  | 'announce'
  | 'suppress-off'
  | 'suppress-duplicate'
  | 'suppress-rate-limit'
  | 'suppress-invalid'

export interface AnnouncementGateResult {
  readonly decision: AnnouncementDecision
  readonly message: SemanticMessage | null
  readonly politeness: AnnouncementSpec['politeness']
  readonly nextState: AnnouncementGateState
}

export const EMPTY_ANNOUNCEMENT_STATE: AnnouncementGateState = {
  lastAcceptedAtMs: null,
  lastAcceptedByKey: {},
}

export const DEFAULT_ANNOUNCEMENT_POLICY: AnnouncementGatePolicy = {
  enabled: true,
  dedupeWindowMs: 1_000,
  globalMinimumIntervalMs: 150,
  defaultMinimumIntervalMs: 500,
}

function validDuration(value: number, fallback: number): number {
  return Number.isFinite(value) && value >= 0 ? value : fallback
}

function parametersAreValid(parameters: Readonly<Record<string, SemanticMessageParameter>>): boolean {
  return Object.values(parameters).every((value) => typeof value !== 'number' || Number.isFinite(value))
}

function messageFingerprint(messageKey: string, parameters: Readonly<Record<string, SemanticMessageParameter>>): string {
  const ordered = Object.keys(parameters)
    .sort()
    .map((key) => [key, parameters[key]] as const)
  return JSON.stringify([messageKey, ordered])
}

function suppressed(
  decision: Exclude<AnnouncementDecision, 'announce'>,
  request: AnnouncementRequest,
  state: AnnouncementGateState,
): AnnouncementGateResult {
  return {
    decision,
    message: null,
    politeness: request.spec.politeness,
    nextState: state,
  }
}

/**
 * Applies semantic-message dedupe and rate limits without touching a live region or clock.
 * Assertive requests use the same limits so urgency cannot become announcement spam.
 */
export function gateAnnouncement(
  state: AnnouncementGateState,
  request: AnnouncementRequest,
  policy: AnnouncementGatePolicy = DEFAULT_ANNOUNCEMENT_POLICY,
): AnnouncementGateResult {
  if (!policy.enabled || request.spec.politeness === 'off') {
    return suppressed('suppress-off', request, state)
  }
  if (
    !request.spec.messageKey
    || !request.spec.dedupeKey
    || !Number.isFinite(request.occurredAtMs)
    || request.occurredAtMs < 0
    || !parametersAreValid(request.parameters)
  ) {
    return suppressed('suppress-invalid', request, state)
  }

  const message: SemanticMessage = {
    key: request.spec.messageKey,
    parameters: request.parameters,
  }
  const fingerprint = messageFingerprint(message.key, message.parameters)
  const previousForKey = state.lastAcceptedByKey[request.spec.dedupeKey]

  if (previousForKey) {
    if (!Number.isFinite(previousForKey.acceptedAtMs) || previousForKey.acceptedAtMs < 0) {
      return suppressed('suppress-invalid', request, state)
    }
    const elapsedForKey = request.occurredAtMs - previousForKey.acceptedAtMs
    if (elapsedForKey < 0) return suppressed('suppress-invalid', request, state)

    const dedupeWindow = validDuration(policy.dedupeWindowMs, DEFAULT_ANNOUNCEMENT_POLICY.dedupeWindowMs)
    if (previousForKey.fingerprint === fingerprint && elapsedForKey < dedupeWindow) {
      return suppressed('suppress-duplicate', request, state)
    }

    const requestInterval = validDuration(
      request.spec.minimumIntervalMs,
      DEFAULT_ANNOUNCEMENT_POLICY.defaultMinimumIntervalMs,
    )
    const minimumInterval = Math.max(
      validDuration(policy.defaultMinimumIntervalMs, DEFAULT_ANNOUNCEMENT_POLICY.defaultMinimumIntervalMs),
      requestInterval,
    )
    if (elapsedForKey < minimumInterval) {
      return suppressed('suppress-rate-limit', request, state)
    }
  }

  if (state.lastAcceptedAtMs !== null) {
    if (!Number.isFinite(state.lastAcceptedAtMs) || state.lastAcceptedAtMs < 0) {
      return suppressed('suppress-invalid', request, state)
    }
    const elapsedGlobally = request.occurredAtMs - state.lastAcceptedAtMs
    if (elapsedGlobally < 0) return suppressed('suppress-invalid', request, state)
    const globalInterval = validDuration(
      policy.globalMinimumIntervalMs,
      DEFAULT_ANNOUNCEMENT_POLICY.globalMinimumIntervalMs,
    )
    if (elapsedGlobally < globalInterval) {
      return suppressed('suppress-rate-limit', request, state)
    }
  }

  return {
    decision: 'announce',
    message,
    politeness: request.spec.politeness,
    nextState: {
      lastAcceptedAtMs: request.occurredAtMs,
      lastAcceptedByKey: {
        ...state.lastAcceptedByKey,
        [request.spec.dedupeKey]: {
          acceptedAtMs: request.occurredAtMs,
          fingerprint,
        },
      },
    },
  }
}
