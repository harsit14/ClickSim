import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('world state has a dedicated boundary behind the compatibility facade', () => {
  const state = read('../src/engine/state/game-state.svelte.ts')
  const facade = read('../src/engine/game.svelte.ts')

  assert.match(state, /export const game: GameState = \$state/)
  assert.match(facade, /from '\.\/state\/game-state\.svelte'/)
  assert.match(facade, /export \{ game \}/)
  assert.doesNotMatch(facade, /export const game: GameState = \$state/)
})

test('App delegates mutually exclusive panel and viewport state to the shell boundary', () => {
  const shell = read('../src/app/shell-state.svelte.ts')
  const app = read('../src/App.svelte')

  assert.match(shell, /class ShellState/)
  assert.match(shell, /closeUtilityPanels\(\)/)
  assert.match(shell, /resize\(viewportWidth:/)
  assert.match(app, /createShellState\(window\.innerWidth, MOBILE_BREAKPOINT\)/)
  assert.match(app, /shell\.closeUtilityPanels\(\)/)
  assert.match(app, /shell\.resize\(window\.innerWidth, MOBILE_BREAKPOINT\)/)
})
