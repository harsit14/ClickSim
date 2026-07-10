import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile, preprocess } from 'svelte/compiler'
import {
  formulaPanelDomId,
  formulaTabDomId,
  nextFormulaTabId,
} from '../src/ui/formula-inspector-model'
import type { FormulaBreakdown } from '../src/core/numeric/formula-breakdown'

const breakdowns = [
  { formulaId: 'current-passive-rate-v1' },
  { formulaId: 'current-click-power-v1' },
] as FormulaBreakdown[]

test('Formula Inspector tab keyboard model wraps and supports Home/End', () => {
  assert.equal(nextFormulaTabId(breakdowns, breakdowns[0].formulaId, 'ArrowRight'), breakdowns[1].formulaId)
  assert.equal(nextFormulaTabId(breakdowns, breakdowns[1].formulaId, 'ArrowRight'), breakdowns[0].formulaId)
  assert.equal(nextFormulaTabId(breakdowns, breakdowns[0].formulaId, 'ArrowLeft'), breakdowns[1].formulaId)
  assert.equal(nextFormulaTabId(breakdowns, breakdowns[1].formulaId, 'Home'), breakdowns[0].formulaId)
  assert.equal(nextFormulaTabId(breakdowns, breakdowns[0].formulaId, 'End'), breakdowns[1].formulaId)
  assert.notEqual(formulaTabDomId(breakdowns[0].formulaId), formulaPanelDomId(breakdowns[0].formulaId))
})

test('Formula Inspector compiles without Svelte accessibility warnings', async () => {
  const filename = new URL('../src/ui/FormulaInspector.svelte', import.meta.url)
  const source = readFileSync(filename, 'utf8')
  const processed = await preprocess(source, {
    script: ({ content }) => ({ code: content.replace(/<script lang="ts">/, '<script>') }),
  }, { filename: filename.pathname })
  const result = compile(processed.code, { filename: filename.pathname, generate: false })
  assert.deepEqual(result.warnings.filter((warning) => warning.code.startsWith('a11y_')), [])
})
