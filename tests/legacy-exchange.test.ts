import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'
import {
  LUMEN_VAULT_ITEMS,
  SUCCESSION_RELAYS,
  lumenVaultHome,
  lumenVaultItemsForHome,
  lumenDistillationCost,
  lumenVaultProductionMultiplier,
  successionRelayCost,
  successionRelayMultiplier,
} from '../src/content/legacy-exchange'
import { createDevScenario } from '../src/core/dev-scenarios'
import { migrateAndSanitizeSave, stringifySaveDataV23 } from '../src/core/save-data'
import { ZERO_AMOUNT, amountToNumber, divideAmounts, serializeAmount } from '../src/core/numeric/amount'
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
  assert.ok(Math.abs(amountToNumber(divideAmounts(relayed, baseline)) - 1.6) < 1e-12)

  base.lumenPurchases = ['utility-archive-resonator']
  const vaulted = globalMult(base, 10_000)
  assert.ok(Math.abs(amountToNumber(divideAmounts(vaulted, relayed)) - 1.1) < 1e-12)
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

test('Phase 8.3 partitions every Vault item into one contextual home without changing definitions', () => {
  assert.deepEqual(lumenVaultItemsForHome('archive').map(({ id }) => id), [
    'lore-first-margin',
    'lore-seventh-witness',
    'lore-name-before-lumen',
    'lore-absent-eighth',
    'utility-archive-resonator',
  ])
  assert.deepEqual(lumenVaultItemsForHome('observatory').map(({ id }) => id), [
    'skin-aurora-archive',
    'skin-eclipse-gold',
    'skin-chorusglass',
  ])
  assert.deepEqual(lumenVaultItemsForHome('vessel-wayfinder').map(({ id }) => id), ['utility-relay-lens'])
  assert.equal(LUMEN_VAULT_ITEMS.every((item) => lumenVaultItemsForHome(lumenVaultHome(item)).includes(item)), true)
  assert.deepEqual(new Set(LUMEN_VAULT_ITEMS.map(({ kind }) => kind)), new Set(['lore', 'skin', 'utility']))
})

test('permanent purchases compile in Deep, Observatory, Wayfinder, and the contextual Archive shelf', () => {
  const components = [
    '../src/ui/LumenDistillery.svelte',
    '../src/ui/LumenVaultShelf.svelte',
    '../src/ui/SuccessionRelayHome.svelte',
    '../src/ui/TheDeep.svelte',
    '../src/ui/Observatory.svelte',
    '../src/ui/VesselPanel.svelte',
    '../src/ui/CuriosityCabinet.svelte',
  ]
  for (const relative of components) {
    const componentUrl = new URL(relative, import.meta.url)
    const source = readFileSync(componentUrl, 'utf8')
    const compiled = compile(source, { filename: componentUrl.pathname, generate: 'client' })
    assert.deepEqual(compiled.warnings, [], relative)
  }

  const deep = readFileSync(new URL('../src/ui/TheDeep.svelte', import.meta.url), 'utf8')
  const observatory = readFileSync(new URL('../src/ui/Observatory.svelte', import.meta.url), 'utf8')
  const vessel = readFileSync(new URL('../src/ui/VesselPanel.svelte', import.meta.url), 'utf8')
  const archive = readFileSync(new URL('../src/ui/CuriosityCabinet.svelte', import.meta.url), 'utf8')
  const legacy = readFileSync(new URL('../src/ui/EndgameHub.svelte', import.meta.url), 'utf8')
  assert.match(deep, /<LumenDistillery/)
  assert.match(observatory, /<LumenVaultShelf home="observatory"/)
  assert.match(vessel, /<SuccessionRelayHome/)
  assert.match(vessel, /<LumenVaultShelf home="vessel-wayfinder"/)
  assert.match(archive, /<LumenVaultShelf home="archive"/)
  assert.doesNotMatch(legacy, /Concordance|Lumen Distillery|Lumen Vault|buySuccessionRelay|buyLumenVaultItem/)
})
