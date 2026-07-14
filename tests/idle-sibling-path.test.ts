import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import {
  COMPETENT_IDLE_CHECK_IN_HOURS,
  runCompetentIdleAudit,
} from '../balance/competent-idle-audit'
import { evaluateCompetentIdlePacing } from '../balance/retention-targets'
import { amountFromNumber } from '../src/core/numeric/amount'
import {
  planOfflineProgress,
  summarizeOfflineReturn,
} from '../src/core/offline-pacing'
import { selectOfflineNearMiss } from '../src/experience/offline-return'

test('competent idle reaches every Beacon in three to seven days with two daily decisions', () => {
  const expectedHours = {
    emberlight: 132,
    tidefall: 144,
    verdance: 108,
    clockwork: 156,
    brahmalok: 144,
    vishnulok: 144,
    kailash: 120,
  } as const
  assert.equal(COMPETENT_IDLE_CHECK_IN_HOURS, 12)

  for (const [universeId, beaconCalendarHours] of Object.entries(expectedHours)) {
    const result = runCompetentIdleAudit(universeId as keyof typeof expectedHours)
    assert.equal(result.source, 'current-engine-competent-idle-v1')
    assert.equal(result.beaconCalendarHours, beaconCalendarHours)
    assert.equal(result.longestDecisionGapHours, 12)
    assert.ok(result.purchaseCount > 0)
    assert.deepEqual(evaluateCompetentIdlePacing(result).issues, [], universeId)
  }
})

test('the twelve-hour cap is explicit and return reports retain actual versus counted time', () => {
  const plan = planOfflineProgress(20 * 3_600)
  const summary = summarizeOfflineReturn(amountFromNumber(1_000), plan)
  assert.equal(summary.elapsedSeconds, 20 * 3_600)
  assert.equal(summary.countedSeconds, 12 * 3_600)
  assert.equal(summary.equivalentActiveSeconds, 6 * 3_600)
  assert.equal(summary.capReached, true)
})

test('Welcome Back names a newly reached purchase or the closest exact near-miss', () => {
  const reached = selectOfflineNearMiss(
    amountFromNumber(100),
    amountFromNumber(50),
    amountFromNumber(10),
    0.5,
    [{ id: 'next', name: 'Next Kindling', kind: 'Kindling', cost: amountFromNumber(140) }],
  )
  assert.equal(reached?.status, 'reached')
  assert.equal(reached?.candidate.name, 'Next Kindling')

  const approaching = selectOfflineNearMiss(
    amountFromNumber(100),
    amountFromNumber(50),
    amountFromNumber(10),
    0.5,
    [{ id: 'upgrade', name: 'Patient Upgrade', kind: 'upgrade', cost: amountFromNumber(200) }],
  )
  assert.equal(approaching?.status, 'approaching')
  assert.equal(approaching?.additionalSeconds, 10)
})

test('return and Steward surfaces compile accessibly and are promoted from the Deep', () => {
  for (const filename of ['WelcomeBack.svelte', 'AutoKindlerManager.svelte', 'IdleSteward.svelte']) {
    const path = new URL(`../src/ui/${filename}`, import.meta.url)
    const source = readFileSync(path, 'utf8')
    assert.deepEqual(compile(source, { filename: path.pathname, generate: 'client' }).warnings, [])
  }

  const welcome = readFileSync(new URL('../src/ui/WelcomeBack.svelte', import.meta.url), 'utf8')
  const manager = readFileSync(new URL('../src/ui/AutoKindlerManager.svelte', import.meta.url), 'utf8')
  const steward = readFileSync(new URL('../src/ui/IdleSteward.svelte', import.meta.url), 'utf8')
  const deep = readFileSync(new URL('../src/ui/TheDeep.svelte', import.meta.url), 'utf8')
  const app = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')

  assert.match(welcome, /role="dialog"[\s\S]*aria-modal="true"/)
  assert.match(welcome, /more offline at this pace would have bought it/)
  assert.match(welcome, /containModalKeydown/)
  assert.match(manager, /Purchase priority[\s\S]*Eligible Kindling families/)
  assert.match(steward, /banked realm decisions/i)
  assert.match(deep, /<AutoKindlerManager embedded/)
  assert.match(app, /aria-label="The Steward"[\s\S]*aria-keyshortcuts="A"/)
  assert.match(app, /offlineReturnOpen[\s\S]*<WelcomeBack summary=/)
})
