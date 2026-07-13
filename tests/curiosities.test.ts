import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CABINET_RESONANCE_PER_ITEM,
  CURIOSITIES,
  CURIOSITY_SHELVES,
  EMBERLIGHT_CABINET,
  TIDEFALL_CABINET,
  completedCuriosityShelves,
  curiosityClickMult,
  curiosityProductionMult,
  curiosityShelfProgress,
  curiosityStarRateBonus,
} from '../src/content/curiosities'
import { UNIVERSES } from '../src/content/universes'

// Stable legacy ids deliberately preserve old saves while visible identities evolve.
const localSky = ['moth', 'chimes', 'hearthkeeper', 'glass-garden']
const signalSky = ['second-cursor', 'snail', 'aurora', 'door']
const deepSky = ['star-jar', 'metronome-heart', 'letter', 'orrery']

test('curiosity resonance counts only unique known finds', () => {
  assert.equal(curiosityProductionMult(['moth', 'moth', 'unknown']), 1.01)
  assert.equal(curiosityProductionMult(['moth', 'chimes', 'hearthkeeper']), 1.03)
})

test('every universe Cabinet grants the same meaningful independent resonance', () => {
  assert.equal(CABINET_RESONANCE_PER_ITEM, 0.01)
  for (const universe of UNIVERSES) {
    assert.equal(universe.cabinet.resonancePerItem, CABINET_RESONANCE_PER_ITEM, universe.id)
  }
})

test('Tidefall owns a distinct cabinet and reward profile without breaking slot saves', () => {
  assert.deepEqual(
    TIDEFALL_CABINET.items.map((item) => item.id),
    EMBERLIGHT_CABINET.items.map((item) => item.id),
  )
  const emberNames = new Set(EMBERLIGHT_CABINET.items.map((item) => item.name))
  assert.equal(TIDEFALL_CABINET.items.some((item) => emberNames.has(item.name)), false)
  assert.equal(TIDEFALL_CABINET.title, 'The Pelagic Archive')
  assert.equal(TIDEFALL_CABINET.fuelProductionMult, 1.08)
  assert.equal(TIDEFALL_CABINET.returnCycleSec, 3600)

  const surface = TIDEFALL_CABINET.shelves[0].ids
  const pelagic = TIDEFALL_CABINET.shelves[1].ids
  const abyss = TIDEFALL_CABINET.shelves[2].ids
  assert.equal(curiosityStarRateBonus(surface, TIDEFALL_CABINET), 0.15)
  assert.ok(Math.abs(curiosityProductionMult([...surface, ...pelagic], TIDEFALL_CABINET) - 1.08 * 1.15) < 1e-12)
  assert.equal(curiosityClickMult(abyss, TIDEFALL_CABINET), 1.35)
})

test('the Local Sky capstone joins item resonance', () => {
  assert.ok(Math.abs(curiosityProductionMult(localSky) - 1.04 * 1.1) < 1e-12)
  assert.equal(completedCuriosityShelves(localSky), 1)
})

test('shelf rewards activate only when every slot is held', () => {
  assert.equal(curiosityClickMult(signalSky.slice(0, 3)), 1)
  assert.equal(curiosityClickMult(signalSky), 1.25)
  assert.equal(curiosityStarRateBonus(deepSky.slice(0, 3)), 0)
  assert.equal(curiosityStarRateBonus(deepSky), 0.1)
})

test('cabinet progress reports each four-part shelf independently', () => {
  const held = [...localSky, ...signalSky.slice(0, 2)]
  assert.deepEqual(CURIOSITY_SHELVES.map((shelf) => curiosityShelfProgress(held, shelf)), [4, 2, 0])
  assert.equal(completedCuriosityShelves(held), 1)
})

test('the celestial cabinet exposes twelve distinct astronomical records', () => {
  const names = CURIOSITIES.map((item) => item.name)
  assert.equal(CURIOSITIES.length, 12)
  assert.equal(new Set(names).size, 12)
  assert.deepEqual(names, [
    'White Dwarf',
    'Magnetar',
    'Protostar',
    'Emission Nebula',
    'Quasar',
    'Long-Period Comet',
    'Supernova Remnant',
    'Black Hole',
    'Neutron Star',
    'Pulsar',
    'Red Giant',
    'Supermassive Black Hole',
  ])
  for (const item of CURIOSITIES) {
    assert.ok(item.classification.length > 12)
    assert.ok(item.record.length > 60)
  }
})
