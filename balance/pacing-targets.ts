import type { UniverseId } from '../src/content/universes/types'
import { planOfflineProgress } from '../src/core/offline-pacing'
import type { CurrentPackAuditResult } from './current-pack-audit'

const HOUR_MS = 3_600_000

export interface RealmPacingTarget {
  readonly firstEpochHours: readonly [minimum: number, maximum: number]
  readonly beaconHours: readonly [minimum: number, maximum: number]
  readonly minimumPostEpochHours: number
}

const LONG_RESTORED: RealmPacingTarget = {
  firstEpochHours: [1.5, 5], beaconHours: [8, 20], minimumPostEpochHours: 4,
}
const REGENERATIVE: RealmPacingTarget = {
  firstEpochHours: [1.5, 5], beaconHours: [6, 10], minimumPostEpochHours: 0.5,
}
const LOKA: RealmPacingTarget = {
  firstEpochHours: [1.5, 5], beaconHours: [8, 20], minimumPostEpochHours: 1,
}

/** Player-facing targets; the synthetic 1e309 horizon is numeric stress only. */
export const REALM_PACING_TARGETS: Readonly<Record<UniverseId, RealmPacingTarget>> = {
  emberlight: LONG_RESTORED,
  tidefall: LONG_RESTORED,
  verdance: REGENERATIVE,
  clockwork: LONG_RESTORED,
  brahmalok: LOKA,
  vishnulok: LOKA,
  kailash: LOKA,
}

export interface RealmPacingFinding {
  readonly universeId: UniverseId
  readonly firstEpochHours: number | null
  readonly beaconHours: number | null
  readonly postEpochHours: number | null
  readonly issues: readonly string[]
}

function inBand(value: number, band: readonly [number, number]): boolean {
  return value >= band[0] && value <= band[1]
}

export function evaluateRealmPacing(result: CurrentPackAuditResult): RealmPacingFinding {
  const target = REALM_PACING_TARGETS[result.universeId]
  const firstEpochHours = result.firstEpochAtMs === null ? null : result.firstEpochAtMs / HOUR_MS
  const beaconHours = result.firstBeaconAtMs === null ? null : result.firstBeaconAtMs / HOUR_MS
  const postEpochHours = firstEpochHours === null || beaconHours === null ? null : beaconHours - firstEpochHours
  const issues: string[] = []
  if (firstEpochHours === null) issues.push('first Epoch was not reached')
  else if (!inBand(firstEpochHours, target.firstEpochHours)) issues.push('first Epoch fell outside its target band')
  if (beaconHours === null) issues.push('Beacon was not reached')
  else if (!inBand(beaconHours, target.beaconHours)) issues.push('Beacon fell outside its completion band')
  if (postEpochHours !== null && postEpochHours < target.minimumPostEpochHours) {
    issues.push('post-Epoch signature-mechanic runway was too short')
  }
  if (result.longestPreEpochPurchaseGapMs > 10 * 60_000) issues.push('pre-Epoch purchase wall exceeded ten minutes')
  return { universeId: result.universeId, firstEpochHours, beaconHours, postEpochHours, issues }
}

export interface MeaningfulPacingStudy {
  readonly contract: 'player-milestones-v1'
  readonly offline: {
    readonly oneHourEquivalentHours: number
    readonly overnightEquivalentHours: number
    readonly upgradedOvernightEquivalentHours: number
  }
  readonly realms: readonly RealmPacingFinding[]
}

export function buildMeaningfulPacingStudy(
  currentPackAudits: readonly CurrentPackAuditResult[],
): MeaningfulPacingStudy {
  const realms = (Object.keys(REALM_PACING_TARGETS) as UniverseId[]).map((universeId) => {
    const result = currentPackAudits.find((audit) => (
      audit.universeId === universeId && audit.profileId === 'casual-one-click-per-second'
    ))
    if (!result) throw new RangeError(`Missing casual current-pack audit for ${universeId}`)
    return evaluateRealmPacing(result)
  })
  return {
    contract: 'player-milestones-v1',
    offline: {
      oneHourEquivalentHours: planOfflineProgress(1 * 3_600).equivalentActiveSeconds / 3_600,
      overnightEquivalentHours: planOfflineProgress(8 * 3_600).equivalentActiveSeconds / 3_600,
      upgradedOvernightEquivalentHours: planOfflineProgress(8 * 3_600, 0.25, 6).equivalentActiveSeconds / 3_600,
    },
    realms,
  }
}
