import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'
import {
  LUMEN_VAULT_ITEMS,
  SUCCESSION_RELAYS,
  lumenDistillationCost,
  lumenVaultProductionMultiplier,
  successionRelayCost,
  successionRelayMultiplier,
} from '../src/content/legacy-exchange'
import { createDevScenario } from '../src/core/dev-scenarios'
import { migrateAndSanitizeSave, stringifySaveDataV23 } from '../src/core/save-data'
import { ZERO_AMOUNT, serializeAmount } from '../src/core/numeric/amount'
import { globalMult, type EcoState } from '../src/engine/compute'

test('Succession Relays form one strict immediate-neighbour chain', () => {
  assert.deepEqual(
    SUCCESSION_RELAYS.map(({ sourceUniverseId, targetUniverseId }) => `${sourceUniverseId}>${targetUniverseId}`),
    [
      'emberlight>tidefall',
      'tidefall>verdance',
      'verdance>clockwork',
      'clockwork>prismata',
      'prismata>tempest',
      'tempest>canticle',
    ],
  )
  assert.equal(successionRelayMultiplier('tidefall', { 'relay-emberlight-tidefall': 2 }), 1.24)
  assert.equal(successionRelayMultiplier('verdance', { 'relay-emberlight-tidefall': 99 }), 1)
  assert.equal(successionRelayMultiplier('tidefall', { 'relay-emberlight-tidefall': 2 }, ['utility-relay-lens']), 1.3)
})

test('Relay and shard distillation costs escalate and cap deliberately', () => {
  assert.equal(serializeAmount(successionRelayCost(0)!), '5e0')
  assert.equal(serializeAmount(successionRelayCost(1)!), '9e0')
  assert.equal(serializeAmount(successionRelayCost(2)!), '1.7e1')
  assert.equal(serializeAmount(lumenDistillationCost(0)!), '1e6')
  assert.equal(serializeAmount(lumenDistillationCost(1)!), '1e7')
  assert.equal(serializeAmount(lumenDistillationCost(2)!), '1e8')
  assert.equal(lumenDistillationCost(3), null)
})

test('relay and Vault utilities enter the production multiplier pipeline', () => {
  const base = createDevScenario('tidefall', 10_000) as unknown as EcoState
  base.beacons = []
  base.achievements = []
  base.stardustTotal = ZERO_AMOUNT
  base.remembrances = 0
  base.wayfinder = []
  base.stardustWorks = {}
  base.deepWorks = {}
  base.curiosities = []
  const baseline = globalMult(base, 10_000)

  base.successionRelays = { 'relay-emberlight-tidefall': 5 }
  const relayed = globalMult(base, 10_000)
  assert.ok(Math.abs(relayed.mantissa / baseline.mantissa - 1.6) < 1e-12)

  base.lumenPurchases = ['utility-archive-resonator']
  const vaulted = globalMult(base, 10_000)
  assert.ok(Math.abs(vaulted.mantissa / relayed.mantissa - 1.1) < 1e-12)
  assert.equal(lumenVaultProductionMultiplier(base.lumenPurchases), 1.1)
})

test('historical completed worlds receive their one-time Beacon shard without losing saves', () => {
  const old = JSON.parse(stringifySaveDataV23(createDevScenario('garden', 10_000)!)) as Record<string, unknown>
  const endgame = old.endgame as Record<string, unknown>
  delete endgame.successionRelays
  delete endgame.lumenShards
  delete endgame.lumenShardClaims
  delete endgame.lumenPurchases
  delete endgame.lumenDistillations

  const migrated = migrateAndSanitizeSave(old)
  assert.ok(migrated)
  assert.equal(migrated.endgame.lumenShards, migrated.beacons.length)
  assert.deepEqual(
    migrated.endgame.lumenShardClaims,
    migrated.beacons.map((id) => `beacon-${id}`),
  )
  assert.deepEqual(migrated.endgame.successionRelays, {})
  assert.deepEqual(migrated.endgame.lumenPurchases, [])
})

test('Concordance persistence clamps ranks, distillations, and known Vault ids', () => {
  const raw = JSON.parse(stringifySaveDataV23(createDevScenario('garden', 10_000)!)) as Record<string, unknown>
  const endgame = raw.endgame as Record<string, unknown>
  endgame.successionRelays = { 'relay-emberlight-tidefall': 999, exploit: 999 }
  endgame.lumenShards = 9_999_999
  endgame.lumenShardClaims = ['beacon-emberlight', 'beacon-emberlight', 'fake-claim']
  endgame.lumenPurchases = ['skin-aurora-archive', 'skin-aurora-archive', 'free-everything']
  endgame.lumenDistillations = { emberlight: 99, fake: 99 }

  const clean = migrateAndSanitizeSave(raw)
  assert.ok(clean)
  assert.deepEqual(clean.endgame.successionRelays, { 'relay-emberlight-tidefall': 100 })
  assert.equal(clean.endgame.lumenShards, 1_000_000)
  assert.deepEqual(clean.endgame.lumenShardClaims, ['beacon-emberlight'])
  assert.deepEqual(clean.endgame.lumenPurchases, ['skin-aurora-archive'])
  assert.deepEqual(clean.endgame.lumenDistillations, { emberlight: 3 })
})

test('Concordance UI exposes relays, distillation, and all persistent Vault categories accessibly', () => {
  const componentUrl = new URL('../src/ui/EndgameHub.svelte', import.meta.url)
  const source = readFileSync(componentUrl, 'utf8')
  const compiled = compile(source, { filename: componentUrl.pathname, generate: 'client' })

  assert.deepEqual(compiled.warnings, [])
  assert.match(source, /One world reaches only its immediate successor/)
  assert.match(source, /Lumen Distillery/)
  assert.match(source, /The Lumen Vault/)
  assert.deepEqual(new Set(LUMEN_VAULT_ITEMS.map(({ kind }) => kind)), new Set(['lore', 'skin', 'utility']))
})
