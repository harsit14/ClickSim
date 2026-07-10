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
const MIN_AMOUNT_EXPONENT = -2_147_483_648
const MAX_AMOUNT_EXPONENT = 2_147_483_647
const UNIVERSE_IDS = new Set([
  'emberlight',
  'tidefall',
  'verdance',
  'clockwork',
  'prismata',
  'tempest',
  'canticle',
])
const SOURCE_KINDS = new Set([
  'generator',
  'archive',
  'omen',
  'story',
  'beacon',
  'heart',
  'upgrade',
  'doctrine',
  'trial',
  'epoch',
  'deep',
  'system',
])
const FEEDBACK_KINDS = new Set(Object.keys(SEMANTIC_FEEDBACK_REGISTRY))
const RHYTHM_BANDS = new Set(['miss', 'near', 'on-beat'])
const SKILL_RESULTS = new Set(['success', 'near', 'miss'])
const DISCOVERY_KINDS = new Set(['kindling', 'omen', 'archive', 'echo', 'system'])
const MASTERY_KINDS = new Set(['trial', 'doctrine', 'vessel', 'beacon'])
const EPOCH_BOUNDARIES = new Set(['epoch-turn', 'deep-collapse', 'remembrance', 'crossing'])
const POLITENESS = new Set(['off', 'polite', 'assertive'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function add(
  issues: FeedbackValidationIssue[],
  path: string,
  code: string,
  message: string,
): void {
  issues.push({ path, code, message })
}

function validateStableId(
  value: unknown,
  path: string,
  issues: FeedbackValidationIssue[],
): value is string {
  if (typeof value !== 'string' || !STABLE_ID.test(value)) {
    add(issues, path, 'id.invalid', 'Expected a stable lowercase hyphenated ID.')
    return false
  }
  return true
}

function validateNonEmptyString(
  value: unknown,
  path: string,
  issues: FeedbackValidationIssue[],
): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    add(issues, path, 'string.empty', 'Expected a non-empty string.')
  }
}

function hasAtMostFifteenSignificantDigits(value: number): boolean {
  return Number(value.toPrecision(15)) === value
}

function validateAmount(
  value: unknown,
  path: string,
  issues: FeedbackValidationIssue[],
): void {
  if (!isRecord(value)) {
    add(issues, path, 'amount.not-object', 'Expected a normalized EconomyAmount object.')
    return
  }
  const mantissa = value.mantissa
  const exponent = value.exponent
  if (typeof mantissa !== 'number' || !Number.isFinite(mantissa) || Object.is(mantissa, -0)) {
    add(
      issues,
      `${path}.mantissa`,
      'amount.mantissa-invalid',
      'Mantissa must be finite, nonnegative, and cannot be negative zero.',
    )
  } else {
    if (mantissa === 0) {
      if (exponent !== 0) {
        add(issues, `${path}.exponent`, 'amount.zero-not-canonical', 'Zero must use exponent 0.')
      }
    } else {
      if (mantissa < 1 || mantissa >= 10) {
        add(
          issues,
          `${path}.mantissa`,
          'amount.not-normalized',
          'A nonzero normalized mantissa must satisfy 1 <= mantissa < 10.',
        )
      }
      if (!hasAtMostFifteenSignificantDigits(mantissa)) {
        add(
          issues,
          `${path}.mantissa`,
          'amount.precision-exceeded',
          'Mantissa must contain at most fifteen significant decimal digits.',
        )
      }
    }
  }
  if (
    typeof exponent !== 'number'
    || !Number.isInteger(exponent)
    || Object.is(exponent, -0)
    || exponent < MIN_AMOUNT_EXPONENT
    || exponent > MAX_AMOUNT_EXPONENT
  ) {
    add(
      issues,
      `${path}.exponent`,
      'amount.exponent-invalid',
      'Exponent must be an integer in the signed 32-bit range.',
    )
  }
}

function validateAggregation(
  value: unknown,
  rule: SemanticFeedbackRule | null,
  eventKind: string,
  issues: FeedbackValidationIssue[],
): Record<string, unknown> | null {
  if (!isRecord(value)) {
    add(issues, 'aggregation', 'aggregation.invalid', 'Expected an aggregation record object.')
    return null
  }
  if (rule?.aggregation === 'never') {
    add(
      issues,
      'aggregation',
      'aggregation.forbidden',
      `${eventKind} feedback represents one authored event and cannot be aggregated.`,
    )
  }
  if (typeof value.key !== 'string' || value.key.trim().length === 0) {
    add(issues, 'aggregation.key', 'aggregation.key-empty', 'Aggregation keys must be non-empty and deterministic.')
  }
  if (!Number.isInteger(value.count) || (value.count as number) < 1) {
    add(issues, 'aggregation.count', 'aggregation.count-invalid', 'Aggregation count must be a positive integer.')
  }
  if (!Number.isFinite(value.windowMs) || (value.windowMs as number) < 0) {
    add(
      issues,
      'aggregation.windowMs',
      'aggregation.window-invalid',
      'Aggregation window must be a finite duration greater than or equal to zero.',
    )
  }
  return value
}

function validateAnnouncement(value: unknown, issues: FeedbackValidationIssue[]): void {
  if (!isRecord(value)) {
    add(issues, 'announcement', 'announcement.invalid', 'Expected an announcement specification object.')
    return
  }
  validateNonEmptyString(value.messageKey, 'announcement.messageKey', issues)
  validateNonEmptyString(value.dedupeKey, 'announcement.dedupeKey', issues)
  if (typeof value.politeness !== 'string' || !POLITENESS.has(value.politeness)) {
    add(
      issues,
      'announcement.politeness',
      'announcement.politeness-invalid',
      'Announcement politeness must be off, polite, or assertive.',
    )
  }
  if (!Number.isFinite(value.minimumIntervalMs) || (value.minimumIntervalMs as number) < 0) {
    add(
      issues,
      'announcement.minimumIntervalMs',
      'announcement.interval-invalid',
      'Announcement minimum interval must be finite and nonnegative.',
    )
  }
}

/** Returns actionable semantic errors for untrusted boundary input without throwing. */
export function validateSemanticFeedbackEvent(
  event: unknown,
): readonly FeedbackValidationIssue[] {
  const issues: FeedbackValidationIssue[] = []
  if (!isRecord(event)) {
    return [{ path: 'event', code: 'event.invalid', message: 'Expected a semantic feedback event object.' }]
  }
  validateStableId(event.id, 'id', issues)
  if (!Number.isFinite(event.occurredAtMs) || (event.occurredAtMs as number) < 0) {
    add(
      issues,
      'occurredAtMs',
      'time.invalid',
      'Expected a finite caller-supplied timestamp greater than or equal to zero.',
    )
  }

  let kind: SemanticFeedbackEvent['kind'] | null = null
  let rule: SemanticFeedbackRule | null = null
  if (typeof event.kind !== 'string' || !FEEDBACK_KINDS.has(event.kind)) {
    add(issues, 'kind', 'kind.invalid', `Unknown semantic feedback kind "${String(event.kind)}".`)
  } else {
    kind = event.kind as SemanticFeedbackEvent['kind']
    rule = SEMANTIC_FEEDBACK_REGISTRY[kind]
  }

  const tierIsValid = Number.isInteger(event.tier)
    && (event.tier as number) >= 0
    && (event.tier as number) <= 5
  if (!tierIsValid) {
    add(issues, 'tier', 'tier.invalid', 'Feedback tier must be an integer from 0 through 5.')
  } else if (rule && !rule.allowedTiers.includes(event.tier as FeedbackTier)) {
    add(
      issues,
      'tier',
      'tier.invalid-for-kind',
      `${String(event.kind)} feedback allows tier(s) ${rule.allowedTiers.join(', ')}, received ${String(event.tier)}.`,
    )
  }

  if (!isRecord(event.source)) {
    add(issues, 'source', 'source.invalid', 'Expected a semantic feedback source object.')
  } else {
    if (typeof event.source.universeId !== 'string' || !UNIVERSE_IDS.has(event.source.universeId)) {
      add(issues, 'source.universeId', 'source.universe-invalid', 'Source universe is not one of the seven frozen IDs.')
    }
    if (typeof event.source.kind !== 'string' || !SOURCE_KINDS.has(event.source.kind)) {
      add(issues, 'source.kind', 'source.kind-invalid', 'Source kind is not part of the frozen feedback grammar.')
    }
    validateStableId(event.source.id, 'source.id', issues)
  }

  if (event.audioCue !== undefined) validateStableId(event.audioCue, 'audioCue', issues)
  if (event.announcement !== undefined) validateAnnouncement(event.announcement, issues)
  const aggregation = event.aggregation === undefined
    ? null
    : validateAggregation(event.aggregation, rule, String(event.kind), issues)

  switch (kind) {
    case 'passive':
      validateAmount(event.amount, 'amount', issues)
      break
    case 'touch':
      validateAmount(event.amount, 'amount', issues)
      if (typeof event.critical !== 'boolean') {
        add(issues, 'critical', 'touch.critical-invalid', 'Touch critical must be a boolean.')
      }
      if (event.rhythmBand !== null && (typeof event.rhythmBand !== 'string' || !RHYTHM_BANDS.has(event.rhythmBand))) {
        add(issues, 'rhythmBand', 'touch.rhythm-band-invalid', 'Rhythm band must be miss, near, on-beat, or null.')
      }
      break
    case 'purchase':
      if (!Number.isInteger(event.quantity) || (event.quantity as number) < 1) {
        add(issues, 'quantity', 'purchase.quantity-invalid', 'Purchase quantity must be a positive integer.')
      }
      if (aggregation && aggregation.count !== event.quantity) {
        add(
          issues,
          'aggregation.count',
          'purchase.aggregation-count-mismatch',
          `Aggregation count ${String(aggregation.count)} must equal purchase quantity ${String(event.quantity)}.`,
        )
      }
      validateAmount(event.cost, 'cost', issues)
      validateAmount(event.rateDelta, 'rateDelta', issues)
      break
    case 'skill':
      validateStableId(event.skillId, 'skillId', issues)
      if (typeof event.result !== 'string' || !SKILL_RESULTS.has(event.result)) {
        add(issues, 'result', 'skill.result-invalid', 'Skill result must be success, near, or miss.')
      }
      break
    case 'discovery':
      if (typeof event.discoveryKind !== 'string' || !DISCOVERY_KINDS.has(event.discoveryKind)) {
        add(
          issues,
          'discoveryKind',
          'discovery.kind-invalid',
          'Discovery kind must be kindling, omen, archive, echo, or system.',
        )
      }
      validateStableId(event.discoveredId, 'discoveredId', issues)
      break
    case 'mastery':
      if (typeof event.masteryKind !== 'string' || !MASTERY_KINDS.has(event.masteryKind)) {
        add(
          issues,
          'masteryKind',
          'mastery.kind-invalid',
          'Mastery kind must be trial, doctrine, vessel, or beacon.',
        )
      }
      validateStableId(event.masteredId, 'masteredId', issues)
      break
    case 'epoch':
      if (typeof event.boundary !== 'string' || !EPOCH_BOUNDARIES.has(event.boundary)) {
        add(
          issues,
          'boundary',
          'epoch.boundary-invalid',
          'Epoch boundary must be epoch-turn, deep-collapse, remembrance, or crossing.',
        )
      }
      validateAmount(event.gained, 'gained', issues)
      break
    case null:
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
