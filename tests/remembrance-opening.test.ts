import assert from 'node:assert/strict'
import test from 'node:test'
import { LUMEN_LINES } from '../src/content/lumen'
import { createDevScenario } from '../src/core/dev-scenarios'
import type { GameState } from '../src/engine/game.svelte'

const line = (id: string) => LUMEN_LINES.find((candidate) => candidate.id === id)!

test('opening interface narration distinguishes first light from Remembrance', () => {
  const game = createDevScenario('opening', 10_000) as GameState
  game.ui = ['counter', 'shop', 'options', 'bulk']
  game.remembrances = 0
  for (const id of ['counter', 'shop', 'options', 'bulk']) {
    assert.equal(line(id).when(game), true, `${id} first-run line did not fire`)
    assert.equal(line(`rem-${id}`).when(game), false, `${id} Remembrance line fired on a first run`)
  }

  game.remembrances = 1
  for (const id of ['counter', 'shop', 'options', 'bulk']) {
    assert.equal(line(id).when(game), false, `${id} first-run line repeated in Remembrance`)
    assert.equal(line(`rem-${id}`).when(game), true, `${id} Remembrance line did not fire`)
  }
})
