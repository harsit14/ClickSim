import assert from 'node:assert/strict'
import test from 'node:test'
import {
  generatorPurchaseIncomeDelta,
  runCurrentPackAudit,
} from '../balance/current-pack-audit'
import {
  runSimulationSuite,
  simulateProfileCase,
  universeSimulationFixture,
} from '../balance/profile-simulator'
import {
  SIMULATOR_PROFILES,
  createSimulatorCases,
  validateSimulationCaseResult,
} from '../balance/simulator-contract'
import { universeById } from '../src/content/universes'
import type { EcoState } from '../src/engine/compute'
import {
  ZERO_AMOUNT,
  divideAmounts,
  gtAmount,
  amountToNumber,
  parseAmount,
} from '../src/core/numeric/amount'

const casual = SIMULATOR_PROFILES.find((profile) => profile.id === 'casual-one-click-per-second')!

function resonanceState(withResonance: boolean): EcoState {
  return {
    activeUniverse: 'emberlight',
    light: ZERO_AMOUNT,
    totalEarned: ZERO_AMOUNT,
    clicks: 100,
    owned: { spark: 10, wisp: 5 },
    upgrades: withResonance ? ['wisp-chorus'] : [],
    achievements: [],
    stardustTotal: ZERO_AMOUNT,
    constellation: [],
    stardustWorks: {},
    singUpgrades: [],
    deepWorks: {},
    challenge: null,
    challengesDone: [],
    ending: null,
    remembrances: 0,
    curiosities: [],
    keeperFedUntil: 0,
    beacons: [],
    darkBetween: ZERO_AMOUNT,
    wayfinder: [],
    vesselParts: [],
  }
}

test('all 168 profile projections are deterministic, valid, and finite for five years', () => {
  const cases = createSimulatorCases()
  const suite = runSimulationSuite()
  assert.equal(suite.cases.length, 168)
  assert.deepEqual(suite.failedCaseIds, [])
  assert.deepEqual(suite.stalledCaseIds, [])
  suite.cases.forEach((result, index) => {
    assert.deepEqual(validateSimulationCaseResult(cases[index], result), [])
    assert.equal(result.numericHealth.passed, true)
  })
  assert.ok(suite.cases.some((result) => parseAmount(result.numericHealth.lastValidAmount).exponent > 308))
  assert.ok(suite.dominance.every((entry) => !entry.dominatesIdleActiveOfflineAndAccessibility))
  assert.deepEqual(simulateProfileCase(cases[37]), simulateProfileCase(cases[37]))
})

test('profile fixtures label real-pack projections and synthetic future contracts explicitly', () => {
  assert.equal(universeSimulationFixture('emberlight').source, 'current-pack-profile-projection')
  assert.equal(universeSimulationFixture('tidefall').source, 'current-pack-profile-projection')
  assert.equal(universeSimulationFixture('verdance').source, 'future-contract-fixture')
  assert.equal(universeSimulationFixture('canticle').source, 'future-contract-fixture')
})

test('Beacon revisit and accessibility profile behavior match the recorded inputs', () => {
  const suite = runSimulationSuite()
  const find = (suffix: string) => suite.cases.find((result) => result.caseId === suffix)!
  const first = find('emberlight/casual-one-click-per-second/first-visit/no-archive')
  const revisit = find('emberlight/casual-one-click-per-second/beacon-accelerated-revisit/no-archive')
  const firstCommon = first.milestones.find((milestone) => milestone.id === 'world-1e3')!.reachedAtMs!
  const revisitCommon = revisit.milestones.find((milestone) => milestone.id === 'world-1e3')!.reachedAtMs!
  assert.ok(firstCommon / revisitCommon >= 3 && firstCommon / revisitCommon <= 5)

  const competent = parseAmount(find('emberlight/competent-universe-mechanic/first-visit/no-archive').numericHealth.lastValidAmount)
  const accessible = parseAmount(find('emberlight/reduced-rhythm-accessibility/first-visit/no-archive').numericHealth.lastValidAmount)
  const ratio = gtAmount(competent, accessible)
    ? amountToNumber(divideAmounts(competent, accessible))
    : amountToNumber(divideAmounts(accessible, competent))
  assert.ok(ratio <= 1.15)
})

test('additive current-pack audit runs the actual compute pipeline and pack ids', () => {
  for (const universeId of ['emberlight', 'tidefall'] as const) {
    const result = runCurrentPackAudit(universeId, casual, 0.25)
    const pack = universeById(universeId)
    assert.equal(result.source, 'current-engine-compute-v13')
    assert.equal(result.universeId, universeId)
    assert.ok(result.purchasedGeneratorIds.every((id) => pack.generatorById.has(id)))
    assert.doesNotThrow(() => parseAmount(result.finalRate))
    assert.doesNotThrow(() => parseAmount(result.finalEarned))
  }
})

test('generator payback delta includes already-owned paired resonance effects', () => {
  const plain = generatorPurchaseIncomeDelta(resonanceState(false), casual, 'spark', 0)
  const resonant = generatorPurchaseIncomeDelta(resonanceState(true), casual, 'spark', 0)
  assert.ok(gtAmount(resonant, plain))
})
