import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'
import { amountFromNumber } from '../src/core/numeric/amount'
import { planChamberVista } from '../src/render/chamber-vistas'

const ids = (prefix: string) => Array.from({ length: 18 }, (_, index) => `${prefix}-kindling-${String(index + 1).padStart(2, '0')}`)
const owned = (prefix: string, count = 18) => Object.fromEntries(ids(prefix).slice(0, count).map((id) => [id, 10]))

test('Verdance canopy dawn requires an ancient cohort and reports the grafted form', () => {
  const generatorIds = ids('u3')
  assert.equal(planChamberVista({ universeId: 'verdance', generatorIds, owned: owned('u3'), numericLawState: {} }), null)
  const vista = planChamberVista({
    universeId: 'verdance',
    generatorIds,
    owned: owned('u3'),
    numericLawState: {
      'u3-kindling-01-cohort-quantity': amountFromNumber(10),
      'u3-kindling-01-cohort-age': amountFromNumber(8 * 60 * 60_000),
      'u3-graft-rootstock': amountFromNumber(0),
      'u3-graft-scion': amountFromNumber(8),
      'u3-graft-active': amountFromNumber(1),
    },
  })
  assert.equal(vista?.id, 'canopy-dawn')
  assert.match(vista?.label ?? '', /active graft/)
})

test('Prismata resolves white only from six labeled bands under synthesis', () => {
  const generatorIds = ids('u5')
  const routes = Object.fromEntries(Array.from({ length: 18 }, (_, index) => [
    `u5-route-${String(index + 1).padStart(2, '0')}`,
    amountFromNumber(Math.floor(index / 3)),
  ]))
  const vista = planChamberVista({
    universeId: 'prismata', generatorIds, owned: owned('u5'),
    numericLawState: { ...routes, 'u5-recipe': amountFromNumber(1) },
  })
  assert.equal(vista?.id, 'white-synthesis')
  assert.match(vista?.label ?? '', /all six labeled wavelength families/)
  assert.equal(planChamberVista({
    universeId: 'prismata', generatorIds, owned: owned('u5', 15),
    numericLawState: { ...routes, 'u5-recipe': amountFromNumber(1) },
  }), null)
})

test('Tempest vista persists only while a completed discharge propagates', () => {
  const generatorIds = ids('u6')
  assert.equal(planChamberVista({ universeId: 'tempest', generatorIds, owned: owned('u6'), numericLawState: {} }), null)
  const vista = planChamberVista({
    universeId: 'tempest', generatorIds, owned: owned('u6'),
    numericLawState: {
      'u6-path': amountFromNumber(1),
      'u6-path-length': amountFromNumber(8),
      'u6-path-risk': amountFromNumber(2),
      'u6-boost-seconds': amountFromNumber(20),
    },
  })
  assert.equal(vista?.id, 'full-discharge')
  assert.match(vista?.label ?? '', /8 storm cells/)
})

test('Canticle cathedral needs the named Kindling, every role, and deliberate rests', () => {
  const generatorIds = ids('u7')
  const vista = planChamberVista({
    universeId: 'canticle', generatorIds, owned: owned('u7', 13),
    numericLawState: { 'u7-measure': amountFromNumber(3) }, nowMs: 0,
  })
  assert.equal(vista?.id, 'standing-wave-cathedral')
  assert.match(vista?.label ?? '', /six roles and \d+ deliberate rests/)
  assert.equal(planChamberVista({
    universeId: 'canticle', generatorIds, owned: owned('u7', 12),
    numericLawState: { 'u7-measure': amountFromNumber(3) }, nowMs: 0,
  }), null)
})

test('the vista layer compiles and carries motion, quality, and accessible-state contracts', () => {
  const url = new URL('../src/ui/ChamberVistaLayer.svelte', import.meta.url)
  const source = readFileSync(url, 'utf8')
  assert.match(source, /data-chamber-vista=\{vista\.id\}/)
  assert.match(source, /data-vista-quality=\{quality\}/)
  assert.match(source, /role="img"/)
  assert.match(source, /aria-label=\{vista\.label\}/)
  assert.match(source, /class:motion-paused=\{reducedMotion\}/)
  assert.deepEqual(compile(source, { filename: url.pathname, generate: 'client' }).warnings, [])
})
