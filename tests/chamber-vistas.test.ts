import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'
import { amountFromNumber } from '../src/core/numeric/amount'
import { planChamberVista } from '../src/render/chamber-vistas'

const ids = (prefix: string) => Array.from({ length: 18 }, (_, index) => `${prefix}-kindling-${String(index + 1).padStart(2, '0')}`)
const owned = (prefix: string, count = 18) => Object.fromEntries(ids(prefix).slice(0, count).map((id) => [id, 10]))

test('Verdance canopy dawn requires an ancient cohort and reports the grafted form', () => {
  const generatorIds = ids('verdance')
  assert.equal(planChamberVista({ universeId: 'verdance', generatorIds, owned: owned('verdance'), numericLawState: {} }), null)
  const vista = planChamberVista({
    universeId: 'verdance',
    generatorIds,
    owned: owned('verdance'),
    numericLawState: {
      'verdance-kindling-01-cohort-quantity': amountFromNumber(10),
      'verdance-kindling-01-cohort-age': amountFromNumber(8 * 60 * 60_000),
      'verdance-graft-rootstock': amountFromNumber(0),
      'verdance-graft-scion': amountFromNumber(8),
      'verdance-graft-active': amountFromNumber(1),
    },
  })
  assert.equal(vista?.id, 'canopy-dawn')
  assert.match(vista?.label ?? '', /active graft/)
})

test('Brahmalok unfolds its vista only from four active directions under Mandala', () => {
  const generatorIds = ids('brahmalok')
  const routes = Object.fromEntries(Array.from({ length: 18 }, (_, index) => [
    `brahmalok-route-${String(index + 1).padStart(2, '0')}`,
    amountFromNumber(index % 4),
  ]))
  const vista = planChamberVista({
    universeId: 'brahmalok', generatorIds, owned: owned('brahmalok'),
    numericLawState: { ...routes, 'brahmalok-mode': amountFromNumber(1) },
  })
  assert.equal(vista?.id, 'lotus-unfolding')
  assert.match(vista?.label ?? '', /seed, measure, name, and form/)
  assert.equal(planChamberVista({
    universeId: 'brahmalok', generatorIds, owned: owned('brahmalok', 3),
    numericLawState: { ...routes, 'brahmalok-mode': amountFromNumber(1) },
  }), null)
})

test('Vishnulok vista persists only while a completed correction returns', () => {
  const generatorIds = ids('vishnulok')
  assert.equal(planChamberVista({ universeId: 'vishnulok', generatorIds, owned: owned('vishnulok'), numericLawState: {} }), null)
  const vista = planChamberVista({
    universeId: 'vishnulok', generatorIds, owned: owned('vishnulok'),
    numericLawState: {
      'vishnulok-circuit': amountFromNumber(1),
      'vishnulok-shelter-count': amountFromNumber(8),
      'vishnulok-burden': amountFromNumber(2),
      'vishnulok-return-seconds': amountFromNumber(20),
    },
  })
  assert.equal(vista?.id, 'circuit-return')
  assert.match(vista?.label ?? '', /8 shelters/)
})

test('Kailash open summit needs the Ring of Return, every act, and deliberate rests', () => {
  const generatorIds = ids('kailash')
  const vista = planChamberVista({
    universeId: 'kailash', generatorIds, owned: owned('kailash', 17),
    numericLawState: { 'kailash-cycle': amountFromNumber(3) }, nowMs: 0,
  })
  assert.equal(vista?.id, 'open-summit-ring')
  assert.match(vista?.label ?? '', /all five acts and \d+ deliberate rests/)
  assert.equal(planChamberVista({
    universeId: 'kailash', generatorIds, owned: owned('kailash', 16),
    numericLawState: { 'kailash-cycle': amountFromNumber(3) }, nowMs: 0,
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
  assert.doesNotMatch(source, /unfolding-center|return-home|summit-river/)
  assert.deepEqual(compile(source, { filename: url.pathname, generate: 'client' }).warnings, [])
})
