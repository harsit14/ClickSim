import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compile } from 'svelte/compiler'
import { migrateAndSanitizeSave } from '../src/core/save-data'
import { visitedUniverseIds } from '../src/content/vessel'
import type { GameState } from '../src/engine/game.svelte'

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8')

function channel(value: number): number {
  const normalized = value / 255
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  const value = Number.parseInt(hex.slice(1), 16)
  return 0.2126 * channel(value >> 16) + 0.7152 * channel((value >> 8) & 0xff) + 0.0722 * channel(value & 0xff)
}

function contrast(foreground: string, background: string): number {
  const lighter = Math.max(luminance(foreground), luminance(background))
  const darker = Math.min(luminance(foreground), luminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

test('durable visited-realm history excludes every unseen successor', () => {
  const state = migrateAndSanitizeSave({
    version: 12,
    activeUniverse: 'verdance',
    beacons: ['emberlight', 'tidefall'],
  }) as unknown as GameState
  assert.ok(state)

  assert.deepEqual(visitedUniverseIds(state), ['emberlight', 'tidefall', 'verdance'])
  assert.equal(visitedUniverseIds(state).includes('clockwork'), false)
  assert.equal(visitedUniverseIds(state).includes('brahmalok'), false)
  assert.equal(visitedUniverseIds(state).includes('vishnulok'), false)
  assert.equal(visitedUniverseIds(state).includes('kailash'), false)
})

test('Vessel, Chronicle, and Mementos render only known realm registries', () => {
  const relay = read('../src/ui/SuccessionRelayHome.svelte')
  const chronicle = read('../src/ui/EndgameHub.svelte')
  const mementos = read('../src/ui/MementoGallery.svelte')

  for (const [name, source] of [
    ['SuccessionRelayHome.svelte', relay],
    ['EndgameHub.svelte', chronicle],
    ['MementoGallery.svelte', mementos],
  ] as const) {
    assert.deepEqual(compile(source, { filename: name, generate: 'client' }).warnings, [])
  }

  assert.match(relay, /knownUniverses as universe/)
  assert.match(relay, /visibleRelays as relay/)
  assert.doesNotMatch(relay, /\{#each UNIVERSES as universe/)
  assert.doesNotMatch(relay, /\{#each SUCCESSION_RELAYS as relay/)

  assert.match(chronicle, /knownUniverses as universe/)
  assert.match(chronicle, /visibleChronicleEvents/)
  assert.doesNotMatch(chronicle, /seven worlds/)
  assert.doesNotMatch(chronicle, /\{#each UNIVERSES as universe/)

  assert.match(mementos, /knownUniverseIds\.has\(memento\.realm\)/)
  assert.match(mementos, /availableRealms as realm/)
  assert.doesNotMatch(mementos, /Seven realm cabinets/)
})

test('disabled buttons use one legible, visibly inactive global treatment', () => {
  const css = read('../src/app.css')
  assert.match(css, /button:disabled \{[\s\S]*opacity: 1 !important;/)
  assert.match(css, /color: var\(--disabled-text\) !important;/)
  assert.match(css, /background: var\(--disabled-surface\) !important;/)
  assert.match(css, /cursor: not-allowed !important;/)
  assert.ok(contrast('#cbc8d6', '#24232d') >= 4.5)
})
