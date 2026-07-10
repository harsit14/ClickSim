import type {
  SerializedEconomyAmount,
  UniverseId,
} from '../../content/universes/types'
import {
  parseAmount,
  serializeAmount,
  type Amount,
} from './amount'

export type FormulaScalarRole =
  | 'multiplier'
  | 'probability'
  | 'count'
  | 'duration-ms'
  | 'ratio'

export type FormulaValue =
  | {
      readonly kind: 'economy-amount'
      readonly value: SerializedEconomyAmount
    }
  | {
      readonly kind: 'finite-scalar'
      readonly role: FormulaScalarRole
      readonly value: number
    }

export type FormulaSourceKind =
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

export interface FormulaSource {
  readonly kind: FormulaSourceKind
  readonly id: string
  readonly universeId?: UniverseId
  readonly label: string
}

export interface FormulaTerm {
  readonly kind: 'term'
  readonly id: string
  readonly source: FormulaSource
  readonly value: FormulaValue
  readonly detail?: string
}

export type FormulaOperator =
  | 'sum'
  | 'difference'
  | 'product'
  | 'quotient'
  | 'power'
  | 'minimum'
  | 'maximum'
  | 'floor'
  | 'ceiling'

export interface FormulaOperation {
  readonly kind: 'operation'
  readonly id: string
  readonly label: string
  readonly operator: FormulaOperator
  readonly inputs: readonly FormulaNode[]
  readonly result: FormulaValue
  readonly collapsedByDefault?: boolean
}

export type FormulaNode = FormulaTerm | FormulaOperation

export interface FormulaBreakdown {
  readonly contractVersion: 'formula-breakdown-v1'
  readonly formulaId: string
  readonly universeId: UniverseId
  readonly subject: {
    readonly kind: 'rate' | 'click' | 'cost' | 'award' | 'reset-gain' | 'offline-production'
    readonly sourceId: string
  }
  readonly root: FormulaNode
  readonly result: FormulaValue
  readonly evaluatedAtMs: number
}

export interface FormulaBreakdownIssue {
  readonly path: string
  readonly message: string
}

export const formulaAmount = (value: Amount): FormulaValue => ({
  kind: 'economy-amount',
  value: serializeAmount(value),
})

export function formulaScalar(role: FormulaScalarRole, value: number): FormulaValue {
  if (!Number.isFinite(value)) throw new TypeError(`Formula scalar must be finite; received ${String(value)}`)
  return { kind: 'finite-scalar', role, value }
}

function validateValue(value: FormulaValue, path: string, issues: FormulaBreakdownIssue[]): void {
  if (value.kind === 'economy-amount') {
    try {
      parseAmount(value.value)
    } catch {
      issues.push({ path, message: 'Economy formula values must be canonical amount strings' })
    }
    return
  }
  if (!Number.isFinite(value.value)) {
    issues.push({ path, message: 'Scalar formula values must be finite' })
  }
}

/** Fail-closed structural validation before a producer hands a tree to presentation. */
export function validateFormulaBreakdown(
  breakdown: FormulaBreakdown,
): readonly FormulaBreakdownIssue[] {
  const issues: FormulaBreakdownIssue[] = []
  const ids = new Set<string>()

  if (breakdown.contractVersion !== 'formula-breakdown-v1') {
    issues.push({ path: 'contractVersion', message: 'Unsupported formula breakdown contract' })
  }
  if (!Number.isFinite(breakdown.evaluatedAtMs) || breakdown.evaluatedAtMs < 0) {
    issues.push({ path: 'evaluatedAtMs', message: 'Evaluation time must be finite and nonnegative' })
  }
  validateValue(breakdown.result, 'result', issues)

  const visit = (node: FormulaNode, path: string): void => {
    if (ids.has(node.id)) issues.push({ path: `${path}.id`, message: `Duplicate node id ${node.id}` })
    ids.add(node.id)
    if (node.kind === 'term') {
      if (!node.source.id || !node.source.label) {
        issues.push({ path: `${path}.source`, message: 'Formula terms require a stable source id and label' })
      }
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
  const rootResult = breakdown.root.kind === 'term' ? breakdown.root.value : breakdown.root.result
  if (JSON.stringify(rootResult) !== JSON.stringify(breakdown.result)) {
    issues.push({ path: 'result', message: 'Top-level result must match the root result exactly' })
  }
  return issues
}
