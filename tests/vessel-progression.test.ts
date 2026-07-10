import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import {
  VESSEL_BLUEPRINTS,
  VESSEL_PART_IDS,
  vesselComplete,
  vesselPartIdsFor,
} from '../src/content/vessel'
import {
  migrateAndSanitizeSave,
  migrateAndSanitizeSaveV22,
  serializeSaveDataV22,
} from '../src/core/save-data'
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

test('the Vessel panel compiles cleanly with local motifs and an explicit crossing gate', () => {
  const panelPath = new URL('../src/ui/VesselPanel.svelte', import.meta.url)
  const source = readFileSync(panelPath, 'utf8')
  const compiled = compile(source, { filename: panelPath.pathname, generate: 'client' })

  assert.deepEqual(compiled.warnings, [])
  assert.match(source, /data-motif=\{activeBlueprint\.motif\}/)
  assert.match(source, /Complete \{activeBlueprint\.name\} before leaving \{activePack\.shortName\}/)
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
  assert.match(engine, /universeRouteUnlocked\(id: string\)[\s\S]*?computeVesselComplete\(game, game\.activeUniverse\)/)
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
