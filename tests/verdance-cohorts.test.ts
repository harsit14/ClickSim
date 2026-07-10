import assert from 'node:assert/strict'
import test from 'node:test'
import {
  advanceVerdanceCohorts,
  compactVerdanceCohorts,
  plantVerdanceCohort,
  previewVerdancePruning,
  verdanceCohortProductionMultiplier,
  verdanceStageForAge,
} from '../src/content/universes/verdance/cohorts'

test('Verdance cohorts age through four deterministic non-withering stages', () => {
  assert.equal(verdanceStageForAge(0), 'u3-cohort-new')
  assert.equal(verdanceStageForAge(5 * 60_000), 'u3-cohort-rooted')
  assert.equal(verdanceStageForAge(60 * 60_000), 'u3-cohort-mature')
  assert.equal(verdanceStageForAge(8 * 60 * 60_000), 'u3-cohort-ancient')
  assert.equal(advanceVerdanceCohorts([plantVerdanceCohort(4)], 10 * 60 * 60_000)[0].stageId, 'u3-cohort-ancient')
})

test('offline aging respects the caller cap and compacts by stage', () => {
  const rows = advanceVerdanceCohorts([plantVerdanceCohort(2), plantVerdanceCohort(3)], 10 * 60_000, 5 * 60_000)
  assert.deepEqual(rows, [{ stageId: 'u3-cohort-rooted', quantity: 5, ageMs: 5 * 60_000 }])
  assert.equal(compactVerdanceCohorts(rows).length, 1)
})

test('production and Pruning reward maturity instead of raw count', () => {
  const rows = [
    { stageId: 'u3-cohort-new' as const, quantity: 5, ageMs: 0 },
    { stageId: 'u3-cohort-mature' as const, quantity: 5, ageMs: 60 * 60_000 },
    { stageId: 'u3-cohort-ancient' as const, quantity: 5, ageMs: 8 * 60 * 60_000 },
  ]
  assert.equal(verdanceCohortProductionMultiplier(rows), (5 + 10 + 17.5) / 15)
  assert.deepEqual(previewVerdancePruning(rows), { maturityPoints: 20, memorySeeds: 4, prunableQuantity: 10 })
})

test('invalid time and quantity values fail closed', () => {
  assert.throws(() => plantVerdanceCohort(0), /positive safe integer/)
  assert.throws(() => verdanceStageForAge(Number.NaN), /finite and nonnegative/)
  assert.throws(() => advanceVerdanceCohorts([plantVerdanceCohort(1)], 1, -1), /finite and nonnegative/)
})
