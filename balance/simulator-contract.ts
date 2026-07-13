/**
 * SIM-001 frozen multi-profile contract, consumed by the F1b profile engine.
 * The additive current-pack curve audit remains separate from this schema.
 */
import type {
  SerializedEconomyAmount,
  UniverseId,
} from '../src/content/universes/types'
import { parseAmount } from '../src/core/numeric/amount'

export const SIMULATOR_CONTRACT_VERSION = 'multi-profile-simulator-v1' as const
export const SIMULATOR_RNG_ALGORITHM = 'indexed-mix32-v1' as const

export const SIMULATOR_UNIVERSE_IDS = [
  'emberlight',
  'tidefall',
  'verdance',
  'clockwork',
  'brahmalok',
  'vishnulok',
  'kailash',
] as const satisfies readonly UniverseId[]

export type SimulatorProfileId =
  | 'zero-skill-idle-offline'
  | 'casual-one-click-per-second'
  | 'active-six-clicks-per-second'
  | 'competent-universe-mechanic'
  | 'highly-optimized-build'
  | 'reduced-rhythm-accessibility'

export interface SimulatorProfile {
  readonly id: SimulatorProfileId
  readonly label: string
  readonly sessionMode: 'offline' | 'open-idle' | 'active'
  readonly clicksPerSecond: number
  /** Deterministic fraction of available world-law opportunities taken. */
  readonly mechanicUse: number
  readonly purchaseStrategy: 'first-affordable' | 'greedy-payback' | 'lookahead-optimized'
  readonly rhythmRewardMode: 'none' | 'performed' | 'averaged-accessibility'
  readonly assistiveInputEligible: boolean
}

export const SIMULATOR_PROFILES = [
  {
    id: 'zero-skill-idle-offline',
    label: 'Zero-skill idle/offline',
    sessionMode: 'offline',
    clicksPerSecond: 0,
    mechanicUse: 0,
    purchaseStrategy: 'first-affordable',
    rhythmRewardMode: 'none',
    assistiveInputEligible: true,
  },
  {
    id: 'casual-one-click-per-second',
    label: 'Casual one click per second',
    sessionMode: 'active',
    clicksPerSecond: 1,
    mechanicUse: 0.25,
    purchaseStrategy: 'greedy-payback',
    rhythmRewardMode: 'performed',
    assistiveInputEligible: true,
  },
  {
    id: 'active-six-clicks-per-second',
    label: 'Active six clicks per second',
    sessionMode: 'active',
    clicksPerSecond: 6,
    mechanicUse: 0.5,
    purchaseStrategy: 'greedy-payback',
    rhythmRewardMode: 'performed',
    assistiveInputEligible: false,
  },
  {
    id: 'competent-universe-mechanic',
    label: 'Competent universe mechanic use',
    sessionMode: 'active',
    clicksPerSecond: 2,
    mechanicUse: 0.8,
    purchaseStrategy: 'greedy-payback',
    rhythmRewardMode: 'performed',
    assistiveInputEligible: true,
  },
  {
    id: 'highly-optimized-build',
    label: 'Highly optimized build',
    sessionMode: 'active',
    clicksPerSecond: 4,
    mechanicUse: 1,
    purchaseStrategy: 'lookahead-optimized',
    rhythmRewardMode: 'performed',
    assistiveInputEligible: false,
  },
  {
    id: 'reduced-rhythm-accessibility',
    label: 'Reduced-rhythm accessibility mode',
    sessionMode: 'active',
    clicksPerSecond: 1,
    mechanicUse: 0.8,
    purchaseStrategy: 'greedy-payback',
    rhythmRewardMode: 'averaged-accessibility',
    assistiveInputEligible: true,
  },
] as const satisfies readonly SimulatorProfile[]

export type SimulatorVisitState = 'first-visit' | 'beacon-accelerated-revisit'
export type SimulatorArchiveState = 'no-archive' | 'complete-archive'

export interface SimulatorProgressionState {
  readonly visit: SimulatorVisitState
  readonly archive: SimulatorArchiveState
  /** Explicit state flags prevent a simulator from inferring acceleration from IDs. */
  readonly beaconAcceleration: boolean
  readonly archiveEffectsEnabled: boolean
}

export const SIMULATOR_PROGRESSION_STATES = [
  {
    visit: 'first-visit',
    archive: 'no-archive',
    beaconAcceleration: false,
    archiveEffectsEnabled: false,
  },
  {
    visit: 'first-visit',
    archive: 'complete-archive',
    beaconAcceleration: false,
    archiveEffectsEnabled: true,
  },
  {
    visit: 'beacon-accelerated-revisit',
    archive: 'no-archive',
    beaconAcceleration: true,
    archiveEffectsEnabled: false,
  },
  {
    visit: 'beacon-accelerated-revisit',
    archive: 'complete-archive',
    beaconAcceleration: true,
    archiveEffectsEnabled: true,
  },
] as const satisfies readonly SimulatorProgressionState[]

export interface SimulatorMilestoneTarget {
  readonly id: string
  readonly amount: SerializedEconomyAmount
}

export interface SimulatorContractConfig {
  readonly contractVersion: typeof SIMULATOR_CONTRACT_VERSION
  readonly numericContract: 'normalized-scientific-pair-v1'
  readonly rngAlgorithm: typeof SIMULATOR_RNG_ALGORITHM
  readonly baseSeed: number
  readonly horizonMs: number
  readonly stepMs: number
  readonly stallThresholdMs: number
  readonly dominanceLeadRatio: number
  readonly milestones: readonly SimulatorMilestoneTarget[]
}

const DAY_MS = 24 * 60 * 60 * 1_000

export const DEFAULT_SIMULATOR_CONTRACT_CONFIG: SimulatorContractConfig = Object.freeze({
  contractVersion: SIMULATOR_CONTRACT_VERSION,
  numericContract: 'normalized-scientific-pair-v1',
  rngAlgorithm: SIMULATOR_RNG_ALGORITHM,
  baseSeed: 0x454d4245,
  horizonMs: 5 * 365 * DAY_MS,
  stepMs: 60_000,
  stallThresholdMs: 10 * 60_000,
  dominanceLeadRatio: 1.25,
  milestones: Object.freeze([
    { id: 'world-1e3', amount: '1e3' },
    { id: 'world-1e6', amount: '1e6' },
    { id: 'world-1e12', amount: '1e12' },
    { id: 'world-1e18', amount: '1e18' },
    { id: 'multi-year-1e308', amount: '1e308' },
    { id: 'beyond-number-range', amount: '1e309' },
  ] satisfies readonly SimulatorMilestoneTarget[]),
})

export interface SimulatorCase {
  readonly id: string
  readonly universeId: UniverseId
  readonly profile: SimulatorProfile
  readonly progression: SimulatorProgressionState
  readonly seed: number
  readonly config: SimulatorContractConfig
}

function assertConfig(config: SimulatorContractConfig): void {
  if (config.contractVersion !== SIMULATOR_CONTRACT_VERSION) {
    throw new RangeError(`Unsupported simulator contract version ${String(config.contractVersion)}`)
  }
  if (config.numericContract !== 'normalized-scientific-pair-v1') {
    throw new RangeError(`Unsupported numeric contract ${String(config.numericContract)}`)
  }
  if (config.rngAlgorithm !== SIMULATOR_RNG_ALGORITHM) {
    throw new RangeError(`Unsupported simulator RNG algorithm ${String(config.rngAlgorithm)}`)
  }
  if (!Number.isInteger(config.baseSeed) || config.baseSeed < 0 || config.baseSeed > 0xffff_ffff) {
    throw new RangeError('Simulator baseSeed must be an unsigned 32-bit integer')
  }
  for (const [name, value] of [
    ['horizonMs', config.horizonMs],
    ['stepMs', config.stepMs],
    ['stallThresholdMs', config.stallThresholdMs],
  ] as const) {
    if (!Number.isSafeInteger(value) || value <= 0) throw new RangeError(`${name} must be a positive safe integer`)
  }
  if (config.stepMs > config.horizonMs) throw new RangeError('stepMs cannot exceed horizonMs')
  if (!Number.isFinite(config.dominanceLeadRatio) || config.dominanceLeadRatio <= 1) {
    throw new RangeError('dominanceLeadRatio must be finite and greater than one')
  }
  const milestoneIds = new Set<string>()
  config.milestones.forEach((milestone) => {
    if (milestone.id.trim().length === 0) throw new RangeError('Milestone ids must not be empty')
    if (milestoneIds.has(milestone.id)) throw new RangeError(`Duplicate milestone id ${milestone.id}`)
    milestoneIds.add(milestone.id)
    parseAmount(milestone.amount)
  })
}

/** FNV-1a over explicit case identity; it is stable across process and wall time. */
export function deriveSimulatorSeed(baseSeed: number, identity: string): number {
  let hash = (0x811c9dc5 ^ baseSeed) >>> 0
  for (let index = 0; index < identity.length; index++) {
    hash ^= identity.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash === 0 ? 1 : hash
}

/** Indexed deterministic sample: order-independent and free of hidden mutable RNG state. */
export function simulatorRandomSample(seed: number, sampleIndex: number): number {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffff_ffff) {
    throw new RangeError('Simulator seed must be an unsigned 32-bit integer')
  }
  if (!Number.isSafeInteger(sampleIndex) || sampleIndex < 0) {
    throw new RangeError('Simulator sample index must be a nonnegative safe integer')
  }
  let value = (seed + Math.imul(sampleIndex + 1, 0x9e3779b1)) >>> 0
  value ^= value >>> 16
  value = Math.imul(value, 0x21f0aaad) >>> 0
  value ^= value >>> 15
  value = Math.imul(value, 0x735a2d97) >>> 0
  value ^= value >>> 15
  return (value >>> 0) / 0x1_0000_0000
}

export function createSimulatorCases(
  config: SimulatorContractConfig = DEFAULT_SIMULATOR_CONTRACT_CONFIG,
): readonly SimulatorCase[] {
  assertConfig(config)
  const cases: SimulatorCase[] = []
  for (const universeId of SIMULATOR_UNIVERSE_IDS) {
    for (const profile of SIMULATOR_PROFILES) {
      for (const progression of SIMULATOR_PROGRESSION_STATES) {
        const id = [universeId, profile.id, progression.visit, progression.archive].join('/')
        cases.push(Object.freeze({
          id,
          universeId,
          profile,
          progression,
          seed: deriveSimulatorSeed(config.baseSeed, id),
          config,
        }))
      }
    }
  }
  return Object.freeze(cases)
}

export interface MilestoneTimeOutput {
  readonly id: string
  readonly target: SerializedEconomyAmount
  readonly reachedAtMs: number | null
}

export interface PurchaseGapOutput {
  readonly purchaseCount: number
  readonly longestMs: number
  readonly percentile95Ms: number
  readonly gapsOverThreshold: number
}

export type RateComponent =
  | 'passive'
  | 'click'
  | 'universe-mechanic'
  | 'omen'
  | 'archive'
  | 'cross-world'

export interface RateComponentOutput {
  readonly amountPerSecond: SerializedEconomyAmount
  readonly share: number
}

export interface ResetRecoveryOutput {
  readonly boundary: 'epoch-turn' | 'deep-collapse'
  readonly priorFrontierRate: SerializedEconomyAmount
  readonly recoveredAtMs: number | null
  readonly recoveryDurationMs: number | null
  readonly rateRatioAtHorizon: number
}

export interface BuildCandidateOutput {
  readonly buildId: string
  readonly milestoneScoreMs: number | null
  readonly finalRate: SerializedEconomyAmount
  readonly viable: boolean
}

export interface BuildDominanceOutput {
  readonly candidates: readonly BuildCandidateOutput[]
  readonly leaderId: string | null
  readonly runnerUpId: string | null
  readonly leadRatio: number | null
  /** Suite aggregation sets this only after idle, active, offline and accessibility contexts run. */
  readonly dominatesAllMeasuredContexts: boolean
}

export interface NumericHealthOutput {
  readonly passed: boolean
  readonly exponentOverflow: boolean
  readonly nonFiniteValue: boolean
  readonly invalidCanonicalAmount: boolean
  readonly stalledComparison: boolean
  readonly lastValidAmount: SerializedEconomyAmount
  readonly diagnostics: readonly string[]
}

export interface StalledStateOutput {
  readonly startedAtMs: number
  readonly endedAtMs: number | null
  readonly durationMs: number
  readonly reason:
    | 'no-affordable-purchase'
    | 'no-meaningful-upgrade'
    | 'reset-recovery'
    | 'mechanic-dead-zone'
    | 'numeric-comparison'
}

export interface SimulationCaseResult {
  readonly contractVersion: typeof SIMULATOR_CONTRACT_VERSION
  readonly caseId: string
  readonly seed: number
  readonly milestones: readonly MilestoneTimeOutput[]
  readonly purchaseGaps: PurchaseGapOutput
  readonly rateComposition: Readonly<Record<RateComponent, RateComponentOutput>>
  readonly resetRecovery: readonly ResetRecoveryOutput[]
  readonly buildDominance: BuildDominanceOutput
  readonly numericHealth: NumericHealthOutput
  readonly stalls: readonly StalledStateOutput[]
}

export interface CrossProfileDominanceOutput {
  readonly buildId: string
  readonly caseIdsLed: readonly string[]
  readonly profileIdsLed: readonly SimulatorProfileId[]
  readonly dominatesIdleActiveOfflineAndAccessibility: boolean
  readonly minimumLeadRatio: number
}

export interface SimulationSuiteResult {
  readonly contractVersion: typeof SIMULATOR_CONTRACT_VERSION
  readonly config: SimulatorContractConfig
  readonly cases: readonly SimulationCaseResult[]
  readonly dominance: readonly CrossProfileDominanceOutput[]
  readonly failedCaseIds: readonly string[]
  readonly stalledCaseIds: readonly string[]
}

export interface SimulatorResultIssue {
  readonly path: string
  readonly message: string
}

function isNonnegativeFinite(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

function validateAmount(
  amount: SerializedEconomyAmount,
  path: string,
  issues: SimulatorResultIssue[],
): void {
  try {
    parseAmount(amount)
  } catch {
    issues.push({ path, message: 'Expected a canonical scientific economy amount' })
  }
}

/** Validate a result against its deterministic case and fail-closed numeric policy. */
export function validateSimulationCaseResult(
  simulationCase: SimulatorCase,
  result: SimulationCaseResult,
): readonly SimulatorResultIssue[] {
  const issues: SimulatorResultIssue[] = []
  if (result.contractVersion !== SIMULATOR_CONTRACT_VERSION) {
    issues.push({ path: 'contractVersion', message: 'Unexpected simulator contract version' })
  }
  if (result.caseId !== simulationCase.id) issues.push({ path: 'caseId', message: 'Result case id mismatch' })
  if (result.seed !== simulationCase.seed) issues.push({ path: 'seed', message: 'Result seed mismatch' })

  const expectedMilestones = new Map(simulationCase.config.milestones.map((item) => [item.id, item.amount]))
  if (result.milestones.length !== expectedMilestones.size) {
    issues.push({ path: 'milestones', message: 'Result must report every configured milestone exactly once' })
  }
  const seenMilestones = new Set<string>()
  for (const [index, milestone] of result.milestones.entries()) {
    const path = `milestones[${index}]`
    validateAmount(milestone.target, `${path}.target`, issues)
    if (seenMilestones.has(milestone.id)) issues.push({ path: `${path}.id`, message: 'Duplicate milestone id' })
    seenMilestones.add(milestone.id)
    if (expectedMilestones.get(milestone.id) !== milestone.target) {
      issues.push({ path, message: 'Milestone target does not match configuration' })
    }
    if (milestone.reachedAtMs !== null && !isNonnegativeFinite(milestone.reachedAtMs)) {
      issues.push({ path: `${path}.reachedAtMs`, message: 'Milestone time must be null or finite and nonnegative' })
    }
  }

  const gaps = result.purchaseGaps
  if (!Number.isSafeInteger(gaps.purchaseCount) || gaps.purchaseCount < 0) {
    issues.push({ path: 'purchaseGaps.purchaseCount', message: 'Purchase count must be a nonnegative safe integer' })
  }
  for (const key of ['longestMs', 'percentile95Ms'] as const) {
    if (!isNonnegativeFinite(gaps[key])) issues.push({ path: `purchaseGaps.${key}`, message: 'Gap must be finite and nonnegative' })
  }
  if (gaps.percentile95Ms > gaps.longestMs) {
    issues.push({ path: 'purchaseGaps.percentile95Ms', message: '95th percentile cannot exceed longest gap' })
  }
  if (!Number.isSafeInteger(gaps.gapsOverThreshold) || gaps.gapsOverThreshold < 0) {
    issues.push({ path: 'purchaseGaps.gapsOverThreshold', message: 'Threshold count must be a nonnegative safe integer' })
  } else if (gaps.gapsOverThreshold > gaps.purchaseCount) {
    issues.push({ path: 'purchaseGaps.gapsOverThreshold', message: 'Threshold count cannot exceed purchase count' })
  }

  let compositionShare = 0
  for (const component of [
    'passive', 'click', 'universe-mechanic', 'omen', 'archive', 'cross-world',
  ] as const satisfies readonly RateComponent[]) {
    const output = result.rateComposition[component]
    if (!output) {
      issues.push({ path: `rateComposition.${component}`, message: 'Missing rate component' })
      continue
    }
    validateAmount(output.amountPerSecond, `rateComposition.${component}.amountPerSecond`, issues)
    if (!Number.isFinite(output.share) || output.share < 0 || output.share > 1) {
      issues.push({ path: `rateComposition.${component}.share`, message: 'Rate share must be between zero and one' })
    } else compositionShare += output.share
  }
  if (Math.abs(compositionShare - 1) > 1e-9) {
    issues.push({ path: 'rateComposition', message: 'Rate component shares must sum to one' })
  }

  for (const [index, recovery] of result.resetRecovery.entries()) {
    const path = `resetRecovery[${index}]`
    validateAmount(recovery.priorFrontierRate, `${path}.priorFrontierRate`, issues)
    if (recovery.recoveredAtMs !== null && !isNonnegativeFinite(recovery.recoveredAtMs)) {
      issues.push({ path: `${path}.recoveredAtMs`, message: 'Recovery time must be null or finite and nonnegative' })
    }
    if (recovery.recoveryDurationMs !== null && !isNonnegativeFinite(recovery.recoveryDurationMs)) {
      issues.push({ path: `${path}.recoveryDurationMs`, message: 'Recovery duration must be null or finite and nonnegative' })
    }
    if (!isNonnegativeFinite(recovery.rateRatioAtHorizon)) {
      issues.push({ path: `${path}.rateRatioAtHorizon`, message: 'Recovery ratio must be finite and nonnegative' })
    }
  }
  if (result.resetRecovery.length !== 2) {
    issues.push({ path: 'resetRecovery', message: 'Result must contain exactly two reset recovery entries' })
  }
  const recoveryBoundaryCounts = new Map<ResetRecoveryOutput['boundary'], number>()
  for (const recovery of result.resetRecovery) {
    recoveryBoundaryCounts.set(recovery.boundary, (recoveryBoundaryCounts.get(recovery.boundary) ?? 0) + 1)
  }
  for (const boundary of ['epoch-turn', 'deep-collapse'] as const) {
    if (recoveryBoundaryCounts.get(boundary) !== 1) {
      issues.push({ path: 'resetRecovery', message: `Expected exactly one ${boundary} recovery output` })
    }
  }

  const candidateIds = new Set<string>()
  if (result.buildDominance.candidates.length < 4) {
    issues.push({ path: 'buildDominance.candidates', message: 'All four first-class doctrines must be compared' })
  }
  for (const [index, candidate] of result.buildDominance.candidates.entries()) {
    const path = `buildDominance.candidates[${index}]`
    if (candidateIds.has(candidate.buildId)) issues.push({ path: `${path}.buildId`, message: 'Duplicate build id' })
    candidateIds.add(candidate.buildId)
    validateAmount(candidate.finalRate, `${path}.finalRate`, issues)
    if (candidate.milestoneScoreMs !== null && !isNonnegativeFinite(candidate.milestoneScoreMs)) {
      issues.push({ path: `${path}.milestoneScoreMs`, message: 'Build score must be null or finite and nonnegative' })
    }
  }
  for (const [key, id] of [
    ['leaderId', result.buildDominance.leaderId],
    ['runnerUpId', result.buildDominance.runnerUpId],
  ] as const) {
    if (id !== null && !candidateIds.has(id)) issues.push({ path: `buildDominance.${key}`, message: 'Unknown build id' })
  }
  if (result.buildDominance.leadRatio !== null
    && (!Number.isFinite(result.buildDominance.leadRatio) || result.buildDominance.leadRatio < 1)) {
    issues.push({ path: 'buildDominance.leadRatio', message: 'Lead ratio must be null or finite and at least one' })
  }

  validateAmount(result.numericHealth.lastValidAmount, 'numericHealth.lastValidAmount', issues)
  const numericFailure = result.numericHealth.exponentOverflow
    || result.numericHealth.nonFiniteValue
    || result.numericHealth.invalidCanonicalAmount
    || result.numericHealth.stalledComparison
  if (result.numericHealth.passed === numericFailure) {
    issues.push({ path: 'numericHealth.passed', message: 'Any numeric failure must fail the profile' })
  }
  if (numericFailure && result.numericHealth.diagnostics.length === 0) {
    issues.push({ path: 'numericHealth.diagnostics', message: 'Numeric failures require a diagnostic' })
  }

  for (const [index, stall] of result.stalls.entries()) {
    const path = `stalls[${index}]`
    if (!isNonnegativeFinite(stall.startedAtMs) || !isNonnegativeFinite(stall.durationMs)) {
      issues.push({ path, message: 'Stall times must be finite and nonnegative' })
    }
    if (stall.endedAtMs !== null && !isNonnegativeFinite(stall.endedAtMs)) {
      issues.push({ path: `${path}.endedAtMs`, message: 'Stall end must be null or finite and nonnegative' })
    } else if (stall.endedAtMs !== null && isNonnegativeFinite(stall.startedAtMs)) {
      if (stall.endedAtMs < stall.startedAtMs) {
        issues.push({ path: `${path}.endedAtMs`, message: 'Finished stall cannot end before it starts' })
      }
      if (stall.durationMs !== stall.endedAtMs - stall.startedAtMs) {
        issues.push({ path: `${path}.durationMs`, message: 'Finished stall duration must equal end minus start' })
      }
    }
  }
  return issues
}
