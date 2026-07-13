import assert from 'node:assert/strict'
import test from 'node:test'
import { buildOpeningPacingStudy, simulateOpeningUnlocks } from '../balance/opening-pacing'
import { UI_UNLOCKS } from '../src/content/ui-unlocks'

test('fresh opening reaches count, spending, and growth at the recorded costs', () => {
  const study = buildOpeningPacingStudy()
  assert.deepEqual(study.milestones, [
    { id: 'counter', heartActivations: 10, activationsSincePreviousUnlock: 10, remainingLight: 0 },
    { id: 'shop', heartActivations: 35, activationsSincePreviousUnlock: 25, remainingLight: 0 },
    { id: 'upgrades', heartActivations: 110, activationsSincePreviousUnlock: 75, remainingLight: 0 },
  ])
  assert.equal(study.keyboardHintLeadActivations, 5)
  assert.equal(study.longestUnlockGap, 75)
  assert.deepEqual(study.structuralIssues, [])
  assert.equal(study.costDecision, 'hold-for-observed-fatigue')
  assert.deepEqual(UI_UNLOCKS.slice(0, 3).map(({ cost }) => cost), [10, 25, 75])
})

test('the study recommends reduction only when an authored threshold actually fails', () => {
  const tiring = UI_UNLOCKS.slice(0, 3).map((unlock) => (
    unlock.id === 'upgrades' ? { ...unlock, cost: 76 } : unlock
  ))
  const study = buildOpeningPacingStudy(tiring)
  assert.equal(study.milestones.at(-1)?.activationsSincePreviousUnlock, 76)
  assert.equal(study.costDecision, 'reduce')
  assert.throws(() => simulateOpeningUnlocks([{ ...UI_UNLOCKS[0], cost: 0 }]), /Invalid opening unlock/)
})
