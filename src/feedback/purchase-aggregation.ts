import type {
  AnnouncementSpec,
  AudioCueId,
  EconomyAmount,
  FeedbackSource,
  PurchaseFeedbackEvent,
} from '../content/universes/types'

export type PurchaseActionMode = 'one' | 'ten' | 'max'

export interface PurchaseFeedbackInput {
  readonly eventId: string
  readonly occurredAtMs: number
  readonly source: FeedbackSource
  readonly mode: PurchaseActionMode
  /** Completed quantity. The economy remains the sole owner of affordability and totals. */
  readonly quantity: number
  readonly totalCost: EconomyAmount
  readonly totalRateDelta: EconomyAmount
  readonly tier?: 1 | 2
  readonly audioCue?: AudioCueId
  readonly announcement?: AnnouncementSpec
}

const PURCHASE_SOURCE_KINDS = new Set(['generator', 'upgrade', 'doctrine', 'archive'])

function assertPurchaseInput(input: PurchaseFeedbackInput): void {
  if (!PURCHASE_SOURCE_KINDS.has(input.source.kind)) {
    throw new RangeError(`Purchase feedback cannot use source kind "${input.source.kind}".`)
  }
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    throw new RangeError('Purchase feedback quantity must be a positive integer.')
  }
  if (input.mode === 'one' && input.quantity !== 1) {
    throw new RangeError(`The one-purchase mode requires quantity 1, received ${input.quantity}.`)
  }
  if (input.mode === 'ten' && input.quantity !== 10) {
    throw new RangeError(`The ten-purchase mode requires quantity 10, received ${input.quantity}.`)
  }
}

function aggregationKey(input: PurchaseFeedbackInput): string {
  const { universeId, kind, id } = input.source
  return `purchase:${universeId}:${kind}:${id}:${input.mode}`
}

/**
 * Converts one completed economy action into exactly one semantic purchase event.
 * The caller supplies already-computed totals; this helper never calculates production.
 */
export function aggregatePurchaseFeedback(
  input: PurchaseFeedbackInput,
): readonly [PurchaseFeedbackEvent] {
  assertPurchaseInput(input)

  const event: PurchaseFeedbackEvent = {
    id: input.eventId,
    occurredAtMs: input.occurredAtMs,
    kind: 'purchase',
    tier: input.tier ?? 1,
    source: input.source,
    quantity: input.quantity,
    cost: input.totalCost,
    rateDelta: input.totalRateDelta,
    ...(input.mode === 'one'
      ? {}
      : {
        aggregation: {
          key: aggregationKey(input),
          count: input.quantity,
          windowMs: 0,
        },
      }),
    ...(input.audioCue ? { audioCue: input.audioCue } : {}),
    ...(input.announcement ? { announcement: input.announcement } : {}),
  }

  return [event]
}
