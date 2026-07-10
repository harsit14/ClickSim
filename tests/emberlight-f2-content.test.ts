import assert from 'node:assert/strict'
import test from 'node:test'
import { EMBERLIGHT_CABINET } from '../src/content/curiosities'
import { EMBERLIGHT_V2 } from '../src/content/universes/emberlight-v2'
import { EMBERLIGHT } from '../src/content/universes/emberlight'
import { EMBERLIGHT_ASTRAL_CABINET } from '../src/content/universes/emberlight/archive'
import { EMBERLIGHT_DOCTRINE_VISUALS } from '../src/render/emberlight/doctrines'

const EXPECTED_ARCHIVE_NAMES = [
  'White Dwarf',
  'Magnetar',
  'Protostellar Nursery',
  'Rogue Planet',
  'Aurora World',
  'Quasar',
  'Red Giant',
  'Black Hole',
  'Supermassive Black Hole',
  'Cosmic Microwave Fragment',
  'Gravitational-Wave Knot',
  'Orrery of the Local Sky',
].sort()

test('Astral Cabinet uses the frozen twelve records without changing stable slots or mechanics', () => {
  assert.equal(EMBERLIGHT.cabinet, EMBERLIGHT_ASTRAL_CABINET)
  assert.equal(EMBERLIGHT_ASTRAL_CABINET.title, 'Astral Cabinet')
  assert.deepEqual(
    EMBERLIGHT_ASTRAL_CABINET.items.map(({ name }) => name).sort(),
    EXPECTED_ARCHIVE_NAMES,
  )
  assert.deepEqual(
    EMBERLIGHT_ASTRAL_CABINET.items.map(({ id }) => id),
    EMBERLIGHT_CABINET.items.map(({ id }) => id),
  )
  for (const item of EMBERLIGHT_ASTRAL_CABINET.items) {
    const legacy = EMBERLIGHT_CABINET.itemById.get(item.id)!
    assert.equal(item.cost, legacy.cost, item.id)
    assert.equal(item.kind, legacy.kind, item.id)
  }
})

test('all twelve V2 Archive records bind observation, implication, effect, lore, and object', () => {
  assert.equal(EMBERLIGHT_V2.archive.localName, 'Astral Cabinet')
  assert.equal(EMBERLIGHT_V2.archive.records.length, 12)
  assert.deepEqual(EMBERLIGHT_V2.archive.records.map(({ name }) => name).sort(), EXPECTED_ARCHIVE_NAMES)
  for (const record of EMBERLIGHT_V2.archive.records) {
    assert.equal(record.id, record.object.sourceId)
    assert.equal(record.object.sourceKind, 'archive')
    assert.equal(record.object.loreRecord, record.id)
    assert.ok(record.observation.length >= 35, record.id)
    assert.ok(record.implication.length >= 80, record.id)
    assert.ok(record.effectDescription.length >= 25, record.id)
    assert.match(record.object.phenomenon, new RegExp(record.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
  }
})

test('four Emberlight Omens have distinct movement, sound, semantics, and bounded rewards', () => {
  assert.deepEqual(EMBERLIGHT_V2.omens.map(({ id }) => id), [
    'falling-star', 'pulsar-sweep', 'comet-return', 'microlensing-event',
  ])
  assert.equal(new Set(EMBERLIGHT_V2.omens.map(({ object }) => object.motion.description)).size, 4)
  assert.equal(new Set(EMBERLIGHT_V2.omens.map(({ object }) => object.audioCue)).size, 4)
  for (const omen of EMBERLIGHT_V2.omens) {
    assert.match(omen.accessibilityLabel, /shape|numbered|route|text|caption/i)
    assert.ok(omen.rewards.every(({ exclusivePermanentPower }) => exclusivePermanentPower === false))
    assert.equal(omen.object.sourceId, omen.id)
  }
})

test('four doctrine signatures are unique, material, high-contrast, and reduced-motion complete', () => {
  const visuals = Object.values(EMBERLIGHT_DOCTRINE_VISUALS)
  assert.equal(visuals.length, 4)
  assert.equal(new Set(visuals.map(({ visualSignature }) => visualSignature)).size, 4)
  assert.deepEqual(
    EMBERLIGHT_V2.economy.doctrines.map(({ visualSignature }) => visualSignature),
    visuals.map(({ visualSignature }) => visualSignature),
  )
  for (const visual of visuals) {
    assert.ok(visual.geometryLabel.split(/\s+/).length >= 5)
    assert.ok(visual.pattern.trim())
    assert.ok(visual.materials.length >= 2)
    assert.ok(visual.highContrastTreatment.trim())
    assert.ok(visual.reducedMotionTreatment.trim())
  }
})
