import assert from 'node:assert/strict'
import test from 'node:test'
import { createDevScenario } from '../src/core/dev-scenarios'
import { amountFromNumber, serializeAmount } from '../src/core/numeric/amount'
import { migrateAndSanitizeSave, stringifySaveDataV23 } from '../src/core/save-data'

const LAW_KEYS = [
  'u5-commission-index', 'u5-commission-phase', 'u5-commission-elapsed', 'u5-commission-edited',
  'u5-commission-route-changes', 'u5-commission-held-seconds', 'u5-commission-buff-seconds', 'u5-margin-mode',
  'u6-strain-index', 'u6-strain-phase', 'u6-strain-elapsed', 'u6-strain-edited',
  'u6-strain-generic-returns', 'u6-strain-resolved', 'u6-strain-bonus-seconds', 'u6-route-pending',
  'u6-return-pending', 'u6-charge-2', 'u6-boost-seconds-2', 'u6-last-discharge-2',
  'u7-front-index', 'u7-front-phase', 'u7-front-elapsed', 'u7-front-answered-seconds',
  'u7-front-edited', 'u7-front-carry-seconds', 'u7-long-rest', 'u7-grace-reserve',
  'u7-grace-bonus-strength', 'u7-grace-bonus-seconds',
] as const

test('old v23 saves load every new loka counter at zero without migration warnings', () => {
  const scenario = createDevScenario('prismata')
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

test('all new u5/u6/u7 law keys round-trip without rename or positional remapping', () => {
  const scenario = createDevScenario('canticle')
  assert.ok(scenario)
  const raw = JSON.parse(stringifySaveDataV23(scenario)) as Record<string, unknown>
  const one = serializeAmount(amountFromNumber(1))
  raw.numericLawState = Object.fromEntries(LAW_KEYS.map((key) => [key, one]))
  raw.lokaProgress = {
    'u5-folios': 7,
    'u6-routes': 8,
    'u6-returns': 19,
    'u7-traces': 11,
    'u5-shelf-1-at': 1000,
    'u6-shelf-2-at': 2000,
    'u7-shelf-3-at': 3000,
  }

  const loaded = migrateAndSanitizeSave(raw)
  assert.ok(loaded)
  assert.deepEqual(Object.keys(loaded.numericLawState).sort(), [...LAW_KEYS].sort())
  assert.deepEqual(loaded.lokaProgress, raw.lokaProgress)
})
