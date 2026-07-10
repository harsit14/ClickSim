import type {
  EconomyAmount,
  SerializedEconomyAmount,
  UniverseId,
} from '../src/content/universes/types'
import { universeById } from '../src/content/universes'
import {
  ONE_AMOUNT,
  ZERO_AMOUNT,
  AmountError,
  amountFromNumber,
  amountToNumber,
  compareAmounts,
  divideAmounts,
  gteAmount,
  multiplyAmountByNumber,
  multiplyAmounts,
  parseAmount,
  powAmount,
  serializeAmount,
  subtractAmounts,
  sumAmounts,
  toAmount,
} from '../src/core/numeric/amount'
import {
  DEFAULT_SIMULATOR_CONTRACT_CONFIG,
  SIMULATOR_CONTRACT_VERSION,
  SIMULATOR_PROFILES,
  createSimulatorCases,
  simulatorRandomSample,
  validateSimulationCaseResult,
  type BuildCandidateOutput,
  type CrossProfileDominanceOutput,
  type RateComponent,
  type RateComponentOutput,
  type SimulationCaseResult,
  type SimulationSuiteResult,
  type SimulatorCase,
  type SimulatorContractConfig,
  type SimulatorProfileId,
} from './simulator-contract'

const DAY_MS = 24 * 60 * 60 * 1_000
const BUILD_IDS = ['restorer', 'optimizer', 'performer', 'archivist'] as const

export interface UniverseSimulationFixture {
  readonly universeId: UniverseId
  readonly source: 'current-pack-profile-projection' | 'future-contract-fixture'
  readonly basePassiveRate: SerializedEconomyAmount
  readonly dailyGrowth: number
  readonly mechanicPotential: number
  readonly omenPotential: number
  readonly archivePotential: number
  readonly crossWorldPotential: number
  readonly purchasesPerDay: number
  readonly epochRecoveryDays: number
  readonly deepRecoveryDays: number
}

const FIXTURES: Readonly<Record<UniverseId, UniverseSimulationFixture>> = Object.freeze({
  emberlight: {
    universeId: 'emberlight', source: 'current-pack-profile-projection', basePassiveRate: '1e-1', dailyGrowth: 1.55,
    mechanicPotential: 0.22, omenPotential: 0.1, archivePotential: 0.14, crossWorldPotential: 3,
    purchasesPerDay: 310, epochRecoveryDays: 0.18, deepRecoveryDays: 0.8,
  },
  tidefall: {
    universeId: 'tidefall', source: 'current-pack-profile-projection', basePassiveRate: '1e-1', dailyGrowth: 1.53,
    mechanicPotential: 0.3, omenPotential: 0.08, archivePotential: 0.16, crossWorldPotential: 3.1,
    purchasesPerDay: 304, epochRecoveryDays: 0.2, deepRecoveryDays: 0.88,
  },
  verdance: {
    universeId: 'verdance', source: 'current-pack-profile-projection', basePassiveRate: '1.1e-1', dailyGrowth: 1.5,
    mechanicPotential: 0.32, omenPotential: 0.07, archivePotential: 0.18, crossWorldPotential: 3.2,
    purchasesPerDay: 302, epochRecoveryDays: 0.22, deepRecoveryDays: 0.92,
  },
  clockwork: {
    universeId: 'clockwork', source: 'current-pack-profile-projection', basePassiveRate: '9e-2', dailyGrowth: 1.57,
    mechanicPotential: 0.28, omenPotential: 0.06, archivePotential: 0.15, crossWorldPotential: 2.9,
    purchasesPerDay: 316, epochRecoveryDays: 0.16, deepRecoveryDays: 0.74,
  },
  prismata: {
    universeId: 'prismata', source: 'future-contract-fixture', basePassiveRate: '1e-1', dailyGrowth: 1.54,
    mechanicPotential: 0.34, omenPotential: 0.11, archivePotential: 0.17, crossWorldPotential: 3.1,
    purchasesPerDay: 308, epochRecoveryDays: 0.19, deepRecoveryDays: 0.82,
  },
  tempest: {
    universeId: 'tempest', source: 'future-contract-fixture', basePassiveRate: '1.2e-1', dailyGrowth: 1.51,
    mechanicPotential: 0.36, omenPotential: 0.13, archivePotential: 0.14, crossWorldPotential: 3.2,
    purchasesPerDay: 306, epochRecoveryDays: 0.21, deepRecoveryDays: 0.86,
  },
  canticle: {
    universeId: 'canticle', source: 'future-contract-fixture', basePassiveRate: '1e-1', dailyGrowth: 1.52,
    mechanicPotential: 0.4, omenPotential: 0.05, archivePotential: 0.19, crossWorldPotential: 3,
    purchasesPerDay: 305, epochRecoveryDays: 0.2, deepRecoveryDays: 0.84,
  },
})

export function universeSimulationFixture(universeId: UniverseId): UniverseSimulationFixture {
  const fixture = FIXTURES[universeId]
  if (fixture.source !== 'current-pack-profile-projection') return fixture
  const pack = universeById(universeId)
  const firstRate = pack.generators[0]?.baseRate
  if (firstRate === undefined) throw new RangeError(`${universeId} has no generator fixture`)
  return { ...fixture, basePassiveRate: serializeAmount(toAmount(firstRate)) }
}

function strategyPurchaseScale(strategy: SimulatorCase['profile']['purchaseStrategy']): number {
  if (strategy === 'first-affordable') return 0.72
  if (strategy === 'lookahead-optimized') return 1.12
  return 1
}

function dailyGrowthFor(simulationCase: SimulatorCase, fixture: UniverseSimulationFixture): number {
  return fixture.dailyGrowth
}

function stepGrowthAmount(simulationCase: SimulatorCase, fixture: UniverseSimulationFixture): EconomyAmount {
  const growthPerStep = dailyGrowthFor(simulationCase, fixture)
    ** (simulationCase.config.stepMs / DAY_MS)
  return amountFromNumber(growthPerStep)
}

function growthAtStep(stepGrowth: EconomyAmount, step: number): EconomyAmount {
  return powAmount(stepGrowth, step)
}

function rateAtStep(
  initialRate: EconomyAmount,
  stepGrowth: EconomyAmount,
  step: number,
): EconomyAmount {
  return multiplyAmounts(initialRate, growthAtStep(stepGrowth, step))
}

function earningsAtStep(
  initialRate: EconomyAmount,
  stepGrowth: EconomyAmount,
  step: number,
  stepMs: number,
): EconomyAmount {
  if (step <= 0) return ZERO_AMOUNT
  const growthDelta = subtractAmounts(stepGrowth, ONE_AMOUNT)
  if (growthDelta.mantissa === 0) return multiplyAmountByNumber(initialRate, step * stepMs / 1000)
  const series = divideAmounts(
    subtractAmounts(growthAtStep(stepGrowth, step), ONE_AMOUNT),
    growthDelta,
  )
  return multiplyAmountByNumber(multiplyAmounts(initialRate, series), stepMs / 1000)
}

function componentInitialRates(
  simulationCase: SimulatorCase,
  fixture: UniverseSimulationFixture,
): Readonly<Record<RateComponent, EconomyAmount>> {
  const base = parseAmount(fixture.basePassiveRate)
  const offlineScale = simulationCase.profile.sessionMode === 'offline' ? 0.65 : 1
  const omenSample = simulatorRandomSample(simulationCase.seed, 0)
  return {
    passive: multiplyAmountByNumber(base, offlineScale),
    click: multiplyAmountByNumber(base, simulationCase.profile.clicksPerSecond * 0.05),
    'universe-mechanic': multiplyAmountByNumber(base, simulationCase.profile.mechanicUse * fixture.mechanicPotential),
    omen: multiplyAmountByNumber(
      base,
      simulationCase.profile.rhythmRewardMode === 'none'
        ? 0
        : fixture.omenPotential * (0.8 + omenSample * 0.4),
    ),
    archive: multiplyAmountByNumber(base, simulationCase.progression.archiveEffectsEnabled ? fixture.archivePotential : 0),
    'cross-world': multiplyAmountByNumber(base, simulationCase.progression.beaconAcceleration ? fixture.crossWorldPotential : 0),
  }
}

function ratioToFiniteNumber(numerator: EconomyAmount, denominator: EconomyAmount): number {
  if (numerator.mantissa === 0) return 0
  const ratio = divideAmounts(numerator, denominator)
  if (ratio.exponent > 0) throw new RangeError('Expected a bounded simulator ratio')
  return amountToNumber(ratio)
}

function compositionAtHorizon(
  initial: Readonly<Record<RateComponent, EconomyAmount>>,
  stepGrowth: EconomyAmount,
  horizonSteps: number,
): Readonly<Record<RateComponent, RateComponentOutput>> {
  const components = Object.keys(initial) as RateComponent[]
  const final = Object.fromEntries(components.map((component) => [
    component,
    rateAtStep(initial[component], stepGrowth, horizonSteps),
  ])) as Record<RateComponent, EconomyAmount>
  const total = sumAmounts(components.map((component) => final[component]))
  if (total.mantissa === 0) throw new RangeError('Simulator rate composition cannot be empty')
  const shares = components.map((component) => ratioToFiniteNumber(final[component], total))
  const shareTotal = shares.reduce((sum, share) => sum + share, 0)
  const correction = 1 - shareTotal
  const firstNonzero = shares.findIndex((share) => share > 0)
  if (firstNonzero >= 0) shares[firstNonzero] += correction
  return Object.fromEntries(components.map((component, index) => [component, {
    amountPerSecond: serializeAmount(final[component]),
    share: shares[index],
  }])) as Readonly<Record<RateComponent, RateComponentOutput>>
}

function milestoneTime(
  simulationCase: SimulatorCase,
  initialRate: EconomyAmount,
  stepGrowth: EconomyAmount,
  target: EconomyAmount,
): number | null {
  const horizonSteps = Math.floor(simulationCase.config.horizonMs / simulationCase.config.stepMs)
  if (!gteAmount(earningsAtStep(initialRate, stepGrowth, horizonSteps, simulationCase.config.stepMs), target)) {
    return null
  }
  let low = 1
  let high = horizonSteps
  let guard = 0
  while (low < high) {
    if (++guard > 64) throw new RangeError('stalled numeric milestone comparison')
    const middle = Math.floor((low + high) / 2)
    if (gteAmount(earningsAtStep(initialRate, stepGrowth, middle, simulationCase.config.stepMs), target)) high = middle
    else low = middle + 1
  }
  return low * simulationCase.config.stepMs
}

function buildFactors(simulationCase: SimulatorCase): Readonly<Record<(typeof BUILD_IDS)[number], number>> {
  const profile = simulationCase.profile
  return {
    restorer: profile.sessionMode === 'offline' ? 1.34 : 1.08,
    optimizer: 1.08 + profile.mechanicUse * 0.22,
    performer: 1.04 + Math.min(0.3, profile.clicksPerSecond * 0.045),
    archivist: simulationCase.progression.archiveEffectsEnabled ? 1.36 : 1.06,
  }
}

function buildDominance(
  simulationCase: SimulatorCase,
  finalRate: EconomyAmount,
  milestoneScoreMs: number | null,
): SimulationCaseResult['buildDominance'] {
  const factors = buildFactors(simulationCase)
  const candidatesWithAmounts = BUILD_IDS.map((buildId) => ({
    buildId,
    amount: multiplyAmountByNumber(finalRate, factors[buildId]),
  })).sort((left, right) => compareAmounts(right.amount, left.amount))
  const leader = candidatesWithAmounts[0]
  const runnerUp = candidatesWithAmounts[1]
  const leadRatio = ratioToFiniteNumber(leader.amount, runnerUp.amount)
  const candidates: BuildCandidateOutput[] = candidatesWithAmounts.map(({ buildId, amount }) => ({
    buildId,
    milestoneScoreMs: milestoneScoreMs === null ? null : milestoneScoreMs / factors[buildId],
    finalRate: serializeAmount(amount),
    viable: ratioToFiniteNumber(leader.amount, amount) <= 1.5,
  }))
  return {
    candidates,
    leaderId: leader.buildId,
    runnerUpId: runnerUp.buildId,
    leadRatio,
    dominatesAllMeasuredContexts: false,
  }
}

function fallbackResult(
  simulationCase: SimulatorCase,
  error: unknown,
  lastValidAmount: SerializedEconomyAmount,
): SimulationCaseResult {
  const exponentOverflow = error instanceof AmountError && error.failure === 'exponent-overflow'
  const stalledComparison = error instanceof RangeError && /stalled numeric/.test(error.message)
  const diagnostic = error instanceof Error ? error.message : String(error)
  return {
    contractVersion: SIMULATOR_CONTRACT_VERSION,
    caseId: simulationCase.id,
    seed: simulationCase.seed,
    milestones: simulationCase.config.milestones.map((milestone) => ({ id: milestone.id, target: milestone.amount, reachedAtMs: null })),
    purchaseGaps: { purchaseCount: 0, longestMs: 0, percentile95Ms: 0, gapsOverThreshold: 0 },
    rateComposition: {
      passive: { amountPerSecond: '0', share: 1 },
      click: { amountPerSecond: '0', share: 0 },
      'universe-mechanic': { amountPerSecond: '0', share: 0 },
      omen: { amountPerSecond: '0', share: 0 },
      archive: { amountPerSecond: '0', share: 0 },
      'cross-world': { amountPerSecond: '0', share: 0 },
    },
    resetRecovery: [
      { boundary: 'epoch-turn', priorFrontierRate: '0', recoveredAtMs: null, recoveryDurationMs: null, rateRatioAtHorizon: 0 },
      { boundary: 'deep-collapse', priorFrontierRate: '0', recoveredAtMs: null, recoveryDurationMs: null, rateRatioAtHorizon: 0 },
    ],
    buildDominance: {
      candidates: BUILD_IDS.map((buildId) => ({ buildId, milestoneScoreMs: null, finalRate: '0', viable: false })),
      leaderId: null, runnerUpId: null, leadRatio: null, dominatesAllMeasuredContexts: false,
    },
    numericHealth: {
      passed: false,
      exponentOverflow,
      nonFiniteValue: !exponentOverflow && !stalledComparison,
      invalidCanonicalAmount: false,
      stalledComparison,
      lastValidAmount,
      diagnostics: [diagnostic],
    },
    stalls: stalledComparison
      ? [{ startedAtMs: 0, endedAtMs: null, durationMs: 0, reason: 'numeric-comparison' }]
      : [],
  }
}

/** Simulate one explicit profile/progression case without hidden time, RNG, or UI state. */
export function simulateProfileCase(simulationCase: SimulatorCase): SimulationCaseResult {
  let lastValidAmount: SerializedEconomyAmount = '0'
  try {
    const fixture = universeSimulationFixture(simulationCase.universeId)
    const initialComponents = componentInitialRates(simulationCase, fixture)
    const initialRate = sumAmounts(Object.values(initialComponents))
    lastValidAmount = serializeAmount(initialRate)
    const stepGrowth = stepGrowthAmount(simulationCase, fixture)
    const horizonSteps = Math.floor(simulationCase.config.horizonMs / simulationCase.config.stepMs)
    const finalRate = rateAtStep(initialRate, stepGrowth, horizonSteps)
    const finalEarnings = earningsAtStep(initialRate, stepGrowth, horizonSteps, simulationCase.config.stepMs)
    lastValidAmount = serializeAmount(finalEarnings)
    const milestones = simulationCase.config.milestones.map((milestone) => ({
      id: milestone.id,
      target: milestone.amount,
      reachedAtMs: milestoneTime(simulationCase, initialRate, stepGrowth, parseAmount(milestone.amount)),
    }))
    const days = simulationCase.config.horizonMs / DAY_MS
    const purchaseCount = Math.floor(fixture.purchasesPerDay * strategyPurchaseScale(simulationCase.profile.purchaseStrategy) * days)
    const averageGap = purchaseCount > 0 ? simulationCase.config.horizonMs / purchaseCount : simulationCase.config.horizonMs
    const longestMs = Math.min(simulationCase.config.horizonMs, averageGap * 1.8)
    const percentile95Ms = Math.min(longestMs, averageGap * 1.35)
    const gapsOverThreshold = longestMs > simulationCase.config.stallThresholdMs
      ? Math.min(purchaseCount, Math.ceil(purchaseCount * 0.05))
      : 0
    const stalls = simulationCase.profile.sessionMode !== 'offline' && longestMs > simulationCase.config.stallThresholdMs
      ? [{
          startedAtMs: 0,
          endedAtMs: longestMs,
          durationMs: longestMs,
          reason: 'no-affordable-purchase' as const,
        }]
      : []
    const epochDuration = fixture.epochRecoveryDays * DAY_MS / (1 + simulationCase.profile.mechanicUse)
    const deepDuration = fixture.deepRecoveryDays * DAY_MS / (1 + simulationCase.profile.mechanicUse * 0.8)
    const frontierRate = rateAtStep(initialRate, stepGrowth, Math.floor(horizonSteps * 0.2))
    const deepFrontierRate = rateAtStep(initialRate, stepGrowth, Math.floor(horizonSteps * 0.55))
    const milestoneScore = milestones.find((milestone) => milestone.id === 'world-1e18')?.reachedAtMs ?? null
    return {
      contractVersion: SIMULATOR_CONTRACT_VERSION,
      caseId: simulationCase.id,
      seed: simulationCase.seed,
      milestones,
      purchaseGaps: { purchaseCount, longestMs, percentile95Ms, gapsOverThreshold },
      rateComposition: compositionAtHorizon(initialComponents, stepGrowth, horizonSteps),
      resetRecovery: [
        {
          boundary: 'epoch-turn',
          priorFrontierRate: serializeAmount(frontierRate),
          recoveredAtMs: epochDuration,
          recoveryDurationMs: epochDuration,
          rateRatioAtHorizon: 2 + simulationCase.profile.mechanicUse,
        },
        {
          boundary: 'deep-collapse',
          priorFrontierRate: serializeAmount(deepFrontierRate),
          recoveredAtMs: deepDuration,
          recoveryDurationMs: deepDuration,
          rateRatioAtHorizon: 1.5 + simulationCase.profile.mechanicUse * 0.75,
        },
      ],
      buildDominance: buildDominance(simulationCase, finalRate, milestoneScore),
      numericHealth: {
        passed: true,
        exponentOverflow: false,
        nonFiniteValue: false,
        invalidCanonicalAmount: false,
        stalledComparison: false,
        lastValidAmount,
        diagnostics: [],
      },
      stalls,
    }
  } catch (error) {
    return fallbackResult(simulationCase, error, lastValidAmount)
  }
}

function aggregateDominance(results: readonly SimulationCaseResult[]): readonly CrossProfileDominanceOutput[] {
  return BUILD_IDS.map((buildId) => {
    const led = results.filter((result) => result.buildDominance.leaderId === buildId)
    const profileIds = SIMULATOR_PROFILES
      .filter((profile) => led.some((result) => result.caseId.includes(`/${profile.id}/`)))
      .map((profile) => profile.id)
    const leadRatios = led
      .map((result) => result.buildDominance.leadRatio)
      .filter((ratio): ratio is number => ratio !== null)
    const requiredContexts: SimulatorProfileId[] = [
      'zero-skill-idle-offline',
      'casual-one-click-per-second',
      'active-six-clicks-per-second',
      'reduced-rhythm-accessibility',
    ]
    const casesPerProfile = results.length / SIMULATOR_PROFILES.length
    return {
      buildId,
      caseIdsLed: led.map((result) => result.caseId),
      profileIdsLed: profileIds,
      dominatesIdleActiveOfflineAndAccessibility: requiredContexts.every((id) =>
        led.filter((result) => result.caseId.includes(`/${id}/`)).length === casesPerProfile),
      minimumLeadRatio: leadRatios.length > 0 ? Math.min(...leadRatios) : 1,
    }
  })
}

export function runSimulationSuite(
  config: SimulatorContractConfig = DEFAULT_SIMULATOR_CONTRACT_CONFIG,
): SimulationSuiteResult {
  const cases = createSimulatorCases(config)
  const results = cases.map(simulateProfileCase)
  const failedCaseIds = results
    .filter((result, index) => !result.numericHealth.passed || validateSimulationCaseResult(cases[index], result).length > 0)
    .map((result) => result.caseId)
  return {
    contractVersion: SIMULATOR_CONTRACT_VERSION,
    config,
    cases: results,
    dominance: aggregateDominance(results),
    failedCaseIds,
    stalledCaseIds: results.filter((result) => result.stalls.length > 0).map((result) => result.caseId),
  }
}
