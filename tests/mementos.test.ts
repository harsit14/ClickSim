import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import { MEMENTOS, MEMENTO_IDS, eligibleMementoIds, newlyEligibleMementos } from '../src/content/mementos'
import { UNIVERSES, universeById, type UniverseId } from '../src/content/universes'
import { createDevScenario } from '../src/core/dev-scenarios'
import { migrateAndSanitizeSave, serializeSaveDataV23, type SaveDataV23 } from '../src/core/save-data'
import type { GameState } from '../src/engine/game.svelte'

function runtimeState(save: SaveDataV23): GameState {
  return { ...save, ...save.endgame } as unknown as GameState
}

test('every realm owns six authored Mementos plus five non-power legacy objects', () => {
  assert.equal(MEMENTOS.length, 47)
  assert.equal(MEMENTO_IDS.size, MEMENTOS.length)
  assert.equal(new Set(MEMENTOS.map((memento) => memento.name)).size, MEMENTOS.length)
  assert.ok(new Set(MEMENTOS.map((memento) => memento.motif)).size >= 15)

  const expectedMilestones = ['awakening', 'settlement', 'epoch', 'archive', 'deep', 'beacon']
  for (const universe of UNIVERSES) {
    const set = MEMENTOS.filter((memento) => memento.realm === universe.id)
    assert.equal(set.length, 6, universe.id)
    assert.deepEqual(set.map((memento) => memento.milestone), expectedMilestones)
    assert.ok(set.every((memento) => memento.story.length >= 70), universe.id)
    assert.ok(set.every((memento) => memento.provenance.length >= 30), universe.id)
  }
  assert.equal(MEMENTOS.filter((memento) => memento.realm === 'legacy').length, 5)
})

test('realm objects arrive throughout progression without leaking into other worlds', () => {
  const opening = createDevScenario('opening', 10_000)!
  const state = runtimeState(opening)
  assert.deepEqual(eligibleMementoIds(state), [])

  state.clicks = 1
  assert.deepEqual(eligibleMementoIds(state), ['memento-emberlight-awakening'])

  const sixth = universeById('emberlight').generators[5]
  state.owned[sixth.id] = 1
  assert.deepEqual(eligibleMementoIds(state), [
    'memento-emberlight-awakening',
    'memento-emberlight-settlement',
  ])

  state.supernovae = 1
  state.curiosities = universeById('emberlight').cabinet.items.slice(0, 4).map((item) => item.id)
  state.collapses = 1
  assert.deepEqual(eligibleMementoIds(state), [
    'memento-emberlight-awakening',
    'memento-emberlight-settlement',
    'memento-emberlight-epoch',
    'memento-emberlight-archive',
    'memento-emberlight-deep',
  ])
  assert.equal(eligibleMementoIds(state).some((id) => id.includes('tidefall')), false)
})

test('a later durable milestone safely backfills earlier collection spaces', () => {
  const state = runtimeState(createDevScenario('opening', 20_000)!)
  const universeIds = UNIVERSES.map((universe) => universe.id as UniverseId)
  state.beacons = [...universeIds]
  const eligible = eligibleMementoIds(state)

  for (const universeId of universeIds) {
    assert.equal(eligible.filter((id) => id.startsWith(`memento-${universeId}-`)).length, 6, universeId)
  }
  assert.ok(eligible.includes('memento-legacy-crossing'))
  assert.ok(eligible.includes('memento-legacy-sevenfold'))
  assert.equal(eligible.includes('memento-legacy-atlas'), false)

  state.mementos = eligible.slice(0, 3)
  assert.deepEqual(
    newlyEligibleMementos(state).map((memento) => memento.id),
    eligible.slice(3),
  )
})

test('Mementos round-trip safely and old saves default to an empty cabinet', () => {
  const scenario = createDevScenario('garden', 30_000)!
  const wire = serializeSaveDataV23(scenario)
  const validIds = ['memento-emberlight-awakening', 'memento-legacy-crossing']
  const clean = migrateAndSanitizeSave({
    ...wire,
    endgame: { ...wire.endgame, mementos: [...validIds, '../../forged', validIds[0]] },
  })
  assert.ok(clean)
  assert.deepEqual(clean.endgame.mementos, validIds)

  const oldEndgame = { ...wire.endgame } as Record<string, unknown>
  delete oldEndgame.mementos
  const old = migrateAndSanitizeSave({ ...wire, endgame: oldEndgame })
  assert.ok(old)
  assert.deepEqual(old.endgame.mementos, [])
})

test('the loka collection avoids turning sacred presences into inventory', () => {
  const lokaText = MEMENTOS
    .filter((memento) => ['brahmalok', 'vishnulok', 'kailash'].includes(memento.realm))
    .map((memento) => `${memento.name} ${memento.provenance} ${memento.story}`)
    .join(' ')
  assert.doesNotMatch(lokaText, /Saraswati|Lakshmi|Ananta|Shiva|Parvati|Ganga|Nandi/)
  assert.match(lokaText, /recorded, never claimed|never a piece taken|No line calls the summit a prize/)
})

test('the gallery is an accessible dashboard with keyboard and modal focus wiring', () => {
  const galleryPath = new URL('../src/ui/MementoGallery.svelte', import.meta.url)
  const artifactPath = new URL('../src/ui/MementoArtifact.svelte', import.meta.url)
  const gallery = readFileSync(galleryPath, 'utf8')
  const artifact = readFileSync(artifactPath, 'utf8')
  const app = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
  const shell = readFileSync(new URL('../src/app/shell-state.svelte.ts', import.meta.url), 'utf8')

  assert.deepEqual(compile(gallery, { filename: galleryPath.pathname, generate: 'client' }).warnings, [])
  assert.deepEqual(compile(artifact, { filename: artifactPath.pathname, generate: 'client' }).warnings, [])
  assert.match(gallery, /The Cabinet Between Worlds/)
  assert.match(gallery, /Collection only · grants no production · gates no story/)
  assert.match(gallery, /class="set-dashboard"/)
  assert.match(app, /aria-label="Memento gallery" aria-keyshortcuts="M"/)
  assert.match(app, /key === 'm' && mementosVisible/)
  assert.match(app, /closeModalPanel\('mementos'\)/)

  assert.match(shell, /\| 'mementos'/)
  assert.match(shell, /'mementos',/)
  assert.match(shell, /for \(const id of UTILITY_PANEL_IDS\) this\.panels\[id\] = false/)
})

test('Mementos stay outside achievement power and the production pipeline', () => {
  const compute = readFileSync(new URL('../src/engine/compute.ts', import.meta.url), 'utf8')
  const achievements = readFileSync(new URL('../src/content/achievements.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(compute, /mementos/i)
  assert.doesNotMatch(achievements, /memento-/)
  assert.ok(MEMENTOS.every((memento) => !('reward' in memento)))
})
