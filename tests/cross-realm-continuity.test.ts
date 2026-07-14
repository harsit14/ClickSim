import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import {
  REALM_LAW_STATEMENTS,
  crossingMemoryTransfers,
} from '../src/experience/cross-realm-continuity'

test('every realm arrival states its law in concrete player verbs', () => {
  assert.deepEqual(Object.keys(REALM_LAW_STATEMENTS), [
    'emberlight',
    'tidefall',
    'verdance',
    'clockwork',
    'brahmalok',
    'vishnulok',
    'kailash',
  ])
  for (const law of Object.values(REALM_LAW_STATEMENTS)) {
    assert.match(law.sentence, /^Here, /)
    assert.match(law.sentence, /;/)
    assert.ok(law.practice.includes(' · '))
  }
  assert.equal(
    REALM_LAW_STATEMENTS.verdance.sentence,
    'Here, growth ages. Cultivate patiently; Pruning is how memory is kept.',
  )
})

test('first arrivals name one or two existing permanent memories without minting power', () => {
  const base = {
    sourceId: 'emberlight' as const,
    targetId: 'tidefall' as const,
    firstArrival: true,
    beacons: ['emberlight'],
    wayfinder: ['between-cargo', 'remembered-kindling'],
    successionRelays: {},
    lumenPurchases: [],
  }
  const transfers = crossingMemoryTransfers(base)
  assert.equal(transfers.length, 2)
  assert.deepEqual(transfers.map(({ id }) => id), [
    'beacon-memory-emberlight',
    'remembered-kindling-arrival',
  ])
  assert.match(transfers[0].effect, /×3 all production/)
  assert.match(transfers[1].effect, /25 tier-one Kindlings/)
  assert.deepEqual(crossingMemoryTransfers({ ...base, firstArrival: false }), [])
})

test('an invested immediate-successor relay becomes the loud second arrival memory', () => {
  const transfers = crossingMemoryTransfers({
    sourceId: 'tidefall',
    targetId: 'verdance',
    firstArrival: true,
    beacons: ['emberlight', 'tidefall'],
    wayfinder: ['remembered-kindling'],
    successionRelays: { 'relay-tidefall-verdance': 2 },
    lumenPurchases: [],
  })
  assert.deepEqual(transfers.map(({ id }) => id), [
    'beacon-memory-tidefall',
    'relay-tidefall-verdance',
  ])
  assert.match(transfers[1].effect, /×1\.24 Verdance production/)
})

test('Crossing and the early doctrine Atlas compile accessibly and stay in the Wayfinder', () => {
  for (const filename of ['CrossingPrelude.svelte', 'RealmDoctrineAtlas.svelte']) {
    const path = new URL(`../src/ui/${filename}`, import.meta.url)
    const source = readFileSync(path, 'utf8')
    assert.deepEqual(compile(source, { filename: path.pathname, generate: 'client' }).warnings, [])
  }

  const crossing = readFileSync(new URL('../src/ui/CrossingPrelude.svelte', import.meta.url), 'utf8')
  const atlas = readFileSync(new URL('../src/ui/RealmDoctrineAtlas.svelte', import.meta.url), 'utf8')
  const vessel = readFileSync(new URL('../src/ui/VesselPanel.svelte', import.meta.url), 'utf8')

  assert.match(crossing, /the new law · in player verbs/)
  assert.match(crossing, /what crossed with you/)
  assert.match(atlas, /available after the first Crossing/)
  assert.match(atlas, /realms\.length >= 2/)
  assert.match(atlas, /favoredMotivations/)
  assert.match(vessel, /<RealmDoctrineAtlas universeIds=\{rememberedRealmIds\}/)
})
