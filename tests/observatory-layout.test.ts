import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compile } from 'svelte/compiler'
import { CONSTELLATION } from '../src/content/constellation'

const observatoryPath = new URL('../src/ui/Observatory.svelte', import.meta.url)
const observatorySource = readFileSync(observatoryPath, 'utf8')

test('Verdance Growth Rings and Tidefall Current Chart use a contained card map and compile accessibly', () => {
  const compiled = compile(observatorySource, {
    filename: observatoryPath.pathname,
    generate: 'client',
  })
  assert.deepEqual(compiled.warnings, [])
  assert.match(observatorySource, /\{#if verdance \|\| tidefall\}[\s\S]*class="growth-map"/)
  assert.match(observatorySource, /class:tide-chart=\{tidefall\}/)
  assert.match(observatorySource, /Four currents, one crown/)
  assert.match(observatorySource, /class="growth-node crown \{crownState\}"/)
  assert.match(observatorySource, /class="growth-node \{state\}"/)
})

test('the four contained paths and capstone cover every persistent node exactly once', () => {
  const branches = ['forge', 'hand', 'sky', 'root'] as const
  for (const branch of branches) {
    assert.equal(CONSTELLATION.filter((node) => node.branch === branch).length, 3)
  }
  assert.equal(CONSTELLATION.filter((node) => node.branch === 'crown').length, 1)
  assert.equal(new Set(CONSTELLATION.map(({ id }) => id)).size, 13)
})
