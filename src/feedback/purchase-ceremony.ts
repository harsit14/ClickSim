import type {
  EconomyAmount,
  PurchaseFeedbackEvent,
} from '../content/universes/types'
import { validateSemanticFeedbackEvent } from './semantic-registry'

export type PurchaseCeremonyDestination =
  | { readonly kind: 'world-object'; readonly id: string }
  | { readonly kind: 'semantic-region'; readonly id: string }
  | { readonly kind: 'none'; readonly reason: string }

export type PurchaseCeremonyPhaseKind =
  | 'price-contract'
  | 'destination-emphasis'
  | 'world-transition'
  | 'rate-delta'
  | 'next-signal'

export interface PurchaseCeremonyPhase {
  readonly kind: PurchaseCeremonyPhaseKind
  readonly startsAtMs: number
  readonly endsAtMs: number
  readonly intensity: number
  readonly presentation: 'authored-motion' | 'crossfade' | 'local-pulse'
}

export interface PurchaseCeremonyPlan {
  readonly ceremonyId: string
  readonly event: PurchaseFeedbackEvent
  readonly destination: PurchaseCeremonyDestination
  readonly startsAtMs: number
  readonly endsAtMs: number
  readonly intensity: number
  readonly quantitySignal: number
  readonly rateDeltaSignal: number
  readonly exactCost: EconomyAmount
  readonly exactRateDelta: EconomyAmount
  readonly phases: readonly PurchaseCeremonyPhase[]
}

export interface PurchaseCeremonyOptions {
  readonly destination: PurchaseCeremonyDestination
  readonly reducedMotion: boolean
  readonly quality: 'high' | 'balanced' | 'low'
}

export interface PurchaseCeremonyTimelineState {
  readonly nextAvailableAtMs: number
  readonly sequence: number
}

export interface ScheduledPurchaseCeremony {
  readonly ceremony: PurchaseCeremonyPlan
  readonly nextState: PurchaseCeremonyTimelineState
}

export interface PurchaseCeremonyBatchResult {
  readonly ceremonies: readonly PurchaseCeremonyPlan[]
  readonly nextState: PurchaseCeremonyTimelineState
}

const STABLE_ID = /^[a-z0-9][a-z0-9-]{0,63}$/
const PHASES = [
  ['price-contract', 0.14, 0.65],
  ['destination-emphasis', 0.18, 0.8],
  ['world-transition', 0.35, 1],
  ['rate-delta', 0.18, 0.85],
  ['next-signal', 0.15, 0.55],
] as const satisfies readonly [PurchaseCeremonyPhaseKind, number, number][]

export const INITIAL_PURCHASE_CEREMONY_TIMELINE: PurchaseCeremonyTimelineState = {
  nextAvailableAtMs: 0,
  sequence: 0,
}

function clampUnit(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function saturatingSignal(value: number): number {
  return value / (1 + Math.abs(value))
}

/** Presentation-only order signal; it does not add, spend, or recalculate economy. */
export function economyAmountPresentationSignal(amount: EconomyAmount): number {
  if (amount.mantissa === 0) return 0
  const order = amount.exponent + Math.log10(amount.mantissa)
  return clampUnit(0.5 + saturatingSignal(order) * 0.5)
}

export function purchaseCeremonyMagnitude(event: PurchaseFeedbackEvent): {
  readonly intensity: number
  readonly quantitySignal: number
  readonly rateDeltaSignal: number
} {
  const quantityOrder = Math.log10(event.quantity + 1)
  const quantitySignal = clampUnit(saturatingSignal(quantityOrder))
  const rateDeltaSignal = economyAmountPresentationSignal(event.rateDelta)
  const intensity = clampUnit(
    0.2
      + quantitySignal * 0.35
      + rateDeltaSignal * 0.35
      + (event.tier / 5) * 0.1,
  )
  return { intensity, quantitySignal, rateDeltaSignal }
}

function validateDestination(destination: PurchaseCeremonyDestination): void {
  if (destination.kind === 'none') {
    if (destination.reason.trim().length === 0) {
      throw new TypeError('A destination-free purchase ceremony requires an authored reason.')
    }
    return
  }
  if (!STABLE_ID.test(destination.id)) {
    throw new TypeError(`Purchase ceremony destination ID "${destination.id}" is invalid.`)
  }
}

function presentationFor(options: PurchaseCeremonyOptions): PurchaseCeremonyPhase['presentation'] {
  if (options.reducedMotion) return 'crossfade'
  if (options.quality === 'low') return 'local-pulse'
  return 'authored-motion'
}

function buildPhases(
  startsAtMs: number,
  durationMs: number,
  intensity: number,
  presentation: PurchaseCeremonyPhase['presentation'],
): readonly PurchaseCeremonyPhase[] {
  const phases: PurchaseCeremonyPhase[] = []
  let cursor = startsAtMs
  PHASES.forEach(([kind, share, phaseIntensity], index) => {
    const final = index === PHASES.length - 1
    const endsAtMs = final
      ? startsAtMs + durationMs
      : cursor + Math.round(durationMs * share)
    phases.push({
      kind,
      startsAtMs: cursor,
      endsAtMs,
      intensity: clampUnit(intensity * phaseIntensity),
      presentation,
    })
    cursor = endsAtMs
  })
  return phases
}

function assertPurchaseEvent(event: PurchaseFeedbackEvent): void {
  const issues = validateSemanticFeedbackEvent(event)
  if (issues.length > 0 || event.kind !== 'purchase') {
    const detail = issues.map((entry) => `${entry.path}: ${entry.message}`).join('\n')
    throw new TypeError(`Invalid purchase ceremony event${detail ? `:\n${detail}` : '.'}`)
  }
}

/** Builds one proportional, sub-second ceremony from one already-aggregated event. */
export function createPurchaseCeremony(
  event: PurchaseFeedbackEvent,
  startsAtMs: number,
  sequence: number,
  options: PurchaseCeremonyOptions,
): PurchaseCeremonyPlan {
  assertPurchaseEvent(event)
  validateDestination(options.destination)
  if (!Number.isFinite(startsAtMs) || startsAtMs < 0 || !Number.isSafeInteger(sequence) || sequence < 0) {
    throw new RangeError('Ceremony start and sequence must be finite nonnegative values.')
  }

  const magnitude = purchaseCeremonyMagnitude(event)
  const durationMs = 620 + Math.round(magnitude.intensity * 300)
  const endsAtMs = startsAtMs + durationMs
  return {
    ceremonyId: `${event.id}-ceremony-${sequence}`,
    event,
    destination: options.destination,
    startsAtMs,
    endsAtMs,
    ...magnitude,
    exactCost: event.cost,
    exactRateDelta: event.rateDelta,
    phases: buildPhases(
      startsAtMs,
      durationMs,
      magnitude.intensity,
      presentationFor(options),
    ),
  }
}

/** Queues ceremonies without overlap while leaving the semantic event timestamp intact. */
export function schedulePurchaseCeremony(
  event: PurchaseFeedbackEvent,
  state: PurchaseCeremonyTimelineState,
  options: PurchaseCeremonyOptions,
): ScheduledPurchaseCeremony {
  if (
    !Number.isFinite(state.nextAvailableAtMs)
    || state.nextAvailableAtMs < 0
    || !Number.isSafeInteger(state.sequence)
    || state.sequence < 0
  ) {
    throw new RangeError('Purchase ceremony timeline state is invalid.')
  }
  const startsAtMs = Math.max(event.occurredAtMs, state.nextAvailableAtMs)
  const ceremony = createPurchaseCeremony(event, startsAtMs, state.sequence, options)
  return {
    ceremony,
    nextState: {
      nextAvailableAtMs: ceremony.endsAtMs,
      sequence: state.sequence + 1,
    },
  }
}

export function schedulePurchaseCeremonyBatch(
  events: readonly PurchaseFeedbackEvent[],
  state: PurchaseCeremonyTimelineState,
  optionsFor: (event: PurchaseFeedbackEvent) => PurchaseCeremonyOptions,
): PurchaseCeremonyBatchResult {
  const ceremonies: PurchaseCeremonyPlan[] = []
  let nextState = state
  for (const event of events) {
    const scheduled = schedulePurchaseCeremony(event, nextState, optionsFor(event))
    ceremonies.push(scheduled.ceremony)
    nextState = scheduled.nextState
  }
  return { ceremonies, nextState }
}
