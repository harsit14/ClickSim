import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'

const worldUrl = new URL('../src/ui/ManifestWorldLayer.svelte', import.meta.url)
const source = readFileSync(worldUrl, 'utf8')

test('Kailash quiet detail remains one ambient wind line, four shelter lamps, and sparse snow', () => {
  assert.deepEqual(compile(source, { filename: worldUrl.pathname, generate: 'client' }).warnings, [])
  assert.equal((source.match(/class="kailash-wind-line"/g) ?? []).length, 1)
  assert.match(source, /class="kailash-wind-line"[\s\S]*<path d="M8 74C128/)
  assert.match(source, /class="kailash-shelters"><i><\/i><i><\/i><i><\/i><i><\/i><\/div>/)
  const snowSource = source.match(/const KAILASH_SNOW = \[([\s\S]*?)\] as const/)?.[1] ?? ''
  assert.equal((snowSource.match(/\['\d+%', '\d+%', '[^']+'\]/g) ?? []).length, 14)
  assert.match(source, /\.kailash-shelters i::before/)
  assert.match(source, /\.kailash-snow i \{[^}]*animation:snow-drift/)
  assert.match(source, /\.motion-paused \.kailash-wind-line path \{ animation:none; \}/)
  assert.match(source, /\.motion-paused \.kailash-snow i,/)
  assert.doesNotMatch(source, /kailash-wind-line[^>]*onclick|kailash-snow[^>]*onclick|kailash-shelters[^>]*onclick/)
})
