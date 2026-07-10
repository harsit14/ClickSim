import { format } from '../core/format'
import { parseAmount } from '../core/numeric/amount'
import type {
  FormulaNode,
  FormulaOperator,
  FormulaValue,
} from '../core/numeric/formula-breakdown'

export interface FormulaDisplayRow {
  readonly node: FormulaNode
  readonly depth: number
}

export function formulaDisplayRows(root: FormulaNode): readonly FormulaDisplayRow[] {
  const rows: FormulaDisplayRow[] = []
  const visit = (node: FormulaNode, depth: number): void => {
    rows.push({ node, depth })
    if (node.kind === 'operation') node.inputs.forEach((input) => visit(input, depth + 1))
  }
  visit(root, 0)
  return rows
}

export function formulaValueText(value: FormulaValue): string {
  if (value.kind === 'economy-amount') return format(parseAmount(value.value))
  switch (value.role) {
    case 'multiplier': return `×${format(value.value)}`
    case 'probability': return `${format(value.value * 100)}%`
    case 'ratio': return `${format(value.value * 100)}%`
    case 'count': return format(value.value)
    case 'duration-ms': return `${format(value.value)} ms`
  }
}

export function formulaOperatorSymbol(operator: FormulaOperator): string {
  switch (operator) {
    case 'sum': return 'Σ'
    case 'difference': return '−'
    case 'product': return '×'
    case 'quotient': return '÷'
    case 'power': return '^'
    case 'minimum': return 'min'
    case 'maximum': return 'max'
    case 'floor': return '⌊·⌋'
    case 'ceiling': return '⌈·⌉'
  }
}
