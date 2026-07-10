import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createSimulatorCases,
  DEFAULT_SIMULATOR_CONTRACT_CONFIG,
  deriveSimulatorSeed,
  SIMULATOR_PROFILES,
  SIMULATOR_PROGRESSION_STATES,
  SIMULATOR_UNIVERSE_IDS,
  simulatorRandomSample,
  type SimulationCaseResult,
  type SimulatorCase,
  validateSimulationCaseResult,
} from '../balance/simulator-contract'

function validResult(simulationCase: SimulatorCase): SimulationCaseResult {
  return {
    contractVersion: 'multi-profile-simulator-v1',
    caseId: simulationCase.id,
    seed: simulationCase.seed,
    milestones: simulationCase.config.milestones.map((milestone, index) => ({
      id: milestone.id,
      target: milestone.amount,
      reachedAtMs: index < 3 ? index * 60_000 : null,
    })),
    purchaseGaps: {
      purchaseCount: 12,
      longestMs: 120_000,
      percentile95Ms: 90_000,
      gapsOverThreshold: 0,
    },
    rateComposition: {
      passive: { amountPerSecond: '6e5', share: 0.6 },
      click: { amountPerSecond: '1e5', share: 0.1 },
      'universe-mechanic': { amountPerSecond: '2e5', share: 0.2 },
      omen: { amountPerSecond: '5e4', share: 0.05 },
      archive: { amountPerSecond: '5e4', share: 0.05 },
      'cross-world': { amountPerSecond: '0', share: 0 },
    },
    resetRecovery: [
      {
        boundary: 'epoch-turn',
        priorFrontierRate: '1e6',
        recoveredAtMs: 240_000,
        recoveryDurationMs: 240_000,
        rateRatioAtHorizon: 3,
      },
      {
        boundary: 'deep-collapse',
        priorFrontierRate: '1e12',
        recoveredAtMs: 1_800_000,
        recoveryDurationMs: 1_800_000,
        rateRatioAtHorizon: 2,
      },
    ],
    buildDominance: {
      candidates: ['build-a', 'build-b', 'build-c', 'build-d'].map((buildId, index) => ({
        buildId,
        milestoneScoreMs: 600_000 + index * 60_000,
        finalRate: `${4 - index}e6` as const,
        viable: true,
      })),
      leaderId: 'build-a',
      runnerUpId: 'build-b',
      leadRatio: 4 / 3,
      dominatesAllMeasuredContexts: false,
    },
    numericHealth: {
      passed: true,
      exponentOverflow: false,
      nonFiniteValue: false,
      invalidCanonicalAmount: false,
      stalledComparison: false,
      lastValidAmount: '4e6',
      diagnostics: [],
    },
    stalls: [],
  }
}

test('case matrix covers seven universes, all Section 8.6 profiles, and four progression states', () => {
  const cases = createSimulatorCases()
  const expectedCount = SIMULATOR_UNIVERSE_IDS.length
    * SIMULATOR_PROFILES.length
    * SIMULATOR_PROGRESSION_STATES.length
  assert.equal(cases.length, 168)
  assert.equal(cases.length, expectedCount)
  assert.equal(new Set(cases.map((item) => item.id)).size, expectedCount)

  for (const universeId of SIMULATOR_UNIVERSE_IDS) {
    const universeCases = cases.filter((item) => item.universeId === universeId)
    assert.equal(universeCases.length, SIMULATOR_PROFILES.length * SIMULATOR_PROGRESSION_STATES.length)
    for (const profile of SIMULATOR_PROFILES) {
      assert.equal(universeCases.filter((item) => item.profile.id === profile.id).length, 4)
    }
  }
})

test('first/revisit, archive states, and accessibility rhythm are explicit', () => {
  assert.deepEqual(
    new Set(SIMULATOR_PROGRESSION_STATES.map((state) => state.visit)),
    new Set(['first-visit', 'beacon-accelerated-revisit']),
  )
  assert.deepEqual(
    new Set(SIMULATOR_PROGRESSION_STATES.map((state) => state.archive)),
    new Set(['no-archive', 'complete-archive']),
  )
  const accessibility = SIMULATOR_PROFILES.find((profile) => profile.id === 'reduced-rhythm-accessibility')
  assert.ok(accessibility)
  assert.equal(accessibility.rhythmRewardMode, 'averaged-accessibility')
  assert.equal(accessibility.assistiveInputEligible, true)
})

test('case seeds and indexed random samples are deterministic', () => {
  const first = createSimulatorCases()
  const second = createSimulatorCases()
  assert.deepEqual(first.map((item) => item.seed), second.map((item) => item.seed))
  assert.equal(first[0].seed, deriveSimulatorSeed(DEFAULT_SIMULATOR_CONTRACT_CONFIG.baseSeed, first[0].id))
  assert.equal(new Set(first.map((item) => item.seed)).size, first.length)

  const samples = Array.from({ length: 8 }, (_, index) => simulatorRandomSample(first[0].seed, index))
  assert.deepEqual(samples, Array.from({ length: 8 }, (_, index) => simulatorRandomSample(first[0].seed, index)))
  assert.ok(samples.every((sample) => sample >= 0 && sample < 1))
  assert.ok(new Set(samples).size > 1)
})

test('result contract validates milestone, gap, composition, recovery, dominance, overflow, and stalls', () => {
  const simulationCase = createSimulatorCases()[0]
  const result = validResult(simulationCase)
  assert.deepEqual(validateSimulationCaseResult(simulationCase, result), [])

  const serialized = JSON.stringify(result)
  assert.deepEqual(JSON.parse(serialized), result)
  assert.deepEqual(Object.keys(result).sort(), [
    'buildDominance',
    'caseId',
    'contractVersion',
    'milestones',
    'numericHealth',
    'purchaseGaps',
    'rateComposition',
    'resetRecovery',
    'seed',
    'stalls',
  ])
})

test('numeric overflow, malformed output, and stalled comparisons fail closed', () => {
  const simulationCase = createSimulatorCases()[0]
  const baseline = validResult(simulationCase)
  const invalid: SimulationCaseResult = {
    ...baseline,
    seed: baseline.seed + 1,
    rateComposition: {
      ...baseline.rateComposition,
      passive: { amountPerSecond: '1.0e6' as '1e6', share: 0.9 },
    },
    numericHealth: {
      ...baseline.numericHealth,
      passed: true,
      exponentOverflow: true,
      stalledComparison: true,
      diagnostics: [],
    },
    stalls: [
      {
        startedAtMs: 1_000,
        endedAtMs: null,
        durationMs: Number.POSITIVE_INFINITY,
        reason: 'numeric-comparison',
      },
    ],
  }
  const issues = validateSimulationCaseResult(simulationCase, invalid)
  assert.ok(issues.some((issue) => issue.path === 'seed'))
  assert.ok(issues.some((issue) => issue.path.includes('amountPerSecond')))
  assert.ok(issues.some((issue) => issue.path === 'numericHealth.passed'))
  assert.ok(issues.some((issue) => issue.path === 'numericHealth.diagnostics'))
  assert.ok(issues.some((issue) => issue.path === 'stalls[0]'))
})

test('result contract rejects impossible gap, duplicate recovery, and inconsistent finished stalls', () => {
  const simulationCase = createSimulatorCases()[0]
  const baseline = validResult(simulationCase)
  const invalid: SimulationCaseResult = {
    ...baseline,
    purchaseGaps: {
      ...baseline.purchaseGaps,
      purchaseCount: 2,
      gapsOverThreshold: 3,
    },
    resetRecovery: [
      baseline.resetRecovery[0],
      baseline.resetRecovery[0],
      baseline.resetRecovery[1],
    ],
    stalls: [
      {
        startedAtMs: 5_000,
        endedAtMs: 4_000,
        durationMs: 1_000,
        reason: 'no-affordable-purchase',
      },
      {
        startedAtMs: 10_000,
        endedAtMs: 14_000,
        durationMs: 3_999,
        reason: 'mechanic-dead-zone',
      },
    ],
  }
  const issues = validateSimulationCaseResult(simulationCase, invalid)
  assert.ok(issues.some((issue) =>
    issue.path === 'purchaseGaps.gapsOverThreshold'
    && issue.message === 'Threshold count cannot exceed purchase count'))
  assert.ok(issues.some((issue) =>
    issue.path === 'resetRecovery'
    && issue.message === 'Expected exactly one epoch-turn recovery output'))
  assert.ok(issues.some((issue) => issue.path === 'stalls[0].endedAtMs'))
  assert.ok(issues.some((issue) => issue.path === 'stalls[0].durationMs'))
  assert.ok(issues.some((issue) => issue.path === 'stalls[1].durationMs'))
})

test('simulator config rejects nondeterministic or invalid boundaries', () => {
  assert.throws(() => createSimulatorCases({
    ...DEFAULT_SIMULATOR_CONTRACT_CONFIG,
    contractVersion: 'future-simulator-contract' as 'multi-profile-simulator-v1',
  }), RangeError)
  assert.throws(() => createSimulatorCases({
    ...DEFAULT_SIMULATOR_CONTRACT_CONFIG,
    numericContract: 'other-numeric-contract' as 'normalized-scientific-pair-v1',
  }), RangeError)
  assert.throws(() => createSimulatorCases({
    ...DEFAULT_SIMULATOR_CONTRACT_CONFIG,
    rngAlgorithm: 'other-rng' as 'indexed-mix32-v1',
  }), RangeError)
  assert.throws(() => createSimulatorCases({
    ...DEFAULT_SIMULATOR_CONTRACT_CONFIG,
    baseSeed: -1,
  }), RangeError)
  assert.throws(() => createSimulatorCases({
    ...DEFAULT_SIMULATOR_CONTRACT_CONFIG,
    stepMs: DEFAULT_SIMULATOR_CONTRACT_CONFIG.horizonMs + 1,
  }), RangeError)
  assert.throws(() => createSimulatorCases({
    ...DEFAULT_SIMULATOR_CONTRACT_CONFIG,
    milestones: [{ id: 'bad', amount: '1.0e3' as '1e3' }],
  }))
  assert.throws(() => createSimulatorCases({
    ...DEFAULT_SIMULATOR_CONTRACT_CONFIG,
    milestones: [{ id: '', amount: '1e3' }],
  }), RangeError)
  assert.throws(() => createSimulatorCases({
    ...DEFAULT_SIMULATOR_CONTRACT_CONFIG,
    milestones: [
      { id: 'duplicate', amount: '1e3' },
      { id: 'duplicate', amount: '1e6' },
    ],
  }), RangeError)
  assert.throws(() => simulatorRandomSample(1, -1), RangeError)
})
