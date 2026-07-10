import type { SemanticFeedbackEvent } from '../content/universes/types'
import { validateSemanticFeedbackEvent } from './semantic-registry'

export interface FeedbackConsumer {
  readonly id: string
  readonly consume: (event: SemanticFeedbackEvent) => void
}

export interface FeedbackDispatchReceipt {
  readonly eventId: string
  readonly consumerId: string
  readonly delivered: boolean
  readonly error?: string
}

export interface FeedbackDispatchResult {
  /** Every accepted event is retained in original order and by original reference. */
  readonly events: readonly SemanticFeedbackEvent[]
  readonly receipts: readonly FeedbackDispatchReceipt[]
}

function assertConsumers(consumers: readonly FeedbackConsumer[]): void {
  const ids = new Set<string>()
  for (const consumer of consumers) {
    if (consumer.id.trim().length === 0) throw new TypeError('Feedback consumer ID cannot be empty.')
    if (ids.has(consumer.id)) throw new TypeError(`Duplicate feedback consumer ID "${consumer.id}".`)
    ids.add(consumer.id)
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Validates the complete batch before delivery, then fans every event to every consumer.
 * A failing consumer is isolated and cannot consume or erase another consumer's delivery.
 */
export function dispatchSemanticFeedback(
  events: readonly SemanticFeedbackEvent[],
  consumers: readonly FeedbackConsumer[],
): FeedbackDispatchResult {
  assertConsumers(consumers)
  events.forEach((event, index) => {
    const issues = validateSemanticFeedbackEvent(event)
    if (issues.length > 0) {
      const detail = issues.map((entry) => `${entry.path}: ${entry.message}`).join('\n')
      throw new TypeError(`Invalid semantic feedback event at index ${index}:\n${detail}`)
    }
  })

  const receipts: FeedbackDispatchReceipt[] = []
  for (const event of events) {
    for (const consumer of consumers) {
      try {
        consumer.consume(event)
        receipts.push({ eventId: event.id, consumerId: consumer.id, delivered: true })
      } catch (error) {
        receipts.push({
          eventId: event.id,
          consumerId: consumer.id,
          delivered: false,
          error: errorMessage(error),
        })
      }
    }
  }
  return { events: [...events], receipts }
}
