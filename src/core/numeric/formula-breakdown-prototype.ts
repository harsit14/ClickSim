/**
 * NUM-001 proposal-only data model for formula inspection.
 *
 * The model is a serializable explanation tree, not an arithmetic engine and
 * not a UI component. Producers calculate first, then attach sources and exact
 * result values so presentation never has to reconstruct economy logic.
 */
import type { UniverseId } from '../../content/universes/types'
import {
  parseScientificPairSpike,
  type CanonicalScientificStringSpike,
} from './scientific-pair-spike'

export type FormulaValuePrototype =
  | {
      readonly kind: 'economy-amount'
      readonly value: CanonicalScientificStringSpike
    }
  | {
      readonly kind: 'finite-scalar'
      readonly role: 'multiplier' | 'probability' | 'count' | 'duration-ms' | 'ratio'
      readonly value: number
    }

export interface FormulaSourcePrototype {
  readonly kind:
    | 'base'
    | 'heart'
    | 'kindling'
    | 'upgrade'
    | 'doctrine'
    | 'archive'
    | 'omen'
    | 'epoch'
    | 'deep'
    | 'between'
    | 'universe-law'
    | 'accessibility'
    | 'system'
  readonly id: string
  readonly universeId?: UniverseId
  /** Translation key or stable inspection label, never preformatted arithmetic. */
  readonly label: string
}

export interface FormulaTermPrototype {
  readonly kind: 'term'
  readonly id: string
  readonly source: FormulaSourcePrototype
  readonly value: FormulaValuePrototype
  readonly detail?: string
}

export interface FormulaOperationPrototype {
  readonly kind: 'operation'
  readonly id: string
  readonly label: string
  readonly operator:
    | 'sum'
    | 'difference'
    | 'product'
    | 'quotient'
    | 'power'
    | 'minimum'
    | 'maximum'
    | 'floor'
    | 'ceiling'
  readonly inputs: readonly FormulaNodePrototype[]
  readonly result: FormulaValuePrototype
  readonly collapsedByDefault?: boolean
}

export type FormulaNodePrototype = FormulaTermPrototype | FormulaOperationPrototype

export interface FormulaBreakdownPrototype {
  readonly contractVersion: 'formula-breakdown-prototype-v1'
  readonly formulaId: string
  readonly universeId: UniverseId
  readonly subject: {
    readonly kind: 'rate' | 'click' | 'cost' | 'award' | 'reset-gain' | 'offline-production'
    readonly sourceId: string
  }
  readonly root: FormulaNodePrototype
  readonly result: FormulaValuePrototype
  /** Callers supply simulation/game time; consumers must not read the wall clock. */
  readonly evaluatedAtMs: number
}

export interface FormulaBreakdownIssuePrototype {
  readonly path: string
  readonly message: string
}

function validateValue(
  value: FormulaValuePrototype,
  path: string,
  issues: FormulaBreakdownIssuePrototype[],
): void {
  if (value.kind === 'economy-amount') {
    try {
      parseScientificPairSpike(value.value)
    } catch {
      issues.push({ path, message: 'Economy formula values must use the canonical scientific string form' })
    }
  } else if (!Number.isFinite(value.value)) {
    issues.push({ path, message: 'Scalar formula values must be finite' })
  }
}

/** Structural validation for producers before the model reaches a UI consumer. */
export function validateFormulaBreakdownPrototype(
  breakdown: FormulaBreakdownPrototype,
): readonly FormulaBreakdownIssuePrototype[] {
  const issues: FormulaBreakdownIssuePrototype[] = []
  const ids = new Set<string>()

  if (!Number.isFinite(breakdown.evaluatedAtMs) || breakdown.evaluatedAtMs < 0) {
    issues.push({ path: 'evaluatedAtMs', message: 'Evaluation time must be finite and nonnegative' })
  }
  validateValue(breakdown.result, 'result', issues)

  const visit = (node: FormulaNodePrototype, path: string): void => {
    if (ids.has(node.id)) issues.push({ path: `${path}.id`, message: `Duplicate node id ${node.id}` })
    ids.add(node.id)
    if (node.kind === 'term') {
      validateValue(node.value, `${path}.value`, issues)
      return
    }
    if (node.inputs.length === 0) {
      issues.push({ path: `${path}.inputs`, message: 'Operation nodes require at least one input' })
    }
    validateValue(node.result, `${path}.result`, issues)
    node.inputs.forEach((input, index) => visit(input, `${path}.inputs[${index}]`))
  }

  visit(breakdown.root, 'root')
  if (JSON.stringify(breakdown.root.kind === 'term' ? breakdown.root.value : breakdown.root.result)
    !== JSON.stringify(breakdown.result)) {
    issues.push({ path: 'result', message: 'Top-level result must match the root result exactly' })
  }
  return issues
}
