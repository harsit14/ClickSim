import assert from 'node:assert/strict'
import test from 'node:test'
import {
  COMPETENT_IDLE_TARGET,
  FIRST_EPOCH_APPROACH_RATIO,
  FIRST_EPOCH_FUNNEL_STEPS,
  evaluateCompetentIdlePacing,
} from '../balance/retention-targets'

test('first Epoch ceremony has one ordered, unique measurement contract', () => {
  assert.equal(FIRST_EPOCH_APPROACH_RATIO, 0.7)
  assert.deepEqual(FIRST_EPOCH_FUNNEL_STEPS, [
    'approach-seen',
    'observatory-opened',
    'comparison-opened',
    'collapse-confirmed',
    'epoch-completed',
    'constellation-purchased',
  ])
  assert.equal(new Set(FIRST_EPOCH_FUNNEL_STEPS).size, FIRST_EPOCH_FUNNEL_STEPS.length)
})

test('competent idle is bounded to three-to-seven days with a daily decision', () => {
  assert.deepEqual(COMPETENT_IDLE_TARGET.beaconCalendarHours, [72, 168])

  for (const beaconCalendarHours of [72, 120, 168]) {
    const finding = evaluateCompetentIdlePacing({
      universeId: 'emberlight',
      beaconCalendarHours,
      longestDecisionGapHours: 24,
    })
    assert.deepEqual(finding.issues, [])
  }

  for (const beaconCalendarHours of [null, 71, 169, Number.POSITIVE_INFINITY]) {
    const finding = evaluateCompetentIdlePacing({
      universeId: 'emberlight',
      beaconCalendarHours,
      longestDecisionGapHours: 25,
    })
    assert.equal(finding.issues.length, 2)
  }
})
