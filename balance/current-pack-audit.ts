import type { SerializedEconomyAmount, UniverseId } from '../src/content/universes/types'
import { universeById } from '../src/content/universes'
import {
  availableUpgrades,
  clickPower,
  costOf,
  totalRate,
  type EcoState,
} from '../src/engine/compute'
import {
  ZERO_AMOUNT,
  addAmounts,
  amountFromNumber,
  amountToNumber,
  divideAmounts,
  gteAmount,
  isZeroAmount,
  multiplyAmountByNumber,
  serializeAmount,
  subtractAmounts,
  toAmount,
} from '../src/core/numeric/amount'
import { SIMULATOR_PROFILES, type SimulatorProfile } from './simulator-contract'
import {
  advanceF4LawState,
  dischargeTempest,
  tempestStatus,
} from '../src/content/universes/f4-runtime'
import { advanceVerdanceCohortLawState } from '../src/content/universes/verdance/runtime'

const AUDIT_HORIZON_HOURS = 40
const AUDIT_STEP_SECONDS = 60
const PAYBACK_LIMIT_SECONDS = 4 * 3600

export interface CurrentPackAuditEvent {
  readonly atMs: number
  readonly kind: 'first-generator' | 'milestone'
  readonly id: string
  readonly amount?: SerializedEconomyAmount
}

export interface CurrentPackAuditResult {
  readonly source: 'current-engine-compute-v13'
  readonly universeId: UniverseId
  readonly profileId: SimulatorProfile['id']
  readonly horizonMs: number
  readonly events: readonly CurrentPackAuditEvent[]
  readonly purchasedGeneratorIds: readonly string[]
  readonly purchaseCount: number
  readonly finalRate: SerializedEconomyAmount
  readonly finalEarned: SerializedEconomyAmount
  readonly firstEpochAtMs: number | null
  readonly firstBeaconAtMs: number | null
  readonly longestPreEpochPurchaseGapMs: number
}

export interface MinimalOwnershipIdleAuditResult {
  readonly source: 'current-engine-minimal-ownership-idle-v1'
  readonly universeId: UniverseId
  readonly horizonMs: number
  readonly ownedGeneratorId: string
  readonly finalEarned: SerializedEconomyAmount
}

function initialState(universeId: UniverseId): EcoState {
  return {
    activeUniverse: universeId,
    light: ZERO_AMOUNT,
    totalEarned: ZERO_AMOUNT,
    clicks: 0,
    owned: {},
    upgrades: [],
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
    numericLawState: {},
  }
}

function advanceActiveUniverseLaw(
  state: EcoState,
  profile: SimulatorProfile,
  elapsedSeconds: number,
): void {
  const numericLawState = state.numericLawState ??= {}
  const pack = universeById(state.activeUniverse)
  if (state.activeUniverse === 'verdance') {
    advanceVerdanceCohortLawState(
      numericLawState,
      state.owned,
      pack.generators.map(({ id }) => id),
      elapsedSeconds * 1_000,
    )
  }
  advanceF4LawState(state.activeUniverse, numericLawState, state.owned, elapsedSeconds)
  if (state.activeUniverse === 'tempest' && profile.mechanicUse > 0) {
    const status = tempestStatus(numericLawState)
    const releaseThreshold = status.threshold + (100 - status.threshold) * (1 - profile.mechanicUse)
    if (status.boostRemainingSec <= 0 && status.charge >= releaseThreshold) dischargeTempest(numericLawState)
  }
}

function boundedPaybackSeconds(cost: ReturnType<typeof costOf>, deltaRate: ReturnType<typeof totalRate>): number {
  if (isZeroAmount(deltaRate)) return Number.POSITIVE_INFINITY
  const quotient = divideAmounts(cost, deltaRate)
  if (quotient.exponent > 6) return Number.POSITIVE_INFINITY
  return amountToNumber(quotient)
}

function activeIncomeRate(state: EcoState, profile: SimulatorProfile, now: number) {
  const passive = multiplyAmountByNumber(
    totalRate(state, now),
    profile.sessionMode === 'offline' ? 0.5 : 1,
  )
  return addAmounts(passive, multiplyAmountByNumber(clickPower(state, 1, now), profile.clicksPerSecond))
}

export function generatorPurchaseIncomeDelta(
  state: EcoState,
  profile: SimulatorProfile,
  generatorId: string,
  now: number,
  before = activeIncomeRate(state, profile, now),
) {
  const generator = universeById(state.activeUniverse).generatorById.get(generatorId)
  if (!generator) throw new RangeError(`Unknown generator ${generatorId}`)
  const owned = state.owned[generatorId] ?? 0
  const after = activeIncomeRate({
    ...state,
    owned: { ...state.owned, [generatorId]: owned + 1 },
  }, profile, now)
  return gteAmount(after, before) ? subtractAmounts(after, before) : ZERO_AMOUNT
}

/** Migrated legacy curve audit: actual packs, costs, upgrades, and compute pipeline. */
export function runCurrentPackAudit(
  universeId: UniverseId,
  profile: SimulatorProfile,
  horizonHours = AUDIT_HORIZON_HOURS,
): CurrentPackAuditResult {
  const pack = universeById(universeId)
  const state = initialState(universeId)
  const events: CurrentPackAuditEvent[] = []
  const firstBought = new Set<string>()
  const purchasedGeneratorIds: string[] = []
  const milestones = ['1e3', '1e6', '1e9', '1e12', '1e15', '1e18', '1e21'].map((value) => toAmount(value as `${number}e${number}`))
  let nextMilestone = 0
  let purchaseCount = 0
  let lastPurchaseAtMs = 0
  let longestPreEpochPurchaseGapMs = 0
  let firstEpochAtMs: number | null = null
  let firstBeaconAtMs: number | null = null
  const horizonMs = horizonHours * 3600_000

  for (let atMs = 0; atMs < horizonMs; atMs += AUDIT_STEP_SECONDS * 1000) {
    advanceActiveUniverseLaw(state, profile, AUDIT_STEP_SECONDS)
    const gain = multiplyAmountByNumber(activeIncomeRate(state, profile, atMs), AUDIT_STEP_SECONDS)
    state.light = addAmounts(state.light, gain)
    state.totalEarned = addAmounts(state.totalEarned, gain)
    state.clicks += profile.clicksPerSecond * AUDIT_STEP_SECONDS

    for (let guard = 0; guard < 16; guard++) {
      let bestPayback = Number.POSITIVE_INFINITY
      let bestBuy: (() => string) | null = null
      const beforePurchaseRate = activeIncomeRate(state, profile, atMs)

      for (const generator of pack.generators) {
        const owned = state.owned[generator.id] ?? 0
        const cost = costOf(generator, owned)
        if (!gteAmount(state.light, cost)) continue
        const payback = profile.purchaseStrategy === 'first-affordable'
          ? 0
          : boundedPaybackSeconds(cost, generatorPurchaseIncomeDelta(state, profile, generator.id, atMs, beforePurchaseRate))
        if (payback >= bestPayback) continue
        bestPayback = payback
        bestBuy = () => {
          state.light = subtractAmounts(state.light, cost)
          state.owned[generator.id] = owned + 1
          return `gen:${generator.id}`
        }
        if (profile.purchaseStrategy === 'first-affordable') break
      }

      for (const upgrade of availableUpgrades(state)) {
        const cost = toAmount(upgrade.cost)
        if (!gteAmount(state.light, cost)) continue
        const before = beforePurchaseRate
        state.upgrades.push(upgrade.id)
        let after
        try {
          after = activeIncomeRate(state, profile, atMs)
        } finally {
          state.upgrades.pop()
        }
        const delta = gteAmount(after, before) ? subtractAmounts(after, before) : ZERO_AMOUNT
        const payback = profile.purchaseStrategy === 'first-affordable' ? 0 : boundedPaybackSeconds(cost, delta)
        if (payback >= bestPayback) continue
        bestPayback = payback
        bestBuy = () => {
          state.light = subtractAmounts(state.light, cost)
          state.upgrades.push(upgrade.id)
          return `up:${upgrade.id}`
        }
        if (profile.purchaseStrategy === 'first-affordable') break
      }

      if (!bestBuy || bestPayback > PAYBACK_LIMIT_SECONDS) break
      const key = bestBuy()
      purchaseCount += 1
      if (firstEpochAtMs === null) {
        longestPreEpochPurchaseGapMs = Math.max(longestPreEpochPurchaseGapMs, atMs - lastPurchaseAtMs)
      }
      lastPurchaseAtMs = atMs
      if (key.startsWith('gen:') && !firstBought.has(key)) {
        firstBought.add(key)
        const id = key.slice(4)
        purchasedGeneratorIds.push(id)
        events.push({ atMs, kind: 'first-generator', id })
      }
      if (firstBeaconAtMs === null && (state.owned[pack.beacon.generatorId] ?? 0) >= pack.beacon.count) {
        firstBeaconAtMs = atMs
        events.push({ atMs, kind: 'milestone', id: 'beacon-ready' })
      }
    }

    while (nextMilestone < milestones.length && gteAmount(state.totalEarned, milestones[nextMilestone])) {
      const target = serializeAmount(milestones[nextMilestone])
      events.push({ atMs, kind: 'milestone', id: target, amount: target })
      if (target === '1e18' && firstEpochAtMs === null) firstEpochAtMs = atMs
      nextMilestone += 1
    }
  }

  const wallHorizon = firstEpochAtMs ?? horizonMs
  longestPreEpochPurchaseGapMs = Math.max(
    longestPreEpochPurchaseGapMs,
    wallHorizon - Math.min(lastPurchaseAtMs, wallHorizon),
  )
  return {
    source: 'current-engine-compute-v13',
    universeId,
    profileId: profile.id,
    horizonMs,
    events,
    purchasedGeneratorIds,
    purchaseCount,
    finalRate: serializeAmount(activeIncomeRate(state, profile, horizonMs)),
    finalEarned: serializeAmount(state.totalEarned),
    firstEpochAtMs,
    firstBeaconAtMs,
    longestPreEpochPurchaseGapMs,
  }
}

/**
 * Measures real-engine offline pacing after the player has bootstrapped the
 * first Kindling. Purchases, clicks, upgrades, Archives, and active mechanic
 * use stay disabled so balance work can prove the passive floor did not move.
 */
export function runMinimalOwnershipIdleAudit(
  universeId: UniverseId,
  horizonHours = 8,
): MinimalOwnershipIdleAuditResult {
  const pack = universeById(universeId)
  const firstGenerator = pack.generators[0]
  if (!firstGenerator) throw new RangeError(`${universeId} has no first Kindling`)
  const state = initialState(universeId)
  state.owned[firstGenerator.id] = 1
  let finalEarned = ZERO_AMOUNT
  const horizonMs = horizonHours * 3_600_000
  const offlineProfile = SIMULATOR_PROFILES.find(({ id }) => id === 'zero-skill-idle-offline')
  if (!offlineProfile) throw new RangeError('Missing zero-skill idle simulator profile')
  for (let atMs = 0; atMs < horizonMs; atMs += AUDIT_STEP_SECONDS * 1_000) {
    advanceActiveUniverseLaw(state, offlineProfile, AUDIT_STEP_SECONDS)
    finalEarned = addAmounts(
      finalEarned,
      multiplyAmountByNumber(totalRate(state, atMs), AUDIT_STEP_SECONDS * 0.5),
    )
  }
  return {
    source: 'current-engine-minimal-ownership-idle-v1',
    universeId,
    horizonMs,
    ownedGeneratorId: firstGenerator.id,
    finalEarned: serializeAmount(finalEarned),
  }
}

export function runAllCurrentPackAudits(): readonly CurrentPackAuditResult[] {
  const legacyProfiles = SIMULATOR_PROFILES.filter((profile) =>
    profile.id === 'casual-one-click-per-second'
    || profile.id === 'active-six-clicks-per-second'
    || profile.id === 'competent-universe-mechanic')
  return (['emberlight', 'tidefall', 'verdance', 'clockwork', 'prismata', 'tempest', 'canticle'] as const).flatMap((universeId) =>
    legacyProfiles.map((profile) => runCurrentPackAudit(
      universeId,
      profile,
      profile.id === 'competent-universe-mechanic' ? 8 : AUDIT_HORIZON_HOURS,
    )),
  )
}
