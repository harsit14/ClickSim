import assert from 'node:assert/strict'
import test from 'node:test'
import { createDevScenario } from '../src/core/dev-scenarios'
import { amountFromNumber, serializeAmount } from '../src/core/numeric/amount'
import { migrateAndSanitizeSave, stringifySaveDataV23 } from '../src/core/save-data'

const LAW_KEYS = [
  'brahmalok-commission-index', 'brahmalok-commission-phase', 'brahmalok-commission-elapsed', 'brahmalok-commission-edited',
  'brahmalok-commission-route-changes', 'brahmalok-commission-held-seconds', 'brahmalok-commission-buff-seconds', 'brahmalok-margin-mode',
  'brahmalok-commission-bank-1', 'brahmalok-commission-bank-2', 'brahmalok-commission-bank-3',
  'vishnulok-strain-index', 'vishnulok-strain-phase', 'vishnulok-strain-elapsed', 'vishnulok-strain-edited',
  'vishnulok-strain-generic-returns', 'vishnulok-strain-resolved', 'vishnulok-strain-bonus-seconds', 'vishnulok-route-pending',
  'vishnulok-return-pending', 'vishnulok-continuity-2', 'vishnulok-return-seconds-2', 'vishnulok-last-return-2',
  'vishnulok-strain-bank-1', 'vishnulok-strain-bank-2', 'vishnulok-strain-bank-3', 'vishnulok-strain-bank-elapsed',
  'kailash-front-index', 'kailash-front-phase', 'kailash-front-elapsed', 'kailash-front-answered-seconds',
  'kailash-front-edited', 'kailash-front-carry-seconds', 'kailash-long-rest', 'kailash-grace-reserve',
  'kailash-grace-bonus-strength', 'kailash-grace-bonus-seconds',
  'kailash-front-bank-1', 'kailash-front-bank-2', 'kailash-front-bank-3',
] as const

test('old v23 saves load every new loka counter at zero without migration warnings', () => {
  const scenario = createDevScenario('brahmalok')
  assert.ok(scenario)
  const raw = JSON.parse(stringifySaveDataV23(scenario)) as Record<string, unknown>
  delete raw.lokaProgress
  const runs = raw.universeRuns as Record<string, Record<string, unknown>>
  for (const run of Object.values(runs)) delete run.lokaProgress

  const loaded = migrateAndSanitizeSave(raw)
  assert.ok(loaded)
  assert.deepEqual(loaded.lokaProgress, {})
  assert.ok(Object.values(loaded.universeRuns).every((run) => Object.keys(run.lokaProgress).length === 0))
})

test('all new brahmalok/vishnulok/kailash law keys round-trip without rename or positional remapping', () => {
  const scenario = createDevScenario('kailash')
  assert.ok(scenario)
  const raw = JSON.parse(stringifySaveDataV23(scenario)) as Record<string, unknown>
  const one = serializeAmount(amountFromNumber(1))
  raw.numericLawState = Object.fromEntries(LAW_KEYS.map((key) => [key, one]))
  raw.lokaProgress = {
    'brahmalok-folios': 7,
    'vishnulok-routes': 8,
    'vishnulok-returns': 19,
    'kailash-traces': 11,
    'brahmalok-shelf-1-at': 1000,
    'vishnulok-shelf-2-at': 2000,
    'kailash-shelf-3-at': 3000,
  }

  const loaded = migrateAndSanitizeSave(raw)
  assert.ok(loaded)
  assert.deepEqual(Object.keys(loaded.numericLawState).sort(), [...LAW_KEYS].sort())
  assert.deepEqual(loaded.lokaProgress, raw.lokaProgress)
})
