export {
  SEMANTIC_FEEDBACK_REGISTRY,
  describeSemanticFeedback,
  validateSemanticFeedbackEvent,
} from './semantic-registry'
export type {
  FeedbackAggregationPolicy,
  FeedbackMagnitude,
  FeedbackMagnitudeKind,
  FeedbackValidationIssue,
  SemanticFeedbackDescription,
  SemanticFeedbackRule,
} from './semantic-registry'

export { aggregatePurchaseFeedback } from './purchase-aggregation'
export type { PurchaseActionMode, PurchaseFeedbackInput } from './purchase-aggregation'
