import type { GeneratorDef } from '../content/generators'
import type {
  EconomyAmount,
  PurchaseFeedbackEvent,
  UniversePackV2,
} from '../content/universes/types'
import { aggregatePurchaseFeedback } from './purchase-aggregation'

export type OwnershipThreshold = 1 | 10 | 25 | 50 | 100

const OWNERSHIP_THRESHOLDS: readonly OwnershipThreshold[] = [1, 10, 25, 50, 100]

/** Returns the highest authored ownership threshold crossed by one completed purchase. */
export function crossedOwnershipThreshold(
  ownedBefore: number,
  ownedAfter: number,
): OwnershipThreshold | null {
  for (let index = OWNERSHIP_THRESHOLDS.length - 1; index >= 0; index -= 1) {
    const threshold = OWNERSHIP_THRESHOLDS[index]
    if (ownedBefore < threshold && ownedAfter >= threshold) return threshold
  }
  return null
}

export interface CompletedGeneratorPurchaseInput {
  readonly pack: UniversePackV2
  readonly generator: GeneratorDef
  readonly ownedBefore: number
  readonly quantity: number
  readonly totalCost: EconomyAmount
  readonly rateDelta: EconomyAmount
  readonly occurredAtMs: number
}

export interface CompletedGeneratorPurchaseFeedback {
  readonly event: PurchaseFeedbackEvent
  readonly milestoneThreshold: OwnershipThreshold | null
}

/** Builds the shared semantic result for pointer and keyboard generator purchases. */
export function completedGeneratorPurchaseFeedback(
  input: CompletedGeneratorPurchaseInput,
): CompletedGeneratorPurchaseFeedback {
  const milestoneThreshold = crossedOwnershipThreshold(
    input.ownedBefore,
    input.ownedBefore + input.quantity,
  )
  const announcement = input.pack.accessibility.announcements.find(
    ({ messageKey }) => messageKey.endsWith('.announcement.purchase'),
  )
  const [event] = aggregatePurchaseFeedback({
    eventId: `${input.pack.id}-purchase-${input.generator.id}-${Math.floor(input.occurredAtMs)}`,
    occurredAtMs: input.occurredAtMs,
    source: { universeId: input.pack.id, kind: 'generator', id: input.generator.id },
    mode: input.quantity === 1 ? 'one' : input.quantity === 10 ? 'ten' : 'max',
    quantity: input.quantity,
    totalCost: input.totalCost,
    totalRateDelta: input.rateDelta,
    tier: milestoneThreshold === null ? 1 : 2,
    audioCue: input.pack.audio.purchaseIntervalCue,
    ...(announcement ? { announcement } : {}),
  })
  return { event, milestoneThreshold }
}
