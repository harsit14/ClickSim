import assert from 'node:assert/strict'
import test from 'node:test'
import type { EcoState } from '../src/engine/compute'
import {
  clickFormula,
  clickPower,
  rateFormula,
  totalRate,
} from '../src/engine/compute'
import {
  validateFormulaBreakdown,
  type FormulaNode,
} from '../src/core/numeric/formula-breakdown'
import {
  ZERO_AMOUNT,
  amountFromNumber,
  multiplyAmountByNumber,
  parseAmount,
  serializeAmount,
} from '../src/core/numeric/amount'
import { format } from '../src/core/format'
import { formulaValueText } from '../src/ui/formula-inspector-model'

function state(): EcoState {
  return {
    activeUniverse: 'emberlight',
    light: ZERO_AMOUNT,
    totalEarned: amountFromNumber(1e12),
    clicks: 100,
    owned: { spark: 25, wisp: 8 },
    upgrades: ['ember-touch', 'wisp-chorus'],
    achievements: ['first-spark', 'first-wisp'],
    stardustTotal: amountFromNumber(12),
    constellation: ['forge-1', 'hand-1'],
    stardustWorks: { 'continuing-corona': 2 },
    singUpgrades: ['deep-resonance'],
    deepWorks: { 'worldseed-compression': 1 },
    challenge: null,
    challengesDone: ['bare-hands'],
    ending: 'warden',
    remembrances: 1,
    curiosities: ['moth'],
    keeperFedUntil: 0,
    beacons: ['emberlight'],
    darkBetween: ZERO_AMOUNT,
    wayfinder: ['between-cargo'],
    vesselParts: [],
  }
}

function visit(node: FormulaNode, values: unknown[]): void {
  values.push(node.kind === 'term' ? node.value : node.result)
  if (node.kind === 'operation') node.inputs.forEach((input) => visit(input, values))
}

test('rate formula is sourced, canonical, and exactly matches the compute result', () => {
  const game = state()
  const evaluatedAt = 12_345
  const outputMultiplier = 1.75
  const formula = rateFormula(game, evaluatedAt, outputMultiplier)
  assert.deepEqual(validateFormulaBreakdown(formula), [])
  assert.equal(formula.evaluatedAtMs, evaluatedAt)
  assert.equal(
    formula.result.kind === 'economy-amount' ? formula.result.value : '',
    serializeAmount(multiplyAmountByNumber(totalRate(game, evaluatedAt), outputMultiplier)),
  )

  const values: unknown[] = []
  visit(formula.root, values)
  for (const value of values as Array<{ kind: string; value: unknown }>) {
    if (value.kind === 'economy-amount') assert.equal(typeof value.value, 'string')
    else assert.equal(Number.isFinite(value.value), true)
  }
  assert.doesNotMatch(JSON.stringify(formula), /"mantissa"|"exponent"/)
  assert.match(JSON.stringify(formula), /Spark base rate/)
  assert.match(JSON.stringify(formula), /Spark owned/)
  assert.match(JSON.stringify(formula), /Wisp Chorus/)
})

test('Formula Inspector display preserves a root result beyond 1e308', () => {
  const game = state()
  game.stardustTotal = parseAmount('1e312')
  const evaluatedAt = 99_000
  const expected = totalRate(game, evaluatedAt)
  assert.ok(expected.exponent > 308)
  const formula = rateFormula(game, evaluatedAt)
  assert.deepEqual(validateFormulaBreakdown(formula), [])
  assert.equal(formula.result.kind === 'economy-amount' ? formula.result.value : '', serializeAmount(expected))
  assert.equal(formulaValueText(formula.result), format(expected))
})

test('click formula matches explicit rate and output multipliers without UI arithmetic', () => {
  const game = state()
  const evaluatedAt = 54_321
  const rateMultiplier = 1.4
  const outputMultiplier = 2.25
  const formula = clickFormula(game, rateMultiplier, evaluatedAt, outputMultiplier)
  assert.deepEqual(validateFormulaBreakdown(formula), [])
  assert.equal(
    formula.result.kind === 'economy-amount' ? formula.result.value : '',
    serializeAmount(multiplyAmountByNumber(clickPower(game, rateMultiplier, evaluatedAt), outputMultiplier)),
  )
  assert.match(JSON.stringify(formula), /Base rate share/)
  assert.match(JSON.stringify(formula), /Active click effect/)
})

test('formula validation fails closed on duplicate nodes and a mismatched result', () => {
  const formula = rateFormula(state(), 1000)
  if (formula.root.kind !== 'operation') throw new Error('Expected operation root')
  const malformed = {
    ...formula,
    root: {
      ...formula.root,
      inputs: [...formula.root.inputs, formula.root.inputs[0]],
    },
    result: { kind: 'economy-amount', value: '1e0' },
  } as typeof formula
  const issues = validateFormulaBreakdown(malformed)
  assert.ok(issues.some((issue) => /Duplicate node id/.test(issue.message)))
  assert.ok(issues.some((issue) => /match the root result/.test(issue.message)))
})
