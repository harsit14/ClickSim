import assert from 'node:assert/strict'
import test from 'node:test'
import {
  runCurrentPackAudit,
  runMinimalOwnershipIdleAudit,
} from '../balance/current-pack-audit'
import { SIMULATOR_PROFILES } from '../balance/simulator-contract'
import type { UniverseId } from '../src/content/universes/types'

const CASUAL = SIMULATOR_PROFILES.find(({ id }) => id === 'casual-one-click-per-second')!
const HOUR_MS = 3_600_000

test('Tidefall and Clockwork reach their first Epoch without a realm-breaking wall', () => {
  for (const universeId of ['tidefall', 'clockwork'] as const) {
    const result = runCurrentPackAudit(universeId, CASUAL, 20)
    assert.notEqual(result.firstEpochAtMs, null, `${universeId} never reached its first Epoch`)
    assert.ok(result.firstEpochAtMs! >= 3 * HOUR_MS, `${universeId} reached its first Epoch before 3h`)
    assert.ok(result.firstEpochAtMs! <= 5 * HOUR_MS, `${universeId} missed its 5h first-Epoch target`)
    assert.notEqual(result.firstBeaconAtMs, null, `${universeId} did not expose its Beacon economy within 20h`)
    assert.ok(result.longestPreEpochPurchaseGapMs <= 10 * 60_000, `${universeId} has a pre-Epoch wall over 10m`)
  }
})

test('Verdance cannot light its Beacon before the first Pruning window', () => {
  for (const profile of SIMULATOR_PROFILES.filter(({ id }) => (
    id === 'casual-one-click-per-second'
    || id === 'active-six-clicks-per-second'
    || id === 'competent-universe-mechanic'
  ))) {
    const result = runCurrentPackAudit('verdance', profile, 8)
    assert.notEqual(result.firstEpochAtMs, null, `${profile.id} never reached its first Pruning window`)
    assert.notEqual(result.firstBeaconAtMs, null, `${profile.id} never reached the World-Tree Beacon`)
    assert.ok(
      result.firstBeaconAtMs! - result.firstEpochAtMs! >= 30 * 60_000,
      `${profile.id} left less than thirty minutes for Pruning`,
    )
    assert.ok(result.longestPreEpochPurchaseGapMs <= 10 * 60_000, `${profile.id} has a pre-Pruning wall over 10m`)
  }
})

test('Brahmalok and Vishnulok preserve an hour of signature play after the first Epoch', () => {
  for (const universeId of ['brahmalok', 'vishnulok'] as const) {
    for (const profile of SIMULATOR_PROFILES.filter(({ id }) => (
      id === 'casual-one-click-per-second'
      || id === 'active-six-clicks-per-second'
      || id === 'competent-universe-mechanic'
    ))) {
      const result = runCurrentPackAudit(universeId, profile, 8)
      assert.notEqual(result.firstEpochAtMs, null, `${universeId}/${profile.id} never reached its first Epoch`)
      assert.notEqual(result.firstBeaconAtMs, null, `${universeId}/${profile.id} never reached its Beacon`)
      assert.ok(
        result.firstBeaconAtMs! - result.firstEpochAtMs! >= 60 * 60_000,
        `${universeId}/${profile.id} left less than an hour for its signature mechanic`,
      )
      assert.ok(result.longestPreEpochPurchaseGapMs <= 10 * 60_000, `${universeId}/${profile.id} has a pre-Epoch wall over 10m`)
    }
  }
})

test('minimal-ownership idle pacing keeps the pre-tuning passive floor', () => {
  const expected: Readonly<Record<'tidefall' | 'clockwork', number>> = {
    tidefall: 4_320,
    clockwork: 3_600,
  }
  for (const universeId of Object.keys(expected) as Array<'tidefall' | 'clockwork'>) {
    const audit = runMinimalOwnershipIdleAudit(universeId as UniverseId)
    const actual = Number(audit.finalEarned)
    const difference = Math.abs(actual - expected[universeId]) / expected[universeId]
    assert.ok(difference <= 0.05, `${universeId} minimal idle pacing moved ${(difference * 100).toFixed(2)}%`)
  }
})
