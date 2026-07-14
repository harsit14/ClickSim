import { universeById } from '../src/content/universes'
import type { UniverseId } from '../src/content/universes/types'
import { perkBonus } from '../src/content/constellation'
import { AUTO_KINDLER_FAMILIES } from '../src/core/automation-preferences'
import {
  addAmounts,
  gteAmount,
  multiplyAmountByNumber,
  subtractAmounts,
  toAmount,
} from '../src/core/numeric/amount'
import { planOfflineProgress } from '../src/core/offline-pacing'
import { availableUpgrades, totalRate } from '../src/engine/compute'
import { selectAutoKindlerPurchase } from '../src/systems/auto-kindler'
import {
  COMPETENT_IDLE_TARGET,
  type CompetentIdlePacingResult,
} from './retention-targets'
import {
  advanceActiveUniverseLaw,
  createCurrentPackAuditState,
} from './current-pack-audit'
import { SIMULATOR_PROFILES } from './simulator-contract'

export const COMPETENT_IDLE_CHECK_IN_HOURS = 12
const CHECK_IN_SECONDS = COMPETENT_IDLE_CHECK_IN_HOURS * 3_600
const LAW_STEP_SECONDS = 60
const MAX_PURCHASES_PER_CHECK_IN = 10_000

export interface CompetentIdleAuditResult extends CompetentIdlePacingResult {
  readonly source: 'current-engine-competent-idle-v1'
  readonly checkIns: number
  readonly purchaseCount: number
  readonly bootstrappedGeneratorId: string
  readonly beaconOwned: number
}

function buyAtCheckIn(
  state: ReturnType<typeof createCurrentPackAuditState>,
): number {
  let purchases = 0
  for (; purchases < MAX_PURCHASES_PER_CHECK_IN; purchases++) {
    const upgrade = availableUpgrades(state)
      .filter(({ cost }) => gteAmount(state.light, toAmount(cost)))
      .sort((left, right) => left.cost - right.cost)[0]
    if (upgrade) {
      state.light = subtractAmounts(state.light, toAmount(upgrade.cost))
      state.upgrades.push(upgrade.id)
      continue
    }

    const kindling = selectAutoKindlerPurchase(state, {
      families: AUTO_KINDLER_FAMILIES,
      priority: 'efficiency',
    })
    if (!kindling) break
    state.light = subtractAmounts(state.light, kindling.cost)
    state.owned[kindling.generator.id] = kindling.owned + 1
  }
  if (purchases >= MAX_PURCHASES_PER_CHECK_IN) {
    throw new RangeError('Competent-idle purchase loop exceeded its guard')
  }
  return purchases
}

/**
 * Models a competent idle player who bootstraps one Kindling, returns twice per
 * day, collects each offline window, and makes deliberate purchases.
 * No clicks, Omens, or continuously-open automation are credited.
 */
export function runCompetentIdleAudit(
  universeId: UniverseId,
  maximumCalendarHours = COMPETENT_IDLE_TARGET.beaconCalendarHours[1],
): CompetentIdleAuditResult {
  const pack = universeById(universeId)
  const firstGenerator = pack.generators[0]
  if (!firstGenerator) throw new RangeError(`${universeId} has no first Kindling`)
  const profile = SIMULATOR_PROFILES.find(({ id }) => id === 'zero-skill-idle-offline')
  if (!profile) throw new RangeError('Missing zero-skill idle simulator profile')

  const state = createCurrentPackAuditState(universeId)
  state.owned[firstGenerator.id] = 1
  const maximumCheckIns = Math.ceil(
    maximumCalendarHours
      / COMPETENT_IDLE_CHECK_IN_HOURS,
  )
  let purchaseCount = 0

  for (let checkIn = 1; checkIn <= maximumCheckIns; checkIn++) {
    const plan = planOfflineProgress(
      CHECK_IN_SECONDS,
      perkBonus(state.constellation, 'offline'),
      perkBonus(state.constellation, 'offlineCap'),
    )
    for (let elapsed = 0; elapsed < plan.countedSeconds; elapsed += LAW_STEP_SECONDS) {
      const step = Math.min(LAW_STEP_SECONDS, plan.countedSeconds - elapsed)
      advanceActiveUniverseLaw(state, profile, step)
      const gain = multiplyAmountByNumber(totalRate(state, checkIn * CHECK_IN_SECONDS * 1_000), step * plan.efficiency)
      state.light = addAmounts(state.light, gain)
      state.totalEarned = addAmounts(state.totalEarned, gain)
    }

    purchaseCount += buyAtCheckIn(state)
    if ((state.owned[pack.beacon.generatorId] ?? 0) >= pack.beacon.count) {
      return {
        source: 'current-engine-competent-idle-v1',
        universeId,
        beaconCalendarHours: checkIn * COMPETENT_IDLE_CHECK_IN_HOURS,
        longestDecisionGapHours: COMPETENT_IDLE_CHECK_IN_HOURS,
        checkIns: checkIn,
        purchaseCount,
        bootstrappedGeneratorId: firstGenerator.id,
        beaconOwned: state.owned[pack.beacon.generatorId] ?? 0,
      }
    }
  }

  return {
    source: 'current-engine-competent-idle-v1',
    universeId,
    beaconCalendarHours: null,
    longestDecisionGapHours: COMPETENT_IDLE_CHECK_IN_HOURS,
    checkIns: maximumCheckIns,
    purchaseCount,
    bootstrappedGeneratorId: firstGenerator.id,
    beaconOwned: state.owned[pack.beacon.generatorId] ?? 0,
  }
}
