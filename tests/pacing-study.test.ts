import assert from 'node:assert/strict'
import test from 'node:test'
import { planOfflineProgress } from '../src/core/offline-pacing'
import { buildMeaningfulPacingStudy } from '../balance/pacing-targets'
import type { CurrentPackAuditResult } from '../balance/current-pack-audit'
import type { UniverseId } from '../src/content/universes/types'

test('offline returns meet the short, overnight, and earned-upgrade targets', () => {
  assert.equal(planOfflineProgress(3_600).equivalentActiveSeconds, 1_800)
  assert.equal(planOfflineProgress(8 * 3_600).equivalentActiveSeconds, 3 * 3_600)
  assert.equal(planOfflineProgress(8 * 3_600, 0.25, 6).equivalentActiveSeconds, 6 * 3_600)
  assert.equal(planOfflineProgress(24 * 3_600).countedSeconds, 6 * 3_600)
  assert.throws(() => planOfflineProgress(Number.NaN), /finite/)
})

test('all seven realms meet player-scale Epoch, signature runway, and completion targets', () => {
  const hours: Readonly<Record<UniverseId, readonly [number, number]>> = {
    emberlight: [2.08, 9.9], tidefall: [4.07, 16.75], verdance: [4.97, 8.13],
    clockwork: [4.03, 17.4], brahmalok: [4.57, 17.9], vishnulok: [5, 12.77], kailash: [3.97, 9.02],
  }
  const audits = Object.entries(hours).map(([universeId, [epoch, beacon]]) => ({
    source: 'current-engine-compute-v13', universeId, profileId: 'casual-one-click-per-second', horizonMs: 20 * 3_600_000,
    events: [], purchasedGeneratorIds: [], purchaseCount: 1, finalRate: '1e0', finalEarned: '1e0',
    firstEpochAtMs: epoch * 3_600_000, firstBeaconAtMs: beacon * 3_600_000, longestPreEpochPurchaseGapMs: 3 * 60_000,
  })) as CurrentPackAuditResult[]
  const study = buildMeaningfulPacingStudy(audits)
  assert.equal(study.contract, 'player-milestones-v1')
  assert.deepEqual(study.offline, {
    oneHourEquivalentHours: 0.5,
    overnightEquivalentHours: 3,
    upgradedOvernightEquivalentHours: 6,
  })
  assert.equal(study.realms.length, 7)
  for (const realm of study.realms) assert.deepEqual(realm.issues, [], realm.universeId)
  assert.throws(() => buildMeaningfulPacingStudy(audits.slice(1)), /Missing casual current-pack audit/)
})
