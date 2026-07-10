import assert from 'node:assert/strict'
import test from 'node:test'
import {
  migrateAndSanitizeSaveV13,
  serializeSaveDataV13,
  stringifySaveDataV13,
} from '../src/core/save-data'
import {
  commitV13Migration,
  prepareV13Migration,
  V12_ROLLBACK_KEY,
  type SaveStorage,
} from '../src/core/numeric/save-transaction'
import { serializeAmount } from '../src/core/numeric/amount'

function progressedV12(): Record<string, unknown> {
  return {
    version: 12,
    savedAt: 1_000,
    activeUniverse: 'emberlight',
    light: 900,
    totalEarned: 1_000,
    allTimeEarned: 5_000,
    eraEarned: 2_000,
    stardust: 15,
    stardustTotal: 20,
    singularities: 2,
    singTotal: 3,
    autoNovaThreshold: 4,
    bestCrit: 125.5,
    darkBetween: 7,
    challengeReturn: {
      light: 300,
      totalEarned: 400,
      owned: { spark: 3 },
      upgrades: ['ember-touch'],
      buyAmount: 10,
    },
    universeRuns: {
      tidefall: {
        light: 600,
        totalEarned: 800,
        eraEarned: 900,
        stardust: 5,
        stardustTotal: 6,
        singularities: 1,
        singTotal: 2,
        autoNovaThreshold: 3,
        bestCrit: 44,
        owned: { spark: 4 },
        upgrades: ['undertow-touch'],
        seen: ['tide-arrival'],
        echoes: ['tide-moon-ledger'],
        buyAmount: 10,
        challengeReturn: null,
      },
    },
  }
}

class MemoryStorage implements SaveStorage {
  readonly values = new Map<string, string>()
  failNextSetFor: string | null = null

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    if (this.failNextSetFor === key) {
      this.failNextSetFor = null
      throw new Error('simulated storage failure')
    }
    this.values.set(key, value)
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }
}

test('v12 economy fields migrate atomically to runtime amounts and canonical strings', () => {
  const migrated = migrateAndSanitizeSaveV13(progressedV12())
  assert.ok(migrated)
  assert.equal(migrated.version, 13)
  assert.equal(serializeAmount(migrated.light), '9e2')
  assert.equal(serializeAmount(migrated.allTimeEarned), '5e3')
  assert.equal(serializeAmount(migrated.autoNovaThreshold), '4e0')
  assert.equal(serializeAmount(migrated.bestCrit), '1.255e2')
  assert.equal(serializeAmount(migrated.darkBetween), '7e0')
  assert.equal(serializeAmount(migrated.challengeReturn!.light), '3e2')
  assert.equal(serializeAmount(migrated.universeRuns.tidefall.stardustTotal), '6e0')
  assert.deepEqual(migrated.numericLawState, {})

  const wire = serializeSaveDataV13(migrated)
  assert.equal(wire.light, '9e2')
  assert.equal(wire.challengeReturn!.totalEarned, '4e2')
  assert.equal(wire.universeRuns.tidefall.bestCrit, '4.4e1')
  assert.equal(typeof wire.light, 'string')
  assert.equal(JSON.stringify(wire).includes('"mantissa"'), false)
})

test('v13 canonical edges and numeric law-state round-trip exactly', () => {
  const migrated = migrateAndSanitizeSaveV13(progressedV12())!
  const wire = serializeSaveDataV13(migrated)
  wire.light = '9.99999999999999e2147483647'
  wire.totalEarned = wire.light
  wire.allTimeEarned = wire.light
  wire.eraEarned = '1e-2147483648'
  wire.numericLawState = {
    'stored-production': '1.23456789012345e309',
    'future-cost': '0',
  }
  const roundTrip = migrateAndSanitizeSaveV13(JSON.parse(JSON.stringify(wire)))
  assert.ok(roundTrip)
  assert.equal(stringifySaveDataV13(roundTrip), JSON.stringify(wire))
})

test('v13 rejects missing, bare-number, noncanonical, nonfinite, and overflowing required amounts', () => {
  const wire = serializeSaveDataV13(migrateAndSanitizeSaveV13(progressedV12())!)
  const failures: unknown[] = [
    { ...wire, light: undefined },
    { ...wire, light: 100 },
    { ...wire, light: '1.0e2' },
    { ...wire, light: 'Infinity' },
    { ...wire, light: '1e2147483648' },
    { ...wire, numericLawState: { invalid: 'NaN' } },
  ]
  for (const candidate of failures) assert.equal(migrateAndSanitizeSaveV13(candidate), null)
})

test('migration preparation retains exact raw v12 bytes and upgrades historical saves to a v12 rollback', () => {
  const rawV12 = ` { "version": 12, "savedAt": 1000, "light": 1, "totalEarned": 2 } `
  const prepared = prepareV13Migration(rawV12)
  assert.ok(prepared)
  assert.equal(prepared.rollbackV12Raw, rawV12)
  assert.equal(JSON.parse(prepared.serialized).version, 13)

  const historical = prepareV13Migration(JSON.stringify({
    version: 1,
    savedAt: 100,
    light: 10,
    totalEarned: 20,
    owned: {},
  }))
  assert.ok(historical?.rollbackV12Raw)
  assert.equal(JSON.parse(historical.rollbackV12Raw).version, 12)
})

test('rollback snapshot is written once before v13 and never rotated', () => {
  const storage = new MemoryStorage()
  const primaryKey = 'ember.save'
  const raw = JSON.stringify(progressedV12())
  storage.setItem(primaryKey, raw)
  const migrated = commitV13Migration(storage, primaryKey, raw)
  assert.ok(migrated)
  assert.equal(storage.getItem(V12_ROLLBACK_KEY), raw)
  assert.equal(JSON.parse(storage.getItem(primaryKey)!).version, 13)

  const preserved = storage.getItem(V12_ROLLBACK_KEY)
  const second = commitV13Migration(storage, primaryKey, JSON.stringify({
    ...progressedV12(),
    savedAt: 2_000,
  }))
  assert.ok(second)
  assert.equal(storage.getItem(V12_ROLLBACK_KEY), preserved)
})

test('failed primary write restores primary and rollback without a partial migration', () => {
  const storage = new MemoryStorage()
  const primaryKey = 'ember.save'
  const raw = JSON.stringify(progressedV12())
  storage.setItem(primaryKey, raw)
  storage.failNextSetFor = primaryKey
  assert.equal(commitV13Migration(storage, primaryKey, raw), null)
  assert.equal(storage.getItem(primaryKey), raw)
  assert.equal(storage.getItem(V12_ROLLBACK_KEY), null)
})
