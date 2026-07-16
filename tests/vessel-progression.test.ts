import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import {
  VESSEL_BLUEPRINTS,
  VESSEL_PART_IDS,
  vesselComplete,
  vesselPartIdsFor,
  vesselRevealed,
  vesselRouteUnlocked,
  vesselRouteVisible,
} from '../src/content/vessel'
import {
  migrateAndSanitizeSave,
  migrateAndSanitizeSaveV22,
  serializeSaveDataV22,
} from '../src/core/save-data'
import { UNIVERSES } from '../src/content/universes'
import type { GameState } from '../src/engine/game.svelte'

const COMPLETE_PARTS = [...VESSEL_PART_IDS]

test('all seven universes own a distinct five-part crossing vessel', () => {
  assert.equal(VESSEL_BLUEPRINTS.length, 7)
  assert.equal(new Set(VESSEL_BLUEPRINTS.map(({ name }) => name)).size, 7)
  assert.equal(new Set(VESSEL_BLUEPRINTS.map(({ motif }) => motif)).size, 7)
  assert.equal(new Set(VESSEL_BLUEPRINTS.map(({ parts }) => parts.map(({ requirement }) => requirement).join('|'))).size, 7)

  for (const blueprint of VESSEL_BLUEPRINTS) {
    assert.deepEqual(blueprint.parts.map(({ id }) => id), VESSEL_PART_IDS)
    assert.equal(blueprint.stages.length, 6)
    assert.ok(blueprint.parts.every(({ name, requirement, action, glyph }) => name && requirement && action && glyph))
  }
})

test('every realm can surface The Question from its own final Kindling after a Deep Collapse', () => {
  for (const universe of UNIVERSES) {
    const hooks = universe.lumen.filter(({ unlocksQuestion }) => unlocksQuestion)
    assert.equal(hooks.length, 1, `${universe.id} must own exactly one Question hook`)
    const hook = hooks[0]
    const generatorId = universe.beacon.generatorId
    const state = { collapses: 0, owned: {} } as unknown as GameState

    assert.equal(hook.when(state), false, `${universe.id} opened before its final Kindling`)
    state.owned[generatorId] = universe.beacon.count
    assert.equal(hook.when(state), false, `${universe.id} opened before a Deep Collapse`)
    state.collapses = 1
    assert.equal(hook.when(state), true, `${universe.id} could not open The Question`)
    assert.match(hook.text, /ask me the question/i)
  }
})

test('the Vessel panel compiles cleanly with local motifs and an explicit crossing gate', () => {
  const panelPath = new URL('../src/ui/VesselPanel.svelte', import.meta.url)
  const source = readFileSync(panelPath, 'utf8')
  const app = readFileSync(new URL('../src/App.svelte', import.meta.url), 'utf8')
  const compiled = compile(source, { filename: panelPath.pathname, generate: 'client' })

  assert.deepEqual(compiled.warnings, [])
  assert.match(source, /data-motif=\{activeBlueprint\.motif\}/)
  assert.match(source, /Complete \{activeBlueprint\.name\} before entering an unseen realm from \{activePack\.shortName\}/)
  assert.match(source, /visibleRoutes as universe/)
  assert.match(app, /firstArrival: !universeVisited\(universeId\)/)
  for (const motif of VESSEL_BLUEPRINTS.map(({ motif }) => motif)) {
    assert.match(source, new RegExp(`data-motif='${motif}'`))
  }
})

test('a completed Emberlight Vessel does not activate Tidefall routes or its Beacon', () => {
  const state = migrateAndSanitizeSave({
    version: 12,
    activeUniverse: 'tidefall',
    vesselParts: COMPLETE_PARTS,
    beacons: ['emberlight'],
  }) as unknown as GameState
  assert.ok(state)

  assert.equal(vesselComplete(state), false)
  assert.deepEqual(vesselPartIdsFor(state), [])

  state.vesselPartsByUniverse.tidefall = [...COMPLETE_PARTS]
  assert.equal(vesselComplete(state), true)

  const engine = readFileSync(new URL('../src/engine/game.svelte.ts', import.meta.url), 'utf8')
  assert.match(engine, /igniteCurrentBeacon\(\)[\s\S]*?computeVesselComplete\(game, game\.activeUniverse\)/)
  assert.match(engine, /universeRouteUnlocked\(id: string\)[\s\S]*?computeVesselRouteUnlocked\(game, id\)/)
})

test('previously reached universes stay available before the local Vessel is built', () => {
  const state = migrateAndSanitizeSave({
    version: 12,
    activeUniverse: 'tidefall',
    beacons: ['emberlight'],
  }) as unknown as GameState
  assert.ok(state)

  state.vesselPartsByUniverse.tidefall = []
  assert.equal(vesselRevealed(state), true)
  assert.equal(vesselRouteVisible(state, 'emberlight'), true)
  assert.equal(vesselRouteUnlocked(state, 'emberlight'), true)
  assert.equal(vesselRouteVisible(state, 'verdance'), false)
  assert.equal(vesselRouteUnlocked(state, 'verdance'), false)
})

test('an unseen route stays private until the active Beacon is lit', () => {
  const state = migrateAndSanitizeSave({
    version: 12,
    activeUniverse: 'tidefall',
    beacons: ['emberlight'],
  }) as unknown as GameState
  assert.ok(state)

  state.vesselPartsByUniverse.tidefall = [...COMPLETE_PARTS]
  assert.equal(vesselRouteVisible(state, 'verdance'), false)
  assert.equal(vesselRouteUnlocked(state, 'verdance'), false)

  state.beacons.push('tidefall')
  assert.equal(vesselRouteVisible(state, 'verdance'), true)
  assert.equal(vesselRouteUnlocked(state, 'verdance'), true)
  assert.equal(vesselRouteVisible(state, 'clockwork'), false)
  assert.equal(vesselRouteUnlocked(state, 'clockwork'), false)
})

test('an unfinished visited realm remains reachable after returning to an older realm', () => {
  const state = migrateAndSanitizeSave({
    version: 12,
    activeUniverse: 'tidefall',
    beacons: ['emberlight'],
  }) as unknown as GameState
  assert.ok(state)

  state.universeRuns.tidefall = {} as GameState['universeRuns'][string]
  state.activeUniverse = 'emberlight'
  state.vesselPartsByUniverse.emberlight = []

  assert.equal(vesselRouteVisible(state, 'tidefall'), true)
  assert.equal(vesselRouteUnlocked(state, 'tidefall'), true)
})

test('historical global Vessels migrate only to completed worlds, not the current unlit universe', () => {
  const v22 = migrateAndSanitizeSaveV22({
    version: 12,
    activeUniverse: 'tidefall',
    vesselParts: COMPLETE_PARTS,
    beacons: ['emberlight'],
  })
  assert.ok(v22)
  const migrated = migrateAndSanitizeSave(serializeSaveDataV22(v22))

  assert.ok(migrated)
  assert.equal(migrated.version, 23)
  assert.deepEqual(migrated.vesselPartsByUniverse.emberlight, COMPLETE_PARTS)
  assert.equal(migrated.vesselPartsByUniverse.tidefall, undefined)
})
