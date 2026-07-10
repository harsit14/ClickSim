import { format } from '../core/format'
import { parseAmount } from '../core/numeric/amount'
import type {
  FormulaBreakdown,
  FormulaNode,
  FormulaOperator,
  FormulaValue,
} from '../core/numeric/formula-breakdown'

export type FormulaTabKey = 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End'

export function nextFormulaTabId(
  breakdowns: readonly FormulaBreakdown[],
  currentId: string,
  key: FormulaTabKey,
): string {
  if (breakdowns.length === 0) return ''
  const currentIndex = Math.max(0, breakdowns.findIndex((item) => item.formulaId === currentId))
  if (key === 'Home') return breakdowns[0].formulaId
  if (key === 'End') return breakdowns[breakdowns.length - 1].formulaId
  const direction = key === 'ArrowRight' ? 1 : -1
  return breakdowns[(currentIndex + direction + breakdowns.length) % breakdowns.length].formulaId
}

export const formulaTabDomId = (formulaId: string): string =>
  `formula-tab-${formulaId.replace(/[^a-z0-9-]/gi, '-')}`

export const formulaPanelDomId = (formulaId: string): string =>
  `formula-panel-${formulaId.replace(/[^a-z0-9-]/gi, '-')}`

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
