import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CURIOSITIES,
  CURIOSITY_SHELVES,
  completedCuriosityShelves,
  curiosityClickMult,
  curiosityProductionMult,
  curiosityShelfProgress,
  curiosityStarRateBonus,
} from '../src/content/curiosities'

// Stable legacy ids deliberately preserve old saves while visible identities evolve.
const localSky = ['moth', 'chimes', 'hearthkeeper', 'glass-garden']
const signalSky = ['second-cursor', 'snail', 'aurora', 'door']
const deepSky = ['star-jar', 'metronome-heart', 'letter', 'orrery']

test('curiosity resonance counts only unique known finds', () => {
  assert.equal(curiosityProductionMult(['moth', 'moth', 'unknown']), 1.01)
  assert.equal(curiosityProductionMult(['moth', 'chimes', 'hearthkeeper']), 1.03)
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
