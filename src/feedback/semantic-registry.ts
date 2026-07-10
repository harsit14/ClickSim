import type {
  EconomyAmount,
  FeedbackTier,
  SemanticFeedbackEvent,
} from '../content/universes/types'

export type FeedbackMagnitudeKind =
  | 'continuous'
  | 'economy'
  | 'purchase-delta'
  | 'skill'
  | 'discovery'
  | 'mastery'
  | 'epoch'

export type FeedbackAggregationPolicy = 'window' | 'single-action' | 'never'

export interface SemanticFeedbackRule {
  readonly allowedTiers: readonly FeedbackTier[]
  readonly magnitude: FeedbackMagnitudeKind
  readonly aggregation: FeedbackAggregationPolicy
}

/**
 * Presentation-independent meaning for every member of the frozen feedback union.
 * Consumers may map these rules to visuals, audio, captions, haptics, or announcements,
 * but the registry itself contains no rendering instructions.
 */
export const SEMANTIC_FEEDBACK_REGISTRY = {
  passive: {
    allowedTiers: [0],
    magnitude: 'continuous',
    aggregation: 'window',
  },
  touch: {
    allowedTiers: [1, 2],
    magnitude: 'economy',
    aggregation: 'window',
  },
  purchase: {
    allowedTiers: [1, 2],
    magnitude: 'purchase-delta',
    aggregation: 'single-action',
  },
  skill: {
    allowedTiers: [2],
    magnitude: 'skill',
    aggregation: 'never',
  },
  discovery: {
    allowedTiers: [3],
    magnitude: 'discovery',
    aggregation: 'never',
  },
  mastery: {
    allowedTiers: [4, 5],
    magnitude: 'mastery',
    aggregation: 'never',
  },
  epoch: {
    allowedTiers: [5],
    magnitude: 'epoch',
    aggregation: 'never',
  },
} as const satisfies Record<SemanticFeedbackEvent['kind'], SemanticFeedbackRule>

export interface FeedbackValidationIssue {
  readonly path: string
  readonly code: string
  readonly message: string
}

export type FeedbackMagnitude =
  | { readonly kind: 'continuous'; readonly amount: EconomyAmount }
  | { readonly kind: 'economy'; readonly amount: EconomyAmount }
  | {
    readonly kind: 'purchase-delta'
    readonly quantity: number
    readonly cost: EconomyAmount
    readonly rateDelta: EconomyAmount
  }
  | { readonly kind: 'skill'; readonly result: 'success' | 'near' | 'miss' }
  | { readonly kind: 'discovery'; readonly discoveredId: string }
  | { readonly kind: 'mastery'; readonly masteredId: string }
  | { readonly kind: 'epoch'; readonly gained: EconomyAmount }

export interface SemanticFeedbackDescription {
  readonly source: SemanticFeedbackEvent['source']
  readonly tier: FeedbackTier
  readonly magnitude: FeedbackMagnitude
  readonly aggregation: SemanticFeedbackEvent['aggregation'] | null
}

const STABLE_ID = /^[a-z0-9][a-z0-9-]{0,63}$/

function isNormalizedAmount(value: EconomyAmount): boolean {
  if (!Number.isFinite(value.mantissa) || !Number.isInteger(value.exponent)) return false
  if (value.mantissa === 0) return value.exponent === 0 && !Object.is(value.mantissa, -0)
  return value.mantissa >= 1 && value.mantissa < 10
}

function validateAmount(
  value: EconomyAmount,
  path: string,
  issues: FeedbackValidationIssue[],
): void {
  if (!isNormalizedAmount(value)) {
    issues.push({
      path,
      code: 'amount.not-normalized',
      message: 'Expected a nonnegative normalized EconomyAmount (zero or 1 <= mantissa < 10).',
    })
  }
}

/** Returns actionable semantic errors without throwing or mutating the event. */
export function validateSemanticFeedbackEvent(
  event: SemanticFeedbackEvent,
): readonly FeedbackValidationIssue[] {
  const issues: FeedbackValidationIssue[] = []
  const rule: SemanticFeedbackRule = SEMANTIC_FEEDBACK_REGISTRY[event.kind]

  if (!STABLE_ID.test(event.id)) {
    issues.push({ path: 'id', code: 'id.invalid', message: 'Expected a stable lowercase hyphenated ID.' })
  }
  if (!Number.isFinite(event.occurredAtMs) || event.occurredAtMs < 0) {
    issues.push({
      path: 'occurredAtMs',
      code: 'time.invalid',
      message: 'Expected a finite caller-supplied timestamp greater than or equal to zero.',
    })
  }
  if (!rule.allowedTiers.includes(event.tier)) {
    issues.push({
      path: 'tier',
      code: 'tier.invalid-for-kind',
      message: `${event.kind} feedback allows tier(s) ${rule.allowedTiers.join(', ')}, received ${event.tier}.`,
    })
  }
  if (!STABLE_ID.test(event.source.id)) {
    issues.push({
      path: 'source.id',
      code: 'source.id-invalid',
      message: 'Expected a stable lowercase hyphenated source ID.',
    })
  }

  if (event.aggregation) {
    if (rule.aggregation === 'never') {
      issues.push({
        path: 'aggregation',
        code: 'aggregation.forbidden',
        message: `${event.kind} feedback represents one authored event and cannot be aggregated.`,
      })
    }
    if (event.aggregation.key.trim().length === 0) {
      issues.push({
        path: 'aggregation.key',
        code: 'aggregation.key-empty',
        message: 'Aggregation keys must be non-empty and deterministic.',
      })
    }
    if (!Number.isInteger(event.aggregation.count) || event.aggregation.count < 1) {
      issues.push({
        path: 'aggregation.count',
        code: 'aggregation.count-invalid',
        message: 'Aggregation count must be a positive integer.',
      })
    }
    if (!Number.isFinite(event.aggregation.windowMs) || event.aggregation.windowMs < 0) {
      issues.push({
        path: 'aggregation.windowMs',
        code: 'aggregation.window-invalid',
        message: 'Aggregation window must be a finite duration greater than or equal to zero.',
      })
    }
  }

  switch (event.kind) {
    case 'passive':
    case 'touch':
      validateAmount(event.amount, 'amount', issues)
      break
    case 'purchase':
      if (!Number.isInteger(event.quantity) || event.quantity < 1) {
        issues.push({
          path: 'quantity',
          code: 'purchase.quantity-invalid',
          message: 'Purchase quantity must be a positive integer.',
        })
      }
      if (event.aggregation && event.aggregation.count !== event.quantity) {
        issues.push({
          path: 'aggregation.count',
          code: 'purchase.aggregation-count-mismatch',
          message: `Aggregation count ${event.aggregation.count} must equal purchase quantity ${event.quantity}.`,
        })
      }
      validateAmount(event.cost, 'cost', issues)
      validateAmount(event.rateDelta, 'rateDelta', issues)
      break
    case 'epoch':
      validateAmount(event.gained, 'gained', issues)
      break
    case 'skill':
    case 'discovery':
    case 'mastery':
      break
  }

  return issues
}

/** Exposes source, tier, magnitude, and aggregation in one exhaustive semantic view. */
export function describeSemanticFeedback(
  event: SemanticFeedbackEvent,
): SemanticFeedbackDescription {
  let magnitude: FeedbackMagnitude
  switch (event.kind) {
    case 'passive':
      magnitude = { kind: 'continuous', amount: event.amount }
      break
    case 'touch':
      magnitude = { kind: 'economy', amount: event.amount }
      break
    case 'purchase':
      magnitude = {
        kind: 'purchase-delta',
        quantity: event.quantity,
        cost: event.cost,
        rateDelta: event.rateDelta,
      }
      break
    case 'skill':
      magnitude = { kind: 'skill', result: event.result }
      break
    case 'discovery':
      magnitude = { kind: 'discovery', discoveredId: event.discoveredId }
      break
    case 'mastery':
      magnitude = { kind: 'mastery', masteredId: event.masteredId }
      break
    case 'epoch':
      magnitude = { kind: 'epoch', gained: event.gained }
      break
  }

  return {
    source: event.source,
    tier: event.tier,
    magnitude,
    aggregation: event.aggregation ?? null,
  }
}
