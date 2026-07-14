import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('Cabinet and Legacy use the shared modal focus contract', () => {
  const cabinet = read('../src/ui/CuriosityCabinet.svelte')
  const endgame = read('../src/ui/EndgameHub.svelte')
  const app = read('../src/App.svelte')

  for (const [filename, source] of [['CuriosityCabinet.svelte', cabinet], ['EndgameHub.svelte', endgame]] as const) {
    assert.match(source, /containModalKeydown/)
    assert.match(source, /aria-modal="true"/)
    assert.match(source, /tabindex="-1"/)
    assert.deepEqual(compile(source, { filename, generate: 'client' }).warnings, [])
  }
  assert.match(app, /modalActive = \$derived\([\s\S]*shell\.panels\.curiosities[\s\S]*shell\.panels\.endgame/)
})
