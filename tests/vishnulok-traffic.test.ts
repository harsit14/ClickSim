import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { planVishnulokTraffic, vishnulokTrafficForm } from '../src/render/vishnulok/traffic'

test('Vishnulok traffic changes form at the shared ownership thresholds', () => {
  assert.deepEqual([0, 1, 9, 10, 24, 25, 49, 50, 99, 100].map(vishnulokTrafficForm), [0, 1, 1, 2, 2, 3, 3, 4, 4, 5])
})

test('Vishnulok traffic stays within the ambient salience budget', () => {
  const high = planVishnulokTraffic(100, 100, 'high')
  const low = planVishnulokTraffic(100, 100, 'low')
  assert.equal(high.travellers.length, 5)
  assert.equal(low.travellers.length, 3)
  assert.deepEqual(new Set(high.travellers.map(({ route }) => route)), new Set([0, 1, 2]))
  assert.equal(planVishnulokTraffic(0, 0, 'high').travellers.length, 0)
})

test('Vishnulok traffic becomes a static authored arrangement under reduced motion', () => {
  const source = readFileSync(new URL('../src/ui/VishnulokTrafficLayer.svelte', import.meta.url), 'utf8')
  assert.match(source, /data-motion=\{reducedMotion \? 'static' : 'travelling'\}/)
  assert.match(source, /class:static=\{reducedMotion\}/)
  assert.match(source, /@keyframes traffic-circuit/)
})
